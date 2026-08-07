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

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function loadRegistrations(): Registration[] {
  if (!isBrowser()) return [...SEED_REGISTRATIONS];
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    if (raw) return JSON.parse(raw) as Registration[];
  } catch { /* corrupted data, re-seed */ }
  // First load — seed and persist
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(SEED_REGISTRATIONS));
  return [...SEED_REGISTRATIONS];
}

function loadAttendance(): AttendanceRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(ATTENDANCE_KEY);
    if (raw) return JSON.parse(raw) as AttendanceRecord[];
  } catch { /* corrupted data, start fresh */ }
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
  return [];
}

function persistRegistrations(data: Registration[]): void {
  if (isBrowser()) localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(data));
}

function persistAttendance(data: AttendanceRecord[]): void {
  if (isBrowser()) localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
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
  const found = registrations.find(
    (r) => r.participant_id === record.participant_id
  );
  if (!found) return { success: false, error: "not_registered" };

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
