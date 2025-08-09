'use client';
import { useEffect, useMemo, useState } from 'react';

export function TypewriterText({ text, speed = 12 }: { text: string; speed?: number }) {
  const [out, setOut] = useState('');
  const reduced = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (reduced) { setOut(text); return; }
    setOut('');
    let i = 0; const id = setInterval(() => {
      i += 2; // two chars at a time for speed
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, reduced]);

  return <pre className="typewriter text-sm leading-6">{out}</pre>;
}