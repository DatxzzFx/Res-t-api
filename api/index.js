const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('*', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith('https://')) {
    return res.status(400).json({ error: 'URL is required and must be HTTPS.' });
  }

  try {
    const { data } = await axios.post(
      'https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink',
      { url },
      {
        headers: {
          'accept-encoding': 'gzip',
          'cache-control': 'no-cache',
          'content-type': 'application/json; charset=utf-8',
          referer: 'https://auto-download-all-in-one.p.rapidapi.com/',
          'user-agent': 'Xihe/5.0',
          'x-rapidapi-host': 'auto-download-all-in-one.p.rapidapi.com',
          'x-rapidapi-key': '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98' // HARD-CODED
        }
      }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
