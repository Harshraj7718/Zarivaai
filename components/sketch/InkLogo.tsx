/**
 * A small, static version of the footer's ink wordmark: "za" + the lime script "ri" + "va" + orange "ai",
 * with Dot (the logo's orange dot, with a face) above the loop. Letters use the site-wide #ink-head filter.
 * Laid out in the footer's units (font size 200, x-height ≈ 106) so the "ri" path drops straight in.
 */
const RI = "M0 -104 L0 0 M0 -56 C9 -96 36 -106 56 -96 C79 -84 103 -132 97 -160 C92 -184 64 -170 60 -116 C57 -60 54 22 80 44 C91 52 104 47 112 38";

export default function InkLogo({ height = 44, className = "" }: { height?: number; className?: string }) {
  const RI_X = 236, VA_X = 384, AI_X = 612;
  const DOT = { x: RI_X + 104, y: -186 };
  const vb = { x: -8, y: -226, w: 690, h: 300 };
  return (
    <svg className={`ink-logo ${className}`} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} height={height} width={(height * vb.w) / vb.h}
      role="img" aria-label="zariva.ai">
      <g className="ink-logo__word">
        <text x="0" y="0" textLength="222" lengthAdjust="spacingAndGlyphs">za</text>
        <path className="ink-logo__ri" d={RI} transform={`translate(${RI_X} 0)`} />
        <text x={VA_X} y="0" textLength="220" lengthAdjust="spacingAndGlyphs">va</text>
      </g>
      <text className="ink-logo__ai" x={AI_X} y="0">ai</text>
      {/* Dot: the orange dot over the loop, with a little face */}
      <g className="ink-logo__dot" transform={`translate(${DOT.x} ${DOT.y})`}>
        <circle r="19" />
        <circle className="ink-logo__eye" cx="-6" cy="-2" r="2.8" />
        <circle className="ink-logo__eye" cx="6" cy="-2" r="2.8" />
        <path className="ink-logo__smile" d="M-5 6 C-2 9 2 9 5 6" />
      </g>
    </svg>
  );
}
