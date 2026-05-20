const axios = require('axios');

exports.event = async (req, res) => {
  try {
    const events = req.body;

    console.log('User Created', events);
    
    // Jangan lupa kirim respon balik ke event-bus bahwa event sukses diterima
    res.status(200).json({ message: 'Event received successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};