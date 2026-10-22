import { ExternalLink, Lock, MessageCircle, MessagesSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ConsultantContact } from '../lib/types';
import { useAuth } from '../store/auth';

/**
 * A consultant's own Discord and Signal details. The database only returns them to admins and to
 * clients who have paid for a session with that consultant, so everyone else sees how to unlock them.
 */
export function DirectContact({ slug, first, compact = false }: { slug: string; first: string; compact?: boolean }) {
  const profile = useAuth((s) => s.profile);
  const [contact, setContact] = useState<ConsultantContact | null | undefined>(undefined);

  useEffect(() => {
    if (!supabase || !profile) {
      setContact(null);
      return;
    }
    void supabase
      .rpc('my_consultant_contacts')
      .then(({ data }) => setContact(((data ?? []) as ConsultantContact[]).find((c) => c.consultant_slug === slug) ?? null));
  }, [profile, slug]);

  if (contact === undefined) return null;
  const has = contact && (contact.discord_username || contact.discord_link || contact.signal_username || contact.signal_link);

  if (!has) {
    if (compact) return null;
    return (
      <p className="muted small row" style={{ alignItems: 'flex-start' }}>
        <Lock size={14} style={{ flex: 'none', marginTop: 3 }} />
        <span>
          {first}'s direct Discord and Signal open up after your first paid session.{' '}
          {!profile && <><Link to="/login">Sign in</Link> to see them if you have already booked.</>}
        </span>
      </p>
    );
  }

  return (
    <div className="stack" style={{ gap: '0.5rem' }}>
      <p className="small" style={{ margin: 0 }}><strong>Reach {first} directly</strong></p>
      {(contact!.discord_username || contact!.discord_link) && (
        <p className="row small" style={{ margin: 0 }}>
          <MessagesSquare size={16} /> Discord{contact!.discord_username && <>: <strong>{contact!.discord_username}</strong></>}
          {contact!.discord_link && <a href={contact!.discord_link} target="_blank" rel="noopener noreferrer" className="row">Open <ExternalLink size={13} /></a>}
        </p>
      )}
      {(contact!.signal_username || contact!.signal_link) && (
        <p className="row small" style={{ margin: 0 }}>
          <MessageCircle size={16} /> Signal{contact!.signal_username && <>: <strong>{contact!.signal_username}</strong></>}
          {contact!.signal_link && <a href={contact!.signal_link} target="_blank" rel="noopener noreferrer" className="row">Open <ExternalLink size={13} /></a>}
        </p>
      )}
      <p className="muted small" style={{ margin: 0 }}>Usernames only. We never share phone numbers.</p>
    </div>
  );
}
