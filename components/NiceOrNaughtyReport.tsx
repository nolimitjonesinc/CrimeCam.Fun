'use client';

type Section = { title: string; content: string };

function parseSections(text: string): Section[] {
  const headerRegex = /(Case ID:|Subject Assessment:|Infractions Detected:|Evidence Summary:|Final Ruling & Justification:|Final Ruling:)/gi;
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
    let title = cur.titleRaw.trim();
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
    <div className="relative max-w-3xl mx-auto">
      {/* Professional Report Card */}
      <div className="bg-white border-4 border-neutral-800 shadow-xl">
        {/* Header - School Letterhead Style */}
        <div className="bg-gradient-to-r from-red-700 to-green-700 text-white p-6 border-b-4 border-neutral-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-wide uppercase" style={{ fontFamily: 'Georgia, serif' }}>
              North Pole Behavioral Academy
            </h1>
            <p className="text-sm mt-1 opacity-90">Naughty/Nice Bureau - Est. 1823</p>
            <p className="text-xs mt-0.5 opacity-75">Official Holiday Compliance Assessment</p>
          </div>
        </div>

        {/* Student Info Bar */}
        <div className="bg-neutral-100 border-b-2 border-neutral-300 px-6 py-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-neutral-600">Academic Year:</span>
            <span className="ml-2 text-neutral-900">2024-2025</span>
          </div>
          <div className="text-right">
            {sections.find(s => s.title.toLowerCase().includes('case id')) && (
              <div>
                <span className="font-semibold text-neutral-600">Student ID:</span>
                <span className="ml-2 text-neutral-900 font-mono text-xs">
                  {sections.find(s => s.title.toLowerCase().includes('case id'))?.content}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Report Card Body */}
        <div className="p-8 space-y-6">
          {/* Overall Grade - Big and Bold */}
          <div className="text-center py-6 bg-neutral-50 border-2 border-neutral-300 rounded">
            <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide mb-2">Final Grade</p>
            <div
              className="text-6xl font-black inline-block px-8 py-3 rounded-lg"
              style={{
                backgroundColor: isNaughty ? '#FEE2E2' : '#D1FAE5',
                color: isNaughty ? '#991B1B' : '#065F46',
                border: `3px solid ${isNaughty ? '#991B1B' : '#065F46'}`,
              }}
            >
              {isNaughty ? 'NAUGHTY' : isNice ? 'NICE' : 'PROBATION'}
            </div>
          </div>

          {/* Subject Assessment */}
          {sections.find(s => s.title.toLowerCase().includes('subject assessment')) && (
            <div className="border-l-4 border-blue-600 pl-4 py-2">
              <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide mb-2">
                Teacher Comments
              </h3>
              <p className="text-base text-neutral-800 leading-relaxed">
                {sections.find(s => s.title.toLowerCase().includes('subject assessment'))?.content}
              </p>
            </div>
          )}

          {/* Infractions - Graded Format */}
          {sections.find(s => s.title.toLowerCase().includes('infractions')) && (
            <div>
              <div className="bg-neutral-800 text-white px-4 py-2 mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wide">Behavioral Infractions</h3>
              </div>
              <div className="space-y-3">
                {sections.find(s => s.title.toLowerCase().includes('infractions'))?.content.split('\n').filter(line => line.trim().startsWith('-')).map((line, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-neutral-200 pb-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <p className="text-sm text-neutral-800 pt-1 flex-1">
                      {line.replace(/^-\s*/, '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Summary */}
          {sections.find(s => s.title.toLowerCase().includes('evidence')) && (
            <div className="border-l-4 border-amber-500 pl-4 py-2">
              <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide mb-2">
                Observational Notes
              </h3>
              <p className="text-base text-neutral-800 leading-relaxed">
                {sections.find(s => s.title.toLowerCase().includes('evidence'))?.content}
              </p>
            </div>
          )}

          {/* Final Ruling */}
          {finalSection && (
            <div className="bg-neutral-100 border-2 border-neutral-800 p-5 rounded">
              <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide mb-3">
                Administrator's Final Assessment
              </h3>
              <p className="text-base text-neutral-800 leading-relaxed">
                {finalSection.content}
              </p>
            </div>
          )}

          {/* Signature Block */}
          <div className="border-t-2 border-neutral-300 pt-6 mt-8 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b-2 border-neutral-800 pb-1 mb-2">
                <p className="text-lg font-bold text-neutral-900" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                  Jinglebert Grumpleton
                </p>
              </div>
              <p className="text-xs text-neutral-600 uppercase tracking-wide">Chief Behavioral Officer</p>
              <p className="text-xs text-neutral-500">North Pole Naughty/Nice Bureau</p>
              <p className="text-xs text-neutral-500 italic mt-1">(347 years of service)</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-600 uppercase tracking-wide mb-2">Report Date</p>
              <p className="text-sm font-semibold text-neutral-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <div className="mt-4 inline-block border-2 border-red-600 px-3 py-1 transform rotate-[-3deg]">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Official Document</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stripe */}
        <div className="bg-neutral-800 text-white text-center py-2 text-xs">
          This is an official assessment from Santa's Naughty/Nice Bureau. Keep this on file.
        </div>
      </div>
    </div>
  );
}
