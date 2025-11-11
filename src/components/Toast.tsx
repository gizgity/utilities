'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Auto-close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-retro-green text-retro-black p-4 border-2 border-retro-green shadow-retro-3d">
      <p>{message}</p>
      <button onClick={onClose} className="absolute top-1 right-2 text-retro-black">X</button>
    </div>
  );
}
