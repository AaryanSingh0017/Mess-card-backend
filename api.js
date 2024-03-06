const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const Student = require('./models/Student')
const Fee = require('./models/Fee')
const StudentLogin = require('./models/StudentLogin')
const ejs = require('ejs')
const fs = require('fs')
const Picture = require('./models/Picture')
const Helper = require('./helpers/helpers')
const puppeteer = require('puppeteer')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage })
const Dapp = require('./dapp-interact')
const { createHash } = require('crypto')

const checkAPIKey = (req, res, next) => {
    const apiKey = req.headers.authorization;
    if (req.url !== '/' && (!apiKey || apiKey !== process.env.API_KEY)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}

router.use(checkAPIKey)

router.get('/', (req, res) => {
    res.render('docs')
})

router.post('/student/register', async (req, res) => {
    const { USN, password } = req.body;
    if (!USN || !password) {
        return res.status(400).send({ message: 'Missing required fields: USN and password.' });
    }

    try {
        const existingUser = await StudentLogin.findOne({ where: { USN } });
        if (existingUser) {
            return res.status(409).send({ message: 'USN already exists.' });
        }
    } catch (err) {
        console.error('Error checking for existing user:', err);
        return res.status(500).send({ message: 'Internal server error.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = await StudentLogin.create({ USN, password: hashedPassword });
        req.logIn(newUser, err => {
            if (err) res.status(500).send({ message: 'Internal server error.' })
            req.session.passport.type = 'student'
            res.status(201).send({ message: 'User registered successfully!', data: newUser });
        })
    } catch (err) {
        console.error('Error creating new user:', err);
        res.status(500).send({ message: 'Internal server error.' });
    }
})

router.post('/student/login', async (req, res) => {
    const { USN, password } = req.body;
    if (!USN || !password) {
        return res.status(400).send({ message: 'Missing required fields: USN and password.' });
    }

    try {
        const user = await StudentLogin.findByPk(USN.toString())
        if (!user) {
            return res.status(401).send({ message: 'Invalid USN.' });
        }

        const isMatch = await bcrypt.compare(password.toString(), user.password);
        if (!isMatch) {
            return res.status(401).send({ message: 'Invalid password.' });
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('Error logging in user:', err);
                return res.status(500).send({ message: 'Internal server error.' });
            }
            req.session.passport.type = 'student'
            res.status(200).json({ message: 'Login successful!' });
        });
    } catch (err) {
        console.error('Error logging in user:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
})

router.post('/student/logout', Helper.checkStudentAuthenticated, (req, res) => {
    if(req.session.passport.type !== 'student')
        return res.status(403).json({ message: 'User is not student'})
    req.logout(err => {
        if (err) {
            return res.status(500).send({ message: 'Internal server error.' })
        }
        return res.status(200).send({ message: 'User successfully logged out' })
    })
})

router.get('/student/is-logged-in', (req, res) => {
    return res.status(200).json({ result: req.isAuthenticated() })
})

const checkStdFormFilled = async (req, res, next) => {
    const student = await Student.findByPk(req.session.passport.user)
    if (!student) {
        return res.status(401).json({ message: 'Fill student detail form first.' })
    }
    next()
}

const checkFeeFormFilled = async (req, res, next) => {
    const fee = await Fee.findByPk(req.session.passport.user)
    if (!fee) {
        return res.status(401).json({ message: 'Fill fee detail form first.' })
    } else if(fee.Status === 'Pending') {
        return res.status(401).json({ message: 'Your Fee payment is yet to be verified. Please wait'})
    } else if(fee.Status === 'Rejected') {
        return res.status(401).json({ message: 'Your application is rejected. Please contact admin for further updates'})
    }
    next()
}

const checkImageUploaded = async (req, res, next) => {
    const image = await Picture.findByPk(req.session.passport.user)
    if (!image) {
        return res.status(401).json({ message: 'Upload profile picture to obtain mess card.' })
    }
    next()
}

router.post('/student/form', Helper.checkStudentAuthenticated, async (req, res) => {
    try {
        const nullFields = [];
        for (const field of ['Name', 'Department', 'Semester', 'Address',
            'PhoneNo', 'EmailId', 'DOB', 'BloodGrp', 'CGPA', 'RoomNo', 'HostelId']) {
            if (!req.body[field]) {
                nullFields.push(field);
            }
        }

        if (nullFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${nullFields.join(', ')}`,
            });
        }

        const existing = await Student.findByPk(req.session.passport.user)
        if(existing) {
            return res.status(409).json({
                message: 'You have already filled this form. Contact admin to edit'
            })
        }

        const data = {
            USN: req.session.passport.user,
            Name: req.body.Name,
            Department: req.body.Department,
            Semester: req.body.Semester,
            Address: req.body.Address,
            PhoneNo: req.body.PhoneNo,
            EmailId: req.body.EmailId,
            DOB: req.body.DOB,
            BloodGrp: req.body.BloodGrp,
            CGPA: req.body.CGPA,
            RoomNo: req.body.RoomNo,
            HostelId: req.body.HostelId,
        }
        const newStudent = await Student.create(data);
        const data_ = { USN: data.USN, Name: data.Name}
        const hash = createHash('sha256').update(JSON.stringify(data_)).digest('hex')
        const hashBuffer = Buffer.from(hash, 'hex')
        await Dapp.addMessCard(req.session.passport.user, hashBuffer)
        res.status(201).send(newStudent);
    } catch (error) {
        console.error(error);
        res.status(500).send({message: 'Internal Server Error'});
    }
});

router.post('/student/fee', Helper.checkStudentAuthenticated, checkStdFormFilled, async (req, res) => {
    try {
        const { UTR, TID } = req.body;
        if (!UTR || !TID) {
            return res.status(400).send({ message: 'Missing required fields: UTR and TID.' });
        }
        const newFee = await Fee.create({
            UTR: UTR,
            TID: TID,
            PaidDate: formatDate(new Date()),
            Status: 'Pending',
            USN: req.session.passport.user
        })
        res.status(201).json(newFee)
    } catch (e) {
        res.status(500).json({ message: 'Error inserting Fee.' })
    }
})

router.get('/student/get-messcard', Helper.checkStudentAuthenticated, checkStdFormFilled, checkImageUploaded, checkFeeFormFilled, async (req, res) => {
    try {
        const htmlContent = await generateMessCard(req);
        const browser = await puppeteer.launch({
            executablePath:
                process.env.NODE_ENV === 'production'
                    ? process.env.PUPPETEER_EXECUTABLE_PATH
                    : puppeteer.executablePath()
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent);

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px',
            },
        });

        await browser.close();

        res.contentType('application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating PDF');
    }
});

const checkImageNotUploaded = async (req, res, next) => {
    try {
        const img = await Picture.findByPk(req.session.passport.user)
        if(img)
            return res.status(403).json({ message: "Image already uploaded. Contact admin to edit"})
        next()
    } catch(e) {
        return res.status(500).json({ message: 'Internal server error'})
    }
}

router.post('/student/upload-image', Helper.checkStudentAuthenticated, checkStdFormFilled, checkImageNotUploaded, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Missing field: profilePicture' })
        }
        const imageBuffer = req.file.buffer
        const dataUrl = getImageDataUrl(req, imageBuffer)
        const img = await Picture.create({
            USN: req.session.passport.user,
            profilePicture: dataUrl
        })
        res.status(201).json({ message: 'Image uploaded successfully', data: img })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Error uploading image' })
    }
});

function formatDate(date) {
    const year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Leading zero for single-digit months
    let day = date.getDate().toString().padStart(2, '0'); // Leading zero for single-digit days

    return `${year}-${month}-${day}`;
}

function getImageDataUrl(req, imageBuffer) {
    const base64Data = Buffer.from(imageBuffer).toString('base64');
    const mimeType = req.file.mimetype;
    return `data:${mimeType};base64,${base64Data}`;
}

async function generateMessCard(req) {
    try {
        const templateString = await fs.promises.readFile('./views/card.ejs', 'utf-8');
        const student = await Student.findOne({ where: { USN: req.session.passport.user } })
        const img = await Picture.findOne({ where: { USN: req.session.passport.user } })
        const data = {
            name: student.Name,
            usn: student.USN,
            room_no: student.RoomNo,
            date_of_birth: formatDate(student.DOB),
            phone_no: student.PhoneNo,
            email: student.EmailId,
            blood_grp: student.BloodGrp,
            perm_addr: student.Address,
            img_src: img.profilePicture
        }
        const htmlContent = ejs.render(templateString, data);
        return htmlContent;
    } catch (error) {
        console.error('Error rendering template:', error);
        throw error;
    }
}

module.exports = router