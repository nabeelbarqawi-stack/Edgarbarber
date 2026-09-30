import { expect, test } from "@playwright/test";

const BOOKING_URL = "https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx";

test.describe("About Edgar + booking (US2)", () => {
  for (const path of ["/", "/unsubscribe"]) {
    test(`every booking link on ${path} opens Square in a new tab`, async ({ page }) => {
      await page.goto(path);
      const links = page.getByTestId("booking-link");
      expect(await links.count()).toBeGreaterThan(0);
      for (const link of await links.all()) {
        await expect(link).toHaveAttribute("href", BOOKING_URL);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/);
      }
    });
  }

  test("header booking link is visible on a phone without scrolling", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner").getByTestId("booking-link")).toBeInViewport();
  });

  test("About section shows bio, shop, and a video that does not autoplay", async ({ page }) => {
    await page.goto("/#about");
    const about = page.getByRole("region", { name: "About Edgar" });
    await expect(about.getByText(/Edgar Salazar is a barber/)).toBeVisible();
    await expect(about.getByText("Quality Cuts").first()).toBeVisible();
    await expect(about.getByText("Forest Hill, TX").first()).toBeVisible();
    await expect(about.getByTestId("booking-link")).toBeVisible();

    const video = about.locator("video");
    await expect(video).toHaveAttribute("controls", "");
    await expect(video).toHaveAttribute("poster", /edgar-cutting-poster\.jpg/);
    await expect(video).toHaveAttribute("preload", "none");
    await expect(video).not.toHaveAttribute("autoplay", /.*/);
  });
});
