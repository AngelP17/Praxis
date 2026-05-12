// praxis-hifi/screens.jsx — proper hi-fi versions of the 3 winning app screens
// at full 1440×900 resolution. Use Plasma palette tokens only.

const HF = {
  bg:        '#0A0A14',
  surface:   '#13121F',
  surfaceAlt:'#1C1A2E',
  line:      '#2A263F',
  hairline:  '#1F1B33',
  text:      '#F1EDDF',
  mute:      '#86819F',
  faint:     '#48455A',
  accent:    '#8B5CFF',  // Plasma Violet
  accent2:   '#3EFFA8',  // Argon Mint
  crit:      '#FF5E78',
};

// shared sparkline/bars (re-implemented here so the hi-fi page is self-contained
// and doesn't lean on wireframe primitives)
function HFSpark({ data, color, w = 200, h = 48, fill, dashed }) {
  const max = Math.max(...data), min = Math.min(...data);
  const dx = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * dx},${h - ((v - min) / (max - min || 1)) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {fill && <polygon points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity=".14" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeDasharray={dashed ? '3 3' : '0'} />
    </svg>
  );
}
function HFBars({ data, color, w = 200, h = 48, gap = 3 }) {
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

// app shell (hi-fi)
function HFShell({ page, children, topbar }) {
  const nav = [
    ['Overview',      'overview'],
    ['Solution Packs','packs'],
    ['FieldLab',      'fieldlab'],
    ['Ontology',      'ontology'],
    ['Decisions',     'decision'],
    ['Discovery',     'discovery'],
    ['Value Case',    'value'],
    ['Expansion',     'expansion'],
    ['Readout',       'readout'],
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '224px 1fr',
                  background: HF.bg, color: HF.text, fontFamily: 'Satoshi, "Geist", sans-serif' }}>
      <div style={{ borderRight: `1px solid ${HF.line}`, background: HF.surface, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <window.PraxisMark variant="origami" size={22} color={HF.text} />
          <span style={{ fontFamily: '"Cabinet Grotesk", Satoshi, sans-serif', fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>Praxis</span>
        </div>
        <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 9.5, color: HF.mute,
                      letterSpacing: '.18em', textTransform: 'uppercase', padding: '8px 20px 10px' }}>Workbench</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {nav.map(([l, id]) => (
            <div key={id} style={{
              padding: '9px 20px', fontSize: 12.5,
              color: id === page ? HF.text : HF.mute,
              borderLeft: id === page ? `2px solid ${HF.accent}` : '2px solid transparent',
              background: id === page ? 'color-mix(in oklch, #8B5CFF 10%, transparent)' : 'transparent',
              fontWeight: id === page ? 500 : 400,
            }}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: 16, borderTop: `1px solid ${HF.line}`,
                      fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 26, height: 26, borderRadius: 999, background: `linear-gradient(135deg, ${HF.accent}, ${HF.accent2})` }} />
            <div>
              <div style={{ color: HF.text, fontFamily: 'Satoshi, sans-serif', fontSize: 12 }}>Ava Chen</div>
              <div style={{ letterSpacing: '.06em' }}>Forward-deployed</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 56, borderBottom: `1px solid ${HF.line}`, display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between', padding: '0 26px' }}>
          {topbar}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
      </div>
    </div>
  );
}

function HFPill({ children, color, bg }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                   border: `1px solid ${color || HF.line}`, color: color || HF.mute, background: bg || 'transparent',
                   fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10.5, letterSpacing: '.06em',
                   textTransform: 'uppercase' }}>
      {children}
    </span>
  );
}

