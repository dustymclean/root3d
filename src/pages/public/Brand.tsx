import { Check, Copy, Download } from 'lucide-react';
import { useState } from 'react';
import { PageHead } from '../../components/ui';
import { asset } from '../../lib/data';

type Swatch = { name: string; hex: string; use: string };

const brandColors: Swatch[] = [
  { name: 'Root Blue', hex: '#2FA3B8', use: 'Leaf outline on light backgrounds' },
  { name: 'Sky Blue', hex: '#5ABFD0', use: 'Leaf outline on dark backgrounds' },
  { name: 'Rose', hex: '#E39AA6', use: 'Inlines and the "3D" on light backgrounds' },
  { name: 'Blush', hex: '#F2B5BF', use: 'Inlines and the "3D" on dark backgrounds' },
  { name: 'Black', hex: '#0D0D0F', use: 'Wordmark, dark backgrounds' },
  { name: 'Charcoal', hex: '#1C1D21', use: 'Dark surfaces, cards' },
  { name: 'White', hex: '#FFFFFF', use: 'Light backgrounds, reversed text' },
];

const siteColors: Swatch[] = [
  { name: 'Night', hex: '#050605', use: 'Website background' },
  { name: 'Surface', hex: '#0E1210', use: 'Website cards' },
  { name: 'Gold', hex: '#D4AF6A', use: 'Website accents and borders' },
  { name: 'Gold Light', hex: '#F1D79C', use: 'Website highlights' },
  { name: 'Gold Deep', hex: '#A8823E', use: 'Website gradients' },
  { name: 'Leaf Green', hex: '#4CC38A', use: 'Website success and accent' },
  { name: 'Ivory', hex: '#F4ECD8', use: 'Website headings' },
];

const logos = [
  { file: 'brand/root3d-logo-square-light.png', label: 'Square logo, light', dark: false },
  { file: 'brand/root3d-logo-square-dark.png', label: 'Square logo, dark', dark: true },
  { file: 'brand/root3d-logo-wide-light.png', label: 'Wide logo, light', dark: false },
  { file: 'brand/root3d-logo-wide-dark.png', label: 'Wide logo, dark', dark: true },
  { file: 'brand/root3d-leaf-mark.svg', label: 'Leaf mark (SVG, vector)', dark: false },
  { file: 'brand/root3d-linkedin-cover.png', label: 'LinkedIn / social cover', dark: true },
];

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

const cssVars = (prefix: string, list: Swatch[]) =>
  `:root {\n${list.map((c) => `  --${prefix}-${c.name.toLowerCase().replace(/\s+/g, '-')}: ${c.hex};`).join('\n')}\n}`;

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key = text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1400);
    });
  };
  return { copied, copy };
}

function Palette({ title, note, list, prefix }: { title: string; note: string; list: Swatch[]; prefix: string }) {
  const { copied, copy } = useCopy();
  const block = cssVars(prefix, list);
  return (
    <div className="brand-block">
      <h2>{title}</h2>
      <p className="muted">{note}</p>
      <div className="brand-swatches">
        {list.map((c) => (
          <div className="brand-swatch" key={c.hex + c.name}>
            <button className="brand-chip" style={{ background: c.hex }} onClick={() => copy(c.hex)} aria-label={`Copy ${c.name} ${c.hex}`}>
              {copied === c.hex ? <Check size={18} /> : <Copy size={16} />}
            </button>
            <strong>{c.name}</strong>
            <button className="brand-code" onClick={() => copy(c.hex)}>{c.hex}</button>
            <button className="brand-code" onClick={() => copy(rgb(c.hex))}>{copied === rgb(c.hex) ? 'Copied' : rgb(c.hex)}</button>
            <span className="muted small">{c.use}</span>
          </div>
        ))}
      </div>
      <div className="brand-css">
        <div className="row-between">
          <span className="eyebrow">CSS variables</span>
          <button className="btn btn-sm btn-ghost" onClick={() => copy(block, prefix + 'css')}>
            {copied === prefix + 'css' ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy all</>}
          </button>
        </div>
        <pre>{block}</pre>
      </div>
    </div>
  );
}

