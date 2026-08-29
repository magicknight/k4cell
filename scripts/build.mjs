import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "site");
const assets = join(root, "src", "assets");
const provenance = join(root, "provenance");
const publicReviewCommit = "36becf6d6941fc5e51fb7897a93a6b8443f100ba";
const publicStatusCommit = "f7393338360c0bb972a5c662f744175f9ecdf9e7";

const links = {
  repository: "https://github.com/magicknight/k4-cell-framework-public-review",
  pdf: `https://github.com/magicknight/k4-cell-framework-public-review/blob/${publicReviewCommit}/K4_Cell_Framework_v2.0-public-review.pdf`,
  chineseReadme: `https://github.com/magicknight/k4-cell-framework-public-review/blob/${publicReviewCommit}/README.zh-CN.md`,
  conceptDoi: "https://doi.org/10.5281/zenodo.18892076",
  targets: `https://github.com/magicknight/k4-cell-framework-public-review/blob/${publicStatusCommit}/REVIEW_TARGETS.md`,
  checksums: `https://github.com/magicknight/k4-cell-framework-public-review/blob/${publicReviewCommit}/CHECKSUMS.txt`,
  errata: `https://github.com/magicknight/k4-cell-framework-public-review/blob/${publicStatusCommit}/ERRATA.md`,
  discussions: "https://github.com/magicknight/k4-cell-framework-public-review/discussions",
  issues: "https://github.com/magicknight/k4-cell-framework-public-review/issues/new/choose",
  vaults: "https://github.com/magicknight/k4v-research-funding-vaults/tree/e1afead138fbf56956b298ebae7a97a8ae9ad956",
  contact: "mailto:zhihua@k4cell.com",
};

