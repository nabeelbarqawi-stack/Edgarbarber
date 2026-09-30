import { describe, expect, it, vi } from "vitest";
import { RateLimitedError, joinWaitlist, type WaitlistDeps, type WaitlistInput } from "@/lib/waitlist";

const NOW = 1_800_000_000_000;

function input(overrides: Partial<WaitlistInput> = {}): WaitlistInput {
  return {
    name: "  Jordan Lee ",
    email: " Jordan@Example.COM ",
    consent: "on",
    website: "",
    startedAt: String(NOW - 10_000),
    ip: "203.0.113.7",
    ...overrides,
  };
}

function deps(overrides: Partial<WaitlistDeps> = {}): WaitlistDeps {
  return {
    now: () => NOW,
    hashIp: (ip) => (ip ? `hash:${ip}` : null),
    insertSignup: vi.fn(async () => ({ id: "signup-1", created: true })),
    sendConfirmation: vi.fn(async () => ({ ok: true as const })),
    recordEmailResult: vi.fn(async () => {}),
    unsubscribeUrl: (id) => `https://site.test/unsubscribe?token=${id}`,
    ...overrides,
  };
}

describe("joinWaitlist validation", () => {
  it("rejects an empty name", async () => {
    const d = deps();
    const result = await joinWaitlist(input({ name: "   " }), d);
    expect(result).toMatchObject({ status: "error", fieldErrors: { name: expect.any(String) } });
    expect(d.insertSignup).not.toHaveBeenCalled();
  });

  it("rejects a name longer than 80 characters", async () => {
    const result = await joinWaitlist(input({ name: "a".repeat(81) }), deps());
    expect(result).toMatchObject({ status: "error", fieldErrors: { name: expect.any(String) } });
  });

  it("rejects an invalid email", async () => {
    const d = deps();
    const result = await joinWaitlist(input({ email: "not-an-email" }), d);
    expect(result).toMatchObject({ status: "error", fieldErrors: { email: expect.any(String) } });
    expect(d.insertSignup).not.toHaveBeenCalled();
  });

  it("requires consent", async () => {
    const d = deps();
    const result = await joinWaitlist(input({ consent: null }), d);
    expect(result).toMatchObject({ status: "error", fieldErrors: { consent: expect.any(String) } });
    expect(d.insertSignup).not.toHaveBeenCalled();
  });

  it("trims the name and lower-cases the email before saving", async () => {
    const d = deps();
    await joinWaitlist(input(), d);
    expect(d.insertSignup).toHaveBeenCalledWith({
      name: "Jordan Lee",
      email: "jordan@example.com",
      ipHash: "hash:203.0.113.7",
    });
  });
});

describe("joinWaitlist bot protection", () => {
  it("silently succeeds without saving when the honeypot is filled", async () => {
    const d = deps();
    const result = await joinWaitlist(input({ website: "http://spam.test" }), d);
    expect(result).toEqual({ status: "success" });
    expect(d.insertSignup).not.toHaveBeenCalled();
  });

  it("silently succeeds without saving when submitted in under 3 seconds", async () => {
    const d = deps();
    const result = await joinWaitlist(input({ startedAt: String(NOW - 1_000) }), d);
    expect(result).toEqual({ status: "success" });
    expect(d.insertSignup).not.toHaveBeenCalled();
  });

  it("returns a friendly error when rate limited", async () => {
    const d = deps({
      insertSignup: vi.fn(async () => {
        throw new RateLimitedError();
      }),
    });
    const result = await joinWaitlist(input(), d);
    expect(result).toMatchObject({ status: "error", message: expect.stringMatching(/too many/i) });
  });
});

describe("joinWaitlist email", () => {
  it("sends a confirmation for a new signup and records success", async () => {
    const d = deps();
    const result = await joinWaitlist(input(), d);
    expect(result).toEqual({ status: "success" });
    expect(d.sendConfirmation).toHaveBeenCalledWith({
      name: "Jordan Lee",
      email: "jordan@example.com",
      unsubscribeUrl: "https://site.test/unsubscribe?token=signup-1",
    });
    expect(d.recordEmailResult).toHaveBeenCalledWith("signup-1", { ok: true });
  });

  it("shows the same success and sends nothing for an existing email", async () => {
    const d = deps({ insertSignup: vi.fn(async () => ({ id: "signup-1", created: false })) });
    const result = await joinWaitlist(input(), d);
    expect(result).toEqual({ status: "success" });
    expect(d.sendConfirmation).not.toHaveBeenCalled();
  });

  it("keeps the signup and records the failure when the email cannot be sent", async () => {
    const d = deps({ sendConfirmation: vi.fn(async () => ({ ok: false as const, error: "Resend down" })) });
    const result = await joinWaitlist(input(), d);
    expect(result).toEqual({ status: "success" });
    expect(d.recordEmailResult).toHaveBeenCalledWith("signup-1", { ok: false, error: "Resend down" });
  });

  it("returns a generic error when saving fails unexpectedly", async () => {
    const d = deps({
      insertSignup: vi.fn(async () => {
        throw new Error("db down");
      }),
    });
    const result = await joinWaitlist(input(), d);
    expect(result).toMatchObject({ status: "error", message: expect.any(String) });
    expect(d.sendConfirmation).not.toHaveBeenCalled();
  });
});
