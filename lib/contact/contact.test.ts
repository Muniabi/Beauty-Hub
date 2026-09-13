import { describe, expect, it } from "vitest";

import { authorTelegramHandle, phoneHref, telegramChatHref } from "./href";
import { resolveContactReveal } from "./resolve";

const now = new Date("2026-09-13T12:00:00+03:00");
const future = new Date("2030-01-15T12:00:00+03:00");
const past = new Date("2020-01-15T12:00:00+03:00");

const publishedSpace = {
  exists: true,
  status: "published" as const,
  type: "space" as const,
  expiresAt: future,
  authorId: "author-a",
};

const author = {
  status: "active" as const,
  contactTelegram: "anna_master",
  telegramUsername: "anna_master",
  contactPhone: "89001234567",
};

const seeker = { id: "seeker-b", profileCompleted: true };

describe("telegram contact href", () => {
  it("builds t.me from a profile handle and ignores @", () => {
    expect(telegramChatHref("@anna_master")).toBe("https://t.me/anna_master");
    expect(authorTelegramHandle({ contactTelegram: "@anna_master" })).toBe(
      "anna_master",
    );
  });

  it("falls back to the Telegram username if the profile handle is empty", () => {
    expect(
      authorTelegramHandle({
        contactTelegram: "",
        telegramUsername: "from_login",
      }),
    ).toBe("from_login");
  });

  it("does not invent invite links for numeric ids", () => {
    expect(telegramChatHref("123456789")).toBe(null);
  });

  it("builds tel links from a Russian mobile number", () => {
    expect(phoneHref("+7 (900) 123-45-67")).toBe("tel:+79001234567");
  });
});

describe("resolveContactReveal", () => {
  it("hides contact from guests and incomplete profiles", () => {
    expect(
      resolveContactReveal({
        viewer: null,
        listing: publishedSpace,
        author,
        now,
      }),
    ).toEqual({ ok: false, reason: "unauthorized" });
    expect(
      resolveContactReveal({
        viewer: { id: "seeker-b", profileCompleted: false },
        listing: publishedSpace,
        author,
        now,
      }),
    ).toEqual({ ok: false, reason: "forbidden" });
  });

  it("lets a completed seeker write to the listing author", () => {
    expect(
      resolveContactReveal({
        viewer: seeker,
        listing: publishedSpace,
        author,
        now,
      }),
    ).toEqual({
      ok: true,
      telegram: "anna_master",
      telegramHref: "https://t.me/anna_master",
      phone: "89001234567",
      phoneHref: "tel:89001234567",
    });
  });

  it("does not let the author contact themselves", () => {
    expect(
      resolveContactReveal({
        viewer: { id: "author-a", profileCompleted: true },
        listing: publishedSpace,
        author,
        now,
      }),
    ).toEqual({ ok: false, reason: "own_listing" });
  });

  it("does not reveal contact on unpublished or expired listings", () => {
    expect(
      resolveContactReveal({
        viewer: seeker,
        listing: { ...publishedSpace, status: "pending" },
        author,
        now,
      }),
    ).toEqual({ ok: false, reason: "not_found" });
    expect(
      resolveContactReveal({
        viewer: seeker,
        listing: { ...publishedSpace, expiresAt: past },
        author,
        now,
      }),
    ).toEqual({ ok: false, reason: "expired" });
  });

  it("hides past events from contact the same way as the catalog", () => {
    expect(
      resolveContactReveal({
        viewer: seeker,
        listing: {
          exists: true,
          status: "published",
          type: "event",
          expiresAt: null,
          eventStartsAt: past,
          authorId: "author-a",
        },
        author,
        now,
      }),
    ).toEqual({ ok: false, reason: "expired" });
  });

  it("fails closed when the author has no usable Telegram handle", () => {
    expect(
      resolveContactReveal({
        viewer: seeker,
        listing: publishedSpace,
        author: {
          status: "active",
          contactTelegram: "",
          telegramUsername: null,
          contactPhone: null,
        },
        now,
      }),
    ).toEqual({ ok: false, reason: "unavailable" });
  });
});
