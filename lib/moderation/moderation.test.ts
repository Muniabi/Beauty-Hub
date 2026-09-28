import { describe, expect, it } from "vitest";

import { expiresAtFromPublish } from "@/lib/listings/lifecycle";
import {
  isQueueStatusFilter,
  statusesForQueueFilter,
} from "@/lib/moderation/constants";
import { formatRelativeRu } from "@/lib/moderation/format";

describe("moderation helpers", () => {
  it("maps queue filters to statuses", () => {
    expect(isQueueStatusFilter("pending")).toBe(true);
    expect(isQueueStatusFilter("draft")).toBe(false);
    expect(statusesForQueueFilter("pending")).toEqual(["pending"]);
    expect(statusesForQueueFilter("all")).toBeNull();
  });

  it("sets 30-day expiry from publish time", () => {
    const publishedAt = new Date("2026-09-01T10:00:00.000Z");
    const expires = expiresAtFromPublish(publishedAt);
    expect(expires.toISOString()).toBe("2026-10-01T10:00:00.000Z");
  });

  it("formats relative Russian time", () => {
    const now = new Date("2026-09-28T12:00:00.000Z");
    const twoHoursAgo = new Date("2026-09-28T10:00:00.000Z");
    expect(formatRelativeRu(twoHoursAgo, now)).toContain("час");
  });
});
