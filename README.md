# 世外历史河流 · 上海市世外中学发展史互动网站

以河流为主轴，串联世外中学三十年发展史的互动体验网站。

## 体验流程

1. **历史时间轴** — 点击 12 个关键节点，阅读正史 / 秘史 / 野史；探索满 10 个自动解锁下一阶段
2. **小猫雷霆钓鱼** — 拖动年份滑块，在对应时代河流中钓正史鱼、秘史鱼、野史鱼；鱼桶满 15 条进入终章
3. **世外雷霆肘击** — 四轨道音游 + 世外问答题；小虾助成长，鲨鱼渔网扣血；成长度 100% 通关

## 运行方式

直接用浏览器打开 `index.html`，或启动本地服务器：

```bash
cd wfla-history-river
python3 -m http.server 8080
```

然后访问 http://localhost:8080

## 在线体验

**https://bestisabella.github.io/wfla-history-river/**

### 首次部署（必做，只需一次）

报错 `Get Pages site failed` 是因为 **GitHub Pages 还没在仓库里打开**。按下面做即可：

1. 打开 [Actions](https://github.com/BestIsabella/wfla-history-river/actions)，等最新的 **Deploy GitHub Pages** 跑完（会把网站推到 `gh-pages` 分支）
2. 打开 [Settings → Pages](https://github.com/BestIsabella/wfla-history-river/settings/pages)
3. **Build and deployment → Source** 选 **Deploy from a branch**（不要选 GitHub Actions）
4. **Branch** 选 **`gh-pages`**，文件夹选 **`/ (root)`**，点 **Save**
5. 等 1～2 分钟，访问上面的网址

> 若 Actions 里还没有 `gh-pages` 分支，先在 Actions 页手动 **Run workflow** 跑一次部署。

## 技术栈

- 纯 HTML / CSS / JavaScript，无构建依赖
- localStorage 保存进度与排行榜

## 史料来源

- [上海世外教育集团 · 关于我们](https://www.shwfl.edu.cn/about/list.htm)
- [上海市世外中学 · 维基百科](https://zh.wikipedia.org/wiki/%E4%B8%8A%E6%B5%B7%E5%B8%82%E4%B8%96%E5%A4%96%E4%B8%AD%E5%AD%A6)
- 世外中学国际升学成果公开报道（2024–2026）

野史部分为基于校史文化的趣味创作，仅供娱乐，不代表官方立场。
