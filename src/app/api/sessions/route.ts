import { signSession } from "@/lib/utils/token";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, durationMinutes } = body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return Response.json(
        { error: "Session title is required." },
        { status: 400 }
      );
    }

    const mins = Number(durationMinutes);
    if (isNaN(mins) || mins <= 0) {
      return Response.json(
        { error: "Invalid duration specified." },
        { status: 400 }
      );
    }

    const sessionId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + mins * 60000).toISOString();

    const payload = {
      id: sessionId,
      title: title.trim(),
      createdAt,
      expiresAt,
    };

    const token = signSession(payload);

    return Response.json({
      success: true,
      token,
      session: payload,
    });
  } catch (err) {
    console.error("Error creating session:", err);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
