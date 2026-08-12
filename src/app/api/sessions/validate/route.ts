import { verifySession } from "@/lib/utils/token";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return Response.json(
        {
          valid: false,
          code: "INVALID_SESSION",
          message: "No session token provided.",
        },
        { status: 400 }
      );
    }

    const { valid, payload, error } = verifySession(token);

    if (!valid) {
      if (error === "EXPIRED") {
        return Response.json({
          valid: false,
          code: "SESSION_EXPIRED",
          message: "This attendance session has expired.",
        });
      }

      return Response.json({
        valid: false,
        code: "INVALID_SESSION",
        message: "Invalid attendance session.",
      });
    }

    return Response.json({
      valid: true,
      session: {
        id: payload?.id,
        title: payload?.title,
        expiresAt: payload?.expiresAt,
      },
    });
  } catch (err) {
    console.error("Error validating session:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
