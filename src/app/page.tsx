'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '../components/FileUpload';
import { HeaderSelector } from '../components/HeaderSelector';
import { DataPreview } from '../components/DataPreview';
import { TemplateEditor } from '../components/TemplateEditor';
import { Toast } from '../components/Toast';

export default function Home() {
  const [phase, setPhase] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<Record<string, any>[]>([]);
  const [template, setTemplate] = useState('');
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/scan-headers', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scan headers.');
      }

      const data = await response.json();
      setHeaders(data.headers);
      setSelectedHeaders(data.headers); // Select all by default
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderToggle = (header: string) => {
    setSelectedHeaders((prev) =>
      prev.includes(header)
        ? prev.filter((h) => h !== header)
        : [...prev, header]
    );
  };

  const proceedToPhase2 = () => {
    if (selectedHeaders.length > 0) {
      setPhase(2);
    } else {
      setError("Please select at least one header.");
    }
  };

  const proceedToPhase3 = () => {
    setPhase(3);
  };

  const handleGenerateOutput = () => {
    let output = '';
    for (const row of extractedData) {
      let rowOutput = template;
      for (const key in row) {
        rowOutput = rowOutput.replace(new RegExp(`{${key}}`, 'g'), row[key]);
      }
      output += rowOutput + '\n';
    }
    setGeneratedOutput(output);
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTxt = () => {
    downloadFile(generatedOutput, 'output.txt', 'text/plain');
  };

  const downloadCsv = () => {
    const csvHeader = selectedHeaders.join(',') + '\n';
    const csvBody = extractedData.map(row =>
      selectedHeaders.map(header => row[header]).join(',')
    ).join('\n');
    downloadFile(csvHeader + csvBody, 'output.csv', 'text/csv');
  };

  useEffect(() => {
    if (phase === 2 && uploadedFile) {
      const extractData = async () => {
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('selectedHeaders', JSON.stringify(selectedHeaders));

        try {
          const response = await fetch('/api/extract-data', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to extract data.');
          }

          const data = await response.json();
          setExtractedData(data.data);
        } catch (err: any) {
          setError(err.message);
          setPhase(1);
        } finally {
          setIsLoading(false);
        }
      };
      extractData();
    }
  }, [phase, uploadedFile, selectedHeaders]);

  return (
    <div className="border-2 border-primary p-8">
      {error && <Toast message={error} onClose={() => setError(null)} />}
      <h1 className="text-3xl font-bold mb-8 text-center">[ RETRO DATA EXTRACTOR ]</h1>

      {phase === 1 && (
        <div>
          <h2 className="text-2xl mb-4">[ Phase 1: Upload & Select Headers ]</h2>
          {!uploadedFile ? (
            <FileUpload onFileUpload={handleFileUpload} />
          ) : isLoading ? (
            <p>Scanning headers...</p>
          ) : (
            <div>
              <p className="mb-4">File Uploaded: {uploadedFile.name}</p>
              <HeaderSelector
                headers={headers}
                selectedHeaders={selectedHeaders}
                onHeaderToggle={handleHeaderToggle}
              />
              <button
                onClick={proceedToPhase2}
                disabled={selectedHeaders.length === 0}
                className="mt-4 w-full bg-primary text-secondary p-4 font-bold shadow-retro-3d hover:shadow-retro-3d-hover transition-shadow disabled:bg-gray-500 disabled:shadow-none"
              >
                PROCEED TO DATA EXTRACTION
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 2 && (
        <div>
          <h2 className="text-2xl mb-4">[ Phase 2: Extracted Data ]</h2>
          {isLoading ? (
            <p>Extracting data...</p>
          ) : (
            <div>
              <DataPreview data={extractedData} />
              <button
                onClick={proceedToPhase3}
                className="mt-4 w-full bg-primary text-secondary p-4 font-bold shadow-retro-3d hover:shadow-retro-3d-hover transition-shadow"
              >
                PROCEED TO TEMPLATE
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 3 && (
        <div>
          <h2 className="text-2xl mb-4">[ Phase 3: Generate Output ]</h2>
          <TemplateEditor
            availableKeys={selectedHeaders}
            template={template}
            onTemplateChange={setTemplate}
            onGenerate={handleGenerateOutput}
          />

          {generatedOutput && (
            <div className="mt-8">
              <h3 className="text-xl mb-2">[ Generated Output ]</h3>
              <textarea
                readOnly
                value={generatedOutput}
                className="w-full h-64 bg-background border-2 border-primary p-2 font-mono"
              />
              <div className="flex gap-4 mt-4">
                <button onClick={downloadTxt} className="w-full bg-primary text-secondary p-4 font-bold shadow-retro-3d hover:shadow-retro-3d-hover transition-shadow">
                  DOWNLOAD .TXT
                </button>
                <button onClick={downloadCsv} className="w-full bg-primary text-secondary p-4 font-bold shadow-retro-3d hover:shadow-retro-3d-hover transition-shadow">
                  DOWNLOAD .CSV
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
