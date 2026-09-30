# Random Name Cup Game
## Full Development Plan — Phase by Phase

## 1. Project Overview

The **Random Name Cup Game** is a simple interactive web game built with **React JS** and **Motion**.

The purpose of the game is to randomize the complete order of a group of participants in **one play only**.

Example:

Participants:

1. Juan
2. Maria
3. Pedro
4. Ana
5. Carlo
6. Liza

The user enters the names, sets the shuffle timer, then clicks **Start Game**.

The cups will shuffle for the selected duration.

After the shuffle stops, the cups will open one by one and reveal the complete randomized order.

Example result:

1. Pedro
2. Maria
3. Carlo
4. Juan
5. Liza
6. Ana

There are **no multiple rounds**.

The whole ranking is generated and revealed during one game session.

---

# 2. Main Goal

The system should:

- Accept a list of participant names
- Count the number of participants automatically
- Generate the same number of cups as participants
- Allow the user to set a shuffle timer
- Randomize all participants only once
- Animate the cups while shuffling
- Stop the cups when the timer finishes
- Open the cups one by one
- Reveal the randomized participant order
- Display the final complete ranking
- Allow the user to play again or reset the game

---

# 3. Technology Stack

## Frontend

- React JS
- Vite
- Motion
- Lucide React
- Tailwind CSS or normal CSS

Recommended setup:

```text
React JS
Vite
Motion
Lucide React
Tailwind CSS
```

No backend is required for Version 1.

No database is required.

All game information can be stored temporarily using React state.

Optional later:

```text
localStorage
```

---

# 4. Main Game Flow

```text
Enter Names
    ↓
Set Timer
    ↓
Start Game
    ↓
Generate Cups
    ↓
Randomize Complete Order
    ↓
Shuffle Cups
    ↓
Timer Countdown
    ↓
Stop Cups
    ↓
Open Cups One by One
    ↓
Reveal Names in Order
    ↓
Show Final Ranking
    ↓
Play Again / Reset
```

---

# Phase 1 — Project Setup

## Objective

Create the base React project and install the required packages.

## Tasks

1. Create React project using Vite.
2. Install Motion.
3. Install Lucide React.
4. Install Tailwind CSS if needed.
5. Create the initial project folder structure.
6. Import the cup images.
7. Test that the application runs correctly.

## Suggested Installation

```bash
npm create vite@latest random-name-cup-game
```

Select:

```text
React
JavaScript
```

Then:

```bash
cd random-name-cup-game
npm install
npm install motion lucide-react
npm run dev
```

## Suggested Folder Structure

```text
src/
│
├── assets/
│   └── cups/
│       ├── cup-closed.png
│       └── cup-open.png
│
├── components/
│   ├── Header.jsx
│   ├── TimerSettings.jsx
│   ├── NamesInput.jsx
│   ├── GameControls.jsx
│   ├── GameArea.jsx
│   ├── Cup.jsx
│   ├── Countdown.jsx
│   ├── RevealResult.jsx
│   ├── ResultOrder.jsx
│   └── ResetDialog.jsx
│
├── hooks/
│   ├── useCountdown.js
│   └── useCupShuffle.js
│
├── utils/
│   ├── shuffleArray.js
│   └── gameHelpers.js
│
├── App.jsx
├── main.jsx
└── index.css
```

## Expected Result

A working blank React application with the project structure ready.

---

# Phase 2 — Base UI Layout

## Objective

Build the complete static UI before adding game logic.

## Main Sections

### Header

Display:

```text
Random Name Cup Game
Add names, set the timer, and let the cups decide the order!
```

Right side:

```text
Reset Game
```

### Configuration Section

Left side:

```text
Timer Settings
```

Middle:

```text
Names List
```

Right side:

```text
Start Game
Clear Names
```

### Game Area

Display:

- Game title
- Participant count
- Cups
- Shuffle status
- Countdown
- Reveal area

### Result Order

Display:

```text
1. -
2. -
3. -
4. -
5. -
6. -
```

## Expected Result

A complete responsive UI that looks finished even before adding functionality.

---

# Phase 3 — Names Input System

## Objective

Allow the user to add participant names.

## Features

Use a textarea.

Instruction:

```text
Enter one name per line.
```

Example:

```text
Juan Dela Cruz
Maria Santos
Pedro Reyes
Ana Lopez
Carlos Mendoza
Liza Fernandez
```

## Processing

Convert textarea content into an array.

Example:

