'use client';

import { useState } from 'react';
import { FileUpload } from '../../components/FileUpload';
import { Loader } from '@/components/ui/Loader';
import { Button, Alert } from '@/components/ui';
import { PixelHeader } from '@/components/PixelDecor';

export default function DocFormatter() {
    const [fileA, setFileA] = useState<File | null>(null);
    const [fileB, setFileB] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileAUpload = (file: File) => {
        if (!file.name.endsWith('.docx')) {
            setError('File A must be a .docx file');
            return;
        }
        setFileA(file);
        setError(null);
        setSuccess(false);
    };

    const handleFileBUpload = (file: File) => {
        if (!file.name.endsWith('.docx')) {
            setError('File B must be a .docx file');
            return;
        }
        setFileB(file);
        setError(null);
        setSuccess(false);
    };

    const handleProcess = async () => {
        if (!fileA || !fileB) {
            setError('Both files must be uploaded');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData();
        formData.append('fileA', fileA);
        formData.append('fileB', fileB);

        try {
            const response = await fetch('/api/format-doc', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to format document');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Use the original filename from fileA, replacing .docx with _formatted.docx
            const originalName = fileA.name.replace(/\.docx$/i, '');
            a.download = `${originalName}_formatted.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const canProcess = fileA && fileB && !isLoading;

    return (
        <div className="container mx-auto p-8 max-w-7xl">
            <PixelHeader className="mb-8 justify-center">Test Paper Formatter</PixelHeader>

            {error && (
                <Alert variant="solid" status="error" className="mb-4">
                    <Alert.Title>Error</Alert.Title>
                    <Alert.Description>{error}</Alert.Description>
                </Alert>
            )}

            {success && (
                <Alert variant="solid" status="success" className="mb-4">
                    <Alert.Title>Success</Alert.Title>
                    <Alert.Description>Document formatted and downloaded successfully!</Alert.Description>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="border-4 border-foreground p-6 bg-background">
                    <h2 className="text-xl mb-4">[ FILE A: UNFORMATTED ]</h2>
                    <p className="text-sm mb-4 opacity-70">
                        Upload the document that needs formatting
                    </p>
                    {!fileA ? (
                        <FileUpload onFileUpload={handleFileAUpload} accept=".docx" />
                    ) : (
                        <div>
                            <p className="mb-4">✓ {fileA.name}</p>
                            <Button onClick={() => setFileA(null)} variant="outline">
                                REMOVE
                            </Button>
                        </div>
                    )}
                </div>

                <div className="border-4 border-foreground p-6 bg-background">
                    <h2 className="text-xl mb-4">[ FILE B: TEMPLATE ]</h2>
                    <p className="text-sm mb-4 opacity-70">
                        Upload the properly formatted document to use as template
                    </p>
                    {!fileB ? (
                        <FileUpload onFileUpload={handleFileBUpload} accept=".docx" />
                    ) : (
                        <div>
                            <p className="mb-4">✓ {fileB.name}</p>
                            <Button onClick={() => setFileB(null)} variant="outline">
                                REMOVE
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <Loader variant="pulse" />
                    </div>
                ) : (
                    <Button
                        onClick={handleProcess}
                        disabled={!canProcess}
                        className="w-full md:w-auto px-12"
                    >
                        {canProcess ? 'PROCESS & DOWNLOAD' : 'UPLOAD BOTH FILES TO CONTINUE'}
                    </Button>
                )}
            </div>

            <div className="mt-8 p-6 border-4 border-foreground bg-muted">
                <h3 className="text-lg mb-2">[ HOW IT WORKS ]</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm opacity-70">
                    <li>Upload your unformatted document (File A)</li>
                    <li>Upload a properly formatted document as template (File B)</li>
                    <li>Click "PROCESS & DOWNLOAD" to apply formatting</li>
                    <li>Download your formatted document as "A_formatted.docx"</li>
                </ol>
            </div>
        </div>
    );
}
