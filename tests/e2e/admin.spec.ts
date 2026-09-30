import { expect, test } from "@playwright/test";

test.describe("owner admin (US3)", () => {
  test("admin pages redirect to sign-in when signed out", async ({ page }) => {
    for (const path of ["/admin", "/admin/waitlist"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });

  test("waitlist export is not available when signed out", async ({ request }) => {
    const response = await request.get("/admin/waitlist/export", { maxRedirects: 0 });
    expect([302, 303, 307, 308]).toContain(response.status());
    expect(response.headers()["location"]).toMatch(/\/admin\/login/);
  });

  test("sign-in page has a labelled email field", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /owner sign-in/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: /send sign-in link/i })).toBeVisible();
  });
});
