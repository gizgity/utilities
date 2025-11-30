import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

// Configuration constants
const TTS_CONFIG = {
  MODEL: 'gemini-2.5-flash-preview-tts',
  TEMPERATURE: 1,
} as const;

// Request body interface
interface TTSRequest {
  text: string;
  voice: string;
  stylePrompt?: string;
}

// Helper to map mime types to extensions since we can't install 'mime'
function getExtensionFromMimeType(mimeType: string): string | null {
  if (!mimeType) return null;
  const lower = mimeType.toLowerCase();
  if (lower.includes('audio/wav') || lower.includes('audio/x-wav')) return 'wav';
  if (lower.includes('audio/mpeg') || lower.includes('audio/mp3')) return 'mp3';
  if (lower.includes('audio/ogg')) return 'ogg';
  return null;
}

interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

function parseMimeType(mimeType: string) {
  const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
  const [, format] = fileType.split('/');


  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
  };

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map(s => s.trim());
    if (key === 'rate') {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
}

function createWavHeader(dataLength: number, options: WavConversionOptions) {
  const {
    numChannels,
    sampleRate,
    bitsPerSample,
  } = options;

  // http://soundfile.sapp.org/doc/WaveFormat

  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);                      // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4);     // ChunkSize
  buffer.write('WAVE', 8);                      // Format
  buffer.write('fmt ', 12);                     // Subchunk1ID
  buffer.writeUInt32LE(16, 16);                 // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20);                  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);        // NumChannels
  buffer.writeUInt32LE(sampleRate, 24);         // SampleRate
  buffer.writeUInt32LE(byteRate, 28);           // ByteRate
  buffer.writeUInt16LE(blockAlign, 32);         // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34);      // BitsPerSample
  buffer.write('data', 36);                     // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40);         // Subchunk2Size

  return buffer;
}

function convertToWav(rawData: string, mimeType: string) {
  const options = parseMimeType(mimeType);
  const wavHeader = createWavHeader(rawData.length, options);
  const buffer = Buffer.from(rawData, 'base64');

  return Buffer.concat([wavHeader, buffer]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as TTSRequest;
    const { text, voice, stylePrompt } = body;

    if (!text || !voice) {
      return NextResponse.json(
        { error: 'Missing text or voice in request body' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const config = {
      temperature: TTS_CONFIG.TEMPERATURE,
      responseModalities: [
        'audio',
      ],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
          },
        },
      },
    };

    // Construct the prompt.
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: stylePrompt ? `Read aloud in a ${stylePrompt} tone\n${text}` : text,
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model: TTS_CONFIG.MODEL,
      config,
      contents,
    });

    const rawChunks: Buffer[] = [];
    let mimeType = '';

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue;
      }

      const parts = chunk.candidates[0].content.parts;
      if (!parts || parts.length === 0) continue;

      const part = parts[0];
      if (part.inlineData) {
        const inlineData = part.inlineData;
        mimeType = inlineData.mimeType || mimeType; // Keep track of mime type

        // Store raw PCM data without converting yet
        const buffer = Buffer.from(inlineData.data || '', 'base64');
        rawChunks.push(buffer);
      }
    }

    if (rawChunks.length === 0) {
      return NextResponse.json(
        { error: 'No audio generated.' },
        { status: 500 }
      );
    }

    // Concatenate all raw PCM chunks first
    const rawBuffer = Buffer.concat(rawChunks);

    // Now convert to WAV once with a single header
    let finalBuffer: Buffer;
    const fileExtension = getExtensionFromMimeType(mimeType);

    if (!fileExtension) {
      // Convert raw PCM to WAV
      finalBuffer = convertToWav(rawBuffer.toString('base64'), mimeType);
    } else {
      // Already in a proper format
      finalBuffer = rawBuffer;
    }

    return new NextResponse(new Uint8Array(finalBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav', // Assuming we default to wav or it's compatible
        'Content-Disposition': 'attachment; filename="speech.wav"',
      },
    });

  } catch (error) {
    console.error('TTS API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'An unexpected error occurred.',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: 500 }
    );
  }
}
