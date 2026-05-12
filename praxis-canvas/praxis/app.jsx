// praxis/app.jsx — Field Workbench app screens (9 boards)
const { PraxisLockup, PraxisMark, PatternBg, ImgSlot, Spark, MiniBars, Board } = window;

// ─── shared app chrome (sidebar + topbar) ───────────────────────────────
function AppShell({ theme, t, page, children, topbar }) {
  const { p } = theme;
  const navItems = [
    ['Overview',     'overview'],
    ['Solution Packs','packs'],
    ['FieldLab',     'fieldlab'],
    ['Ontology',     'ontology'],
    ['Decisions',    'decision'],
    ['Discovery',    'discovery'],
    ['Value Case',   'valuecase'],
    ['Expansion',    'expansion'],
    ['Readout',      'readout'],
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '208px 1fr',
                  background: p.bg, color: p.text, fontFamily: 'var(--p-body)' }}>
      {/* sidebar */}
      <div style={{ borderRight: `1px solid ${p.line}`, background: p.surface, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 18px 12px' }}>
          <PraxisLockup variant={t.logoVariant} size={22} color={p.text} accent={p.warn} weight={500} />
        </div>
        <div style={{ fontFamily: 'var(--p-mono)', fontSize: 9.5, color: p.mute, letterSpacing: '.16em',
                      textTransform: 'uppercase', padding: '6px 18px 8px' }}>Workbench</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {navItems.map(([label, id]) => (
            <div key={id} style={{
              padding: '8px 18px', fontSize: 12.5, color: id === page ? p.text : p.mute,
              borderLeft: id === page ? `2px solid ${p.warn}` : '2px solid transparent',
              background: id === page ? `color-mix(in oklch, ${p.warn} 8%, transparent)` : 'transparent',
              fontWeight: id === page ? 500 : 400,
            }}>{label}</div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: 14, borderTop: `1px solid ${p.line}`, fontFamily: 'var(--p-mono)',
                      fontSize: 10, color: p.mute, letterSpacing: '.08em' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, background: p.faint, display: 'inline-block' }} />
            <div>
              <div style={{ color: p.text, fontFamily: 'var(--p-body)', fontSize: 11.5 }}>Ava Chen</div>
              <div>Forward-deployed</div>
            </div>
          </div>
        </div>
      </div>
      {/* main */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 52, borderBottom: `1px solid ${p.line}`, display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          {topbar}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── reusable pieces ────────────────────────────────────────────────────
function MetricCard({ label, value, delta, deltaColor, spark, sparkColor, p }) {
  return (
    <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 16,
                  display: 'flex', flexDirection: 'column', gap: 8, minHeight: 124 }}>
      <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.1em',
                    textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--p-display)', fontSize: 34, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: deltaColor || p.mute }}>{delta}</span>
        {spark}
      </div>
    </div>
  );
}

function Pill({ children, color, bg, p }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px',
                   border: `1px solid ${color || p.line}`, color: color || p.mute, background: bg || 'transparent',
                   fontFamily: 'var(--p-mono)', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}>
      {children}
    </span>
  );
}

function SectionTitle({ children, sub, p }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ fontFamily: 'var(--p-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>{children}</div>
      {sub && <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.08em',
                            textTransform: 'uppercase' }}>{sub}</div>}
    </div>
  );
}

