import { dbGetAttendance, dbGetMeetings } from "@/lib/db";

export async function GET() {
  try {
    const attendance = await dbGetAttendance();
    const meetings = await dbGetMeetings();
    return Response.json({
      success: true,
      attendance,
      meetings,
    });
  } catch (err) {
    console.error("GET Admin Attendance API error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
