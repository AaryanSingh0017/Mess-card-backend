if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mysql', // Choose your database dialect
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

module.exports = sequelize;