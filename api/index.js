const axios = require('axios');
const RAPID_KEY = '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { url } = req.body;
  if (!url?.startsWith('https://'))
    return res.status(400).json({ error: 'Valid HTTPS URL required' });

  try {
    const { data } = await axios.post(
      'https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink',
      { url },
      {
        headers: {
          'x-rapidapi-host': 'auto-download-all-in-one.p.rapidapi.com',
          'x-rapidapi-key': RAPID_KEY,
          'content-type': 'application/json'
        }
      }
    );

    const media = (data.medias || data.links || [data])[0];
    if (!media?.url) throw new Error('No stream URL returned');

    return res.json({ downloadUrl: media.url, filename: `${Date.now()}.mp4` });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
};
