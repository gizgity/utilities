import { NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const imageBase64 = imageBuffer.toString('base64');

    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'You are a data extraction tool. Identify all column headers and extract all data from the attached image of a table. Return both the headers and the data in the specified format.',
            },
            {
              inlineData: {
                data: imageBase64,
                mimeType: file.type,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            headers: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'A list of all column headers found in the table image.',
            },
            data: {
              type: 'array',
              description: 'An array of data rows extracted from the table.',
              items: {
                type: 'object',
                properties: {
                },
              },
            },
          },
          required: ['headers', 'data'],
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      }
    });

    const responseObject = JSON.parse(result.text);

    return NextResponse.json(responseObject);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
