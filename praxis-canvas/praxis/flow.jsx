// praxis/flow.jsx — end-to-end Solution Pack storyboard (small frames in a row)
const { PraxisLockup, PraxisMark, Board } = window;

function FlowFrame({ theme, num, title, sub, children, accent }) {
  const { p } = theme;
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%',
                  background: p.bg, color: p.text, fontFamily: 'var(--p-body)',
                  display: 'flex', flexDirection: 'column', overflow: 'hidden', ...theme.css }}>
      <div style={{ padding: '14px 16px 8px', display: 'flex', justifyContent: 'space-between',
                    fontFamily: 'var(--p-mono)', fontSize: 9.5, color: p.mute, letterSpacing: '.16em',
                    textTransform: 'uppercase', borderBottom: `1px solid ${p.line}` }}>
        <span>Step {num}</span><span style={{ color: accent || p.warn }}>{sub}</span>
      </div>
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ fontFamily: 'var(--p-display)', fontSize: 22, fontWeight: 500,
                      letterSpacing: '-0.015em', lineHeight: 1.15, textWrap: 'balance' }}>{title}</div>
        <div style={{ marginTop: 12, flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
      </div>
    </div>
  );
}

// individual step builders
function Step1_Select({ theme, t }) {
  const { p } = theme;
  return (
    <FlowFrame theme={theme} num="01" title="Select a solution pack." sub="Catalog">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[['Printer GPO', 0.86, p.warn], ['ERP Access', 0.74, p.accent], ['K8s Ingress', 0.69, p.accent], ['Cyber Quar.', 0.58, p.mute]].map(([n,s,c],i)=>(
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '1fr 38px', alignItems: 'center', gap: 10,
                                  padding: '8px 10px', border: `1px solid ${i===0?c:p.line}`,
                                  background: i===0 ? `color-mix(in oklch, ${c} 10%, transparent)` : 'transparent' }}>
            <span style={{ fontSize: 12 }}>{n}</span>
            <span style={{ fontFamily: 'var(--p-mono)', fontSize: 10.5, color: c, textAlign: 'right' }}>{s.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </FlowFrame>
  );
}

function Step2_Context({ theme }) {
  const { p } = theme;
  return (
    <FlowFrame theme={theme} num="02" title="Load customer context." sub="Discovery">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--p-mono)', fontSize: 10.5 }}>
        {[['Industry','Manufacturing'], ['Plant','GA-PLANT'], ['Buyer','Dir. of Ops'], ['Tickets','12 / mo'], ['Vendors','MSP · Tier-2']].map(([k,v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px dashed ${p.line}`,
                                  paddingBottom: 5 }}>
            <span style={{ color: p.mute }}>{k}</span><span style={{ color: p.text }}>{v}</span>
          </div>
        ))}
      </div>
    </FlowFrame>
  );
}

function Step3_Compile({ theme }) {
  const { p } = theme;
  // tiny ontology graph
  return (
    <FlowFrame theme={theme} num="03" title="Compile operational ontology." sub="Mapping · 0.86">
      <svg viewBox="0 0 220 160" style={{ width: '100%', height: '100%' }}>
        {[['Site',40,40],['Asset',110,30],['Incident',180,60],['Process',160,120],['Vendor',60,120]].map(([l,x,y],i)=>(
          <g key={i}>
            <rect x={x-26} y={y-10} width="52" height="20" fill={p.surface} stroke={l==='Incident'?p.warn:p.line} />
            <text x={x} y={y+3} fontSize="9" fontFamily="var(--p-mono)" fill={p.text} textAnchor="middle">{l}</text>
          </g>
        ))}
        <g stroke={p.faint} strokeWidth="1">
          <line x1="40" y1="40" x2="110" y2="30" /><line x1="110" y1="30" x2="180" y2="60" />
          <line x1="180" y1="60" x2="160" y2="120" /><line x1="40" y1="40" x2="60" y2="120" />
          <line x1="60" y1="120" x2="160" y2="120" />
        </g>
      </svg>
    </FlowFrame>
  );
}

function Step4_FieldLab({ theme }) {
  const { p } = theme;
  return (
    <FlowFrame theme={theme} num="04" title="Start FieldLab." sub="floci · live">
      <div style={{ fontFamily: 'var(--p-mono)', fontSize: 10.5, lineHeight: 1.85 }}>
        <div style={{ color: p.ok }}>● floci · :4566 · up</div>
        <div style={{ color: p.text }}>$ praxis fieldlab up</div>
        <div style={{ color: p.mute }}>  ↳ sqs · ok</div>
        <div style={{ color: p.mute }}>  ↳ s3 · ok</div>
        <div style={{ color: p.mute }}>  ↳ ddb · ok</div>
        <div style={{ color: p.warn }}>  ↳ event bus → READY</div>
      </div>
    </FlowFrame>
  );
}

function Step5_Stream({ theme }) {
  const { p } = theme;
  return (
    <FlowFrame theme={theme} num="05" title="Stream 12 messy events." sub="signal · 0.74 trust">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontFamily: 'var(--p-mono)', fontSize: 9.5 }}>
        {[
          ['12:04:22','printer.mapping.missing', p.warn],
          ['12:04:21','gpo.permission.issue',    p.warn],
          ['12:04:19','ticket.created',          p.accent],
          ['12:04:18','asset.state.update',      p.mute],
          ['12:04:13','ticket.linked',           p.accent2],
          ['12:04:09','point-and-print.policy',  p.warn],
        ].map(([t,e,c],i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 8 }}>
            <span style={{ color: p.mute }}>{t}</span>
            <span style={{ color: c }}>{e}</span>
          </div>
        ))}
      </div>
    </FlowFrame>
  );
}

function Step6_Decide({ theme }) {
  const { p } = theme;
  return (
    <FlowFrame theme={theme} num="06" title="Generate explainable decision." sub="priority · 0.74">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: 'var(--p-display)', fontSize: 56, fontWeight: 500, color: p.warn, lineHeight: 1 }}>0.74</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[['severity', 0.82], ['biz crit.', 0.91], ['recurrence', 0.68], ['evidence', 0.82]].map(([k,v])=>(
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 30px', gap: 8, alignItems: 'center',
                                    fontFamily: 'var(--p-mono)', fontSize: 9.5 }}>
              <span style={{ color: p.mute }}>{k}</span>
              <div style={{ height: 4, background: p.line, position: 'relative' }}>
                <div style={{ width: `${v*100}%`, height: '100%', background: p.accent }} />
              </div>
              <span style={{ color: p.text, textAlign: 'right' }}>{v.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </FlowFrame>
  );
}

function Step7_Action({ theme }) {
  const { p } = theme;
  return (
    <FlowFrame theme={theme} num="07" title="Capture human-approved action." sub="mode · assisted">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, lineHeight: 1.4 }}>
          Validate Point-and-Print policy, GPO permissions, local-IP printer drift.
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ flex: 1, textAlign: 'center', padding: '7px 0', border: `1px solid ${p.line}`,
                          fontFamily: 'var(--p-mono)', fontSize: 9.5, color: p.mute }}>SKIP</span>
          <span style={{ flex: 2, textAlign: 'center', padding: '7px 0', background: p.warn, color: p.bg,
                          fontFamily: 'var(--p-mono)', fontSize: 9.5, letterSpacing: '.06em' }}>APPROVE & ROUTE</span>
        </div>
        <div style={{ fontFamily: 'var(--p-mono)', fontSize: 9, color: p.mute, marginTop: 4 }}>
          audit_hash · 9f3a2c · → s3://praxis-audit-artifacts
        </div>
      </div>
    </FlowFrame>
  );
}

function Step8_Readout({ theme, t }) {
  const { p } = theme;
  return (
    <FlowFrame theme={theme} num="08" title="Generate executive readout." sub="$38.4K / yr">
      <div style={{ background: p.surface, border: `1px solid ${p.line}`, padding: 12, height: '100%' }}>
        <div style={{ fontFamily: 'var(--p-mono)', fontSize: 8.5, color: p.mute, letterSpacing: '.12em' }}>EXEC READOUT</div>
        <div style={{ fontFamily: 'var(--p-display)', fontSize: 16, fontWeight: 500, marginTop: 6, lineHeight: 1.2 }}>
          Printer GPO failure costs <span style={{ color: p.warn }}>$38.4K/yr</span>.
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: 'var(--p-mono)', fontSize: 9 }}>
          <div><div style={{ color: p.mute }}>EVIDENCE</div><div style={{ color: p.ok }}>0.82</div></div>
          <div><div style={{ color: p.mute }}>VALUE</div><div style={{ color: p.warn }}>$38.4K</div></div>
          <PraxisMark variant={t.logoVariant} size={20} color={p.text} accent={p.warn} />
        </div>
      </div>
    </FlowFrame>
  );
}

Object.assign(window, {
  Step1_Select, Step2_Context, Step3_Compile, Step4_FieldLab,
  Step5_Stream, Step6_Decide, Step7_Action, Step8_Readout,
});
