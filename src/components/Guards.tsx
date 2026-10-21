import { Database } from 'lucide-react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { backendReady } from '../lib/supabase';
import { useAuth } from '../store/auth';
import { Loading } from './ui';

export function SetupNeeded() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="card">
          <div className="icon-chip">
            <Database size={20} />
          </div>
          <h2>Accounts are almost ready</h2>
          <p className="muted">
            Sign-in, booking, messaging, and the portals switch on once the site is connected to its database. If you
            run this site, follow <strong>SETUP.md</strong> in the repository (about 10 minutes).
          </p>
          <p className="muted">In the meantime, reach us at the contact page.</p>
        </div>
      </div>
    </section>
  );
}

/** Requires a signed-in user (any role). Admin-only areas also enforce access in the database. */
export function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { profile, ready } = useAuth();
  const location = useLocation();
  if (!backendReady) return <SetupNeeded />;
  if (!ready) return <Loading />;
  if (!profile) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && profile.role !== 'admin') return <Navigate to="/portal" replace />;
  return <>{children}</>;
}
