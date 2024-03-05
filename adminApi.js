const express = require('express')
const router = express.Router()
const Helper = require('./helpers/helpers')
const bcrypt = require('bcrypt')
const AdminLogin = require('./models/AdminLogin')
const Fee = require('./models/Fee')

const checkAPIKey = (req, res, next) => {
    const apiKey = req.headers.authorization;
    if ((!apiKey || apiKey !== process.env.API_KEY)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
}

router.use(checkAPIKey)

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ message: 'Missing fields: username and password' })
        }
        const admin = await AdminLogin.findByPk(username)
        if (! await bcrypt.compare(password, admin.password)) {
            return res.status(401).json({ message: 'Incorrect password' })
        }
        req.logIn(admin, (err) => {
            if (err) {
                console.error('Error logging in user:', err);
                return res.status(500).send({ message: 'Error logging in' });
            }
            req.session.passport.type = 'admin'
            res.status(200).json({ message: 'Login successful!' });
        });
    } catch (e) {
        return res.status(500).json({ message: 'Error logging in' })
    }
})

router.post('/logout', Helper.checkAdminAuthenticated, async (req, res) => {
    if (req.session.passport.type !== 'admin')
        return res.status(403).json({ message: 'User is not admin' })
    req.logout(err => {
        if (err) {
            return res.status(500).send({ message: 'Internal server error.' })
        }
        return res.status(200).send({ message: 'User successfully logged out' })
    })
})

router.post('/update-student/:USN', Helper.checkAdminAuthenticated, async (req, res) => {
    try {
        const { Status } = req.body
        var count = 0
        const fields = ['Pending', 'Rejected', 'Verified']
        fields.forEach(field => {
            if (Status === field) count++
        });
        if (count === 0)
            return res.status(403).json({ message: 'Invalid value for Status' })
        const student = await Fee.findByPk(req.params.USN)
        if (!student)
            return res.status(403).json({ message: 'Invalid value for USN' })
        await Fee.update(student, {
            where: {USN: req.params.USN}
        })
        return res.status(201).json({ message: 'Status updated successfully' })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: "Error updating student" })
    }
})

module.exports = router