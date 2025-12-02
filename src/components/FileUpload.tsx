'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  className?: string;
  accept?: string;
}

export function FileUpload({ onFileUpload, className, accept }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  // Default accept types
  const defaultAccept = {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  };

  // Custom accept for .docx files
  const docxAccept = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept === '.docx' ? docxAccept : defaultAccept,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed bg-background p-12 text-center cursor-pointer',
        isDragActive && 'border-primary',
        className
      )}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here ...</p>
      ) : (
        <p>Drag 'n' drop a file here, or click to select one</p>
      )}
    </div>
  );
}
