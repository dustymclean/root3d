import { fallbackServices } from '../data/services';
import { growCoachExpertise } from '../data/growcoach';
import { team } from '../data/team';
import { q, supabase } from './supabase';
import type { Consultant, Profile, Service } from './types';
import { useAsync } from './useAsync';

export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '');

export async function fetchServices(): Promise<Service[]> {
  if (!supabase) return fallbackServices;
  return q(supabase.from('services').select('*').order('sort'));
}

export async function fetchConsultants(): Promise<Consultant[]> {
  if (!supabase) {
    return team.map((t, i) => ({
      slug: t.slug, profile_id: null, name: t.name, title: t.title, photo: t.photo, specialties: t.specialties.map((x) => x.title),
      timezone: 'America/Chicago', buffer_minutes: 15, min_notice_hours: 12, is_available_today: false,
      expertise: growCoachExpertise[t.slug] ?? [], verified: true, modes: ['virtual', 'phone', 'onsite'], active: true, sort: i,
    }));
  }
  return q(supabase.from('consultants').select('*').order('sort'));
}

export const useServices = () => useAsync(fetchServices);
export const useConsultants = () => useAsync(fetchConsultants);

/** Name lookup for client ids (admins can read all profiles). */
export async function fetchProfiles(): Promise<Profile[]> {
  if (!supabase) return [];
  return q(supabase.from('profiles').select('*').order('created_at', { ascending: false }));
}

export const byId = <T extends { id: string }>(rows: T[] | null | undefined) =>
  Object.fromEntries((rows ?? []).map((r) => [r.id, r])) as Record<string, T>;
