import crypto from "crypto";

const SECRET = process.env.ATTENDANCE_SESSION_SECRET || "temp_secret_key_67890_scantoattend";

export interface SessionMember {
  memberId: string;
  email: string;
  name: string;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === verifyHash;
}

export function createSessionToken(payload: SessionMember): string {
  const serialized = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(serialized).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payloadBase64)
    .digest("hex");
  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): {
  valid: boolean;
  payload?: SessionMember;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };

    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(payloadBase64)
      .digest("hex");

    if (signature !== expectedSignature) return { valid: false };

    const decoded = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload = JSON.parse(decoded) as SessionMember;
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

export interface LocationVerificationPayload {
  memberId: string;
  meetingId: string;
  distance: number;
  accuracy: number;
  expiresAt: number;
}

export function createLocationToken(payload: LocationVerificationPayload): string {
  const serialized = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(serialized).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payloadBase64)
    .digest("hex");
  return `${payloadBase64}.${signature}`;
}

export function verifyLocationToken(token: string): {
  valid: boolean;
  payload?: LocationVerificationPayload;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return { valid: false };

    const [payloadBase64, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SECRET)
      .update(payloadBase64)
      .digest("hex");

    if (signature !== expectedSignature) return { valid: false };

    const decoded = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload = JSON.parse(decoded) as LocationVerificationPayload;

    if (Date.now() > payload.expiresAt) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

