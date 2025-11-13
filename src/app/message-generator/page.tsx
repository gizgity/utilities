'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '../../components/FileUpload';
import { HeaderSelector } from '../../components/HeaderSelector';
import { EditableTable } from '../../components/EditableTable';
import { TemplateEditor } from '../../components/TemplateEditor';
import { Textarea, Button, Alert } from '@/components/ui';

interface Phase1State {
  uploadedFile: File | null;
  headers: string[];
  selectedHeaders: string[];
  hasChanged: boolean;
}

interface Phase2State {
  extractedData: Record<string, any>[];
  hasChanged: boolean;
}

interface Phase3State {
  template: string;
  generatedOutput: string;
  hasChanged: boolean;
}

export default function Home() {
  const [phase, setPhase] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [phase1State, setPhase1State] = useState<Phase1State>({
    uploadedFile: null,
    headers: [],
    selectedHeaders: [],
    hasChanged: true,
  });

  const [phase2State, setPhase2State] = useState<Phase2State>({
    extractedData: [],
    hasChanged: true,
  });

  const [phase3State, setPhase3State] = useState<Phase3State>({
    template: '',
    generatedOutput: '',
    hasChanged: true,
  });

  const handleFileUpload = async (file: File) => {
    setPhase1State({
      ...phase1State,
      uploadedFile: file,
      hasChanged: true,
    });
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
      setPhase1State(prevState => ({
        ...prevState,
        headers: data.headers,
        selectedHeaders: data.headers,
      }));
      setPhase2State({ extractedData: [], hasChanged: true });
      setPhase3State({ template: '', generatedOutput: '', hasChanged: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderToggle = (header: string) => {
    const { selectedHeaders } = phase1State;
    const newSelectedHeaders = selectedHeaders.includes(header)
      ? selectedHeaders.filter((h) => h !== header)
      : [...selectedHeaders, header];

    setPhase1State({
      ...phase1State,
      selectedHeaders: newSelectedHeaders,
      hasChanged: true,
    });
  };

  const handleGenerateOutput = () => {
    let output = '';
    for (const row of phase2State.extractedData) {
      let rowOutput = phase3State.template;
      for (const key in row) {
        rowOutput = rowOutput.replace(new RegExp(`{${key}}`, 'g'), row[key]);
      }
      output += rowOutput + '\n';
    }
    setPhase3State({ ...phase3State, generatedOutput: output, hasChanged: false });
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
    downloadFile(phase3State.generatedOutput, 'output.txt', 'text/plain');
  };

  const downloadCsv = () => {
    const csvHeader = phase1State.selectedHeaders.join(',') + '\n';
    const csvBody = phase2State.extractedData.map(row =>
      phase1State.selectedHeaders.map(header => row[header]).join(',')
    ).join('\n');
    downloadFile(csvHeader + csvBody, 'output.csv', 'text/csv');
  };

  const handleNextPhase = () => {
    setPhase(prev => prev + 1);
  };

  const handlePreviousPhase = () => {
    setPhase(prev => prev - 1);
  };

  const canGoNext = () => {
    if (phase === 1 && phase1State.selectedHeaders.length === 0) {
      return false;
    }
    if (phase === 2 && phase2State.extractedData.length === 0) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (phase === 2 && phase1State.uploadedFile && phase1State.hasChanged) {
      const extractData = async () => {
        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', phase1State.uploadedFile);
        formData.append('selectedHeaders', JSON.stringify(phase1State.selectedHeaders));

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
          setPhase2State({ extractedData: data.data, hasChanged: false });
          setPhase1State(prev => ({ ...prev, hasChanged: false }));
        } catch (err: any) {
          setError(err.message);
          setPhase(1);
        } finally {
          setIsLoading(false);
        }
      };
      extractData();
    }
  }, [phase, phase1State.uploadedFile, phase1State.selectedHeaders, phase1State.hasChanged]);

  useEffect(() => {
    // prevent hydration mismatches by rendering interactive UI only after mount
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (phase2State.hasChanged) {
      setPhase3State(prev => ({ ...prev, generatedOutput: '', hasChanged: true }));
    }
  }, [phase2State]);

  if (!isMounted) return null;

  return (
    <div className="container mx-auto p-8">
      {error && (
        <Alert variant="solid" status="error">
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert>
      )}
        <h1 className="text-3xl font-bold mb-8 text-center">[ DATA EXTRACTOR ]</h1>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={handlePreviousPhase} disabled={phase === 1}>
            PREVIOUS
          </Button>
          <Button onClick={handleNextPhase} disabled={!canGoNext() || phase === 3}>
            NEXT
          </Button>
        </div>

        {phase === 1 && (
          <div>
            <h2 className="text-2xl mb-4">[ Phase 1: Upload & Select Headers ]</h2>
            {isLoading ? (
              <p>Scanning headers...</p>
            ) : !phase1State.uploadedFile ? (
              <FileUpload onFileUpload={handleFileUpload} />
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p>File Uploaded: {phase1State.uploadedFile.name}</p>
                  <Button onClick={() => setPhase1State({ ...phase1State, uploadedFile: null, headers: [], selectedHeaders: [] })}>
                    UPLOAD NEW FILE
                  </Button>
                </div>
                <HeaderSelector
                  headers={phase1State.headers}
                  selectedHeaders={phase1State.selectedHeaders}
                  onHeaderToggle={handleHeaderToggle}
                />
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
                <EditableTable
                  headers={phase1State.selectedHeaders}
                  data={phase2State.extractedData}
                  onDataChange={(newData) => setPhase2State({ extractedData: newData, hasChanged: true })}
                />
              </div>
            )}
          </div>
        )}

        {phase === 3 && (
          <div>
            <h2 className="text-2xl mb-4">[ Phase 3: Generate Output ]</h2>
            <TemplateEditor
              availableKeys={phase1State.selectedHeaders}
              template={phase3State.template}
              onTemplateChange={(newTemplate) => setPhase3State(prev => ({ ...prev, template: newTemplate, hasChanged: true }))}
              onGenerate={handleGenerateOutput}
            />

            {phase3State.generatedOutput && (
              <div className="mt-8">
                <h3 className="text-xl mb-2">[ Generated Output ]</h3>
                <Textarea
                  readOnly
                  value={phase3State.generatedOutput}
                  className="w-full h-64 bg-background border border-input p-2"
                />
                <div className="flex gap-4 mt-4">
                  <Button onClick={downloadTxt} className="w-full">
                    DOWNLOAD .TXT
                  </Button>
                  <Button onClick={downloadCsv} className="w-full">
                    DOWNLOAD .CSV
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
