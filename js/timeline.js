/** 时间轴模块 */
const Timeline = {
  currentEvent: null,
  currentTab: 'official',

  init() {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';

    WFLA_DATA.timelineEvents.forEach(event => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.dataset.id = event.id;
      if (App.state.timelineOpened.has(event.id)) item.classList.add('opened');

      item.innerHTML = `
        <div class="timeline-card">
          <div class="timeline-year">${event.year} ${event.icon}</div>
          <div class="timeline-title">${event.title}</div>
          <div class="timeline-preview">${event.official.slice(0, 40)}…</div>
        </div>
      `;

      item.addEventListener('click', () => this.openEvent(event));
      container.appendChild(item);
    });

    this.updateProgress();
  },

  openEvent(event) {
    this.currentEvent = event;
    this.currentTab = 'official';
    document.getElementById('modalTitle').textContent = `${event.year} · ${event.title}`;
    this.renderTabContent();
    this.updateTabs();
    document.getElementById('eventModal').classList.add('show');

    if (!App.state.timelineOpened.has(event.id)) {
      App.onTimelineEventOpened(event.id);
    }
  },

  switchTab(tab) {
    this.currentTab = tab;
    this.renderTabContent();
    this.updateTabs();
  },

  renderTabContent() {
    const e = this.currentEvent;
    if (!e) return;
    const map = { official: e.official, secret: e.secret, rumor: e.rumor };
    const labels = { official: '📜 正史', secret: '🔮 秘史', rumor: '🎭 野史（趣闻轶事，仅供参考）' };
    document.getElementById('modalBody').innerHTML =
      `<p><strong>${labels[this.currentTab]}</strong></p><p>${map[this.currentTab]}</p>`;
  },

  updateTabs() {
    document.querySelectorAll('.modal-tab').forEach(btn => {
      btn.className = 'modal-tab';
      if (btn.dataset.tab === this.currentTab) {
        btn.classList.add(`active-${this.currentTab}`);
      }
    });
  },

  closeModal() {
    document.getElementById('eventModal').classList.remove('show');
  },

  markOpened(id) {
    const item = document.querySelector(`.timeline-item[data-id="${id}"]`);
    if (item) item.classList.add('opened');
  },

  updateProgress() {
    const count = App.state.timelineOpened.size;
    const target = 10;
    const pct = Math.min(100, Math.round((count / target) * 100));
    document.getElementById('timelineCount').textContent = count;
    document.getElementById('timelinePercent').textContent = `${pct}%`;
    document.getElementById('timelineProgress').style.width = `${pct}%`;
  },

  reset() {
    document.querySelectorAll('.timeline-item').forEach(el => el.classList.remove('opened'));
    this.updateProgress();
  },
};

document.getElementById('eventModal').addEventListener('click', (e) => {
  if (e.target.id === 'eventModal') Timeline.closeModal();
});
