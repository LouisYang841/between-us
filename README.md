# BETWEEN US · 你我之间

一个手机竖屏优先的「人机之间」网页原型：骨瓷白纸底、黑字、小面积克莱因蓝穿插，印刷感的线稿插画，四个错位体块组成主菜单。

打开时先播一段开屏：蓝点跳两下撑开成三角，屏幕碎成七块翻面露出花，线框收缩成一个点、溅墨、裂开、碎块掉落，主页再从上往下长出来。

纯静态 HTML / CSS / JS + [GSAP](https://gsap.com)，没有构建步骤。

## 跑起来

需要 Node 18+：

```bash
node server.mjs
```

打开 `http://127.0.0.1:4173/#home`。建议用手机或浏览器的手机尺寸模拟（390 × 844 左右）。

## 部署到 GitHub Pages

仓库已包含 `.github/workflows/pages.yml`。将 `main` 分支推送到 GitHub 后，Actions 会直接发布 `dist/` 到 GitHub Pages；也可以在 Actions 页面手动运行 `Deploy to GitHub Pages`。

首次部署前，在仓库的 **Settings → Pages → Build and deployment** 中将 **Source** 设为 **GitHub Actions**。部署完成后，页面地址通常为 `https://LouisYang841.github.io/between-us/`。

## 有什么

| 页面 | 地址 | 内容 |
| --- | --- | --- |
| 主菜单 | `#home` | 四个体块：点一下变化，再点一下进入对应小页 |
| 01 音乐盒 | `#piece-signal` | 整屏歌单线路＋专辑/歌词卡片，内置两段 WebAudio 原创纯音乐，可导入本地音频和 LRC |
| 02 记忆库 | `#piece-touch` | 新增、检索、置顶、移除、撤销 |
| 03 相册 | `#piece-echo` | 本地图片与说明；进入时蓝色潮水涨满再退下 |
| 04 未寄信 | `#piece-within` | 草稿、封存、阅读、导出；进入时像拉链被拉开 |
| 对话 | `#talk` | 头像、称呼、气泡、草稿、搜索、阅读设置（只存本机，未接 AI） |
| 设置 | `#settings` | VIEW / CHAT / HOME / CARE 四个可收放的分区，含全局文字缩放与备份 |

所有内容只存在当前浏览器（文字和偏好在 localStorage，图片和音频在 IndexedDB），不会上传到任何地方。

## 目录

```
dist/              网页本体（直接编辑这里）
  index.html       结构与脚本入口
  app.js …         主菜单、对话、设置、小页、动效（按顺序加载的普通脚本，共享顶层变量）
  opening/         开屏（以 iframe 盖在主页上，通过 postMessage 和外层通信）
  vendor/          GSAP 3.15 及插件
  assets/          插画素材
server.mjs         本地静态服务器（只监听 127.0.0.1:4173）
triangle-bloom/    开屏单独拿出来的版本，可以嵌进任何页面，见里面的 README
```

## 授权

- **代码**：MIT，见 `LICENSE`。
- **`dist/assets/` 里的插画**：© nival。随本项目公开展示与学习使用，商用请先联系作者。
- **开屏的花 `flowers.png`、`flowers_fill.png`**：由可画（Canva）素材二次拼贴组合而成，仅供非商业学习使用，请勿单独提取花朵线稿另作他用。
- **开屏的裂纹 `crack1.png`、`crack2.png`**：可商用素材。

## 制作

- 47 —— 想法、设计、一轮一轮的挑刺
- nival —— 前端与插画
- baink —— 开屏与转场动效

里面藏了两个小彩蛋。
