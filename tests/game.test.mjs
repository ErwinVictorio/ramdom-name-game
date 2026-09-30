import test from "node:test";
import assert from "node:assert/strict";
import { parseNames, shuffleArray, validateGame } from "../src/utils/game.js";
import { createDrumRoll } from "../src/utils/drumRoll.js";

async function withAudio(run) {
  const originalContext = globalThis.AudioContext;
  const originalFetch = globalThis.fetch;
  const nodes = [];
  let context;
  globalThis.AudioContext = class {
    state = "running";
    currentTime = 0;
    destination = {};
    constructor() {
      context = this;
    }
    resume() {
      this.resumed = true;
      return Promise.resolve();
    }
    decodeAudioData() {
      return Promise.resolve({ duration: 9 });
    }
    close() {
      this.state = "closed";
      return Promise.resolve();
    }
    createBufferSource() {
      const node = {
        start() {
          this.started = true;
        },
        stop() {
          this.stopped = true;
        },
        connect() {},
        disconnect() {
          this.disconnected = true;
        },
      };
      nodes.push(node);
      return node;
    }
  };
  globalThis.fetch = async () => ({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(1),
  });
  try {
    await run({ nodes, getContext: () => context });
  } finally {
    if (originalContext === undefined) delete globalThis.AudioContext;
    else globalThis.AudioContext = originalContext;
    globalThis.fetch = originalFetch;
  }
}
const flush = () => new Promise((resolve) => setImmediate(resolve));

test("resumes synchronously, plays once, and ignores stale ended events after reset", async () => {
  await withAudio(async ({ nodes, getContext }) => {
    let completed = 0;
    const player = createDrumRoll("drum.mp3", () =>
      assert.fail("unexpected failure"),
    );
    try {
      player.prepare();
      assert.equal(getContext().resumed, true);
      await flush();
      assert.equal(nodes.length, 0);
      player.play(() => completed++);
      await flush();
      assert.equal(nodes.length, 1);
      assert.equal(nodes[0].loop, false);
      const ended = nodes[0].onended;
      ended();
      ended();
      assert.equal(completed, 1);
      player.prepare();
      await flush();
      player.play(() => completed++);
      await flush();
      const staleEnded = nodes[1].onended;
      player.stop();
      staleEnded();
      assert.equal(completed, 1);
      assert.equal(nodes[1].stopped, true);
      assert.equal(nodes[1].disconnected, true);
    } finally {
      player.dispose();
    }
    assert.equal(getContext().state, "closed");
  });
});

test("reset while decoding prevents delayed playback or reveals", async () => {
  await withAudio(async ({ nodes, getContext }) => {
    let resolveDecode;
    let completed = 0;
    const player = createDrumRoll("drum.mp3", () =>
      assert.fail("unexpected failure"),
    );
    try {
      player.prepare();
      getContext().decodeAudioData = () =>
        new Promise((resolve) => {
          resolveDecode = resolve;
        });
      await flush();
      player.play(() => completed++);
      player.stop();
      resolveDecode({ duration: 9 });
      await flush();
      assert.equal(nodes.length, 0);
      assert.equal(completed, 0);
    } finally {
      player.dispose();
    }
  });
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