export function Brand() {
  return (
    <section className="section brand-page">
      <style>{brandCss}</style>
      <div className="container">
        <PageHead eyebrow="Brand & assets" title="Root3D brand kit">
          Logos, colors and type for press, partners and anyone building with us. Click any color to copy it.
        </PageHead>

        <div className="brand-block">
          <h2>Logos</h2>
          <p className="muted">An art deco cannabis leaf drawn in a single weight of line, set inside a stepped arch. Keep clear space around the mark equal to the height of the "3D," and don't recolor, stretch or add effects.</p>
          <div className="brand-logos">
            {logos.map((l) => (
              <figure className={`brand-logo${l.dark ? ' is-dark' : ''}`} key={l.file}>
                <img src={asset(l.file)} alt={`Root3D ${l.label}`} loading="lazy" />
                <figcaption>
                  <span>{l.label}</span>
                  <a className="btn btn-sm btn-ghost" href={asset(l.file)} download><Download size={14} /> Download</a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <Palette title="Brand colors" note="The 2026 Root3D brand: site blue, black and white with pink accents." list={brandColors} prefix="r3d" />
        <Palette title="Website colors" note="The colors currently used across r3dconsulting.com." list={siteColors} prefix="r3d-site" />

        <div className="brand-block">
          <h2>Typography</h2>
          <div className="brand-type">
            <div className="card">
              <span className="eyebrow">Wordmark and headings</span>
              <p className="brand-type-sample serif">Root<em>3D</em> Consulting</p>
              <p className="muted">Cormorant Garamond, 500. The "3D" is italic in Rose or Blush.</p>
            </div>
            <div className="card">
              <span className="eyebrow">Body and labels</span>
              <p className="brand-type-sample sans">CONSULTING · Tech that actually works.</p>
              <p className="muted">DM Sans or Inter, 400–500. Labels are uppercase with wide letter spacing.</p>
            </div>
          </div>
        </div>

        <div className="brand-block">
          <h2>Boilerplate</h2>
          <BoilerplateCopy />
        </div>
      </div>
    </section>
  );
}

const boilerplate =
  'Root3D Consulting is a technology consulting and digital solutions company based in Mississippi. We build websites, set up and fix IT, put NFC technology to work, and automate the repetitive stuff so owners can get back to running their business. Learn more at r3dconsulting.com.';

function BoilerplateCopy() {
  const { copied, copy } = useCopy();
  return (
    <div className="card">
      <p>{boilerplate}</p>
      <button className="btn btn-sm btn-ghost" onClick={() => copy(boilerplate, 'bp')}>
        {copied === 'bp' ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
      </button>
    </div>
  );
}

const brandCss = `
.brand-page .brand-block{margin-top:56px}
.brand-page .brand-block h2{margin-bottom:6px}
.brand-page .small{font-size:.82rem}
.brand-logos{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin-top:20px}
.brand-logo{margin:0;border:1px solid var(--border);border-radius:14px;overflow:hidden;background:#fff}
.brand-logo.is-dark{background:#0d0d0f}
.brand-logo img{display:block;width:100%;height:220px;object-fit:contain;padding:14px}
.brand-logo figcaption{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 14px;background:var(--surface);color:var(--text);font-size:.9rem}
.brand-swatches{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:16px;margin-top:20px}
.brand-swatch{display:flex;flex-direction:column;gap:4px}
.brand-chip{height:110px;border-radius:12px;border:1px solid rgba(255,255,255,.12);cursor:pointer;display:flex;align-items:flex-end;justify-content:flex-end;padding:10px;color:#fff;mix-blend-mode:normal;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.brand-code{background:none;border:0;padding:0;text-align:left;color:var(--text-soft);font:500 .85rem ui-monospace,SFMono-Regular,Menlo,monospace;cursor:pointer}
.brand-code:hover{color:var(--gold)}
.brand-css{margin-top:20px;border:1px solid var(--border);border-radius:12px;padding:14px 16px;background:var(--surface)}
.brand-css .row-between{display:flex;justify-content:space-between;align-items:center}
.brand-css pre{margin:10px 0 0;white-space:pre-wrap;font:.85rem/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--text)}
.brand-type{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;margin-top:20px}
.brand-type-sample{font-size:2rem;margin:10px 0}
.brand-type-sample.serif{font-family:"Cormorant Garamond",Georgia,serif}
.brand-type-sample.serif em{color:#F2B5BF}
.brand-type-sample.sans{font-family:"DM Sans",Inter,sans-serif;font-size:1.2rem;letter-spacing:.08em}
`;