```js
const names = input
  .split("\n")
  .map(name => name.trim())
  .filter(Boolean)
```

## Validation

Rules:

- Minimum of 2 participants
- Empty names should be ignored
- Remove unnecessary spaces
- Prevent duplicate names
- Participant count updates automatically

Example badge:

```text
6 participants
```

## Error Messages

Examples:

```text
Please enter at least 2 participants.
```

```text
Duplicate names are not allowed.
```

## Expected Result

The system can correctly read and validate participant names.

---

# Phase 4 — Timer Settings

## Objective

Allow the user to configure how long the cups shuffle.

## Recommended Settings

Default:

```text
5 seconds
```

Minimum:

```text
3 seconds
```

Maximum:

```text
30 seconds
```

Quick options:

```text
5s
10s
15s
20s
30s
```

## State

Example:

```js
const [shuffleDuration, setShuffleDuration] = useState(5)
```

## Expected Result

The selected timer controls the shuffle duration.

---

# Phase 5 — Game State Management

## Objective

Create a clear game state system.

## Recommended States

```text
setup
ready
shuffling
stopping
revealing
finished
```

### setup

User is entering names and timer settings.

### ready

Names and timer are valid and the game is ready.

### shuffling

The cups are moving.

### stopping

The shuffle is slowing down and stopping.

### revealing

The cups are opening one by one.

### finished

All names have been revealed and the final order is shown.

## Main React State

Example:

```js
const [namesInput, setNamesInput] = useState("")
const [participants, setParticipants] = useState([])
const [randomOrder, setRandomOrder] = useState([])
const [cups, setCups] = useState([])
const [shuffleDuration, setShuffleDuration] = useState(5)
const [gameState, setGameState] = useState("setup")
const [revealedCount, setRevealedCount] = useState(0)
```

## Expected Result

The game can move cleanly between different states.

---

# Phase 6 — Randomization Logic

## Objective

Generate the complete random order of all players only once.

This happens when the game starts.

## Important Rule

The result should not be randomly regenerated during each reveal.

The complete result must be generated once.

Example:

```text
Original:

Juan
Maria
Pedro
Ana
Carlo
Liza
```

Generated result:

```text
Pedro
Maria
Carlo
Juan
Liza
Ana
```

This array becomes the final game order.

## Recommended Algorithm

Use Fisher-Yates Shuffle.

```js
function shuffleArray(array) {
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i]
    ]
  }

  return shuffled
}
```

## Expected Result

Every participant appears exactly once in the final result.

---

# Phase 7 — Dynamic Cup Generation

## Objective

Generate cups based on the number of participants.

Examples:

```text
4 participants = 4 cups
6 participants = 6 cups
10 participants = 10 cups
```

## Cup Data

Example:

```js
{
  id: 1,
  name: "Pedro Reyes",
  isOpen: false
}
```

The name should not be visible while the cup is closed.

## Responsive Layout

Desktop:

```text
6 cups in one row when possible
```

Tablet:

```text
3–4 cups per row
```

Mobile:

```text
2–3 cups per row
```

## Expected Result

Cup count always matches participant count.

---

# Phase 8 — Cup Shuffle Animation

## Objective

Animate the cups using Motion.

## Motion Package

```js
import { motion } from "motion/react"
```

## Recommended Animation

Use layout animation.

```jsx
<motion.div layout>
```

During shuffle:

- cups swap positions
- cups move left and right
- slight rotation
- slight vertical movement
- slight scale effect

Recommended shuffle interval:

```text
400ms–600ms
```

Every interval:

1. Shuffle the cup display order.
2. Motion animates the position changes.
3. Repeat until the timer reaches zero.

## Important

The visual cup shuffle is only animation.

The final participant order has already been generated before the animation starts.

## Expected Result

The cups look like they are being mixed while keeping the final result fair and consistent.

---

# Phase 9 — Countdown System

## Objective

Show the user how much shuffle time remains.

Example:

```text
Shuffling...

5
4
3
2
1
```

Or:

```text
00:05
```

## UI States

While running:

```text
Shuffling Cups...
3 seconds remaining
```

When ending:

```text
Stopping...
```

## Expected Result

The timer reaches zero and automatically triggers the cup stop animation.

---

# Phase 10 — Cup Stop Animation

## Objective

Make the shuffle stop naturally instead of suddenly.

## Sequence

Example:

```text
Normal Shuffle
↓
Slower Shuffle
↓
Small Final Movement
↓
Stop
```

Suggested final delays:

