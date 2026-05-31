/** 排行榜 */
const Leaderboard = {
  KEY: 'wfla_leaderboard',
  pendingScore: null,
  maxEntries: 20,

  getEntries() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch (_) {
      return [];
    }
  },

  saveEntries(entries) {
    localStorage.setItem(this.KEY, JSON.stringify(entries));
  },

  submitScore() {
    const name = document.getElementById('playerName').value.trim() || '匿名掌握员';
    const score = this.pendingScore ?? App.state.totalScore ?? 0;

    if (score <= 0) {
      App.toast('还没有可提交的成绩，请先完成挑战');
      return;
    }

    const entries = this.getEntries();
    entries.push({
      name: name.slice(0, 12),
      score,
      date: new Date().toLocaleDateString('zh-CN'),
      ts: Date.now(),
    });

    entries.sort((a, b) => b.score - a.score);
    this.saveEntries(entries.slice(0, this.maxEntries));
    this.pendingScore = null;
    this.render();
    App.toast(`🏆 ${name} 已录入排行榜！`);
  },

  render() {
    const tbody = document.getElementById('leaderboardBody');
    const entries = this.getEntries();

    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:rgba(250,246,237,0.5)">暂无记录，成为第一位雷霆掌握员吧！</td></tr>';
      return;
    }

    tbody.innerHTML = entries.map((e, i) => {
      const rankClass = i < 3 ? `rank-${i + 1}` : '';
      return `<tr>
        <td class="${rankClass}">${i + 1}</td>
        <td>${this.escape(e.name)}</td>
        <td><strong>${e.score}</strong></td>
        <td>${e.date}</td>
      </tr>`;
    }).join('');
  },

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};
