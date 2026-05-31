/** 应用主控制器 */
const App = {
  state: {
    timelineOpened: new Set(),
    fishingUnlocked: false,
    rhythmUnlocked: false,
    fishScore: 0,
    rhythmScore: 0,
    totalScore: 0,
  },

  STORAGE_KEY: 'wfla_river_progress',

  init() {
    this.loadProgress();
    Timeline.init();
    Leaderboard.render();
    this.updateNav();
  },

  loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      if (saved.timelineOpened) {
        this.state.timelineOpened = new Set(saved.timelineOpened);
      }
      this.state.fishingUnlocked = !!saved.fishingUnlocked;
      this.state.rhythmUnlocked = !!saved.rhythmUnlocked;
      this.state.fishScore = saved.fishScore || 0;
      this.state.rhythmScore = saved.rhythmScore || 0;
    } catch (_) { /* ignore */ }
  },

  saveProgress() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      timelineOpened: [...this.state.timelineOpened],
      fishingUnlocked: this.state.fishingUnlocked,
      rhythmUnlocked: this.state.rhythmUnlocked,
      fishScore: this.state.fishScore,
      rhythmScore: this.state.rhythmScore,
    }));
  },

  showScreen(name) {
    if (name === 'fishing' && !this.state.fishingUnlocked) {
      this.toast('请先探索至少 10 个时间轴事件');
      return;
    }
    if (name === 'rhythm' && !this.state.rhythmUnlocked) {
      this.toast('请先钓满 15 条鱼');
      return;
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) screen.classList.add('active');

    document.querySelectorAll('.nav-step').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === name);
    });

    if (name === 'fishing') FishingGame.start();
    else FishingGame.stop();

    if (name === 'rhythm') RhythmGame.start();
    else RhythmGame.stop();

    if (name === 'timeline') Timeline.updateProgress();
    if (name === 'leaderboard') Leaderboard.render();
  },

  goHome() {
    this.showScreen('home');
  },

  startJourney() {
    this.showScreen('timeline');
  },

  onTimelineEventOpened(eventId) {
    this.state.timelineOpened.add(eventId);
    Timeline.markOpened(eventId);
    Timeline.updateProgress();

    if (this.state.timelineOpened.size >= 10 && !this.state.fishingUnlocked) {
      this.state.fishingUnlocked = true;
      this.saveProgress();
      this.updateNav();
      this.toast('🎣 时间轴探索完成！解锁小猫雷霆钓鱼');
      setTimeout(() => this.showScreen('fishing'), 1500);
    } else {
      this.saveProgress();
    }
  },

  onFishingComplete(score) {
    this.state.fishScore = score;
    this.state.rhythmUnlocked = true;
    this.saveProgress();
    this.updateNav();
    this.toast('⚡ 鱼桶已满！进入世外雷霆肘击');
    setTimeout(() => this.showScreen('rhythm'), 1500);
  },

  onVictory(rhythmScore) {
    this.state.rhythmScore = rhythmScore;
    this.state.totalScore = this.state.fishScore + rhythmScore;
    this.saveProgress();
    document.getElementById('finalScore').textContent = this.state.totalScore;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-victory').classList.add('active');
  },

  showLeaderboardWithScore() {
    document.getElementById('playerName').value = '';
    Leaderboard.pendingScore = this.state.totalScore;
    this.showScreen('leaderboard');
  },

  resetAll() {
    this.state = {
      timelineOpened: new Set(),
      fishingUnlocked: false,
      rhythmUnlocked: false,
      fishScore: 0,
      rhythmScore: 0,
      totalScore: 0,
    };
    localStorage.removeItem(this.STORAGE_KEY);
    Timeline.reset();
    this.updateNav();
    this.showScreen('home');
    this.toast('进度已重置，重新开始探索吧！');
  },

  updateNav() {
    const navFishing = document.getElementById('navFishing');
    const navRhythm = document.getElementById('navRhythm');
    navFishing.disabled = !this.state.fishingUnlocked;
    navRhythm.disabled = !this.state.rhythmUnlocked;
    if (this.state.fishingUnlocked) navFishing.classList.add('done');
    if (this.state.rhythmUnlocked) navRhythm.classList.add('done');
  },

  toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
