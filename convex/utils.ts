export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// These helpers keep the route file readable and stop the same code from being repeated everywhere.
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export function emptyResponse(status = 204): Response {
  return new Response(null, {
    status,
    headers: corsHeaders,
  });
}

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

export function getBearerToken(request: Request): string | null {
  // The frontend sends the session token in the Authorization header.
  const header = request.headers.get("Authorization");
  if (!header) {
    return null;
  }
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function formatMoney(cents: number): string {
  // Money is shown in AED because that is the salon currency on the site.
  const amount = (cents / 100).toLocaleString("en-AE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `AED ${amount}`;
}

export function parseTimeLabel(label: string): number {
  // Time slots are stored as minutes so overlap checks stay simple.
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    throw new Error(`Invalid time label: ${label}`);
  }
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time label: ${label}`);
  }

  if (suffix === "AM") {
    if (hours === 12) {
      hours = 0;
    }
  } else if (hours !== 12) {
    hours += 12;
  }

  return hours * 60 + minutes;
}

export function formatTimeLabel(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64Url(bytes);
}

export async function hashPassword(password: string, salt?: string): Promise<{ salt: string; passwordHash: string }> {
  // Passwords are never stored raw. The salt changes the hash each time.
  const finalSalt = salt ?? randomToken();
  const passwordHash = await sha256Hex(`${finalSalt}:${password}`);
  return { salt: finalSalt, passwordHash };
}

export async function verifyPassword(password: string, salt: string, passwordHash: string): Promise<boolean> {
  const candidate = await sha256Hex(`${salt}:${password}`);
  return candidate === passwordHash;
}

// Random session tokens use base64url so they are safe in headers and URLs.
export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