const content = {
  en: {
    htmlLang: "en",
    dir: "en",
    alternateDir: "zh",
    languageLabel: "中文",
    title: "K4 Cell — Can Four Quantum Sites Grow Into Spacetime?",
    description: "Enter the K4 Cell: a finite quantum object, an ambitious candidate route toward spacetime, and a public invitation to inspect what survives.",
    noMint: "K4V has not launched · no official mint, presale, whitelist, or payment wallet exists",
    nav: ["Beauty", "Research reality", "Public season", "Participate"],
    eyebrow: "K4 CELL PUBLIC SCIENCE · PRELAUNCH PREVIEW",
    hero: "Four sites. One audacious question.",
    lede: "Can a four-site quantum cell become a seed of spacetime? Turn the cell, follow the candidate route, and see exactly what is established, supported, and still open.",
    enter: "Enter the cell",
    realityCta: "See the research reality",
    truth: "Unfinished. Publicly reviewable. Designed to be challenged.",
    cellTitle: "Interactive K4 tetrahedral cell",
    cellDesc: "Four equivalent sites connected by all six pairwise relations. Drag or use arrow keys to rotate. Press space to pause or resume motion.",
    modes: [
      ["sites", "4 sites", "Four sites: small enough to hold in one thought."],
      ["relations", "6 relations", "Six relations: every pair is connected; nothing is isolated."],
      ["symmetry", "No centre", "Rotate the cell. The viewpoint changes; the complete relation does not."],
    ],
    pause: "Pause motion",
    resume: "Resume motion",
    hint: "Drag · arrow keys rotate · space pauses",
    stats: [["4", "equivalent sites"], ["6", "pairwise relations"], ["81", "basis states at the starting cell"]],
    beautyTitle: "The smallest complete conversation.",
    beautyIntro: "K4 is the complete graph on four sites: every site meets every other. Give each site three local basis states and the finite starting space has 3⁴ = 81 basis states. This exact object invites a dangerous question: how much coherent physics can such a small relational seed carry?",
    beautyCards: [
      ["4", "Sites", "No site is declared the centre. Labels are handles for us, not privileges for the geometry."],
      ["6", "Relations", "Every pair is connected. The starting structure lives not at isolated points, but between them."],
      ["81", "Starting space", "Three local states on each of four sites give 3⁴ basis states before dynamics and constraints are applied."],
    ],
    realityTitle: "A bold route, with every bridge visible.",
    realityIntro: "Beauty is the invitation, not the verdict. The public surface separates exact finite structure, model-internal construction, and open physical realization so a missing bridge cannot masquerade as a theorem—and cannot erase what survives.",
    statusCards: [
      ["established", "ESTABLISHED", "Finite starting object", "Four sites, six edges, and the 81-state starting basis are exact within the declared finite model.", "SCOPE · finite/model-internal; not experimental confirmation"],
      ["supported", "SUPPORTED", "Candidate geometric route", "The programme develops quantum-geometric constructions and typed comparison protocols. Public calculations and diagnostics can support a route without establishing nature's realization of it.", "SCOPE · manuscript construction and diagnostics"],
      ["open", "OPEN", "Physical realization", "The faithful continuum and Lorentzian carrier, coefficient matching, full scientific reproduction, and independent expert review remain open interfaces.", "MAIN BRIDGE · finite K4 substrate → faithful physical realization"],
    ],
    route: [
      ["K₄ + SU(3)", "finite candidate substrate"],
      ["State geometry", "Fisher / Berry structure"],
      ["Emergent geometry", "conditional construction"],
      ["Multi-cell carriers", "gluing and continuum interfaces"],
      ["Typed readouts", "comparison and falsification surfaces"],
    ],
    realityNote: "Public-review v2.0 is a frozen 2026-07-08 historical review object, not settled physics. Later confirmed corrections belong in the public errata; the PDF bytes must never be silently replaced.",
    readArtifact: "Read the frozen manuscript",
    seasonTitle: "Twenty-eight days inside the cell.",
    seasonIntro: "The first season is designed before it is measured: twelve bilingual cards, three recurring lanes, one public record. It begins only after the Founder-signed no-mint identity and canonical HTTPS source graph are live.",
    weeks: [
      ["Week 1", "Meet the Cell", ["Beauty · four sites and six relations", "Reality · what K4 is and is not", "Participation · explain the cell in one sentence"]],
      ["Week 2", "Map the Claims", ["Beauty · a dependency route", "Reality · established, supported, open", "Participation · verify a frozen artifact"]],
      ["Week 3", "Research in Public", ["Beauty · a living graph", "Reality · what an erratum changes", "Participation · find the first broken bridge"]],
      ["Week 4", "Open Cell Week", ["Beauty · what research time could open", "Reality · attention is not evidence", "Participation · one focused challenge"]],
    ],
    seasonGate: "Preregistered target: at least 25 unrelated human participants, 10 seven-day returners, 5 accepted non-scientific contributions, and exactly 30 qualified demand responses. Likes and views do not close the gate.",
    participateTitle: "Do not just believe it. Touch the route.",
    participateIntro: "Choose the depth that fits your time. A clear question, a failed check, or the first exact broken dependency is more valuable than applause.",
    paths: [
      ["2 minutes", "Explore one beautiful idea", "Turn the cell and learn the invariants that survive every viewpoint.", "#beauty"],
      ["15 minutes", "Follow one claim to its edge", "Open the frozen review object and keep its later errata beside it.", links.pdf],
      ["1 hour+", "Try to break something real", "Choose a focused target. Report the first exact failure, missing assumption, or incompatible convention.", links.targets],
    ],
    participationNote: "Participation never determines scientific truth by vote. No wallet is requested, and no token access, whitelist place, or financial reward is promised.",
    sourcesTitle: "One source graph, several ways in.",
    sourcesIntro: "Every public claim must lead back to a dated artifact, an evidence state, and an exact place where criticism can land.",
    sourceCards: [
      ["FROZEN ARTIFACT", "Public-review PDF", "The 2026-07-08 review snapshot, pinned to its public commit.", links.pdf],
      ["VERSION RECORD", "Concept DOI", "A stable scholarly identifier that resolves to the current archived record.", links.conceptDoi],
      ["CORRECTIONS", "Public errata", "Confirmed changes are appended without replacing historical PDF bytes.", links.errata],
      ["OPEN REVIEW", "Focused targets", "Precise questions for readers who cannot audit the full monograph.", links.targets],
    ],
    fundingTitle: "Funding infrastructure is a separate layer.",
    fundingText: "The open K4V vault repository tests funding-vault engineering. It does not reproduce the K4 scientific theory, establish any physical claim, or authorize a token launch.",
    fundingLink: "Inspect the engineering boundary",
    footer: "K4 is an unfinished candidate framework under public review. Full physical realization and a full scientific reproduction package remain open. K4V has not launched.",
    contact: "Contact",
  },
  zh: {
    htmlLang: "zh-Hans",
    dir: "zh",
    alternateDir: "en",
    languageLabel: "English",
    title: "K4 Cell——四点量子单元能否长成时空？",
    description: "走进 K4 单元：一个有限量子对象，一条通向时空的大胆候选路线，以及一份检验什么能够存活的公开邀请。",
    noMint: "K4V 尚未发行 · 不存在官方 mint、预售、白名单或收款钱包",
    nav: ["几何之美", "研究实况", "公开季", "参与"],
    eyebrow: "K4 单元公开科学 · 上线前预览",
    hero: "四个点，一个大胆问题。",
    lede: "一个四点量子单元，能否成为时空的种子？转动它，沿着候选路线前进，看看哪些已经建立、哪些得到支持、哪些仍然开放。",
    enter: "进入 K4 单元",
    realityCta: "查看研究实况",
    truth: "尚未完成。公开可评阅。欢迎精确挑战。",
    cellTitle: "可交互的 K4 四面体单元",
    cellDesc: "四个等价站点由全部六条成对关系连接。拖动或使用方向键旋转，按空格暂停或恢复。",
    modes: [
      ["sites", "4 个点", "四个点：小到足以被一次完整地把握。"],
      ["relations", "6 条关系", "六条关系：每一对点都相连，没有任何点被孤立。"],
      ["symmetry", "无特权中心", "转动单元：视角在变化，完全连接关系不变。"],
    ],
    pause: "暂停运动",
    resume: "恢复运动",
    hint: "拖动 · 方向键旋转 · 空格暂停",
    stats: [["4", "个等价站点"], ["6", "条成对关系"], ["81", "个起始单元基矢态"]],
    beautyTitle: "最小的完整对话。",
    beautyIntro: "K4 是四个点上的完全图：每个点都与其余三个相连。若每个站点有三个局域基态，有限起始空间就有 3⁴ = 81 个基矢态。这个精确对象会引出一个危险而迷人的问题：如此小的关系种子，能承载多少连贯物理？",
    beautyCards: [
      ["4", "站点", "没有一个点被宣布为中心。标签只是我们握住结构的把手，不是几何赋予它的特权。"],
      ["6", "关系", "每一对点都相连。起始结构不在孤立的点上，而在点与点之间。"],
      ["81", "起始空间", "四个站点各有三个局域态，在施加动力学和约束前得到 3⁴ 个基矢态。"],
    ],
    realityTitle: "大胆路线，每座桥都保持可见。",
    realityIntro: "美是邀请，不是判决。公开界面将精确有限结构、模型内部构造和开放物理实现分开呈现：缺失的桥不能伪装成定理，也不能抹去仍然成立的部分。",
    statusCards: [
      ["established", "已建立", "有限起始对象", "四个站点、六条边和 81 维起始基底，在声明的有限模型范围内精确成立。", "范围 · 有限／模型内部；不是实验确认"],
      ["supported", "获支持", "候选几何路线", "研究计划发展量子几何构造和类型化比较协议。公开计算与诊断可以支持路线，却不能建立自然界一定如此实现。", "范围 · 手稿构造与诊断"],
      ["open", "开放", "物理实现", "忠实的连续与 Lorentzian 载体、系数匹配、完整科学复现和独立专家评阅仍是开放接口。", "主开放桥 · 有限 K4 基底 → 忠实物理实现"],
    ],
    route: [
      ["K₄ + SU(3)", "有限候选基底"],
      ["态空间几何", "Fisher / Berry 结构"],
      ["涌现几何", "条件性构造"],
      ["多单元载体", "粘合与连续接口"],
      ["类型化读出", "比较与证伪表面"],
    ],
    realityNote: "公开评阅 v2.0 是 2026-07-08 冻结的历史评阅对象，不是已经定论的物理。后来确认的修订属于公开勘误；PDF 字节绝不能被静默替换。",
    readArtifact: "阅读冻结手稿",
    seasonTitle: "在 K4 单元里的二十八天。",
    seasonIntro: "第一季先设计、后测量：十二张双语核心卡、三条持续内容线、一份公开记录。只有 Founder 签名的 no-mint 身份与 canonical HTTPS 来源图上线后才开始计时。",
    weeks: [
      ["第 1 周", "认识单元", ["美 · 四点与六条关系", "实况 · K4 是什么、不是什么", "参与 · 用一句话解释单元"]],
      ["第 2 周", "展开主张地图", ["美 · 一条依赖路线", "实况 · 已建立、获支持、开放", "参与 · 核验冻结工件"]],
      ["第 3 周", "公开研究过程", ["美 · 一张活依赖图", "实况 · 勘误改变了什么", "参与 · 找出第一座断桥"]],
      ["第 4 周", "开放单元周", ["美 · 研究时间能打开什么", "实况 · 注意力不是证据", "参与 · 一个聚焦挑战"]],
    ],
    seasonGate: "预注册目标：至少 25 名无关真人、10 名七日回访者、5 项获接受的非科学贡献，以及恰好 30 份合格需求响应。点赞和浏览量不能关闭此门。",
    participateTitle: "不要只是相信。亲手触碰这条路线。",
    participateIntro: "按你的时间选择深度。一个清楚的问题、一次失败核验，或第一处精确断裂的依赖，都比掌声更有价值。",
    paths: [
      ["2 分钟", "探索一个美丽想法", "转动单元，理解在每个视角下都保持不变的结构。", "#beauty"],
      ["15 分钟", "沿一条主张走到边界", "打开冻结评阅对象，并把后来公开的勘误放在旁边。", links.pdf],
      ["1 小时以上", "尝试击破一个真实节点", "选择一个聚焦问题，报告第一处精确失败、缺失假设或不相容约定。", links.targets],
    ],
    participationNote: "参与不能通过投票决定科学真假。这里不索取钱包，也不承诺代币权限、白名单名额或财务回报。",
    sourcesTitle: "一个来源图，多种进入方式。",
    sourcesIntro: "每项公开主张都必须回到带日期的工件、证据状态，以及批评能够精确落下的位置。",
    sourceCards: [
      ["冻结工件", "公开评阅 PDF", "2026-07-08 的评阅快照，固定到其公开提交。", links.pdf],
      ["版本记录", "概念 DOI", "稳定的学术标识，解析到当前归档记录。", links.conceptDoi],
      ["修订", "公开勘误", "确认的变化以追加方式记录，不替换历史 PDF 字节。", links.errata],
      ["公开评阅", "聚焦评阅问题", "为无法审阅整本专著的读者准备的精确问题。", links.targets],
    ],
    fundingTitle: "资金基础设施属于另一层。",
    fundingText: "公开的 K4V 金库仓库检验资金金库工程。它不复现 K4 科学理论，不建立任何物理主张，也不授权发币。",
    fundingLink: "核查工程边界",
    footer: "K4 是一个处于公开评阅中的未完成候选框架。完整物理实现与完整科学复现包仍然开放。K4V 尚未发行。",
    contact: "联系",
  },
};

