'use client';

type ParsedReport = {
  subject: string;
  settingEvidence: string;
  verdictMeter: string;
  naughtyPercentage: number;
  verdictRationale: string;
  imageClues: string[];
  rapSheet: string[];
  niceDeeds: string[];
  mitigatingFactors: string[];
  gift: string;
  communityService: string;
  paroleCondition: string;
  rightOfAppeal: string;
};

function parseReport(text: string): ParsedReport {
  console.log('🎅 [REPORT CARD] Raw text received:', text);

  // Extract sections using regex
  const subjectMatch = text.match(/Subject:\s*(.+?)(?=\n\n|Setting Evidence:|$)/is);
  const settingMatch = text.match(/Setting Evidence:\s*(.+?)(?=\n\n|Verdict Meter:|$)/is);
  const verdictMeterMatch = text.match(/Verdict Meter:\s*(.+?)(?=\n)/is);
  const percentageMatch = text.match(/Naughty Percentage:\s*(\d+)/i);
  const verdictRationaleMatch = text.match(/Naughty Percentage:.*?\n(.+?)(?=\n\n|Image Clues:|$)/is);

  // Extract bulleted lists - more flexible regex
  const imageCluesMatch = text.match(/Image Clues Santa Noted:\s*([\s\S]*?)(?=\n\n|Alleged 12-Month|$)/i);
  const rapSheetMatch = text.match(/Alleged 12-Month Rap Sheet.*?:\s*([\s\S]*?)(?=\n\n|Nice Deeds|$)/i);
  const niceDeedsMatch = text.match(/Nice Deeds on Record:\s*([\s\S]*?)(?=\n\n|Mitigating Factors|$)/i);
  const mitigatingMatch = text.match(/Mitigating Factors:\s*([\s\S]*?)(?=\n\n|Santa's Sentence|$)/i);

  // Extract sentence parts
  const giftMatch = text.match(/Gift:\s*(.+?)(?=Community Service:|$)/is);
  const communityMatch = text.match(/Community Service:\s*(.+?)(?=Parole Condition:|$)/is);
  const paroleMatch = text.match(/Parole Condition:\s*(.+?)(?=Right of Appeal:|$)/is);
  const appealMatch = text.match(/Right of Appeal:\s*(.+?)$/is);

  // Helper to extract bullet items - handles both - and • and numbers
  const extractBullets = (match: RegExpMatchArray | null): string[] => {
    if (!match) return [];
    const text = match[1];
    // Split by line breaks and extract content after bullets/numbers
    return text
      .split('\n')
      .map(line => line.replace(/^[-•\d.)\s]+/, '').trim())
      .filter(line => line.length > 5); // Ignore very short lines
  };

  const naughtyPercentage = percentageMatch ? parseInt(percentageMatch[1], 10) : 50;

  const parsed: ParsedReport = {
    subject: subjectMatch?.[1]?.trim() || 'The Subject',
    settingEvidence: settingMatch?.[1]?.trim() || '',
    verdictMeter: verdictMeterMatch?.[1]?.trim() || 'NICE ————●——— NAUGHTY',
    naughtyPercentage: Math.min(100, Math.max(0, naughtyPercentage)),
    verdictRationale: verdictRationaleMatch?.[1]?.trim() || '',
    imageClues: extractBullets(imageCluesMatch),
    rapSheet: extractBullets(rapSheetMatch),
    niceDeeds: extractBullets(niceDeedsMatch),
    mitigatingFactors: extractBullets(mitigatingMatch),
    gift: giftMatch?.[1]?.trim() || '',
    communityService: communityMatch?.[1]?.trim() || '',
    paroleCondition: paroleMatch?.[1]?.trim() || '',
    rightOfAppeal: appealMatch?.[1]?.trim() || '',
  };

  console.log('🎅 [REPORT CARD] Parsed report:', parsed);
  return parsed;
}

export function NiceOrNaughtyReport({ text }: { text: string }) {
  const report = parseReport(text);

  // Calculate nice percentage
  const nicePercentage = 100 - report.naughtyPercentage;

  // Determine which is higher
  const isNaughty = report.naughtyPercentage > nicePercentage;
  const isNice = nicePercentage > report.naughtyPercentage;
  const isTied = report.naughtyPercentage === nicePercentage;

  // Determine verdict label based on higher percentage
  let verdictLabel = 'TIED';
  let verdictPercentage = 50;
  let verdictClass = 'PERFECTLY BALANCED';

  if (isNaughty) {
    verdictLabel = 'NAUGHTY';
    verdictPercentage = report.naughtyPercentage;
    if (report.naughtyPercentage >= 81) verdictClass = 'COAL GUARANTEED';
    else if (report.naughtyPercentage >= 61) verdictClass = 'REPEAT OFFENDER';
    else verdictClass = 'NAUGHTY (SLIGHT EDGE)';
  } else if (isNice) {
    verdictLabel = 'NICE';
    verdictPercentage = nicePercentage;
    if (nicePercentage >= 81) verdictClass = 'ANGEL STATUS';
    else if (nicePercentage >= 61) verdictClass = 'NICE (SOLID)';
    else verdictClass = 'NICE (BARELY)';
  }

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Professional Report Card */}
      <div className="bg-white border-4 border-neutral-800 shadow-xl">
        {/* Header - School Letterhead Style */}
        <div className="bg-gradient-to-r from-red-700 to-green-700 text-white p-6 border-b-4 border-neutral-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-wide uppercase" style={{ fontFamily: 'Georgia, serif' }}>
              Santa's Naughty-or-Nice Report
            </h1>
            <p className="text-sm mt-1 opacity-90">North Pole Parole Office - Est. 1823</p>
            <p className="text-xs mt-0.5 opacity-75">Official Behavioral Assessment</p>
          </div>
        </div>

        {/* Subject Info Bar */}
        <div className="bg-neutral-100 border-b-2 border-neutral-300 px-6 py-3">
          <div className="text-center">
            <span className="font-semibold text-neutral-600 text-sm uppercase tracking-wide">Subject: </span>
            <span className="text-neutral-900 font-bold text-lg">{report.subject}</span>
          </div>
        </div>

        {/* Main Report Card Body */}
        <div className="p-8 space-y-6">
          {/* Setting Evidence */}
          {report.settingEvidence && (
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Setting Evidence</h3>
              <p className="text-sm text-blue-900">{report.settingEvidence}</p>
            </div>
          )}

          {/* Verdict Section - Bold Declaration + Visual Bar */}
          <div className="bg-neutral-50 border-4 border-neutral-800 rounded-lg overflow-hidden">
            {/* Verdict Declaration */}
            <div
              className="text-center py-4 px-6 border-b-4 border-neutral-800"
              style={{
                backgroundColor: isNaughty ? '#991B1B' : isNice ? '#065F46' : '#D97706',
              }}
            >
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">Final Verdict</p>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {verdictLabel} ({verdictPercentage}%)
              </h2>
              <p className="text-xs font-semibold text-white/90 uppercase tracking-wide mt-1">
                Classification: {verdictClass}
              </p>
            </div>

            {/* Visual Naughty Severity Bar */}
            <div className="p-6">
              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-3 text-center">
                Naughty Severity Meter
              </p>

              {/* Progress Bar Container */}
              <div className="relative h-8 bg-neutral-200 rounded-full overflow-hidden border-2 border-neutral-800 shadow-inner">
                {/* Red (Naughty) Bar - fills from LEFT based on naughty percentage */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
                  style={{ width: `${report.naughtyPercentage}%` }}
                />

                {/* Green (Nice) Bar - fills from RIGHT based on nice percentage */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-green-600 to-green-500 transition-all duration-500"
                  style={{ width: `${nicePercentage}%` }}
                />

                {/* Labels on top of bar */}
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-bold text-white">
                  <span className="drop-shadow-md">NAUGHTY</span>
                  <span className="drop-shadow-md">NICE</span>
                </div>
              </div>

              {/* Percentage indicator below bar */}
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-red-700 font-semibold">Naughty: {report.naughtyPercentage}%</span>
                <span
                  className="font-bold text-base"
                  style={{ color: isNaughty ? '#991B1B' : isNice ? '#065F46' : '#D97706' }}
                >
                  {verdictLabel}: {verdictPercentage}%
                </span>
                <span className="text-green-700 font-semibold">Nice: {nicePercentage}%</span>
              </div>

              {/* Rationale */}
              {report.verdictRationale && (
                <p className="text-sm text-neutral-700 italic mt-4 text-center border-t border-neutral-300 pt-4">
                  {report.verdictRationale}
                </p>
              )}
            </div>
          </div>

          {/* Image Clues Santa Noted */}
          {report.imageClues.length > 0 && (
            <div>
              <div className="bg-neutral-800 text-white px-4 py-2 mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wide">Image Clues Santa Noted</h3>
              </div>
              <div className="space-y-2">
                {report.imageClues.map((clue, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-neutral-200 pb-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="text-sm text-neutral-800 flex-1">{clue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alleged 12-Month Rap Sheet */}
          {report.rapSheet.length > 0 && (
            <div>
              <div className="bg-red-700 text-white px-4 py-2 mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wide">Alleged 12-Month Rap Sheet (playful, unproven)</h3>
              </div>
              <div className="space-y-2">
                {report.rapSheet.map((crime, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-red-100 pb-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                      {i + 1}
                    </div>
                    <p className="text-sm text-neutral-800 flex-1">{crime}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nice Deeds on Record */}
          {report.niceDeeds.length > 0 && (
            <div>
              <div className="bg-green-700 text-white px-4 py-2 mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wide">Nice Deeds on Record</h3>
              </div>
              <div className="space-y-2">
                {report.niceDeeds.map((deed, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-green-100 pb-2">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    <p className="text-sm text-neutral-800 flex-1">{deed}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mitigating Factors */}
          {report.mitigatingFactors.length > 0 && (
            <div className="border-l-4 border-amber-500 pl-4 py-2">
              <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide mb-3">Mitigating Factors</h3>
              <div className="space-y-2">
                {report.mitigatingFactors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-amber-600">•</span>
                    <p className="text-sm text-neutral-800">{factor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Santa's Sentence */}
          <div className="bg-neutral-100 border-2 border-neutral-800 p-5 rounded">
            <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wide mb-4">Santa's Sentence</h3>
            {report.gift && (
              <div className="mb-3">
                <span className="font-semibold text-neutral-700">Gift:</span>
                <span className="ml-2 text-neutral-900">{report.gift}</span>
              </div>
            )}
            {report.communityService && (
              <div className="mb-3">
                <span className="font-semibold text-neutral-700">Community Service:</span>
                <span className="ml-2 text-neutral-900">{report.communityService}</span>
              </div>
            )}
            {report.paroleCondition && (
              <div>
                <span className="font-semibold text-neutral-700">Parole Condition:</span>
                <span className="ml-2 text-neutral-900">{report.paroleCondition}</span>
              </div>
            )}
          </div>

          {/* Right of Appeal */}
          {report.rightOfAppeal && (
            <div className="bg-blue-50 border-2 border-blue-600 p-4 rounded">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">Right of Appeal</h3>
              <p className="text-sm text-blue-900">{report.rightOfAppeal}</p>
            </div>
          )}

          {/* Signature Block */}
          <div className="border-t-2 border-neutral-300 pt-6 mt-8 grid grid-cols-2 gap-8">
            <div>
              <div className="border-b-2 border-neutral-800 pb-1 mb-2">
                <p className="text-lg font-bold text-neutral-900" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                  Officer Jinglebert
                </p>
              </div>
              <p className="text-xs text-neutral-600 uppercase tracking-wide">Santa's Parole Officer</p>
              <p className="text-xs text-neutral-500">North Pole Behavioral Compliance Unit</p>
              <p className="text-xs text-neutral-500 italic mt-1">(347 years on the beat)</p>
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
          Official Assessment - North Pole Parole Office. Appeal within 30 days.
        </div>
      </div>
    </div>
  );
}
