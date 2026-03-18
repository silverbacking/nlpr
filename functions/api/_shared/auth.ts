/**
 * Shared authentication utilities for NLPR backend.
 *
 * - Password hashing uses Web Crypto SHA-256 with a per-user random salt.
 * - JWT is HMAC-SHA256 signed using Web Crypto.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const JWT_SECRET = "nlpr-jwt-secret-change-in-production";
const JWT_EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

// ---------------------------------------------------------------------------
// Helpers – encoding
// ---------------------------------------------------------------------------

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

function base64UrlEncode(data: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// ---------------------------------------------------------------------------
// Password hashing (SHA-256 + random salt)
// ---------------------------------------------------------------------------

/**
 * Hash a plain-text password.
 * Returns a string in the format `<hex-salt>:<hex-hash>` so the salt is stored
 * alongside the hash in the database.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = arrayBufferToHex(salt.buffer);

  const encoder = new TextEncoder();
  const data = encoder.encode(saltHex + ":" + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = arrayBufferToHex(hashBuffer);

  return `${saltHex}:${hashHex}`;
}

/**
 * Verify a plain-text password against a stored `salt:hash` string.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, expectedHash] = storedHash.split(":");
  if (!saltHex || !expectedHash) return false;

  const encoder = new TextEncoder();
  const data = encoder.encode(saltHex + ":" + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = arrayBufferToHex(hashBuffer);

  return hashHex === expectedHash;
}

// ---------------------------------------------------------------------------
// JWT (HMAC-SHA256 via Web Crypto)
// ---------------------------------------------------------------------------

interface JwtPayload {
  sub: number;        // user id
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

async function hmacSign(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return arrayBufferToHex(signature);
}

async function hmacVerify(data: string, signatureHex: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBuffer = hexToArrayBuffer(signatureHex);
  return crypto.subtle.verify("HMAC", key, sigBuffer, encoder.encode(data));
}

/**
 * Create a signed JWT for the given user.
 */
export async function createToken(user: {
  id: number;
  email: string;
  name: string;
  role: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + JWT_EXPIRY_SECONDS,
    } satisfies JwtPayload)
  );

  const signature = await hmacSign(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

/**
 * Verify a JWT and return its payload. Returns `null` if the token is invalid
 * or expired.
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;

    const valid = await hmacVerify(`${header}.${payload}`, signature);
    if (!valid) return null;

    const decoded: JwtPayload = JSON.parse(base64UrlDecode(payload));

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) return null;

    return decoded;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Middleware helper – extract & verify JWT from Authorization header
// ---------------------------------------------------------------------------

export async function authenticate(
  request: Request
): Promise<JwtPayload | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}