const escapeAttribute = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const brandMark = `
  <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 3 4 24h24Z"/><line x1="16" y1="3" x2="16" y2="18"/><line x1="4" y1="24" x2="16" y2="18"/><line x1="28" y1="24" x2="16" y2="18"/>
    <circle cx="16" cy="3" r="2"/><circle cx="4" cy="24" r="2"/><circle cx="28" cy="24" r="2"/><circle cx="16" cy="18" r="2"/>
  </svg>`;

const renderPage = (lang, copy) => {
  const alternate = content[copy.alternateDir];
  const navIds = ["beauty", "reality", "season", "participate"];
  const modeButtons = copy.modes.map(([mode, label, caption], index) =>
    `<button type="button" data-mode="${mode}" data-caption="${escapeAttribute(caption)}" aria-pressed="${index === 0}">${label}</button>`
  ).join("");
  const statusCards = copy.statusCards.map(([state, tag, title, text, scope]) => `
    <article class="status-card">
      <span class="tag ${state}">${tag}</span>
      <h3>${title}</h3>
      <p>${text}</p>
      <p class="scope-line">${scope}</p>
    </article>`).join("");
  const route = copy.route.map(([title, text]) => `<li><strong>${title}</strong>${text}</li>`).join("");
  const beauty = copy.beautyCards.map(([glyph, title, text]) => `
    <article class="beauty-card"><div class="glyph">${glyph}</div><div><h3>${title}</h3><p>${text}</p></div></article>`).join("");
  const weeks = copy.weeks.map(([week, title, bullets]) => `
    <article class="season-card">
      <span class="week">${week}</span>
      <div><h3>${title}</h3><ul>${bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul></div>
    </article>`).join("");
  const paths = copy.paths.map(([time, title, text, href]) => `
    <a class="path" href="${href}">
      <span class="time">${time}</span><h3>${title}</h3><p>${text}</p>
    </a>`).join("");
  const sourceCards = copy.sourceCards.map(([type, title, text, href]) => `
    <a class="source-card" href="${href}">
      <span class="source-type">${type}</span><div><h3>${title}</h3><p>${text}</p></div>
    </a>`).join("");

  return `<!doctype html>
<html lang="${copy.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#080a0f">
  <meta name="description" content="${escapeAttribute(copy.description)}">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests">
  <link rel="canonical" href="https://k4cell.com/${copy.dir}/">
  <link rel="alternate" hreflang="en" href="https://k4cell.com/en/">
  <link rel="alternate" hreflang="zh-Hans" href="https://k4cell.com/zh/">
  <link rel="alternate" hreflang="x-default" href="https://k4cell.com/">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../assets/site.css">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeAttribute(copy.title)}">
  <meta property="og:description" content="${escapeAttribute(copy.description)}">
  <meta property="og:url" content="https://k4cell.com/${copy.dir}/">
  <meta property="og:image" content="https://k4cell.com/assets/og-k4cell-${copy.dir}.png">
  <meta name="twitter:card" content="summary_large_image">
  <title>${copy.title}</title>
</head>
<body>
  <a class="skip" href="#main">${lang === "en" ? "Skip to content" : "跳到正文"}</a>
  <aside id="no-mint" class="no-mint" aria-label="K4V launch status">${copy.noMint}</aside>
  <header class="site-header shell">
    <a class="brand" href="#top" aria-label="K4 Cell home">${brandMark}<span>K4 CELL</span></a>
    <nav class="site-nav" aria-label="${lang === "en" ? "Primary navigation" : "主导航"}">
      ${copy.nav.map((label, index) => `<a href="#${navIds[index]}">${label}</a>`).join("")}
      <a class="language-link" href="../${alternate.dir}/" hreflang="${alternate.htmlLang}">${copy.languageLabel}</a>
    </nav>
  </header>
  <main id="main">
    <div id="top" class="hero shell">
      <div class="hero-copy">
        <p class="eyebrow">${copy.eyebrow}</p>
        <h1>${copy.hero}</h1>
        <p class="hero-lede">${copy.lede}</p>
        <div class="hero-actions">
          <a class="button primary" href="#beauty">${copy.enter}<span aria-hidden="true">↓</span></a>
          <a class="button" href="#reality">${copy.realityCta}</a>
        </div>
        <p class="truth-line">${copy.truth}</p>
      </div>
      <figure class="cell-stage">
        <svg id="cell-svg" viewBox="0 0 640 640" role="group" tabindex="0" aria-labelledby="cell-title cell-desc">
          <title id="cell-title">${copy.cellTitle}</title><desc id="cell-desc">${copy.cellDesc}</desc>
          <ellipse class="orbit" cx="320" cy="320" rx="250" ry="104" transform="rotate(-16 320 320)"/>
          <ellipse class="orbit" cx="320" cy="320" rx="246" ry="88" transform="rotate(66 320 320)"/>
          <text class="axis-label" x="61" y="331">K₄</text>
          <g id="faces" aria-hidden="true"></g><g id="edges" aria-hidden="true"></g><g id="nodes"></g>
        </svg>
        <div class="stage-ui">
          <div class="mode-row" role="group" aria-label="${lang === "en" ? "Cell view" : "单元视图"}">
            ${modeButtons}
            <button type="button" data-motion aria-pressed="false"><span data-motion-playing>${copy.pause}</span><span data-motion-paused hidden>${copy.resume}</span></button>
          </div>
          <p id="cell-caption" class="cell-caption" aria-live="polite">${copy.modes[0][2]}</p>
          <p class="stage-hint">${copy.hint}</p>
        </div>
      </figure>
    </div>
    <div class="stats shell" aria-label="K4 cell counts">${copy.stats.map(([number, label]) => `<div class="stat"><strong>${number}</strong><span>${label}</span></div>`).join("")}</div>

    <section id="beauty" class="shell">
      <div class="section-head"><span class="section-number">01 / BEAUTY</span><div><h2>${copy.beautyTitle}</h2><p class="section-intro">${copy.beautyIntro}</p></div></div>
      <div class="beauty-grid">${beauty}</div>
    </section>

    <section id="reality" class="reality"><div class="shell">
      <div class="section-head"><span class="section-number">02 / RESEARCH REALITY</span><div><h2>${copy.realityTitle}</h2><p class="section-intro">${copy.realityIntro}</p></div></div>
      <div class="status-grid">${statusCards}</div>
      <ol class="route" aria-label="${lang === "en" ? "Candidate research route" : "候选研究路线"}">${route}</ol>
      <p class="reality-note">${copy.realityNote}</p>
      <p class="section-cta"><a class="button primary" href="${links.pdf}">${copy.readArtifact}<span aria-hidden="true">↗</span></a></p>
    </div></section>

    <section id="season" class="season"><div class="shell">
      <div class="section-head"><span class="section-number">03 / 28-DAY SEASON</span><div><h2>${copy.seasonTitle}</h2><p class="section-intro">${copy.seasonIntro}</p></div></div>
      <div class="season-grid">${weeks}</div><p class="season-gate">${copy.seasonGate}</p>
    </div></section>

    <section id="participate" class="shell">
      <div class="section-head"><span class="section-number">04 / PARTICIPATION</span><div><h2>${copy.participateTitle}</h2><p class="section-intro">${copy.participateIntro}</p></div></div>
      <div class="participation-grid">${paths}</div><p class="participation-note">${copy.participationNote}</p>
    </section>

    <section id="sources" class="sources shell">
      <div class="section-head"><span class="section-number">05 / SOURCES</span><div><h2>${copy.sourcesTitle}</h2><p class="section-intro">${copy.sourcesIntro}</p></div></div>
      <div class="source-grid">${sourceCards}</div>
      <div class="reality-note"><strong>${copy.fundingTitle}</strong> ${copy.fundingText} <a href="${links.vaults}">${copy.fundingLink}</a>.</div>
    </section>
  </main>
  <footer><div class="footer-row shell"><p>${copy.footer}</p><nav aria-label="Footer"><a href="${links.conceptDoi}">DOI</a><a href="${links.repository}">GitHub</a><a href="${links.discussions}">Discussion</a><a href="${links.contact}">${copy.contact}</a></nav></div></footer>
  <script src="../assets/cell.js" defer></script>
</body>
</html>`;
};

const rootPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#080a0f"><meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="description" content="K4 Cell Public Science — choose English or 简体中文.">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'">
  <link rel="canonical" href="https://k4cell.com/"><link rel="alternate" hreflang="en" href="https://k4cell.com/en/"><link rel="alternate" hreflang="zh-Hans" href="https://k4cell.com/zh/"><link rel="alternate" hreflang="x-default" href="https://k4cell.com/">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/site.css">
  <title>K4 Cell Public Science</title>
</head>
<body><main class="language-gate"><div class="language-gate-inner">${brandMark}<p class="eyebrow">K4 CELL PUBLIC SCIENCE</p><h1>Inside the K4 Cell.</h1><p>One finite geometry. A universe-scale question. An open test.<br>一个有限几何，一个宇宙尺度问题，一场公开检验。</p><div class="hero-actions"><a class="button primary" href="en/">English</a><a class="button" href="zh/">简体中文</a></div><p class="truth-line">K4V has not launched · K4V 尚未发行</p></div></main></body></html>`;

const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><link rel="stylesheet" href="./assets/site.css"><title>Not found · K4 Cell</title></head><body><main class="language-gate"><div class="language-gate-inner"><p class="eyebrow">404 / OPEN ROUTE</p><h1>This path is not part of the current cell.</h1><div class="hero-actions"><a class="button primary" href="./">Return to K4 Cell</a></div></div></main></body></html>`;

