import { UniversalEdgeTTS } from 'edge-tts-universal';

// Map FreeApi indexes to Microsoft Edge TTS voice names
const VOICE_MAP = {
  // Multilingual
  1: "en-US-AndrewMultilingualNeural",
  2: "en-US-AvaMultilingualNeural",
  3: "en-US-BrianMultilingualNeural",
  4: "en-US-EmmaMultilingualNeural",
  // English
  12: "en-US-AnaNeural",
  13: "en-US-AndrewNeural",
  14: "en-US-AriaNeural",
  15: "en-US-AvaNeural",
  16: "en-US-BrianNeural",
  17: "en-US-ChristopherNeural",
  18: "en-US-EmmaNeural",
  19: "en-US-EricNeural",
  20: "en-US-GuyNeural",
  21: "en-US-JennyNeural",
  22: "en-US-MichelleNeural",
  23: "en-US-RogerNeural",
  24: "en-US-SteffanNeural",
  25: "en-GB-LibbyNeural",
  26: "en-GB-MaisieNeural",
  27: "en-GB-RyanNeural",
  28: "en-GB-SoniaNeural",
  29: "en-GB-ThomasNeural",
  // Spanish
  55: "es-ES-ElenaNeural",
  56: "es-ES-TomasNeural",
  // Chinese
  100: "zh-CN-XiaoxiaoNeural",
  101: "zh-CN-XiaoyiNeural",
  // French
  114: "fr-FR-CharlineNeural",
  115: "fr-FR-GerardNeural",
  // German
  125: "de-DE-IngridNeural",
  126: "de-DE-JonasNeural"
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voiceIndex, text, pitch, rate } = req.body;
    
    // Look up the Edge TTS voice name. Fallback to Aria if not mapped.
    const voiceName = VOICE_MAP[voiceIndex] || "en-US-AriaNeural";

    // Format rate and pitch for Edge TTS (e.g., "+10%" or "-20Hz")
    const rateStr = rate ? `${rate > 0 ? '+' : ''}${rate}%` : "+0%";
    const pitchStr = pitch ? `${pitch > 0 ? '+' : ''}${pitch}Hz` : "+0Hz";

    const tts = new UniversalEdgeTTS(text, voiceName);
    const result = await tts.synthesize({
      rate: rateStr,
      pitch: pitchStr
    });

    const buffer = Buffer.from(await result.audio.arrayBuffer());

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Edge TTS Error:', error);
    res.status(500).json({ error: 'Edge TTS failed: ' + error.message });
  }
}