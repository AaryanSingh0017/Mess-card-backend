const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const StudentLogin = require('./models/StudentLogin')
const AdminLogin = require('./models/AdminLogin')

function initialize(passport, getUserByUSN, getUserByUsername) {
    const authenticateStudent = async (USN, password, done) => {
        const user = getUserByUSN(USN)
        if(user == null) {
            return done(null, false, {message: 'No Account with this usn'})
        }

        try {
            if( await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, {message: 'Incorrect password'})
            }
        } catch(e) {
            return done(e)
        }
    }
    const authenticateAdmin = async (username, password, done) => {
        const user = getUserByUsername(username)
        if(user == null) {
            return done(null, false, {message: 'No Account with this usn'})
        }

        try {
            if( await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, {message: 'Incorrect password'})
            }
        } catch(e) {
            return done(e)
        }
    }
    const serializeStudent = (student, done) => done(null, student.USN)
    const serializeAdmin = (admin, done) => done(null, admin.username)
    const deserializeStudent = (USN, done) => {
        return done(null, getUserByUSN(USN))
    }
    const deserializeAdmin = (username, done) => {
        return done(null, getUserByUsername(username))
    }
    passport.use('student', new LocalStrategy({usernameField: 'USN'}, authenticateStudent))
    passport.use('admin', new LocalStrategy({usernameField: 'username'}, authenticateAdmin))
    passport.serializeUser((user, done) => {
        if(user instanceof StudentLogin)
            done(null, user.USN)
        else 
            done(null, user.username)
    })
    passport.deserializeUser(async (USN, done) => {
        const user = await getUserByUSN(USN)
        if(user)
            done(null, user)
        else
            done('pass')
    })
    passport.deserializeUser((username, done) => done(null, getUserByUsername(username)))
}

module.exports = initialize