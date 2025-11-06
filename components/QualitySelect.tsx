'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ModelQuality, ModelConfig } from '@/lib/providers';
import { MODEL_CONFIGS } from '@/lib/providers';

interface QualitySelectProps {
  value: ModelQuality;
  onChange: (quality: ModelQuality) => void;
  availableQualities?: ModelQuality[];
}

// SVG icons for each quality level
const qualityIcons: Record<ModelQuality, JSX.Element> = {
  speed: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  balanced: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M2 12h20" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  premium: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  auto: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v6m0 4v10M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  )
};

// Background patterns for each quality
const qualityPatterns: Record<ModelQuality, string> = {
  speed: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(34, 197, 94, 0.05) 10px, rgba(34, 197, 94, 0.05) 20px)',
  balanced: 'repeating-linear-gradient(60deg, transparent, transparent 15px, rgba(59, 130, 246, 0.05) 15px, rgba(59, 130, 246, 0.05) 30px)',
  premium: 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(168, 85, 247, 0.05) 12px, rgba(168, 85, 247, 0.05) 24px)',
  auto: 'conic-gradient(from 180deg at 50% 50%, rgba(99, 102, 241, 0.03) 0deg, rgba(168, 85, 247, 0.03) 90deg, rgba(59, 130, 246, 0.03) 180deg, rgba(34, 197, 94, 0.03) 270deg, rgba(99, 102, 241, 0.03) 360deg)'
};

// Gradient colors for each quality
const qualityGradients: Record<ModelQuality, string> = {
  speed: 'from-green-500/20 to-emerald-600/20',
  balanced: 'from-blue-500/20 to-cyan-600/20',
  premium: 'from-purple-500/20 to-pink-600/20',
  auto: 'from-indigo-500/20 to-purple-600/20'
};

// Text colors for each quality
const qualityColors: Record<ModelQuality, string> = {
  speed: 'text-green-600 dark:text-green-400',
  balanced: 'text-blue-600 dark:text-blue-400',
  premium: 'text-purple-600 dark:text-purple-400',
  auto: 'text-indigo-600 dark:text-indigo-400'
};

