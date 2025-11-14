import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

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
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