// ─── 1. Overview ────────────────────────────────────────────────────────
function AppOverview({ theme, t }) {
  const { p } = theme;
  const topbar = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500 }}>Operational Overview</span>
        <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          Real-time posture · 7 sites · 24 active runs
        </span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Pill p={p}>Time · 24H ▾</Pill>
        <Pill p={p} color={p.warn}>● 3 alerts</Pill>
        <span style={{ background: p.text, color: p.bg, padding: '7px 14px', fontFamily: 'var(--p-mono)',
                       fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase' }}>Export readout</span>
      </div>
    </>
  );
  return (
    <Board theme={theme} num="APP-01" title="Field Workbench · Operational Overview" subtitle="praxis.dev/overview">
      <AppShell theme={theme} t={t} page="overview" topbar={topbar}>
        <div style={{ padding: 24, height: '100%', display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 'min-content', gap: 14, overflow: 'hidden' }}>
          <MetricCard p={p} label="Mission Readiness" value="98.6%" delta="+2.4% vs yesterday" deltaColor={p.ok}
            spark={<Spark data={[20,22,21,23,25,24,28,27,30,29,32]} color={p.accent} w={120} h={36} fill />} />
          <MetricCard p={p} label="Active Operations" value="24" delta="across 7 theaters" deltaColor={p.mute}
            spark={<MiniBars data={[3,5,4,6,7,6,8,9,7,8,10]} color={p.accent} w={120} h={36} />} />
          <MetricCard p={p} label="Signal Quality" value="93.2%" delta="stable" deltaColor={p.mute}
            spark={<Spark data={[8,9,7,10,9,11,10,12,11,13,12]} color={p.accent2} w={120} h={36} fill />} />
          <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 16, gridRow: 'span 2' }}>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.1em',
                          textTransform: 'uppercase' }}>Alerts · requiring action</div>
            <div style={{ fontFamily: 'var(--p-display)', fontSize: 28, fontWeight: 500, marginTop: 6 }}>3 open</div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Network Anomaly',    'Sector 7B',         p.accent],
                ['Device Offline',     'Unit Bravo-4',      p.warn],
                ['Intel Update',       'New threat pattern',p.accent2],
              ].map(([n, sub, c]) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                                       border: `1px solid ${p.line}`, background: p.bg }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: c, flex: '0 0 auto' }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{n}</div>
                    <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Big chart row */}
          <div style={{ gridColumn: 'span 3', background: p.surface, border: `1px solid ${p.line}`, padding: 16,
                        display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.1em',
                            textTransform: 'uppercase' }}>Signal density · last 24 h</div>
              <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute }}>
                <span><span style={{ color: p.accent }}>■</span> Signals</span>
                <span><span style={{ color: p.warn }}>■</span> Decisions</span>
                <span><span style={{ color: p.accent2 }}>■</span> Actions</span>
              </div>
            </div>
            <svg viewBox="0 0 600 180" style={{ width: '100%', height: 180 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <line key={i} x1="0" x2="600" y1={i * 40 + 10} y2={i * 40 + 10} stroke={p.line} strokeWidth=".6" />
              ))}
              <polyline points={(()=>{const a=[];for(let i=0;i<24;i++)a.push(`${i*26},${120-Math.sin(i/2)*30-Math.random()*15}`);return a.join(' ');})()}
                fill="none" stroke={p.accent} strokeWidth="1.6" />
              <polyline points={(()=>{const a=[];for(let i=0;i<24;i++)a.push(`${i*26},${140-Math.sin(i/3)*20-Math.random()*10}`);return a.join(' ');})()}
                fill="none" stroke={p.warn} strokeWidth="1.4" />
              <polyline points={(()=>{const a=[];for(let i=0;i<24;i++)a.push(`${i*26},${160-Math.sin(i/2.5)*14-Math.random()*8}`);return a.join(' ');})()}
                fill="none" stroke={p.accent2} strokeWidth="1.2" opacity=".7" />
            </svg>
          </div>

          {/* bottom row metrics */}
          {[
            ['Assets Online','1,248','+0.3%', p.ok],
            ['Incidents','12','-8%', p.ok],
            ['Data Ingested','4.7 TB','+18%', p.accent],
            ['Response Time','02:34','+12%', p.warn],
          ].map(([l,v,d,c]) => (
            <MetricCard key={l} p={p} label={l} value={v} delta={d} deltaColor={c} />
          ))}
        </div>
      </AppShell>
    </Board>
  );
}

// ─── 2. Solution Pack Catalog ───────────────────────────────────────────
function AppPacks({ theme, t }) {
  const { p } = theme;
  const packs = [
    ['Manufacturing Printer GPO', 'manufacturing', 'Director of Operations', 0.86, 'pilot now', p.ok, '$38.4K'],
    ['ERP Access Disruption',     'manufacturing', 'IT Manager',             0.74, 'demo + scope', p.accent, '$56.2K'],
    ['K8s Ingress Degradation',   'platform',      'SRE Lead',               0.69, 'demo + scope', p.accent, '$92.0K'],
    ['Email Quarantine Workflow', 'security',      'CISO',                   0.58, 'discovery required', p.warn, '$24.0K'],
    ['Machine Cascade Maintenance','manufacturing','Plant Engineer',         0.81, 'pilot now', p.ok, '$110K'],
    ['Vendor SLA Tracking',       'operations',    'COO',                    0.42, 'defer', p.faint, '—'],
  ];
  const topbar = (
    <>
      <div style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500 }}>Solution Packs</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Pill p={p}>industry · all ▾</Pill>
        <Pill p={p}>persona · all ▾</Pill>
        <Pill p={p} color={p.warn}>+ New pack</Pill>
      </div>
    </>
  );
  return (
    <Board theme={theme} num="APP-02" title="Solution Pack Catalog" subtitle="repeatable customer scenarios">
      <AppShell theme={theme} t={t} page="packs" topbar={topbar}>
        <div style={{ padding: 24, height: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {packs.map(([name, industry, persona, score, bucket, c, value]) => (
              <div key={name} style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 18,
                                       display: 'flex', flexDirection: 'column', gap: 10, position: 'relative',
                                       minHeight: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--p-mono)', fontSize: 9.5, color: p.mute, letterSpacing: '.12em',
                                  textTransform: 'uppercase' }}>{industry}</div>
                    <div style={{ fontFamily: 'var(--p-display)', fontSize: 19, fontWeight: 500, marginTop: 4,
                                  lineHeight: 1.15, letterSpacing: '-0.01em' }}>{name}</div>
                  </div>
                  <Pill p={p} color={c}>{bucket}</Pill>
                </div>
                <div style={{ fontSize: 11.5, color: p.mute }}>Buyer · {persona}</div>
                {/* use-case score */}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4,
                                fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.08em' }}>
                    <span>Use-case score</span><span style={{ color: c }}>{score.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 4, background: p.line, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, width: `${score*100}%`, background: c }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                    <span style={{ fontFamily: 'var(--p-mono)', fontSize: 11, color: p.text }}>Est. {value} / yr</span>
                    <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10.5, color: p.warn, letterSpacing: '.06em' }}>Launch →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </Board>
  );
}

