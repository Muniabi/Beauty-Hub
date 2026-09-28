import { NextRequest, NextResponse } from "next/server";

import { sessionCookieOptions, signSession } from "@/lib/auth/session";
import { newId } from "@/lib/db/ids";
import { isMongoConfigured, usersCollection } from "@/lib/db/mongo";
import { getSessionSecret, isSecureCookie } from "@/lib/env";
import { safeNext } from "@/lib/auth/safe-next";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!isMongoConfigured()) {
    return new NextResponse("MongoDB is not configured", { status: 503 });
  }

  const role = request.nextUrl.searchParams.get("role") === "user" ? "user" : "admin";
  const next = safeNext(request.nextUrl.searchParams.get("next") ?? "/admin/listings");
  const users = await usersCollection();

  const username = role === "admin" ? "dev_admin" : "dev_user";
  let user = await users.findOne({ "telegram.username": username });

  if (!user) {
    const now = new Date();
    const doc = {
      _id: newId(),
      role: role === "admin" ? ("space_owner" as const) : ("master" as const),
      isAdmin: role === "admin",
      onboardingCompleted: true,
      status: "active" as const,
      createdAt: now,
      lastLoginAt: now,
      profile: {
        displayName: role === "admin" ? "Модератор Dev" : "Мастер Dev",
        bio: null,
        districtLocationId: null,
        avatarObjectKey: null,
        contactTelegram: `@${username}`,
        contactPhone: role === "admin" ? null : "+79001112233",
        instagram: null,
        specializationId: null,
      },
      telegram: {
        telegramUserId: role === "admin" ? 900001 : 900002,
        username,
        connectedAt: now,
        botBlocked: false,
        lastAuthDate: Math.floor(Date.now() / 1000),
      },
      notificationPreference: {
        notifySpace: false,
        notifyEvent: false,
        notifyVacancy: false,
        updatedAt: now,
      },
    };
    await users.insertOne(doc);
    user = doc;
  } else if (role === "admin" && !user.isAdmin) {
    await users.updateOne({ _id: user._id }, { $set: { isAdmin: true } });
  }

  const token = await signSession({ userId: user._id }, getSessionSecret());
  const cookie = sessionCookieOptions({ secure: isSecureCookie() });
  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(cookie.name, token, cookie);
  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
