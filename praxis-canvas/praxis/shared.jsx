// praxis/shared.jsx — tokens, logo, patterns, placeholders, sketch wrappers
// Exposed as globals so other Babel script files can use them.

// ─── tokens ───────────────────────────────────────────────────────────────
// Distinctive palettes — moves Praxis away from the typical navy+orange SaaS
// default. Plasma (violet+mint on warm black) is the new canonical brand.
const PALETTES = {
  plasma: {
    bg: '#0A0A14', surface: '#13121F', surfaceAlt: '#1C1A2E', line: '#2A263F',
    text: '#F1EDDF', mute: '#86819F', faint: '#48455A',
    accent: '#8B5CFF',  accent2: '#3EFFA8',
    warn: '#8B5CFF',    ok: '#3EFFA8',
    crit: '#FF5E78',
    name: 'Plasma · Violet & Argon Mint',
  },
  glacier: {
    bg: '#08111A', surface: '#0E1B26', surfaceAlt: '#152633', line: '#1F3142',
    text: '#E8F2F0', mute: '#7A99A4', faint: '#3C5460',
    accent: '#5BE9D6',  accent2: '#FFB36B',
    warn: '#5BE9D6',    ok: '#9AE85A',
    crit: '#FF7066',
    name: 'Glacier · Teal & Apricot',
  },
  bone: {
    bg: '#EFEADB', surface: '#F6F2E6', surfaceAlt: '#E3DDC9', line: '#C9C0A6',
    text: '#1A1812', mute: '#5C5746', faint: '#A89F86',
    accent: '#5A4DFF',  accent2: '#0C3A2E',
    warn: '#5A4DFF',    ok: '#0C3A2E',
    crit: '#C53E2B',
    name: 'Bone · Editorial light',
  },
};

const TYPE_PAIRS = {
  techspace: { display: '"Space Grotesk", sans-serif', body: '"Geist", "Manrope", sans-serif', mono: '"Geist Mono", ui-monospace, monospace', label: 'Space Grotesk + Geist' },
  editorial: { display: '"Instrument Serif", serif', body: '"Geist", "Manrope", sans-serif', mono: '"Geist Mono", ui-monospace, monospace', label: 'Instrument Serif + Geist' },
  monomono:  { display: '"Geist Mono", ui-monospace, monospace', body: '"Geist Mono", ui-monospace, monospace', mono: '"Geist Mono", ui-monospace, monospace', label: 'Geist Mono · all' },
  manrope:   { display: '"Manrope", sans-serif', body: '"Manrope", sans-serif', mono: '"Geist Mono", ui-monospace, monospace', label: 'Manrope · all' },
};

const DENSITIES = { compact: 0.78, comfy: 1.0, spacious: 1.22 };

// ─── theme hook ───────────────────────────────────────────────────────────
function usePraxisTheme(t) {
  const p = PALETTES[t.palette] || PALETTES.plasma;
  const tp = TYPE_PAIRS[t.type] || TYPE_PAIRS.techspace;
  const d = DENSITIES[t.density] || 1;
  const sketch = t.fidelity === 'sketch';
  // sketch mode: force bone palette + caveat overlay
  const eff = sketch ? PALETTES.bone : p;
  return {
    p: eff, tp, d, sketch,
    css: {
      '--p-bg': eff.bg, '--p-surface': eff.surface, '--p-surface-alt': eff.surfaceAlt,
      '--p-line': eff.line, '--p-text': eff.text, '--p-mute': eff.mute, '--p-faint': eff.faint,
      '--p-accent': eff.accent, '--p-accent2': eff.accent2, '--p-warn': eff.warn, '--p-ok': eff.ok,
      '--p-display': sketch ? '"Caveat", "Patrick Hand", cursive' : tp.display,
      '--p-body': sketch ? '"Patrick Hand", "Caveat", cursive' : tp.body,
      '--p-mono': tp.mono,
      '--p-d': d,
    },
  };
}

// ─── Logo · faceted origami burst (3 variants) ───────────────────────────
// Arms are asymmetric kites: each arm = 2 triangle facets sharing the
// center→tip spine, giving a paper-fold / origami look.
const PRAXIS_ARMS = [
  // [angle°, length, halfWidth]
  [ -8,  46, 7 ],   // top
  [ 50,  44, 8 ],   // UPPER-RIGHT — accent arm
  [ 110, 30, 6 ],   // right-down
  [ 172, 40, 7 ],   // bottom
  [ 222, 30, 6 ],   // lower-left
  [ 285, 42, 7 ],   // left
];

