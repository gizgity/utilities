import { NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { getHeadersFromXLSX, getDataFromXLSX } from '@/lib/xlsx-processor';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const properties = {};
const propertyOrdering = [];
const required = [];
const MAX_COLUMNS = 10;

for (let i = 1; i <= MAX_COLUMNS; i++) {
  const colName = `Column_${i}`;
  properties[colName] = {
    type: "STRING",
    description: `The value from the column ${i} of the table (this cell could be fragmented or split across two or more adjacent columns (unlabeled columns next to the first labeled one), you must logically combine the content of these adjacent cells into a single, complete string.).`
  };

  propertyOrdering.push(colName);
  required.push(colName); // Marking as required ensures the model returns a value (even if it's an empty string)
}

const tableSchema = {
  type: "OBJECT",
  properties: {
    headers: {
      type: 'ARRAY',
      items: {
        type: 'string',
      },
      description: 'A list of all column headers found in the table image, always is the first row, ignore all other rows and must be order sequentially from the table columns.',
    },
    data: {
      type: "ARRAY",
      description: `A JSON array where each object represents one row of data extracted from the table. The keys are generic placeholders (Column_1 to Column_${MAX_COLUMNS}) and must be mapped sequentially from the table columns.`,
      items: {
        type: "OBJECT",
        properties: properties,
        propertyOrdering: propertyOrdering,
        required: required
      }
    },
  },
  required: ['headers', 'data'],
};

async function processImage(file: File) {
  const imageBuffer = Buffer.from(await file.arrayBuffer());
  const imageBase64 = imageBuffer.toString('base64');

  const result = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'You are a data extraction tool. Extract all data from the table in the image. The column headers must be used as keys for each object in the resulting JSON array.',
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
      responseSchema: tableSchema,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      temperature: 0.1
    }
  });
  console.log(result.text);

  const responseObject = JSON.parse(result.text);
  responseObject.headers = [... new Set(responseObject.headers)].filter(Boolean);
  responseObject.data = responseObject.data.map((row: any) => {
    const cleanedRow: any = {};
    for (let i = 1; i <= MAX_COLUMNS; i++) {
      const key = `Column_${i}`;
      const cleanedKey = responseObject.headers[i - 1] || key;
      if (row[key] !== undefined) {
        cleanedRow[cleanedKey] = row[key];
      }
    }
    return cleanedRow;
  });
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
