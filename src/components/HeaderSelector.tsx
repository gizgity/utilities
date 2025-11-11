'use client';

interface HeaderSelectorProps {
  headers: string[];
  selectedHeaders: string[];
  onHeaderToggle: (header: string) => void;
}

export function HeaderSelector({ headers, selectedHeaders, onHeaderToggle }: HeaderSelectorProps) {
  return (
    <div className="border-2 border-primary p-4 mt-4">
      <h3 className="text-xl mb-4">[ Select Headers ]</h3>
      <div className="grid grid-cols-3 gap-4">
        {headers.map((header) => (
          <div key={header} className="flex items-center">
            <input
              type="checkbox"
              id={header}
              name={header}
              value={header}
              checked={selectedHeaders.includes(header)}
              onChange={() => onHeaderToggle(header)}
              className="mr-2"
            />
            <label htmlFor={header}>{header}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
