'use client';

interface DataPreviewProps {
  data: Record<string, any>[];
}

export function DataPreview({ data }: DataPreviewProps) {
  return (
    <div className="border-2 border-retro-green p-4 mt-4 h-64 overflow-auto bg-retro-black">
      <pre className="text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
