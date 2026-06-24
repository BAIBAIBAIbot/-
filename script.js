const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreLabel = document.getElementById("scoreLabel");
const timeLabel = document.getElementById("timeLabel");
const statusLabel = document.getElementById("statusLabel");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const Logic = window.GameLogic;
const CONFIG = Logic.GAME_CONFIG;
const ASSET_VERSION = "20260624-preload";

let game = Logic.createGameState();
let lastFrameTime = 0;
let resultElapsed = 0;

ctx.imageSmoothingEnabled = false;

const art = Object.fromEntries(
  Object.entries(Logic.GAME_ASSETS).map(([key, src]) => [key, loadImage(src)])
);

const DOG_FRAME_DEFAULTS = {
  width: 176,
  anchorX: 0.48,
  groundOffset: 28,
  shadowWidth: 132
};

const DOG_FRAMES = {
  idle: { key: "dog", width: 170, anchorX: 0.44, groundOffset: 30, shadowWidth: 132 },
  "chase-01": { key: "dogChase01", width: 172, anchorX: 0.48, groundOffset: 29, shadowWidth: 128 },
  "chase-02": { key: "dogChase02", width: 184, anchorX: 0.48, groundOffset: 30, shadowWidth: 148 },
  "chase-03": { key: "dogChase03", width: 186, anchorX: 0.48, groundOffset: 28, shadowWidth: 152 },
  "chase-04": { key: "dogChase04", width: 162, anchorX: 0.47, groundOffset: 44, shadowWidth: 104 },
  "chase-05": { key: "dogChase05", width: 172, anchorX: 0.48, groundOffset: 54, shadowWidth: 96 },
  "chase-06": { key: "dogChase06", width: 184, anchorX: 0.48, groundOffset: 46, shadowWidth: 112 },
  "chase-07": { key: "dogChase07", width: 176, anchorX: 0.48, groundOffset: 31, shadowWidth: 132 },
  "chase-08": { key: "dogChase08", width: 170, anchorX: 0.48, groundOffset: 27, shadowWidth: 132 },
  "chase-09": { key: "dogChase09", width: 172, anchorX: 0.48, groundOffset: 29, shadowWidth: 136 },
  "chase-10": { key: "dogChase10", width: 184, anchorX: 0.48, groundOffset: 30, shadowWidth: 148 }
};

function loadImage(src) {
  const image = new Image();
  const maxAttempts = 5;

  image.logicalSrc = src;
  image.ready = false;
  image.failed = false;
  image.attempts = 0;

  function assignSource() {
    image.attempts += 1;
    image.failed = false;
    image.src = `${src}?v=${ASSET_VERSION}${image.attempts === 1 ? "" : `&retry=${Date.now()}`}`;
  }

  image.onload = () => {
    image.ready = true;
    image.failed = false;
    draw();
    syncUi();
  };

  image.onerror = () => {
    image.ready = false;
    image.failed = true;

    if (image.attempts < maxAttempts) {
      window.setTimeout(assignSource, 500 * image.attempts);
    }

    draw();
    syncUi();
  };

  assignSource();
  return image;
}

function assetList() {
  return Object.values(art);
}

function readyAssetCount() {
  return assetList().filter((image) => image.ready).length;
}

function totalAssetCount() {
  return assetList().length;
}

function failedAssetCount() {
  return assetList().filter((image) => image.failed).length;
}

function areAssetsReady() {
  return readyAssetCount() === totalAssetCount();
}

function px(value) {
  return Math.round(value);
}

function drawPixelRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(px(x), px(y), px(width), px(height));
}

