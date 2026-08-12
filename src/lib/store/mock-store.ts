/**
 * Mock data store — in-memory + localStorage persistence.
 *
 * ⚠️  PHASE 3: Replace the internal implementation with real Supabase calls.
 *     Callers (pages/components) import these functions and must NEVER change.
 *     The function signatures, return types, and field names are the exact
 *     contract for the Supabase migration.
 */

// ---------------------------------------------------------------------------
// Types (match the Supabase schema exactly)
// ---------------------------------------------------------------------------

export type Registration = {
  participant_id: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  ieee_membership_no?: string;
  track_preference?: string;
};

export type AttendanceRecord = {
  id: string;
  participant_id: string;
  event_day: string;
  session_id?: string;
  scanned_at: string;
  latitude: number;
  longitude: number;
  distance_from_venue_m: number;
  location_verified: boolean;
};

// ---------------------------------------------------------------------------
// Seed data — realistic Indian college-student names
// ---------------------------------------------------------------------------

const SEED_REGISTRATIONS: Registration[] = [
  { participant_id: "AICSSYC26-A1B2C3", name: "Aarav Mehta",   email: "aarav.mehta@college.edu",   phone: "9876543210", institution: "VIT Vellore",             track_preference: "technical" },
  { participant_id: "AICSSYC26-D4E5F6", name: "Diya Sharma",   email: "diya.sharma@college.edu",   phone: "9876543211", institution: "SRM Chennai",             track_preference: "managerial" },
  { participant_id: "AICSSYC26-G7H8I9", name: "Rohan Gupta",   email: "rohan.gupta@college.edu",   phone: "9876543212", institution: "BITS Pilani",             track_preference: "technical" },
  { participant_id: "AICSSYC26-J1K2L3", name: "Ananya Singh",  email: "ananya.singh@college.edu",  phone: "9876543213", institution: "NIT Trichy",              track_preference: "entrepreneurial" },
  { participant_id: "AICSSYC26-M4N5O6", name: "Karthik Rajan", email: "karthik.r@college.edu",     phone: "9876543214", institution: "PSG Tech Coimbatore",     track_preference: "technical",   ieee_membership_no: "IEEE-9012345" },
  { participant_id: "AICSSYC26-P7Q8R9", name: "Neha Iyer",     email: "neha.iyer@college.edu",     phone: "9876543215", institution: "Anna University",         track_preference: "managerial" },
  { participant_id: "AICSSYC26-S1T2U3", name: "Vikram Desai",  email: "vikram.d@college.edu",      phone: "9876543216", institution: "IIIT Hyderabad",          track_preference: "technical",   ieee_membership_no: "IEEE-6789012" },
  { participant_id: "AICSSYC26-V4W5X6", name: "Preethi Nair",  email: "preethi.n@college.edu",     phone: "9876543217", institution: "CEG Chennai",             track_preference: "entrepreneurial" },
  { participant_id: "AICSSYC26-Y7Z8A1", name: "Arjun Kumar",   email: "arjun.k@college.edu",       phone: "9876543218", institution: "Manipal Institute",       track_preference: "technical" },
  { participant_id: "AICSSYC26-B2C3D4", name: "Ishita Reddy",  email: "ishita.r@college.edu",      phone: "9876543219", institution: "JNTU Hyderabad",          track_preference: "managerial",  ieee_membership_no: "IEEE-3456789" },
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const REGISTRATIONS_KEY = "aicssyc_registrations";
const ATTENDANCE_KEY    = "aicssyc_attendance";

// Node-safe server global fallbacks for dev server process
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = (typeof global !== "undefined" ? global : {}) as any;
g.scantoattend_registrations = g.scantoattend_registrations || [...SEED_REGISTRATIONS];
g.scantoattend_attendance = g.scantoattend_attendance || [];
g.scantoattend_members = g.scantoattend_members || [];
g.scantoattend_meetings = g.scantoattend_meetings || [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function loadRegistrations(): Registration[] {
  if (!isBrowser()) return g.scantoattend_registrations;
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    if (raw) return JSON.parse(raw) as Registration[];
  } catch { /* corrupted data, re-seed */ }
  // First load — seed and persist
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(SEED_REGISTRATIONS));
  return [...SEED_REGISTRATIONS];
}

function loadAttendance(): AttendanceRecord[] {
  if (!isBrowser()) return g.scantoattend_attendance;
  try {
    const raw = localStorage.getItem(ATTENDANCE_KEY);
    if (raw) return JSON.parse(raw) as AttendanceRecord[];
  } catch { /* corrupted data, start fresh */ }
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
  return [];
}

function persistRegistrations(data: Registration[]): void {
  if (!isBrowser()) {
    g.scantoattend_registrations = data;
    return;
  }
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(data));
}

