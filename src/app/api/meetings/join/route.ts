import { dbGetMeetingById, dbGetMemberById } from "@/lib/db";
import { verifySessionToken } from "@/lib/utils/crypto-auth";
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

    const { valid, payload } = verifySessionToken(tokenCookie.value);
    if (!valid || !payload) {
      return Response.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    const member = await dbGetMemberById(payload.memberId);
    if (!member || member.membership_status !== "ACTIVE") {
      return Response.json(
        { error: "Member profile is inactive or not found." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { meetId, passcode } = body;

    if (!meetId || !passcode) {
      return Response.json(
        { error: "Meet ID and passcode are required." },
        { status: 400 }
      );
    }

    const meeting = await dbGetMeetingById(meetId);
    if (!meeting) {
      return Response.json(
        { error: "Meeting not found. Verify your Meet ID." },
        { status: 404 }
      );
    }

    if (meeting.status !== "ACTIVE") {
      return Response.json(
        { error: `This meeting is currently ${meeting.status.toLowerCase()}.` },
        { status: 400 }
      );
    }

    if (String(meeting.passcode) !== String(passcode).trim()) {
      return Response.json(
        { error: "Incorrect passcode. Please try again." },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      meeting: {
        meetingId: meeting.meeting_id,
        meetingName: meeting.meeting_name,
        date: meeting.date,
        startTime: meeting.start_time,
        endTime: meeting.end_time,
        venue: meeting.venue,
        allowedRadius: meeting.allowed_radius,
        venueLatitude: meeting.venue_latitude,
        venueLongitude: meeting.venue_longitude,
      },
    });
  } catch (err) {
    console.error("Join Meeting API error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
