const express = require('express')
const Student = require('./models/Student')
const Fee = require('./models/Fee')
const router = express.Router()
const Helper = require('./helpers/helpers')

router.get('/table', (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('table', { apiKey })
})

router.get('', (req, res) => {
    res.render('index')
})

router.get('/about', (req, res) => {
    res.render('about')
})

router.get('/contact', (req, res) => {
    res.render('contact')
})

router.get('/student/login', Helper.isStudentNotLoggedIn, (req, res) => {
    if(req.isAuthenticated())
        res.redirect('/student/dashboard')
    const apiKey = process.env.API_KEY
    res.render('studentLogin', { apiKey })
})

router.get('/student/dashboard', Helper.isStudentLoggedIn, (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('studentDashboard', { apiKey })
})

router.get('/student/form', Helper.isStudentLoggedIn, (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('studentForm', {apiKey})
})

router.get('/student/fee', Helper.isStudentLoggedIn, (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('feeForm', {apiKey})
})

router.get('/student/upload-image', Helper.isStudentLoggedIn, (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('uploadImage', {apiKey})
})

router.get('/student/messcard', Helper.isStudentLoggedIn, (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('messCard', { apiKey })
})

router.get('/admin/login', Helper.isAdminNotLoggedIn, (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('cashierLogin', {apiKey})
})

router.get('/admin/student-report', Helper.isAdminLoggedIn, async (req, res) => {
    const stds = await Student.findAll()
    const fees = await Fee.findAll()
    const students = []
    fees.forEach(fee => {
        const match = stds.find(student => student.USN === fee.USN)
        match.TID = fee.TID
        match.UTR = fee.UTR
        match.status = fee.Status
        students.push(match)
    })
    const apiKey = process.env.API_KEY
    res.render('report', {students, apiKey})
})

router.get('/admin/dashboard', Helper.isAdminLoggedIn, async (req, res) => {
    const apiKey = process.env.API_KEY
    res.render('adminDashboard', { apiKey })
})

module.exports = router