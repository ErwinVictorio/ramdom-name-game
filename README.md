# Random Name Cup Game

A React + Vite game that generates one complete participant order per play. Built with Motion, Lucide icons, plain CSS, and the supplied cup images.

## Run

With Node.js 24 and npm installed:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Six editable sample names are provided on first load.

For this workspace, a local Node runtime and npm are also available in the ignored `.tools` directory. If Node is unavailable on PATH, use PowerShell:

```powershell
& .\.tools\node.exe node_modules/vite/bin/vite.js --host 127.0.0.1
```

## Play

1. Enter 2–12 unique names, one per line. Blank lines are ignored and extra whitespace is normalized. Duplicate checks ignore capitalization.
2. Choose 3–30 whole seconds or a quick preset.
3. Start Game shuffles the cups, slows them down, and reveals everyone in order automatically. A drum roll plays during the 3-second interval between cup openings.
4. Play Again keeps the names and timer. New Game / Reset Game asks for confirmation before clearing them.

Configuration is locked during play. Reset can cancel an active game; cancelling the dialog leaves it running. Refreshing the page restores the sample setup; this version does not persist results.

## Checks

```sh
npm run lint
npm test
npm run test:e2e
npm run build
```

Browser tests use installed Google Chrome and start Vite automatically if needed. Screenshots are written to `test-results/`.

## Implementation

- `src/hooks/useGame.js`: game stages, timer cleanup, visual shuffle, sequential reveal.
- `src/utils/game.js`: name processing, validation, Fisher–Yates shuffle.
- `src/utils/drumRoll.js`: reusable audio player, playback preparation, and cleanup.
- `src/components/Cup.jsx`: cup movement and opening animation.
- `src/components/ResetDialog.jsx`: native modal confirmation with keyboard support.
- `src/App.jsx` and `src/App.css`: setup controls, reference-based responsive layout, and results.
- `Docs/Implementation_Status.md`: completed scope and verification.

The ranking is generated once at Start Game. Later animation changes only cup positions, never the ranking. Replay is an independent random draw and may legitimately produce the same order.

The supplied drum roll restarts for each interval and stops on completion or confirmed reset. If playback fails, a message appears and the game continues silently. Saved groups, history, and exports remain future enhancements.
