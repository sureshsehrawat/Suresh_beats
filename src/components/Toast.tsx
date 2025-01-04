import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up">
      {message}
    </div>
  );
}; 