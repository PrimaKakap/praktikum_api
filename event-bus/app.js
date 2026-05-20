const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

// Endpoint tempat menerima event dari service manapun
app.post('/events', (req, res) => {
  const event = req.body;

  // // submit event to service (contoh: ke user-service atau product-service kamu)
  axios.post('http://localhost:3004/api/events', event).catch((err) => {
    console.log("Gagal broadcast ke port 3004:", err.message);
  });

  // // transaction (broadcast event ke transaction-service)
  axios.post('http://localhost:3004/api/events', event).catch((err) => {
    console.log("Gagal broadcast ke port 3004:", err.message);
  });

  console.log('event emitted');

  res.send('Event Submitted');
});

// Menjalankan Event Bus di port 4005
app.listen(4005, () => {
  console.log('run on port 4005');
});