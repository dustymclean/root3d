import {
  ArrowLeft, ArrowRight, BookOpen, Calculator, ClipboardList, Copy, Download, FileText, Leaf, Printer, RotateCcw, Stethoscope, Thermometer,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, CtaBand, Disclaimer, LeadCapture } from '../../components/blocks';
import { Field, Notice, PageHead, Success } from '../../components/ui';
import { findNode, type Node } from '../../data/diagnose';
import { gearLocker } from '../../data/growcoach';
import { findArticle } from '../../data/knowledge';
import { businessTypes, buildSop, jurisdictions, topics, type Answers, type BusinessType } from '../../data/sop';

const tools = [
  { to: '/resources/sop-generator', icon: ClipboardList, title: 'SOP Generator', text: 'Choose your business type and state, answer a few questions, and get an editable SOP draft you can download as Word or PDF.' },
  { to: '/resources/total-thc', icon: Calculator, title: 'Total THC calculator', text: 'Calculate (THCA × 0.877) + Δ9-THC from a certificate of analysis and compare it with a limit.' },
  { to: '/resources/vpd', icon: Thermometer, title: 'VPD calculator', text: 'Air and leaf vapor pressure deficit from temperature and humidity.' },
  { to: '/resources/troubleshooter', icon: Stethoscope, title: 'Plant troubleshooter', text: 'A decision tree for common leaf symptoms that tells you what to check first.' },
  { to: '/knowledge-base', icon: BookOpen, title: 'Knowledge Base', text: 'The Compliance Vault: source-backed guides with review dates and citations.' },
  { to: '/grow-coach#gear-locker', icon: Leaf, title: 'Gear Locker', text: 'The inspection, measurement, and clean-room basics our coaches ask growers to have.' },
  { to: '/case-studies', icon: FileText, title: 'Case studies', text: 'How an engagement runs from the first symptom to the follow-up.' },
];

