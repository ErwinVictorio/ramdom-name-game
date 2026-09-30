# Version 1 implementation

Scope follows `Random_Name_Cup_Game_Full_Phase_Plan.md` and the supplied reference UI.

- React, Motion, Lucide icons, and responsive plain CSS.
- Editable sample participants, whitespace normalization, case-insensitive duplicate checks, and a 2–12 participant limit.
- Whole-second timer from 3–30 seconds, default 5, with quick presets.
- One Fisher–Yates ranking per play; visual cup shuffles never change that ranking.
- Shuffle countdown, gradual stop, one full drum roll before the first reveal, sequential 3-second reveal intervals, and complete results.
- Both supplied cup assets, animated opening, reduced-motion support, and desktop/mobile layouts.
- Replay preserves settings; confirmed reset clears names, results, and pending timers. Cancel leaves the game alone.
- Drum-roll sound is implemented; storage, history, and exports remain future work.

## Verification completed

- Production Vite build and ESLint pass.
- Three unit tests pass: audio cleanup and stale promises, whitespace/duplicate handling, and all six possible three-person Fisher–Yates permutations without input mutation.
- Chrome browser coverage includes validation and timer boundaries; six-person shuffle, sequential reveal, replay, and cancellation-safe reset; responsive layouts; a complete twelve-person mobile game with reduced motion; full drum-roll playback before reveals and 3-second intervals; and blocked/missing audio handling.
- Checked viewport widths 1440, 768, 390, and 320 px for horizontal overflow.
- Confirmed reset cancels pending reveals; cancelling or escaping the reset dialog preserves the game.
- No browser runtime errors during the main game flow.
- Reviewed desktop, mobile setup, and mobile completed-game screenshots in `test-results/`.

The original assets remain unchanged. `.tools/` contains ignored local tooling because this environment does not expose Node/npm on PATH. Normal installations can use the npm scripts in README.md.

Audio playback state and reveal timing were verified in Chrome. Manual listening and physical mobile-device speaker output remain unverified.

Latest adjustment verified: the entire drum roll plays once before any cups open. All 7 browser tests, 3 unit tests, lint, and build pass with this behavior; subsequent openings remain 3 seconds apart.

## Mobile audio fix

The reported issue is sound missing on mobile Chrome while shuffle and reveal still work. The previous muted-media preparation was replaced with Web Audio: Start Game / Play Again synchronously creates or resumes an AudioContext inside the click/tap handler, and fetches/decodes the supplied MP3 during the shuffle. A non-looping buffer source plays the whole clip afterward; its ended event starts the reveals. The 3-second reveal interval remains unchanged.

Reset/unmount stops and disconnects the active source and invalidates pending playback callbacks. Loading, decoding, blocked audio, and stalled context handling retain the visible failure notice and silent completion behavior.

Validation: 4 unit tests and 7 Chrome browser tests pass, along with ESLint and the production build. The audio test uses touch input and rejects context resumes outside a user gesture. It measures nonzero audio samples in the output graph, verifies full playback before reveals, and covers replay/reset. This is browser emulation, not verification of a physical phone's speakers.

### Live deployment check

The public site https://ramdom-name-game.vercel.app/ returned HTTP 200 and served `/assets/index-Dn3AXzvJ.js`. That bundle contains the old muted preparation and no `decodeAudioData` implementation. The verified local build produces `/assets/index-2QAbVfvD.js`.

The fix is local and is not deployed. Publish the updated source through the project's existing Vercel deployment workflow (Vite build command `npm run build`, output directory `dist`). If Vercel is connected to the GitHub production branch, pushing the reviewed changes to that branch should trigger the configured deployment. After deployment, confirm the new bundle is live and reload the site on the phone before retesting Start Game.

## Completion confetti

Installed `canvas-confetti` and added `useCompletionConfetti`. A single colorful burst fires 600 ms after the final reveal, allowing the cup-opening transition to finish. Mobile uses fewer particles. Replay/reset/unmount cancel the pending burst and clear existing confetti. Reduced-motion preferences disable the effect.

Validation: production build, lint, 4 unit tests, and 2 focused browser tests pass. Browser checks cover no confetti before the final reveal, rendered particles, replay, cleanup, no repeat on dialog cancellation, and reduced motion. Screenshot reviewed at `test-results/confetti.png`. These changes have not been deployed.

## Latest timing adjustment

Drum-roll playback now starts during shuffle as soon as the clip is decoded, using the audio context activated by Start Game. It still plays once in full. The first cup opens after both the shuffle/settling and sound have finished. For a longer shuffle, completed audio does not trigger an early reveal; for a shorter shuffle, cups wait for the remaining sound. Later cups open every 5 seconds. Confetti remains after the final reveal.

Latest timing validation passed: production build, ESLint, 4 unit tests, and 10 browser tests (9-test suite plus the longer-shuffle check). Tests confirm sound starts while shuffling, full audio completion gates reveals for short timers, longer timers still finish before reveal, openings are 5 seconds apart, replay/reset work, and completion confetti remains functional. Not deployed by this change.
