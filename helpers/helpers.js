const checkStudentAuthenticated = (req, res, next) => {
    if(req.isAuthenticated() && req.session.passport.type === 'student')
        return next()
    res.status(401).json({ message: 'You are not a Student'})
}

const checkAdminAuthenticated = (req, res, next) => {
    if(req.isAuthenticated() & req.session.passport.type === 'admin')
        return next()
    return res.status(401).json({ message: 'You are not an Admin'})
}

const isStudentLoggedIn = (req, res, next) => {
    if(req.isAuthenticated() && req.session.passport.type === 'student')
        return next()
    res.redirect('/')
}

const isAdminLoggedIn = (req, res, next) => {
    if(req.isAuthenticated() && req.session.passport.type === 'admin')
        return next()
    res.redirect('/')
}

const isStudentNotLoggedIn = (req, res, next) => {
    if(req.isAuthenticated() && req.session.passport.type === 'student')
        return res.redirect('/student/dashboard')
    next()
}

const isAdminNotLoggedIn = (req, res, next) => {
    if(req.isAuthenticated() && req.session.passport.type === 'admin')
        return res.redirect('/admin/dashboard')
    next()
}

module.exports = {
    checkStudentAuthenticated,
    checkAdminAuthenticated,
    isStudentLoggedIn,
    isAdminLoggedIn,
    isStudentNotLoggedIn,
    isAdminNotLoggedIn
}