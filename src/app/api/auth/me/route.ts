import { dbGetMemberById } from "@/lib/db";
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
        { error: "Invalid or expired session session." },
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

    if (member.membership_status !== "ACTIVE") {
      return Response.json(
        { error: "This member account is currently inactive." },
        { status: 403 }
      );
    }

    return Response.json({
      authenticated: true,
      member: {
        memberId: member.member_id,
        name: member.name,
        email: member.email,
        registerNo: member.register_no,
        club: member.club,
        status: member.membership_status,
        createdAt: member.created_at,
      },
    });
  } catch (err) {
    console.error("Auth Me API error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
