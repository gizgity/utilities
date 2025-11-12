'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/Checkbox';

interface HeaderSelectorProps {
  headers: string[];
  selectedHeaders: string[];
  onHeaderToggle: (header: string) => void;
}

export function HeaderSelector({ headers, selectedHeaders, onHeaderToggle }: HeaderSelectorProps) {
  return (
    <div className="border border-input bg-background p-4 mt-4">
      <h3 className="text-xl mb-4">[ Select Headers ]</h3>
      <div className="grid grid-cols-3 gap-4">
        {headers.map((header) => (
          <div key={header} className="flex items-center">
            <Checkbox
              id={header}
              checked={selectedHeaders.includes(header)}
              onCheckedChange={() => onHeaderToggle(header)}
            />
            <label
              htmlFor={header}
              className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {header}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
