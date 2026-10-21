import { ChevronDown, LogIn, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { areas } from '../data/areas';
import { pillars, tagline } from '../data/company';
import { team } from '../data/team';
import { asset } from '../lib/data';
import { useAuth } from '../store/auth';

type NavItem = { to: string; label: string; children?: { to: string; label: string; note?: string }[] };

const links: NavItem[] = [
  {
    to: '/about',
    label: 'About',
    children: [
      { to: '/about', label: 'About Root3D', note: 'Mission, philosophy, and how we work' },
      { to: '/team', label: 'Meet the Consultants', note: 'Four backgrounds, one team' },
      ...team.map((t) => ({ to: `/team/${t.slug}`, label: t.name, note: t.focus })),
      { to: '/case-studies', label: 'Case Studies', note: 'How an engagement runs' },
    ],
  },
  {
    to: '/services',
    label: 'Services',
    children: [
      { to: '/services', label: 'All services', note: 'Practice areas and fixed-fee projects' },
      ...areas.map((a) => ({ to: `/services/${a.slug}`, label: a.title })),
      { to: '/grow-coach', label: 'Grow Coach Connection', note: 'Live video coaching' },
    ],
  },
  { to: '/pricing', label: 'Pricing' },
  {
    to: '/resources',
    label: 'Resources',
    children: [
      { to: '/resources', label: 'All resources' },
      { to: '/knowledge-base', label: 'Knowledge Base', note: 'The Compliance Vault' },
      { to: '/resources/sop-generator', label: 'SOP Generator' },
      { to: '/resources/total-thc', label: 'Total THC calculator' },
      { to: '/resources/vpd', label: 'VPD calculator' },
      { to: '/resources/troubleshooter', label: 'Plant troubleshooter' },
      { to: '/faq', label: 'FAQ' },
    ],
  },
  { to: '/contact', label: 'Contact' },
];

function NavGroup({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  const active = item.children?.some((c) => pathname === c.to || pathname.startsWith(c.to + '/'));
  return (
    <li className={`nav-group ${open ? 'open' : ''}`} onMouseLeave={() => setOpen(false)}>
      <button className={`nav-group-btn ${active ? 'active' : ''}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {item.label} <ChevronDown size={14} />
      </button>
      <div className="dropdown">
        {item.children!.map((c) => (
          <NavLink key={c.to + c.label} to={c.to} end>
            <span>{c.label}</span>
            {c.note && <small>{c.note}</small>}
          </NavLink>
        ))}
      </div>
    </li>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const profile = useAuth((s) => s.profile);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container nav">
          <Link to="/" className="brand" aria-label="Root3D Consulting home">
            <img className="brand-mark" src={asset('mark.png')} alt="" width={40} height={40} />
            <span className="brand-word">
              <span className="brand-name">ROOT3D</span>
              <span className="brand-sub">Consulting</span>
            </span>
          </Link>
          <button className="nav-toggle" aria-expanded={open} aria-controls="nav-menu" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div id="nav-menu" className={`nav-menu ${open ? 'open' : ''}`}>
            <ul className="nav-links">
              {links.map((l) =>
                l.children ? (
                  <NavGroup key={l.to} item={l} />
                ) : (
                  <li key={l.to}>
                    <NavLink to={l.to}>{l.label}</NavLink>
                  </li>
                ),
              )}
            </ul>
            <div className="nav-actions">
              {profile ? (
                <Link className="btn btn-ghost btn-sm" to="/portal">
                  My portal
                </Link>
              ) : (
                <Link className="btn btn-ghost btn-sm" to="/login">
                  <LogIn size={16} /> Client login
                </Link>
              )}
              <Link className="btn btn-primary btn-sm" to="/book">
                Book a consultation
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function Footer() {
  const col = (title: string, items: { to: string; label: string }[]) => (
    <div>
      <h4>{title}</h4>
      <ul>{items.map((i) => <li key={i.to}><Link to={i.to}>{i.label}</Link></li>)}</ul>
    </div>
  );
  return (
    <footer className="site-footer">
      <img className="footer-watermark" src={asset('mark.png')} alt="" aria-hidden="true" />
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand footer-brand" aria-label="Root3D Consulting home">
              <img className="brand-mark" src={asset('mark.png')} alt="" width={56} height={56} />
              <span className="brand-word">
                <span className="brand-name">ROOT3D</span>
                <span className="brand-sub">Consulting</span>
              </span>
            </Link>
            <p>{tagline}</p>
            <p className="footer-pillars">{pillars.join('  ✦  ')}</p>
          </div>
          {col('Services', [
            ...areas.map((a) => ({ to: `/services/${a.slug}`, label: a.title })),
            { to: '/grow-coach', label: 'Grow Coach Connection' },
            { to: '/pricing', label: 'Pricing' },
          ])}
          {col('Company', [
            { to: '/about', label: 'About Root3D' },
            { to: '/team', label: 'Meet the Consultants' },
            { to: '/case-studies', label: 'Case Studies' },
            { to: '/contact', label: 'Contact' },
            { to: '/book', label: 'Book a consultation' },
            { to: '/portal', label: 'Client login' },
          ])}
          {col('Resources', [
            { to: '/knowledge-base', label: 'Knowledge Base' },
            { to: '/resources/sop-generator', label: 'SOP Generator' },
            { to: '/resources/total-thc', label: 'Total THC calculator' },
            { to: '/resources/vpd', label: 'VPD calculator' },
            { to: '/resources/troubleshooter', label: 'Plant troubleshooter' },
            { to: '/faq', label: 'FAQ' },
          ])}
          {col('Policies', [
            { to: '/privacy', label: 'Privacy' },
            { to: '/terms', label: 'Terms' },
            { to: '/accessibility', label: 'Accessibility' },
            { to: '/policies/payment', label: 'Payment' },
            { to: '/policies/cancellation', label: 'Cancellation' },
            { to: '/policies/refunds', label: 'Refunds' },
          ])}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Root3D Consulting</span>
          <span>Educational and advisory services. We do not grow, sell, or transport cannabis, and nothing here is legal advice.</span>
        </div>
      </div>
    </footer>
  );
}
