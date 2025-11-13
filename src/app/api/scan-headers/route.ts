import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function getHeadersFromImage(file: File): Promise<string[]> {
  const prompt = "You are a data extraction tool. Identify all column headers from the attached image of a table. Return *only* the headers.";

  const imageBuffer = Buffer.from(await file.arrayBuffer());
  const imageBase64 = imageBuffer.toString('base64');

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType: file.type,
            },
          }
        ]
      }
    ],
    config: {
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      responseMimeType: "application/json",
      responseSchema: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: "A list of all column headers found in the table image."
      }
    }
  });

  const responseObject = JSON.parse(result.text);
  return responseObject;
}

async function getHeadersFromXLSX(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  return data[0] || [];
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    let headers: string[];

    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      headers = await getHeadersFromXLSX(file);
    } else if (file.type.startsWith('image/')) {
      headers = await getHeadersFromImage(file);
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    const uniqueHeaders = [...new Set(headers)];

    return NextResponse.json({ headers: uniqueHeaders });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
