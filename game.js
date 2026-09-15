const GAME_BAD_ITEMS = [
  { icon: '●', label: '입자', color: '#d67c83' },
  { icon: '◆', label: '금속 오염', color: '#b46f91' },
  { icon: '✦', label: '유기 오염', color: '#d28a62' },
  { icon: '💧', label: '수분', color: '#658eb4' },
  { icon: '▰', label: '스크래치', color: '#aa6d79' },
  { icon: '☁', label: '잔류 가스', color: '#8978a8' }
];
const GAME_GOOD_ITEMS = [
  { icon: '✧', label: '클린 에어', color: '#659ab8' },
  { icon: '⚗', label: '세정 약품', color: '#4f9b92' },
  { icon: '◉', label: '웨이퍼', color: '#527da8' },
  { icon: '▦', label: '포토 공정', color: '#6f88ad' },
  { icon: '✚', label: '초순수', color: '#5b9eb0' }
];
let gameFrame = null;
let gameState = null;

function stopGameLoop() {
  if (gameFrame) cancelAnimationFrame(gameFrame);
  gameFrame = null;
  gameState = null;
}

function renderGame() {
  stopGameLoop();
  shell(`<section class="game-page"><div class="game-heading"><div><span class="eyebrow">CLEANROOM CATCH</span><h1 class="section-title">클린룸 바구니 받기</h1><p class="small-title">오염은 피하고, 깨끗한 공정 아이템을 바구니에 담아보세요.</p></div><div class="game-rules"><span class="game-life">라이프 <strong id="gameLives">♥♥♥♥♥</strong></span><span class="game-score">점수 <strong id="gameScore">0</strong></span></div></div><div class="game-stage-wrap"><canvas id="gameCanvas" class="game-canvas" aria-label="오염을 피하고 공정 아이템을 받는 게임"></canvas><div class="game-overlay" id="gameOverlay"><div class="game-overlay-card"><span class="game-over-icon">✧</span><h2 id="gameOverlayTitle">준비됐나요?</h2><p id="gameOverlayText">화살표 키, 마우스 또는 손가락으로 바구니를 움직이세요.</p><button class="primary-btn" onclick="startCatchGame()" id="gameStartButton">게임 시작</button></div></div></div><div class="game-legend"><div><strong>피해야 할 오염</strong><span>${GAME_BAD_ITEMS.map(item => `<em class="legend-bad" style="--item-color:${item.color}">${item.icon} ${item.label}</em>`).join('')}</span></div><div><strong>받아도 되는 공정</strong><span>${GAME_GOOD_ITEMS.map(item => `<em class="legend-good" style="--item-color:${item.color}">${item.icon} ${item.label}</em>`).join('')}</span></div></div></section>`, 'game');
  resizeGameCanvas();
  window.addEventListener('resize', resizeGameCanvas);
  const canvas = document.querySelector('#gameCanvas');
  canvas.addEventListener('pointermove', moveBasketFromPointer);
  canvas.addEventListener('pointerdown', moveBasketFromPointer);
  document.addEventListener('keydown', moveBasketFromKeyboard);
}

