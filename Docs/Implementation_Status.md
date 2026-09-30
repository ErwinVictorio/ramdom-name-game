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
