import * as xlsx from 'xlsx';

export async function getHeadersFromXLSX(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  return data[0] || [];
}

export async function getDataFromXLSX(file: File, selectedHeaders: string[]): Promise<Record<string, any>[]> {
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
