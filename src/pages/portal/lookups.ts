import { fetchConsultants, fetchProfiles, fetchServices } from '../../lib/data';
import type { Consultant, Profile, Service } from '../../lib/types';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../store/auth';

export type Lookups = {
  consultants: Record<string, Consultant>;
  services: Record<string, Service>;
  profiles: Record<string, Profile>;
  consultantList: Consultant[];
  serviceList: Service[];
  profileList: Profile[];
};

/** Reference data used across portal pages (profiles only load for admins). */
export function useLookups() {
  const isAdmin = useAuth((s) => s.profile?.role === 'admin');
  return useAsync<Lookups>(async () => {
    const [c, s, p] = await Promise.all([fetchConsultants(), fetchServices(), isAdmin ? fetchProfiles() : Promise.resolve([])]);
    return {
      consultants: Object.fromEntries(c.map((x) => [x.slug, x])),
      services: Object.fromEntries(s.map((x) => [x.id, x])),
      profiles: Object.fromEntries(p.map((x) => [x.id, x])),
      consultantList: c,
      serviceList: s,
      profileList: p,
    };
  }, [isAdmin]);
}

export const personName = (l: Lookups | null, id: string | null | undefined) =>
  (id && (l?.profiles[id]?.full_name || l?.profiles[id]?.email)) || '';
