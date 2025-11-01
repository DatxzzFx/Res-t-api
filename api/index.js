const express = require('express');
const axios   = require('axios');
const crypto  = require('crypto');

const app = express();
app.use(express.json({ limit: '10kb' }));

const RL = new Map();
const isRL = ip => {
  const t = RL.get(ip) || 0;
  const ok = Date.now() - t > 5000;
  RL.set(ip, Date.now());
  return !ok;
};

app.post('*', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress;
  if (isRL(ip)) return res.status(429).json({ error: 'Too fast' });

  const { url } = req.body;
  if (!url || !url.startsWith('https://')) return res.status(400).json({ error: 'Bad URL' });

  try {
    const { data } = await axios.post(
      'https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink',
      { url },
      {
        headers: {
          'content-type': 'application/json',
          'x-rapidapi-host': 'auto-download-all-in-one.p.rapidapi.com',
          'x-rapidapi-key': '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98'
        },
        timeout: 10000
      }
    );

    const vid = (data.medias || []).find(m => /mp4|mov|webm/i.test(m.extension)) || data.medias?.[0];
    if (!vid?.url) return res.status(404).json({ error: 'Video not found' });

    const stream = await axios.get(vid.url, { responseType: 'stream' });
    const ext = vid.extension || 'mp4';
    const fileName = crypto.randomUUID() + '.' + ext;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    stream.data.pipe(res);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app;
