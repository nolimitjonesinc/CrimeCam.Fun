'use client';

import { useState } from 'react';

type Person = {
  number: number;
  archetype: string;
  traits: string[];
  evidence: string;
};

function parseGroupRoast(text: string): Person[] {
  const people: Person[] = [];

  // Split by "Person #" but keep the delimiter
  const personBlocks = text.split(/(?=Person #\d+)/i);

  personBlocks.forEach(block => {
    if (!block.trim()) return;

    // Extract person number and archetype
    const headerMatch = block.match(/Person #(\d+)\s*[-–—]\s*(.+?)(?:\n|$)/i);
    if (!headerMatch) return;

    const number = parseInt(headerMatch[1], 10);
    const archetype = headerMatch[2].trim();

    // Extract traits (lines starting with -)
    const traitMatches = block.match(/^-\s*(.+)$/gm);
    const traits = traitMatches ? traitMatches.map(t => t.replace(/^-\s*/, '').trim()) : [];

    // Extract evidence
    const evidenceMatch = block.match(/Evidence in Action:\s*(.+?)(?=\n\n|Person #|$)/is);
    const evidence = evidenceMatch ? evidenceMatch[1].trim() : '';

    if (number && archetype) {
      people.push({ number, archetype, traits, evidence });
    }
  });

  return people;
}

export function GroupRoastCarousel({ text }: { text: string }) {
  const people = parseGroupRoast(text);
  const [currentIndex, setCurrentIndex] = useState(0);

  // If parsing failed or no people found, just show raw text
  if (people.length === 0) {
    return (
      <div className="whitespace-pre-wrap leading-7 text-[15px]">
        {text}
      </div>
    );
  }

  const current = people[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < people.length - 1;

  const goNext = () => {
    if (hasNext) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (hasPrev) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="space-y-5">
      {/* Navigation dots */}
      <div className="flex justify-center gap-2.5 pb-2">
        {people.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 bg-crime-red shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : 'w-2 bg-neutral-600 hover:bg-neutral-500 hover:scale-125'
            }`}
            aria-label={`Go to person ${idx + 1}`}
          />
        ))}
      </div>

      {/* Person card */}
      <div className="card p-6 min-h-[300px] flex flex-col">
        {/* Header */}
        <div className="pb-5 border-b border-crime-border/50">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Person #{current.number}</div>
          <h3 className="text-xl font-bold mt-1 tracking-tight text-neutral-50 leading-tight">{current.archetype}</h3>
        </div>

        {/* Traits */}
        <div className="flex-1 py-5 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wide">Traits</h4>
            <ul className="space-y-3">
              {current.traits.map((trait, idx) => (
                <li key={idx} className="text-[15px] leading-relaxed pl-4 border-l-2 border-crime-red/40 text-neutral-200 transition-all hover:border-crime-red hover:pl-5">
                  {trait}
                </li>
              ))}
            </ul>
          </div>

          {/* Evidence */}
          {current.evidence && (
            <div>
              <h4 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wide">Evidence in Action</h4>
              <p className="text-[15px] leading-relaxed text-neutral-200 bg-black/30 p-3 rounded-lg border border-crime-border/30">
                {current.evidence}
              </p>
            </div>
          )}
        </div>

        {/* Counter */}
        <div className="pt-4 border-t border-crime-border/50 text-center text-sm font-medium text-neutral-400">
          {currentIndex + 1} of {people.length}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={goPrev}
          disabled={!hasPrev}
          className="btn btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          onClick={goNext}
          disabled={!hasNext}
          className="btn btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
