'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/Textarea';

interface DataPreviewProps {
  data: Record<string, any>[];
}

export function DataPreview({ data }: DataPreviewProps) {
  return (
    <div className="border border-input bg-background p-4 mt-4 h-64 overflow-auto">
      <Textarea
        readOnly
        value={JSON.stringify(data, null, 2)}
        className="h-full"
      />
    </div>
  );
}
