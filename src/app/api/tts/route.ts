import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice, stylePrompt } = await req.json();

    if (!text || !voice || !stylePrompt) {
      return NextResponse.json(
        { error: 'Missing text, voice, or stylePrompt in request body' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text }],
        },
      ],
      config: {
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
      },
    });

    const candidate = result.candidates?.[0];
    if (!candidate) {
      return NextResponse.json(
        { error: 'No candidates found in the response.' },
        { status: 500 }
      );
    }

    const audioPart = candidate.content.parts.find(part => (part as any).audio);
    if (!audioPart || !(audioPart as any).audio) {
      return NextResponse.json(
        { error: 'Failed to generate audio from API.' },
        { status: 500 }
      );
    }

    // Convert the base64 audio to a buffer
    const audioBuffer = Buffer.from((audioPart as any).audio as string, 'base64');

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="speech.mp3"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
