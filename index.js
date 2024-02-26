const connection = require('./config');
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.status(200).send("Docs for my node app")
})

// Endpoint to store student details in the Student table
app.post('/students', (req, res) => {
  const student = req.body;

  connection.query('INSERT INTO Student SET ?', student, (err, result) => {
    if (err) {
      console.error('Error inserting student:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    console.log('Student inserted successfully');
    res.status(200).json({ message: 'Student inserted successfully' });
  });
});

// Endpoint to store hostel fee transaction details in the Fees table
app.post('/fees', (req, res) => {
  const feeTransaction = req.body;

  connection.query('INSERT INTO Fees SET ?', feeTransaction, (err, result) => {
    if (err) {
      console.error('Error inserting fee transaction:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    console.log('Fee transaction inserted successfully');
    res.status(200).json({ message: 'Fee transaction inserted successfully' });
  });
});

// Endpoint to retrieve data from the Fees table
app.get('/fees', (req, res) => {
  connection.query('SELECT * FROM Fees', (err, results) => {
    if (err) {
      console.error('Error retrieving fees data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    console.log('Fees data retrieved successfully');
    res.status(200).json(results);
  });
});

const port = 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`))