export default function QualitySelect({ value, onChange, availableQualities }: QualitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredQuality, setHoveredQuality] = useState<ModelQuality | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const qualities: ModelQuality[] = availableQualities || ['auto', 'speed', 'balanced', 'premium'];
  const selectedConfig = MODEL_CONFIGS[value];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent, quality: ModelQuality) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(quality);
      setIsOpen(false);
    }
  };

  const previewConfig = hoveredQuality ? MODEL_CONFIGS[hoveredQuality] : selectedConfig;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center gap-2 px-4 py-2.5
          bg-gradient-to-br ${qualityGradients[value]}
          border border-gray-300 dark:border-gray-700
          rounded-xl transition-all duration-300
          hover:shadow-lg hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        `}
        style={{ background: qualityPatterns[value] }}
      >
        <span className={qualityColors[value]}>{qualityIcons[value]}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {selectedConfig.displayName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile/Tablet dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden absolute z-50 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-2">
                {qualities.map((quality) => {
                  const config = MODEL_CONFIGS[quality];
                  return (
                    <button
                      key={quality}
                      onClick={() => {
                        onChange(quality);
                        setIsOpen(false);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, quality)}
                      onMouseEnter={() => setHoveredQuality(quality)}
                      onMouseLeave={() => setHoveredQuality(null)}
                      className={`
                        w-full text-left p-3 rounded-lg
                        transition-all duration-200
                        ${value === quality
                          ? `bg-gradient-to-br ${qualityGradients[quality]} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-gray-400`
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                        focus:outline-none focus:ring-2 focus:ring-indigo-500
                      `}
                      style={{
                        background: value === quality ? qualityPatterns[quality] : undefined
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 ${qualityColors[quality]}`}>
                          {qualityIcons[quality]}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {config.displayName}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {config.description}
                          </div>
                          <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Speed:</span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-3 rounded-sm ${
                                      i < Math.ceil(config.relativeSpeed / 3.3)
                                        ? 'bg-green-500'
                                        : 'bg-gray-300 dark:bg-gray-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Cost:</span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-3 rounded-sm ${
                                      i < Math.ceil(config.relativeCost / 3.3)
                                        ? 'bg-yellow-500'
                                        : 'bg-gray-300 dark:bg-gray-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        {value === quality && (
                          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Info section */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="font-medium mb-1">Provider Info:</div>
                  <div className="space-y-0.5">
                    <div>• Speed/Auto: OpenAI GPT models</div>
                    <div>• Balanced/Premium: Anthropic Claude</div>
                    <div>• Temperature controlled by Spice level</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Desktop side-by-side layout */}
            <div className="hidden lg:flex fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/20" onClick={() => setIsOpen(false)} />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative flex mx-auto my-auto max-w-5xl"
              >
                {/* Options panel */}
                <div className="w-80 bg-white dark:bg-gray-900 rounded-l-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quality Settings</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose AI model quality</p>
                  </div>

                  <div className="p-3">
                    {qualities.map((quality) => {
                      const config = MODEL_CONFIGS[quality];
                      return (
                        <button
                          key={quality}
                          onClick={() => {
                            onChange(quality);
                            setIsOpen(false);
                          }}
                          onKeyDown={(e) => handleKeyDown(e, quality)}
                          onMouseEnter={() => setHoveredQuality(quality)}
                          onMouseLeave={() => setHoveredQuality(null)}
                          className={`
                            w-full text-left p-3 rounded-lg mb-2
                            transition-all duration-200
                            ${value === quality
                              ? `bg-gradient-to-br ${qualityGradients[quality]} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-gray-400`
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                            focus:outline-none focus:ring-2 focus:ring-indigo-500
                          `}
                          style={{
                            background: value === quality ? qualityPatterns[quality] : undefined
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`mt-0.5 ${qualityColors[quality]}`}>
                              {qualityIcons[quality]}
                            </span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {config.displayName}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                {config.description}
                              </div>
                            </div>
                            {value === quality && (
                              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview panel */}
                <div className="w-96 bg-gray-50 dark:bg-gray-800 rounded-r-xl shadow-2xl border border-l-0 border-gray-200 dark:border-gray-700 p-6">
                  <div className="h-full flex flex-col">
                    <div className="text-center mb-6">
                      <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${qualityGradients[previewConfig.quality]} mb-4`}>
                        <span className={`${qualityColors[previewConfig.quality]} scale-150`}>
                          {qualityIcons[previewConfig.quality]}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {previewConfig.displayName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {previewConfig.description}
                      </p>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Performance</div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Speed</span>
                              <span className="text-gray-900 dark:text-gray-100">
                                {previewConfig.relativeSpeed >= 8 ? 'Very Fast' :
                                 previewConfig.relativeSpeed >= 6 ? 'Fast' :
                                 previewConfig.relativeSpeed >= 4 ? 'Moderate' : 'Slower'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${previewConfig.relativeSpeed * 10}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Cost</span>
                              <span className="text-gray-900 dark:text-gray-100">
                                {previewConfig.relativeCost <= 3 ? 'Low' :
                                 previewConfig.relativeCost <= 6 ? 'Medium' : 'Higher'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${previewConfig.relativeCost * 10}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Technical Details</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Provider</span>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {previewConfig.provider === 'openai' ? 'OpenAI' : 'Anthropic'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Model</span>
                            <span className="text-gray-900 dark:text-gray-100 font-mono text-[10px]">
                              {previewConfig.model}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Max Tokens</span>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {previewConfig.maxTokens.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Temperature Control</span>
                            <span className="text-gray-900 dark:text-gray-100 font-medium">
                              {previewConfig.supportsTemperature ? 'Yes' : 'Via Prompt'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                        {previewConfig.quality === 'auto'
                          ? 'Automatically selects the best available model'
                          : `Optimized for ${previewConfig.quality === 'speed' ? 'quick responses' :
                             previewConfig.quality === 'balanced' ? 'quality & speed' :
                             'maximum quality'}`}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}