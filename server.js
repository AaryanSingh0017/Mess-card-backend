if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sequelize = require('./database/connection')
const passport = require('passport')
const initializePassport = require('./passport_config');
const flash = require('express-flash');
const session = require('express-session');
const StudentLogin = require('./models/StudentLogin');
const bcrypt = require('bcrypt')
const Student = require('./models/Student')
const Fee = require('./models/Fee')

initializePassport(
  passport,
  async (USN) => {
    try {
      const user = await StudentLogin.findOne({ where: { USN } });
      return user;
    } catch (err) {
      console.error('Error fetching user:', err);
      //throw new Error('Internal server error');
    }
  }
)
const checkAPIKey = (req, res, next) => {
  const apiKey = req.headers.authorization;
  if (req.url !== '/' && (!apiKey || apiKey !== process.env.API_KEY)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}
const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.status(401).json({ message: 'You must login first' })
}
app.set('view engine', 'ejs')
app.use(bodyParser.json());
app.use(checkAPIKey);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

sequelize.sync({ force: false }).then(() => {
  console.log('Database and tables synced');
});

app.get('/', (req, res) => {
  res.render('docs')
})

app.post('/student/register', async (req, res) => {
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
      res.status(201).send({ message: 'User registered successfully!', data: newUser });
    })
  } catch (err) {
    console.error('Error creating new user:', err);
    res.status(500).send({ message: 'Internal server error.' });
  }
})

app.post('/student/login', async (req, res) => {
  const { USN, password } = req.body;
  if (!USN || !password) {
    return res.status(400).send({ message: 'Missing required fields: USN and password.' });
  }

  try {
    const user = await StudentLogin.findOne({ where: { USN } });
    if (!user) {
      return res.status(401).send({ message: 'Invalid USN.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid password.' });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('Error logging in user:', err);
        return res.status(500).send({ message: 'Internal server error.' });
      }

      res.status(200).json({ message: 'Login successful!' });
    });
  } catch (err) {
    console.error('Error logging in user:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
})

app.post('/student/logout', checkAuthenticated, (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).send({ message: 'Internal server error.' })
    }
    return res.status(200).send({ message: 'User successfully logged out' })
  })
})

app.get('/student/is-logged-in', (req, res) => {
  return res.status(200).json({ result: req.isAuthenticated() })
})

app.post('/student/form', checkAuthenticated, async (req, res) => {
  try {
    const nullFields = [];
    for (const field of ['Name', 'Department', 'Semester', 'Address',
      'PhoneNo', 'EmailId', 'CGPA', 'RoomNo', 'HostelId']) {
      if (!req.body[field]) {
        nullFields.push(field);
      }
    }

    if (nullFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${nullFields.join(', ')}`,
      });
    }

    const newStudent = await Student.create({
      USN: req.session.passport.user,
      Name: req.body.Name,
      Department: req.body.Department,
      Semester: req.body.Semester,
      Address: req.body.Address,
      PhoneNo: req.body.PhoneNo,
      EmailId: req.body.EmailId,
      CGPA: req.body.CGPA,
      RoomNo: req.body.RoomNo,
      HostelId: req.body.HostelId,
    });

    res.status(201).send(newStudent);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/student/fee', checkAuthenticated, async (req, res) => {
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
    console.log(e)
    res.status(500).json({ message: 'Error inserting Fee.' })
  }
})

function formatDate(date) {
  const year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Leading zero for single-digit months
  let day = date.getDate().toString().padStart(2, '0'); // Leading zero for single-digit days

  return `${year}-${month}-${day}`;
}

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`))