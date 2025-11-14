'use client';

import * as React from 'react';
import { Input, Button, Table } from '@/components/ui';

interface EditableTableProps {
  headers: string[];
  allHeaders: string[];
  data: Record<string, any>[];
  onDataChange: (data: Record<string, any>[]) => void;
}

export function EditableTable({ headers, allHeaders, data, onDataChange }: EditableTableProps) {
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
    const newRow = allHeaders.reduce((acc, header) => {
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
      <Table className="max-w-lg mb-6 mx-auto">
        <Table.Header>
          <Table.Row>
            {headers.map((header) => (
              <Table.Head key={header} className="p-2 border border-input text-left">{header}</Table.Head>
            ))}
            <Table.Head className="p-2 border border-input text-left">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((row, rowIndex) => (
            <Table.Row key={rowIndex}>
              {headers.map((header) => (
                <Table.Cell key={header} className="p-2 border border-input">
                  <Input
                    value={row[header]}
                    onChange={(e) => handleInputChange(e, rowIndex, header)}
                  />
                </Table.Cell>
              ))}
              <Table.Cell className="p-2 border border-input">
                <Button onClick={() => handleDeleteRow(rowIndex)} variant="destructive">
                  Delete
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Button onClick={handleAddRow} className="mt-4">
        Add Row
      </Button>
    </div>
  );
}
