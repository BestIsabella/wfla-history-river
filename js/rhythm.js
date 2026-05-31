/** 世外雷霆肘击 · 音游 + 问答 */
const RhythmGame = {
  canvas: null,
  ctx: null,
  running: false,
  animId: null,

  lanes: 4,
  laneKeys: ['d', 'f', 'j', 'k'],
  laneX: [],

  notes: [],
  spawnTimer: 0,
  speed: 2.5,
  baseSpeed: 2.5,

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
  quizInterval: 1200,
  usedQuiz: [],

  judgeY: 340,
  hitWindow: 35,

  start() {
    this.canvas = document.getElementById('rhythmCanvas');
    this.ctx = this.canvas.getContext('2d');
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

    const w = this.canvas.width;
    const pad = 80;
    this.laneX = [];
    for (let i = 0; i < this.lanes; i++) {
      this.laneX.push(pad + (w - pad * 2) / (this.lanes - 1) * i);
    }

    this.hideQuiz();
    this.updateHUD();
    this.bindKeys();
    this.loop();
  },

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
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
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
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
        this.growth += 4 + this.combo * 0.2;
        this.score += 100 + this.combo * 10;
        this.spawnBuff(hit.lane);
      } else {
        this.hp -= 12;
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
    const isGood = Math.random() > 0.35;
    this.notes.push({
      lane,
      y: -20,
      type: isGood ? 'good' : 'bad',
      kind: isGood
        ? (Math.random() > 0.5 ? 'shrimp' : 'plankton')
        : (Math.random() > 0.5 ? 'shark' : 'net'),
      hit: false,
    });
  },

  spawnBuff(lane) {
    this.buffs.push({ x: this.laneX[lane], y: this.judgeY - 40, life: 30, emoji: '🦐' });
  },

  spawnHazard(lane, kind) {
    this.hazards.push({
      x: this.laneX[lane] + (Math.random() - 0.5) * 100,
      y: this.judgeY - 60,
      life: 40,
      emoji: kind === 'shark' ? '🦈' : '🕸️',
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
      this.speed = Math.max(1.5, this.speed - 0.3);
      this.spawnRandomBuffs(3);
      App.toast('✅ 答对了！小虾涌现，速度减缓');
    } else {
      this.hp -= 8;
      this.speed = Math.min(5, this.speed + 0.5);
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

  update() {
    if (this.quizActive) return;

    this.quizTimer++;
    if (this.quizTimer >= this.quizInterval) {
      this.quizTimer = 0;
      this.showQuiz();
      return;
    }

    this.spawnTimer++;
    if (this.spawnTimer > Math.max(15, 40 - this.speed * 5)) {
      this.spawnNote();
      this.spawnTimer = 0;
    }

    const spd = this.speed;
    for (const note of this.notes) {
      if (note.hit) continue;
      note.y += spd;
      if (note.y > this.canvas.height + 20 && !note.hit) {
        note.hit = true;
        if (note.type === 'good') {
          this.combo = 0;
        }
      }
    }
    this.notes = this.notes.filter(n => n.y < this.canvas.height + 30);

    this.buffs.forEach(b => { b.life--; b.y -= 0.5; });
    this.buffs = this.buffs.filter(b => b.life > 0);
    this.hazards.forEach(h => { h.life--; h.y += 0.3; });
    this.hazards = this.hazards.filter(h => h.life > 0);
  },

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#062530';
    ctx.fillRect(0, 0, w, h);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, 'rgba(26,107,122,0.3)');
    bgGrad.addColorStop(1, 'rgba(6,37,48,0.8)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    this.laneX.forEach((x, i) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.fillStyle = 'rgba(250,246,237,0.4)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.laneKeys[i].toUpperCase(), x, h - 10);
    });

    ctx.strokeStyle = 'rgba(232,197,71,0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(40, this.judgeY);
    ctx.lineTo(w - 40, this.judgeY);
    ctx.stroke();

    const fishSize = 20 + this.growth * 0.5;
    const fishX = w / 2;
    const fishY = this.judgeY - 80;
    ctx.font = `${fishSize}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🐟', fishX, fishY);

    for (const note of this.notes) {
      if (note.hit) continue;
      const x = this.laneX[note.lane];
      const emoji = note.type === 'good'
        ? (note.kind === 'shrimp' ? '🦐' : '🌿')
        : (note.kind === 'shark' ? '🦈' : '🕸️');
      ctx.font = '22px serif';
      ctx.fillText(emoji, x, note.y);
    }

    for (const b of this.buffs) {
      ctx.globalAlpha = b.life / 30;
      ctx.font = '18px serif';
      ctx.fillText(b.emoji, b.x, b.y);
    }
    for (const hz of this.hazards) {
      ctx.globalAlpha = hz.life / 40;
      ctx.font = '20px serif';
      ctx.fillText(hz.emoji, hz.x, hz.y);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(250,246,237,0.5)';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`速度: ${this.speed.toFixed(1)}x`, 15, 25);
  },

  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  },
};