// ─── 3. FieldLab Control ────────────────────────────────────────────────
function AppFieldLab({ theme, t }) {
  const { p } = theme;
  const services = [
    ['floci-core',  'localhost:4566', 'healthy'],
    ['sqs · praxis-incident-events', '12 in-flight', 'healthy'],
    ['s3 · praxis-audit-artifacts',  '344 objects',  'healthy'],
    ['dynamodb · PraxisIncidentState','428 items',   'healthy'],
    ['eventbridge · workflow-events','24 rules',     'healthy'],
    ['lambda · adapter-printer-gpo', '0.18s avg',    'healthy'],
  ];
  const events = [
    ['12:04:22.118','printer.mapping.missing','WEIFPS01 · GA Plant', 0.74, p.warn],
    ['12:04:21.880','gpo.permission.issue',   'WEIFPS01 · GA Plant', 0.42, p.faint],
    ['12:04:19.301','ticket.created',          'MSP · INC-22841',    0.55, p.accent],
    ['12:04:18.000','asset.state.update',      'PRT-Brother-22 · GA',0.30, p.faint],
    ['12:04:13.992','ticket.linked',           'INC-22841 ↔ INC-22802',0.61, p.accent2],
    ['12:04:09.554','point-and-print.policy',  'GPO_DRIFT detected', 0.83, p.warn],
  ];
  const topbar = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500 }}>FieldLab</span>
        <Pill p={p} color={p.ok}>● running · 14m 22s</Pill>
        <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.08em' }}>
          run · pxs_GA-PRINT-GPO-042 · pack · manufacturing-printer-gpo
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Pill p={p}>⏸ pause</Pill>
        <Pill p={p}>⟲ replay</Pill>
        <Pill p={p} color={p.warn}>Export bundle</Pill>
      </div>
    </>
  );
  return (
    <Board theme={theme} num="APP-03" title="FieldLab · Local AWS deployment twin" subtitle="floci · running">
      <AppShell theme={theme} t={t} page="fieldlab" topbar={topbar}>
        <div style={{ padding: 24, height: '100%', display: 'grid',
                      gridTemplateColumns: '1.1fr 1fr', gap: 18, overflow: 'hidden' }}>
          {/* event stream */}
          <div style={{ background: p.surface, border: `1px solid ${p.line}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${p.line}`, display: 'flex',
                          justifyContent: 'space-between', fontFamily: 'var(--p-mono)', fontSize: 10,
                          color: p.mute, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              <span>Event stream · live</span><span style={{ color: p.ok }}>● 12 events / min</span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', fontFamily: 'var(--p-mono)', fontSize: 11.5, lineHeight: 1.7 }}>
              {events.map(([t,evt,subj,trust,c],i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '88px 1fr 80px',
                                       padding: '9px 16px', borderBottom: `1px solid ${p.line}`, gap: 14 }}>
                  <span style={{ color: p.mute }}>{t}</span>
                  <div>
                    <div style={{ color: p.text }}>{evt}</div>
                    <div style={{ color: p.mute, fontSize: 10.5 }}>{subj}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: c }}>{trust.toFixed(2)}</span>
                    <div style={{ height: 3, background: p.line, marginTop: 4 }}>
                      <div style={{ width: `${trust * 100}%`, height: '100%', background: c }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* services + topology */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 16 }}>
              <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.1em',
                            textTransform: 'uppercase', marginBottom: 10 }}>FieldLab services</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {services.map(([n,sub]) => (
                  <div key={n} style={{ display: 'flex', justifyContent: 'space-between',
                                          fontFamily: 'var(--p-mono)', fontSize: 11, color: p.text }}>
                    <span><span style={{ color: p.ok, marginRight: 6 }}>●</span>{n}</span>
                    <span style={{ color: p.mute }}>{sub}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: p.surface, border: `1px solid ${p.line}`, flex: 1, padding: 16,
                          display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.1em',
                            textTransform: 'uppercase', marginBottom: 6 }}>Pipeline · signal → decision</div>
              <svg viewBox="0 0 360 220" style={{ width: '100%', flex: 1 }}>
                <g fontFamily="var(--p-mono)" fontSize="9" fill={p.mute}>
                  {[
                    [40, 50, 'adapter'],
                    [140, 30, 'sqs'],
                    [240, 60, 'ontology'],
                    [320, 110, 'decision'],
                    [240, 160, 'action log'],
                    [140, 180, 's3 · audit'],
                    [40, 140, 'value case'],
                  ].map(([x,y,l],i) => (
                    <g key={i}>
                      <rect x={x-30} y={y-12} width="62" height="24" fill={p.bg} stroke={p.line} />
                      <text x={x+1} y={y+3} textAnchor="middle" fill={p.text}>{l}</text>
                    </g>
                  ))}
                  <g stroke={p.accent} strokeWidth="1.2" fill="none" markerEnd="">
                    <path d="M70 50 L110 30" /><path d="M170 30 L210 60" />
                    <path d="M260 70 L300 105" /><path d="M310 120 L270 155" />
                    <path d="M210 165 L170 180" /><path d="M110 185 L70 145" />
                    <path d="M70 135 L40 90" stroke={p.warn} strokeDasharray="3 3" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </AppShell>
    </Board>
  );
}

