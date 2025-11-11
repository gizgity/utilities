'use client';

import React from 'react';

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
          <textarea
            value={template}
            onChange={(e) => onTemplateChange(e.target.value)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-full h-48 bg-retro-black border-2 border-retro-green p-2 font-mono"
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
                className="cursor-grab border-2 border-retro-green p-2 text-center"
              >
                {`{${key}}`}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onGenerate}
        className="mt-8 w-full bg-retro-green text-retro-black p-4 font-bold shadow-retro-3d hover:shadow-retro-3d-hover transition-shadow"
      >
        GENERATE OUTPUT
      </button>
    </div>
  );
}
