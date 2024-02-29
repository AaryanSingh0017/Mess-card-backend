const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Student = sequelize.define('Student', {
  USN: {
    type: DataTypes.STRING(10),
    primaryKey: true,
  },
  Name: {
    type: DataTypes.STRING(30),
  },
  Department: {
    type: DataTypes.STRING(3),
  },
  Semester: {
    type: DataTypes.INTEGER,
  },
  Address: {
    type: DataTypes.STRING(50),
  },
  PhoneNo: {
    type: DataTypes.STRING(10),
  },
  EmailId: {
    type: DataTypes.STRING(30),
  },
  CGPA: {
    type: DataTypes.REAL,
  },
  RoomNo: {
    type: DataTypes.STRING(4),
  },
  HostelId: {
    type: DataTypes.INTEGER,
  },
});

module.exports = Student;