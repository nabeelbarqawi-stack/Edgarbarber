import { describe, expect, it } from "vitest";
import { waitlistConfirmationEmail } from "@/lib/email";

describe("waitlist confirmation email", () => {
  const unsubscribeUrl = "https://site.test/unsubscribe?token=abc.def";

  it("escapes HTML in the subscriber's name", () => {
    const email = waitlistConfirmationEmail({ name: '<script>alert("x")</script>', unsubscribeUrl });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
  });

  it("includes the unsubscribe link in HTML and text", () => {
    const email = waitlistConfirmationEmail({ name: "Jordan", unsubscribeUrl });
    expect(email.html).toContain(unsubscribeUrl.replace("&", "&amp;"));
    expect(email.text).toContain(unsubscribeUrl);
  });

  it("names the product in the subject and has a text alternative", () => {
    const email = waitlistConfirmationEmail({ name: "Jordan", unsubscribeUrl });
    expect(email.subject).toMatch(/Oak and Whiskey Beard Balm/);
    expect(email.text).toMatch(/Jordan/);
  });
});
