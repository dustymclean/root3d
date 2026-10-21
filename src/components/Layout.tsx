import { LogIn, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { asset } from '../lib/data';
import { useAuth } from '../store/auth';

const links = [
  { to: '/services', label: 'Services' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/team', label: 'Team' },
  { to: '/contact', label: 'Contact' },
];

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
            <span className="brand-badge"><img src={asset('mark.png')} alt="" width={30} height={30} /></span>
            Root3D
          </Link>
          <button className="nav-toggle" aria-expanded={open} aria-controls="nav-menu" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div id="nav-menu" className={`nav-menu ${open ? 'open' : ''}`}>
            <ul className="nav-links">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to}>{l.label}</NavLink>
                </li>
              ))}
            </ul>
            <div className="nav-actions">
              {profile ? (
                <Link className="btn btn-ghost btn-sm" to="/portal">
                  My portal
                </Link>
              ) : (
                <Link className="btn btn-ghost btn-sm" to="/login">
                  <LogIn size={16} /> Sign in
                </Link>
              )}
              <Link className="btn btn-primary btn-sm" to="/book">
                Book a call
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
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="row" style={{ marginBottom: '0.5rem' }}>
              <img src={asset('mark.png')} alt="" width={48} height={48} />
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--white)', margin: 0 }}>Root3D Consulting</p>
            </div>
            <p>Licensing, compliance, and cultivation science from three owner-operators who still get their hands dirty.</p>
          </div>
          <div>
            <h4>Work with us</h4>
            <ul>
              <li><Link to="/book">Book a session</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/services">Services</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/team">Team</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/portal">Client portal</Link></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Root3D Consulting LLC</span>
          <span>Educational and advisory services. We do not grow, sell, or transport cannabis.</span>
        </div>
      </div>
    </footer>
  );
}