export function Resources() {
  return (
    <>
      <section className="section">
        <div className="container">
          <PageHead eyebrow="Resources" title="Free tools and guides">
            No sign-up wall. Use what helps, and call us when you want a second set of eyes.
          </PageHead>
          <div className="grid grid-3">
            {tools.map((t) => (
              <Link key={t.to} to={t.to} className="card hover area-card">
                <div className="icon-chip"><t.icon size={20} /></div>
                <h3>{t.title}</h3>
                <p className="muted small">{t.text}</p>
                <span className="more">Open <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
          <Disclaimer />
        </div>
      </section>
      <section className="section soft">
        <div className="container grid grid-2">
          <div className="card">
            <h3>Gear Locker preview</h3>
            <ul className="gear">
              {gearLocker[0].items.concat(gearLocker[1].items.slice(0, 2)).map((i) => (
                <li key={i.name}><strong>{i.name}</strong><span className="small muted">{i.why}</span></li>
              ))}
            </ul>
            <Link to="/grow-coach#gear-locker" className="small">See the full Gear Locker</Link>
          </div>
          <LeadCapture source="resources" />
        </div>
      </section>
    </>
  );
}

/* ---------------- SOP Generator ---------------- */

const blankAnswers: Answers = { company: '', facility: '', license: '', owner: '', approver: '', tracking: '', retention: '', cameraRetention: '', effective: new Date().toISOString().slice(0, 10) };

function download(name: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const docStyles = `body{font-family:Georgia,serif;max-width:800px;margin:2rem auto;padding:0 1rem;color:#0f172a;line-height:1.5}
h1{font-size:24pt}h2{font-size:16pt;margin-top:1.6em;border-bottom:1px solid #ccc;padding-bottom:4px}h3{font-size:12pt;margin-bottom:.2em}
table{border-collapse:collapse;width:100%;margin:1em 0}th,td{border:1px solid #bbb;padding:6px 8px;text-align:left;vertical-align:top}
.disclaimer{background:#fff7e6;border:1px solid #f3dfb3;padding:8px 10px}`;

export function SopGenerator() {
  const [type, setType] = useState<BusinessType>('cultivation');
  const [jid, setJid] = useState('MS');
  const available = useMemo(() => topics.filter((t) => t.types.includes(type)), [type]);
  const [picked, setPicked] = useState<string[]>(() => topics.filter((t) => t.types.includes('cultivation')).map((t) => t.id));
  const [a, setA] = useState<Answers>(blankAnswers);
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const editor = useRef<HTMLDivElement>(null);
  const j = jurisdictions.find((x) => x.id === jid)!;
  const set = (k: keyof Answers) => (e: { target: { value: string } }) => setA({ ...a, [k]: e.target.value });

  function chooseType(t: BusinessType) {
    setType(t);
    setPicked(topics.filter((x) => x.types.includes(t)).map((x) => x.id));
    setHtml(null);
  }

  function generate() {
    const chosen = available.filter((t) => picked.includes(t.id));
    const tracking = a.tracking || j.tracking;
    setHtml(buildSop(type, j, chosen, { ...a, tracking }));
    setTimeout(() => editor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  const current = () => editor.current?.innerHTML ?? html ?? '';
  const fileBase = (a.company.trim() || 'root3d').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-sops';
  const wrap = (body: string) => `<!doctype html><html><head><meta charset="utf-8"><title>${fileBase}</title><style>${docStyles}</style></head><body>${body}</body></html>`;

  function printPdf() {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(wrap(current()));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  async function copyText() {
    await navigator.clipboard.writeText(editor.current?.innerText ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <section className="section">
        <div className="container">
          <Breadcrumb items={[{ to: '/resources', label: 'Resources' }, { label: 'SOP Generator' }]} />
          <PageHead eyebrow="Free tool" title="SOP Generator">
            Pick your business type and jurisdiction, choose the procedures you need, and answer a few questions. You get an
            editable starting draft you can download as a Word document or save as a PDF.
          </PageHead>
          <Notice>
            This creates a starting point, not a finished, compliant SOP. Rules differ by state and change often. Review every
            line against your current regulations and have compliance-sensitive procedures reviewed by a qualified person.
          </Notice>

          <div className="booking">
            <div>
              <div className="booking-step">
                <h3><span className="step-num">1</span> Business type</h3>
                <div className="option-grid">
                  {businessTypes.map((b) => (
                    <button key={b.id} className="option" aria-pressed={type === b.id} onClick={() => chooseType(b.id)}><strong>{b.label}</strong></button>
                  ))}
                </div>
              </div>

              <div className="booking-step">
                <h3><span className="step-num">2</span> Jurisdiction</h3>
                <select className="select" value={jid} onChange={(e) => setJid(e.target.value)} aria-label="Jurisdiction">
                  {jurisdictions.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                </select>
                {j.regulators.length > 0 ? (
                  <p className="small muted mt">
                    Regulator{j.regulators.length > 1 ? 's' : ''}: {j.regulators.map((r, i) => (
                      <span key={r.url}>{i > 0 && '; '}<a href={r.url} target="_blank" rel="noreferrer">{r.name}</a></span>
                    ))}
                  </p>
                ) : (
                  <p className="small muted mt">We will leave placeholders for your regulator and rules.</p>
                )}
              </div>

              <div className="booking-step">
                <h3><span className="step-num">3</span> Procedures to include</h3>
                <div className="check-grid">
                  {available.map((t) => (
                    <label key={t.id} className="check">
                      <input type="checkbox" checked={picked.includes(t.id)}
                        onChange={(e) => setPicked(e.target.checked ? [...picked, t.id] : picked.filter((x) => x !== t.id))} />
                      {t.title}
                    </label>
                  ))}
                </div>
              </div>

              <div className="booking-step">
                <h3><span className="step-num">4</span> About your operation</h3>
                <p className="small muted">Leave anything blank and we will put a [placeholder] in the draft.</p>
                <div className="form">
                  <div className="form-row">
                    <Field label="Company name"><input className="input" value={a.company} onChange={set('company')} /></Field>
                    <Field label="License number"><input className="input" value={a.license} onChange={set('license')} /></Field>
                  </div>
                  <Field label="Facility name and address"><input className="input" value={a.facility} onChange={set('facility')} /></Field>
                  <div className="form-row">
                    <Field label="SOP owner (name or title)"><input className="input" value={a.owner} onChange={set('owner')} placeholder="Compliance Manager" /></Field>
                    <Field label="Approved by"><input className="input" value={a.approver} onChange={set('approver')} /></Field>
                  </div>
                  <div className="form-row">
                    <Field label="Tracking system" hint={`Default for ${j.label}: ${j.tracking}`}><input className="input" value={a.tracking} onChange={set('tracking')} placeholder={j.tracking} /></Field>
                    <Field label="Effective date"><input className="input" type="date" value={a.effective} onChange={set('effective')} /></Field>
                  </div>
                  <div className="form-row">
                    <Field label="Record retention period" hint="Confirm with your rules"><input className="input" value={a.retention} onChange={set('retention')} placeholder="e.g. 5 years" /></Field>
                    <Field label="Camera footage retention" hint="Confirm with your rules"><input className="input" value={a.cameraRetention} onChange={set('cameraRetention')} placeholder="e.g. 60 days" /></Field>
                  </div>
                </div>
              </div>
            </div>
            <aside className="card summary">
              <h3>Your draft</h3>
              <dl>
                <dt>Type</dt><dd>{businessTypes.find((b) => b.id === type)?.label}</dd>
                <dt>Jurisdiction</dt><dd>{j.label}</dd>
                <dt>Procedures</dt><dd>{available.filter((t) => picked.includes(t.id)).length}</dd>
              </dl>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={!picked.some((p) => available.some((t) => t.id === p))} onClick={generate}>
                <FileText size={18} /> {html ? 'Regenerate draft' : 'Generate draft'}
              </button>
              {html && <p className="small muted mt">Regenerating replaces any edits you made below.</p>}
            </aside>
          </div>
        </div>
      </section>

      {html && (
        <section className="section soft">
          <div className="container">
            <div className="row between" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Edit your draft</h2>
                <p className="muted small" style={{ margin: 0 }}>Click anywhere in the document to edit. Exports include your edits.</p>
              </div>
              <div className="btn-row">
                <button className="btn btn-primary btn-sm" onClick={() => download(fileBase + '.doc', 'application/msword', wrap(current()))}><Download size={16} /> Word</button>
                <button className="btn btn-ghost btn-sm" onClick={printPdf}><Printer size={16} /> Print or save PDF</button>
                <button className="btn btn-ghost btn-sm" onClick={() => download(fileBase + '.html', 'text/html', wrap(current()))}><Download size={16} /> HTML</button>
                <button className="btn btn-ghost btn-sm" onClick={() => void copyText()}><Copy size={16} /> {copied ? 'Copied' : 'Copy text'}</button>
              </div>
            </div>
            <div ref={editor} className="sop-doc card" contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: html }} aria-label="SOP draft editor" />
            <div className="card mt row between" style={{ flexWrap: 'wrap' }}>
              <div style={{ maxWidth: 620 }}>
                <h3>Want it reviewed or finished for you?</h3>
                <p className="muted">Dusty writes inspection-ready SOPs from the actual rules, then walks them with your team so they match the floor.</p>
              </div>
              <Link to="/book?consultant=dusty-mclean&service=standard" className="btn btn-primary">Book an SOP review</Link>
            </div>
          </div>
        </section>
      )}
      <section className="section"><div className="container"><LeadCapture source="SOP generator" /></div></section>
    </>
  );
}

/* ---------------- Total THC ---------------- */

export function ThcCalculator() {
  const [unit, setUnit] = useState<'pct' | 'mg'>('pct');
  const [thca, setThca] = useState('0.25');
  const [d9, setD9] = useState('0.05');
  const [limit, setLimit] = useState('0.3');
  const [grams, setGrams] = useState('');
  const n = (s: string) => (s.trim() === '' ? NaN : Number(s));
  const toPct = (v: number) => (unit === 'pct' ? v : v / 10);
  const total = toPct(n(thca)) * 0.877 + toPct(n(d9));
  const valid = Number.isFinite(total) && n(thca) >= 0 && n(d9) >= 0;
  const lim = n(limit);
  const over = valid && Number.isFinite(lim) && total > lim;
  const mgPerG = total * 10;
  const pkg = n(grams);

  return (
    <>
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <Breadcrumb items={[{ to: '/resources', label: 'Resources' }, { label: 'Total THC calculator' }]} />
          <PageHead eyebrow="Free tool" title="Total THC calculator">
            Total THC = (THCA × 0.877) + Δ9-THC. Enter the values from your certificate of analysis.
          </PageHead>
          <div className="card form">
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={unit === 'pct'} onClick={() => setUnit('pct')}>Percent (%)</button>
              <button role="tab" aria-selected={unit === 'mg'} onClick={() => setUnit('mg')}>mg/g</button>
            </div>
            <div className="form-row">
              <Field label={`THCA (${unit === 'pct' ? '%' : 'mg/g'})`}><input className="input" inputMode="decimal" value={thca} onChange={(e) => setThca(e.target.value)} /></Field>
              <Field label={`Δ9-THC (${unit === 'pct' ? '%' : 'mg/g'})`}><input className="input" inputMode="decimal" value={d9} onChange={(e) => setD9(e.target.value)} /></Field>
            </div>
            <div className="form-row">
              <Field label="Limit to compare (%)" hint="0.3% is the federal hemp threshold. Use your own rule’s limit."><input className="input" inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
              <Field label="Package weight (g, optional)"><input className="input" inputMode="decimal" value={grams} onChange={(e) => setGrams(e.target.value)} /></Field>
            </div>
          </div>
          <div className={`card result mt ${over ? 'over' : ''}`} aria-live="polite">
            {valid ? (
              <>
                <p className="eyebrow">Total THC</p>
                <p className="big-number">{total.toFixed(3)}%</p>
                <p className="muted">{mgPerG.toFixed(2)} mg per gram{Number.isFinite(pkg) && pkg > 0 && <> · {(mgPerG * pkg).toFixed(1)} mg in a {pkg} g package</>}</p>
                {Number.isFinite(lim) && (
                  <p><strong>{over ? `Above the ${lim}% limit` : `At or below the ${lim}% limit`}</strong> by {Math.abs(total - lim).toFixed(3)} percentage points.</p>
                )}
                <p className="small muted">Work: ({toPct(n(thca)).toFixed(3)} × 0.877) + {toPct(n(d9)).toFixed(3)} = {total.toFixed(3)}%</p>
              </>
            ) : (
              <p className="muted">Enter non-negative numbers for THCA and Δ9-THC.</p>
            )}
          </div>
          <Notice>
            Results near a limit depend on the lab’s measurement uncertainty, the reporting basis (for example dry weight), and
            how your rules apply them. This calculator does not account for those.
          </Notice>
          <p>Read <Link to="/knowledge-base/total-thc-explained">Total THC: what it is and how to calculate it</Link> for the background and sources.</p>
          <Disclaimer />
        </div>
      </section>
      <CtaBand title="Need batch monitoring?">Dusty builds lab-data tracking that flags a batch before it drifts toward a limit.</CtaBand>
    </>
  );
}

/* ---------------- VPD ---------------- */

const svp = (c: number) => 0.6108 * Math.exp((17.27 * c) / (c + 237.3));

export function VpdCalculator() {
  const [unit, setUnit] = useState<'F' | 'C'>('F');
  const [temp, setTemp] = useState('78');
  const [rh, setRh] = useState('55');
  const [offset, setOffset] = useState('-2');
  const toC = (v: number) => (unit === 'F' ? ((v - 32) * 5) / 9 : v);
  const offC = (v: number) => (unit === 'F' ? (v * 5) / 9 : v);
  const t = Number(temp), h = Number(rh), o = Number(offset);
  const valid = [t, h, o].every(Number.isFinite) && h >= 0 && h <= 100;
  const airC = toC(t);
  const leafC = airC + offC(o);
  const avp = svp(airC) * (h / 100);
  const airVpd = svp(airC) - avp;
  const leafVpd = svp(leafC) - avp;
  const bands = [
    { label: 'Propagation', lo: 0.4, hi: 0.8 },
    { label: 'Vegetative', lo: 0.8, hi: 1.2 },
    { label: 'Flower', lo: 1.2, hi: 1.6 },
  ];

  return (
    <>
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <Breadcrumb items={[{ to: '/resources', label: 'Resources' }, { label: 'VPD calculator' }]} />
          <PageHead eyebrow="Free tool" title="VPD calculator">Vapor pressure deficit from air temperature, relative humidity, and leaf temperature offset.</PageHead>
          <div className="card form">
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={unit === 'F'} onClick={() => { setUnit('F'); setTemp('78'); setOffset('-2'); }}>°F</button>
              <button role="tab" aria-selected={unit === 'C'} onClick={() => { setUnit('C'); setTemp('25.5'); setOffset('-1'); }}>°C</button>
            </div>
            <div className="form-row">
              <Field label={`Air temperature (°${unit})`}><input className="input" inputMode="decimal" value={temp} onChange={(e) => setTemp(e.target.value)} /></Field>
              <Field label="Relative humidity (%)"><input className="input" inputMode="decimal" value={rh} onChange={(e) => setRh(e.target.value)} /></Field>
              <Field label={`Leaf offset (°${unit})`} hint="Leaf minus air. Measure with an IR thermometer."><input className="input" inputMode="decimal" value={offset} onChange={(e) => setOffset(e.target.value)} /></Field>
            </div>
          </div>
          <div className="card result mt" aria-live="polite">
            {valid ? (
              <div className="grid grid-2">
                <div><p className="eyebrow">Leaf VPD</p><p className="big-number">{leafVpd.toFixed(2)} kPa</p></div>
                <div><p className="eyebrow">Air VPD</p><p className="big-number">{airVpd.toFixed(2)} kPa</p></div>
              </div>
            ) : (
              <p className="muted">Enter a temperature, a humidity between 0 and 100, and an offset.</p>
            )}
            {valid && (
              <div className="vpd-bands">
                {bands.map((b) => (
                  <span key={b.label} className={leafVpd >= b.lo && leafVpd <= b.hi ? 'on' : ''}>{b.label}: {b.lo}–{b.hi}</span>
                ))}
              </div>
            )}
          </div>
          <p className="small muted mt">The ranges shown are commonly cited starting points, not rules. Targets vary by cultivar, stage, and facility.</p>
          <p>Background: <Link to="/knowledge-base/vpd-basics">Vapor pressure deficit in plain language</Link>.</p>
        </div>
      </section>
      <CtaBand title="Environment fighting you?">Danny reviews HVAC, dehumidification, and airflow as one system.</CtaBand>
    </>
  );
}

/* ---------------- Troubleshooter ---------------- */

export function Troubleshooter() {
  const [path, setPath] = useState<string[]>(['start']);
  const node: Node = findNode(path[path.length - 1]);
  const isResult = 'result' in node;
  const article = isResult && node.article ? findArticle(node.article) : undefined;

  return (
    <>
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <Breadcrumb items={[{ to: '/resources', label: 'Resources' }, { label: 'Plant troubleshooter' }]} />
          <PageHead eyebrow="Free tool" title="Plant troubleshooter">
            Answer a few questions about what you see. We will narrow down likely causes and tell you what to check first.
          </PageHead>
          <div className="card">
            <div className="row between">
              <span className="small muted">Step {path.length}</span>
              <div className="btn-row">
                {path.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => setPath(path.slice(0, -1))}><ArrowLeft size={14} /> Back</button>}
                {path.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => setPath(['start'])}><RotateCcw size={14} /> Start over</button>}
              </div>
            </div>
            {'question' in node ? (
              <>
                <h2>{node.question}</h2>
                <div className="option-grid">
                  {node.options.map((o) => (
                    <button key={o.label} className="option" onClick={() => setPath([...path, o.next])}><strong>{o.label}</strong></button>
                  ))}
                </div>
              </>
            ) : (
              <div aria-live="polite">
                <p className="eyebrow">Most likely</p>
                <h2>{node.result}</h2>
                <div className="grid grid-3">
                  <div><h3>Possible causes</h3><ul>{node.likely.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div><h3>Check first</h3><ul>{node.checkFirst.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div><h3>Next steps</h3><ul>{node.next.map((x) => <li key={x}>{x}</li>)}</ul></div>
                </div>
                {article && <p>Read more: <Link to={`/knowledge-base/${article.slug}`}>{article.title}</Link></p>}
                <Success>Want a cultivator to confirm? Upload sharp photos to your pre-call inbox and book a 15-minute quick call.</Success>
                <div className="btn-row mt">
                  <Link to="/book?service=home-grow" className="btn btn-primary">Book a quick call</Link>
                  <Link to="/grow-coach" className="btn btn-ghost">Find a Grow Coach</Link>
                </div>
              </div>
            )}
          </div>
          <Disclaimer>Educational only. Symptoms overlap, and several causes often happen at once. Always check root-zone pH and environment first, and identify a pest before treating it.</Disclaimer>
        </div>
      </section>
    </>
  );
}
