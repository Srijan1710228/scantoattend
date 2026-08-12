import { dbGetAttendance, dbGetMemberById } from "@/lib/db";
import { verifySessionToken } from "@/lib/utils/crypto-auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("session_token");

    if (!tokenCookie || !tokenCookie.value) {
      return Response.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const { valid, payload } = verifySessionToken(tokenCookie.value);
    if (!valid || !payload) {
      return Response.json(
        { error: "Session expired." },
        { status: 401 }
      );
    }

    const member = await dbGetMemberById(payload.memberId);
    if (!member) {
      return Response.json(
        { error: "Member profile not found." },
        { status: 404 }
      );
    }

    // Retrieve all attendance rows and filter to show only this member's history
    const allAttendance = await dbGetAttendance();
    const myHistory = allAttendance.filter(
      (rec) => rec.member_id === member.member_id
    );

    return Response.json({
      success: true,
      history: myHistory,
    });
  } catch (err) {
    console.error("Fetch Attendance History error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
