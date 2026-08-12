import { dbGetMeetingById, dbGetMemberById } from "@/lib/db";
import { verifySessionToken, createLocationToken } from "@/lib/utils/crypto-auth";
import { haversineDistance } from "@/lib/utils/geo";
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
    const { meetId, latitude, longitude, accuracy } = body;

    if (!meetId || latitude === undefined || longitude === undefined) {
      return Response.json(
        { error: "Meet ID, latitude, and longitude are required." },
        { status: 400 }
      );
    }

    const meeting = await dbGetMeetingById(meetId);
    if (!meeting) {
      return Response.json(
        { error: "Meeting not found." },
        { status: 404 }
      );
    }

    if (meeting.status !== "ACTIVE") {
      return Response.json(
        { error: "Meeting session is not active." },
        { status: 400 }
      );
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    const acc = Number(accuracy) || 10; // Default accuracy 10m if missing

    // Calculate distance server-side using Haversine formula
    const distance = haversineDistance(
      lat,
      lng,
      meeting.venue_latitude,
      meeting.venue_longitude
    );

    const verified = distance <= meeting.allowed_radius;

    if (!verified) {
      return Response.json({
        success: true,
        verified: false,
        distance: Math.round(distance * 10) / 10,
        accuracy: acc,
        message: `You are outside the venue radius. Current distance: ${Math.round(distance)}m, Allowed radius: ${meeting.allowed_radius}m.`,
      });
    }

    // Generate location verification token valid for 3 minutes (180000 ms)
    const expiresAt = Date.now() + 180000;
    const locationToken = createLocationToken({
      memberId: member.member_id,
      meetingId: meeting.meeting_id,
      distance: Math.round(distance * 10) / 10,
      accuracy: acc,
      expiresAt,
    });

    return Response.json({
      success: true,
      verified: true,
      locationToken,
      distance: Math.round(distance * 10) / 10,
      accuracy: acc,
      expiresAt,
    });
  } catch (err) {
    console.error("Verify Location API error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