// ─── 4. Ontology Graph ─────────────────────────────────────────────────
function AppOntology({ theme, t }) {
  const { p } = theme;
  // Define graph nodes (operational ontology)
  const nodes = [
    { id: 'site',   label: 'Site',             type: 'object',  x: 90,  y: 140, sub: 'GA-PLANT' },
    { id: 'asset',  label: 'Asset',            type: 'object',  x: 230, y: 90,  sub: 'WEIFPS01 print server' },
    { id: 'asset2', label: 'Asset',            type: 'object',  x: 230, y: 220, sub: 'PRT-Brother-22' },
    { id: 'inc',    label: 'Incident',         type: 'object',  x: 400, y: 150, sub: 'GA-PRINT-GPO-042' },
    { id: 'bp',     label: 'Business Process', type: 'object',  x: 570, y: 90,  sub: 'Shipping docs' },
    { id: 'tkt',    label: 'Ticket',           type: 'object',  x: 570, y: 230, sub: 'INC-22841' },
    { id: 'vendor', label: 'Vendor',           type: 'object',  x: 720, y: 150, sub: 'MSP · Tier-2' },
    { id: 'runbk',  label: 'Runbook',          type: 'object',  x: 400, y: 320, sub: 'GPO-DRIFT-01' },
    { id: 'sth',    label: 'Stakeholder',      type: 'object',  x: 90,  y: 320, sub: 'Plant Mgr.' },
  ];
  const links = [
    ['site','asset','owns'], ['site','asset2','owns'],
    ['asset','inc','triggers'], ['asset2','inc','triggers'],
    ['inc','bp','impacts'], ['inc','tkt','supports'],
    ['tkt','vendor','assignedTo'], ['runbk','inc','remediates'],
    ['sth','inc','accountable'],
  ];
  const findNode = id => nodes.find(n => n.id === id);
  const topbar = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500 }}>Operational Ontology</span>
        <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.08em' }}>
          9 object types · 14 links · 8 actions · mapping confidence 0.86
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Pill p={p}>view · graph ▾</Pill>
        <Pill p={p}>filter · all ▾</Pill>
        <Pill p={p} color={p.warn}>Recompile</Pill>
      </div>
    </>
  );
  return (
    <Board theme={theme} num="APP-04" title="Ontology Graph" subtitle="Praxis · objects, links, actions">
      <AppShell theme={theme} t={t} page="ontology" topbar={topbar}>
        <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 280px', overflow: 'hidden' }}>
          <div style={{ position: 'relative', background: p.bg, overflow: 'hidden' }}>
            <svg width="100%" height="100%" viewBox="0 0 820 420" preserveAspectRatio="xMidYMid meet">
              {/* faint grid */}
              <defs>
                <pattern id="og" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M32 0 L0 0 0 32" stroke={p.line} fill="none" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#og)" />
              {/* links */}
              {links.map(([a,b,lbl],i) => {
                const A = findNode(a), B = findNode(b);
                const mx = (A.x+B.x)/2, my = (A.y+B.y)/2;
                return (
                  <g key={i}>
                    <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={p.faint} strokeWidth="1" />
                    <text x={mx} y={my-4} fontSize="9" fontFamily="var(--p-mono)" fill={p.mute}
                          textAnchor="middle">{lbl}</text>
                  </g>
                );
              })}
              {/* nodes */}
              {nodes.map(n => (
                <g key={n.id}>
                  <rect x={n.x-58} y={n.y-22} width="116" height="44" fill={p.surface} stroke={n.id==='inc'?p.warn:p.line} strokeWidth={n.id==='inc'?1.6:1} />
                  <text x={n.x} y={n.y-6} fontSize="10" fontFamily="var(--p-mono)" fill={n.id==='inc'?p.warn:p.mute}
                        textAnchor="middle" letterSpacing=".1em">{n.label.toUpperCase()}</text>
                  <text x={n.x} y={n.y+10} fontSize="11" fontFamily="var(--p-body)" fill={p.text}
                        textAnchor="middle">{n.sub}</text>
                </g>
              ))}
            </svg>
          </div>
          {/* inspector */}
          <div style={{ borderLeft: `1px solid ${p.line}`, background: p.surface, padding: 18, overflow: 'auto' }}>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                          textTransform: 'uppercase' }}>Inspector · Incident</div>
            <div style={{ fontFamily: 'var(--p-display)', fontSize: 20, fontWeight: 500, marginTop: 6 }}>GA-PRINT-GPO-042</div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10,
                          fontFamily: 'var(--p-mono)', fontSize: 11 }}>
              {[
                ['Severity','high', p.warn],
                ['Confidence','0.82', p.ok],
                ['Site', 'GA-PLANT', p.text],
                ['Process', 'Shipping documentation', p.text],
                ['Asset', 'WEIFPS01', p.text],
                ['Owner','plant.it@…', p.text],
              ].map(([k,v,c]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: p.mute }}>{k}</span><span style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                          textTransform: 'uppercase', marginTop: 20 }}>Available actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {[
                ['acknowledge', 'READ_ONLY', p.faint],
                ['assign owner', 'HUMAN_APPROVAL', p.accent],
                ['request vendor', 'ASSISTED', p.accent2],
                ['simulate runbook', 'WRITEBACK · lab', p.warn],
              ].map(([n,mode,c]) => (
                <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                       border: `1px solid ${p.line}`, padding: '7px 10px' }}>
                  <span style={{ fontSize: 11.5 }}>{n}</span>
                  <span style={{ fontFamily: 'var(--p-mono)', fontSize: 9.5, color: c, letterSpacing: '.08em' }}>{mode}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </Board>
  );
}