```text
400ms
600ms
800ms
1000ms
Stop
```

## Expected Result

The animation feels smoother and more game-like.

---

# Phase 11 — Cup Reveal System

## Objective

Open all cups one by one after the shuffle.

This is still part of the same game.

There are no additional rounds.

## Example

After the cups stop:

```text
Cup 1 opens
Pedro Reyes
Position 1

↓ 700ms

Cup 2 opens
Maria Santos
Position 2

↓ 700ms

Cup 3 opens
Carlo Garcia
Position 3
```

Continue until all cups are open.

## Suggested Reveal Delay

```text
600ms–1000ms per cup
```

Recommended:

```text
800ms
```

## Expected Result

The entire ranking is revealed automatically.

---

# Phase 12 — Cup Opening Animation

## Objective

Create a polished opening effect using the two cup images.

Assets:

```text
cup-closed.png
cup-open.png
```

## Suggested Animation

### Step 1

Selected cup shakes slightly.

### Step 2

Cup moves upward.

### Step 3

Closed cup rotates slightly.

### Step 4

Closed cup fades out.

### Step 5

Open cup fades in.

### Step 6

Name appears.

Example Motion values:

```text
scale: 1 → 1.08
y: 0 → -30
rotate: 0 → 10
opacity: 1 → 0
```

Then the open cup:

```text
opacity: 0 → 1
scale: 0.9 → 1
```

## Expected Result

Each cup visibly opens before the participant name appears.

---

# Phase 13 — Name Reveal Animation

## Objective

Display each participant name together with their assigned position.

Example:

```text
Position #1
Pedro Reyes
```

Next:

```text
Position #2
Maria Santos
```

## Motion Effects

Use:

```text
fade in
scale
slide up
small bounce
```

Example:

```jsx
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
```

## Optional

Add light confetti during the final reveal.

Do not make every result overly flashy.

## Expected Result

Each revealed name is easy to see and feels rewarding.

---

# Phase 14 — Final Result Order

## Objective

Display the complete ranking.

Before reveal:

```text
1. -
2. -
3. -
4. -
5. -
6. -
```

During reveal:

```text
1. Pedro Reyes
2. Maria Santos
3. -
4. -
5. -
6. -
```

Final:

```text
1. Pedro Reyes
2. Maria Santos
3. Carlo Garcia
4. Juan Dela Cruz
5. Liza Fernandez
6. Ana Lopez
```

## Result Animation

When a result is added:

```text
fade in
slide from left
```

## Expected Result

The final order is always visible and easy to understand.

---

# Phase 15 — Finished Game State

## Objective

Show a clear completed-game screen.

Display:

```text
Game Complete!
```

Then:

```text
Final Order
```

Show all participants in order.

Buttons:

```text
Play Again
New Game
```

---

# Phase 16 — Play Again

## Objective

Allow another randomization using the same participant list.

When clicked:

- Keep the names
- Keep the timer
- Clear the previous result
- Close all cups
- Generate a new random order
- Start another full game

## Expected Result

The same group can replay without re-entering names.

---

# Phase 17 — New Game / Reset

## Objective

Return the application to the original setup.

Reset:

- Names
- Timer if desired
- Cups
- Results
- Game state

Recommended confirmation:

```text
Reset the game?

All current names and results will be cleared.

Cancel | Reset
```

---

# Phase 18 — Responsive Design

## Desktop

Recommended layout:

```text
Timer Settings | Names List | Controls

Game Area

Result Order
```

## Tablet

```text
Timer Settings | Names List

Controls

Game Area

Results
```

## Mobile

```text
Timer Settings

Names List

Controls

Game Area

Results
```

The cups should automatically wrap based on available width.

---

# Phase 19 — UI Design Direction

## Main Style

Use:

- White background
- Light gray page background
- Soft red or pink accents
- Red cups as the main visual element
- Rounded cards
- Light borders
- Soft shadows
- Spacious layout

## Suggested Colors

Primary red:

```text
#EF233C
```

Dark text:

```text
#0F172A
```

Muted text:

```text
#64748B
```

Background:

```text
#F8FAFC
```

Card:

```text
#FFFFFF
```

Light red section:

```text
#FFF5F5
```

Success:

```text
#16A34A
```

---

# Phase 20 — Interaction and Button States

## Start Game

Enabled only when:

- At least 2 valid names exist
- Timer is valid

## During Shuffle

Disable:

- Timer
- Name input
- Start Game
- Reset if desired

