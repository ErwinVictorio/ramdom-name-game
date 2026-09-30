import test from "node:test";
import assert from "node:assert/strict";
import { parseNames, shuffleArray, validateGame } from "../src/utils/game.js";
import { createDrumRoll } from "../src/utils/drumRoll.js";

test("audio cleanup ignores stale preparation and late playback failures", async () => {
  const original = globalThis.Audio;
  const requests = [];
  let media;
  let failures = 0;
  globalThis.Audio = class {
    constructor() {
      media = this;
    }
    pause() {
      this.paused = true;
    }
    play() {
      this.paused = false;
      return new Promise((resolve, reject) =>
        requests.push({ resolve, reject }),
      );
    }
  };
  try {
    const player = createDrumRoll("drum.mp3", () => failures++);
    player.prepare();
    assert.equal(media.muted, true);
    player.play();
    requests[0].resolve();
    await Promise.resolve();
    assert.equal(media.paused, false);
    assert.equal(media.muted, false);
    assert.equal(media.loop, true);
    player.dispose();
    requests[1].reject(new Error("late rejection after unmount"));
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(media.paused, true);
    assert.equal(media.currentTime, 0);
    assert.equal(media.onerror, null);
    assert.equal(failures, 0);
  } finally {
    if (original === undefined) delete globalThis.Audio;
    else globalThis.Audio = original;
  }
});

test("normalizes whitespace and rejects equivalent names", () => {
  const names = parseNames("  Ana   Cruz \r\n\n Bob\tReyes \nana cruz");
  assert.deepEqual(names, ["Ana Cruz", "Bob Reyes", "ana cruz"]);
  assert.match(validateGame(names, 5), /Duplicate/);
  assert.equal(validateGame(names.slice(0, 2), 3), "");
  assert.equal(validateGame(names.slice(0, 2), 30), "");
});

test("Fisher–Yates reaches all six three-person permutations without mutating input", () => {
  const original = ["Ana", "Bob", "Cam"];
  const permutations = new Set();
  for (let first = 0; first < 3; first++) {
    for (let second = 0; second < 2; second++) {
      const draws = [(first + 0.5) / 3, (second + 0.5) / 2];
      const shuffled = shuffleArray(original, () => draws.shift());
      assert.deepEqual([...shuffled].sort(), original);
      permutations.add(shuffled.join(","));
    }
  }
  assert.equal(permutations.size, 6);
  assert.deepEqual(original, ["Ana", "Bob", "Cam"]);
});
