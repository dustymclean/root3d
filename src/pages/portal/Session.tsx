import { Camera, CameraOff, Clock, Maximize2, Mic, MicOff, MonitorUp, PhoneOff, Plus, ZoomIn } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorText, Loading, Notice } from '../../components/ui';
import { db, q } from '../../lib/supabase';
import type { Booking, FileRow } from '../../lib/types';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../store/auth';
import { useLookups } from './lookups';
import { FilePanel } from './shared';

// Jitsi Meet External API: https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe
type JitsiApi = {
  executeCommand: (cmd: string, ...args: unknown[]) => void;
  addListener: (event: string, fn: (e: { muted?: boolean; on?: boolean }) => void) => void;
  dispose: () => void;
};
declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, opts: Record<string, unknown>) => JitsiApi;
  }
}

const domain = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';
// JaaS (8x8.vc) rooms must be prefixed with the app id, e.g. "vpaas-magic-cookie-abc123/".
const roomPrefix = import.meta.env.VITE_JITSI_ROOM_PREFIX || '';

function loadJitsi(): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://${domain}/external_api.js`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load the video service.'));
    document.head.appendChild(s);
  });
}

export function Session() {
  const { id = '' } = useParams();
  const profile = useAuth((s) => s.profile)!;
  const isAdmin = profile.role === 'admin';
  const navigate = useNavigate();
  const look = useLookups();
  const booking = useAsync(() => q<Booking>(db().from('bookings').select('*').eq('id', id).single()), [id]);
  const files = useAsync(() => q<FileRow[]>(db().from('files').select('*').eq('booking_id', id).order('created_at')), [id]);
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<JitsiApi | null>(null);
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);
  const [macro, setMacro] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [extendAsked, setExtendAsked] = useState(false);

  const b = booking.data;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!b || !host.current || b.status !== 'confirmed') return;
    let disposed = false;
    loadJitsi()
      .then(() => {
        if (disposed || !host.current || !window.JitsiMeetExternalAPI) return;
        api.current = new window.JitsiMeetExternalAPI(domain, {
          roomName: `${roomPrefix}root3d-${b.room}`,
          parentNode: host.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: profile.full_name || profile.email, email: profile.email },
          configOverwrite: {
            prejoinPageEnabled: false,
            prejoinConfig: { enabled: false },
            toolbarButtons: [],
            disableDeepLinking: true,
            hideConferenceSubject: true,
            disableInviteFunctions: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            TOOLBAR_BUTTONS: [],
            MOBILE_APP_PROMO: false,
          },
        });
        api.current.addListener('audioMuteStatusChanged', (e) => setAudio(!e.muted));
        api.current.addListener('videoMuteStatusChanged', (e) => setVideo(!e.muted));
      })
      .catch((e: Error) => setError(e.message));
    return () => {
      disposed = true;
      api.current?.dispose();
      api.current = null;
    };
  }, [b, profile.full_name, profile.email]);

  if (booking.loading || !look.data) return <Loading />;
  if (!b) return <ErrorText error={booking.error} />;
  if (b.status !== 'confirmed') return <Notice>This session is {b.status}. <Link to={`/portal/appointments/${b.id}`}>Back to the appointment</Link>.</Notice>;

  const start = new Date(b.starts_at).getTime();
  const end = new Date(b.ends_at).getTime();
  const elapsed = Math.max(0, now - start);
  const remaining = end - now;
  const fmt = (ms: number) => {
    const s = Math.floor(Math.abs(ms) / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };
  const showExtend = elapsed >= 50 * 60_000 && remaining > 0 && !extendAsked;

  async function extend() {
    setExtendAsked(true);
    const { error } = await db().rpc('extend_booking', { p_booking: b!.id });
    if (error) setError(error.message);
    else void booking.reload();
  }

  const leave = () => {
    api.current?.executeCommand('hangup');
    navigate(`/portal/appointments/${b.id}`);
  };

  return (
    <div className="stack">
      <div className="row between">
        <div>
          <h2 style={{ margin: 0 }}>{look.data.services[b.service_id]?.name}</h2>
          <span className="muted small">with {look.data.consultants[b.consultant_slug]?.name}</span>
        </div>
        <span className="row timer">
          <Clock size={16} /> {now < start ? `Starts in ${fmt(start - now)}` : remaining > 0 ? `${fmt(remaining)} left` : `Over by ${fmt(remaining)}`}
        </span>
      </div>
      {showExtend && (
        <Notice>
          Need more time? <button className="linkish" onClick={() => void extend()}><Plus size={14} /> Add 15 minutes for $25</button>
        </Notice>
      )}
      <ErrorText error={error} />
      <div className="room">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className={`video-frame ${macro ? 'macro' : ''}`}>
            <div className="jitsi" ref={host} />
          </div>
          <div className="video-controls">
            <button className={`ctrl ${audio ? '' : 'on'}`} aria-label={audio ? 'Mute' : 'Unmute'} onClick={() => api.current?.executeCommand('toggleAudio')}>
              {audio ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button className={`ctrl ${video ? '' : 'on'}`} aria-label={video ? 'Camera off' : 'Camera on'} onClick={() => api.current?.executeCommand('toggleVideo')}>
              {video ? <Camera size={20} /> : <CameraOff size={20} />}
            </button>
            <button className="ctrl" aria-label="Share screen" onClick={() => api.current?.executeCommand('toggleShareScreen')}><MonitorUp size={20} /></button>
            <button className={`ctrl ${macro ? 'on' : ''}`} aria-label="Macro mode" aria-pressed={macro} title="Macro mode: 2.5x zoom for trichomes, stomata, and mites" onClick={() => setMacro((m) => !m)}>
              <ZoomIn size={20} />
            </button>
            <button className="ctrl" aria-label="Full screen" onClick={() => host.current?.parentElement?.requestFullscreen?.()}><Maximize2 size={20} /></button>
            <button className="ctrl danger" aria-label="Leave" onClick={leave}><PhoneOff size={20} /></button>
          </div>
          {macro && <p className="muted small" style={{ padding: '0 1rem 1rem' }}>Macro mode magnifies the live view. For true detail, upload a close-up photo to the inbox.</p>}
        </div>
        <div className="card">
          <h3>Pre-call inbox</h3>
          <FilePanel clientId={b.client_id} bookingId={b.id} files={files.data ?? []} onChange={() => void files.reload()} />
          {isAdmin && (
            <p className="small mt">
              When you finish, <Link to={`/portal/appointments/${b.id}`}>submit the action plan</Link> (3+ steps) to close the session.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
