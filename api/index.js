const axios = require('axios');

const RAPID_KEY = '1dda0d29d3mshc5f2aacec619c44p16f219jsn99a62a516f98';

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST only.' });
  }

  try {
    const { url } = req.body;
    
    // Validate URL
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!url.startsWith('https://')) {
      return res.status(400).json({ error: 'Valid HTTPS URL required' });
    }

    console.log('Processing URL:', url);

    // Call RapidAPI service
    const { data } = await axios.post(
      'https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink',
      { url },
      {
        headers: {
          'x-rapidapi-host': 'auto-download-all-in-one.p.rapidapi.com',
          'x-rapidapi-key': RAPID_KEY,
          'content-type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('API Response received');

    // Extract media URL from response
    const media = (data.medias || data.links || [data])[0];
    
    if (!media || !media.url) {
      throw new Error('No downloadable media found in response');
    }

    console.log('Media URL found:', media.url.substring(0, 50) + '...');

    // Return the download info without streaming through server
    return res.json({
      success: true,
      downloadUrl: media.url,
      filename: `download-${Date.now()}.mp4`,
      quality: media.quality || 'default',
      duration: media.duration || null
    });

  } catch (error) {
    console.error('Error details:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.code === 'ENOTFOUND') {
      return res.status(500).json({ error: 'Network error: Cannot connect to service' });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'Service authentication failed' });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to process download request' 
    });
  }
};