Display:

```text
Shuffling...
```

## During Reveal

Disable configuration controls.

Display:

```text
Revealing Results...
```

## Finished

Enable:

```text
Play Again
New Game
```

---

# Phase 21 — Optional Sound Effects

Add later if needed.

Possible sounds:

```text
shuffle.mp3
stop.mp3
open.mp3
reveal.mp3
complete.mp3
```

Add sound toggle:

```text
Sound On / Sound Off
```

This should be optional and can be added after the core game is complete.

---

# Phase 22 — Optional localStorage

Use localStorage only if needed later.

Possible stored values:

```text
participantNames
shuffleDuration
lastResult
```

Benefits:

- Prevents accidental data loss after refresh
- Keeps the previous list of participants

---

# Phase 23 — Recommended Participant Limits

For Version 1:

Minimum:

```text
2 participants
```

Recommended maximum:

```text
12 participants
```

Reason:

Too many animated cups can make the UI crowded.

This limit can be increased later.

---

# Phase 24 — Error Handling

Possible errors:

### No names

```text
Please enter participant names.
```

### Only one participant

```text
At least 2 participants are required.
```

### Duplicate names

```text
Duplicate participant names are not allowed.
```

### Invalid timer

```text
Please select a timer between 3 and 30 seconds.
```

---

# Phase 25 — Final Game Logic

The final game flow should work like this:

```text
1. User enters names

2. User selects timer

3. User clicks Start Game

4. System validates names

5. System creates the cups

6. System generates ONE complete randomized participant order

7. Cups begin shuffling

8. Countdown starts

9. Timer reaches zero

10. Cups slow down

11. Cups stop

12. Cup #1 opens
    → reveal Position #1

13. Cup #2 opens
    → reveal Position #2

14. Continue until all cups are open

15. Display complete Final Order

16. Show Play Again and New Game buttons
```

---

# Phase 26 — Component Responsibilities

## Header.jsx

Handles:

```text
Title
Subtitle
Reset button
```

## TimerSettings.jsx

Handles:

```text
Timer input
Quick timer buttons
```

## NamesInput.jsx

Handles:

```text
Textarea
Participant count
Validation errors
Clear names
```

## GameControls.jsx

Handles:

```text
Start Game
Play Again
New Game
```

## GameArea.jsx

Handles:

```text
Cup layout
Game status
Countdown
```

## Cup.jsx

Handles:

```text
Closed cup
Open cup
Shuffle animation
Reveal animation
Name
Position number
```

## Countdown.jsx

Handles:

```text
Remaining shuffle time
```

## ResultOrder.jsx

Handles:

```text
Live result order
Final result
```

---

# Phase 27 — Suggested Development Order

Follow this order during development:

```text
Phase 1
Project Setup

Phase 2
Static UI

Phase 3
Names Input

Phase 4
Timer

Phase 5
Game State

Phase 6
Randomization

Phase 7
Cup Generation

Phase 8
Shuffle Animation

Phase 9
Countdown

Phase 10
Stop Animation

Phase 11
Sequential Reveal

Phase 12
Cup Open Animation

Phase 13
Name Reveal Animation

Phase 14
Result Order

Phase 15
Finished State

Phase 16
Play Again

Phase 17
Reset

Phase 18
Responsive Design

Phase 19
UI Polish

Phase 20+
Optional Features
```

---

# Phase 28 — Version 1 Scope

The first working version should include only:

- React JS
- Names input
- Participant validation
- Timer
- Dynamic cup count
- Complete randomization
- Cup shuffle animation
- Countdown
- Cup stop animation
- Cups opening one by one
- Name reveal
- Final order
- Play Again
- Reset Game
- Responsive UI

Avoid adding unnecessary features until this version is working correctly.

---

# Phase 29 — Future Enhancements

Possible future additions:

- Sound effects
- Confetti
- Fullscreen game mode
- Dark mode
- Custom cup colors
- Custom backgrounds
- Save participant groups
- Export result as image
- Download result as PDF
- Result history
- Custom reveal speed
- Keyboard shortcuts
- Different shuffle animation styles

---

# Final Game Concept

The important rule for this project is:

> **One play creates one complete randomized order.**

If there are 6 participants:

```text
6 names
↓
6 cups
↓
Start
↓
Shuffle
↓
Stop
↓
Open cups one by one
↓
Reveal positions 1 to 6
↓
Game complete
```

There are no separate rounds for every participant.

The entire order is completed in one game session.
