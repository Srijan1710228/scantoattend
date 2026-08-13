import { getRows, appendRow, updateRow } from "@/lib/google-sheets";
import {
  getMembers,
  addMember,
  getMeetingsStore,
  addMeetingStore,
  getAttendance,
  markAttendance,
  type Member,
  type Meeting,
} from "@/lib/store/mock-store";

// Helper to determine if Google Sheets config is present
function isGoogleConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}

// ---------------------------------------------------------------------------
// Members operations
// ---------------------------------------------------------------------------

export async function dbGetMembers(): Promise<Member[]> {
  const localMembers = getMembers();

  if (!isGoogleConfigured()) {
    return localMembers;
  }

  try {
    const rows = await getRows("Members");
    if (rows.length <= 1) return localMembers;
    
    const sheetMembers = rows.slice(1).map((row) => ({
      member_id: row[0],
      name: row[1],
      register_no: row[2],
      email: row[3],
      club: row[4],
      membership_status: row[5] as "ACTIVE" | "INACTIVE",
      password_hash: row[6],
      salt: row[7],
      created_at: row[8],
    }));

    const mergedMap = new Map<string, Member>();
    sheetMembers.forEach((m) => {
      mergedMap.set(m.member_id, m);
    });
    localMembers.forEach((m) => {
      mergedMap.set(m.member_id, m);
    });

    return Array.from(mergedMap.values());
  } catch (err) {
    console.warn("Falling back to mock-store for getMembers:", err);
    return localMembers;
  }
}

export async function dbAddMember(member: Member): Promise<void> {
  // Always save to mock-store locally for fallback
  addMember(member);

  if (isGoogleConfigured()) {
    try {
      await appendRow("Members", [
        member.member_id,
        member.name,
        member.register_no,
        member.email,
        member.club,
        member.membership_status,
        member.password_hash,
        member.salt,
        member.created_at,
      ]);
    } catch (err) {
      console.error("Failed to append member to Google Sheets:", err);
    }
  }
}

export async function dbGetMemberByEmail(email: string): Promise<Member | undefined> {
  const members = await dbGetMembers();
  return members.find((m) => m.email.toLowerCase() === email.toLowerCase());
}

export async function dbGetMemberById(id: string): Promise<Member | undefined> {
  const members = await dbGetMembers();
  return members.find((m) => m.member_id === id);
}

// ---------------------------------------------------------------------------
// Meetings operations
// ---------------------------------------------------------------------------

export async function dbGetMeetings(): Promise<Meeting[]> {
  const localMeetings = getMeetingsStore();

  if (!isGoogleConfigured()) {
    return localMeetings;
  }

  try {
    const rows = await getRows("Meetings");
    if (rows.length <= 1) return localMeetings;
    
    const sheetMeetings = rows.slice(1).map((row) => ({
      meeting_id: row[0],
      meeting_name: row[1],
      date: row[2],
      start_time: row[3],
      end_time: row[4],
      venue: row[5],
      venue_latitude: Number(row[6]),
      venue_longitude: Number(row[7]),
      allowed_radius: Number(row[8]),
      status: row[9] as Meeting["status"],
      created_at: row[10],
      passcode: row[11] || "",
    }));

    const mergedMap = new Map<string, Meeting>();
    sheetMeetings.forEach((m) => {
      mergedMap.set(m.meeting_id.toLowerCase(), m);
    });
    localMeetings.forEach((m) => {
      mergedMap.set(m.meeting_id.toLowerCase(), m);
    });

    return Array.from(mergedMap.values());
  } catch (err) {
    console.warn("Falling back to mock-store for getMeetings:", err);
    return localMeetings;
  }
}

export async function dbAddMeeting(meeting: Meeting): Promise<void> {
  addMeetingStore(meeting);

  if (isGoogleConfigured()) {
    try {
      await appendRow("Meetings", [
        meeting.meeting_id,
        meeting.meeting_name,
        meeting.date,
        meeting.start_time,
        meeting.end_time,
        meeting.venue,
        meeting.venue_latitude,
        meeting.venue_longitude,
        meeting.allowed_radius,
        meeting.status,
        meeting.created_at,
        meeting.passcode,
      ]);
    } catch (err) {
      console.error("Failed to append meeting to Google Sheets:", err);
    }
  }
}

export async function dbGetMeetingById(id: string): Promise<Meeting | undefined> {
  const meetings = await dbGetMeetings();
  return meetings.find((m) => m.meeting_id.toLowerCase() === id.toLowerCase());
}

