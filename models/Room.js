const {DataTypes} = require('sequelize')
const sequelize = require('../database/connection')

const Room = sequelize.define('Room', {
    RoomNo: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    HostelId: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
})

module.exports = Room