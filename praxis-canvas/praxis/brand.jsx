// praxis/brand.jsx — brand guideline boards
// Six boards: hero, primary logo, construction, typography, colors, pattern.

const { PraxisMark, PraxisLockup, PatternBg, ImgSlot, Board } = window;

function BrandHero({ theme, t }) {
  const { p, sketch } = theme;
  return (
    <Board theme={theme} num="01" title="Brand Hero" subtitle="Praxis Brand Guidelines · v1.0">
      <div style={{ position: 'relative', height: '100%' }}>
        <PatternBg kind={t.pattern} accent={p.accent} accent2={p.accent2} warn={p.signal} />
        <div style={{ position: 'absolute', left: 56, top: 88, right: 56, color: p.text, zIndex: 2 }}>
          <PraxisLockup variant={t.logoVariant} size={88} color={p.text} accent={p.text} weight={500} />
          <div style={{ marginTop: 56, fontFamily: 'var(--p-display)', fontSize: 120,
                        lineHeight: 0.92, letterSpacing: '-0.04em', fontWeight: 500,
                        maxWidth: 760, textWrap: 'balance' }}>
            Forward&#8209;deployed<br/>operational<br/>intelligence.
          </div>
          <div style={{ marginTop: 28, height: 2, width: 96, background: p.signal }} />
          <div style={{ marginTop: 22, fontFamily: 'var(--p-mono)', fontSize: 13, color: p.mute,
                        textTransform: 'uppercase', letterSpacing: '.12em' }}>
            Brand guidelines · 2026 · v1.0
          </div>
        </div>
      </div>
    </Board>
  );
}

function BrandLogo({ theme, t }) {
  const { p, sketch } = theme;
  const Cell = ({ children, label, style }) => (
    <div style={{ position: 'relative', border: `1px solid ${p.line}`, padding: 32,
                  background: p.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      {children}
      <span style={{ position: 'absolute', top: 8, left: 10, fontFamily: 'var(--p-mono)', fontSize: 10,
                     color: p.mute, textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</span>
    </div>
  );
  return (
    <Board theme={theme} num="02" title="Primary Logo" subtitle="Lockups & marks">
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', height: '100%', gap: 0 }}>
        <Cell label="Primary lockup" style={{ borderRight: `1px solid ${p.line}` }}>
          <PraxisLockup variant={t.logoVariant} size={110} color={p.text} accent={p.text} weight={500} />
        </Cell>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr' }}>
          <Cell label="Icon mark">
            <PraxisMark variant={t.logoVariant} size={84} color={p.text} accent={p.text} />
          </Cell>
          <Cell label="Mono — light on dark" style={{ background: p.bg, borderTop: `1px solid ${p.line}` }}>
            <PraxisLockup variant={t.logoVariant} size={60} color={p.text} accent={p.text} weight={500} />
          </Cell>
          <Cell label="Mono — dark on light" style={{ background: p.text, color: p.bg, borderTop: `1px solid ${p.line}` }}>
            <PraxisLockup variant={t.logoVariant} size={60} color={p.bg} accent={p.bg} weight={500} />
          </Cell>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 24, bottom: 18, right: 24,
                    fontFamily: 'var(--p-body)', fontSize: 13, color: p.mute, lineHeight: 1.5, maxWidth: 540 }}>
        The Praxis mark is a six-point radial form converging on a center node — focus, deployment, and intelligence in motion. Mono-first execution keeps the mark credible across light, dark, and high-density product surfaces.
      </div>
    </Board>
  );
}

function BrandConstruction({ theme, t }) {
  const { p } = theme;
  return (
    <Board theme={theme} num="03" title="Logo Construction & Clearspace" subtitle="Geometry, grid, minimum size">
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', height: '100%' }}>
        {/* Left — clearspace */}
        <div style={{ padding: 36, borderRight: `1px solid ${p.line}`, position: 'relative' }}>
          <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute,
                        textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16 }}>Clearspace</div>
          <div style={{ fontSize: 13, color: p.mute, lineHeight: 1.6, marginBottom: 30, maxWidth: 320 }}>
            Maintain a minimum clearspace around the logo equal to the height of the &ldquo;x&rdquo; in Praxis. This space is sacred — no text, imagery or graphic elements may enter it.
          </div>
          <div style={{ position: 'relative', display: 'inline-flex', padding: 36,
                        border: `1px dashed ${p.line}`, background: p.surface }}>
            {/* corner x marks */}
            {[[0,0],[1,0],[0,1],[1,1]].map(([x,y],i)=>(
              <span key={i} style={{ position: 'absolute', [x?'right':'left']: -6, [y?'bottom':'top']: -6,
                                     fontFamily: 'var(--p-mono)', fontSize: 14, color: p.signal }}>x</span>
            ))}
            <PraxisLockup variant={t.logoVariant} size={64} color={p.text} accent={p.text} weight={500} />
          </div>
          <div style={{ marginTop: 40 }}>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute,
                          textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>Minimum size</div>
            <div style={{ display: 'flex', gap: 36, alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'center' }}>
                <PraxisLockup variant={t.logoVariant} size={24} color={p.text} accent={p.text} weight={500} />
                <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, marginTop: 8 }}>24px lockup</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <PraxisMark variant={t.logoVariant} size={16} color={p.text} accent={p.text} />
                <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, marginTop: 8 }}>16px mark</div>
              </div>
            </div>
          </div>
        </div>
        {/* Right — construction grid */}
        <div style={{ padding: 36, position: 'relative' }}>
          <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute,
                        textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16 }}>Construction</div>
          <div style={{ fontSize: 13, color: p.mute, lineHeight: 1.6, marginBottom: 26, maxWidth: 320 }}>
            Built on a 12-point radial geometry. Six diamond rays at 60° intervals converge on a unit-1 center node, creating balance and forward momentum.
          </div>
          <div style={{ position: 'relative', width: 280, height: 280, margin: '20px auto 0' }}>
            <svg viewBox="-50 -50 100 100" width="280" height="280" style={{ position: 'absolute', inset: 0 }}>
              <g stroke={p.faint} strokeWidth=".4" fill="none">
                <circle r="48" /><circle r="36" /><circle r="22" /><circle r="6" />
                {Array.from({ length: 12 }).map((_, i) => (
                  <line key={i} x1="0" y1="0" x2={Math.cos((i / 12) * Math.PI * 2) * 48}
                        y2={Math.sin((i / 12) * Math.PI * 2) * 48} />
                ))}
              </g>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PraxisMark variant={t.logoVariant} size={160} color={p.text} accent={p.text} />
            </div>
          </div>
        </div>
      </div>
    </Board>
  );
}

