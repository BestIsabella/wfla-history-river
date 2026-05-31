/** 世外雷霆肘击 · 音游 + 问答 */
const RhythmGame = {
  canvas: null,
  ctx: null,
  fishCanvas: null,
  fishCtx: null,
  fishLayoutW: 260,
  fishLayoutH: 200,
  fishPhase: 0,
  running: false,
  animId: null,
  layoutW: 960,
  layoutH: 540,
  dpr: 1,

  lanes: 4,
  laneKeys: ['d', 'f', 'j', 'k'],
  laneX: [],

  notes: [],
  spawnTimer: 0,
  speed: 1.65,
  baseSpeed: 1.65,

  hp: 100,
  maxHp: 100,
  growth: 0,
  targetGrowth: 100,
  combo: 0,
  score: 0,

  hazards: [],
  buffs: [],

  quizActive: false,
  quizTimer: 0,
  quizInterval: 2100,
  usedQuiz: [],

  judgeY: 420,
  hitWindow: 48,


  resizeCanvas() {
    const container = this.canvas.parentElement;
    const containerW = container ? container.clientWidth : 900;
    const w = Math.floor(Math.min(1000, Math.max(640, containerW)));
    const h = Math.floor(w * 0.6);
    const dpr = window.devicePixelRatio || 1;

    this.layoutW = w;
    this.layoutH = h;
    this.dpr = dpr;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;

    this.judgeY = h * 0.78;
    this.hitWindow = 50;

    const pad = w * 0.11;
    this.laneX = [];
    for (let i = 0; i < this.lanes; i++) {
      this.laneX.push(pad + ((w - pad * 2) / (this.lanes - 1)) * i);
    }
    this.resizeFishCanvas();
  },

  resizeFishCanvas() {
    const canvas = document.getElementById('rhythmFishCanvas');
    if (!canvas) return;
    const w = 260;
    const h = 200;
    const dpr = window.devicePixelRatio || 1;
    this.fishCanvas = canvas;
    this.fishLayoutW = w;
    this.fishLayoutH = h;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    this.fishCtx = canvas.getContext('2d');
    this.fishCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.fishCtx.imageSmoothingEnabled = true;
  },

  start() {
    this.canvas = document.getElementById('rhythmCanvas');
    this.resizeCanvas();

    this.running = true;
    this.notes = [];
    this.hazards = [];
    this.buffs = [];
    this.hp = 100;
    this.growth = 0;
    this.combo = 0;
    this.score = 0;
    this.speed = this.baseSpeed;
    this.spawnTimer = 0;
    this.quizTimer = 0;
    this.quizActive = false;
    this.usedQuiz = [];
    this.fishPhase = 0;

    this._onResize = () => {
      if (this.running) this.resizeCanvas();
    };
    window.addEventListener('resize', this._onResize);

    this.hideQuiz();
    this.updateHUD();
    this.bindKeys();
    this.loop();
  },

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this._onResize);
    this.unbindKeys();
  },

  bindKeys() {
    this._keydown = (e) => {
      if (this.quizActive) return;
      const key = e.key.toLowerCase();
      const lane = this.laneKeys.indexOf(key);
      if (lane >= 0) this.hitLane(lane);
    };
    this._click = (e) => {
      if (this.quizActive) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.layoutW / rect.width);
      let bestLane = 0, bestDist = Infinity;
      this.laneX.forEach((lx, i) => {
        const d = Math.abs(x - lx);
        if (d < bestDist) { bestDist = d; bestLane = i; }
      });
      this.hitLane(bestLane);
    };
    window.addEventListener('keydown', this._keydown);
    this.canvas.addEventListener('click', this._click);
  },

  unbindKeys() {
    window.removeEventListener('keydown', this._keydown);
    if (this.canvas) this.canvas.removeEventListener('click', this._click);
  },

  hitLane(lane) {
    let hit = null, bestDist = this.hitWindow;
    for (const note of this.notes) {
      if (note.lane !== lane || note.hit) continue;
      const dist = Math.abs(note.y - this.judgeY);
      if (dist < bestDist) { bestDist = dist; hit = note; }
    }

    if (hit) {
      hit.hit = true;
      this.combo++;
      if (hit.type === 'good') {
        this.growth += 5 + this.combo * 0.25;
        this.score += 100 + this.combo * 10;
        this.spawnBuff(hit.lane);
      } else {
        this.hp -= 10;
        this.combo = 0;
        this.score += 20;
        this.spawnHazard(hit.lane, hit.kind);
      }
    } else {
      this.combo = 0;
    }

    this.updateHUD();
    this.checkWinLose();
  },

  spawnNote() {
    const lane = Math.floor(Math.random() * this.lanes);
    const isGood = Math.random() > 0.38;
    this.notes.push({
      lane,
      y: -40,
      type: isGood ? 'good' : 'bad',
      kind: isGood
        ? (Math.random() > 0.5 ? 'shrimp' : 'plankton')
        : (Math.random() > 0.5 ? 'shark' : 'net'),
      hit: false,
    });
  },

  spawnBuff(lane) {
    this.buffs.push({ x: this.laneX[lane], y: this.judgeY - 55, life: 30 });
  },

  spawnHazard(lane, kind) {
    this.hazards.push({
      x: this.laneX[lane] + (Math.random() - 0.5) * 60,
      y: this.judgeY - 75,
      life: 40,
      kind,
    });
  },

  spawnRandomHazards(count) {
    for (let i = 0; i < count; i++) {
      const lane = Math.floor(Math.random() * this.lanes);
      this.spawnHazard(lane, Math.random() > 0.5 ? 'shark' : 'net');
    }
  },

  spawnRandomBuffs(count) {
    for (let i = 0; i < count; i++) {
      const lane = Math.floor(Math.random() * this.lanes);
      this.spawnBuff(lane);
    }
  },

  showQuiz() {
    this.quizActive = true;
    let available = WFLA_DATA.quizzes.filter((_, i) => !this.usedQuiz.includes(i));
    if (available.length === 0) {
      this.usedQuiz = [];
      available = WFLA_DATA.quizzes;
    }
    const idx = Math.floor(Math.random() * available.length);
    const qIndex = WFLA_DATA.quizzes.indexOf(available[idx]);
    this.usedQuiz.push(qIndex);
    const q = WFLA_DATA.quizzes[qIndex];

    const box = document.getElementById('quizBox');
    box.classList.remove('hidden');
    document.getElementById('quizQuestion').textContent = q.q;
    const optsEl = document.getElementById('quizOptions');
    optsEl.innerHTML = '';

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.textContent = opt;
      btn.onclick = () => this.answerQuiz(i === q.answer);
      optsEl.appendChild(btn);
    });
  },

  answerQuiz(correct) {
    this.hideQuiz();
    if (correct) {
      this.growth += 8;
      this.speed = Math.max(1.2, this.speed - 0.25);
      this.spawnRandomBuffs(3);
      App.toast('✅ 答对了！小虾涌现，速度减缓');
    } else {
      this.hp -= 6;
      this.speed = Math.min(2.8, this.speed + 0.35);
      this.spawnRandomHazards(2);
      App.toast('❌ 答错了！鲨鱼来袭，速度加快');
    }
    this.updateHUD();
    this.checkWinLose();
  },

  hideQuiz() {
    this.quizActive = false;
    document.getElementById('quizBox').classList.add('hidden');
  },

  updateHUD() {
    document.getElementById('hpFill').style.width = `${Math.max(0, this.hp)}%`;
    document.getElementById('hpText').textContent = Math.max(0, Math.round(this.hp));
    document.getElementById('sizeFill').style.width = `${Math.min(100, this.growth)}%`;
    document.getElementById('sizeText').textContent = Math.min(100, Math.round(this.growth));
    const pondGrowth = document.getElementById('fishPondGrowth');
    if (pondGrowth) pondGrowth.textContent = Math.min(100, Math.round(this.growth));
    document.getElementById('comboText').textContent = this.combo;
    document.getElementById('rhythmScore').textContent = this.score;
  },

  checkWinLose() {
    if (this.growth >= this.targetGrowth) {
      this.stop();
      App.onVictory(this.score + App.state.fishScore);
    } else if (this.hp <= 0) {
      this.stop();
      App.toast('💀 鱼儿阵亡！请加强世外知识或反应力后重试');
      setTimeout(() => this.start(), 1200);
    }
  },

  spawnInterval() {
    return Math.max(32, 58 - this.speed * 8);
  },

  /** 在 (x,y) 绘制矢量图标，scale 约 1，清晰不依赖 emoji */
  drawGlyph(ctx, x, y, kind, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    const drawers = {
      shrimp: this.drawShrimpIcon,
      plankton: this.drawPlanktonIcon,
      shark: this.drawSharkIcon,
      net: this.drawNetIcon,
    };
    (drawers[kind] || drawers.shrimp).call(this, ctx);
    ctx.restore();
  },

  drawShrimpIcon(ctx) {
    const g = ctx.createLinearGradient(-20, -8, 22, 8);
    g.addColorStop(0, '#ff9a6e');
    g.addColorStop(0.5, '#ff6b6b');
    g.addColorStop(1, '#e85d5d');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-18, 2);
    ctx.quadraticCurveTo(-8, -10, 8, -6);
    ctx.quadraticCurveTo(20, -2, 22, 4);
    ctx.quadraticCurveTo(14, 10, 0, 8);
    ctx.quadraticCurveTo(-12, 6, -18, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-26, -6);
    ctx.moveTo(-20, 2);
    ctx.lineTo(-26, 8);
    ctx.strokeStyle = '#ffccaa';
    ctx.stroke();

    ctx.fillStyle = '#fff5e6';
    ctx.beginPath();
    ctx.moveTo(-14, -2);
    ctx.lineTo(-22, -8);
    ctx.lineTo(-20, -2);
    ctx.lineTo(-24, 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1a2832';
    ctx.beginPath();
    ctx.arc(10, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    for (let i = -6; i <= 8; i += 5) {
      ctx.strokeStyle = 'rgba(192,57,43,0.35)';
      ctx.beginPath();
      ctx.moveTo(i, -2);
      ctx.lineTo(i + 2, 6);
      ctx.stroke();
    }
  },

  drawPlanktonIcon(ctx) {
    const drawLeaf = (ox, oy, rot, color) => {
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(rot);
      ctx.fillStyle = color;
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(8, -4, 14, 0);
      ctx.quadraticCurveTo(8, 14, 0, 18);
      ctx.quadraticCurveTo(-8, 14, -14, 0);
      ctx.quadraticCurveTo(-8, -4, 0, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawLeaf(0, 0, 0, '#34d399');
    drawLeaf(-6, 4, 0.5, '#6ee7b7');
    drawLeaf(6, 3, -0.4, '#10b981');
    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.arc(0, 8, 4, 0, Math.PI * 2);
    ctx.fill();
  },

  drawSharkIcon(ctx) {
    const g = ctx.createLinearGradient(-22, 0, 20, 0);
    g.addColorStop(0, '#64748b');
    g.addColorStop(0.5, '#94a3b8');
    g.addColorStop(1, '#475569');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-20, 4);
    ctx.quadraticCurveTo(-10, -8, 6, -6);
    ctx.lineTo(22, -10);
    ctx.lineTo(18, -2);
    ctx.quadraticCurveTo(8, 6, -4, 8);
    ctx.quadraticCurveTo(-14, 10, -20, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(4, -8);
    ctx.lineTo(8, -16);
    ctx.lineTo(12, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(12, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(13, -2, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(-8, 6);
    ctx.lineTo(-14, 12);
    ctx.moveTo(0, 7);
    ctx.lineTo(-2, 14);
    ctx.stroke();
  },

  drawNetIcon(ctx) {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.8;
    ctx.fillStyle = 'rgba(148,163,184,0.15)';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let i = -16; i <= 16; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, -18);
      ctx.lineTo(i, 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-18, i);
      ctx.lineTo(18, i);
      ctx.stroke();
    }
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(-4, -22);
    ctx.lineTo(0, -28);
    ctx.lineTo(4, -22);
    ctx.closePath();
    ctx.fill();
  },

  /** 侧栏鱼池：精致矢量锦鲤，与钓鱼模块风格一致 */
  drawPondFish(ctx, cx, cy, size, phase, vitality) {
    const bob = Math.sin(phase) * 5;
    const sway = Math.sin(phase * 0.65) * 0.06;
    const tailWave = Math.sin(phase * 1.4) * 0.15;
    const s = size / 58;
    const hurt = vitality < 0.35;

    ctx.save();
    ctx.translate(cx, cy + bob);
    ctx.rotate(sway);
    ctx.scale(s, s);

    const glow = ctx.createRadialGradient(0, 12, 0, 0, 12, 52);
    glow.addColorStop(0, hurt ? 'rgba(248,113,113,0.12)' : 'rgba(126,232,250,0.22)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(0, 10, 50, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(-38, 0);
    ctx.rotate(tailWave);
    const tailG = ctx.createLinearGradient(0, 0, -28, 0);
    tailG.addColorStop(0, hurt ? '#7eb8c4' : '#4db8c9');
    tailG.addColorStop(1, hurt ? '#5a8a94' : '#1a6b7a');
    ctx.fillStyle = tailG;
    ctx.strokeStyle = 'rgba(26,40,50,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-22, -16, -30, -4);
    ctx.quadraticCurveTo(-24, 0, -30, 4);
    ctx.quadraticCurveTo(-22, 16, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    const bodyG = ctx.createLinearGradient(-34, -12, 36, 14);
    if (hurt) {
      bodyG.addColorStop(0, '#8aa8b0');
      bodyG.addColorStop(0.45, '#c5d4d8');
      bodyG.addColorStop(1, '#9aaeb5');
    } else {
      bodyG.addColorStop(0, '#2d8a9a');
      bodyG.addColorStop(0.35, '#7ee8fa');
      bodyG.addColorStop(0.7, '#f5f0e8');
      bodyG.addColorStop(1, '#e8c547');
    }
    ctx.fillStyle = bodyG;
    ctx.strokeStyle = 'rgba(26, 40, 50, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(-4, 6, 22, 7, 0.1, 0, Math.PI * 2);
    ctx.fill();

    if (!hurt) {
      ctx.strokeStyle = 'rgba(232,197,71,0.55)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-20, 2);
      ctx.quadraticCurveTo(0, 8, 24, 0);
      ctx.stroke();
    }

    for (let i = -18; i <= 16; i += 9) {
      ctx.strokeStyle = 'rgba(26,107,122,0.18)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(i, -2, 5, 0.4, Math.PI - 0.4);
      ctx.stroke();
    }

    ctx.fillStyle = hurt ? 'rgba(148,163,184,0.5)' : 'rgba(77,184,201,0.45)';
    ctx.beginPath();
    ctx.moveTo(-6, -16);
    ctx.quadraticCurveTo(4, -24, 14, -16);
    ctx.quadraticCurveTo(6, -12, -6, -16);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, 6);
    ctx.quadraticCurveTo(18, 14, 8, 16);
    ctx.quadraticCurveTo(2, 12, 10, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-8, 8);
    ctx.quadraticCurveTo(-2, 16, -12, 14);
    ctx.fill();

    const eyeX = 22;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(eyeX, -3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a2832';
    ctx.beginPath();
    ctx.arc(eyeX + 1.5, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(eyeX - 1, -4.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    if (!hurt && this.combo >= 5) {
      ctx.fillStyle = 'rgba(232,197,71,0.9)';
      for (let i = 0; i < 3; i++) {
        const a = phase + i * 2.1;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 8 - 50, Math.sin(a) * 6 - 20, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  },

  drawFishPond() {
    const ctx = this.fishCtx;
    if (!ctx) return;
    const w = this.fishLayoutW;
    const h = this.fishLayoutH;

    const water = ctx.createLinearGradient(0, 0, 0, h);
    water.addColorStop(0, '#0a3d4c');
    water.addColorStop(0.55, '#062530');
    water.addColorStop(1, '#041a22');
    ctx.fillStyle = water;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 4; i++) {
      const y = 40 + i * 38 + Math.sin(this.fishPhase + i) * 6;
      ctx.strokeStyle = `rgba(126,232,250,${0.04 + i * 0.02})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 24) {
        ctx.quadraticCurveTo(x + 12, y + Math.sin(x * 0.05 + this.fishPhase) * 4, x + 24, y);
      }
      ctx.stroke();
    }

    const size = 44 + this.growth * 0.55;
    const vitality = this.hp / this.maxHp;
    this.drawPondFish(ctx, w / 2, h * 0.52, size, this.fishPhase, vitality);

    ctx.fillStyle = 'rgba(250,246,237,0.45)';
    ctx.font = '11px PingFang SC, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(vitality < 0.35 ? '鱼儿受伤…' : '随波养大', w / 2, h - 12);
  },

  update() {
    if (this.quizActive) return;

    this.quizTimer++;
    if (this.quizTimer >= this.quizInterval) {
      this.quizTimer = 0;
      this.showQuiz();
      return;
    }

    this.spawnTimer++;
    if (this.spawnTimer > this.spawnInterval()) {
      this.spawnNote();
      this.spawnTimer = 0;
    }

    const spd = this.speed;
    const h = this.layoutH;
    for (const note of this.notes) {
      if (note.hit) continue;
      note.y += spd;
      if (note.y > h + 40 && !note.hit) {
        note.hit = true;
        if (note.type === 'good') this.combo = 0;
      }
    }
    this.notes = this.notes.filter(n => n.y < h + 50);

    this.buffs.forEach(b => { b.life--; b.y -= 0.4; });
    this.buffs = this.buffs.filter(b => b.life > 0);
    this.hazards.forEach(hz => { hz.life--; hz.y += 0.25; });
    this.hazards = this.hazards.filter(hz => hz.life > 0);
  },

  draw() {
    const ctx = this.ctx;
    const w = this.layoutW;
    const h = this.layoutH;
    const padX = w * 0.06;

    ctx.fillStyle = '#062530';
    ctx.fillRect(0, 0, w, h);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, 'rgba(26,107,122,0.4)');
    bgGrad.addColorStop(1, 'rgba(6,37,48,0.9)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    this.laneX.forEach((x, i) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h - 36);
      ctx.stroke();
      ctx.setLineDash([]);

      const kw = 40;
      const kh = 30;
      ctx.fillStyle = 'rgba(232,197,71,0.3)';
      ctx.fillRect(x - kw / 2, h - 34, kw, kh);
      ctx.fillStyle = '#f5e6a3';
      ctx.font = 'bold 18px PingFang SC, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.laneKeys[i].toUpperCase(), x, h - 19);
    });

    ctx.strokeStyle = 'rgba(232,197,71,0.85)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(padX, this.judgeY);
    ctx.lineTo(w - padX, this.judgeY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(232,197,71,0.12)';
    ctx.fillRect(padX, this.judgeY - this.hitWindow, w - padX * 2, this.hitWindow * 2);

    const noteScale = 1.15;
    for (const note of this.notes) {
      if (note.hit) continue;
      this.drawGlyph(ctx, this.laneX[note.lane], note.y, note.kind, noteScale);
    }

    for (const b of this.buffs) {
      ctx.globalAlpha = b.life / 30;
      this.drawGlyph(ctx, b.x, b.y, 'shrimp', noteScale * 0.9);
    }
    for (const hz of this.hazards) {
      ctx.globalAlpha = hz.life / 40;
      this.drawGlyph(ctx, hz.x, hz.y, hz.kind || 'shark', noteScale * 0.95);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(250,246,237,0.6)';
    ctx.font = '14px PingFang SC, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`速度 ${this.speed.toFixed(1)}x`, 16, 28);
    ctx.textAlign = 'center';
    ctx.fillText('↓ 落至金线时按键', w / 2, 28);
  },

  loop() {
    if (!this.running) return;
    this.update();
    this.fishPhase += 0.055;
    this.draw();
    this.drawFishPond();
    this.animId = requestAnimationFrame(() => this.loop());
  },
};
