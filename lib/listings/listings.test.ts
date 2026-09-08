import { describe, expect, it } from "vitest";

import { assertClientCannotSetStatus, nextStatusAfterSave } from "./lifecycle";
import { isValidForPending, listingWriteSchema } from "./schemas";
import {
  assertOwner,
  guestSeesUnpublishedAsMissing,
  isExpiredForViewer,
  isListingId,
  isPubliclyVisible,
  resolveListingAccess,
} from "./visibility";

const future = new Date("2030-01-15T12:00:00+03:00");
const past = new Date("2020-01-15T12:00:00+03:00");
const now = new Date("2026-09-06T12:00:00+03:00");

describe("create / type validation", () => {
  it("accepts a complete space payload without client status", () => {
    const parsed = listingWriteSchema.parse({
      type: "space",
      title: "Кабинет 14 м² у Садовой",
      description: "Ноготь и бровь.",
      locationId: "11111111-1111-4111-8111-111111111111",
      specializationIds: ["22222222-2222-4222-8222-222222222222"],
      mediaKeys: ["photo-1"],
      priceAmount: 18000,
      pricePeriod: "month",
    });
    expect(parsed.type).toBe("space");
    expect(isValidForPending(parsed)).toBe(true);
  });

  it("rejects incomplete space for pending", () => {
    const parsed = listingWriteSchema.parse({
      type: "space",
      title: "Черновик",
      description: "",
      specializationIds: [],
      mediaKeys: [],
    });
    expect(isValidForPending(parsed)).toBe(false);
  });

  it("requires event start and vacancy direction for pending", () => {
    expect(
      isValidForPending(
        listingWriteSchema.parse({
          type: "event",
          title: "МК",
          description: "Описание",
          locationId: "11111111-1111-4111-8111-111111111111",
          specializationIds: ["22222222-2222-4222-8222-222222222222"],
        }),
      ),
    ).toBe(false);
    expect(
      isValidForPending(
        listingWriteSchema.parse({
          type: "vacancy",
          title: "Мастер",
          description: "Описание",
          locationId: "11111111-1111-4111-8111-111111111111",
          specializationIds: ["22222222-2222-4222-8222-222222222222"],
          direction: "looking_for_master",
        }),
      ),
    ).toBe(true);
  });
});

describe("status", () => {
  it("creates pending when valid, draft when saveDraft", () => {
    expect(
      nextStatusAfterSave({
        current: "draft",
        saveDraft: false,
        validForPending: true,
      }),
    ).toBe("pending");
    expect(
      nextStatusAfterSave({
        current: "draft",
        saveDraft: true,
        validForPending: true,
      }),
    ).toBe("draft");
  });

  it("returns published edits to pending", () => {
    expect(
      nextStatusAfterSave({
        current: "published",
        saveDraft: false,
        validForPending: true,
      }),
    ).toBe("pending");
  });

  it("rejects client status mass assignment", () => {
    expect(() => assertClientCannotSetStatus({ status: "published" })).toThrow(
      "FORBIDDEN",
    );
  });
});

describe("public visibility", () => {
  it("shows only live published listings", () => {
    expect(
      isPubliclyVisible({
        status: "published",
        type: "space",
        expiresAt: future,
        now,
      }),
    ).toBe(true);
  });

  it("hides draft pending rejected expired", () => {
    for (const status of ["draft", "pending", "rejected", "expired"] as const) {
      expect(
        isPubliclyVisible({
          status,
          type: "space",
          expiresAt: null,
          now,
        }),
      ).toBe(false);
    }
  });

  it("hides expired by date even if status is still published", () => {
    expect(
      isPubliclyVisible({
        status: "published",
        type: "space",
        expiresAt: past,
        now,
      }),
    ).toBe(false);
    expect(
      isExpiredForViewer({
        status: "published",
        type: "space",
        expiresAt: past,
        now,
      }),
    ).toBe(true);
  });
});

describe("ownership and guest access", () => {
  it("allows the owner and forbids another user", () => {
    expect(() => assertOwner("author-a", "author-a")).not.toThrow();
    expect(() => assertOwner("author-a", "author-b")).toThrow("FORBIDDEN");
    expect(() => assertOwner("author-a", null)).toThrow("FORBIDDEN");
  });

  it("hides unpublished listings from guests as missing", () => {
    expect(guestSeesUnpublishedAsMissing("draft")).toBe(true);
    expect(guestSeesUnpublishedAsMissing("pending")).toBe(true);
    expect(guestSeesUnpublishedAsMissing("rejected")).toBe(true);
    expect(guestSeesUnpublishedAsMissing("published")).toBe(false);
  });
});

describe("details states", () => {
  it("treats invalid published event in the past as expired, not public", () => {
    expect(
      isPubliclyVisible({
        status: "published",
        type: "event",
        expiresAt: null,
        eventStartsAt: past,
        now,
      }),
    ).toBe(false);
    expect(
      isExpiredForViewer({
        status: "published",
        type: "event",
        expiresAt: null,
        eventStartsAt: past,
        now,
      }),
    ).toBe(true);
  });

  it("treats an invalid listing id as missing", () => {
    expect(isListingId("not-a-uuid")).toBe(false);
    expect(isListingId("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(
      resolveListingAccess({
        exists: false,
        status: "published",
        type: "space",
        expiresAt: future,
        authorId: "author-a",
        viewerId: null,
        now,
      }),
    ).toBe("missing");
  });

  it("lets a guest open a published listing and hides unpublished", () => {
    expect(
      resolveListingAccess({
        exists: true,
        status: "published",
        type: "space",
        expiresAt: future,
        authorId: "author-a",
        viewerId: null,
        now,
      }),
    ).toBe("ok");
    for (const status of ["draft", "pending", "rejected", "archived"] as const) {
      expect(
        resolveListingAccess({
          exists: true,
          status,
          type: "space",
          expiresAt: null,
          authorId: "author-a",
          viewerId: null,
          now,
        }),
      ).toBe("missing");
    }
  });

  it("shows an expired listing as expired, not a silent missing page", () => {
    expect(
      resolveListingAccess({
        exists: true,
        status: "published",
        type: "space",
        expiresAt: past,
        authorId: "author-a",
        viewerId: null,
        now,
      }),
    ).toBe("expired");
  });

  it("lets the owner open a draft while a guest cannot", () => {
    expect(
      resolveListingAccess({
        exists: true,
        status: "draft",
        type: "space",
        expiresAt: null,
        authorId: "author-a",
        viewerId: "author-a",
        now,
      }),
    ).toBe("ok");
    expect(
      resolveListingAccess({
        exists: true,
        status: "draft",
        type: "space",
        expiresAt: null,
        authorId: "author-a",
        viewerId: "author-b",
        now,
      }),
    ).toBe("missing");
  });
});
