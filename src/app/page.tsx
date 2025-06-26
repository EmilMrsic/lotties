'use client';

import React, { useState, useCallback } from 'react';
import { useLottie } from 'lottie-react';

export default function Home() {
  const [animationData, setAnimationData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setError(null);

    const file = event.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith('.json')) {
      setError('Please upload a valid .json Lottie file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json.layers || !json.v || !json.w || !json.h) {
          throw new Error('Not a valid Lottie file.');
        }
        setAnimationData(json);
      } catch (e) {
        setError('Invalid Lottie JSON.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const { View } = useLottie({
    animationData: animationData || {},
    loop: true,
    autoplay: true,
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-bold mb-6">Lottie JSON Preview</h1>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full max-w-md h-48 border-4 border-dashed border-gray-400 rounded flex items-center justify-center text-gray-600 bg-white mb-6"
      >
        Drag & drop your Lottie .json file here
      </div>
      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}
      {animationData && (
        <div className="w-full max-w-md">{View}</div>
      )}
    </div>
  );
}
