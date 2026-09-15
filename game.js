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
  if (window.photoGame?.timer) clearInterval(window.photoGame.timer);
  gameFrame = null;
  gameState = null;
}

function renderCatchGame() {
  stopGameLoop();
  shell(`<section class="game-page"><div class="game-heading"><div><span class="eyebrow">CLEANROOM CATCH</span><h1 class="section-title">클린룸 바구니 받기</h1><p class="small-title">오염은 피하고, 깨끗한 공정 아이템을 바구니에 담아보세요.</p></div><div class="game-rules"><span class="game-life">라이프 <strong id="gameLives">♥♥♥♥♥</strong></span><span class="game-score">점수 <strong id="gameScore">0</strong></span></div></div><div class="game-stage-wrap"><canvas id="gameCanvas" class="game-canvas" aria-label="오염을 피하고 공정 아이템을 받는 게임"></canvas><div class="game-overlay" id="gameOverlay"><div class="game-overlay-card"><span class="game-over-icon">✧</span><h2 id="gameOverlayTitle">준비됐나요?</h2><p id="gameOverlayText">화살표 키, 마우스 또는 손가락으로 바구니를 움직이세요.</p><button class="primary-btn" onclick="startCatchGame()" id="gameStartButton">게임 시작</button></div></div></div><div class="game-legend"><div><strong>피해야 할 오염</strong><span>${GAME_BAD_ITEMS.map(item => `<em class="legend-bad" style="--item-color:${item.color}">${item.icon} ${item.label}</em>`).join('')}</span></div><div><strong>받아도 되는 공정</strong><span>${GAME_GOOD_ITEMS.map(item => `<em class="legend-good" style="--item-color:${item.color}">${item.icon} ${item.label}</em>`).join('')}</span></div></div></section>`, 'game');
  resizeGameCanvas();
  window.addEventListener('resize', resizeGameCanvas);
  const canvas = document.querySelector('#gameCanvas');
  canvas.addEventListener('pointermove', moveBasketFromPointer);
  canvas.addEventListener('pointerdown', moveBasketFromPointer);
  document.addEventListener('keydown', moveBasketFromKeyboard);
}

const MINI_GAMES = [
  { id: 'defect', title: 'Defect Hunter', korean: '픽셀 불량 찾기', domain: 'display', tag: '디스플레이', description: '작은 불량 픽셀을 찾아 디스플레이 품질검사 감각을 익혀보세요.', icon: '▦' },
  { id: 'color', title: 'Color Engineer', korean: '색 맞추기', domain: 'display', tag: '디스플레이', description: 'RGB 값을 조절해 기준 색상과의 색차를 줄여보세요.', icon: '◉' },
  { id: 'line', title: 'Semiconductor Line', korean: '반도체 공정 순서', domain: 'semiconductor', tag: '반도체', description: '웨이퍼부터 검사까지 공정 카드를 올바른 순서로 배치하세요.', icon: '→' },
  { id: 'photo', title: '빛으로 회로를 그려라', korean: '포토 공정', domain: 'semiconductor', tag: '반도체', description: '마스크 패턴에 맞춰 노광점을 찍으며 포토리소그래피를 배워보세요.', icon: '✦' },
  { id: 'catch', title: 'Cleanroom Catch', korean: '클린룸 바구니 받기', domain: 'both', tag: '디스플레이 · 반도체', description: '오염은 피하고 깨끗한 공정 아이템을 바구니에 담아보세요.', icon: '♧' }
];

function renderGame(filter = 'all', fromHistory = false) {
  stopGameLoop();
  if (!fromHistory) history.pushState({ appPage: 'game', filter }, '', location.href);
  const games = MINI_GAMES.filter(game => filter === 'all' || game.domain === filter || game.domain === 'both');
  const filterButtons = [['all', '전체 게임'], ['display', '디스플레이'], ['semiconductor', '반도체']].map(([key, label]) => `<button class="game-filter ${filter === key ? 'active' : ''}" onclick="renderGame('${key}')">${label}</button>`).join('');
  const cards = games.map(game => `<article class="game-card"><div class="game-card-icon">${game.icon}</div><div class="game-card-content"><span class="game-card-tag ${game.domain}">${game.tag}</span><h2>${game.korean}</h2><p>${game.description}</p><button class="primary-btn" onclick="openMiniGame('${game.id}')">게임 시작</button></div></article>`).join('');
  shell(`<section class="game-hub"><div class="game-hub-heading"><div><span class="eyebrow">LEARNING ARCADE</span><h1 class="section-title">게임으로 배우는 산업 기초</h1><p class="small-title">디스플레이와 반도체 현장에서 만나는 품질·색·공정 개념을 가볍게 익혀보세요.</p></div></div><div class="game-filters" role="tablist" aria-label="게임 분야 선택">${filterButtons}</div><div class="game-card-grid">${cards}</div></section>`, filter === 'all' ? 'game' : filter === 'display' ? 'game-display' : 'game-semiconductor');
}

