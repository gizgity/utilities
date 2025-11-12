'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EditableTableProps {
  headers: string[];
  data: Record<string, any>[];
  onDataChange: (data: Record<string, any>[]) => void;
}

export function EditableTable({ headers, data, onDataChange }: EditableTableProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    rowIndex: number,
    header: string
  ) => {
    const newData = [...data];
    newData[rowIndex][header] = e.target.value;
    onDataChange(newData);
  };

  const handleAddRow = () => {
    const newRow = headers.reduce((acc, header) => {
      acc[header] = '';
      return acc;
    }, {} as Record<string, any>);
    onDataChange([...data, newRow]);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const newData = data.filter((_, i) => i !== rowIndex);
    onDataChange(newData);
  };

  return (
    <div>
      <table className="w-full table-fixed">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="p-2 border border-input text-left">{header}</th>
            ))}
            <th className="p-2 border border-input text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header) => (
                <td key={header} className="p-2 border border-input">
                  <Input
                    value={row[header]}
                    onChange={(e) => handleInputChange(e, rowIndex, header)}
                  />
                </td>
              ))}
              <td className="p-2 border border-input">
                <Button onClick={() => handleDeleteRow(rowIndex)} variant="destructive">
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={handleAddRow} className="mt-4">
        Add Row
      </Button>
    </div>
  );
}
