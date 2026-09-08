import { describe, expect, it } from "vitest";

import {
  CANCEL_TEXT,
  HELP_TEXT,
  NOTIFICATIONS_TEXT,
  OPEN_BEAUTY_HUB,
  OPEN_NOTIFICATIONS,
  OPEN_PROFILE,
  PROFILE_TEXT,
  PROFILE_UNIDENTIFIED_TEXT,
  START_TEXT,
  botReplyFor,
  parseBotCommand,
} from "./commands";

describe("telegram bot commands", () => {
  it("parses slash commands with optional bot mention and payload", () => {
    expect(parseBotCommand("/start")).toEqual({ command: "start", payload: "" });
    expect(parseBotCommand("/start@BeautyHubRostovBot")).toEqual({
      command: "start",
      payload: "",
    });
    expect(parseBotCommand("/start l_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toEqual({
      command: "start",
      payload: "l_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    expect(parseBotCommand("/help")).toEqual({ command: "help", payload: "" });
    expect(parseBotCommand("просто текст")).toEqual({
      command: "unknown",
      payload: "",
    });
  });

  it("returns HTML start copy and a Mini App web_app URL", () => {
    const reply = botReplyFor({ command: "start", payload: "" });
    expect(reply.text).toBe(START_TEXT);
    expect(reply.parseMode).toBe("HTML");
    expect(reply.buttonText).toBe(OPEN_BEAUTY_HUB);
    expect(reply.webAppUrl).toContain("/telegram");
    expect(reply.text).toContain("<b>Beauty Hub</b>");
  });

  it("opens a listing Mini App URL from a start payload", () => {
    const reply = botReplyFor({
      command: "start",
      payload: "l_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    expect(reply.webAppUrl).toContain("next=");
    expect(decodeURIComponent(reply.webAppUrl ?? "")).toContain(
      "/listings/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    );
  });

  it("maps help, profile, notifications and cancel", () => {
    const help = botReplyFor({ command: "help", payload: "" });
    expect(help.text).toBe(HELP_TEXT);
    expect(help.buttonText).toBe(OPEN_BEAUTY_HUB);

    const identified = botReplyFor(
      { command: "profile", payload: "" },
      { telegramUserId: 123 },
    );
    expect(identified.text).toBe(PROFILE_TEXT);
    expect(identified.buttonText).toBe(OPEN_PROFILE);
    expect(identified.webAppUrl).toContain("next=%2Fprofile");

    const unidentified = botReplyFor({ command: "profile", payload: "" });
    expect(unidentified.text).toBe(PROFILE_UNIDENTIFIED_TEXT);
    expect(unidentified.buttonText).toBe(OPEN_BEAUTY_HUB);

    const notify = botReplyFor({ command: "notifications", payload: "" });
    expect(notify.text).toBe(NOTIFICATIONS_TEXT);
    expect(notify.buttonText).toBe(OPEN_NOTIFICATIONS);
    expect(notify.webAppUrl).toContain("next=%2Fprofile");

    expect(botReplyFor({ command: "cancel", payload: "" })).toMatchObject({
      text: CANCEL_TEXT,
      buttonText: null,
      webAppUrl: null,
    });
  });
});
