# Cup opening interval and drum-roll sound plan

## Intended behavior

Keep the existing sequential cup-opening animation with a 3-second interval between openings. Play the supplied drum-roll sound during each interval instead of showing a numeric opening countdown.

Asset: `src/assets/Sound/Drum roll sound effect.mp3` (confirmed present).

Flow: shuffle -> settle -> Cup 1 opens -> drum roll for 3 seconds -> Cup 2 opens -> drum roll for 3 seconds -> Cup 3 opens -> continue until complete.

The first cup keeps its existing timing after settling. The existing shuffle countdown remains. There will be no large 3 -> 2 -> 1 display for opening cups.

## Changes

1. In `src/hooks/useGame.js`, change the interval between reveals from 800 ms to 3000 ms. Measure it from one reveal trigger to the next without adding another pause.
2. Import the supplied MP3 through Vite and manage a single reusable audio player. Prepare audio from the Start Game / Play Again interaction to support browser playback restrictions.
3. Start the drum roll at the beginning of each interval while another cup remains. Stop and rewind it when the next cup opens. Restart it for the following interval without overlapping audio players.
4. Inspect the clip duration during implementation. If longer than 3 seconds, stop it at the reveal; if shorter, loop it within the interval. The game timer controls the reveal, so loading delays or audio duration never extend the 3-second interval. Keep the source MP3 unchanged.
5. Stop audio and cancel pending reveals on confirmed reset and unmount. Replay starts fresh. Cancelling the reset dialog leaves the active game running. After the last cup opens, stop audio and complete the game without another interval.
6. Handle unavailable or blocked audio gracefully: keep the game running and display a brief sound-unavailable notice if playback fails.
7. Preserve the generated ranking, opening/name animations, live results, configuration locks, and responsive layout. Retain the existing textual reveal status for users who cannot hear the sound.
8. Update browser test timing expectations and timeouts for the longer reveal sequence.

## Verification

- Each subsequent cup opens 3 seconds after the previous one.
- Drum-roll playback starts during each interval, restarts cleanly, and stops after the final reveal.
- Confirmed reset and unmount stop audio and prevent delayed reveals; cancelling reset preserves the game.
- Replay has no leftover or overlapping audio.
- Blocked playback or a failed audio load does not stall the game.
- No numeric opening countdown is rendered; the shuffle countdown remains.
- Names and result rows appear only as their cup is revealed, and every participant appears exactly once in the generated ranking.
- Check 2 and 12 participants, desktop/mobile playback, and reduced motion. Run unit tests, browser tests, lint, and production build; manually listen to confirm audio timing and cutoffs.

Timing: six cups take 15 seconds from the first opening to the last; twelve cups take 33 seconds. Shuffle and settling time are additional.

## Implementation completed

- Reveal intervals are now 3000 ms with the supplied drum roll; no numeric opening countdown was added.
- Browser metadata reports a clip duration of 8.94 seconds. Playback restarts at the beginning of each interval and cuts off at the next reveal. The original MP3 is unchanged.
- One reusable player is prepared from the start/replay click. Reset, completion, and unmount stop it; stale playback promises cannot restart it or report failures after cleanup.
- A visible notice reports unavailable audio while the game continues.
- Verification passed: 3 unit tests, 7 Chrome browser tests, ESLint, and production build. Browser coverage includes actual media playback, 3-second timing, replay, reset cancellation, blocked/missing audio, and a 12-person mobile viewport with reduced motion.
- Audible quality and physical-device speaker output were not manually assessed; browser media playback state and timing were verified.

Status: implemented and automatically verified.
