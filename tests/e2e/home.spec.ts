import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("home page: product + waitlist (US1)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("product and waitlist action are visible without scrolling", async ({ page }) => {
    const hero = page.getByTestId("product-hero");
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Oak and Whiskey Beard Balm");
    for (const locator of [
      hero.getByRole("img").first(),
      hero.getByRole("heading", { level: 1 }),
      hero.getByText("$20.00"),
      hero.getByRole("link", { name: "Join the waitlist" }),
    ]) {
      await expect(locator).toBeInViewport();
    }
  });

  test("details show every photo with alt text, ingredients and size", async ({ page }) => {
    const details = page.getByTestId("product-details");
    const photos = details.getByRole("img");
    await expect(photos).toHaveCount(4);
    for (const alt of await photos.evaluateAll((els) => els.map((el) => el.getAttribute("alt") ?? ""))) {
      expect(alt.trim().length).toBeGreaterThan(10);
    }
    await expect(details.getByRole("listitem")).toHaveCount(8);
    await expect(details.getByText("Hemp Seed Oil")).toBeVisible();
    await expect(page.getByText("62 g / 2 oz").first()).toBeVisible();
  });

  test("waitlist form shows inline errors for invalid input", async ({ page }) => {
    const form = page.getByRole("form", { name: "Join the waitlist" });
    await form.getByLabel("Name", { exact: true }).fill("Jordan");
    await form.getByLabel("Email", { exact: true }).fill("not-an-email");
    await form.getByRole("button", { name: "Join the waitlist" }).click();
    await expect(form.getByText(/valid email/i)).toBeVisible();
    await expect(form.getByText(/agree/i).first()).toBeVisible();
    await expect(form.getByLabel("Email", { exact: true })).toHaveAttribute("aria-invalid", "true");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious, JSON.stringify(serious.map((v) => [v.id, v.nodes.map((n) => n.target)]), null, 2)).toEqual([]);
  });
});
