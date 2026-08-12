import crypto from "crypto";

const DEFAULT_SECRET = "temp_default_attendance_session_secret_key_12345";

function getSecret(): string {
  return process.env.ATTENDANCE_SESSION_SECRET || DEFAULT_SECRET;
}

export interface SessionPayload {
  id: string;
  title: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Signs a session payload using HMAC-SHA256.
 * Returns the format: base64url(payload).signature
 */
export function signSession(payload: SessionPayload): string {
  const secret = getSecret();
  const serialized = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(serialized).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadBase64)
    .digest("hex");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies a token's signature and expiration status.
 */
export function verifySession(token: string): {
  valid: boolean;
  payload?: SessionPayload;
  error?: "INVALID_SIGNATURE" | "EXPIRED" | "MALFORMED";
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return { valid: false, error: "MALFORMED" };
    }

    const [payloadBase64, signature] = parts;
    const secret = getSecret();

    // Verify HMAC
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadBase64)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, error: "INVALID_SIGNATURE" };
    }

    // Decode and parse payload
    const decoded = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload = JSON.parse(decoded) as SessionPayload;

    // Check expiration
    const expiryTime = new Date(payload.expiresAt).getTime();
    if (Date.now() > expiryTime) {
      return { valid: false, payload, error: "EXPIRED" };
    }

    return { valid: true, payload };
  } catch (err) {
    console.error("Token verification failed:", err);
    return { valid: false, error: "MALFORMED" };
  }
}