function _armPaths(angle, length, halfW, cx = 50, cy = 50) {
  const r = (angle * Math.PI) / 180;
  const dx = Math.sin(r), dy = -Math.cos(r);
  const px = Math.cos(r), py = Math.sin(r);
  const tipX = cx + dx * length, tipY = cy + dy * length;
  const bLx = cx - px * halfW,   bLy = cy - py * halfW;
  const bRx = cx + px * halfW,   bRy = cy + py * halfW;
  return {
    light: `${bLx.toFixed(2)},${bLy.toFixed(2)} ${tipX.toFixed(2)},${tipY.toFixed(2)} ${cx},${cy}`,
    shadow:`${cx},${cy} ${tipX.toFixed(2)},${tipY.toFixed(2)} ${bRx.toFixed(2)},${bRy.toFixed(2)}`,
  };
}

function PraxisMark({ variant = 'origami', size = 48, color, accent, mono = false, accentArm: useAccent = false }) {
  const c = color || 'currentColor';
  const a = accent || color || 'currentColor';

  if (variant === 'origami' || variant === 'flat' || variant === 'outline') {
    // Lightness colors for the 3D facets
    const isLight = (typeof c === 'string') && (c.toLowerCase().startsWith('#f') || c === 'white' || c === '#fff' || c.toLowerCase().startsWith('#e'));
    const lightFace = c;
    const shadowFace = mono ? c : (isLight ? '#A6A2B5' : 'rgba(0,0,0,.22)');
    const accentLight = a;
    const accentShadow = mono ? a : (isLight ? '#A6A2B5' : 'rgba(0,0,0,.22)');

    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
        {PRAXIS_ARMS.map(([ang, len, hw], i) => {
          const { light, shadow } = _armPaths(ang, len, hw);
          const isAccentArm = useAccent && i === 1;
          const lf = isAccentArm ? accentLight : lightFace;
          const sf = isAccentArm ? accentShadow : shadowFace;
          if (variant === 'outline') {
            return (
              <g key={i}>
                <polygon points={light} fill="none" stroke={isAccentArm ? a : c} strokeWidth="1.2" />
                <polygon points={shadow} fill="none" stroke={isAccentArm ? a : c} strokeWidth="1.2" />
              </g>
            );
          }
          if (variant === 'flat') {
            return (
              <g key={i}>
                <polygon points={light} fill={isAccentArm ? a : c} />
                <polygon points={shadow} fill={isAccentArm ? a : c} />
              </g>
            );
          }
          // origami — 3D facets
          return (
            <g key={i}>
              <polygon points={shadow} fill={sf} />
              <polygon points={light} fill={lf} />
            </g>
          );
        })}
      </svg>
    );
  }

  if (variant === 'node') {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
        <g stroke={c} strokeWidth="6" fill="none" strokeLinecap="round">
          <line x1="50" y1="50" x2="18" y2="22" />
          <line x1="50" y1="50" x2="82" y2="30" />
          <line x1="50" y1="50" x2="46" y2="88" />
        </g>
        <circle cx="50" cy="50" r="11" fill={c} />
        <circle cx="18" cy="22" r="7" fill={c} />
        <circle cx="82" cy="30" r="7" fill={a} />
        <circle cx="46" cy="88" r="7" fill={c} />
      </svg>
    );
  }
  return null;
}

function PraxisLockup({ variant, size = 36, color = 'currentColor', accent, font, weight = 600, gap = 12 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap, color }}>
      <PraxisMark variant={variant} size={size} color={color} accent={accent} />
      <span style={{
        fontFamily: font || 'var(--p-display)',
        fontSize: size * 0.82, fontWeight: weight, letterSpacing: '-0.02em', lineHeight: 1,
      }}>Praxis</span>
    </div>
  );
}

// ─── Pattern language ─────────────────────────────────────────────────────
function PatternBg({ kind = 'ribbon', accent = '#246BFF', accent2 = '#7A4CFF', warn = '#FF9A3C', style }) {
  const k = kind;
  if (k === 'none') return null;
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}>
      {k === 'ribbon' && (
        <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="rb1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={accent} stopOpacity="0" />
              <stop offset=".4" stopColor={accent} stopOpacity=".7" />
              <stop offset=".7" stopColor={accent2} stopOpacity=".55" />
              <stop offset="1" stopColor={warn} stopOpacity=".0" />
            </linearGradient>
            <filter id="blur1"><feGaussianBlur stdDeviation="14" /></filter>
          </defs>
          <g filter="url(#blur1)" opacity=".75">
            <path d="M-50 380 Q 250 220 520 320 T 1050 240" stroke="url(#rb1)" strokeWidth="60" fill="none" />
            <path d="M-50 460 Q 300 320 560 400 T 1050 320" stroke={accent2} strokeOpacity=".35" strokeWidth="32" fill="none" />
            <path d="M-50 280 Q 280 160 600 240 T 1050 180" stroke={warn} strokeOpacity=".25" strokeWidth="24" fill="none" />
          </g>
        </svg>
      )}
      {k === 'grid' && (
        <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="gp" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0 L0 0 0 40" stroke="currentColor" strokeOpacity=".10" strokeWidth="1" fill="none"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gp)" />
          <polyline points="0,420 120,400 240,380 360,340 480,360 600,300 720,310 840,260 1000,240"
                    stroke={accent} strokeWidth="2" fill="none" opacity=".85" />
          <polyline points="0,500 120,490 240,480 360,470 480,460 600,450 720,440 840,430 1000,420"
                    stroke={warn} strokeWidth="1.5" fill="none" opacity=".75" />
        </svg>
      )}
      {k === 'dots' && (
        <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="dt" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" fillOpacity=".22"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dt)" />
        </svg>
      )}
      {k === 'aperture' && (
        <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="ap1" cx=".7" cy=".5" r=".7">
              <stop offset="0" stopColor={warn} stopOpacity=".6" />
              <stop offset=".35" stopColor={accent2} stopOpacity=".35" />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#ap1)" />
          <g fill="none" stroke={accent} strokeOpacity=".5">
            {[60, 110, 170, 240, 320].map((r, i) => (
              <circle key={i} cx="720" cy="300" r={r} strokeWidth={i === 0 ? 1.5 : 1} />
            ))}
          </g>
        </svg>
      )}
      {k === 'wave' && (
        <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 30 }).map((_, i) => (
            <path key={i} d={`M0 ${260 + i * 8} Q 250 ${200 + i * 8 + Math.sin(i / 3) * 30} 500 ${250 + i * 8} T 1000 ${260 + i * 8}`}
                  stroke={i % 6 === 0 ? warn : accent} strokeOpacity={0.08 + (i % 6) * 0.04} strokeWidth=".9" fill="none" />
          ))}
        </svg>
      )}
    </div>
  );
}

