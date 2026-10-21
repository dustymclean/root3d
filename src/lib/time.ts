/** Offset (ms) of a time zone from UTC at a given instant. */
function tzOffset(at: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - at.getTime();
}

/** "2026-11-03" + "09:30" in America/Chicago -> the real instant. */
export function zoned(day: string, time: string, timeZone: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = guess - tzOffset(new Date(guess), timeZone);
  // Second pass settles DST boundaries.
  return new Date(guess - tzOffset(new Date(first), timeZone));
}

export const minutesOf = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const hhmm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/** Weekday (0 = Sunday) of a calendar date string. */
export const weekdayOf = (day: string) => new Date(day + 'T12:00:00Z').getUTCDay();

export type Window = { start_time: string; end_time: string };
export type Range = { starts_at: string; ends_at: string };

/** Open start times for a service on a day, mirroring the database's slot_is_open rules. */
export function openSlots(opts: {
  day: string;
  timeZone: string;
  windows: Window[];
  busy: Range[];
  minutes: number;
  minNoticeHours: number;
  urgent: boolean;
  now?: Date;
}): Date[] {
  const now = opts.now ?? new Date();
  const earliest = opts.urgent ? now.getTime() : now.getTime() + opts.minNoticeHours * 3600_000;
  const step = opts.minutes <= 15 ? 15 : 30;
  const busy = opts.busy.map((b) => [new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime()]);
  const out: Date[] = [];
  for (const w of opts.windows) {
    for (let t = minutesOf(w.start_time); t + opts.minutes <= minutesOf(w.end_time); t += step) {
      const start = zoned(opts.day, hhmm(t), opts.timeZone);
      const end = start.getTime() + opts.minutes * 60_000;
      if (start.getTime() < earliest) continue;
      if (busy.some(([bs, be]) => bs < end && be > start.getTime())) continue;
      out.push(start);
    }
  }
  return out.sort((a, b) => a.getTime() - b.getTime());
}

/** Today's date as YYYY-MM-DD in a time zone. */
export function todayIn(timeZone: string, offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
