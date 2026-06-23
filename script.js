const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreLabel = document.getElementById("scoreLabel");
const timeLabel = document.getElementById("timeLabel");
const statusLabel = document.getElementById("statusLabel");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const Logic = window.GameLogic;
const CONFIG = Logic.GAME_CONFIG;

let game = Logic.createGameState();
let lastFrameTime = 0;

ctx.imageSmoothingEnabled = false;

function px(value) {
  return Math.round(value);
}

function drawPixelRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(px(x), px(y), px(width), px(height));
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
  sky.addColorStop(0, "#82dcff");
  sky.addColorStop(0.45, "#d7f6ff");
  sky.addColorStop(0.46, "#b8dd70");
  sky.addColorStop(1, "#5f9d45");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

  drawCloud(138, 74, 1.2);
  drawCloud(470, 58, 0.9);
  drawCloud(775, 92, 1.1);

  drawHill(0, 236, "#84bd72", 120);
  drawHill(260, 250, "#74ac65", 150);
  drawHill(600, 228, "#8bc877", 135);

  drawFence();
  drawMeadowDetails();
}

function drawCloud(x, y, scale) {
  const color = "rgba(255, 255, 244, 0.9)";
  drawPixelRect(x, y + 16 * scale, 70 * scale, 18 * scale, color);
  drawPixelRect(x + 18 * scale, y, 34 * scale, 34 * scale, color);
  drawPixelRect(x + 48 * scale, y + 8 * scale, 38 * scale, 26 * scale, color);
}

function drawHill(x, y, color, height) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.quadraticCurveTo(x + 180, y - 52, x + 370, y + height);
  ctx.lineTo(x, y + height);
  ctx.fill();
}

function drawFence() {
  for (let x = -20; x < CONFIG.width + 40; x += 82) {
    drawPixelRect(x, 288, 22, 94, "#8b5a2f");
    drawPixelRect(x + 3, 292, 16, 86, "#b0743b");
    drawPixelRect(x - 3, 281, 28, 18, "#6e4328");
  }

  drawPixelRect(0, 312, CONFIG.width, 18, "#8b5a2f");
  drawPixelRect(0, 337, CONFIG.width, 16, "#704323");
  drawPixelRect(0, 314, CONFIG.width, 6, "#bd8249");
}

function drawMeadowDetails() {
  drawPixelRect(0, 368, CONFIG.width, 172, "#7dbb4d");

  for (let i = 0; i < 130; i += 1) {
    const x = (i * 73) % CONFIG.width;
    const y = 372 + ((i * 41) % 150);
    const color = i % 3 === 0 ? "#a7d75d" : i % 3 === 1 ? "#5f9f3e" : "#c4e875";
    drawPixelRect(x, y, 18 + (i % 4) * 5, 4, color);
  }

  for (let i = 0; i < 42; i += 1) {
    const x = (i * 113) % CONFIG.width;
    const y = 392 + ((i * 47) % 122);
    const petal = i % 4 === 0 ? "#ffffff" : i % 4 === 1 ? "#ffcc5e" : i % 4 === 2 ? "#ff8dbb" : "#8cc8ff";
    drawFlower(x, y, petal);
  }

  drawPixelRect(642, 418, 138, 16, "#d4b06b");
  drawPixelRect(682, 442, 118, 13, "#c99b5b");
  drawPixelRect(598, 469, 148, 14, "#d4b06b");
}

function drawFlower(x, y, color) {
  drawPixelRect(x, y + 6, 3, 12, "#3f7d32");
  drawPixelRect(x - 5, y, 6, 6, color);
  drawPixelRect(x + 3, y, 6, 6, color);
  drawPixelRect(x - 1, y - 5, 6, 6, color);
  drawPixelRect(x, y + 1, 5, 5, "#f8d74d");
}

function drawButterfly(butterfly, isTarget) {
  const flap = Math.sin(butterfly.phase) * 5;
  const radius = butterfly.radius;
  const color = butterfly.color;

  ctx.save();
  ctx.translate(px(butterfly.x), px(butterfly.y));

  if (isTarget) {
    ctx.strokeStyle = "#ffe46b";
    ctx.lineWidth = 4;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, radius + 17, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawPixelRect(-4, -12, 8, 24, color.body);
  drawPixelRect(-2, -17, 4, 6, color.body);
  drawPixelRect(-23 - flap, -18, 21, 17, color.wingA);
  drawPixelRect(-28 - flap, -4, 24, 18, color.wingB);
  drawPixelRect(3 + flap, -18, 21, 17, color.wingA);
  drawPixelRect(5 + flap, -4, 24, 18, color.wingB);
  drawPixelRect(-18 - flap, -10, 9, 6, "#fff2a8");
  drawPixelRect(10 + flap, -10, 9, 6, "#fff2a8");
  drawPixelRect(-6, -23, 3, 8, "#2e1d16");
  drawPixelRect(3, -23, 3, 8, "#2e1d16");

  ctx.restore();
}

function drawDog(dog, elapsed) {
  const run = Math.sin(elapsed * 13);
  const jumpLift = dog.targetId ? Math.max(0, Math.sin(elapsed * 7)) * 7 : 0;

  ctx.save();
  ctx.translate(px(dog.x), px(dog.y - jumpLift));
  ctx.scale(dog.facing, 1);

  drawPixelRect(-42, 24, 78, 10, "rgba(45, 42, 26, 0.22)");
  drawPixelRect(-34, -21, 70, 34, "#c97934");
  drawPixelRect(-28, -28, 54, 30, "#e9a95c");
  drawPixelRect(18, -46, 36, 38, "#e9a95c");
  drawPixelRect(46, -35, 13, 14, "#3a2117");
  drawPixelRect(33, -38, 8, 8, "#1d1711");
  drawPixelRect(31, -28, 18, 6, "#fff2cf");
  drawPixelRect(8, -52, 18, 32, "#b96635");
  drawPixelRect(-20, -52, 18, 30, "#b96635");
  drawPixelRect(-48, -28, 18, 12, "#e9a95c");
  drawPixelRect(-58, -39, 16, 18, "#f3c171");

  const frontLeg = run > 0 ? 8 : -4;
  const backLeg = run > 0 ? -5 : 8;
  drawPixelRect(18, 9, 11, 25 + frontLeg, "#a95f2e");
  drawPixelRect(2, 10, 11, 23 - frontLeg, "#d6813c");
  drawPixelRect(-22, 10, 11, 25 + backLeg, "#a95f2e");
  drawPixelRect(-35, 9, 11, 22 - backLeg, "#d6813c");
  drawPixelRect(17, 34 + frontLeg, 18, 7, "#5f351f");
  drawPixelRect(-35, 32 - backLeg, 18, 7, "#5f351f");

  drawPixelRect(-36, -7, 20, 7, "#f5c77a");
  drawPixelRect(-2, -7, 21, 7, "#f5c77a");
  drawPixelRect(14, -7, 28, 7, "#c72626");
  drawPixelRect(22, 0, 12, 9, "#9f1f1f");

  ctx.restore();
}

function drawEffects() {
  game.effects.forEach((effect) => {
    const progress = effect.age / effect.duration;
    const alpha = 1 - progress;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(effect.x, effect.y);
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      const dist = 12 + progress * 28;
      drawPixelRect(Math.cos(angle) * dist, Math.sin(angle) * dist, 6, 6, i % 2 ? "#ffffff" : "#ffd84f");
    }
    ctx.restore();
  });
}

