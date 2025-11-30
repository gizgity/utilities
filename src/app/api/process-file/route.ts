import { NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { getHeadersFromXLSX, getDataFromXLSX } from '@/lib/xlsx-processor';

// Configuration
const MAX_COLUMNS = parseInt(process.env.MAX_TABLE_COLUMNS || '10', 10);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Type definitions
interface ColumnProperty {
  type: string;
  description: string;
}

interface ExtractedRow {
  [key: string]: string;
}

interface TableResponse {
  headers: string[];
  data: ExtractedRow[];
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const properties: Record<string, ColumnProperty> = {};
const propertyOrdering: string[] = [];
const required: string[] = [];

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
        type: 'STRING',  // Consistent with other type definitions
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

  if (process.env.NODE_ENV === 'development') {
    console.log('Gemini response:', result.text);
  }

  const responseObject: TableResponse = JSON.parse(result.text);

  // Handle duplicate headers by appending index
  const seenHeaders = new Set<string>();
  responseObject.headers = responseObject.headers
    .filter(Boolean)
    .map((header: string, index: number) => {
      if (seenHeaders.has(header)) {
        const newHeader = `${header}_${index}`;
        seenHeaders.add(newHeader);
        return newHeader;
      }
      seenHeaders.add(header);
      return header;
    });

  responseObject.data = responseObject.data.map((row: ExtractedRow) => {
    const cleanedRow: ExtractedRow = {};
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

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 413 }
      );
    }

    let result: TableResponse;
    if (file.type.startsWith('image/')) {
      result = await processImage(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      result = await processXLSX(file);
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);
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
