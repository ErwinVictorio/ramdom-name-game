import { test, expect } from "@playwright/test";

async function observeAudio(page, blocked = false) {
  await page.addInitScript((blocked) => {
    const NativeAudio = window.Audio;
    window.gameAudio = [];
    window.audiblePlays = 0;
    window.audioEndedAt = 0;
    window.Audio = function (...args) {
      const audio = new NativeAudio(...args);
      window.gameAudio.push(audio);
      const nativePlay = audio.play.bind(audio);
      audio.play = () => {
        if (!audio.muted) window.audiblePlays++;
        return nativePlay();
      };
      audio.addEventListener("ended", () => {
        window.audioEndedAt = performance.now();
      });
      if (blocked)
        audio.play = () =>
          Promise.reject(new DOMException("Blocked", "NotAllowedError"));
      return audio;
    };
    window.revealTimes = [];
    new MutationObserver(() => {
      const count = document.querySelectorAll(".result-grid strong").length;
      if (count > window.revealTimes.length)
        window.revealTimes.push(performance.now());
    }).observe(document, { subtree: true, childList: true });
  }, blocked);
}

test("one full drum roll ends before reveals; replay and reset clean up audio", async ({
  page,
}) => {
  await observeAudio(page);
  await page.goto("/");
  await page.getByLabel("Names List").fill("Ana\nBob");
  await page.getByLabel("Timer Settings").fill("3");
  await page.getByRole("button", { name: "Start Game" }).click();
  await expect
    .poll(() => page.evaluate(() => window.gameAudio[0]?.paused))
    .toBe(true);
  await expect(page.locator(".game-status")).toContainText("Drum roll", {
    timeout: 8000,
  });
  await expect(page.getByLabel("Names List")).toBeDisabled();
  await expect(page.getByLabel("Timer Settings")).toBeDisabled();
  await expect(page.locator(".result-grid strong")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const audio = window.gameAudio[0];
        return !audio.paused && !audio.muted && audio.currentTime > 0;
      }),
    )
    .toBe(true);
  // The previous behavior cut the sound at three seconds; it must now keep playing.
  await expect
    .poll(() => page.evaluate(() => window.gameAudio[0].currentTime), {
      timeout: 6000,
    })
    .toBeGreaterThan(3.2);
  await expect(page.locator(".result-grid strong")).toHaveCount(0);
  await expect(
    page.getByText("Sound unavailable.", { exact: false }),
  ).toHaveCount(0);
  await expect(page.locator(".result-grid strong")).toHaveCount(1, {
    timeout: 10000,
  });
  const playback = await page.evaluate(() => ({
    endedAt: window.audioEndedAt,
    firstReveal: window.revealTimes[0],
    plays: window.audiblePlays,
    loop: window.gameAudio[0].loop,
  }));
  expect(playback.endedAt).toBeGreaterThan(0);
  expect(playback.firstReveal).toBeGreaterThanOrEqual(playback.endedAt);
  expect(playback.plays).toBe(1);
  expect(playback.loop).toBe(false);
  await expect(page.locator(".result-grid strong")).toHaveCount(2, {
    timeout: 5000,
  });
  expect(await page.evaluate(() => window.audiblePlays)).toBe(1);
  const interval = await page.evaluate(
    () => window.revealTimes[1] - window.revealTimes[0],
  );
  expect(interval).toBeGreaterThanOrEqual(2900);
  expect(interval).toBeLessThan(3500);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.gameAudio[0].paused && window.gameAudio[0].currentTime === 0,
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Play Again" }).click();
  await expect(page.locator(".game-status")).toContainText("Drum roll", {
    timeout: 8000,
  });
  await expect
    .poll(() => page.evaluate(() => !window.gameAudio[0].paused))
    .toBe(true);
  expect(await page.evaluate(() => window.gameAudio.length)).toBe(1);
  await page.getByRole("button", { name: "Reset Game", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await page.evaluate(() => window.gameAudio[0].paused)).toBe(false);
  await page.getByRole("button", { name: "Reset Game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset Game" })
    .click();
  expect(await page.evaluate(() => window.gameAudio[0].paused)).toBe(true);
  // Even a stale media event after reset cannot open a cup.
  await page.evaluate(() =>
    window.gameAudio[0].dispatchEvent(new Event("ended")),
  );
  await page.waitForTimeout(9500);
  await expect(page.locator(".result-grid strong")).toHaveCount(0);
});

for (const failure of ["blocked", "missing"]) {
  test(`game completes when audio is ${failure}`, async ({ page }) => {
    await observeAudio(page, failure === "blocked");
    if (failure === "missing")
      await page.route("**/*.mp3", (route) => route.abort());
    await page.goto("/");
    await page.getByLabel("Names List").fill("Ana\nBob");
    await page.getByLabel("Timer Settings").fill("3");
    await page.getByRole("button", { name: "Start Game" }).click();
    await expect(
      page.getByText("Sound unavailable.", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Final Order" }),
    ).toBeVisible({ timeout: 12000 });
    await expect(page.locator(".result-grid strong")).toHaveCount(2);
  });
}