function drawOverlay() {
  if (game.status === "playing") {
    return;
  }

  ctx.fillStyle = "rgba(29, 49, 31, 0.54)";
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

  drawPixelRect(266, 162, 428, 170, "#fff6cf");
  drawPixelRect(266, 162, 428, 10, "#7b4b24");
  drawPixelRect(266, 322, 428, 10, "#7b4b24");
  drawPixelRect(266, 162, 10, 170, "#7b4b24");
  drawPixelRect(684, 162, 10, 170, "#7b4b24");

  ctx.fillStyle = "#2b241b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 36px Trebuchet MS, sans-serif";
  ctx.fillText("Dog Butterfly Chase", CONFIG.width / 2, 214);

  ctx.font = "bold 22px Trebuchet MS, sans-serif";
  if (game.status === "ended") {
    ctx.fillText(`Final Score ${game.score}`, CONFIG.width / 2, 266);
  } else {
    ctx.fillText("30 Second Meadow Round", CONFIG.width / 2, 266);
  }
}

function draw() {
  ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
  drawBackground();

  const targetId = game.dog.targetId;
  game.butterflies.forEach((butterfly) => {
    drawButterfly(butterfly, butterfly.id === targetId);
  });

  drawDog(game.dog, game.elapsed);
  drawEffects();
  drawOverlay();
}

function syncUi() {
  scoreLabel.textContent = `Score ${game.score}`;
  timeLabel.textContent = `Time ${Math.ceil(game.timeLeft)}`;

  if (game.status === "ready") {
    statusLabel.textContent = "Ready";
    startButton.textContent = "Start";
    startButton.disabled = false;
  } else if (game.status === "playing") {
    statusLabel.textContent = "Playing";
    startButton.textContent = "Start";
    startButton.disabled = true;
  } else {
    statusLabel.textContent = `Final ${game.score}`;
    startButton.textContent = "Start";
    startButton.disabled = false;
  }
}

function step(timestamp) {
  const dt = Math.min(0.05, (timestamp - lastFrameTime) / 1000 || 0);
  lastFrameTime = timestamp;

  if (game.status === "playing") {
    game = Logic.tickTimer(game, dt);
    game = {
      ...game,
      elapsed: game.elapsed + dt,
      butterflies: Logic.updateButterflies(game.butterflies, dt),
      effects: Logic.updateEffects(game.effects, dt)
    };

    const target = game.butterflies.find((butterfly) => butterfly.id === game.dog.targetId);
    const move = Logic.moveDogTowardTarget(game.dog, target, dt);
    game = { ...game, dog: move.dog };

    if (move.caught && target && game.status === "playing") {
      game = Logic.catchButterfly(game, target.id);
    }
  } else {
    game = {
      ...game,
      elapsed: game.elapsed + dt,
      butterflies: Logic.updateButterflies(game.butterflies, dt),
      effects: Logic.updateEffects(game.effects, dt)
    };
  }

  syncUi();
  draw();
  requestAnimationFrame(step);
}

function canvasPointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY;

  return {
    x: ((clientX - rect.left) / rect.width) * CONFIG.width,
    y: ((clientY - rect.top) / rect.height) * CONFIG.height
  };
}

function handleCanvasPress(event) {
  if (game.status !== "playing") {
    return;
  }

  event.preventDefault();
  const point = canvasPointFromEvent(event);
  const butterfly = Logic.findButterflyAt(game.butterflies, point.x, point.y);

  if (butterfly) {
    game = Logic.selectTarget(game, butterfly.id);
  }
}

startButton.addEventListener("click", () => {
  if (game.status === "playing") {
    return;
  }

  if (game.status === "ended") {
    game = Logic.restartRound();
    return;
  }

  game = Logic.startRound(game);
});

restartButton.addEventListener("click", () => {
  game = Logic.restartRound();
});

canvas.addEventListener("click", handleCanvasPress);
canvas.addEventListener("touchstart", handleCanvasPress, { passive: false });

syncUi();
draw();
requestAnimationFrame(step);
