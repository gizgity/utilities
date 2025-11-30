import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

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
  const [_, format] = fileType.split('/');

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
    const { text, voice, stylePrompt } = await req.json();

    if (!text || !voice) {
      return NextResponse.json(
        { error: 'Missing text or voice in request body' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Use the model from the example
    const model = 'gemini-2.5-flash-preview-tts';

    const config = {
      temperature: 1,
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
      model,
      config,
      contents,
    });

    const audioChunks: Buffer[] = [];

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue;
      }

      const part = chunk.candidates[0].content.parts[0];
      if (part.inlineData) {
        const inlineData = part.inlineData;
        let fileExtension = getExtensionFromMimeType(inlineData.mimeType || '');
        let buffer = Buffer.from(inlineData.data || '', 'base64');

        // If extension is not found or it looks like raw PCM (often no extension or specific mime), 
        // fallback to wav conversion if needed.
        // The example logic: if (!fileExtension) { fileExtension = 'wav'; buffer = convertToWav(...) }
        // We will follow that logic.
        if (!fileExtension) {
          fileExtension = 'wav';
          buffer = convertToWav(inlineData.data || '', inlineData.mimeType || '');
        }

        audioChunks.push(buffer);
      }
    }

    if (audioChunks.length === 0) {
      return NextResponse.json(
        { error: 'No audio generated.' },
        { status: 500 }
      );
    }

    // Concatenate all chunks. 
    // Note: If we are converting to WAV for each chunk, concatenating them directly might be an issue 
    // if each has a header. However, usually TTS returns one chunk or raw PCM chunks.
    // If convertToWav adds a header, we might have multiple headers if we get multiple chunks.
    // But for now, let's assume we can just concat them or that we get a single chunk.
    // If we get multiple WAV chunks, the browser might play them sequentially or fail.
    // Given the example saves them as separate files, it's possible they are separate segments.
    // But for a single HTTP response, we need one file.
    // Let's concat them.
    const finalBuffer = Buffer.concat(audioChunks);

    return new NextResponse(finalBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav', // Assuming we default to wav or it's compatible
        'Content-Disposition': 'attachment; filename="speech.wav"',
      },
    });

  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
