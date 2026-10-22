export type Role = 'client' | 'admin';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  company: string;
  license_type: string;
  state: string;
  role: Role;
  consultant_slug: string | null;
  intake: Record<string, string>;
  intake_completed_at: string | null;
  created_at: string;
};

export type Consultant = {
  slug: string;
  profile_id: string | null;
  name: string;
  title: string;
  photo: string;
  specialties: string[];
  timezone: string;
  buffer_minutes: number;
  min_notice_hours: number;
  is_available_today: boolean;
  expertise: string[];
  verified: boolean;
  modes: AppointmentMode[];
  active: boolean;
  sort: number;
};

export type AppointmentMode = 'zoom' | 'discord' | 'signal' | 'onsite';

export type Service = {
  id: string;
  name: string;
  description: string;
  kind: 'session' | 'package' | 'retainer' | 'fixed';
  minutes: number | null;
  price_cents: number;
  response_time: string;
  features: string[];
  bookable: boolean;
  is_draft: boolean;
  active: boolean;
  highlight: boolean;
  sort: number;
};

export type Availability = { id: string; consultant_slug: string; weekday: number; start_time: string; end_time: string };
export type TimeOff = { id: string; consultant_slug: string; starts_at: string; ends_at: string; reason: string };

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type Booking = {
  id: string;
  client_id: string;
  consultant_slug: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  notes: string;
  cancel_reason: string;
  late_cancel: boolean;
  room: string;
  extended_minutes: number;
  mode: AppointmentMode;
  /** Facility address for on-site visits, or the client's Discord/Signal username. */
  location: string;
  /** The Zoom, Discord, or Signal link the consultant shares for this booking. */
  meeting_link: string;
  created_at: string;
};

export type PlanStep = { text: string; done: boolean };
export type ActionPlan = {
  id: string;
  booking_id: string | null;
  client_id: string;
  consultant_slug: string | null;
  title: string;
  problem: string;
  solution: string;
  contingencies: string;
  test_results: string;
  steps: PlanStep[];
  created_at: string;
  updated_at: string;
};

export type Thread = {
  id: string;
  client_id: string;
  consultant_slug: string | null;
  subject: string;
  kind: 'message' | 'support';
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
};
export type Message = { id: string; thread_id: string; sender_id: string; body: string; created_at: string };

export type FileRow = {
  id: string;
  client_id: string;
  booking_id: string | null;
  uploaded_by: string;
  name: string;
  path: string;
  size: number;
  mime: string;
  kind: 'upload' | 'deliverable';
  created_at: string;
};

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'refunded';
export type Invoice = {
  id: string;
  number: number;
  client_id: string;
  booking_id: string | null;
  retainer_id: string | null;
  consultant_slug: string | null;
  description: string;
  amount_cents: number;
  status: InvoiceStatus;
  due_date: string | null;
  payment_url: string;
  paid_at: string | null;
  payment_method: string;
  refund_note: string;
  created_at: string;
};

export type Agreement = {
  id: string;
  client_id: string;
  kind: 'proposal' | 'sow' | 'contract' | 'nda';
  title: string;
  body: string;
  amount_cents: number | null;
  status: 'sent' | 'signed' | 'declined' | 'void';
  signed_name: string;
  signed_at: string | null;
  created_at: string;
};

export type Retainer = {
  id: string;
  client_id: string;
  service_id: string;
  agreement_id: string | null;
  status: 'pending' | 'active' | 'paused' | 'cancelled';
  billing_day: number;
  started_at: string | null;
  notes: string;
  created_at: string;
};

export type TimeEntry = {
  id: string;
  consultant_slug: string;
  client_id: string | null;
  booking_id: string | null;
  work_date: string;
  minutes: number;
  note: string;
  created_at: string;
};

export type ClientNote = { id: string; client_id: string; author_id: string; body: string; created_at: string };
export type ContactRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  handled: boolean;
  created_at: string;
};
export type AuditRow = { id: number; actor_id: string | null; action: string; entity: string; entity_id: string; at: string };

export type ProjectStatus = 'active' | 'on_hold' | 'done';
export type Project = {
  id: string;
  client_id: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  consultants: string[];
  record: Record<string, string>;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};
export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';
export type ProjectTask = {
  id: string;
  project_id: string;
  title: string;
  detail: string;
  status: TaskStatus;
  assignee: string | null;
  due_date: string | null;
  sort: number;
  created_at: string;
};
export type Milestone = {
  id: string;
  project_id: string;
  title: string;
  deliverable: string;
  due_date: string | null;
  done_at: string | null;
  created_at: string;
};

export type MeetingLink = { id: string; label: string; method: 'zoom' | 'discord' | 'signal'; url: string; sort: number };
