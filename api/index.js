// api/index.js
const axios = require('axios');

const RAPID_KEY = '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98'; // ganti jika perlu

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { url } = req.body;
  if (!url || !url.startsWith('https://')) {
    return res.status(400).json({ error: 'Valid HTTPS URL required' });
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
          'x-rapidapi-key': RAPID_KEY
        }
      }
    );

    /* 
    Contoh data yg sering dikembalikan:
    {
      "medias":[
        {
          "url": "https://video-arn2-2.xx.fbcdn.net/...",
          "quality": "720 HD",
          "extension": "mp4",
          "size": 1234567
        },
        ...
      ]
    }
    */
    return res.json(data);
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Unknown error';
    return res.status(500).json({ error: msg });
  }
};
