import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

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
