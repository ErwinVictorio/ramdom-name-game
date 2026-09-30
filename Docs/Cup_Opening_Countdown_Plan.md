# Full drum roll before cup reveals

## Approved behavior

Shuffle -> settle -> play the complete drum roll once -> open Cup 1 -> wait 3 seconds -> open Cup 2 -> continue until complete.

Asset: `src/assets/Sound/Drum roll sound effect.mp3` (approximately 8.94 seconds).

- No cups open while the drum roll plays.
- Audio plays once per game, with looping disabled. Its actual `ended` event starts the reveals.
- Subsequent cups keep the 3-second interval and existing opening animations. Audio does not restart between cups.
- The shuffle countdown and generated ranking remain unchanged. No opening countdown is added.
- Configuration stays locked during the drum roll. The Game Area explains that the cups open when the sound finishes.
- Replay prepares a fresh full playback using the same player.
- Confirmed reset and unmount stop audio, clear pending timers, and invalidate completion callbacks. Cancelling reset leaves playback running.
- Blocked, failed, or stalled playback displays a sound-unavailable notice and proceeds with reveals. A 15-second no-progress timeout prevents a stalled media load from locking the game; progressing audio is allowed to finish.

## Implementation

- `src/utils/drumRoll.js`: full, non-looping playback with completion/error handling and cleanup.
- `src/hooks/useGame.js`: drum-roll stage before the first reveal; sequential 3-second reveal timers afterward.
- `src/App.jsx`: drum-roll status and configuration lock.
- Updated tests verify full playback before any reveal, one audible playback per game, reset safety, and failure handling.

## Validation

Passed: production build, ESLint, 3 unit tests, and 7 Chrome browser tests. Actual playback continued beyond 3 seconds and reached the media `ended` event before the first reveal. Only one audible playback occurred in the completed game. Replay, reset during playback, stale completion callbacks, blocked/missing audio, and the 12-participant mobile flow passed.

Manual listening and physical-device speaker output are not assessed.

## Mobile audio implementation update

Replaced muted HTML audio preparation with Web Audio. The context is created/resumed synchronously from Start Game / Play Again, and the MP3 is decoded during shuffle. A single non-looping source plays the full clip before reveals. Reset and unmount invalidate callbacks and disconnect playback.

Latest validation: 4 unit tests, 7 browser tests, lint, and production build pass. Tests include touch activation, user-gesture enforcement, measured audio samples, complete clip timing, and reset/replay. Physical-phone speaker output is still unverified.

Live Vercel inspection confirms the old `index-Dn3AXzvJ.js` bundle remains deployed. The local fix builds `index-2QAbVfvD.js`; deployment and a phone retest are required.