function resizeGameCanvas() {
  const canvas = document.querySelector('#gameCanvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (gameState) drawGame();
}

function startCatchGame() {
  const canvas = document.querySelector('#gameCanvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  gameState = { running: true, score: 0, lives: 5, lastLives: 5, elapsed: 0, spawnTimer: 0, lastTime: performance.now(), basket: { x: rect.width / 2 - 48, y: rect.height - 58, width: 96, height: 30 }, items: [] };
  document.querySelector('#gameOverlay').classList.add('hidden');
  updateGameHud();
  gameFrame = requestAnimationFrame(gameLoop);
}

function gameLoop(now) {
  if (!gameState || !gameState.running) return;
  const elapsed = Math.min(34, now - gameState.lastTime);
  gameState.lastTime = now;
  gameState.elapsed += elapsed;
  gameState.spawnTimer += elapsed;
  const canvas = document.querySelector('#gameCanvas');
  const rect = canvas.getBoundingClientRect();
  if (gameState.spawnTimer > Math.max(360, 850 - gameState.elapsed / 140)) {
    spawnGameItem(rect.width);
    gameState.spawnTimer = 0;
  }
  gameState.items.forEach(item => { item.y += item.speed * elapsed / 16; item.rotation += item.spin; });
  const remaining = [];
  gameState.items.forEach(item => {
    if (item.y + item.size >= gameState.basket.y && item.y <= gameState.basket.y + gameState.basket.height && item.x + item.size >= gameState.basket.x && item.x <= gameState.basket.x + gameState.basket.width) {
      if (item.bad) gameState.lives -= 1; else gameState.score += 10;
      updateGameHud();
      if (gameState.lives <= 0) endCatchGame();
    } else if (item.y < rect.height + item.size) remaining.push(item);
  });
  gameState.items = remaining;
  drawGame();
  if (gameState.running) gameFrame = requestAnimationFrame(gameLoop);
}

function spawnGameItem(width) {
  const bad = Math.random() < 0.42;
  const source = bad ? GAME_BAD_ITEMS : GAME_GOOD_ITEMS;
  const item = source[Math.floor(Math.random() * source.length)];
  gameState.items.push({ ...item, bad, x: 18 + Math.random() * Math.max(20, width - 54), y: -36, size: 34, speed: 2.1 + Math.random() * 1.8 + gameState.elapsed / 16000, rotation: 0, spin: (Math.random() - .5) * .08 });
}

function drawGame() {
  const canvas = document.querySelector('#gameCanvas');
  if (!canvas || !gameState) return;
  const context = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  context.clearRect(0, 0, rect.width, rect.height);
  context.fillStyle = '#e9f2f7';
  context.fillRect(0, 0, rect.width, rect.height);
  drawCleanroomBackground(context, rect.width, rect.height);
  gameState.items.forEach(item => drawGameItem(context, item));
  drawBasket(context, gameState.basket);
}

function drawGameItem(context, item) {
  context.save();
  context.translate(item.x + item.size / 2, item.y + item.size / 2);
  context.rotate(item.rotation);
  context.fillStyle = item.bad ? 'rgba(255, 226, 229, .98)' : 'rgba(205, 235, 248, .98)';
  context.strokeStyle = item.bad ? '#d7828a' : '#6aa6c4';
  context.lineWidth = 2;
  roundedCanvasRect(context, -item.size / 2, -item.size / 2, item.size, item.size, 10);
  context.fill();
  context.stroke();
  context.font = '20px "Segoe UI Emoji", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = item.color;
  context.fillText(item.icon, 0, 1);
  context.restore();
}

function drawCleanroomBackground(context, width, height) {
  const wall = context.createLinearGradient(0, 0, 0, height);
  wall.addColorStop(0, '#d9e8ef');
  wall.addColorStop(.72, '#f2f7f9');
  wall.addColorStop(1, '#c8d9e2');
  context.fillStyle = wall;
  context.fillRect(0, 0, width, height);
  context.fillStyle = 'rgba(255,255,255,.7)';
  context.fillRect(0, 0, width, 38);
  context.fillStyle = 'rgba(66, 119, 151, .12)';
  context.fillRect(0, height - 48, width, 48);
  context.strokeStyle = 'rgba(52, 99, 128, .17)';
  context.lineWidth = 2;
  for (let x = 0; x <= width; x += Math.max(100, width / 5)) { context.beginPath(); context.moveTo(x, 38); context.lineTo(x, height - 48); context.stroke(); }
  context.fillStyle = 'rgba(255,255,255,.9)';
  for (let x = 28; x < width; x += 120) { context.fillRect(x, 13, 70, 6); }
  context.strokeStyle = 'rgba(33, 78, 105, .28)';
  context.lineWidth = 3;
  context.beginPath(); context.moveTo(0, height - 48); context.lineTo(width, height - 48); context.stroke();
}

function drawBasket(context, basket) {
  context.save();
  context.fillStyle = '#294f72';
  context.strokeStyle = '#193b59';
  context.lineWidth = 3;
  roundedCanvasRect(context, basket.x, basket.y, basket.width, basket.height, 9);
  context.fill();
  context.stroke();
  context.fillStyle = '#b9d0df';
  context.fillRect(basket.x + 11, basket.y + 7, basket.width - 22, 5);
  context.restore();
}

function roundedCanvasRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function moveBasketFromPointer(event) {
  if (!gameState || !gameState.running) return;
  const canvas = document.querySelector('#gameCanvas');
  const rect = canvas.getBoundingClientRect();
  gameState.basket.x = Math.max(0, Math.min(rect.width - gameState.basket.width, event.clientX - rect.left - gameState.basket.width / 2));
}

function moveBasketFromKeyboard(event) {
  if (!gameState || !gameState.running) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  const canvas = document.querySelector('#gameCanvas');
  const width = canvas.getBoundingClientRect().width;
  gameState.basket.x = Math.max(0, Math.min(width - gameState.basket.width, gameState.basket.x + (event.key === 'ArrowLeft' ? -32 : 32)));
}

function updateGameHud() {
  const score = document.querySelector('#gameScore');
  const lives = document.querySelector('#gameLives');
  if (score) score.textContent = gameState.score;
  if (lives) lives.textContent = '♥'.repeat(Math.max(0, gameState.lives)) + '♡'.repeat(5 - Math.max(0, gameState.lives));
  if (gameState.lives < gameState.lastLives) {
    const lifeHud = document.querySelector('.game-life');
    if (lifeHud) { lifeHud.classList.remove('shake'); void lifeHud.offsetWidth; lifeHud.classList.add('shake'); }
  }
  gameState.lastLives = gameState.lives;
}

function endCatchGame() {
  if (!gameState) return;
  gameState.running = false;
  cancelAnimationFrame(gameFrame);
  gameFrame = null;
  const title = document.querySelector('#gameOverlayTitle');
  const text = document.querySelector('#gameOverlayText');
  const button = document.querySelector('#gameStartButton');
  const overlay = document.querySelector('#gameOverlay');
  if (title) title.textContent = '클린룸 게임 종료';
  if (text) text.textContent = `최종 점수 ${gameState.score}점 · 오염을 ${5 - gameState.lives}번 만났어요.`;
  if (button) button.textContent = '다시 시작';
  if (overlay) overlay.classList.remove('hidden');
}
