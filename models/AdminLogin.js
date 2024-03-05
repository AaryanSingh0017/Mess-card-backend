const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const AdminLogin = sequelize.define('AdminLogin', {
    username: {
        type: DataTypes.STRING(10),
        primaryKey: true,
    },
    password: {
        type: DataTypes.STRING(60),
    },
});

module.exports = AdminLogin