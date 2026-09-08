import { SignJWT, jwtVerify } from "jose";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";

export type SessionPayload = {
  userId: string;
};

function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signSession(
  payload: SessionPayload,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(nowSeconds)
    .setExpirationTime(nowSeconds + SESSION_MAX_AGE_SECONDS)
    .sign(secretKey(secret));
}

export async function verifySession(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret), {
      algorithms: ["HS256"],
    });
    if (typeof payload.userId !== "string" || !payload.userId) {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(input: {
  secure: boolean;
  sameSite?: "lax" | "none";
}) {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: input.secure,
    sameSite: input.sameSite ?? "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
