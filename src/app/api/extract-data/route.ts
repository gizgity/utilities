import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Schema, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function generateSchema(headers: string[]): Schema {
  const properties: Record<string, any> = {};
  headers.forEach(header => {
    properties[header] = {
      type: SchemaType.STRING,
      description: `The value for the column: ${header}`
    };
    // A simple heuristic for numeric values
    if (header.toLowerCase().includes('score') || header.toLowerCase().includes('điểm')) {
      properties[header].type = SchemaType.NUMBER;
    }
  });

  return {
    type: SchemaType.ARRAY,
    description: "An array of data rows extracted from the table.",
    items: {
      type: SchemaType.OBJECT,
      required: headers,
      properties: properties
    }
  };
}


async function getDataFromImage(file: File, selectedHeaders: string[]): Promise<Record<string, any>[]> {
  const schema = generateSchema(selectedHeaders);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  const prompt = "You are an accurate and selective data extraction engine. Parse all data rows from the attached table image. **You must only return data for the keys specified in the schema.**";

  const imageBuffer = Buffer.from(await file.arrayBuffer());
  const imageBase64 = imageBuffer.toString('base64');

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: file.type,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const responseObject = JSON.parse(await response.text());
  return responseObject;
}

async function getDataFromXLSX(file: File, selectedHeaders: string[]): Promise<Record<string, any>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  const headers = jsonData[0];
  const dataRows = jsonData.slice(1);

  const result = dataRows.map(row => {
    const rowData: Record<string, any> = {};
    selectedHeaders.forEach(header => {
      const headerIndex = headers.indexOf(header);
      if (headerIndex !== -1) {
        rowData[header] = row[headerIndex];
      }
    });
    return rowData;
  });

  return result;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const selectedHeadersJSON = formData.get('selectedHeaders') as string;
    const selectedHeaders = JSON.parse(selectedHeadersJSON);

    if (!file || !selectedHeaders || selectedHeaders.length === 0) {
      return NextResponse.json({ error: 'Missing file or selected headers.' }, { status: 400 });
    }

    let data: Record<string, any>[];

    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      data = await getDataFromXLSX(file, selectedHeaders);
    } else if (file.type.startsWith('image/')) {
      data = await getDataFromImage(file, selectedHeaders);
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
