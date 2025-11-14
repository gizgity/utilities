import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Schema, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

const schema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    headers: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: 'A list of all column headers found in the table image.',
    },
    data: {
      type: SchemaType.ARRAY,
      description: 'An array of data rows extracted from the table.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
        },
      },
    },
  },
  required: ['headers', 'data'],
};

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

    const result = await model.generateContent({
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
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const response = result.response;
    const responseObject = JSON.parse(response.text());

    return NextResponse.json(responseObject);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
