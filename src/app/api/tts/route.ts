import { GoogleGenerativeAI } from '@google/generative-ai';
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-tts',
    });

    const result = await model.generateContent({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          prompt: stylePrompt,
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    });

    const audioPart = result.response.parts.find(part => part.audio);
    if (!audioPart || !audioPart.audio) {
      return NextResponse.json(
        { error: 'Failed to generate audio from API.' },
        { status: 500 }
      );
    }

    // Convert the base64 audio to a buffer
    const audioBuffer = Buffer.from(audioPart.audio as string, 'base64');

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
