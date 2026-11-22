"use strict";

(() => {
  const WIDTH = 800;
  const HEIGHT = 600;
  const RADIUS = 11;
  const PADDLE_BASE_WIDTH = 140;
  const PADDLE_HEIGHT = 16;
  const PADDLE_Y = HEIGHT - 55;
  const BRICK_WIDTH = 88;
  const BRICK_HEIGHT = 26;
  const BRICK_GAP = 8;
  const BRICK_TOP = 75;
  const COLUMNS = 8;
  const MAX_LEVEL = 100;
  const HIGH_SCORE_KEY = "bounce-ball-high-score";
  const BRICK_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#38bdf8"];

  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d");
  const menuScreen = document.querySelector("#menu-screen");
  const menuTitle = document.querySelector("#menu-title");
  const menuDescription = document.querySelector("#menu-description");
  const menuHighScore = document.querySelector("#menu-high-score");
  const menuActions = document.querySelector("#menu-actions");
  const gameScreen = document.querySelector("#game-screen");
  const scoreLabel = document.querySelector("#score-label");
  const highScoreLabel = document.querySelector("#high-score-label");
  const levelLabel = document.querySelector("#level-label");
  const damageLabel = document.querySelector("#damage-label");
  const wideLabel = document.querySelector("#wide-label");
  const errorMessage = document.querySelector("#error-message");

  const game = {
    screen: "lobby",
    difficulty: "Medium",
    theme: "Dark",
    score: 0,
    highScore: loadHighScore(),
    level: 1,
    damageBonus: 0,
    balls: [],
    bricks: [],
    drops: [],
    particles: [],
    paddle: { x: (WIDTH - PADDLE_BASE_WIDTH) / 2, width: PADDLE_BASE_WIDTH },
    wideUntil: 0,
    keys: new Set(),
    lastFrame: 0,
    animationId: 0,
    pointerX: null,
  };

  function loadHighScore() {
    try {
      const value = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
      return Number.isSafeInteger(value) && value >= 0 ? value : 0;
    } catch (error) {
      showError(`Rekor tertinggi tidak dapat dibaca: ${error.message}`);
      return 0;
    }
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
  }

  function hideError() {
    errorMessage.textContent = "";
    errorMessage.hidden = true;
  }

  function makeButton(label, action, secondary = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    if (secondary) button.className = "secondary";
    button.addEventListener("click", action);
    menuActions.append(button);
    return button;
  }

  function showMenu(title, description, actions) {
    stopLoop();
    game.screen = "menu";
    gameScreen.hidden = true;
    menuScreen.hidden = false;
    menuTitle.textContent = title;
    menuDescription.textContent = description;
    menuActions.replaceChildren();
    actions();
    menuHighScore.textContent = String(game.highScore);
    hideError();
  }

  function showLobby() {
    showMenu("Bola Memantul", "Game pemecah balok 100 level", () => {
      makeButton("MAIN", chooseDifficulty);
      makeButton("PENGATURAN", showSettings, true);
      makeButton("REKOR TERTINGGI", () => {
        menuDescription.textContent = `Rekor tertinggi Anda: ${game.highScore}`;
      }, true);
    });
  }

  function showSettings() {
    showMenu("Pengaturan", `Tema saat ini: ${game.theme === "Dark" ? "Gelap" : "Terang"}`, () => {
      makeButton(game.theme === "Dark" ? "GUNAKAN TEMA TERANG" : "GUNAKAN TEMA GELAP", () => {
        game.theme = game.theme === "Dark" ? "Light" : "Dark";
        document.body.classList.toggle("light", game.theme === "Light");
        showSettings();
      });
      makeButton("KEMBALI", showLobby, true);
    });
  }

  function chooseDifficulty() {
    showMenu("Pilih Kesulitan", "Pilih tantangan sebelum mulai.", () => {
      makeButton("EASY", () => startNewGame("Easy"));
      makeButton("MEDIUM", () => startNewGame("Medium"));
      makeButton("HARD", () => startNewGame("Hard"));
      makeButton("KEMBALI", showLobby, true);
    });
  }

  function startNewGame(difficulty) {
    game.difficulty = difficulty;
    game.score = 0;
    game.level = 1;
    game.damageBonus = 0;
    game.wideUntil = 0;
    game.paddle.width = PADDLE_BASE_WIDTH;
    game.balls = [];
    game.drops = [];
    game.particles = [];
    startLevel();
  }

  function startLevel() {
    game.bricks = makeBricks();
    game.balls = [];
    game.drops = [];
    game.particles = [];
    game.paddle.width = PADDLE_BASE_WIDTH;
    game.paddle.x = (WIDTH - game.paddle.width) / 2;
    game.wideUntil = 0;
    game.balls.push(makeBall());
    game.screen = "playing";
    menuScreen.hidden = true;
    gameScreen.hidden = false;
    updateHud();
    startLoop();
  }

  function makeBall(x = WIDTH / 2, y = HEIGHT / 2, vx = null, vy = null) {
    const speed = ballSpeed();
    const direction = Math.random() < 0.5 ? -1 : 1;
    return {
      x,
      y,
      vx: vx ?? direction * speed * 0.65,
      vy: vy ?? -speed * 0.76,
    };
  }

  function ballSpeed() {
    const base = { Easy: 5, Medium: 6, Hard: 7 }[game.difficulty];
    return base * (1.001 ** (game.level - 1));
  }

  function damageValue() {
    return Math.min(10, 1 + game.damageBonus + Math.floor((game.level - 1) / 10));
  }

  function makeBricks() {
    const rows = { Easy: 4, Medium: 5, Hard: 6 }[game.difficulty];
    const total = COLUMNS * BRICK_WIDTH + (COLUMNS - 1) * BRICK_GAP;
    const startX = (WIDTH - total) / 2;
    const bricks = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < COLUMNS; column += 1) {
        const pattern = (row + column + game.level) % 7;
        if ((rows === 4 && pattern === 0) || (rows === 6 && pattern === 6)) continue;
        let hp = 1 + Number(row >= 3) + Math.floor(game.level / 25);
        if (game.difficulty === "Hard" && row % 2 === 0) hp += 1;
        bricks.push({
          x: startX + column * (BRICK_WIDTH + BRICK_GAP),
          y: BRICK_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
          hp,
          maxHp: hp,
          color: BRICK_COLORS[row % BRICK_COLORS.length],
        });
      }
    }
    return bricks;
  }

  function updateHud() {
    scoreLabel.textContent = `Skor: ${game.score}`;
    highScoreLabel.textContent = `Rekor: ${game.highScore}`;
    levelLabel.textContent = `Level ${game.level} / ${MAX_LEVEL} · ${game.difficulty}`;
    damageLabel.textContent = `Damage: ${damageValue()}`;
    updateWideHud();
  }

  function addScore(points) {
    game.score += points;
    if (game.score > game.highScore) {
      game.highScore = game.score;
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(game.highScore));
      } catch (error) {
        showError(`Rekor tertinggi tidak dapat disimpan: ${error.message}`);
      }
    }
    updateHud();
  }

  function activateWide() {
    const now = performance.now() / 1000;
    const remaining = Math.max(0, game.wideUntil - now);
    const duration = 10 * (1.003 ** (game.level - 1));
    game.wideUntil = now + Math.min(60, remaining + duration);
    game.paddle.width = Math.min(WIDTH, PADDLE_BASE_WIDTH * 1.6);
    game.paddle.x = clamp(game.paddle.x, 0, WIDTH - game.paddle.width);
    updateWideHud();
  }

  function updateWideHud() {
    const remaining = Math.max(0, game.wideUntil - performance.now() / 1000);
    wideLabel.hidden = remaining <= 0;
    wideLabel.textContent = remaining > 0
      ? `WIDE: ${(Math.ceil(remaining * 10) / 10).toFixed(1)} dtk`
      : "";
  }

  function collectDrop(drop) {
    if (drop.type === "wide") {
      activateWide();
    } else if (drop.type === "damage") {
      if (damageValue() < 10) game.damageBonus += 1;
      updateHud();
    } else if (game.balls.length < 10) {
      const source = game.balls[0];
      game.balls.push(makeBall(source.x, source.y, -source.vx, source.vy));
      game.balls.push(makeBall(source.x, source.y, source.vx, -source.vy));
    }
    addScore(50);
  }

  function spawnDrop(x, y) {
    const types = ["wide", "damage", "double"];
    const type = types[Math.floor(Math.random() * types.length)];
    game.drops.push({ x, y, type });
  }

  function damageBrick(brick) {
    brick.hp -= damageValue();
    if (brick.hp <= 0) {
      game.bricks.splice(game.bricks.indexOf(brick), 1);
      burst(brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT / 2, brick.color, 18);
      addScore(25);
      if (Math.random() < 0.22) spawnDrop(brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT / 2);
    }
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      game.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.2 + Math.random() * 0.2,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  function startLoop() {
    stopLoop();
    game.lastFrame = performance.now();
    game.animationId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (game.animationId) cancelAnimationFrame(game.animationId);
    game.animationId = 0;
  }

  function frame(now) {
    game.animationId = 0;
    if (game.screen !== "playing") return;
    const dt = Math.min((now - game.lastFrame) / 1000, 0.033);
    game.lastFrame = now;
    updateGame(dt);
    draw();
    if (game.screen === "playing") {
      game.animationId = requestAnimationFrame(frame);
    }
  }

  function updateGame(dt) {
    const scale = dt * 60;
    if (game.pointerX !== null) {
      game.paddle.x = clamp(game.pointerX - game.paddle.width / 2, 0, WIDTH - game.paddle.width);
    } else {
      if (game.keys.has("ArrowLeft")) game.paddle.x -= 8 * scale;
      if (game.keys.has("ArrowRight")) game.paddle.x += 8 * scale;
      game.paddle.x = clamp(game.paddle.x, 0, WIDTH - game.paddle.width);
    }

    if (game.wideUntil > 0) {
      updateWideHud();
      if (game.wideUntil <= nowSeconds()) {
        game.wideUntil = 0;
        game.paddle.width = PADDLE_BASE_WIDTH;
        game.paddle.x = clamp(game.paddle.x, 0, WIDTH - game.paddle.width);
        updateWideHud();
      }
    }

    for (const ball of [...game.balls]) {
      const travel = Math.max(Math.abs(ball.vx * scale), Math.abs(ball.vy * scale));
      const steps = Math.max(1, Math.ceil(travel / 4));
      for (let step = 0; step < steps; step += 1) {
        if (!game.balls.includes(ball)) break;
        moveBall(ball, scale / steps);
      }
      if (ball.y - RADIUS > HEIGHT) game.balls.splice(game.balls.indexOf(ball), 1);
    }

    for (const drop of [...game.drops]) {
      drop.y += 4 * scale;
      if (drop.y + 16 >= PADDLE_Y && drop.y - 16 <= PADDLE_Y + PADDLE_HEIGHT
        && drop.x + 16 >= game.paddle.x
        && drop.x - 16 <= game.paddle.x + game.paddle.width) {
        collectDrop(drop);
        game.drops.splice(game.drops.indexOf(drop), 1);
      } else if (drop.y - 16 > HEIGHT) {
        game.drops.splice(game.drops.indexOf(drop), 1);
      }
    }

    for (const particle of [...game.particles]) {
      particle.x += particle.vx * scale;
      particle.y += particle.vy * scale;
      particle.life -= dt;
      if (particle.life <= 0) game.particles.splice(game.particles.indexOf(particle), 1);
    }

    if (game.balls.length === 0) showGameOver();
    else if (game.bricks.length === 0) showLevelComplete();
  }

  function nowSeconds() {
    return performance.now() / 1000;
  }

  function moveBall(ball, scale) {
    const previousX = ball.x;
    const previousY = ball.y;
    ball.x += ball.vx * scale;
    ball.y += ball.vy * scale;

    if (ball.x - RADIUS < 0) {
      ball.x = RADIUS;
      ball.vx = Math.abs(ball.vx);
      burst(ball.x, ball.y, "#fbbf24", 3);
    } else if (ball.x + RADIUS > WIDTH) {
      ball.x = WIDTH - RADIUS;
      ball.vx = -Math.abs(ball.vx);
      burst(ball.x, ball.y, "#fbbf24", 3);
    }
    if (ball.y - RADIUS < 0) {
      ball.y = RADIUS;
      ball.vy = Math.abs(ball.vy);
      burst(ball.x, ball.y, "#fbbf24", 3);
    }

    const paddleTop = PADDLE_Y;
    if (ball.vy > 0 && previousY + RADIUS <= paddleTop && ball.y + RADIUS >= paddleTop
      && ball.x + RADIUS >= game.paddle.x
      && ball.x - RADIUS <= game.paddle.x + game.paddle.width) {
      const center = game.paddle.x + game.paddle.width / 2;
      const offset = clamp((ball.x - center) / (game.paddle.width / 2), -1, 1);
      const speed = Math.hypot(ball.vx, ball.vy);
      ball.vx = speed * offset * 0.9;
      ball.vy = -Math.sqrt(Math.max(0, speed * speed - ball.vx * ball.vx));
      ball.y = paddleTop - RADIUS;
      burst(ball.x, paddleTop, "#38bdf8", 8);
    }

    for (const brick of game.bricks) {
      const overlaps = ball.x + RADIUS > brick.x && ball.x - RADIUS < brick.x + BRICK_WIDTH
        && ball.y + RADIUS > brick.y && ball.y - RADIUS < brick.y + BRICK_HEIGHT;
      if (!overlaps) continue;

      const oldLeft = previousX - RADIUS;
      const oldRight = previousX + RADIUS;
      const oldTop = previousY - RADIUS;
      const oldBottom = previousY + RADIUS;
      if (oldBottom <= brick.y) {
        ball.y = brick.y - RADIUS;
        ball.vy = -Math.abs(ball.vy);
      } else if (oldTop >= brick.y + BRICK_HEIGHT) {
        ball.y = brick.y + BRICK_HEIGHT + RADIUS;
        ball.vy = Math.abs(ball.vy);
      } else if (oldRight <= brick.x) {
        ball.x = brick.x - RADIUS;
        ball.vx = -Math.abs(ball.vx);
      } else if (oldLeft >= brick.x + BRICK_WIDTH) {
        ball.x = brick.x + BRICK_WIDTH + RADIUS;
        ball.vx = Math.abs(ball.vx);
      } else {
        ball.vy *= -1;
      }
      burst(ball.x, ball.y, "#fde68a", 5);
      damageBrick(brick);
      break;
    }
  }

  function draw() {
    ctx.fillStyle = game.theme === "Dark" ? "#101827" : "#f1f5f9";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (const brick of game.bricks) {
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      ctx.strokeStyle = game.theme === "Dark" ? "#101827" : "#64748b";
      ctx.lineWidth = 2;
      ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      if (brick.hp > 1) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 13px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(brick.hp), brick.x + BRICK_WIDTH / 2, brick.y + BRICK_HEIGHT / 2);
      }
    }

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(game.paddle.x, PADDLE_Y, game.paddle.width, PADDLE_HEIGHT);
    for (const ball of game.balls) {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();
      ctx.strokeStyle = "#fde68a";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    for (const drop of game.drops) {
      const colors = { wide: "#22d3ee", damage: "#f87171", double: "#a855f7" };
      const labels = { wide: "LEBAR", damage: "DMG", double: "2X" };
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = colors[drop.type];
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 8px Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labels[drop.type], drop.x, drop.y);
    }
    for (const particle of game.particles) {
      ctx.globalAlpha = Math.min(1, particle.life * 4);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function showGameOver() {
    stopLoop();
    showMenu("Permainan Berakhir", `Skor: ${game.score} · Rekor: ${game.highScore}`, () => {
      makeButton("ULANGI", () => startNewGame(game.difficulty));
      makeButton("KEMBALI KE MENU", showLobby, true);
    });
  }

  function showLevelComplete() {
    stopLoop();
    if (game.level >= MAX_LEVEL) {
      showMenu("Hebat! Semua Level Selesai", `Skor akhir: ${game.score} · Rekor: ${game.highScore}`, () => {
        makeButton("MAIN LAGI", () => startNewGame(game.difficulty));
        makeButton("MENU UTAMA", showLobby, true);
      });
      return;
    }

    game.level += 1;
    showMenu(`Level ${game.level - 1} Selesai!`, `Lanjut ke level ${game.level} · Skor: ${game.score}`, () => {
      makeButton("LANJUTKAN", startLevel);
      makeButton("MENU UTAMA", showLobby, true);
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return clamp((event.clientX - rect.left) * WIDTH / rect.width, 0, WIDTH);
  }

  canvas.addEventListener("pointermove", (event) => {
    game.pointerX = pointerPosition(event);
  });
  canvas.addEventListener("pointerleave", () => {
    game.pointerX = null;
  });
  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    game.pointerX = pointerPosition(event);
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") event.preventDefault();
    if (game.screen === "playing" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      game.keys.add(event.key);
    }
    if (event.key === "Escape" && game.screen === "playing") showLobby();
  });
  window.addEventListener("keyup", (event) => game.keys.delete(event.key));
  window.addEventListener("blur", () => game.keys.clear());

  document.querySelector("#fullscreen-button").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.querySelector(".app").requestFullscreen();
    } catch (error) {
      showError(`Mode layar penuh tidak tersedia: ${error.message}`);
    }
  });

  showLobby();
})();