// ─── 5. Decision Detail ─────────────────────────────────────────────────
function AppDecision({ theme, t }) {
  const { p } = theme;
  const components = [
    ['operational_severity',    0.82, .16, p.warn],
    ['business_process_crit.',  0.91, .14, p.warn],
    ['customer_visible_impact', 0.74, .13, p.accent],
    ['recurrence_risk',         0.68, .12, p.accent],
    ['dependency_centrality',   0.55, .10, p.accent2],
    ['sla_exposure',            0.62, .10, p.accent2],
    ['stakeholder_urgency',     0.71, .08, p.accent],
    ['actionability',           0.80, .07, p.ok],
    ['expansion_relevance',     0.70, .05, p.mute],
    ['evidence_trust',          0.82, .05, p.ok],
  ];
  const topbar = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500 }}>Decision · GA-PRINT-GPO-042</span>
        <Pill p={p} color={p.warn}>review required</Pill>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Pill p={p}>⟲ replay</Pill>
        <Pill p={p}>↓ approve action</Pill>
        <Pill p={p} color={p.warn}>↗ escalate</Pill>
      </div>
    </>
  );
  return (
    <Board theme={theme} num="APP-05" title="Decision · explanation & evidence" subtitle="praxis decision-engine">
      <AppShell theme={theme} t={t} page="decision" topbar={topbar}>
        <div style={{ padding: 20, height: '100%', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, overflow: 'hidden' }}>
          {/* score breakdown */}
          <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                              textTransform: 'uppercase' }}>Praxis Priority</div>
                <div style={{ fontFamily: 'var(--p-display)', fontSize: 60, fontWeight: 500, lineHeight: 1, marginTop: 6 }}>0.74</div>
              </div>
              <div style={{ display: 'flex', gap: 18 }}>
                {[
                  ['Evidence trust', '0.82', p.ok],
                  ['Uncertainty', '−0.10', p.warn],
                ].map(([k,v,c]) => (
                  <div key={k}>
                    <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.1em',
                                  textTransform: 'uppercase' }}>{k}</div>
                    <div style={{ fontFamily: 'var(--p-display)', fontSize: 28, color: c, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.1em',
                          textTransform: 'uppercase', marginTop: 6 }}>Weighted components</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {components.map(([k,v,w,c]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 56px 32px',
                                       alignItems: 'center', gap: 10, fontFamily: 'var(--p-mono)', fontSize: 10.5 }}>
                  <span style={{ color: p.text }}>{k}</span>
                  <div style={{ height: 6, background: p.line, position: 'relative' }}>
                    <div style={{ width: `${v*100}%`, height: '100%', background: c }} />
                  </div>
                  <span style={{ color: c, textAlign: 'right' }}>{v.toFixed(2)}</span>
                  <span style={{ color: p.mute, textAlign: 'right' }}>×{w.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* recommendation + evidence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
            <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 16 }}>
              <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.warn, letterSpacing: '.14em',
                            textTransform: 'uppercase' }}>Recommended action</div>
              <div style={{ fontFamily: 'var(--p-display)', fontSize: 21, fontWeight: 500, lineHeight: 1.25, marginTop: 8, textWrap: 'balance' }}>
                Validate Point-and-Print policy, GPO read permissions, and local-IP printer drift across the GA plant fleet.
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 14, fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute,
                            letterSpacing: '.08em', textTransform: 'uppercase' }}>
                <span>mode · assisted</span><span>target · MSP ticketing</span><span>risk · low</span>
              </div>
            </div>

            <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 16, flex: 1, overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                            textTransform: 'uppercase' }}>Evidence trail · 7 items</div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Printer mapping missing · WEIFPS01', 'tickets · 4 occurrences · 72h', p.warn],
                  ['GPO drift detected · point-and-print', 'telemetry · MSP scan', p.warn],
                  ['Shipping delay correlated · 3 events', 'erp · workflow log', p.accent],
                  ['Runbook GPO-DRIFT-01 applies', 'knowledge base · 0.91 match', p.ok],
                ].map(([t,sub,c],i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: c, marginTop: 7, flex: '0 0 auto' }} />
                    <div>
                      <div style={{ fontSize: 12 }}>{t}</div>
                      <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </Board>
  );
}

