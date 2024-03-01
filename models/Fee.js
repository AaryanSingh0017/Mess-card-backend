const sequelize = require('../database/connection')
const {DataTypes} = require('sequelize')

const Fee = sequelize.define('Fee', {
  UTR: {
    type: DataTypes.STRING(22),
    allowNull: false,
    unique: true // Enforce uniqueness for UTR
  },
  TID: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  PaidDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Status: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  USN: {
    type: DataTypes.STRING(10),
    allowNull: false,
    primaryKey: true,
    references: { // Define foreign key relationship
      model: 'Students', // Reference the Student model
      key: 'USN',
    }
  }
});

module.exports = Fee;
