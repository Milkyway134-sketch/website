const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const caption = document.getElementById('caption');
const playButton = document.getElementById('play');
const replayButton = document.getElementById('replay');
let particles = [];
let running = false;
let startedAt = 0;
let lineIndex = -1;

const lines = [
  [0, 'You know it\'s true'],
  [1800, 'Yeah, I miss you'],
  [3500, 'You know it\'s true'],
  [5200, 'So, what if I call?'],
  [7000, 'And you pick up the phone'],
  [8800, 'And I use this holiday'],
  [10500, 'To make my way to your ghost'],
  [12400, 'Oh, what if you\'re lonely?'],
  [14300, 'You know I am too'],
  [16000, 'And I get the chance to say'],
  [17800, 'Merry Christmas, I miss you'],
  [19800, 'I MISS YOU'],
];

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * ratio);
  canvas.height = Math.floor(innerHeight * ratio);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createParticle() {
  const kinds = ['snow', 'sparkle', 'rain'];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  return {
    x: Math.random() * innerWidth,
    y: -20 - Math.random() * innerHeight,
    size: kind === 'sparkle' ? 2 + Math.random() * 4 : 1 + Math.random() * 3,
    speed: 0.35 + Math.random() * (kind === 'rain' ? 5 : 1.8),
    drift: (Math.random() - 0.5) * 0.8,
    kind,
  };
}

function seedParticles() {
  particles = Array.from({ length: 170 }, createParticle);
  for (const particle of particles) {
    particle.y = Math.random() * innerHeight;
  }
}

function drawParticle(particle) {
  ctx.save();
  ctx.fillStyle = particle.kind === 'snow' ? '#eaf5ff' : particle.kind === 'rain' ? '#87aaff' : '#c9a7ff';
  ctx.globalAlpha = 0.35 + Math.random() * 0.55;
  if (particle.kind === 'sparkle') {
    ctx.translate(particle.x, particle.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
  } else if (particle.kind === 'snow') {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(particle.x, particle.y, 1, particle.size * 4);
  }
  ctx.restore();
}

function drawBackground(time) {
  ctx.fillStyle = '#05060d';
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  const glow = ctx.createRadialGradient(innerWidth * 0.5, innerHeight * 0.5, 20, innerWidth * 0.5, innerHeight * 0.5, innerWidth * 0.55);
  glow.addColorStop(0, 'rgba(74, 48, 120, 0.22)');
  glow.addColorStop(0.5, 'rgba(35, 25, 65, 0.08)');
  glow.addColorStop(1, 'rgba(5, 6, 13, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  ctx.save();
  ctx.translate(innerWidth * 0.5, innerHeight * 0.5);
  ctx.rotate(time * 0.00008);
  ctx.strokeStyle = 'rgba(180, 145, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, 180 + i * 70, 60 + i * 24, i * 0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function updateLine(elapsed) {
  let nextIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (elapsed >= lines[i][0]) nextIndex = i;
  }
  if (nextIndex !== lineIndex) {
    lineIndex = nextIndex;
    if (lineIndex >= 0) {
      caption.classList.remove('fade-out');
      caption.textContent = lines[lineIndex][1];
      caption.classList.add('show');
      window.clearTimeout(caption.hideTimer);
      caption.hideTimer = window.setTimeout(() => caption.classList.add('fade-out'), 1450);
    }
  }
  if (elapsed > 21000) finish();
}

function finish() {
  running = false;
  caption.classList.remove('fade-out');
  caption.classList.add('show');
  replayButton.hidden = false;
  playButton.hidden = true;
}

function animate(time) {
  drawBackground(time);
  for (const particle of particles) {
    particle.y += particle.speed;
    particle.x += particle.drift;
    if (particle.y > innerHeight + 30) {
      particle.y = -20;
      particle.x = Math.random() * innerWidth;
    }
    if (particle.x < -20) particle.x = innerWidth + 20;
    if (particle.x > innerWidth + 20) particle.x = -20;
    drawParticle(particle);
  }
  if (running) updateLine(time - startedAt);
  requestAnimationFrame(animate);
}

function start() {
  seedParticles();
  running = true;
  startedAt = performance.now();
  lineIndex = -1;
  caption.className = 'caption';
  playButton.hidden = true;
  replayButton.hidden = true;
}

playButton.addEventListener('click', start);
replayButton.addEventListener('click', start);
window.addEventListener('resize', resize);
resize();
seedParticles();
requestAnimationFrame(animate);