// ─── 6. Discovery / Value of Information ────────────────────────────────
function AppDiscovery({ theme, t }) {
  const { p } = theme;
  const questions = [
    ['How many production minutes were lost?',     'downtime_minutes',  +0.18, 'Highest impact on ROI and severity score'],
    ['Who owns the affected asset?',                'asset_owner',      +0.11, 'Required for routing & implementation plan'],
    ['What is the vendor SLA tier?',                'vendor_sla',       +0.09, 'Refines actionability + escalation path'],
    ['Has this incident recurred at other sites?',  'recurrence_sites', +0.07, 'Validates pattern across plants'],
    ['What is the ticket age?',                     'ticket_age',       +0.05, 'Tunes recurrence vs. fresh-failure mix'],
  ];
  const topbar = (
    <>
      <div style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500 }}>Discovery · Next-Best Question</div>
      <Pill p={p}>VOI engine · v0.4</Pill>
    </>
  );
  return (
    <Board theme={theme} num="APP-06" title="Discovery / Value of Information" subtitle="ask the right question first">
      <AppShell theme={theme} t={t} page="discovery" topbar={topbar}>
        <div style={{ padding: 28, height: '100%', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.14em',
                          textTransform: 'uppercase' }}>If we knew one more thing, ask first:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {questions.map(([q, field, gain, reason], i) => (
                <div key={field} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 70px',
                                           gap: 16, padding: 16, background: i === 0 ? `color-mix(in oklch, ${p.warn} 8%, transparent)` : p.surface,
                                           border: `1px solid ${i === 0 ? p.warn : p.line}` }}>
                  <span style={{ fontFamily: 'var(--p-display)', fontSize: 22, color: p.mute, fontWeight: 500 }}>0{i + 1}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500, lineHeight: 1.25, textWrap: 'balance' }}>{q}</div>
                    <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10.5, color: p.mute, letterSpacing: '.06em', marginTop: 5 }}>
                      field · {field} — {reason}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.08em',
                                  textTransform: 'uppercase' }}>+conf.</div>
                    <div style={{ fontFamily: 'var(--p-display)', fontSize: 22, color: p.warn, fontWeight: 500, lineHeight: 1, marginTop: 4 }}>+{gain.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* missing data board */}
          <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 18,
                        display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                          textTransform: 'uppercase' }}>Coverage map · GA-PRINT-GPO-042</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
              {Array.from({ length: 36 }).map((_, i) => {
                const filled = (i * 7) % 4 !== 0;
                return <div key={i} style={{ aspectRatio: '1', background: filled ? p.accent : p.line, opacity: filled ? 1 : 0.4 }} />;
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--p-mono)', fontSize: 10,
                          color: p.mute, marginTop: 6 }}>
              <span>27 / 36 fields present</span><span style={{ color: p.warn }}>75% covered</span>
            </div>
            <div style={{ borderTop: `1px solid ${p.line}`, paddingTop: 14, marginTop: 6 }}>
              <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                            textTransform: 'uppercase', marginBottom: 8 }}>If we answer the top question:</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--p-display)', fontSize: 36, fontWeight: 500, color: p.ok }}>0.92</span>
                <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute }}>projected confidence</span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </Board>
  );
}

