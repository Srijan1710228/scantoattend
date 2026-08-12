import { dbGetMeetingById, dbGetMemberById, dbGetAttendance, dbAddAttendance } from "@/lib/db";
import { verifySessionToken, verifyLocationToken } from "@/lib/utils/crypto-auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("session_token");

    if (!tokenCookie || !tokenCookie.value) {
      return Response.json(
        { error: "Not authenticated. Please register or log in first." },
        { status: 401 }
      );
    }

    const { valid: sessionValid, payload: sessionPayload } = verifySessionToken(tokenCookie.value);
    if (!sessionValid || !sessionPayload) {
      return Response.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    const member = await dbGetMemberById(sessionPayload.memberId);
    if (!member || member.membership_status !== "ACTIVE") {
      return Response.json(
        { error: "Member profile is inactive or not found." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { locationToken } = body;

    if (!locationToken) {
      return Response.json(
        { error: "Location verification token is required to submit attendance." },
        { status: 400 }
      );
    }

    const { valid: locValid, payload: locPayload } = verifyLocationToken(locationToken);
    if (!locValid || !locPayload) {
      return Response.json(
        { error: "Location verification token has expired or is invalid. Verify location again." },
        { status: 400 }
      );
    }

    // Security check: Ensure token matches the currently authenticated member
    if (locPayload.memberId !== member.member_id) {
      return Response.json(
        { error: "Location token identity mismatch. Access denied." },
        { status: 403 }
      );
    }

    const meeting = await dbGetMeetingById(locPayload.meetingId);
    if (!meeting) {
      return Response.json(
        { error: "Meeting not found." },
        { status: 404 }
      );
    }

    if (meeting.status !== "ACTIVE") {
      return Response.json(
        { error: "This meeting session is no longer active." },
        { status: 400 }
      );
    }

    // Duplicate prevention: check unique (memberId + meetingId)
    const existingAttendance = await dbGetAttendance(meeting.meeting_id);
    const alreadyCheckedIn = existingAttendance.some(
      (rec) => rec.member_id === member.member_id
    );

    if (alreadyCheckedIn) {
      return Response.json(
        { error: "ALREADY_ATTENDED", message: "Attendance already marked for this meeting." },
        { status: 400 }
      );
    }

    // Create the final attendance check-in record
    const attendanceId = `ATT-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newAttendance = {
      attendance_id: attendanceId,
      member_id: member.member_id,
      name: member.name,
      register_no: member.register_no,
      email: member.email,
      meeting_id: meeting.meeting_id,
      meeting_name: meeting.meeting_name,
      date: meeting.date,
      time: formattedTime,
      venue: meeting.venue,
      distance_from_venue: locPayload.distance,
      gps_accuracy: locPayload.accuracy,
      allowed_radius: meeting.allowed_radius,
      location_status: "Within Radius",
      attendance_status: "Present",
    };

    await dbAddAttendance(newAttendance);

    return Response.json({
      success: true,
      attendance: newAttendance,
    });
  } catch (err) {
    console.error("Submit Attendance API error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
