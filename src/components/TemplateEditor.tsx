'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

interface TemplateEditorProps {
  availableKeys: string[];
  template: string;
  onTemplateChange: (template: string) => void;
  onGenerate: () => void;
}

export function TemplateEditor({
  availableKeys,
  template,
  onTemplateChange,
  onGenerate,
}: TemplateEditorProps) {

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, key: string) => {
    e.dataTransfer.setData("text/plain", `{${key}}`);
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const key = e.dataTransfer.getData("text/plain");
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = template.substring(0, start) + key + template.substring(end);
    onTemplateChange(newText);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      <div className="flex gap-8">
        <div className="w-2/3">
          <h3 className="text-xl mb-2">[ Template Editor ]</h3>
          <p className="text-sm mb-4">Drag and drop keys from the list on the right into the text area.</p>
          <Textarea
            value={template}
            onChange={(e) => onTemplateChange(e.target.value)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="h-48"
            placeholder="e.g., Dear {Họ và tên}, your score is {Toán}."
          />
        </div>
        <div className="w-1/3">
          <h3 className="text-xl mb-2">[ Available Keys ]</h3>
          <div className="flex flex-col gap-2">
            {availableKeys.map((key) => (
              <div
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, key)}
                className="cursor-grab border border-input p-2 text-center"
              >
                {`{${key}}`}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button
        onClick={onGenerate}
        className="mt-8 w-full"
      >
        GENERATE OUTPUT
      </Button>
    </div>
  );
}