// ─── 7. Value Case ──────────────────────────────────────────────────────
function AppValueCase({ theme, t }) {
  const { p } = theme;
  const inputs = [
    ['incidents per month',                  '12'],
    ['avg minutes lost per incident',        '35'],
    ['loaded labor rate ($/hr)',             '48'],
    ['shipment delay cost ($/hr)',           '250'],
    ['current triage minutes',               '45'],
    ['praxis triage minutes',                '12'],
  ];
  const topbar = (
    <>
      <div style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500 }}>Value Case · Manufacturing Printer GPO</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Pill p={p}>Confidence · 0.78</Pill>
        <Pill p={p} color={p.warn}>Email to CFO</Pill>
      </div>
    </>
  );
  return (
    <Board theme={theme} num="APP-07" title="Value Case / ROI" subtitle="assumptions · formulas · confidence">
      <AppShell theme={theme} t={t} page="valuecase" topbar={topbar}>
        <div style={{ padding: 24, height: '100%', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 18 }}>
          {/* inputs */}
          <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 18 }}>
            <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                          textTransform: 'uppercase', marginBottom: 14 }}>Assumptions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {inputs.map(([k,v],i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', alignItems: 'center',
                                       gap: 12, paddingBottom: 8, borderBottom: `1px solid ${p.line}` }}>
                  <span style={{ fontSize: 12 }}>{k}</span>
                  <span style={{ fontFamily: 'var(--p-mono)', fontSize: 13, color: p.text, textAlign: 'right',
                                  borderBottom: `1px dashed ${p.line}` }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* outputs + chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 20, position: 'relative' }}>
              <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.warn, letterSpacing: '.14em',
                            textTransform: 'uppercase' }}>Estimated annual value</div>
              <div style={{ fontFamily: 'var(--p-display)', fontSize: 80, fontWeight: 500, letterSpacing: '-0.03em',
                            lineHeight: 1, marginTop: 8 }}>$38,400</div>
              <div style={{ display: 'flex', gap: 24, marginTop: 16, fontFamily: 'var(--p-mono)', fontSize: 11, color: p.mute }}>
                <span><span style={{ color: p.text }}>$10,500</span> labor saved / yr</span>
                <span><span style={{ color: p.text }}>$27,900</span> delay cost avoided / yr</span>
              </div>
            </div>
            <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 18, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                              textTransform: 'uppercase' }}>3-year cumulative value</div>
                <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute }}>p25 · p50 · p75</span>
              </div>
              <svg viewBox="0 0 480 180" style={{ width: '100%', height: 180, marginTop: 12 }}>
                {[0,1,2,3].map(i => <line key={i} x1="0" x2="480" y1={i*44+10} y2={i*44+10} stroke={p.line} strokeWidth=".6" />)}
                {/* uncertainty band */}
                <polygon points="20,150 120,130 220,100 320,70 420,45 420,80 320,110 220,135 120,155 20,170"
                         fill={p.accent} fillOpacity=".18" />
                <polyline points="20,160 120,140 220,115 320,85 420,60" fill="none" stroke={p.accent} strokeWidth="1.6" />
                <polyline points="20,165 120,150 220,128 320,100 420,75" fill="none" stroke={p.warn} strokeWidth="1.6" strokeDasharray="4 4" />
                <text x="430" y="65" fontSize="9" fontFamily="var(--p-mono)" fill={p.text}>$117K</text>
                <text x="430" y="80" fontSize="9" fontFamily="var(--p-mono)" fill={p.warn}>$96K bear</text>
              </svg>
            </div>
          </div>
        </div>
      </AppShell>
    </Board>
  );
}

// ─── 8. Expansion Map ───────────────────────────────────────────────────
function AppExpansion({ theme, t }) {
  const { p } = theme;
  const nodes = [
    { x: 380, y: 220, label: 'Printer GPO',          sub: 'pilot · live',     score: 0.86, kind: 'pilot' },
    { x: 200, y: 110, label: 'Asset Inventory',      sub: 'adjacent',         score: 0.72, kind: 'adj' },
    { x: 580, y: 120, label: 'Vendor SLA Tracking',  sub: 'adjacent',         score: 0.68, kind: 'adj' },
    { x: 160, y: 320, label: 'Ticket Routing',       sub: 'adjacent',         score: 0.64, kind: 'adj' },
    { x: 600, y: 330, label: 'ERP Access Incidents', sub: 'expansion',        score: 0.61, kind: 'exp' },
    { x: 760, y: 220, label: 'Endpoint Drift',       sub: 'expansion',        score: 0.55, kind: 'exp' },
    { x: 380, y: 60,  label: 'Plant Downtime Rpt.',  sub: 'expansion',        score: 0.52, kind: 'exp' },
    { x: 380, y: 380, label: 'Cyber Quarantine',     sub: 'future',           score: 0.42, kind: 'fut' },
  ];
  const colorFor = k => k === 'pilot' ? p.warn : k === 'adj' ? p.accent : k === 'exp' ? p.accent2 : p.faint;
  const topbar = (
    <>
      <div style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500 }}>Expansion Map · Manufacturing Acme Co.</div>
      <Pill p={p}>7 adjacent · 4 expansion · 1 future</Pill>
    </>
  );
  return (
    <Board theme={theme} num="APP-08" title="Expansion Map" subtitle="from pilot to portfolio">
      <AppShell theme={theme} t={t} page="expansion" topbar={topbar}>
        <div style={{ position: 'relative', height: '100%' }}>
          <svg width="100%" height="100%" viewBox="0 0 960 460" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="halo" cx=".5" cy=".5" r=".5">
                <stop offset="0" stopColor={p.warn} stopOpacity=".25" />
                <stop offset="1" stopColor={p.warn} stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* radial halos */}
            <circle cx="380" cy="220" r="200" fill="url(#halo)" />
            {nodes.slice(1).map((n,i) => (
              <line key={i} x1="380" y1="220" x2={n.x} y2={n.y} stroke={colorFor(n.kind)} strokeOpacity=".55" strokeWidth="1.2"
                    strokeDasharray={n.kind === 'fut' ? '4 4' : '0'} />
            ))}
            {nodes.map((n,i) => (
              <g key={i}>
                <circle cx={n.x} cy={n.y} r={n.kind==='pilot' ? 22 : 14} fill={p.bg} stroke={colorFor(n.kind)} strokeWidth="1.6" />
                <circle cx={n.x} cy={n.y} r={n.kind==='pilot' ? 8 : 4} fill={colorFor(n.kind)} />
                <text x={n.x} y={n.y + (n.kind==='pilot'?40:30)} fontSize="12" fontFamily="var(--p-display)" fontWeight="500"
                      fill={p.text} textAnchor="middle">{n.label}</text>
                <text x={n.x} y={n.y + (n.kind==='pilot'?56:46)} fontSize="9.5" fontFamily="var(--p-mono)" letterSpacing=".1em"
                      fill={p.mute} textAnchor="middle">{(n.sub + ' · ' + n.score.toFixed(2)).toUpperCase()}</text>
              </g>
            ))}
          </svg>
          {/* legend */}
          <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 18, fontFamily: 'var(--p-mono)',
                        fontSize: 10, color: p.mute, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            <span><span style={{ color: p.warn }}>●</span> pilot</span>
            <span><span style={{ color: p.accent }}>●</span> adjacent</span>
            <span><span style={{ color: p.accent2 }}>●</span> expansion</span>
            <span><span style={{ color: p.faint }}>●</span> future</span>
          </div>
        </div>
      </AppShell>
    </Board>
  );
}