function persistAttendance(data: AttendanceRecord[]): void {
  if (!isBrowser()) {
    g.scantoattend_attendance = data;
    return;
  }
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// Public API — Phase 3 replaces only the bodies, not the signatures
// ---------------------------------------------------------------------------

export function getRegistrations(): Registration[] {
  return loadRegistrations();
}

export function addRegistration(data: Registration): void {
  const all = loadRegistrations();
  all.push(data);
  persistRegistrations(all);
}

export function getRegistrationByParticipantId(
  participantId: string
): Registration | undefined {
  return loadRegistrations().find((r) => r.participant_id === participantId);
}

export function getAttendance(eventDay?: string): AttendanceRecord[] {
  const all = loadAttendance();
  if (!eventDay) return all;
  return all.filter((a) => a.event_day === eventDay);
}

export function markAttendance(
  record: Omit<AttendanceRecord, "id" | "scanned_at">
): { success: boolean; error?: "already_marked" | "not_registered" } {
  const registrations = loadRegistrations();
  const foundReg = registrations.find(
    (r) => r.participant_id === record.participant_id
  );

  const members = loadMembers();
  const foundMember = members.find(
    (m) => m.member_id === record.participant_id && m.membership_status === "ACTIVE"
  );

  if (!foundReg && !foundMember) return { success: false, error: "not_registered" };

  const attendance = loadAttendance();
  const alreadyMarked = attendance.some(
    (a) =>
      a.participant_id === record.participant_id &&
      a.event_day === record.event_day
  );
  if (alreadyMarked) return { success: false, error: "already_marked" };

  const newRecord: AttendanceRecord = {
    ...record,
    id: crypto.randomUUID(),
    scanned_at: new Date().toISOString(),
  };

  attendance.push(newRecord);
  persistAttendance(attendance);
  return { success: true };
}

export function getAttendanceCount(eventDay?: string): number {
  return getAttendance(eventDay).length;
}

/**
 * Generate a random participant ID in the format AICSSYC26-XXXXXX.
 */
export function generateParticipantId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AICSSYC26-${suffix}`;
}

// ---------------------------------------------------------------------------
// Members Support (Phase A)
// ---------------------------------------------------------------------------

export type Member = {
  member_id: string;
  name: string;
  register_no: string;
  email: string;
  club: string;
  membership_status: "ACTIVE" | "INACTIVE";
  password_hash: string;
  salt: string;
  created_at: string;
};

export const DEMO_MEMBER: Member = {
  member_id: "DEMO001",
  name: "Srijan Demo",
  register_no: "DEMO001",
  email: "demo@scantoattend.test",
  club: "IEEE CS",
  membership_status: "ACTIVE",
  password_hash: "e9830a67cc44baa516cef17e7f3192d637e16b8035372f377e804b12f647a767fc811e2c825c171fbade03b43ed9230d1e3888481628382d6fc098e977d90670",
  salt: "258f7000065877c1715c2b2b9152823d",
  created_at: "2026-08-08T13:42:00Z"
};

const MEMBERS_KEY = "scantoattend_members";

// Ensure global is seeded on server load
if (typeof global !== "undefined") {
  g.scantoattend_members = g.scantoattend_members || [];
  if (!g.scantoattend_members.some((m: Member) => m.email === DEMO_MEMBER.email)) {
    g.scantoattend_members.push(DEMO_MEMBER);
  }
}

function loadMembers(): Member[] {
  if (!isBrowser()) return g.scantoattend_members;
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Member[];
      if (!parsed.some(m => m.email === DEMO_MEMBER.email)) {
        parsed.push(DEMO_MEMBER);
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch { /* corrupted */ }
  localStorage.setItem(MEMBERS_KEY, JSON.stringify([DEMO_MEMBER]));
  return [DEMO_MEMBER];
}

function persistMembers(data: Member[]): void {
  if (!isBrowser()) {
    g.scantoattend_members = data;
    return;
  }
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(data));
}

export function getMembers(): Member[] {
  return loadMembers();
}

export function addMember(member: Member): void {
  const all = loadMembers();
  all.push(member);
  persistMembers(all);
}

export function getMemberByEmail(email: string): Member | undefined {
  return loadMembers().find((m) => m.email.toLowerCase() === email.toLowerCase());
}

export function getMemberById(id: string): Member | undefined {
  return loadMembers().find((m) => m.member_id === id);
}

// ---------------------------------------------------------------------------
// Meetings Support (Phase B)
// ---------------------------------------------------------------------------

export type Meeting = {
  meeting_id: string;
  meeting_name: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  venue_latitude: number;
  venue_longitude: number;
  allowed_radius: number;
  passcode: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED" | "EXPIRED";
  created_at: string;
};

const MEETINGS_KEY = "scantoattend_meetings";

function loadMeetings(): Meeting[] {
  if (!isBrowser()) return g.scantoattend_meetings;
  try {
    const raw = localStorage.getItem(MEETINGS_KEY);
    if (raw) return JSON.parse(raw) as Meeting[];
  } catch { /* corrupted */ }
  return [];
}

function persistMeetings(data: Meeting[]): void {
  if (!isBrowser()) {
    g.scantoattend_meetings = data;
    return;
  }
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(data));
}

export function getMeetingsStore(): Meeting[] {
  return loadMeetings();
}

export function addMeetingStore(meeting: Meeting): void {
  const all = loadMeetings();
  all.push(meeting);
  persistMeetings(all);
}

export function getMeetingByIdStore(id: string): Meeting | undefined {
  return loadMeetings().find((m) => m.meeting_id.toLowerCase() === id.toLowerCase());
}

export function updateMeetingStatusStore(id: string, status: Meeting["status"]): void {
  const all = loadMeetings();
  const index = all.findIndex((m) => m.meeting_id.toLowerCase() === id.toLowerCase());
  if (index !== -1) {
    all[index].status = status;
    persistMeetings(all);
  }
}


