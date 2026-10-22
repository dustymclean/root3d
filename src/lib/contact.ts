import { MapPin, MessageCircle, MessagesSquare, Video, type LucideIcon } from 'lucide-react';
import type { AppointmentMode } from './types';

/** The only ways we meet clients: Signal, Discord, or the Manna Zoom room. On-site visits are for facility work. */
export const contactModes: AppointmentMode[] = ['zoom', 'discord', 'signal', 'onsite'];

export const modeLabels: Record<AppointmentMode, string> = {
  zoom: 'Zoom',
  discord: 'Discord',
  signal: 'Signal',
  onsite: 'On-site',
};

export const modeIcons: Record<AppointmentMode, LucideIcon> = {
  zoom: Video,
  discord: MessagesSquare,
  signal: MessageCircle,
  onsite: MapPin,
};

export const modeBlurbs: Record<AppointmentMode, string> = {
  zoom: 'Video in our Zoom room. Your consultant posts the link here.',
  discord: 'Video or voice on Discord. Tell us your Discord username.',
  signal: 'Secure call on Signal using your Signal username, never a phone number.',
  onsite: 'We come to your facility.',
};

/** What the client types in for a mode, if anything. */
export const handleField: Partial<Record<AppointmentMode, { label: string; hint: string; min: number }>> = {
  discord: { label: 'Your Discord username', hint: 'For example root3d_client. We will send you a link or a friend request.', min: 2 },
  signal: { label: 'Your Signal username', hint: 'In Signal: Settings → Profile → Username. Please do not share a phone number.', min: 2 },
  onsite: { label: 'Facility address', hint: 'Travel costs for on-site visits are confirmed with you before the visit.', min: 5 },
};

export const looksLikePhone = (s: string) => /\d{3}\D{0,3}\d{3}\D{0,3}\d{4}/.test(s);
