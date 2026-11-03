import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Map FreeApi indexes to Microsoft Edge TTS voice names
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
  29: "en-GB-ThomasNeural"
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voiceIndex, text, pitch, rate } = req.body;
    
    // Look up the voice. Default to Aria if not mapped.
    const voiceName = VOICE_MAP[voiceIndex] || "en-US-AriaNeural";

    // Edge TTS expects strings like "+10%" for rate and "+5Hz" for pitch
    const rateStr = rate ? `${rate > 0 ? '+' : ''}${rate}%` : "+0%";
    const pitchStr = pitch ? `${pitch > 0 ? '+' : ''}${pitch}Hz` : "+0Hz";

    // Initialize the TTS engine
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    // Synthesize (it returns a stream)
    const { audioStream } = tts.toStream(text, { rate: rateStr, pitch: pitchStr });

    // Collect the stream into a buffer
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Clean up the connection
    tts.close();

    // Send back the MP3
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.status(200).send(buffer);

  } catch (error) {
    console.error('Edge TTS Error:', error);
    res.status(500).json({ error: 'TTS failed: ' + error.message });
  }
}