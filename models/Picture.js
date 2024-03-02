const sequelize = require('../database/connection')
const {DataTypes} = require('sequelize')

const Picture = sequelize.define('Picture', {
    profilePicture: {
        type: DataTypes.BLOB,
        allowNull: true,
    },
    USN: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        references: {
            model: 'Students',
            key: 'USN'
        }
    }
})

module.exports = Picture