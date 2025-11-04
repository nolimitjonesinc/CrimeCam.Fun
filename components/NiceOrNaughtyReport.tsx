'use client';

type Section = { title: string; content: string };

function parseSections(text: string): Section[] {
  const headerRegex = /(🎄 Case ID:|👤 Subject Assessment:|🚨 Infractions Detected:|📋 Evidence Summary:|⚖️ Final Ruling & Justification:)/gi;
  const matches: { titleRaw: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(text)) !== null) {
    matches.push({ titleRaw: m[1], index: m.index });
  }
  if (!matches.length) return [{ title: '', content: text.trim() }];

  const sections: Section[] = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const start = cur.index + cur.titleRaw.length;
    const end = next ? next.index : text.length;
    let title = cur.titleRaw.replace(/[🎄👤🚨📋⚖️]/g, '').trim();
    const content = text.slice(start, end).trim();
    sections.push({ title, content });
  }
  return sections;
}

export function NiceOrNaughtyReport({ text }: { text: string }) {
  const sections = parseSections(text);

  // Determine if NAUGHTY or NICE from final ruling
  const finalSection = sections.find(s => s.title.toLowerCase().includes('final ruling'));
  const isNaughty = finalSection?.content.toLowerCase().includes('naughty') || false;
  const isNice = finalSection?.content.toLowerCase().includes('nice') && !isNaughty;

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Sticky Note */}
      <div
        className="sticky-note relative bg-[#FFF740] p-8 shadow-2xl transform rotate-[-1.5deg]"
        style={{
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(200, 200, 200, 0.15) 31px, rgba(200, 200, 200, 0.15) 32px)',
        }}
      >
        {/* Coffee Stain */}
        <div
          className="absolute top-4 right-6 w-16 h-16 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #8B4513 0%, #8B4513 50%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 space-y-4" style={{ fontFamily: "'Caveat', cursive" }}>
          {/* Header scribble */}
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-blue-900">UGH. Another one.</p>
          </div>

          {/* Main verdict - big and bold */}
          <div className="text-center my-6">
            <p className="text-xl text-blue-900 mb-2">This person?</p>
            <p
              className="text-5xl font-black transform rotate-[-2deg] inline-block px-4 py-2"
              style={{
                color: isNaughty ? '#DC2626' : '#059669',
                textDecoration: 'underline',
                textDecorationColor: isNaughty ? '#DC2626' : '#059669',
                textDecorationThickness: '4px',
                textUnderlineOffset: '4px',
              }}
            >
              {isNaughty ? 'NAUGHTY' : isNice ? 'NICE' : 'UNDECIDED'}
            </p>
            <p className="text-lg text-blue-900 mt-2">I don't even need to check the list.</p>
          </div>

          {/* Sections in handwritten style */}
          {sections.map((s, idx) => (
            <div key={idx} className="mb-6">
              {s.title && s.title.toLowerCase().includes('case id') && (
                <div className="text-sm text-blue-700 italic mb-4">
                  {s.content}
                </div>
              )}

              {s.title && s.title.toLowerCase().includes('subject assessment') && (
                <div className="mb-4">
                  <p className="text-xl font-semibold text-blue-900 mb-2">First impression:</p>
                  <p className="text-lg text-blue-800 leading-relaxed">{s.content}</p>
                </div>
              )}

              {s.title && s.title.toLowerCase().includes('infractions') && (
                <div className="mb-4">
                  <p className="text-xl font-semibold text-blue-900 mb-3">Why? Let me count the ways:</p>
                  <div className="space-y-2 text-lg text-blue-800 leading-relaxed">
                    {s.content.split('\n').filter(line => line.trim().startsWith('-')).map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-red-600 font-bold text-xl">{i + 1}.</span>
                        <span>{line.replace(/^-\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {s.title && s.title.toLowerCase().includes('evidence') && (
                <div className="mb-4">
                  <p className="text-xl font-semibold text-blue-900 mb-2">What I see in this photo:</p>
                  <p className="text-lg text-blue-800 leading-relaxed">{s.content}</p>
                </div>
              )}

              {s.title && s.title.toLowerCase().includes('final ruling') && (
                <div className="mb-4 p-4 bg-white/50 rounded-lg transform rotate-[1deg]">
                  <p className="text-xl font-semibold text-blue-900 mb-2">Official verdict:</p>
                  <p className="text-lg text-blue-800 leading-relaxed">{s.content}</p>
                </div>
              )}
            </div>
          ))}

          {/* Signature */}
          <div className="mt-8 text-right">
            <p className="text-lg text-blue-900 italic">I'm so done with this job.</p>
            <p className="text-base text-blue-700 mt-2">- Jinglebert</p>
            <p className="text-sm text-blue-600">(Elf, 347th year)</p>
          </div>

          {/* Small doodle - angry face scribble in corner */}
          <div className="absolute bottom-6 left-6 text-red-600 font-bold" style={{ fontSize: '48px', transform: 'rotate(-12deg)' }}>
            &gt;:(
          </div>
        </div>
      </div>
    </div>
  );
}
