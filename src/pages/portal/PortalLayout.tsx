import {
  BarChart3, CalendarDays, ClipboardCheck, Clock, FileSignature, FolderOpen, Inbox, LayoutDashboard, LogOut, MessagesSquare,
  Receipt, ScrollText, Settings2, Tag, UserCircle, Users,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';

const clientLinks = [
  { to: '/portal', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/portal/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/portal/messages', label: 'Messages & support', icon: MessagesSquare },
  { to: '/portal/files', label: 'Files', icon: FolderOpen },
  { to: '/portal/plans', label: 'Action plans', icon: ClipboardCheck },
  { to: '/portal/invoices', label: 'Invoices', icon: Receipt },
  { to: '/portal/agreements', label: 'Agreements', icon: FileSignature },
  { to: '/portal/profile', label: 'Profile & intake', icon: UserCircle },
];

const adminLinks = [
  { to: '/portal/admin', label: 'Business overview', icon: BarChart3, end: true },
  { to: '/portal/admin/clients', label: 'Clients', icon: Users },
  { to: '/portal/admin/schedule', label: 'Availability', icon: Settings2 },
  { to: '/portal/admin/services', label: 'Pricing & services', icon: Tag },
  { to: '/portal/admin/billing', label: 'Billing & retainers', icon: Receipt },
  { to: '/portal/admin/time', label: 'Time tracking', icon: Clock },
  { to: '/portal/admin/inbox', label: 'Website inquiries', icon: Inbox },
  { to: '/portal/admin/users', label: 'Users & admins', icon: Users },
  { to: '/portal/admin/audit', label: 'Audit log', icon: ScrollText },
];

export function PortalLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'admin';
  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="container portal">
        <nav className="portal-nav" aria-label="Portal">
          <div className="small muted" style={{ padding: '0 0.8rem 0.5rem' }}>
            Signed in as <strong>{profile?.full_name || profile?.email}</strong>
            {isAdmin && <> · <span className="tag">admin</span></>}
          </div>
          {clientLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              <l.icon size={18} /> {isAdmin && l.to === '/portal/appointments' ? 'All appointments' : l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <div className="eyebrow" style={{ padding: '1rem 0.8rem 0', margin: 0 }}>Admin</div>
              {adminLinks.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end}>
                  <l.icon size={18} /> {l.label}
                </NavLink>
              ))}
            </>
          )}
          <button onClick={() => void signOut().then(() => navigate('/'))}>
            <LogOut size={18} /> Sign out
          </button>
        </nav>
        <div style={{ minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </section>
  );
}
