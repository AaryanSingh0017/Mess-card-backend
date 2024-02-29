const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const StudentLogin = sequelize.define('StudentLogin', {
    USN: {
        type: DataTypes.STRING(10),
        primaryKey: true,
    },
    password: {
        type: DataTypes.STRING(60),
    },
});

// // Sync the model with the database (creates the table if it doesn't exist)
// StudentLogin.sync()
//     .then(() => console.log('StudentLogin table synced successfully'))
//     .catch((err) => console.error('Error syncing StudentLogin table:', err));

module.exports = StudentLogin