function openMiniGame(id, fromHistory = false) {
  if (!fromHistory) history.pushState({ appPage: 'mini', game: id }, '', location.href);
  if (id === 'catch') return renderCatchGame();
  if (id === 'defect') return renderDefectHunter();
  if (id === 'color') return renderColorEngineer();
  if (id === 'line') return renderSemiconductorLine();
  if (id === 'photo') return renderPhotoLithography();
}

function gameBackButton(domain) { return `<button class="ghost-btn" onclick="goBack()">뒤로 가기</button>`; }

function renderDefectHunter() {
  stopGameLoop();
  window.defectGame = { stage: 1, score: 0 };
  shell(`<section class="mini-game-page"><div class="mini-game-head"><div><span class="eyebrow">DEFECT HUNTER · 디스플레이</span><h1 class="section-title">픽셀 불량 찾기</h1><p class="small-title">스테이지마다 20초 안에 불량 픽셀 10개를 찾아보세요.</p></div><div class="mini-game-stats"><strong id="defectStage">STAGE 1</strong><strong id="defectScore">0점</strong><span id="defectTimer">20초</span></div></div><div class="defect-board" id="defectBoard"></div><p class="game-feedback" id="defectFeedback">불량 픽셀 10개를 찾아 클릭하세요.</p><div class="mini-game-footer"><span>불량 유형: Dead Pixel · Bright Pixel · Line Defect · Mura</span>${gameBackButton('display')}</div></section>`, 'game-display');
  startDefectRound(1);
}

function startDefectRound(stage = 1) {
  const board = document.querySelector('#defectBoard');
  const score = document.querySelector('#defectScore');
  const timer = document.querySelector('#defectTimer');
  if (!board) return;
  const stageSettings = [{ columns: 18, rows: 10 }, { columns: 24, rows: 12 }, { columns: 30, rows: 14 }];
  const { columns, rows } = stageSettings[Math.min(stage - 1, stageSettings.length - 1)];
  const totalPixels = columns * rows;
  const targetCount = 10;
  const previousScore = window.defectGame?.score || 0;
  const defectIndexes = shuffle(Array.from({ length: totalPixels }, (_, index) => index)).slice(0, targetCount);
  const types = [{ name: 'Dead Pixel', className: 'dead', points: 30 }, { name: 'Bright Pixel', className: 'bright', points: 25 }, { name: 'Line Defect', className: 'line', points: 20 }, { name: 'Mura', className: 'mura', points: 40 }];
  const defects = Object.fromEntries(defectIndexes.map(index => [index, types[Math.floor(Math.random() * types.length)]]));
  let seconds = 20;
  board.style.setProperty('--defect-columns', columns);
  board.style.setProperty('--defect-rows', rows);
  board.innerHTML = Array.from({ length: totalPixels }, (_, index) => `<button class="pixel ${defects[index]?.className || ''}" aria-label="픽셀 ${index + 1}" onclick="selectDefectPixel(${index})"></button>`).join('');
  window.defectGame = { seconds, score: previousScore, stage, found: 0, target: targetCount, defects, interval: setInterval(() => { seconds -= 1; window.defectGame.seconds = seconds; if (timer) timer.textContent = `${seconds}초`; if (seconds <= 0) { clearInterval(window.defectGame.interval); board.classList.add('defect-failed'); const feedback = document.querySelector('#defectFeedback'); if (feedback) feedback.textContent = `시간 초과. ${window.defectGame.found}/${targetCount}개를 찾았습니다. 다시 도전하세요.`; } }, 1000) };
  const stageLabel = document.querySelector('#defectStage');
  if (stageLabel) stageLabel.textContent = `STAGE ${stage}`;
  if (score) score.textContent = `${previousScore}점`;
}

