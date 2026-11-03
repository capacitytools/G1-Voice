export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // We add specific headers to mimic a real browser, 
    // which often bypasses the 502 errors on their end.
    const response = await fetch('https://freeapi.pro/api/tts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg, audio/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        voiceIndex: req.body.voiceIndex,
        text: req.body.text,
        pitch: req.body.pitch || 0,
        rate: req.body.rate || 0
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}