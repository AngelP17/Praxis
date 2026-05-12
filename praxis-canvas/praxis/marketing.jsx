// praxis/marketing.jsx — 3 tonal hero variants for the marketing site
const { PraxisLockup, PraxisMark, PatternBg, ImgSlot, Board } = window;

function MarketingCinematic({ theme, t }) {
  const { p } = theme;
  return (
    <Board theme={theme} num="MKT-01" title="Marketing Hero — Cinematic" subtitle="praxis.dev">
      <div style={{ position: 'relative', height: '100%', background: p.bg }}>
        <PatternBg kind="ribbon" accent={p.accent} accent2={p.accent2} warn={p.warn} />
        {/* nav */}
        <div style={{ position: 'absolute', top: 18, left: 32, right: 32, display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between', zIndex: 3 }}>
          <PraxisLockup variant={t.logoVariant} size={26} color={p.text} accent={p.warn} weight={500} />
          <div style={{ display: 'flex', gap: 22, fontFamily: 'var(--p-mono)', fontSize: 11, color: p.mute,
                        textTransform: 'uppercase', letterSpacing: '.1em' }}>
            <span>Platform</span><span>FieldLab</span><span>Solutions</span><span>Docs</span>
            <span style={{ color: p.text }}>Request demo →</span>
          </div>
        </div>
        {/* hero */}
        <div style={{ position: 'absolute', left: 56, right: 56, top: 110, zIndex: 2, color: p.text }}>
          <div style={{ fontFamily: 'var(--p-mono)', fontSize: 11, color: p.warn, letterSpacing: '.16em',
                        textTransform: 'uppercase' }}>● Forward-deployed v1.0 · GA</div>
          <div style={{ fontFamily: 'var(--p-display)', fontSize: 96, lineHeight: 0.96, letterSpacing: '-0.035em',
                        fontWeight: 500, marginTop: 18, maxWidth: 880, textWrap: 'balance' }}>
            Turn messy operations into an executable decision graph.
          </div>
          <div style={{ fontSize: 16, color: p.mute, marginTop: 22, maxWidth: 540, lineHeight: 1.55 }}>
            Praxis ingests signals from your tickets, telemetry, and tribal knowledge — then deploys explainable decisions, human-approved actions, and replayable audit artifacts. In the field, on day one.
          </div>
          <div style={{ marginTop: 30, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ background: p.warn, color: '#0A0A0F', padding: '12px 22px',
                          fontFamily: 'var(--p-mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Launch FieldLab →
            </div>
            <div style={{ border: `1px solid ${p.line}`, color: p.text, padding: '12px 22px',
                          fontFamily: 'var(--p-mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Watch a 90-sec demo
            </div>
          </div>
        </div>
        {/* trust strip */}
        <div style={{ position: 'absolute', bottom: 24, left: 56, right: 56, display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between',
                      fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                      textTransform: 'uppercase', zIndex: 2 }}>
          <span>Deployed at · 4 plants · 12 GTM teams · 2 SE orgs</span>
          <span style={{ color: p.text }}>SOC 2 · Air-gapped · Local-first</span>
        </div>
      </div>
    </Board>
  );
}

function MarketingTechnical({ theme, t }) {
  const { p } = theme;
  // grid + linework variant, denser, manuals-feel
  return (
    <Board theme={theme} num="MKT-02" title="Marketing Hero — Technical" subtitle="for the operator">
      <div style={{ position: 'relative', height: '100%', background: p.bg, color: p.text }}>
        <PatternBg kind="grid" accent={p.accent} accent2={p.accent2} warn={p.warn} style={{ opacity: 0.7 }} />
        {/* nav */}
        <div style={{ position: 'absolute', top: 18, left: 32, right: 32, display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between', zIndex: 3 }}>
          <PraxisLockup variant={t.logoVariant} size={24} color={p.text} accent={p.warn} weight={500} />
          <div style={{ fontFamily: 'var(--p-mono)', fontSize: 11, color: p.mute, letterSpacing: '.1em',
                        textTransform: 'uppercase' }}>
            v1.0.4 · build 2026.05.12 · sha 9f3a2c
          </div>
        </div>
        {/* split layout */}
        <div style={{ position: 'absolute', top: 80, left: 40, right: 40, bottom: 40,
                      display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 11, color: p.warn,
                          textTransform: 'uppercase', letterSpacing: '.14em' }}>OPERATIONAL_INTELLIGENCE_LAYER</div>
            <div style={{ fontFamily: 'var(--p-display)', fontSize: 72, lineHeight: 0.96,
                          letterSpacing: '-0.025em', fontWeight: 500, marginTop: 20 }}>
              Praxis is the<br/>operating layer<br/>for messy work.
            </div>
            <pre style={{ fontFamily: 'var(--p-mono)', fontSize: 12, color: p.mute, marginTop: 28,
                          lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
{`# pipeline
signal -> adapter -> ontology -> decision
       -> action  -> replay   -> value-case`}
            </pre>
            <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
              <span style={{ background: p.warn, color: p.bg, padding: '10px 18px',
                             fontFamily: 'var(--p-mono)', fontSize: 11, letterSpacing: '.08em',
                             textTransform: 'uppercase' }}>$ praxis init →</span>
              <span style={{ color: p.mute, fontFamily: 'var(--p-mono)', fontSize: 11,
                             alignSelf: 'center', letterSpacing: '.06em' }}>or read the docs</span>
            </div>
          </div>
          {/* right panel — terminal */}
          <div style={{ border: `1px solid ${p.line}`, background: p.surface, padding: 22, fontFamily: 'var(--p-mono)',
                        fontSize: 11.5, color: p.text, lineHeight: 1.65, overflow: 'hidden' }}>
            <div style={{ color: p.mute, fontSize: 10, marginBottom: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              ~/praxis/fieldlab · solution-pack: manufacturing-printer-gpo
            </div>
{[
  ['$ ',                'praxis fieldlab up',                    p.text],
  ['  ',                '↳ floci · localhost:4566 · ready',      p.ok],
  ['$ ',                'praxis ingest sample-events.jsonl',     p.text],
  ['  ',                '↳ 12 events · 4 objects compiled',      p.ok],
  ['$ ',                'praxis decide --explain',               p.text],
  ['  ',                'GA-PRINT-GPO-042 · priority 0.74',      p.warn],
  ['  ',                'evidence_trust 0.82 · review required', p.mute],
  ['$ ',                'praxis readout --emit',                 p.text],
  ['  ',                '↳ executive-readout.md · 1 page',       p.ok],
].map(([pre, line, col], i) => (
  <div key={i}><span style={{ color: p.mute }}>{pre}</span><span style={{ color: col }}>{line}</span></div>
))}
          </div>
        </div>
      </div>
    </Board>
  );
}

function MarketingEditorial({ theme, t }) {
  const { p } = theme;
  return (
    <Board theme={theme} num="MKT-03" title="Marketing Hero — Editorial" subtitle="for the decision-maker">
      <div style={{ position: 'relative', height: '100%', background: p.bg, color: p.text }}>
        {/* hairline rule top */}
        <div style={{ position: 'absolute', top: 70, left: 56, right: 56, borderTop: `1px solid ${p.line}` }} />
        <div style={{ position: 'absolute', top: 22, left: 56, right: 56, display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center' }}>
          <PraxisLockup variant={t.logoVariant} size={22} color={p.text} accent={p.warn} weight={500} />
          <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.18em',
                         textTransform: 'uppercase' }}>Issue 01 · The Operational Quarterly</span>
        </div>

        {/* editorial layout */}
        <div style={{ position: 'absolute', top: 100, left: 56, right: 56, bottom: 56,
                      display: 'grid', gridTemplateColumns: '2.4fr 1fr', gap: 48 }}>
          <div>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.warn, letterSpacing: '.2em',
                          textTransform: 'uppercase' }}>A field manual</div>
            <div style={{ fontFamily: 'var(--p-display)', fontSize: 144, lineHeight: 0.9,
                          letterSpacing: '-0.045em', fontWeight: 500, marginTop: 12,
                          textWrap: 'balance' }}>
              The dashboard is dead.
            </div>
            <div style={{ fontFamily: 'var(--p-display)', fontSize: 26, lineHeight: 1.25, color: p.mute,
                          marginTop: 24, maxWidth: 580, textWrap: 'balance' }}>
              Long live the <em style={{ color: p.warn, fontStyle: 'italic' }}>decision</em>. Praxis turns operational fragmentation — tickets, telemetry, tribal knowledge — into a single executable graph for the people closest to the work.
            </div>
            <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ fontFamily: 'var(--p-mono)', fontSize: 11, color: p.text, padding: '12px 0',
                            borderBottom: `1.5px solid ${p.warn}`, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                Continue reading →
              </div>
              <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.14em',
                             textTransform: 'uppercase' }}>11 min · By the operators</span>
            </div>
          </div>
          <div style={{ borderLeft: `1px solid ${p.line}`, paddingLeft: 28 }}>
            <ImgSlot label="full-bleed product photo" tone="light" w="100%" h={240} />
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.14em',
                          textTransform: 'uppercase', marginTop: 14 }}>In this issue</div>
            <ol style={{ paddingLeft: 18, margin: '12px 0 0', color: p.text, fontSize: 14, lineHeight: 1.7 }}>
              <li>Why dashboards never closed a loop</li>
              <li>FieldLab: a deployment twin</li>
              <li>From signal to readout in 7 minutes</li>
              <li>The economics of an action log</li>
            </ol>
          </div>
        </div>
      </div>
    </Board>
  );
}

Object.assign(window, { MarketingCinematic, MarketingTechnical, MarketingEditorial });