// ─── 9. Executive Readout ───────────────────────────────────────────────
function AppReadout({ theme, t }) {
  const { p } = theme;
  const topbar = (
    <>
      <div style={{ fontFamily: 'var(--p-display)', fontSize: 18, fontWeight: 500 }}>Executive Readout · Q2 · Acme Mfg.</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Pill p={p}>↓ PDF</Pill>
        <Pill p={p}>↓ deck</Pill>
        <Pill p={p} color={p.warn}>Send to CFO</Pill>
      </div>
    </>
  );
  return (
    <Board theme={theme} num="APP-09" title="Executive Readout" subtitle="one-page summary · auto-generated">
      <AppShell theme={theme} t={t} page="readout" topbar={topbar}>
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', padding: 24, overflow: 'hidden' }}>
          {/* paper */}
          <div style={{ width: '100%', maxWidth: 720, background: p.bg, border: `1px solid ${p.line}`,
                        padding: 36, overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.16em',
                              textTransform: 'uppercase' }}>Executive readout · GA-PRINT-GPO-042</div>
                <div style={{ fontFamily: 'var(--p-display)', fontSize: 36, fontWeight: 500, lineHeight: 1.1, marginTop: 8, textWrap: 'balance' }}>
                  Printer-deployment failure costs <span style={{ color: p.warn }}>$38.4K/yr</span> in shipping delays at GA plant.
                </div>
              </div>
              <PraxisMark variant={t.logoVariant} size={36} color={p.text} accent={p.warn} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 28 }}>
              {[
                ['Primary impact', 'Shipping docs',         p.text],
                ['Root cause',     'GPO policy drift',      p.text],
                ['Evidence trust', '0.82',                  p.ok],
                ['Annual value',   '$38,400',               p.warn],
              ].map(([k,v,c]) => (
                <div key={k}>
                  <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.1em',
                                textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontFamily: 'var(--p-display)', fontSize: 22, fontWeight: 500, color: c, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${p.line}`, marginTop: 26, paddingTop: 18,
                          display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                              textTransform: 'uppercase', marginBottom: 8 }}>Recommended action · human approval</div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: p.text }}>
                  Validate Point-and-Print policy, GPO read permissions, and local-IP printer drift across the GA plant fleet. Apply runbook <span style={{ fontFamily: 'var(--p-mono)' }}>GPO-DRIFT-01</span>. No production mutation; communication-only path through MSP.
                </div>
                <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                              textTransform: 'uppercase', marginTop: 18, marginBottom: 8 }}>Next 30 days</div>
                <ol style={{ paddingLeft: 16, margin: 0, color: p.text, fontSize: 13, lineHeight: 1.7 }}>
                  <li>Approve & route runbook through MSP ticketing</li>
                  <li>Capture action log; sign audit hash to S3</li>
                  <li>Pilot expansion · vendor SLA tracking (score 0.68)</li>
                </ol>
              </div>
              <div style={{ background: p.surface, padding: 14, border: `1px solid ${p.line}` }}>
                <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute, letterSpacing: '.12em',
                              textTransform: 'uppercase', marginBottom: 8 }}>Trend · incidents / month</div>
                <Spark data={[8,9,11,12,10,9,7,6,5,4]} color={p.warn} w={300} h={64} fill />
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--p-mono)',
                              fontSize: 10, color: p.mute }}>
                  <span>Last 10 weeks</span><span style={{ color: p.ok }}>−50%</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: 18, left: 36, right: 36, display: 'flex',
                          justifyContent: 'space-between', fontFamily: 'var(--p-mono)', fontSize: 10, color: p.mute,
                          letterSpacing: '.12em', textTransform: 'uppercase', borderTop: `1px solid ${p.line}`,
                          paddingTop: 10 }}>
              <span>Praxis · run pxs_GA-PRINT-GPO-042</span>
              <span>v1.0 · auto-generated · audit hash 9f3a…</span>
            </div>
          </div>
        </div>
      </AppShell>
    </Board>
  );
}

Object.assign(window, {
  AppOverview, AppPacks, AppFieldLab, AppOntology, AppDecision,
  AppDiscovery, AppValueCase, AppExpansion, AppReadout,
});