function selectDefectPixel(index) {
  if (!window.defectGame) return;
  const defect = window.defectGame.defects[index];
  if (defect) { window.defectGame.found += 1; window.defectGame.score += defect.points; const score = document.querySelector('#defectScore'); const feedback = document.querySelector('#defectFeedback'); const pixel = document.querySelectorAll('.pixel')[index]; if (pixel) { pixel.classList.add('pixel-found'); pixel.disabled = true; } if (score) score.textContent = `${window.defectGame.score}점`; if (window.defectGame.found >= window.defectGame.target) { clearInterval(window.defectGame.interval); document.querySelector('#defectBoard').classList.add('defect-success'); if (feedback) feedback.textContent = `스테이지 ${window.defectGame.stage} 클리어! 다음 스테이지를 준비하세요.`; setTimeout(() => startDefectRound(window.defectGame.stage + 1), 900); } else if (feedback) feedback.textContent = `불량 발견 ${window.defectGame.found}/${window.defectGame.target} · ${defect.name} +${defect.points}점`; } else { const board = document.querySelector('#defectBoard'); const feedback = document.querySelector('#defectFeedback'); board.classList.remove('defect-wrong'); void board.offsetWidth; board.classList.add('defect-wrong'); if (feedback) feedback.textContent = `여기는 정상 픽셀입니다. ${window.defectGame.found}/${window.defectGame.target}개 발견`; }
}

function renderColorEngineer(level = 1) {
  stopGameLoop();
  const target = [40 + Math.floor(Math.random() * 180), 70 + Math.floor(Math.random() * 150), 100 + Math.floor(Math.random() * 130)];
  const initial = target.map((value, index) => Math.max(0, Math.min(255, value + [35, -25, 20][index])));
  window.colorGame = { level, target, completed: false };
  shell(`<section class="mini-game-page"><div class="mini-game-head"><div><span class="eyebrow">COLOR ENGINEER · 디스플레이</span><h1 class="section-title">색 맞추기 <small>LEVEL ${level}</small></h1><p class="small-title">RGB 슬라이더로 기준 색상과 현재 패널을 최대한 비슷하게 만들어보세요.</p></div></div><div class="color-game"><div class="color-swatches"><div><span>기준 색상</span><div class="color-swatch" style="background:rgb(${target.join(',')})"></div></div><div><span>현재 패널</span><div class="color-swatch" id="currentColor"></div></div></div><div class="rgb-controls">${['R','G','B'].map((label, index) => `<label>${label}<input type="range" min="0" max="255" value="${initial[index]}" oninput="updateColorGame(${index}, this.value, [${target.join(',')}])" /><output id="rgbValue${index}"></output></label>`).join('')}</div><div class="delta-score">색차 ΔE 근사값 <strong id="deltaE">--</strong><span id="colorNotice"></span></div><button class="primary-btn" id="nextColorButton" disabled onclick="renderColorEngineer(${level + 1})">다음 레벨</button></div><div class="mini-game-footer"><span>공부 포인트: RGB · 색좌표 · 색차(ΔE) · Color Calibration</span>${gameBackButton('display')}</div></section>`, 'game-display');
  [0, 1, 2].forEach(index => updateColorGame(index, document.querySelectorAll('.rgb-controls input')[index].value, target));
}

function updateColorGame(index, value, target) {
  const inputs = [...document.querySelectorAll('.rgb-controls input')];
  if (!inputs.length) return;
  inputs[index].value = value;
  inputs.forEach((input, current) => { const output = document.querySelector(`#rgbValue${current}`); if (output) output.textContent = input.value; });
  const rgb = inputs.map(input => Number(input.value));
  const delta = Math.sqrt(rgb.reduce((sum, value, current) => sum + (value - target[current]) ** 2, 0));
  const swatch = document.querySelector('#currentColor'); if (swatch) swatch.style.background = `rgb(${rgb.join(',')})`;
  const score = document.querySelector('#deltaE'); if (score) score.textContent = delta.toFixed(1);
  if (window.colorGame && !window.colorGame.completed && delta <= 10) { window.colorGame.completed = true; const button = document.querySelector('#nextColorButton'); const notice = document.querySelector('#colorNotice'); if (button) button.disabled = false; if (notice) { notice.textContent = delta === 0 ? 'Perfect!' : 'Good!'; notice.className = delta === 0 ? 'perfect-pop' : 'good-pop'; setTimeout(() => { if (notice) notice.textContent = ''; }, 1100); } }
}

