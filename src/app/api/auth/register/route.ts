import { dbAddMember, dbGetMemberByEmail } from "@/lib/db";
import { hashPassword, createSessionToken } from "@/lib/utils/crypto-auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, registerNo, email, password, club } = body;

    if (!name || !registerNo || !email || !password) {
      return Response.json(
        { error: "All fields (name, register number, email, password) are required." },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingEmail = await dbGetMemberByEmail(email);
    if (existingEmail) {
      return Response.json(
        { error: "Email address is already registered." },
        { status: 400 }
      );
    }

    const { hash, salt } = hashPassword(password);
    const memberId = `MEM-${Math.floor(100 + Math.random() * 900)}`;

    const newMember = {
      member_id: memberId,
      name: name.trim(),
      register_no: String(registerNo).trim(),
      email: email.trim().toLowerCase(),
      club: (club || "IEEE CS").trim(),
      membership_status: "ACTIVE" as const,
      password_hash: hash,
      salt,
      created_at: new Date().toISOString(),
    };

    await dbAddMember(newMember);

    // Auto-login after registration by setting session token cookie
    const token = createSessionToken({
      memberId: newMember.member_id,
      email: newMember.email,
      name: newMember.name,
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
        memberId: newMember.member_id,
        name: newMember.name,
        email: newMember.email,
        registerNo: newMember.register_no,
        club: newMember.club,
        status: newMember.membership_status,
      },
    });
  } catch (err) {
    console.error("Registration API error:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
