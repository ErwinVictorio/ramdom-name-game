import { test, expect } from "@playwright/test";

test("confetti follows the last reveal, runs once, and resets on replay", async ({ page }) => {
  // Keep rendering on the main thread so pixels and frames can be inspected.
  await page.addInitScript(() => { window.OffscreenCanvas = undefined; });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // Isolate the celebration from audio loading and use controlled game timers.
  await page.route("**/*.mp3", route => route.abort());
  await page.goto("/");
  await page.clock.install();
  await page.getByLabel("Names List").fill("Ana\nBob");
  await page.getByLabel("Timer Settings").fill("3");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.getByText("Sound unavailable.", { exact: false })).toBeVisible();
  await page.clock.runFor(6000);
  await expect(page.locator(".result-grid strong")).toHaveCount(1);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.clock.runFor(3000);
  await expect(page.locator(".cups-grid .is-open")).toHaveCount(2);
  await page.clock.runFor(700);
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect.poll(() => page.locator("canvas").evaluate(canvas => {
    const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    return pixels.some((value, index) => index % 4 === 3 && value > 0);
  })).toBe(true);
  await page.screenshot({ path: "test-results/confetti.png", fullPage: true });
  await page.getByRole("button", { name: "Play Again" }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.clock.runFor(10000);
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.clock.runFor(8000);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "New Game", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.clock.runFor(1000);
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("reduced motion skips confetti", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/*.mp3", route => route.abort());
  await page.goto("/");
  await page.clock.install();
  await page.getByLabel("Names List").fill("Ana\nBob");
  await page.getByLabel("Timer Settings").fill("3");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.getByText("Sound unavailable.", { exact: false })).toBeVisible();
  await page.clock.runFor(10000);
  await expect(page.getByRole("heading", { name: "Final Order" })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});