function BrandTypography({ theme, t }) {
  const { p, tp } = theme;
  return (
    <Board theme={theme} num="04" title="Typography" subtitle={`Display · ${tp.label.split(' + ')[0]}  |  Body · ${tp.label.split(' + ')[1] || tp.label}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', height: '100%' }}>
        <div style={{ padding: '48px 48px', borderRight: `1px solid ${p.line}` }}>
          <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute,
                        textTransform: 'uppercase', letterSpacing: '.14em' }}>Display typeface</div>
          <div style={{ fontFamily: 'var(--p-display)', fontSize: 120, lineHeight: 0.92,
                        letterSpacing: '-0.035em', fontWeight: 500, marginTop: 20, color: p.text }}>
            Intelligence<br/>in motion.
          </div>
          <div style={{ fontFamily: 'var(--p-body)', fontSize: 18, color: p.mute, marginTop: 26, maxWidth: 460, lineHeight: 1.45 }}>
            Praxis delivers operational clarity at the speed of today&rsquo;s world. The display face leads — confident, structured, with humanist warmth.
          </div>
        </div>
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--p-display)', fontSize: 32, fontWeight: 500 }}>{tp.label.split(' + ')[0]}</div>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, marginTop: 4 }}>DISPLAY · LIGHT · REGULAR · MEDIUM · BOLD</div>
            <div style={{ fontFamily: 'var(--p-display)', fontSize: 15, color: p.text, marginTop: 12, lineHeight: 1.5 }}>
              Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn<br/>
              Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz<br/>
              0123456789 ! @ # $ % &amp; * ( ) _ +
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${p.line}`, paddingTop: 22 }}>
            <div style={{ fontFamily: 'var(--p-body)', fontSize: 24, fontWeight: 600 }}>{tp.label.split(' + ')[1] || 'Body'}</div>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, marginTop: 4 }}>UI / BODY · REGULAR · MEDIUM · BOLD</div>
            <div style={{ fontFamily: 'var(--p-body)', fontSize: 13, color: p.text, marginTop: 12, lineHeight: 1.5 }}>
              Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz<br/>
              0123456789 ! @ # $ % &amp; * ( ) _ +
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${p.line}`, paddingTop: 22 }}>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 18, fontWeight: 500 }}>Geist Mono</div>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, marginTop: 4 }}>LABELS · DATA · CODE</div>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 11, color: p.text, marginTop: 10, lineHeight: 1.55, letterSpacing: '.02em' }}>
              EVIDENCE_TRUST · 0.82  |  PRIORITY · 0.74<br/>
              RUN_ID · pxs_GA-PRINT-GPO-042
            </div>
          </div>
        </div>
      </div>
    </Board>
  );
}

function BrandColors({ theme }) {
  const { p } = theme;
  const swatches = [
    { name: 'Obsidian',       hex: '#0A0A14', group: 'Foundation' },
    { name: 'Onyx',           hex: '#13121F', group: 'Foundation' },
    { name: 'Mineral',        hex: '#1C1A2E', group: 'Foundation' },
    { name: 'Plasma Violet',  hex: '#8B5CFF', group: 'Signal' },
    { name: 'Argon Mint',     hex: '#3EFFA8', group: 'Signal' },
    { name: 'Iron',           hex: '#48455A', group: 'Neutral' },
    { name: 'Bone',           hex: '#F1EDDF', group: 'Neutral' },
  ];
  return (
    <Board theme={theme} num="05" title="Brand Colors" subtitle="Foundation · Signal · Neutral">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '36px 48px 18px', maxWidth: 720, color: p.mute, fontSize: 13, lineHeight: 1.6 }}>
          The Praxis palette grounds operations in warm-black mineral surfaces and reserves chromatic signal for moments of decision. Plasma Violet carries primary intent; Argon Mint marks success, ground-truth, and confirmation. The two together are intentional — rarely paired in operational software.
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, margin: '0 24px 24px',
                      border: `1px solid ${p.line}` }}>
          {swatches.map((s, i) => (
            <div key={s.name} style={{
              position: 'relative', background: s.hex,
              color: ['#F1EDDF','#3EFFA8'].includes(s.hex) ? '#0A0A14' : '#F1EDDF',
              padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              borderRight: i < 6 ? `1px solid ${p.line}` : 'none',
            }}>
              <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, opacity: .6, letterSpacing: '.1em', textTransform: 'uppercase' }}>0{i + 1}</div>
              <div>
                <div style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500, lineHeight: 1.15 }}>{s.name}</div>
                <div style={{ fontFamily: 'var(--p-mono)', fontSize: 11, opacity: .8, marginTop: 8 }}>{s.hex}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 24px 22px', fontFamily: 'var(--p-mono)',
                      fontSize: 10, color: p.mute, textTransform: 'uppercase', letterSpacing: '.12em' }}>
          <span>← Foundation →</span>
          <span style={{ color: '#8B5CFF' }}>← Signal →</span>
          <span>Neutral</span>
        </div>
      </div>
    </Board>
  );
}

function BrandPattern({ theme, t }) {
  const { p, sketch } = theme;
  const patterns = [
    { kind: 'ribbon',   name: 'Spectral Ribbons',  desc: 'Flowing light trails that convey speed, data streams and trajectories.' },
    { kind: 'aperture', name: 'Aperture Curves',   desc: 'Converging arcs that suggest focus, convergence and action.' },
    { kind: 'grid',     name: 'Light Topography',  desc: 'Elevated contours that map signal intensity and terrain.' },
    { kind: 'wave',     name: 'Wave Fields',       desc: 'Rhythmic fields of energy that imply signal and frequency.' },
    { kind: 'dots',     name: 'Static Interference',desc:'No badged noise patterns that add texture and tension.' },
  ];
  return (
    <Board theme={theme} num="06" title="Pattern & Motion Language" subtitle="Five visual primitives for surface and rhythm">
      <div style={{ padding: '20px 24px 0', color: p.mute, fontSize: 13, lineHeight: 1.55, maxWidth: 720 }}>
        Praxis treats motion as material. Every pattern is one of five primitives — never decorative, always conveying a property of the system underneath.
      </div>
      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, height: 'calc(100% - 80px)' }}>
        {patterns.map(({ kind, name, desc }) => (
          <div key={kind} style={{ background: p.surface, border: `1px solid ${p.line}`, position: 'relative',
                                   display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', flex: 1, color: p.text, overflow: 'hidden' }}>
              <PatternBg kind={kind} accent={p.accent} accent2={p.accent2} warn={p.signal} />
            </div>
            <div style={{ padding: 14, borderTop: `1px solid ${p.line}`, color: p.text }}>
              <div style={{ fontFamily: 'var(--p-display)', fontSize: 17, fontWeight: 500 }}>{name}</div>
              <div style={{ fontSize: 11, color: p.mute, marginTop: 6, lineHeight: 1.45 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Board>
  );
}

Object.assign(window, { BrandHero, BrandLogo, BrandConstruction, BrandTypography, BrandColors, BrandPattern });