function renderSemiconductorLine() {
  stopGameLoop();
  const answer = ['웨이퍼', '산화', '포토', '식각', '증착', '이온주입', '금속배선', '검사'];
  const shuffled = [...answer].sort(() => Math.random() - .5);
  shell(`<section class="mini-game-page"><div class="mini-game-head"><div><span class="eyebrow">SEMICONDUCTOR LINE · 반도체</span><h1 class="section-title">반도체 공정 순서 맞추기</h1><p class="small-title">카드의 위·아래 화살표를 누르거나 드래그해 공정 순서를 완성하세요.</p></div></div><div class="process-game"><div class="process-list" id="processList">${shuffled.map((item, index) => `<div class="process-card" draggable="true" data-process="${item}"><span class="process-number">${index + 1}. ${item}</span><span class="process-arrows"><button type="button" aria-label="위로 이동" onclick="moveProcessCard(this, -1)">↑</button><button type="button" aria-label="아래로 이동" onclick="moveProcessCard(this, 1)">↓</button></span></div>`).join('')}</div><button class="primary-btn" onclick="checkProcessOrder([${answer.map(item => `'${item}'`).join(',')}])">순서 확인</button><p id="processFeedback" class="game-feedback">웨이퍼에서 검사까지 흐름을 생각해보세요.</p></div><div class="mini-game-footer"><span>확장 포인트: 포토 공정은 PR 도포 → 노광 → 현상으로 이어집니다.</span>${gameBackButton('semiconductor')}</div></section>`, 'game-semiconductor');
  enableProcessDrag();
}

function refreshProcessCards() { document.querySelectorAll('.process-card').forEach((card, index) => { card.querySelector('.process-number').textContent = `${index + 1}. ${card.dataset.process}`; }); }
function moveProcessCard(button, direction) { const card = button.closest('.process-card'); const list = document.querySelector('#processList'); if (!card || !list) return; const sibling = direction < 0 ? card.previousElementSibling : card.nextElementSibling; if (!sibling) return; if (direction < 0) list.insertBefore(card, sibling); else list.insertBefore(sibling, card); refreshProcessCards(); }
function enableProcessDrag() { const list = document.querySelector('#processList'); if (!list) return; let dragged; list.addEventListener('dragstart', event => { dragged = event.target.closest('.process-card'); if (dragged) dragged.classList.add('dragging'); }); list.addEventListener('dragend', () => { if (dragged) dragged.classList.remove('dragging'); }); list.addEventListener('dragover', event => event.preventDefault()); list.addEventListener('drop', event => { event.preventDefault(); const target = event.target.closest('.process-card'); if (target && dragged && dragged !== target) { list.insertBefore(dragged, target); refreshProcessCards(); } }); }
function checkProcessOrder(answer) { const current = [...document.querySelectorAll('.process-card')].map(card => card.dataset.process); const feedback = document.querySelector('#processFeedback'); const correct = current.every((item, index) => item === answer[index]); if (feedback) { feedback.textContent = correct ? '정답입니다! 공정 흐름을 완성했어요.' : '아직 순서가 달라요. 앞뒤 공정의 목적을 다시 생각해보세요.'; feedback.className = `game-feedback ${correct ? 'success' : 'error'}`; } }

function renderPhotoLithography() {
  stopGameLoop();
  const level = window.photoGame?.level || 1;
  shell(`<section class="mini-game-page"><div class="mini-game-head"><div><span class="eyebrow">PHOTO LITHOGRAPHY · 반도체</span><h1 class="section-title">빛으로 회로를 그려라 <small>LEVEL ${level}</small></h1><p class="small-title">마스크 패턴을 마우스나 손가락으로 드래그해 한 번에 그려보세요.</p></div><div class="mini-game-stats"><strong id="photoScore">0%</strong><span id="photoTimer">30초</span></div></div><div class="photo-game"><canvas id="photoCanvas" class="photo-canvas" aria-label="포토 공정 패턴 노광 드로잉 게임"></canvas><div class="photo-controls"><span id="photoStage">패턴을 따라 선을 그려 노광하세요.</span><button class="primary-btn" id="nextPhotoButton" disabled onclick="nextPhotoLevel()">다음 스테이지</button><button class="ghost-btn" onclick="resetPhotoGame()">처음부터</button></div></div><div class="mini-game-footer"><span>공부 포인트: 포토레지스트 · 마스크 · 노광 · 패터닝</span>${gameBackButton('semiconductor')}</div></section>`, 'game-semiconductor');
  setupPhotoGame(level);
}

