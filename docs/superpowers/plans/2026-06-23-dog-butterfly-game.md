# Dog Butterfly Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable browser version of the dog-catching-butterflies game.

**Architecture:** The game is a plain static web app with no build step. Core rules live in `game-logic.js` so they can be tested with Node, while `script.js` owns canvas rendering, input handling, animation, and DOM controls.

**Tech Stack:** HTML, CSS, JavaScript, Canvas 2D, Node built-in test runner.

---

## File Structure

- Create `package.json`: defines `npm test` using Node's built-in test runner.
- Create `index.html`: provides the game canvas, score/timer labels, start/restart controls, and script loading.
- Create `styles.css`: styles the page shell, canvas, HUD, buttons, and responsive layout.
- Create `game-logic.js`: contains testable game constants, state creation, butterfly spawning, click detection, dog movement, catch detection, and timer updates.
- Create `script.js`: connects browser input and canvas drawing to `GameLogic`.
- Create `test/game-logic.test.js`: verifies core game behavior without requiring a browser.
- Modify `README.md`: explains how to run and test the game.

## Task 1: Add Game Logic Tests

**Files:**
- Create: `package.json`
- Create: `test/game-logic.test.js`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "dog-fly",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Create failing tests in `test/game-logic.test.js`**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const GameLogic = require("../game-logic.js");

test("createGameState starts a 30 second round with score 0 and butterflies", () => {
  const state = GameLogic.createGameState();

  assert.equal(state.status, "ready");
  assert.equal(state.score, 0);
  assert.equal(state.timeLeft, 30);
  assert.equal(state.butterflies.length, GameLogic.GAME_CONFIG.butterflyCount);
});

test("findButterflyAt returns the topmost butterfly inside the click radius", () => {
  const butterflies = [
    { id: "a", x: 100, y: 100, radius: 16 },
    { id: "b", x: 105, y: 100, radius: 16 }
  ];

  const found = GameLogic.findButterflyAt(butterflies, 106, 100);

  assert.equal(found.id, "b");
});

test("moveDogTowardTarget moves the dog and reports a catch near the target", () => {
  const dog = { x: 100, y: 250, speed: 240, targetId: "target", facing: 1 };
  const target = { id: "target", x: 130, y: 250, radius: 16 };

  const result = GameLogic.moveDogTowardTarget(dog, target, 0.2);

  assert.equal(result.caught, true);
  assert.equal(result.dog.x, target.x);
  assert.equal(result.dog.y, target.y);
});

test("tickTimer ends the round when time reaches zero", () => {
  const state = GameLogic.createGameState();
  state.status = "playing";
  state.timeLeft = 0.1;

  const next = GameLogic.tickTimer(state, 0.2);

  assert.equal(next.timeLeft, 0);
  assert.equal(next.status, "ended");
});

test("catchButterfly increments score, clears target, and keeps butterfly count stable", () => {
  const state = GameLogic.createGameState();
  const caught = state.butterflies[0];
  state.dog.targetId = caught.id;
  state.status = "playing";

  const next = GameLogic.catchButterfly(state, caught.id);

  assert.equal(next.score, 1);
  assert.equal(next.dog.targetId, null);
  assert.equal(next.butterflies.length, GameLogic.GAME_CONFIG.butterflyCount);
  assert.equal(next.butterflies.some((butterfly) => butterfly.id === caught.id), false);
});
```

- [ ] **Step 3: Run tests to verify RED**

Run: `npm test`

Expected: FAIL because `../game-logic.js` does not exist yet.

## Task 2: Implement Testable Game Logic

**Files:**
- Create: `game-logic.js`
- Test: `test/game-logic.test.js`

- [ ] **Step 1: Create `game-logic.js` with the tested API**

The implementation must define:

- `GAME_CONFIG`
- `createGameState()`
- `findButterflyAt(butterflies, x, y)`
- `moveDogTowardTarget(dog, target, dt)`
- `tickTimer(state, dt)`
- `catchButterfly(state, butterflyId)`
- `spawnButterfly(existingIds)`
- `updateButterflies(butterflies, dt)`
- `selectTarget(state, butterflyId)`
- `startRound(state)`
- `restartRound()`

- [ ] **Step 2: Run tests to verify GREEN**

Run: `npm test`

Expected: PASS, 5 tests passing.

## Task 3: Build Static Game Page

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `script.js`

- [ ] **Step 1: Create `index.html`**

The page must include:

- Title text `Dog Butterfly Chase`.
- Score label with `id="scoreLabel"`.
- Timer label with `id="timeLabel"`.
- Canvas with `id="gameCanvas"`, width `960`, height `540`.
- Start button with `id="startButton"`.
- Restart button with `id="restartButton"`.
- Load order: `game-logic.js`, then `script.js`.

- [ ] **Step 2: Create `styles.css`**

The CSS must:

- Use a bright meadow-inspired palette.
- Keep the canvas responsive with stable 16:9 proportions.
- Style buttons and HUD labels clearly.
- Avoid decorative card nesting.
- Keep text readable on mobile and desktop.

- [ ] **Step 3: Create `script.js`**

The browser script must:

- Read the `GameLogic` object from `window`.
- Draw the Bright Meadow scene on canvas.
- Draw butterflies with flapping wings.
- Draw a recognizable pixel-style dog.
- Handle click and touch input on butterflies.
- Move the dog toward the selected butterfly.
- Apply score changes and replacement spawning when the dog catches the target.
- Show start and game-over overlays.
- Update score and timer labels.

## Task 4: Documentation And Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update `README.md`**

Include:

- What the game is.
- How to open it locally.
- How to run tests with `npm test`.
- The basic gameplay loop.

- [ ] **Step 2: Run automated tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 3: Run browser verification**

Run a local static server and open the game in a browser.

Verify:

- Start screen appears.
- Start begins a 30-second round.
- Clicking a butterfly makes the dog chase it.
- Catching increases score.
- Timer reaches zero and shows final score.
- Restart resets the round.

- [ ] **Step 4: Commit playable version**

```bash
git add package.json test/game-logic.test.js game-logic.js index.html styles.css script.js README.md docs/superpowers/plans/2026-06-23-dog-butterfly-game.md
git commit -m "Build playable dog butterfly game"
```

## Self-Review

- Spec coverage: The plan covers 30-second gameplay, clicked butterfly targets, automatic dog movement, score, replacement butterflies, game-over state, restart, responsive canvas, and manual/browser verification.
- Placeholder scan: The plan contains no TBD or TODO placeholders.
- Scope check: Version 1 excludes sound, saved scores, levels, and final sprite sheets, matching the approved design.
