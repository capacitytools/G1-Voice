import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const VOICE_MAP = {
  1: "en-US-AndrewMultilingualNeural",
  2: "en-US-AvaMultilingualNeural",
  3: "en-US-BrianMultilingualNeural",
  4: "en-US-EmmaMultilingualNeural",
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
  55: "es-ES-ElenaNeural",
  56: "es-ES-TomasNeural",
  100: "zh-CN-XiaoxiaoNeural",
  101: "zh-CN-XiaoyiNeural",
  114: "fr-FR-CharlineNeural",
  115: "fr-FR-GerardNeural",
  125: "de-DE-IngridNeural",
  126: "de-DE-JonasNeural"
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voiceIndex, text, pitch, rate } = req.body;
    const voiceName = VOICE_MAP[voiceIndex] || "en-US-AriaNeural";

    const rateStr = rate ? `${rate > 0 ? '+' : ''}${rate}%` : "+0%";
    const pitchStr = pitch ? `${pitch > 0 ? '+' : ''}${pitch}Hz` : "+0Hz";

    // Increased timeouts to prevent Microsoft from closing the stream early
    const tts = new MsEdgeTTS({
      connectionTimeoutMs: 15000,
      synthesisTimeoutMs: 30000
    });
    
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    const { audioStream } = tts.toStream(text, { rate: rateStr, pitch: pitchStr });

    const chunks = [];
    
    // Catch stream errors so it doesn't crash the whole request
    audioStream.on('error', (err) => {
      console.error('Audio Stream Error:', err);
    });

    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    tts.close();

    if (buffer.length === 0) {
      throw new Error("No audio data received");
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);

  } catch (error) {
    console.error('Edge TTS Error:', error);
    res.status(500).json({ error: 'TTS failed: ' + error.message });
  }
}