function drawBackground() {
  if (art.background.ready) {
    ctx.drawImage(art.background, 0, 0, CONFIG.width, CONFIG.height);
    drawAtmosphere();
    return;
  }

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

function drawAtmosphere() {
  const glow = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
  glow.addColorStop(0, "rgba(255, 255, 255, 0.08)");
  glow.addColorStop(0.45, "rgba(255, 245, 168, 0.03)");
  glow.addColorStop(1, "rgba(31, 71, 27, 0.12)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

  for (let i = 0; i < 36; i += 1) {
    const x = (i * 137 + 41) % CONFIG.width;
    const y = 382 + ((i * 53) % 132);
    const alpha = 0.18 + (i % 5) * 0.04;
    drawPixelRect(x, y, 16 + (i % 4) * 7, 3, `rgba(236, 255, 151, ${alpha})`);
  }
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
    ctx.strokeStyle = "rgba(77, 49, 19, 0.34)";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 238, 105, 0.95)";
    ctx.lineWidth = 5;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, radius + 21, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (art.butterflies.ready) {
    const cells = 5;
    const cellWidth = art.butterflies.width / cells;
    const spriteIndex = butterfly.spriteIndex ?? 0;
    const sx = cellWidth * (spriteIndex % cells);
    const drawWidth = radius * 3.35;
    const drawHeight = radius * 2.35;
    const wingScale = 1 + Math.sin(butterfly.phase) * 0.06;

    ctx.save();
    ctx.scale(1, wingScale);
    ctx.drawImage(
      art.butterflies,
      sx,
      0,
      cellWidth,
      art.butterflies.height,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    ctx.restore();
    ctx.restore();
    return;
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
  const frameName = Logic.getDogAnimationFrame(dog, elapsed);
  const frame = { ...DOG_FRAME_DEFAULTS, ...(DOG_FRAMES[frameName] || DOG_FRAMES.idle) };
  const frameImage = art[frame.key];

  ctx.save();
  ctx.translate(px(dog.x), px(dog.y - jumpLift));
  ctx.scale(dog.facing, 1);

  drawPixelRect(-frame.shadowWidth / 2, 26, frame.shadowWidth, 13, "rgba(45, 42, 26, 0.24)");

  if (frameImage.ready) {
    const dogWidth = frame.width;
    const dogHeight = (frameImage.height / frameImage.width) * dogWidth;
    const stride = dog.targetId ? Math.sin(elapsed * 24) * 2 : 0;

    ctx.drawImage(
      frameImage,
      -dogWidth * frame.anchorX,
      -dogHeight + frame.groundOffset + stride,
      dogWidth,
      dogHeight
    );
    ctx.restore();
    return;
  }

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
    ctx.translate(effect.x, effect.y);

    if (effect.kind === "catch") {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#fff4a4";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, 14 + progress * 58, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(141, 85, 20, 0.45)";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 9 + progress * 48, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 12; i += 1) {
        const angle = (Math.PI * 2 * i) / 12;
        const dist = 14 + progress * 52;
        const size = i % 3 === 0 ? 10 : 7;
        drawPixelRect(Math.cos(angle) * dist - size / 2, Math.sin(angle) * dist - size / 2, size, size, i % 2 ? "#ffffff" : "#ffd84f");
      }

      ctx.globalAlpha = Math.max(0, alpha * 1.1);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "900 34px Trebuchet MS, Verdana, sans-serif";
      ctx.lineWidth = 7;
      ctx.strokeStyle = "rgba(83, 48, 18, 0.78)";
      ctx.strokeText("+1", 0, -34 - progress * 30);
      ctx.fillStyle = "#ffe56b";
      ctx.fillText("+1", 0, -34 - progress * 30);
    } else {
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8;
        const dist = 12 + progress * 28;
        drawPixelRect(Math.cos(angle) * dist, Math.sin(angle) * dist, 6, 6, i % 2 ? "#ffffff" : "#ffd84f");
      }
    }

    ctx.restore();
  });
}

