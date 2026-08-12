import { dbGetMemberByEmail } from "@/lib/db";
import { verifyPassword, createSessionToken } from "@/lib/utils/crypto-auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const member = await dbGetMemberByEmail(email);
    if (!member) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (member.membership_status !== "ACTIVE") {
      return Response.json(
        { error: "This member account is inactive. Please contact your administrator." },
        { status: 403 }
      );
    }

    const isMatch = verifyPassword(password, member.password_hash, member.salt);
    if (!isMatch) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      memberId: member.member_id,
      email: member.email,
      name: member.name,
    });

    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return Response.json({
      success: true,
      member: {
        memberId: member.member_id,
        name: member.name,
        email: member.email,
        registerNo: member.register_no,
        club: member.club,
        status: member.membership_status,
      },
    });
  } catch (err) {
    console.error("Login API error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
