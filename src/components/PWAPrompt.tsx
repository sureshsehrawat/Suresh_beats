import React, { useState, useEffect } from 'react';

export const PWAPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if the prompt has been shown before
    const hasShownPrompt = localStorage.getItem('pwa-prompt-shown');
    
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!hasShownPrompt && !isStandalone) {
      // Show prompt after 2 seconds
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-shown', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gray-900 rounded-lg p-4 shadow-lg z-50 border border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Install Music App</h3>
          <p className="text-gray-300 text-sm">
            Add this app to your home screen for the best experience.
          </p>
          <div className="mt-3 text-sm text-gray-400">
            Tap <span className="text-white">Share</span> and then{' '}
            <span className="text-white">Add to Home Screen</span>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}; 