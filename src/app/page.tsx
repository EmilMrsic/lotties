'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useLottie } from 'lottie-react';
import localforage from 'localforage';

export default function Home() {
  const [animationData, setAnimationData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [unsaved, setUnsaved] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [color, setColor] = useState('#ffffff');
  const [selectedLayers, setSelectedLayers] = useState<number[]>([]);
  const [savedAnimations, setSavedAnimations] = useState<
    { id: string; name: string; data: any }[]
  >([]);

  useEffect(() => {
    localforage.getItem<{ id: string; name: string; data: any }[]>(
      'animations'
    ).then((items) => {
      if (items) setSavedAnimations(items);
    });
  }, []);

  useEffect(() => {
    localforage.setItem('animations', savedAnimations);
  }, [savedAnimations]);

  useEffect(() => {
    if (animationData) {
      setWidth(animationData.w);
      setHeight(animationData.h);
      const layers = animationData.layers || [];
      setSelectedLayers(layers.map((_: any, i: number) => i));
    }
  }, [animationData]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (unsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [unsaved]);

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
        setUnsaved(true);
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

  const handleSave = () => {
    if (!animationData) return;
    const name = prompt('Enter a name for this animation');
    if (!name) return;
    const newItem = { id: Date.now().toString(), name, data: animationData };
    setSavedAnimations([...savedAnimations, newItem]);
    setUnsaved(false);
  };

  const handleLoad = (id: string) => {
    const item = savedAnimations.find((s) => s.id === id);
    if (item) {
      setAnimationData(item.data);
      setUnsaved(false);
    }
  };

  const handleDelete = (id: string) => {
    setSavedAnimations(savedAnimations.filter((s) => s.id !== id));
  };

  const handleExport = () => {
    if (!animationData) return;
    const blob = new Blob([JSON.stringify(animationData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(savedAnimations, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animations.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyDimensions = () => {
    if (!animationData) return;
    setAnimationData({ ...animationData, w: width, h: height });
    setUnsaved(true);
  };

  const hexToRgb = (hex: string) => {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  };

  const toggleLayer = (idx: number) => {
    setSelectedLayers((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const applyColor = () => {
    if (!animationData) return;
    const [r, g, b] = hexToRgb(color);
    const updated = JSON.parse(JSON.stringify(animationData));
    updated.layers?.forEach((layer: any, idx: number) => {
      if (!selectedLayers.includes(idx)) return;
      layer.shapes?.forEach((shape: any) => {
        shape.it?.forEach((it: any) => {
          if (it.c && Array.isArray(it.c.k)) {
            it.c.k = [r / 255, g / 255, b / 255, 1];
          }
        });
      });
    });
    setAnimationData(updated);
    setUnsaved(true);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setSavedAnimations(json);
        } else {
          setAnimationData(json);
          setUnsaved(true);
        }
      } catch {
        alert('Invalid import file');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    setError(null);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to generate animation');
      return;
    }
    setAnimationData(data);
    setUnsaved(true);
  };

  const handleEdit = async () => {
    if (!animationData) return;
    setError(null);
    const res = await fetch('/api/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, animation: animationData }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to edit animation');
      return;
    }
    setAnimationData(data);
    setUnsaved(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8 text-center">
      <h1 className="text-2xl font-bold mb-6">Lottie Builder</h1>
      <div className="flex flex-col md:flex-row gap-8 w-full">
        <div className="md:w-2/3 flex flex-col items-center">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-full h-48 border-4 border-dashed border-gray-400 rounded flex items-center justify-center text-gray-600 bg-white mb-4"
          >
            Drag & drop your Lottie .json file here
          </div>
          <input type="file" accept=".json" onChange={handleImport} className="mb-4" />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {animationData && (
            <div className="w-full">{View}</div>
          )}
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="px-3 py-1 bg-blue-500 text-white rounded">Save</button>
            <button onClick={handleExport} className="px-3 py-1 bg-blue-500 text-white rounded">Export</button>
            <button onClick={handleExportAll} className="px-3 py-1 bg-blue-500 text-white rounded">Export All</button>
          </div>
                  Width: {width}
                    type="range"
                    min="50"
                    max="1000"
                    step="10"
                  Height: {height}
                    type="range"
                    min="50"
                    max="1000"
                    step="10"
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {animationData.layers?.map((layer: any, idx: number) => (
                    <label key={idx} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedLayers.includes(idx)}
                        onChange={() => toggleLayer(idx)}
                      />
                      {layer.nm || `Layer ${idx + 1}`}
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                  <button
                    onClick={applyColor}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Apply Color
                  </button>
                </div>
                    onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                    className="border rounded px-2 py-1"
                  />
                </label>
                <button
                  onClick={applyDimensions}
                  className="col-span-2 px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Apply Size
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <button
                  onClick={applyColor}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Apply Color
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2 w-full">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1"
              placeholder="AI prompt"
            />
            <button onClick={handleGenerate} className="px-3 py-1 bg-green-600 text-white rounded">Generate</button>
            <button onClick={handleEdit} className="px-3 py-1 bg-green-600 text-white rounded">Edit</button>
          </div>
        </div>
        <div className="md:w-1/3">
          <h2 className="font-semibold mb-2">Saved Animations</h2>
          <ul className="space-y-2">
            {savedAnimations.map((item) => (
              <li key={item.id} className="flex justify-between items-center bg-white p-2 rounded">
                <span>{item.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleLoad(item.id)} className="text-blue-600">Load</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}