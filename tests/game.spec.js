import { test, expect } from "@playwright/test";

test("validates names and timer and updates cup count", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".cups-grid .cup")).toHaveCount(6);
  await page.getByRole("button", { name: "Clear Names" }).click();
  await expect(page.getByRole("button", { name: "Start Game" })).toBeDisabled();
  await page.getByLabel("Names List").fill("  Ana   Cruz  \n\nBob\nana cruz");
  await expect(page.locator("#validation")).toContainText("Duplicate");
  await page.getByLabel("Names List").fill("  Ana   Cruz  \n\nBob");
  await expect(page.locator(".cups-grid .cup")).toHaveCount(2);
  for (const invalid of ["2", "31", "3.5", ""]) {
    await page.getByLabel("Timer Settings").fill(invalid);
    await expect(
      page.getByRole("button", { name: "Start Game" }),
    ).toBeDisabled();
  }
  await page.getByRole("button", { name: "10s", exact: true }).click();
  await expect(page.getByLabel("Timer Settings")).toHaveValue("10");
  await expect(page.getByRole("button", { name: "Start Game" })).toBeEnabled();
  await page
    .getByLabel("Names List")
    .fill(Array.from({ length: 13 }, (_, i) => `Person ${i}`).join("\n"));
  await expect(page.locator("#validation")).toContainText("no more than 12");
  await expect(page.getByRole("button", { name: "Start Game" })).toBeDisabled();
});

test("one play reveals everyone once, then replay and reset work", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByLabel("Timer Settings").fill("3");
  const names = (await page.getByLabel("Names List").inputValue()).split("\n");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.getByLabel("Names List")).toBeDisabled();
  await expect(page.getByLabel("Timer Settings")).toBeDisabled();
  await expect(page.locator(".result-grid strong")).toHaveCount(0);
  await expect(page.locator(".game-status")).toContainText("Shuffling");
  await expect(page.locator(".game-status")).toContainText("Slowing", {
    timeout: 5000,
  });
  await expect(page.locator(".result-grid strong")).toHaveCount(1, {
    timeout: 16000,
  });
  const first = await page.locator(".result-grid strong").first().textContent();
  await expect(page.getByRole("heading", { name: "Final Order" })).toBeVisible({
    timeout: 20000,
  });
  const results = await page.locator(".result-grid strong").allTextContents();
  expect(results[0]).toBe(first);
  expect([...results].sort()).toEqual([...names].sort());
  await expect(page.locator(".cups-grid .is-open")).toHaveCount(6);
  await page.getByRole("button", { name: "Play Again" }).click();
  await expect(page.locator(".result-grid strong")).toHaveCount(0);
  await expect(page.getByLabel("Names List")).toHaveValue(names.join("\n"));
  await expect(page.getByLabel("Timer Settings")).toHaveValue("3");
  await page.getByRole("button", { name: "Reset Game", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByLabel("Names List")).toHaveValue(names.join("\n"));
  await expect(page.getByLabel("Names List")).toBeDisabled();
  await page.getByRole("button", { name: "Reset Game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset Game" })
    .click();
  await expect(page.getByLabel("Names List")).toHaveValue("");
  await expect(page.getByLabel("Timer Settings")).toHaveValue("5");
  await page.waitForTimeout(6000);
  await expect(page.locator(".cups-grid .cup")).toHaveCount(0);
  await expect(page.locator(".result-grid strong")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("desktop and mobile fit the viewport with twelve long names", async ({
  page,
}) => {
  await page.goto("/");
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page
    .getByLabel("Names List")
    .fill(
      Array.from(
        { length: 12 },
        (_, i) => `Participant ${i + 1} with a longer name`,
      ).join("\n"),
    );
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator(".cups-grid .cup")).toHaveCount(12);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});

test("twelve participants finish on mobile with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const names = Array.from(
    { length: 12 },
    (_, i) => `Participant ${i + 1} with a longer name`,
  );
  await page.getByLabel("Names List").fill(names.join("\n"));
  await page.getByLabel("Timer Settings").fill("3");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect(page.getByRole("heading", { name: "Final Order" })).toBeVisible({
    timeout: 55000,
  });
  expect(
    (await page.locator(".result-grid strong").allTextContents()).sort(),
  ).toEqual([...names].sort());
  await expect(page.locator(".cups-grid .is-open")).toHaveCount(12);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/mobile-finished.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "New Game", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".result-grid strong")).toHaveCount(12);
});
