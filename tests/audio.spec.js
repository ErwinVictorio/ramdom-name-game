import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

async function observeAudio(page, blocked = false) {
  await page.addInitScript((blocked) => {
    const NativeContext = window.AudioContext;
    window.audioContexts = [];
    window.audioPlays = [];
    window.resumeGestures = [];
    window.AudioContext = class extends NativeContext {
      constructor(...args) {
        super(...args);
        window.audioContexts.push(this);
      }
      resume() {
        const active = navigator.userActivation.isActive;
        window.resumeGestures.push(active);
        if (blocked || !active)
          return Promise.reject(
            new DOMException("Requires a tap", "NotAllowedError"),
          );
        return super.resume();
      }
      createBufferSource() {
        const source = super.createBufferSource();
        const record = {
          source,
          context: this,
          endedAt: 0,
          stopped: false,
          startedAt: 0,
        };
        const start = source.start.bind(source);
        const stop = source.stop.bind(source);
        source.start = (...args) => {
          record.startedAt = performance.now();
          window.audioPlays.push(record);
          return start(...args);
        };
        source.stop = (...args) => {
          record.stopped = true;
          return stop(...args);
        };
        source.addEventListener("ended", () => {
          record.endedAt = performance.now();
        });
        const connect = source.connect.bind(source);
        source.connect = (destination) => {
          record.analyser = this.createAnalyser();
          record.analyser.connect(destination);
          return connect(record.analyser);
        };
        return source;
      }
    };
    window.revealTimes = [];
    new MutationObserver(() => {
      const count = document.querySelectorAll(".result-grid strong").length;
      if (count > window.revealTimes.length)
        window.revealTimes.push(performance.now());
    }).observe(document, { subtree: true, childList: true });
  }, blocked);
}

test("touch activation plays one full audible clip before reveals; replay and reset work", async ({
  page,
}) => {
  await observeAudio(page);
  await page.goto("/");
  await page.getByLabel("Names List").fill("Ana\nBob");
  await page.getByLabel("Timer Settings").fill("3");
  await page.getByRole("button", { name: "Start Game" }).tap();
  expect(await page.evaluate(() => window.resumeGestures)).toEqual([true]);
  await expect.poll(() => page.evaluate(() => window.audioPlays.length)).toBe(1);
  await expect(page.locator(".game-status")).toContainText("Shuffling", {
    timeout: 8000,
  });
  await expect(page.getByLabel("Names List")).toBeDisabled();
  await expect(page.locator(".result-grid strong")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const record = window.audioPlays[0];
        if (!record) return 0;
        const samples = new Float32Array(record.analyser.fftSize);
        record.analyser.getFloatTimeDomainData(samples);
        return Math.max(...samples.map(Math.abs));
      }),
    )
    .toBeGreaterThan(0.001);
  await page.waitForTimeout(3300);
  await expect(page.locator(".result-grid strong")).toHaveCount(0);
  await expect(
    page.getByText("Sound unavailable.", { exact: false }),
  ).toHaveCount(0);
  await expect(page.locator(".result-grid strong")).toHaveCount(1, {
    timeout: 10000,
  });
  const playback = await page.evaluate(() => ({
    endedAt: window.audioPlays[0].endedAt,
    startedAt: window.audioPlays[0].startedAt,
    duration: window.audioPlays[0].source.buffer.duration,
    firstReveal: window.revealTimes[0],
    plays: window.audioPlays.length,
    loop: window.audioPlays[0].source.loop,
  }));
  expect(playback.endedAt - playback.startedAt).toBeGreaterThan(
    playback.duration * 1000 - 300,
  );
  expect(playback.firstReveal).toBeGreaterThanOrEqual(playback.endedAt);
  expect(playback.plays).toBe(1);
  expect(playback.loop).toBe(false);
  await expect(page.locator(".result-grid strong")).toHaveCount(2, {
    timeout: 6500,
  });
  expect(await page.evaluate(() => window.audioPlays.length)).toBe(1);
  const interval = await page.evaluate(
    () => window.revealTimes[1] - window.revealTimes[0],
  );
  expect(interval).toBeGreaterThanOrEqual(4900);
  expect(interval).toBeLessThan(5500);
  await page.getByRole("button", { name: "Play Again" }).tap();
  await expect
    .poll(() => page.evaluate(() => window.audioPlays.length), {
      timeout: 8000,
    })
    .toBe(2);
  expect(await page.evaluate(() => window.audioContexts.length)).toBe(1);
  expect(await page.evaluate(() => window.resumeGestures)).toEqual([
    true,
    true,
  ]);
  await page.getByRole("button", { name: "Reset Game", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await page.evaluate(() => window.audioPlays[1].stopped)).toBe(false);
  await page.getByRole("button", { name: "Reset Game", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset Game" })
    .click();
  expect(await page.evaluate(() => window.audioPlays[1].stopped)).toBe(true);
  await page.evaluate(() =>
    window.audioPlays[1].source.dispatchEvent(new Event("ended")),
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
    await page.getByRole("button", { name: "Start Game" }).tap();
    await expect(
      page.getByText("Sound unavailable.", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Final Order" }),
    ).toBeVisible({ timeout: 12000 });
    await expect(page.locator(".result-grid strong")).toHaveCount(2);
  });
}


test('a completed drum roll waits for a longer shuffle to settle', async ({ page }) => {
  await observeAudio(page);
  await page.goto('/');
  await page.getByLabel('Names List').fill('Ana\nBob');
  await page.getByLabel('Timer Settings').fill('15');
  await page.getByRole('button', { name: 'Start Game' }).tap();
  await expect.poll(() => page.evaluate(() => window.audioPlays[0]?.endedAt || 0), { timeout: 12000 }).toBeGreaterThan(0);
  await expect(page.locator('.game-status')).toContainText('Shuffling');
  await expect(page.locator('.result-grid strong')).toHaveCount(0);
  await expect(page.locator('.result-grid strong')).toHaveCount(1, { timeout: 11000 });
  expect(await page.evaluate(() => window.audioPlays.length)).toBe(1);
});
