const express = require('express')
const router = express.Router()

const isStudentLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())
        return next()
    res.redirect('/student/login')
}

router.get('', (req, res) => {
    res.render('index')
})

router.get('/about', (req, res) => {
    res.render('about')
})

router.get('/contact', (req, res) => {
    res.render('contact')
})

router.get('/rooms', (req, res) => {
    res.render('rooms')
})

router.get('/student/login', (req, res) => {
    if(req.isAuthenticated())
        res.redirect('/student/dashboard')
    const apiKey = process.env.API_KEY
    res.render('studentLogin', { apiKey })
})

router.get('/student/dashboard', isStudentLoggedIn, (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('studentDashboard', { apiKey })
})

router.get('/student/form', isStudentLoggedIn, (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('studentForm', {apiKey})
})

router.get('/student/fee', isStudentLoggedIn, (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('feeForm', {apiKey})
})

router.get('/admin/login', (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('cashierLogin', {apiKey})
})

const checkIsAdmin = (req, res, next) => {
    if(req.isAuthenticated() && req.session.passport.user === 'Admin')
        return next()
    res.redirect('/')
}

router.get('/admin/report', checkIsAdmin, (req, res) => {
    res.render('report')
})

module.exports = router