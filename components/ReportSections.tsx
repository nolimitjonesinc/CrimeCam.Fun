'use client';

type Section = { title: string; content: string };

function parseSections(text: string): Section[] {
  const headerRegex = /(Crime Scene:|What'?s in the Frame\?|Who'?s in the Frame\?|What Might Have Happened Here:|How This Helps Solve the Crime:|Verdict:)/gi;
  const matches: { titleRaw: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headerRegex.exec(text)) !== null) {
    matches.push({ titleRaw: m[1], index: m.index });
  }
  if (!matches.length) return [{ title: 'Report', content: text.trim() }];

  const sections: Section[] = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const start = cur.index + cur.titleRaw.length;
    const end = next ? next.index : text.length;
    const rawTitle = cur.titleRaw.toLowerCase();
    let title = 'Section';
    if (/crime scene:/.test(rawTitle)) title = 'Crime Scene';
    else if (/(what|who)'?s in the frame\?/.test(rawTitle)) title = "What's in the Frame?";
    else if (/what might have happened here:/.test(rawTitle)) title = 'What Might Have Happened Here';
    else if (/how this helps solve the crime:/.test(rawTitle)) title = 'How This Helps Solve the Crime';
    else if (/verdict:/.test(rawTitle)) title = 'Verdict';
    const content = text.slice(start, end).trim();
    sections.push({ title, content });
  }
  return sections;
}

export function ReportSections({ text }: { text: string }) {
  const sections = parseSections(text);
  return (
    <div className="space-y-8">
      {sections.map((s, idx) => (
        <section key={idx} className="group">
          <h3 className="font-semibold text-[17px] tracking-tight text-neutral-100 mb-3 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-crime-red rounded-full group-hover:h-5 transition-all duration-200" />
            {s.title}
          </h3>
          <p className="leading-[1.75] text-[15px] text-neutral-200 whitespace-pre-wrap tracking-[-0.01em]">
            {s.content}
          </p>
        </section>
      ))}
    </div>
  );
}

