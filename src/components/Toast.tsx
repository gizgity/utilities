'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-primary text-secondary p-4 border-2 border-primary shadow-retro-3d">
      <p>{message}</p>
      <button onClick={onClose} className="absolute top-1 right-2 text-secondary">X</button>
    </div>
  );
}
