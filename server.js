if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const uiRoutes = require('./uiRoutes')
const bodyParser = require('body-parser')
const sequelize = require('./database/connection')
const passport = require('passport')
const initializePassport = require('./passport_config');
const flash = require('express-flash');
const session = require('express-session');
const StudentLogin = require('./models/StudentLogin');
const apiRoutes = require('./api')

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

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.json());
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

app.use('/api', apiRoutes)
app.use('/', uiRoutes)


const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`))