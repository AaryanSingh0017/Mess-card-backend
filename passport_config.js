const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByUSN) {
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
    passport.use(new LocalStrategy({usernameField: 'USN'}, authenticateStudent))
    passport.serializeUser((user, done) => done(null, user.USN))
    passport.deserializeUser((USN, done) => {
        return done(null, getUserByUSN(USN))
    })
}

module.exports = initialize