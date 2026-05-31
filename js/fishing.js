/** 小猫雷霆钓鱼游戏 */
const FishingGame = {
  canvas: null,
  ctx: null,
  running: false,
  year: 2005,
  bucket: [],
  score: 0,
  fishes: [],
  hook: { x: 100, y: 60, targetX: 100, targetY: 60, state: 'idle', speed: 9, reelSpeed: 11 },
  cat: { x: 100, bob: 0 },
  liftFish: null,
  particles: [],
  pendingComplete: false,
  historyUsedKeys: [],
  historyPaused: false,
  spawnTimer: 0,
  animId: null,
  _spaceHandler: null,

  init() {
    this.canvas = document.getElementById('fishingCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.renderBucketSlots();
    this.canvas.addEventListener('click', (e) => this.castHook(e));
    this._spaceHandler = (e) => {
      if (e.code === 'Space' && App.state.fishingUnlocked) {
        const screen = document.getElementById('screen-fishing');
        if (screen && screen.classList.contains('active')) {
          e.preventDefault();
          this.reelIn();
        }
      }
    };
    window.addEventListener('keydown', this._spaceHandler);
  },

  getRodTip() {
    const h = this.canvas ? this.canvas.height : 400;
    const boatY = h * 0.32 + Math.sin(this.cat.bob) * 4;
    return { x: this.cat.x + 20, y: boatY - 15 };
  },

  moveToward(obj, tx, ty, speed) {
    const dx = tx - obj.x;
    const dy = ty - obj.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= speed) {
      obj.x = tx;
      obj.y = ty;
      return true;
    }
    obj.x += (dx / dist) * speed;
    obj.y += (dy / dist) * speed;
    return false;
  },

  renderBucketSlots() {
    const el = document.getElementById('bucketVisual');
    el.innerHTML = '';
    for (let i = 0; i < 15; i++) {
      const slot = document.createElement('div');
      slot.className = 'bucket-slot';
      slot.id = `bucket-${i}`;
      el.appendChild(slot);
    }
  },

  start() {
    if (!this.canvas) this.init();
    this.running = true;
    this.bucket = [];
    this.score = 0;
    this.fishes = [];
    this.liftFish = null;
    this.particles = [];
    this.pendingComplete = false;
    this.historyUsedKeys = [];
    this.historyPaused = false;
    const tip = this.getRodTip();
    this.hook = {
      x: tip.x,
      y: tip.y,
      targetX: tip.x,
      targetY: tip.y,
      state: 'idle',
      speed: 9,
      reelSpeed: 11,
    };
    this.updateHUD();
    this.updateReelUI();
    this.renderBucketSlots();
    this.loop();
  },

  stop() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  },

  setYear(y) {
    this.year = parseInt(y, 10);
    document.getElementById('yearDisplay').textContent = this.year;
  },

  getEraColor() {
    const y = this.year;
    if (y <= 2000) return '#4a90a4';
    if (y <= 2010) return '#2d6a7a';
    if (y <= 2020) return '#1a4d5c';
    return '#0d3340';
  },

  getWaterBounds() {
    const h = this.canvas ? this.canvas.height : 400;
    return { surface: h * 0.38, bottom: h - 30 };
  },

  castHook(e) {
    if (!this.running || this.hook.state !== 'idle') return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.hook.targetX = Math.max(8, Math.min(w - 8, (e.clientX - rect.left) * scaleX));
    this.hook.targetY = Math.max(8, Math.min(h - 8, (e.clientY - rect.top) * scaleY));
    this.hook.state = 'casting';
    this.updateReelUI();
  },

  reelIn() {
    if (!this.running || this.hook.state !== 'waiting') return;
    this.hook.state = 'reeling';
    this.updateReelUI();
  },

  updateReelUI() {
    const btn = document.getElementById('reelBtn');
    const status = document.getElementById('hookStatus');
    if (!btn || !status) return;

    const labels = {
      idle: { text: '点击画布任意位置，鱼钩直达该点', enabled: false },
      casting: { text: '鱼线放出中…', enabled: false },
      waiting: { text: '鱼钩已就位，等鱼靠近后收杆！', enabled: true },
      reeling: { text: '收杆中…', enabled: false },
      lifting: { text: '🎣 收鱼上岸！', enabled: false },
    };
    const s = labels[this.hook.state] || labels.idle;
    btn.disabled = !s.enabled;
    status.textContent = s.text;
  },

  spawnFish() {
    const types = WFLA_DATA.fishTypes;
    const weights = [0.5, 0.35, 0.15];
    let r = Math.random(), type;
    if (r < weights[0]) type = types[0];
    else if (r < weights[0] + weights[1]) type = types[1];
    else type = types[2];

    const dir = Math.random() > 0.5 ? 1 : -1;
    const y = 180 + Math.random() * 180;
    const eraMod = 1 + (this.year - 1996) / 60;

    this.fishes.push({
      x: dir > 0 ? -40 : this.canvas.width + 40,
      y,
      dir,
      type: type.type,
      name: type.name,
      speed: type.speed * eraMod * (0.8 + Math.random() * 0.4),
      color: type.color,
      points: type.points,
      w: 36 + Math.random() * 12,
    });
  },

  checkCatch() {
    if (this.hook.state !== 'waiting' && this.hook.state !== 'reeling') return null;

    for (let i = 0; i < this.fishes.length; i++) {
      const fish = this.fishes[i];
      const dx = Math.abs(fish.x - this.hook.x);
      const dy = Math.abs(fish.y - this.hook.y);
      if (dx < fish.w && dy < 30) return { fish, index: i };
    }
    return null;
  },

  spawnSplash(x, y) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.5 ? 'rgba(126,232,250,0.9)' : 'rgba(255,255,255,0.85)',
        type: 'splash',
      });
    }
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y - 5,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1 - Math.random() * 2,
        life: 40,
        maxLife: 40,
        size: 3,
        color: 'rgba(232,197,71,0.9)',
        type: 'score',
        text: i === 0 ? `+${this.liftFish?.points || ''}` : '',
      });
    }
  },

  showCatchHistory(fish) {
    const data = WFLA_DATA.getHistoryForFish(fish.type, this.year, this.historyUsedKeys);
    this.historyUsedKeys.push(data.key);
    this.historyPaused = true;
    FishHistory.show(data, () => {
      this.historyPaused = false;
    });
  },

  startCatchAnimation(fish, index) {
    this.fishes.splice(index, 1);
    this.bucket.push(fish);
    this.score += fish.points;
    this.updateHUD();
    App.toast(`🐟 钓到${fish.name}！+${fish.points}分`);

    this.liftFish = {
      ...fish,
      wiggle: 0,
      splashDone: false,
      scale: 1,
      alpha: 1,
    };
    this.hook.state = 'lifting';
    this.updateReelUI();

    if (this.bucket.length >= 15) this.pendingComplete = true;
  },

  finishLift() {
    this.liftFish = null;
    this.hook.state = 'idle';
    const tip = this.getRodTip();
    this.hook.x = tip.x;
    this.hook.y = tip.y;
    this.updateReelUI();

    if (this.pendingComplete) {
      this.pendingComplete = false;
      this.stop();
      App.onFishingComplete(this.score);
    }
  },

  finishReel() {
    this.hook.state = 'idle';
    const tip = this.getRodTip();
    this.hook.x = tip.x;
    this.hook.y = tip.y;
    this.updateReelUI();
    App.toast('空杆！再试一次');
  },

  updateHUD() {
    document.getElementById('bucketCount').textContent = this.bucket.length;
    document.getElementById('fishScore').textContent = this.score;
    this.bucket.forEach((fish, i) => {
      const slot = document.getElementById(`bucket-${i}`);
      if (slot) slot.className = `bucket-slot filled-${fish.type}`;
    });
  },

  updateParticles() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.type === 'splash') {
        p.vy += 0.12;
        p.vx *= 0.98;
      }
      p.life--;
      return p.life > 0;
    });
  },

  drawFish(ctx, fish, opts = {}) {
    const {
      x = fish.x,
      y = fish.y,
      rotation = 0,
      scale = 1,
      alpha = 1,
      flip = fish.dir > 0 ? 1 : -1,
    } = opts;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip * scale, scale);
    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, fish.w / 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-fish.w / 2 - 5, 0);
    ctx.lineTo(-fish.w / 2 - 15, -8);
    ctx.lineTo(-fish.w / 2 - 15, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(fish.w / 4, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(fish.w / 4 + 1, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  update() {
    this.cat.bob += 0.05;
    this.updateParticles();

    if (this.hook.state !== 'lifting') {
      this.spawnTimer++;
      if (this.spawnTimer > 45 - Math.min(20, (this.year - 1996) / 2)) {
        this.spawnFish();
        this.spawnTimer = 0;
      }
    }

    const h = this.hook;
    const tip = this.getRodTip();
    const { surface } = this.getWaterBounds();

    if (h.state === 'idle') {
      h.x = tip.x;
      h.y = tip.y;
    } else if (h.state === 'casting') {
      if (this.moveToward(h, h.targetX, h.targetY, h.speed)) {
        h.state = 'waiting';
        this.updateReelUI();
      }
    } else if (h.state === 'waiting') {
      h.x = h.targetX;
      h.y = h.targetY;
    } else if (h.state === 'reeling') {
      const hit = this.checkCatch();
      if (hit) {
        this.startCatchAnimation(hit.fish, hit.index);
      } else if (this.moveToward(h, tip.x, tip.y, h.reelSpeed)) {
        this.finishReel();
      }
    } else if (h.state === 'lifting' && this.liftFish) {
      if (this.historyPaused) return;

      const lf = this.liftFish;
      const liftSpeed = h.reelSpeed * 1.35;

      if (!lf.splashDone && h.y <= surface + 10) {
        this.spawnSplash(h.x, surface);
        lf.splashDone = true;
        this.showCatchHistory(lf);
      }

      lf.wiggle += 0.22;
      const wiggleX = Math.sin(lf.wiggle) * 6;
      const wiggleRot = Math.sin(lf.wiggle * 1.5) * 0.35;

      lf.x = h.x + wiggleX;
      lf.y = h.y + 18 + Math.sin(lf.wiggle * 2) * 2;

      if (h.y < surface) {
        lf.scale = Math.min(1.25, lf.scale + 0.008);
      }

      if (this.moveToward(h, tip.x, tip.y - 5, liftSpeed)) {
        lf.alpha = Math.max(0, lf.alpha - 0.06);
        lf.scale *= 0.96;
        lf.y -= 2;
        if (lf.alpha <= 0.05) this.finishLift();
      }
    }

    this.fishes = this.fishes.filter(f => {
      f.x += f.dir * f.speed;
      return f.x > -60 && f.x < this.canvas.width + 60;
    });
  },

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.35);
    skyGrad.addColorStop(0, '#87ceeb');
    skyGrad.addColorStop(1, '#b8dce8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.35);

    const riverGrad = ctx.createLinearGradient(0, h * 0.35, 0, h);
    riverGrad.addColorStop(0, this.getEraColor());
    riverGrad.addColorStop(0.5, '#1a5a6a');
    riverGrad.addColorStop(1, '#0a3040');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(0, h * 0.35, w, h * 0.65);

    const { surface } = this.getWaterBounds();
    ctx.strokeStyle = 'rgba(126, 232, 250, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, surface);
    ctx.lineTo(w, surface);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const waveY = h * 0.38 + i * 8 + Math.sin(Date.now() / 500 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(0, waveY);
      for (let x = 0; x <= w; x += 20) {
        ctx.lineTo(x, waveY + Math.sin(x / 30 + Date.now() / 800) * 4);
      }
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(250,246,237,0.7)';
    ctx.font = '14px KaiTi, serif';
    ctx.fillText(`${this.year}年 · 世外历史河流`, 20, 28);

    const boatX = this.cat.x;
    const boatY = h * 0.32 + Math.sin(this.cat.bob) * 4;
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(boatX, boatY, 50, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(boatX - 30, boatY - 25, 60, 20);

    ctx.font = '28px serif';
    ctx.fillText('🐱', boatX - 14, boatY - 8);

    if (this.hook.state === 'casting') {
      ctx.strokeStyle = 'rgba(232, 197, 71, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(this.hook.targetX, this.hook.targetY, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const fish of this.fishes) {
      this.drawFish(ctx, fish);
    }

    for (const p of this.particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      if (p.type === 'score' && p.text) {
        ctx.fillStyle = p.color;
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    const active = this.hook.state !== 'idle';
    const rodTip = this.getRodTip();
    ctx.strokeStyle = active ? '#aaa' : '#888';
    ctx.lineWidth = active ? 2.5 : 2;
    ctx.beginPath();
    ctx.moveTo(rodTip.x, rodTip.y);
    ctx.lineTo(this.hook.x, this.hook.y);
    ctx.stroke();

    if (this.hook.state === 'lifting' && this.liftFish) {
      const lf = this.liftFish;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(this.hook.x, this.hook.y);
      ctx.lineTo(lf.x, lf.y - 8);
      ctx.stroke();
      ctx.setLineDash([]);

      const hangRot = -Math.PI / 2 + Math.sin(lf.wiggle * 1.5) * 0.35;
      this.drawFish(ctx, lf, {
        x: lf.x,
        y: lf.y,
        rotation: hangRot,
        scale: lf.scale,
        alpha: lf.alpha,
        flip: 1,
      });

      if (lf.y < surface) {
        ctx.fillStyle = 'rgba(232,197,71,0.85)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lf.name, lf.x, lf.y - lf.w / 2 - 14);
        ctx.textAlign = 'left';
      }
    }

    ctx.fillStyle = active ? '#e8e8e8' : '#ccc';
    ctx.beginPath();
    ctx.arc(this.hook.x, this.hook.y, active ? 7 : 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = active ? '#888' : '#666';
    ctx.stroke();

    if (this.hook.state === 'waiting') {
      ctx.strokeStyle = 'rgba(232, 197, 71, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(this.hook.x, this.hook.y, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (this.hook.state === 'lifting') {
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨', rodTip.x + 30, rodTip.y - 20 + Math.sin(Date.now() / 120) * 4);
      ctx.textAlign = 'left';
    }
  },

  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  },
};