const status = {
  schema: "K4CELL-PUBLIC-STATUS-v1",
  recorded_at_utc: "2026-08-29",
  artifact_status: "PRELAUNCH_PREVIEW_NOINDEX",
  intended_canonical_domain: "k4cell.com",
  canonical_live: false,
  science: {
    state: "CANDIDATE_NOT_INDEPENDENTLY_ESTABLISHED",
    public_review: "2.0-public-review",
    public_review_frozen_at: "2026-07-08",
    public_review_commit: publicReviewCommit,
    public_status_commit: publicStatusCommit,
    peer_reviewed: false,
    full_physical_realization: "OPEN",
    full_scientific_reproduction_package: "OPEN",
  },
  public_science: {
    protocol: "FROZEN_DESIGN",
    season: "NOT_STARTED",
    start_gate: {
      public_review_status_sync: `PASS@${publicStatusCommit}`,
      founder_signed_no_official_mint: "OPEN",
      canonical_https_source_graph: "OPEN",
      twelve_card_and_metrics_hash_freeze: "OPEN"
    },
  },
  founder_identity: {
    state: "PUBLIC_OPENPGP_KEY_ANCHORED / NO_MINT_SIGNATURE_OPEN",
    uid: "Zhihua Liang <zhihua@k4cell.com>",
    algorithm: "Ed25519",
    fingerprint: "C74953F60AD573F54A3FD06C72213914E4860F47",
    public_key_path: "/provenance/K4V_FOUNDER_OPENPGP_KEY_v1.asc",
  },
  k4v: {
    launched: false,
    official_mint: null,
    presale: null,
    whitelist: null,
    payment_wallet: null,
    tge_date: null,
    mainnet_authorized: false,
  },
};

