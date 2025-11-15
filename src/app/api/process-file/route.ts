import { NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { getHeadersFromXLSX, getDataFromXLSX } from '@/lib/xlsx-processor';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

async function processImage(file: File) {
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
                            properties: {},
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
    return responseObject;
}


async function processXLSX(file: File) {
    const headers = await getHeadersFromXLSX(file);
    const data = await getDataFromXLSX(file, headers); // Pass all headers to get all data
    return { headers, data };
}


export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
        }

        let result;
        if (file.type.startsWith('image/')) {
            result = await processImage(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            result = await processXLSX(file);
        } else {
            return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
