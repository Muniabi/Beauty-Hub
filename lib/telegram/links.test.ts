import { describe, expect, it } from "vitest";

import { compactListingStartParam } from "@/lib/auth/start-param";
import { startParamFromPath, telegramMiniAppHref } from "@/lib/telegram/links";

describe("telegram Mini App links", () => {
  it("maps next paths onto startapp tokens", () => {
    expect(startParamFromPath("/create")).toBe("create");
    expect(startParamFromPath("/create/space")).toBe("create");
    expect(startParamFromPath("/profile")).toBe("profile");
    expect(startParamFromPath("/search?type=space")).toBe("search");
    expect(startParamFromPath("/")).toBe("");
    const id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    expect(startParamFromPath(`/listings/${id}`)).toBe(compactListingStartParam(id));
  });

  it("builds a t.me startapp URL when the bot username is set", () => {
    const previous = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = "BeautyHubRostovBot";
    expect(telegramMiniAppHref("/profile")).toBe(
      "https://t.me/BeautyHubRostovBot?startapp=profile",
    );
    expect(telegramMiniAppHref("/", "create")).toBe(
      "https://t.me/BeautyHubRostovBot?startapp=create",
    );
    expect(telegramMiniAppHref("/")).toBe("https://t.me/BeautyHubRostovBot");
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = previous;
  });
});