await rm(out, { recursive: true, force: true });
await mkdir(join(out, "en"), { recursive: true });
await mkdir(join(out, "zh"), { recursive: true });
await mkdir(join(out, "assets"), { recursive: true });
await mkdir(join(out, "provenance"), { recursive: true });
await cp(assets, join(out, "assets"), { recursive: true });
await cp(provenance, join(out, "provenance"), { recursive: true });
await writeFile(join(out, "index.html"), rootPage);
await writeFile(join(out, "en", "index.html"), renderPage("en", content.en));
await writeFile(join(out, "zh", "index.html"), renderPage("zh", content.zh));
await writeFile(join(out, "404.html"), notFound);
await writeFile(join(out, "status.json"), `${JSON.stringify(status, null, 2)}\n`);
await writeFile(join(out, "robots.txt"), "User-agent: *\nDisallow: /\n");
await writeFile(join(out, "_headers"), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
  X-Robots-Tag: noindex, nofollow, noarchive

/assets/*
  Cache-Control: public, max-age=3600
`);

const manifest = JSON.parse(await readFile(join(root, "content", "season-01", "MANIFEST.json"), "utf8"));
await writeFile(join(out, "season-01.json"), `${JSON.stringify(manifest, null, 2)}\n`);

const walk = async (directory) => {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path));
    else paths.push(path);
  }
  return paths;
};

const checksumLines = [];
for (const file of (await walk(out)).sort()) {
  const bytes = await readFile(file);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const relative = file.slice(out.length + 1);
  checksumLines.push(`${digest}  ${relative}`);
}
await writeFile(join(out, "SITE_SHA256SUMS.txt"), `${checksumLines.join("\n")}\n`);
