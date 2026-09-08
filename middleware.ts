import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/constants";
import { safeNext } from "@/lib/auth/safe-next";
import { verifySession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  let authenticated = false;

  if (token && secret && secret.length >= 32) {
    authenticated = Boolean(await verifySession(token, secret));
  }

  if (pathname.startsWith("/profile") && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent("/profile")}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/onboarding") && !authenticated) {
    const next = safeNext(searchParams.get("next"));
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/onboarding/:path*"],
};