// ── 1. Operational Overview ─────────────────────────────────────────────
function HFOverview() {
  const topbar = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <span style={{ fontFamily: '"Cabinet Grotesk", sans-serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>
          Operational Overview
        </span>
        <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10.5, color: HF.mute, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          Real-time posture · 7 sites · 24 active runs
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <HFPill>Time · 24H ▾</HFPill>
        <HFPill color={HF.accent}>● 3 alerts</HFPill>
        <span style={{ background: HF.accent, color: HF.bg, padding: '8px 16px', fontFamily: '"Geist Mono", ui-monospace, monospace',
                       fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500 }}>Export readout</span>
      </div>
    </>
  );
  const Card = ({ label, value, delta, deltaColor, chart, rowSpan }) => (
    <div style={{ background: HF.surface, border: `1px solid ${HF.line}`, padding: 18,
                  display: 'flex', flexDirection: 'column', gap: 10, gridRow: rowSpan ? `span ${rowSpan}` : 'auto', minHeight: 130 }}>
      <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute,
                    letterSpacing: '.12em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: '"Cabinet Grotesk", sans-serif', fontSize: 38, fontWeight: 500, lineHeight: 1,
                    letterSpacing: '-0.025em' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: deltaColor || HF.mute, letterSpacing: '.06em' }}>{delta}</span>
        {chart}
      </div>
    </div>
  );

  return (
    <HFShell page="overview" topbar={topbar}>
      <div style={{ padding: 26, height: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    gridAutoRows: 'min-content', gap: 14, overflow: 'hidden' }}>
        <Card label="Mission Readiness" value="98.6%" delta="+2.4% vs yesterday" deltaColor={HF.accent2}
              chart={<HFSpark data={[20,22,21,23,25,24,28,27,30,29,32]} color={HF.accent} w={120} h={36} fill />} />
        <Card label="Active Operations" value="24" delta="across 7 theaters"
              chart={<HFBars data={[3,5,4,6,7,6,8,9,7,8,10]} color={HF.accent} w={120} h={36} />} />
        <Card label="Signal Quality" value="93.2%" delta="stable"
              chart={<HFSpark data={[8,9,7,10,9,11,10,12,11,13,12]} color={HF.accent2} w={120} h={36} fill />} />
        <div style={{ background: HF.surface, border: `1px solid ${HF.line}`, padding: 18, gridRow: 'span 2' }}>
          <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute,
                        letterSpacing: '.12em', textTransform: 'uppercase' }}>Alerts · requiring action</div>
          <div style={{ fontFamily: '"Cabinet Grotesk", sans-serif', fontSize: 30, fontWeight: 500, marginTop: 8 }}>3 open</div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Network Anomaly',  'Sector 7B · 02:14',  HF.accent],
              ['Device Offline',   'Unit Bravo-4 · 11m', HF.crit],
              ['Intel Update',     'New threat pattern', HF.accent2],
            ].map(([n,sub,c]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                                     border: `1px solid ${HF.line}`, background: HF.bg }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: c, flex: '0 0 auto', boxShadow: `0 0 12px ${c}` }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{n}</div>
                  <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signal density chart */}
        <div style={{ gridColumn: 'span 3', background: HF.surface, border: `1px solid ${HF.line}`, padding: 18,
                      display: 'flex', flexDirection: 'column', gap: 12, minHeight: 230 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute,
                          letterSpacing: '.12em', textTransform: 'uppercase' }}>Signal density · last 24 h</div>
            <div style={{ display: 'flex', gap: 14, fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute }}>
              <span><span style={{ color: HF.accent }}>■</span> Signals</span>
              <span><span style={{ color: HF.accent2 }}>■</span> Decisions</span>
              <span><span style={{ color: HF.faint }}>■</span> Actions</span>
            </div>
          </div>
          <svg viewBox="0 0 700 210" style={{ width: '100%', height: 210 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={i} x1="0" x2="700" y1={i * 45 + 10} y2={i * 45 + 10} stroke={HF.line} strokeWidth=".6" />
            ))}
            {/* Signal area */}
            <defs>
              <linearGradient id="sigFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={HF.accent} stopOpacity="0.35" />
                <stop offset="1" stopColor={HF.accent} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="decFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={HF.accent2} stopOpacity="0.2" />
                <stop offset="1" stopColor={HF.accent2} stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const pts1 = []; const pts2 = []; const pts3 = [];
              for (let i = 0; i < 25; i++) {
                pts1.push(`${i*28},${120 - Math.sin(i/2.2)*35 - 8 - (i%3)*3}`);
                pts2.push(`${i*28},${150 - Math.sin(i/3)*22 - (i%4)*2}`);
                pts3.push(`${i*28},${175 - Math.sin(i/2.5)*14}`);
              }
              return (
                <g>
                  <polygon points={`0,200 ${pts1.join(' ')} 700,200`} fill="url(#sigFill)" />
                  <polyline points={pts1.join(' ')} fill="none" stroke={HF.accent} strokeWidth="1.6" />
                  <polygon points={`0,200 ${pts2.join(' ')} 700,200`} fill="url(#decFill)" />
                  <polyline points={pts2.join(' ')} fill="none" stroke={HF.accent2} strokeWidth="1.4" />
                  <polyline points={pts3.join(' ')} fill="none" stroke={HF.faint} strokeWidth="1.1" strokeDasharray="3 3" />
                </g>
              );
            })()}
          </svg>
        </div>

        <Card label="Assets Online"  value="1,248" delta="+0.3%"  deltaColor={HF.accent2} />
        <Card label="Incidents"      value="12"    delta="−8%"    deltaColor={HF.accent2} />
        <Card label="Data Ingested"  value="4.7 TB" delta="+18%"  deltaColor={HF.accent} />
        <Card label="Response Time"  value="02:34" delta="+12%"   deltaColor={HF.accent} />
      </div>
    </HFShell>
  );
}

