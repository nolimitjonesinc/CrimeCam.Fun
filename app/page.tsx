'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileToBase64 } from '@/lib/utils';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setReport(null);

      // Convert to base64
      const base64 = await fileToBase64(file);

      // Send to API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = () => {
    if (report) {
      const shareText = `${report}\n\nAnalyzed at crimescene.fun`;
      
      if (navigator.share) {
        navigator.share({
          text: shareText,
          title: 'Crime Scene Analysis',
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('Report copied to clipboard!');
      }
    }
  };

  const handleNewAnalysis = () => {
    setReport(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-red-500">CRIME SCENE</h1>
          <p className="text-gray-400">Every photo tells a suspicious story</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!report ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {/* Upload Area */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="block w-full p-12 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-red-500 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="text-6xl">[ EVIDENCE ]</div>
                    <div>
                      <p className="text-xl font-semibold">Upload Evidence</p>
                      <p className="text-gray-400 text-sm mt-1">Click to select or take a photo</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Loading State */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                  <p className="mt-4 text-gray-400">Detective analyzing the scene...</p>
                </motion.div>
              )}

              {/* Error State */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Report */}
              <div className="bg-gray-800 rounded-lg p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {report}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleShare}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Share Report
                </button>
                <button
                  onClick={handleNewAnalysis}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  New Analysis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>No evidence is safe from scrutiny</p>
        </motion.div>
      </div>
    </div>
  );
}