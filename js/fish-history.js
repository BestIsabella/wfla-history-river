/** 钓鱼历史弹窗 */
const FishHistory = {
  onClose: null,

  show(data, onClose) {
    this.onClose = onClose || null;
    const modal = document.getElementById('catchHistoryModal');
    const box = document.getElementById('catchModalBox');

    box.className = `modal catch-modal type-${data.fishType}`;
    document.getElementById('catchModalTitle').textContent =
      `🐟 钓获${data.fishName} · ${data.typeLabel}`;
    document.getElementById('catchModalBadge').textContent =
      `${data.typeEmoji} ${data.typeLabel} · ${data.riverYear}年河流`;
    document.getElementById('catchModalEvent').textContent =
      `${data.icon} ${data.year} · ${data.title}`;
    document.getElementById('catchModalBody').innerHTML =
      `<p>${data.content}</p>` +
      (data.fishType === 'rumor'
        ? '<p style="margin-top:1rem;font-size:0.82rem;color:rgba(250,246,237,0.45)">※ 野史为基于校史文化的趣闻轶事，仅供参考</p>'
        : '');

    modal.classList.add('show');
  },

  close() {
    document.getElementById('catchHistoryModal').classList.remove('show');
    if (this.onClose) {
      const cb = this.onClose;
      this.onClose = null;
      cb();
    }
  },
};

document.getElementById('catchHistoryModal').addEventListener('click', (e) => {
  if (e.target.id === 'catchHistoryModal') FishHistory.close();
});
