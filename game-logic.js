(function attachGameLogic(root) {
  const GAME_CONFIG = {
    width: 960,
    height: 540,
    roundSeconds: 30,
    butterflyCount: 6,
    dogSpeed: 240,
    catchDistance: 34,
    clickPadding: 10,
    butterflyMinRadius: 17,
    butterflyMaxRadius: 23,
    safeBounds: {
      minX: 90,
      maxX: 870,
      minY: 110,
      maxY: 360
    }
  };

  const BUTTERFLY_COLORS = [
    { wingA: "#ffb238", wingB: "#ffdf6b", body: "#4b2a20" },
    { wingA: "#6ec6ff", wingB: "#3f8cff", body: "#25395f" },
    { wingA: "#ff78b8", wingB: "#ffc0dd", body: "#60324b" },
    { wingA: "#b77dff", wingB: "#e3c2ff", body: "#49325f" },
    { wingA: "#fff2a8", wingB: "#f7d94a", body: "#4b3b1e" }
  ];

  let nextButterflyNumber = 1;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function cloneDog(dog) {
    return {
      x: dog.x,
      y: dog.y,
      speed: dog.speed,
      targetId: dog.targetId,
      facing: dog.facing
    };
  }

  function cloneButterfly(butterfly) {
    return {
      id: butterfly.id,
      x: butterfly.x,
      y: butterfly.y,
      vx: butterfly.vx,
      vy: butterfly.vy,
      radius: butterfly.radius,
      phase: butterfly.phase,
      spriteIndex: butterfly.spriteIndex,
      color: butterfly.color
    };
  }

  function makeButterflyId(existingIds) {
    const taken = new Set(existingIds || []);
    let id = `butterfly-${nextButterflyNumber}`;

    while (taken.has(id)) {
      nextButterflyNumber += 1;
      id = `butterfly-${nextButterflyNumber}`;
    }

    nextButterflyNumber += 1;
    return id;
  }

  function spawnButterfly(existingIds) {
    const bounds = GAME_CONFIG.safeBounds;
    const spriteIndex = Math.floor(Math.random() * BUTTERFLY_COLORS.length);
    const color = BUTTERFLY_COLORS[spriteIndex];

    return {
      id: makeButterflyId(existingIds),
      x: randomBetween(bounds.minX, bounds.maxX),
      y: randomBetween(bounds.minY, bounds.maxY),
      vx: randomBetween(-24, 24),
      vy: randomBetween(-15, 15),
      radius: randomBetween(GAME_CONFIG.butterflyMinRadius, GAME_CONFIG.butterflyMaxRadius),
      phase: randomBetween(0, Math.PI * 2),
      spriteIndex,
      color
    };
  }

  function createButterflies(count) {
    const butterflies = [];

    for (let index = 0; index < count; index += 1) {
      butterflies.push(spawnButterfly(butterflies.map((butterfly) => butterfly.id)));
    }

    return butterflies;
  }

  function createGameState() {
    return {
      status: "ready",
      score: 0,
      timeLeft: GAME_CONFIG.roundSeconds,
      dog: {
        x: 130,
        y: 390,
        speed: GAME_CONFIG.dogSpeed,
        targetId: null,
        facing: 1
      },
      butterflies: createButterflies(GAME_CONFIG.butterflyCount),
      effects: [],
      elapsed: 0
    };
  }

  function findButterflyAt(butterflies, x, y) {
    for (let index = butterflies.length - 1; index >= 0; index -= 1) {
      const butterfly = butterflies[index];
      const hitRadius = butterfly.radius + GAME_CONFIG.clickPadding;

      if (distance({ x, y }, butterfly) <= hitRadius) {
        return butterfly;
      }
    }

    return null;
  }

  function moveDogTowardTarget(dog, target, dt) {
    const nextDog = cloneDog(dog);

    if (!target || dt <= 0) {
      return { dog: nextDog, caught: false };
    }

    const dx = target.x - dog.x;
    const dy = target.y - dog.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0 || dist <= GAME_CONFIG.catchDistance || dog.speed * dt >= dist) {
      nextDog.x = target.x;
      nextDog.y = target.y;
      nextDog.facing = dx < 0 ? -1 : 1;
      return { dog: nextDog, caught: true };
    }

    const step = dog.speed * dt;
    nextDog.x = dog.x + (dx / dist) * step;
    nextDog.y = dog.y + (dy / dist) * step;
    nextDog.facing = dx < 0 ? -1 : 1;

    return { dog: nextDog, caught: false };
  }

  function tickTimer(state, dt) {
    if (state.status !== "playing") {
      return { ...state };
    }

    const timeLeft = clamp(state.timeLeft - dt, 0, GAME_CONFIG.roundSeconds);

    return {
      ...state,
      timeLeft,
      status: timeLeft === 0 ? "ended" : state.status,
      dog: timeLeft === 0 ? { ...state.dog, targetId: null } : state.dog
    };
  }

  function catchButterfly(state, butterflyId) {
    const caught = state.butterflies.find((butterfly) => butterfly.id === butterflyId);

    if (!caught) {
      return { ...state };
    }

    const remaining = state.butterflies
      .filter((butterfly) => butterfly.id !== butterflyId)
      .map(cloneButterfly);
    const replacement = spawnButterfly(remaining.map((butterfly) => butterfly.id));

    return {
      ...state,
      score: state.score + 1,
      dog: { ...state.dog, targetId: null },
      butterflies: [...remaining, replacement],
      effects: [
        ...state.effects,
        {
          id: `catch-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          x: caught.x,
          y: caught.y,
          age: 0,
          duration: 0.45
        }
      ]
    };
  }

  function updateButterflies(butterflies, dt) {
    const bounds = GAME_CONFIG.safeBounds;

    return butterflies.map((butterfly) => {
      const next = cloneButterfly(butterfly);
      next.phase += dt * 8;
      next.x += next.vx * dt;
      next.y += next.vy * dt;

      if (next.x < bounds.minX || next.x > bounds.maxX) {
        next.vx *= -1;
        next.x = clamp(next.x, bounds.minX, bounds.maxX);
      }

      if (next.y < bounds.minY || next.y > bounds.maxY) {
        next.vy *= -1;
        next.y = clamp(next.y, bounds.minY, bounds.maxY);
      }

      next.y += Math.sin(next.phase) * 0.18;
      return next;
    });
  }

  function updateEffects(effects, dt) {
    return effects
      .map((effect) => ({ ...effect, age: effect.age + dt }))
      .filter((effect) => effect.age < effect.duration);
  }

  function selectTarget(state, butterflyId) {
    const targetExists = state.butterflies.some((butterfly) => butterfly.id === butterflyId);

    if (!targetExists || state.status !== "playing") {
      return { ...state };
    }

    return {
      ...state,
      dog: { ...state.dog, targetId: butterflyId }
    };
  }

  function startRound(state) {
    return {
      ...state,
      status: "playing",
      score: state.score || 0,
      timeLeft: state.timeLeft > 0 ? state.timeLeft : GAME_CONFIG.roundSeconds
    };
  }

  function restartRound() {
    return {
      ...createGameState(),
      status: "playing"
    };
  }

  function getResultPresentation(state) {
    return {
      screen: "victory",
      scoreText: `Score ${state.score}`,
      scoreFontSize: 68
    };
  }

  const api = {
    GAME_CONFIG,
    createGameState,
    findButterflyAt,
    moveDogTowardTarget,
    tickTimer,
    catchButterfly,
    spawnButterfly,
    updateButterflies,
    updateEffects,
    selectTarget,
    startRound,
    restartRound,
    getResultPresentation
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.GameLogic = api;
})(typeof window !== "undefined" ? window : globalThis);
