import { dbUpdateMeetingStatus, dbGetMeetingById } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { meetingId, status } = body;

    if (!meetingId || !status) {
      return Response.json(
        { error: "Meeting ID and status are required." },
        { status: 400 }
      );
    }

    const meeting = await dbGetMeetingById(meetingId);
    if (!meeting) {
      return Response.json(
        { error: "Meeting not found." },
        { status: 404 }
      );
    }

    await dbUpdateMeetingStatus(meetingId, status);

    return Response.json({
      success: true,
      status,
    });
  } catch (err) {
    console.error("Update meeting status error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