function drawScoreText(presentation) {
  const x = CONFIG.width / 2;
  const y = CONFIG.height - 92;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${presentation.scoreFontSize}px Trebuchet MS, Verdana, sans-serif`;
  ctx.lineJoin = "round";

  ctx.lineWidth = 14;
  ctx.strokeStyle = "rgba(69, 39, 15, 0.92)";
  ctx.strokeText(presentation.scoreText, x, y + 7);

  ctx.lineWidth = 7;
  ctx.strokeStyle = "#fff4b8";
  ctx.strokeText(presentation.scoreText, x, y);

  ctx.fillStyle = "#ffcf4a";
  ctx.fillText(presentation.scoreText, x, y);

  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.font = `900 ${Math.round(presentation.scoreFontSize * 0.42)}px Trebuchet MS, Verdana, sans-serif`;
  ctx.fillText(presentation.scoreText, x, y - 17);
  ctx.restore();
}

function drawVictoryResult() {
  const presentation = Logic.getResultPresentation(game);

  if (art.victory.ready) {
    ctx.drawImage(art.victory, 0, 0, CONFIG.width, CONFIG.height);
    drawVictorySidekick(presentation);
    drawScoreText(presentation);
    return;
  }

  ctx.fillStyle = "rgba(29, 49, 31, 0.54)";
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  drawPixelRect(236, 146, 488, 222, "#fff6cf");
  drawPixelRect(236, 146, 488, 10, "#7b4b24");
  drawPixelRect(236, 358, 488, 10, "#7b4b24");
  drawPixelRect(236, 146, 10, 222, "#7b4b24");
  drawPixelRect(714, 146, 10, 222, "#7b4b24");
  drawScoreText(presentation);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function drawVictorySidekick(presentation) {
  if (presentation.sidekick?.image !== "emperor-dog-dialogue" || !art.emperorDogDialogue.ready) {
    return;
  }

  const slideSeconds = presentation.sidekick.slideSeconds || 1.8;
  const progress = easeOutCubic(Math.min(1, resultElapsed / slideSeconds));
  const image = art.emperorDogDialogue;
  const drawHeight = 350;
  const drawWidth = (image.width / image.height) * drawHeight;
  const finalX = CONFIG.width - drawWidth - 18;
  const startX = CONFIG.width + 24;
  const x = startX + (finalX - startX) * progress;
  const y = 74;

  ctx.save();
  ctx.shadowColor = "rgba(45, 33, 18, 0.28)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = -8;
  ctx.shadowOffsetY = 8;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  ctx.restore();
}

function drawOverlay() {
  if (game.status === "playing") {
    return;
  }

  if (game.status === "ended") {
    drawVictoryResult();
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
  ctx.fillText("30 Second Meadow Round", CONFIG.width / 2, 266);
}

function drawLoadingOverlay() {
  if (art.background.ready) {
    ctx.drawImage(art.background, 0, 0, CONFIG.width, CONFIG.height);
    drawAtmosphere();
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
    sky.addColorStop(0, "#9be6ff");
    sky.addColorStop(0.58, "#dff8ff");
    sky.addColorStop(1, "#86be68");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  }

  const ready = readyAssetCount();
  const total = totalAssetCount();
  const failed = failedAssetCount();
  const label = failed > 0 ? "Retrying art" : "Loading art";

  ctx.fillStyle = "rgba(29, 49, 31, 0.68)";
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

  drawPixelRect(286, 202, 388, 136, "#fff6cf");
  drawPixelRect(286, 202, 388, 10, "#7b4b24");
  drawPixelRect(286, 328, 388, 10, "#7b4b24");
  drawPixelRect(286, 202, 10, 136, "#7b4b24");
  drawPixelRect(664, 202, 10, 136, "#7b4b24");

  ctx.save();
  ctx.fillStyle = "#2b241b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 34px Trebuchet MS, Verdana, sans-serif";
  ctx.fillText(`${label} ${ready}/${total}`, CONFIG.width / 2, 248);

  ctx.fillStyle = "rgba(123, 75, 36, 0.24)";
  ctx.fillRect(344, 292, 272, 16);
  ctx.fillStyle = "#ffcf4a";
  ctx.fillRect(344, 292, Math.max(10, (272 * ready) / total), 16);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);

  if (!areAssetsReady()) {
    drawLoadingOverlay();
    return;
  }

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

  if (!areAssetsReady()) {
    statusLabel.textContent = `Loading ${readyAssetCount()}/${totalAssetCount()}`;
    startButton.textContent = "Start";
    startButton.disabled = true;
    restartButton.disabled = true;
    return;
  }

  restartButton.disabled = false;

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
  const wasEnded = game.status === "ended";

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

  if (game.status === "ended") {
    resultElapsed = wasEnded ? resultElapsed + dt : 0;
  } else {
    resultElapsed = 0;
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
  if (!areAssetsReady() || game.status === "playing") {
    return;
  }

  if (game.status === "ended") {
    game = Logic.restartRound();
    resultElapsed = 0;
    return;
  }

  game = Logic.startRound(game);
  resultElapsed = 0;
});

restartButton.addEventListener("click", () => {
  if (!areAssetsReady()) {
    return;
  }

  game = Logic.restartRound();
  resultElapsed = 0;
});

canvas.addEventListener("click", handleCanvasPress);
canvas.addEventListener("touchstart", handleCanvasPress, { passive: false });

syncUi();
draw();
requestAnimationFrame(step);
