import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Mock detective report for now (replace with OpenAI call)
    const mockReports = [
      "DETECTIVE REPORT #001\n\nWell, well, well... what do we have here? Another 'innocent' photo that's about as subtle as a brick through a window.\n\nEVIDENCE ANALYSIS:\n- Subject appears to be hiding something behind that forced smile\n- Lighting suggests this was taken hastily, probably to cover up something\n- Background shows suspicious activity that would make any detective's eyebrow raise\n\nVERDICT: Highly suspicious. I've seen enough 'candid' photos to know when someone's trying too hard to look natural.\n\nRECOMMENDATION: Keep this one under surveillance. Nobody smiles that much without a reason.",
      
      "DETECTIVE REPORT #002\n\nOh, this is rich. Another 'perfectly normal' photo that screams guilt louder than a car alarm at 3 AM.\n\nCRIME SCENE BREAKDOWN:\n- The composition is too perfect - clearly staged\n- Everyone's trying way too hard to look casual\n- There's definitely something going on just outside the frame\n\nMY PROFESSIONAL OPINION: This photo has more red flags than a communist parade. The subjects are overcompensating harder than a guilty teenager.\n\nSTATUS: Case remains open. This photo raises more questions than it answers.",
      
      "DETECTIVE REPORT #003\n\nGreat, another 'innocent' snapshot that's about as convincing as a three-dollar bill.\n\nFORENSIC FINDINGS:\n- Timing of this photo is suspiciously convenient\n- Body language suggests everyone knows more than they're letting on\n- The setting itself tells a story of barely contained chaos\n\nFINAL ASSESSMENT: This photo is hiding secrets like a teenager hides their browser history. Every pixel screams 'we're up to something.'\n\nNEXT STEPS: Full investigation recommended. Nobody is this photogenic by accident."
    ];

    const randomReport = mockReports[Math.floor(Math.random() * mockReports.length)];

    return NextResponse.json({ report: randomReport });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}