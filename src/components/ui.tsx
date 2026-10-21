import { AlertTriangle, CheckCircle2, Inbox, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice" role="note">
      <AlertTriangle size={16} aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function Success({ children }: { children: ReactNode }) {
  return (
    <div className="success" role="status">
      <CheckCircle2 size={20} aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="empty" role="status">
      <Loader2 size={24} className="spin" aria-hidden />
      <div>{label}…</div>
    </div>
  );
}

export function ErrorText({ error }: { error: string | null | undefined }) {
  return error ? (
    <p className="error-text" role="alert">
      {error}
    </p>
  ) : null;
}

export function Empty({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="empty">
      {icon ?? <Inbox size={32} aria-hidden />}
      <div>{children}</div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`status ${status}`}>{status.replace('_', ' ')}</span>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <small className="muted">{hint}</small>}
    </label>
  );
}

export function PageHead({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="section-head">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {children && <p className="lede">{children}</p>}
    </div>
  );
}
