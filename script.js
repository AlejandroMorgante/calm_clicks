const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const passBtn = document.getElementById("passBtn");
const quitBtn = document.getElementById("quitBtn");

const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  balls: [],
  particles: [],
  lastTime: 0,
  paused: false,
  score: 0,
  calm: false,
  spawnTimer: 0,
  overlay: {
    clickThrough: false,
  },
};

const SETTINGS = {
  spawnInterval: 1600,
  spawnIntervalCalm: 2200,
  maxBalls: 6,
  maxBallsCalm: 4,
  minRadius: 26,
  maxRadius: 60,
  splitFactor: 0.7,
  minSplitRadius: 30,
  speed: 0.22,
  speedCalm: 0.15,
};

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.max(1, state.width * devicePixelRatio);
  canvas.height = Math.max(1, state.height * devicePixelRatio);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function addBall(radius = rand(SETTINGS.minRadius, SETTINGS.maxRadius)) {
  if (state.balls.length >= (state.calm ? SETTINGS.maxBallsCalm : SETTINGS.maxBalls)) {
    return;
  }
  const x = rand(radius, state.width - radius);
  const y = rand(radius, state.height - radius);
  const angle = rand(0, Math.PI * 2);
  const speed = (state.calm ? SETTINGS.speedCalm : SETTINGS.speed) * rand(0.7, 1.2);
  state.balls.push({
    x,
    y,
    r: radius,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    wobble: rand(0, Math.PI * 2),
  });
}

function addParticles(x, y, count = 10) {
  for (let i = 0; i < count; i += 1) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(0.6, 1.8);
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: rand(300, 600),
      radius: rand(2, 4),
    });
  }
}

function splitBall(ball, index) {
  const newRadius = ball.r * SETTINGS.splitFactor;
  if (newRadius < SETTINGS.minSplitRadius) {
    state.balls.splice(index, 1);
    addParticles(ball.x, ball.y, 14);
    state.score += 1;
    return;
  }

  state.balls.splice(index, 1);
  const offset = newRadius * 0.7;
  const angle = rand(0, Math.PI * 2);
  const dx = Math.cos(angle) * offset;
  const dy = Math.sin(angle) * offset;

  state.balls.push({
    x: ball.x + dx,
    y: ball.y + dy,
    r: newRadius,
    vx: ball.vx + rand(-0.15, 0.15),
    vy: ball.vy + rand(-0.15, 0.15),
    wobble: rand(0, Math.PI * 2),
  });
  state.balls.push({
    x: ball.x - dx,
    y: ball.y - dy,
    r: newRadius,
    vx: ball.vx + rand(-0.15, 0.15),
    vy: ball.vy + rand(-0.15, 0.15),
    wobble: rand(0, Math.PI * 2),
  });
  addParticles(ball.x, ball.y, 10);
  state.score += 1;
}

function updateBalls(delta) {
  const drift = 0.0006 * delta;
  state.balls.forEach((ball) => {
    ball.wobble += drift;
    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta + Math.sin(ball.wobble) * 0.18;

    if (ball.x - ball.r < 0) {
      ball.x = ball.r;
      ball.vx *= -1;
    } else if (ball.x + ball.r > state.width) {
      ball.x = state.width - ball.r;
      ball.vx *= -1;
    }

    if (ball.y - ball.r < 0) {
      ball.y = ball.r;
      ball.vy *= -1;
    } else if (ball.y + ball.r > state.height) {
      ball.y = state.height - ball.r;
      ball.vy *= -1;
    }
  });
}

function updateParticles(delta) {
  state.particles = state.particles.filter((p) => {
    p.life -= delta;
    p.x += p.vx * delta;
    p.y += p.vy * delta;
    p.vx *= 0.99;
    p.vy *= 0.99;
    return p.life > 0;
  });
}

function draw() {
  ctx.clearRect(0, 0, state.width, state.height);

  for (const ball of state.balls) {
    const gradient = ctx.createRadialGradient(
      ball.x - ball.r * 0.3,
      ball.y - ball.r * 0.3,
      ball.r * 0.2,
      ball.x,
      ball.y,
      ball.r
    );
    gradient.addColorStop(0, "rgba(120, 255, 170, 0.95)");
    gradient.addColorStop(1, "rgba(40, 220, 100, 0.85)");

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(57, 255, 122, 0.45)";
    ctx.shadowBlur = ball.r * 0.6;
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  for (const p of state.particles) {
    const alpha = Math.max(0, p.life / 600);
    ctx.fillStyle = `rgba(120, 255, 170, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function loop(timestamp) {
  if (!state.lastTime) state.lastTime = timestamp;
  const delta = Math.min(32, timestamp - state.lastTime);
  state.lastTime = timestamp;

  if (!state.paused) {
    state.spawnTimer += delta;
    const spawnInterval = state.calm ? SETTINGS.spawnIntervalCalm : SETTINGS.spawnInterval;
    if (state.spawnTimer >= spawnInterval) {
      addBall();
      state.spawnTimer = 0;
    }

    updateBalls(delta);
    updateParticles(delta);
  }

  draw();
  scoreEl.textContent = state.score.toString();

  requestAnimationFrame(loop);
}

function handleClick(event) {
  if (state.paused) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  for (let i = state.balls.length - 1; i >= 0; i -= 1) {
    const ball = state.balls[i];
    const dx = x - ball.x;
    const dy = y - ball.y;
    if (dx * dx + dy * dy <= ball.r * ball.r) {
      splitBall(ball, i);
      return;
    }
  }
}

function setClickThrough(nextValue) {
  state.overlay.clickThrough = nextValue;
  passBtn.setAttribute("aria-pressed", String(nextValue));
  passBtn.textContent = nextValue ? "Clicks pasan" : "Clicks se quedan";
}

passBtn.addEventListener("click", async () => {
  const nextValue = !state.overlay.clickThrough;
  if (window.overlay?.setClickThrough) {
    const nextState = await window.overlay.setClickThrough(nextValue);
    setClickThrough(Boolean(nextState.clickThrough));
  } else {
    setClickThrough(nextValue);
  }
});
quitBtn.addEventListener("click", () => {
  if (window.overlay?.quit) window.overlay.quit();
});
canvas.addEventListener("pointerdown", handleClick);

window.addEventListener("resize", resize);

resize();
setClickThrough(false);
addBall(rand(24, 38));
addBall(rand(28, 42));
requestAnimationFrame(loop);

if (window.overlay?.onState) {
  window.overlay.onState((nextState) => {
    setClickThrough(Boolean(nextState.clickThrough));
  });
  window.overlay.getState().then((nextState) => {
    if (!nextState) return;
    setClickThrough(Boolean(nextState.clickThrough));
  });
}
