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

test("getResultPresentation returns a victory screen with large score text when the round ends", () => {
  const state = GameLogic.createGameState();
  state.status = "ended";
  state.score = 7;

  const presentation = GameLogic.getResultPresentation(state);

  assert.equal(presentation.screen, "victory");
  assert.equal(presentation.scoreText, "Score 7");
  assert.ok(presentation.scoreFontSize >= 60);
});