// ─── Sketch frame: wraps any board to give it a hand-drawn paper feel ─
function SketchFrame({ children, accent = '#C2531E', style }) {
  // Light wobble via SVG turbulence filter applied to children border.
  return (
    <div style={{ position: 'absolute', inset: 0, ...style }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="sk-rough" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </svg>
      <div style={{ position: 'absolute', inset: 0, filter: 'url(#sk-rough)' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Placeholder image slot (low-fi & hi-fi variants) ────────────────────
function ImgSlot({ label, tone = 'dark', accent = '#246BFF', style, w, h, sketch }) {
  // Sketch: dashed b&w with diagonal slashes + label.
  if (sketch) {
    return (
      <div style={{ position: 'relative', background: 'rgba(0,0,0,.04)', border: '1.5px dashed currentColor',
                    color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: w, height: h, ...style, overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', inset: 0 }} width="100%" height="100%" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeOpacity=".25" strokeWidth="1" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeOpacity=".25" strokeWidth="1" />
        </svg>
        <span style={{ fontFamily: 'var(--p-mono)', fontSize: 11, opacity: 0.7, background: 'var(--p-bg)', padding: '2px 6px' }}>
          {label}
        </span>
      </div>
    );
  }
  // Hi-fi: subtle striped placeholder (no fake illustration)
  return (
    <div style={{
      position: 'relative', width: w, height: h, overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, ${tone === 'dark' ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)'} 0 8px, transparent 8px 16px), var(--p-surface)`,
      border: '1px solid var(--p-line)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: 'var(--p-mute)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </span>
    </div>
  );
}

// ─── Sparkline / mini bars ───────────────────────────────────────────────
function Spark({ data, color, w = 200, h = 48, fill }) {
  const max = Math.max(...data), min = Math.min(...data);
  const dx = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * dx},${h - ((v - min) / (max - min || 1)) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {fill && <polygon points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity=".18" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

function MiniBars({ data, color, w = 200, h = 48, gap = 3 }) {
  const max = Math.max(...data);
  const bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {data.map((v, i) => (
        <rect key={i} x={i * (bw + gap)} y={h - (v / max) * h} width={bw} height={(v / max) * h}
              fill={color} opacity={0.45 + (i / data.length) * 0.55} />
      ))}
    </svg>
  );
}

// ─── Board chrome: a captioned frame for each artboard ───────────────────
function Board({ children, theme, num, title, subtitle, accent, sketch }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'var(--p-bg)', color: 'var(--p-text)',
      fontFamily: 'var(--p-body)', ...theme.css, overflow: 'hidden',
    }}>
      {/* Page header — common to brand guide style */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', borderBottom: '1px solid var(--p-line)',
        fontFamily: 'var(--p-mono)', fontSize: 11, color: 'var(--p-mute)', letterSpacing: '.04em',
        textTransform: 'uppercase', zIndex: 5,
      }}>
        <span>{num} · {title}</span>
        <span>{subtitle}</span>
      </div>
      <div style={{ position: 'absolute', top: 40, bottom: 0, left: 0, right: 0 }}>{children}</div>
    </div>
  );
}

// ─── exports ─────────────────────────────────────────────────────────────
Object.assign(window, {
  PALETTES, TYPE_PAIRS, DENSITIES,
  usePraxisTheme, PraxisMark, PraxisLockup, PatternBg, SketchFrame, ImgSlot, Spark, MiniBars, Board,
});