export async function dbUpdateMeetingStatus(id: string, status: Meeting["status"]): Promise<void> {
  if (isGoogleConfigured()) {
    try {
      const rows = await getRows("Meetings");
      const rowIndex = rows.findIndex((row) => row[0]?.toLowerCase() === id.toLowerCase());
      if (rowIndex !== -1) {
        // Retrieve full row, modify status (column 9, index 9)
        const updatedRow = [...rows[rowIndex]];
        updatedRow[9] = status;
        
        // Update specific range (e.g. Meetings!A3:L3)
        // Rows in sheets API get call return 1-indexed values, so index matches rowIndex + 1
        const range = `A${rowIndex + 1}:L${rowIndex + 1}`;
        await updateRow("Meetings", range, updatedRow);
      }
    } catch (err) {
      console.error("Failed to update status in Google Sheets:", err);
    }
  }
  
  // Update mock-store status
  const meetings = getMeetingsStore();
  const index = meetings.findIndex((m) => m.meeting_id.toLowerCase() === id.toLowerCase());
  if (index !== -1) {
    meetings[index].status = status;
    if (typeof window !== "undefined") {
      localStorage.setItem("scantoattend_meetings", JSON.stringify(meetings));
    }
  }
}

// ---------------------------------------------------------------------------
// Attendance operations
// ---------------------------------------------------------------------------

export type SheetAttendanceRecord = {
  attendance_id: string;
  member_id: string;
  name: string;
  register_no: string;
  email: string;
  meeting_id: string;
  meeting_name: string;
  date: string;
  time: string;
  venue: string;
  distance_from_venue: number;
  gps_accuracy: number;
  allowed_radius: number;
  location_status: string;
  attendance_status: string;
};

export async function dbGetAttendance(meetingId?: string): Promise<SheetAttendanceRecord[]> {
  const localRecs = getAttendance();
  const members = getMembers();
  const meetings = getMeetingsStore();

  const localMapped = localRecs.map((rec) => {
    const member = members.find((m) => m.member_id === rec.participant_id);
    const meeting = meetings.find((meet) => meet.meeting_id === rec.session_id);
    return {
      attendance_id: rec.id,
      member_id: rec.participant_id,
      name: member?.name || "Unknown",
      register_no: member?.register_no || "Unknown",
      email: member?.email || "Unknown",
      meeting_id: rec.session_id || "Unknown",
      meeting_name: meeting?.meeting_name || "Unknown",
      date: rec.event_day,
      time: new Date(rec.scanned_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      venue: meeting?.venue || "Unknown",
      distance_from_venue: rec.distance_from_venue_m,
      gps_accuracy: 10,
      allowed_radius: meeting?.allowed_radius || 200,
      location_status: rec.location_verified ? "Within Radius" : "Outside Radius",
      attendance_status: "Present",
    };
  });

  if (!isGoogleConfigured()) {
    if (meetingId) {
      return localMapped.filter((m) => m.meeting_id.toLowerCase() === meetingId.toLowerCase());
    }
    return localMapped;
  }

  try {
    const rows = await getRows("Attendance");
    let sheetMapped: SheetAttendanceRecord[] = [];
    if (rows.length > 1) {
      sheetMapped = rows.slice(1).map((row) => ({
        attendance_id: row[0],
        member_id: row[1],
        name: row[2],
        register_no: row[3],
        email: row[4],
        meeting_id: row[5],
        meeting_name: row[6],
        date: row[7],
        time: row[8],
        venue: row[9],
        distance_from_venue: Number(row[10]),
        gps_accuracy: Number(row[11]),
        allowed_radius: Number(row[12]),
        location_status: row[13],
        attendance_status: row[14],
      }));
    }

    const mergedMap = new Map<string, SheetAttendanceRecord>();
    sheetMapped.forEach((r) => {
      mergedMap.set(r.attendance_id, r);
    });
    localMapped.forEach((r) => {
      mergedMap.set(r.attendance_id, r);
    });

    const merged = Array.from(mergedMap.values());
    if (meetingId) {
      return merged.filter((m) => m.meeting_id.toLowerCase() === meetingId.toLowerCase());
    }
    return merged;
  } catch (err) {
    console.error("Failed to read attendance from Google Sheets:", err);
    if (meetingId) {
      return localMapped.filter((m) => m.meeting_id.toLowerCase() === meetingId.toLowerCase());
    }
    return localMapped;
  }
}

export async function dbAddAttendance(rec: SheetAttendanceRecord): Promise<void> {
  // Save locally first
  const todayDateStr = new Date().toISOString().split("T")[0];
  markAttendance({
    participant_id: rec.member_id,
    event_day: todayDateStr,
    session_id: rec.meeting_id,
    latitude: 0,
    longitude: 0,
    distance_from_venue_m: rec.distance_from_venue,
    location_verified: rec.location_status === "Within Radius",
  });

  if (isGoogleConfigured()) {
    try {
      await appendRow("Attendance", [
        rec.attendance_id,
        rec.member_id,
        rec.name,
        rec.register_no,
        rec.email,
        rec.meeting_id,
        rec.meeting_name,
        rec.date,
        rec.time,
        rec.venue,
        rec.distance_from_venue,
        rec.gps_accuracy,
        rec.allowed_radius,
        rec.location_status,
        rec.attendance_status,
      ]);
    } catch (err) {
      console.error("Failed to append attendance to Google Sheets:", err);
    }
  }
}
