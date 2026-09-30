import { beforeAll, describe, expect, it } from "vitest";
import { createUnsubscribeToken, verifyUnsubscribeToken } from "@/lib/tokens";

beforeAll(() => {
  process.env.UNSUBSCRIBE_SECRET = "test-secret-that-is-long-enough-1234567890";
});

describe("unsubscribe tokens", () => {
  const id = "0b1c2d3e-4f50-6172-8394-a5b6c7d8e9f0";

  it("round-trips a signup id", () => {
    expect(verifyUnsubscribeToken(createUnsubscribeToken(id))).toBe(id);
  });

  it("rejects a tampered signature", () => {
    const token = createUnsubscribeToken(id);
    const tampered = token.slice(0, -2) + (token.endsWith("AA") ? "BB" : "AA");
    expect(verifyUnsubscribeToken(tampered)).toBeNull();
  });

  it("rejects a token for a different id", () => {
    const [, sig] = createUnsubscribeToken(id).split(".");
    expect(verifyUnsubscribeToken(`another-id.${sig}`)).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(verifyUnsubscribeToken("")).toBeNull();
    expect(verifyUnsubscribeToken("no-dot")).toBeNull();
    expect(verifyUnsubscribeToken(null)).toBeNull();
  });
});