// ── 2. Decision Detail ─────────────────────────────────────────────────
function HFDecision() {
  const components = [
    ['operational_severity',     0.82, .16, HF.accent],
    ['business_process_crit.',   0.91, .14, HF.accent],
    ['customer_visible_impact',  0.74, .13, HF.accent],
    ['recurrence_risk',          0.68, .12, HF.accent],
    ['dependency_centrality',    0.55, .10, HF.accent2],
    ['sla_exposure',             0.62, .10, HF.accent2],
    ['stakeholder_urgency',      0.71, .08, HF.accent],
    ['actionability',            0.80, .07, HF.accent2],
    ['expansion_relevance',      0.70, .05, HF.faint],
    ['evidence_trust',           0.82, .05, HF.accent2],
  ];
  const topbar = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span style={{ fontFamily: '"Cabinet Grotesk", sans-serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>
          Decision · GA-PRINT-GPO-042
        </span>
        <HFPill color={HF.accent}>review required</HFPill>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <HFPill>⟲ replay</HFPill>
        <HFPill>↓ approve</HFPill>
        <span style={{ background: HF.accent, color: HF.bg, padding: '8px 16px', fontFamily: '"Geist Mono", ui-monospace, monospace',
                       fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500 }}>Route action</span>
      </div>
    </>
  );
  return (
    <HFShell page="decision" topbar={topbar}>
      <div style={{ padding: 24, height: '100%', display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 18, overflow: 'hidden' }}>
        {/* score panel */}
        <div style={{ background: HF.surface, border: `1px solid ${HF.line}`, padding: 24,
                      display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute,
                            letterSpacing: '.12em', textTransform: 'uppercase' }}>Praxis Priority</div>
              <div style={{ fontFamily: '"Cabinet Grotesk", sans-serif', fontSize: 84, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.04em', marginTop: 6,
                            background: `linear-gradient(135deg, ${HF.text} 0%, ${HF.accent} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>0.74</div>
              <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute, letterSpacing: '.1em', marginTop: 6 }}>
                bucket · demo and scope · routed to plant.it@…
              </div>
            </div>
            <div style={{ display: 'flex', gap: 22 }}>
              {[['Evidence trust', '0.82', HF.accent2], ['Uncertainty', '−0.10', HF.crit], ['Confidence', '0.86', HF.accent2]].map(([k,v,c]) => (
                <div key={k}>
                  <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute, letterSpacing: '.1em', textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontFamily: '"Cabinet Grotesk", sans-serif', fontSize: 30, color: c, marginTop: 4, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            Weighted components · praxis_priority = Σ wᵢ·xᵢ − uncertainty
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {components.map(([k,v,w,c]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 56px 40px', alignItems: 'center', gap: 12,
                                      fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 11 }}>
                <span style={{ color: HF.text }}>{k}</span>
                <div style={{ height: 6, background: HF.line, position: 'relative' }}>
                  <div style={{ width: `${v*100}%`, height: '100%', background: c, boxShadow: `0 0 12px ${c}66` }} />
                </div>
                <span style={{ color: c, textAlign: 'right' }}>{v.toFixed(2)}</span>
                <span style={{ color: HF.mute, textAlign: 'right' }}>×{w.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          <div style={{ background: HF.surface, border: `1px solid ${HF.line}`, padding: 22,
                        position: 'relative', overflow: 'hidden' }}>
            {/* glow accent */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180,
                          background: `radial-gradient(closest-side, ${HF.accent}55, transparent)`, filter: 'blur(20px)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.accent,
                            letterSpacing: '.14em', textTransform: 'uppercase' }}>Recommended action</div>
              <div style={{ fontFamily: '"Cabinet Grotesk", sans-serif', fontSize: 24, fontWeight: 500, lineHeight: 1.25,
                            marginTop: 12, textWrap: 'balance', letterSpacing: '-0.015em' }}>
                Validate Point-and-Print policy, GPO read permissions, and local-IP printer drift across the GA plant fleet.
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 16, fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute,
                            letterSpacing: '.1em', textTransform: 'uppercase' }}>
                <span>mode · assisted</span><span>target · MSP ticketing</span><span style={{ color: HF.accent2 }}>risk · low</span>
              </div>
            </div>
          </div>

          <div style={{ background: HF.surface, border: `1px solid ${HF.line}`, padding: 20, flex: 1, overflow: 'hidden' }}>
            <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute,
                          letterSpacing: '.12em', textTransform: 'uppercase' }}>Evidence trail · 7 items · trust 0.82</div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Printer mapping missing · WEIFPS01',  'tickets · 4 occurrences · 72h',   HF.accent,  0.91],
                ['GPO drift detected · point-and-print','telemetry · MSP scan · 2h ago',   HF.accent,  0.84],
                ['Shipping delay correlated · 3 events','erp · workflow log · matched',   HF.accent2, 0.78],
                ['Runbook GPO-DRIFT-01 applies',        'knowledge base · 0.91 match',     HF.accent2, 0.91],
              ].map(([t,sub,c,score],i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr 38px', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: c, marginTop: 7, boxShadow: `0 0 10px ${c}` }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{t}</div>
                    <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10.5, color: HF.mute, marginTop: 2 }}>{sub}</div>
                  </div>
                  <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 11, color: c, textAlign: 'right' }}>{score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HFShell>
  );
}

// ── 3. Executive Readout ───────────────────────────────────────────────
function HFReadout() {
  const topbar = (
    <>
      <div style={{ fontFamily: '"Cabinet Grotesk", sans-serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>
        Executive Readout · Q2 · Acme Manufacturing
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <HFPill>↓ PDF</HFPill>
        <HFPill>↓ Deck</HFPill>
        <span style={{ background: HF.accent, color: HF.bg, padding: '8px 16px', fontFamily: '"Geist Mono", ui-monospace, monospace',
                       fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500 }}>Send to CFO</span>
      </div>
    </>
  );
  return (
    <HFShell page="readout" topbar={topbar}>
      <div style={{ height: '100%', display: 'flex', justifyContent: 'center', padding: 30, overflow: 'hidden',
                    background: `radial-gradient(ellipse at 50% 0%, ${HF.surfaceAlt} 0%, ${HF.bg} 60%)` }}>
        {/* paper */}
        <div style={{ width: '100%', maxWidth: 780, background: HF.surface, border: `1px solid ${HF.line}`,
                      padding: 44, overflow: 'hidden', position: 'relative',
                      boxShadow: `0 30px 80px rgba(0,0,0,.45)` }}>
          {/* corner mark */}
          <div style={{ position: 'absolute', top: 28, right: 28 }}>
            <window.PraxisMark variant="origami" size={36} color={HF.text} />
          </div>

          <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute,
                        letterSpacing: '.18em', textTransform: 'uppercase' }}>
            Executive readout · GA-PRINT-GPO-042 · run pxs_042
          </div>
          <div style={{ fontFamily: '"Cabinet Grotesk", sans-serif', fontSize: 42, fontWeight: 500, lineHeight: 1.08,
                        marginTop: 14, textWrap: 'balance', letterSpacing: '-0.025em', maxWidth: 640 }}>
            Printer-deployment failure costs <span style={{
              background: `linear-gradient(110deg, ${HF.accent} 30%, ${HF.accent2} 95%)`, WebkitBackgroundClip: 'text',
              backgroundClip: 'text', color: 'transparent' }}>$38.4K/yr</span> in shipping delays at the GA plant.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 36 }}>
            {[
              ['Primary impact', 'Shipping docs',  HF.text],
              ['Root cause',     'GPO policy drift', HF.text],
              ['Evidence trust', '0.82',            HF.accent2],
              ['Annual value',   '$38,400',         HF.accent],
            ].map(([k,v,c]) => (
              <div key={k}>
                <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 9.5, color: HF.mute, letterSpacing: '.14em', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontFamily: '"Cabinet Grotesk", sans-serif', fontSize: 26, fontWeight: 500, color: c, marginTop: 6, letterSpacing: '-0.015em' }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${HF.line}`, marginTop: 32, paddingTop: 24,
                        display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 28 }}>
            <div>
              <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute, letterSpacing: '.14em',
                            textTransform: 'uppercase', marginBottom: 10 }}>Recommended action · human approval</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.6, color: HF.text }}>
                Validate Point-and-Print policy, GPO read permissions, and local-IP printer drift across the GA plant fleet. Apply runbook <span style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', color: HF.accent }}>GPO-DRIFT-01</span>. No production mutation — communication-only path through MSP ticketing.
              </div>
              <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute, letterSpacing: '.14em',
                            textTransform: 'uppercase', marginTop: 22, marginBottom: 10 }}>Next 30 days</div>
              <ol style={{ paddingLeft: 18, margin: 0, color: HF.text, fontSize: 13.5, lineHeight: 1.75 }}>
                <li>Approve &amp; route runbook through MSP ticketing</li>
                <li>Capture action log; sign audit hash to S3</li>
                <li>Pilot expansion · vendor SLA tracking (score 0.68)</li>
              </ol>
            </div>
            <div style={{ background: HF.surfaceAlt, padding: 18, border: `1px solid ${HF.line}` }}>
              <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute, letterSpacing: '.14em',
                            textTransform: 'uppercase', marginBottom: 12 }}>Trend · incidents / week</div>
              <HFSpark data={[8,9,11,12,10,9,7,6,5,4]} color={HF.accent} w={310} h={70} fill />
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontFamily: '"Geist Mono", ui-monospace, monospace',
                            fontSize: 10, color: HF.mute }}>
                <span>Last 10 weeks</span><span style={{ color: HF.accent2 }}>−50%</span>
              </div>
              <div style={{ marginTop: 22 }}>
                <div style={{ fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 10, color: HF.mute, letterSpacing: '.14em', textTransform: 'uppercase' }}>Expansion path</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {[['Vendor SLA Tracking','0.68'], ['ERP Access','0.61'], ['Endpoint Drift','0.55']].map(([n,s]) => (
                    <div key={n} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 11 }}>
                      <span style={{ color: HF.text }}>{n}</span><span style={{ color: HF.accent }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 22, left: 44, right: 44, display: 'flex',
                        justifyContent: 'space-between', fontFamily: '"Geist Mono", ui-monospace, monospace', fontSize: 9.5, color: HF.mute,
                        letterSpacing: '.14em', textTransform: 'uppercase', borderTop: `1px solid ${HF.line}`, paddingTop: 12 }}>
            <span>Praxis · run pxs_GA-PRINT-GPO-042</span>
            <span>v1.0 · auto-generated · audit 9f3a…</span>
          </div>
        </div>
      </div>
    </HFShell>
  );
}

Object.assign(window, { HF, HFOverview, HFDecision, HFReadout });