function setupPhotoGame(level = 1) { const canvas = document.querySelector('#photoCanvas'); if (!canvas) return; const patterns = [[[120, 105], [260, 105], [400, 105], [400, 235], [260, 235]], [[120, 90], [230, 90], [230, 180], [350, 180], [350, 270], [500, 270]], [[100, 85], [220, 85], [220, 150], [300, 150], [300, 85], [460, 85], [460, 270], [150, 270]]]; canvas.width = 640; canvas.height = 360; window.photoGame = { level, target: patterns[Math.min(level - 1, patterns.length - 1)], stroke: [], drawing: false, completed: false, seconds: 30, timer: setInterval(photoTick, 1000) }; canvas.onpointerdown = event => { window.photoGame.drawing = true; window.photoGame.stroke = [photoPoint(event)]; drawPhotoGame(); }; canvas.onpointermove = event => { if (!window.photoGame?.drawing) return; window.photoGame.stroke.push(photoPoint(event)); drawPhotoGame(); }; canvas.onpointerup = finishPhotoStroke; canvas.onpointerleave = finishPhotoStroke; drawPhotoGame(); }
function photoPoint(event) { const canvas = document.querySelector('#photoCanvas'); const rect = canvas.getBoundingClientRect(); return [(event.clientX - rect.left) * canvas.width / rect.width, (event.clientY - rect.top) * canvas.height / rect.height]; }
function finishPhotoStroke() { if (!window.photoGame?.drawing) return; window.photoGame.drawing = false; const target = window.photoGame.target; const hitCount = target.filter(point => window.photoGame.stroke.some(stroke => Math.hypot(point[0] - stroke[0], point[1] - stroke[1]) < 42)).length; const percent = Math.round(hitCount / target.length * 100); const score = document.querySelector('#photoScore'); const stage = document.querySelector('#photoStage'); if (score) score.textContent = `${percent}%`; if (percent >= 75) { window.photoGame.completed = true; clearInterval(window.photoGame.timer); const next = document.querySelector('#nextPhotoButton'); if (next) next.disabled = false; if (stage) stage.textContent = '패턴 완성! 다음 스테이지로 이동할 수 있습니다.'; } else if (stage) stage.textContent = '패턴과 조금 달라요. 다시 드래그해보세요.'; drawPhotoGame(); }
function photoTick() { if (!window.photoGame || window.photoGame.completed) return; window.photoGame.seconds -= 1; const timer = document.querySelector('#photoTimer'); if (timer) timer.textContent = `${window.photoGame.seconds}초`; if (window.photoGame.seconds <= 0) { clearInterval(window.photoGame.timer); const stage = document.querySelector('#photoStage'); if (stage) stage.textContent = '시간 초과. 다시 그려보세요.'; } }
function nextPhotoLevel() { if (!window.photoGame?.completed) return; renderPhotoLithographyLevel(window.photoGame.level + 1); }
function renderPhotoLithographyLevel(level) { window.photoGame = { level }; renderPhotoLithography(); }
function drawPhotoGame() { const canvas = document.querySelector('#photoCanvas'); if (!canvas || !window.photoGame) return; const context = canvas.getContext('2d'); context.fillStyle = '#d9e8ef'; context.fillRect(0, 0, canvas.width, canvas.height); context.fillStyle = '#8fb0bd'; context.beginPath(); context.arc(320, 185, 142, 0, Math.PI * 2); context.fill(); context.strokeStyle = '#edf8fb'; context.lineWidth = 9; context.beginPath(); window.photoGame.target.forEach((point, index) => index ? context.lineTo(point[0], point[1]) : context.moveTo(point[0], point[1])); context.stroke(); context.strokeStyle = '#2f6599'; context.lineWidth = 7; context.lineCap = 'round'; context.lineJoin = 'round'; context.beginPath(); window.photoGame.stroke.forEach((point, index) => index ? context.lineTo(point[0], point[1]) : context.moveTo(point[0], point[1])); context.stroke(); }
function resetPhotoGame() { renderPhotoLithographyLevel(1); }

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
