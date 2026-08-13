import { dbAddMeeting, dbGetMeetings } from "@/lib/db";
import { createMeetingToken } from "@/lib/utils/crypto-auth";

export async function GET() {
  try {
    const meetings = await dbGetMeetings();
    const meetingsWithTokens = meetings.map(m => ({
      ...m,
      join_token: createMeetingToken({ meetingId: m.meeting_id })
    }));
    return Response.json({ success: true, meetings: meetingsWithTokens });
  } catch (err) {
    console.error("Meetings GET error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      meetingName,
      date,
      startTime,
      endTime,
      venue,
      venueLatitude,
      venueLongitude,
      allowedRadius,
    } = body;

    if (!meetingName || !date || !startTime || !endTime || !venue) {
      return Response.json(
        { error: "Meeting name, date, start time, end time, and venue are required." },
        { status: 400 }
      );
    }

    const lat = Number(venueLatitude) || 12.9716; // default Bangalore
    const lng = Number(venueLongitude) || 77.5946;
    const rad = Number(allowedRadius) || 200;

    // Generate unique Meet ID (e.g. CS-8F42)
    const suffix = Math.floor(4096 + Math.random() * 61439).toString(16).toUpperCase();
    const meetingId = `CS-${suffix}`;

    // Generate random 4 digit numeric passcode (e.g. 7291)
    const passcode = String(Math.floor(1000 + Math.random() * 9000));

    const newMeeting = {
      meeting_id: meetingId,
      meeting_name: meetingName.trim(),
      date: String(date).trim(),
      start_time: String(startTime).trim(),
      end_time: String(endTime).trim(),
      venue: venue.trim(),
      venue_latitude: lat,
      venue_longitude: lng,
      allowed_radius: rad,
      passcode,
      status: "ACTIVE" as const, // active on creation for MVP
      created_at: new Date().toISOString(),
    };

    await dbAddMeeting(newMeeting);

    return Response.json({
      success: true,
      meeting: {
        ...newMeeting,
        join_token: createMeetingToken({ meetingId: newMeeting.meeting_id })
      },
    });
  } catch (err) {
    console.error("Meetings POST error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
