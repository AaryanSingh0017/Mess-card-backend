const mysql = require('mysql2');

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'vishwa',
//     password: '',
//     database: 'hosteldbs'
// });

const connection = mysql.createConnection({
    host: 'mysql-evstation-vvishwakarthik-a984.a.aivencloud.com',
    port: 21214,
    user: 'avnadmin',
    password: 'AVNS_CSSzoKscrh2CiZ6ReHh',
    database: 'hosteldbs',
});

connection.connect((err) => {
    if (err) console.log(err)
    else console.log('Connected to MySQL database!');
});

module.exports = connection