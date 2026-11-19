import { overview } from "../../../src/copy/overview.js";
import { k4Glyph } from "../figures/deal.mjs";
import { brandMark, esc, renderHead } from "../html.mjs";
import { links } from "../links.mjs";

const email = (subject, body) => `mailto:zhihua@k4cell.com?subject=${encodeURIComponent(subject)}&amp;body=${encodeURIComponent(body)}`;
const route = (lang, path = "") => `/${lang}/${path}`;
const button = (href, label, primary = false) => `<a class="button${primary ? " primary" : ""}" href="${href}">${esc(label)}</a>`;
const paragraph = (text) => `<p>${esc(text)}</p>`;
const sym = (text) => esc(text).replace(/_([A-Za-z*µμα-ω]+)/g, "<sub>$1</sub>");
const proofMetric = (text) => sym(text).replace(/(\d+(?:\.\d+)?)/, '<span class="num">$1</span>');

function shell(lang, kind, content, { themeColor, root = false, script = false, legacyIds = [] } = {}) {
  const c = overview[lang];
  const other = lang === "zh" ? "en" : "zh";
  const path = kind === "home" ? "" : `${kind}/`;
  const title = kind === "home" ? c.title : `${c[`${kind}Heading`]} · ${c.brand}`;
  const canonical = (root || (kind === "home" && lang === "en")) ? "" : `${lang}/${path}`;
  const description = kind === "home" ? c.lead : c[`${kind}Lead`] || c.progressNote;
  const hreflangs = kind === "home"
    ? [["en", ""], ["zh-Hans", "zh/"], ["x-default", ""]]
    : [["en", `en/${path}`], ["zh-Hans", `zh/${path}`], ["x-default", `en/${path}`]];
  const homeHref = root ? "/" : route(lang);
  return `<!doctype html>
<html lang="${c.lang}">
${renderHead({
    description,
    title: esc(title),
    csp: "page",
    canonical,
    hreflangs,
    assetRoot: "/",
    themeColor,
    og: {
      title,
      description,
      url: `https://k4cell.com/${canonical}`,
      image: `https://k4cell.com/assets/og-k4cell-${lang}.jpg`,
      locale: lang === "zh" ? "zh_CN" : "en_US",
    },
  })}
<body class="overview-page">
<a class="skip" href="#main">${lang === "zh" ? "跳到正文" : "Skip to content"}</a>
<header class="overview-header"><div class="overview-shell overview-bar">
<a class="brand" href="${homeHref}">${brandMark}<span>${esc(c.brand)}</span></a>
<nav aria-label="${esc(c.navLabel)}">
<a href="${homeHref}"${kind === "home" ? ' aria-current="page"' : ""}>${esc(c.nav[0])}</a>
<a href="${route(lang, "research.html")}">${esc(c.nav[1])}</a>
<a href="${route(lang, "progress/")}"${kind === "progress" ? ' aria-current="page"' : ""}>${esc(c.nav[2])}</a>
<a href="/predictions/">${esc(c.nav[3])}</a>
<a href="${route(lang, "support/")}"${kind === "support" ? ' aria-current="page"' : ""}>${esc(c.nav[4])}</a>
</nav>
<a class="overview-language" href="${root ? "zh/" : route(other, path)}" hreflang="${overview[other].lang}" lang="${overview[other].lang}">${esc(c.other)}</a>
</div></header>
<main id="main" class="overview-shell"${kind === "home" ? ` data-research-route="${route(lang, "research.html")}" data-legacy-anchors="${esc(legacyIds.join(" "))}"` : ""}>${content}</main>
<footer class="overview-footer"><div class="overview-shell">
${paragraph(c.footer)}<p><strong>${esc(c.noMint)}</strong> · <a href="/official-k4v/">${esc(c.official)}</a></p>
<p><a href="${homeHref}">${esc(c.home)}</a> · <a href="/predictions/">${esc(c.predictionsLabel)}</a> · <a href="/status.json">status.json</a> · <a href="${links.repository}">GitHub</a></p>
</div></footer>
${script ? '<script type="module" src="/assets/interest.js"></script>' : ""}
${kind === "home" ? '<script src="/assets/overview.js" defer></script>' : ""}
</body></html>\n`;
}

const figure = (c) => `<figure class="overview-object" aria-label="${esc(c.figure)}"><div class="orb">${k4Glyph}</div><figcaption>${esc(c.figure)}</figcaption></figure>`;

export function renderOverview(lang, options) {
  const c = overview[lang];
  const paperLinks = [links.pdf, links.targets, route(lang, "progress/"), "/predictions/"];
  const participationLinks = [route(lang, "research.html"), route(lang, "progress/#updates"), route(lang, "support/")];
  const proof = c.proofCards.map(([label, metric, note, action, anchor]) =>
    `<article><p class="eyebrow">${esc(label)}</p><h3>${proofMetric(metric)}</h3><p>${sym(note)}</p><a href="${route(lang, `research.html#${anchor}`)}">${esc(action)} →</a></article>`).join("");
  return shell(lang, "home", `
<section class="overview-hero" id="hero"><div><p class="eyebrow">${esc(c.eyebrow)}</p>
<h1>${c.headline}</h1><p class="overview-lead">${esc(c.lead)}</p>
<div class="overview-proof">${proof}</div>
<p class="hero-actions">${button(route(lang, "research.html"), c.read, true)}${button(route(lang, "support/"), c.support)}</p>
<p class="overview-status"><span>${esc(c.status)}</span> ${esc(c.date)}</p>
<p class="overview-byline">${c.byline.map((line) => `<span>${esc(line)}</span>`).join("")}</p></div>${figure(c)}</section>
<section class="overview-section" id="home-object"><p class="eyebrow">K4 / 01</p><h2>${esc(c.introTitle)}</h2>
<div class="overview-prose">${paragraph(c.intro)}<details><summary>${esc(c.detailTitle)}</summary>${paragraph(c.detail)}</details><p><a href="${route(lang, "research.html#object")}">${esc(c.deep)}</a></p></div></section>
<section class="overview-section" id="home-evidence"><p class="eyebrow">K4 / 02</p><h2>${esc(c.evidenceTitle)}</h2>
<div class="overview-grid">${c.evidenceCards.map(([tag, title, text, action, anchor]) => `<article><p class="eyebrow">${esc(tag)}</p><h3>${sym(title)}</h3><p>${sym(text)}</p><a href="${route(lang, `research.html#${anchor}`)}">${esc(action)} →</a></article>`).join("")}</div></section>
<section class="overview-section" id="home-papers"><p class="eyebrow">K4 / 03</p><h2>${esc(c.papersTitle)}</h2>
<div class="overview-paper-list">${c.papers.map(([tag, title, text], i) => `<a href="${paperLinks[i]}"><span>${esc(tag)}</span><strong>${esc(title)}</strong><span>${esc(text)} →</span></a>`).join("")}</div></section>
<section class="overview-section" id="home-participate"><p class="eyebrow">K4 / 04</p><h2>${esc(c.participateTitle)}</h2>
<div class="overview-grid">${c.participate.map(([title, text, action], i) => `<article><h3>${esc(title)}</h3>${paragraph(text)}<a href="${participationLinks[i]}">${esc(action)} →</a></article>`).join("")}</div></section>`, options);
}

export function renderProgress(lang, options) {
  const c = overview[lang];
  const urls = [links.pdf, "/predictions/", route(lang, "research.html")];
  return shell(lang, "progress", `<section class="overview-section overview-intro"><p class="eyebrow">${esc(c.date)}</p><h1>${esc(c.progressHeading)}</h1>${paragraph(c.progressNote)}
<ol class="overview-timeline">${c.progressRows.map(([date, title, text], i) => `<li><time datetime="${date}">${date}</time><div><h2>${esc(title)}</h2>${paragraph(text)}<a href="${urls[i]}">${esc(c.progressRowActions[i])} →</a></div></li>`).join("")}</ol>
<p>${esc(c.journalNote)} <a href="${links.repository}">GitHub →</a></p>
</section><section class="overview-section" id="updates"><h2>${esc(c.updatesHeading)}</h2>${paragraph(c.updatesNote)}
${button(email(`K4 research updates / ${lang}`, lang === "zh" ? "我想了解的研究主题：\n\n是否愿意接收后续研究更新（请自行填写）：\n" : "Research topics I would like to follow:\n\nMay I be contacted with future research updates? (please fill in):\n"), c.updatesCta, true)}${paragraph(c.mailNote)}</section>`, options);
}

export function renderSupport(lang, options) {
  const c = overview[lang];
  const bottomUrls = [route(lang, "research.html"), route(lang, "progress/#updates"), "/predictions/"];
  return shell(lang, "support", `<section class="overview-section overview-intro"><p class="eyebrow">${esc(c.supportEyebrow)}</p><h1>${esc(c.supportHeading)}</h1><p class="overview-lead">${esc(c.supportLead)}</p>
${button(email(`K4 research support / ${lang}`, lang === "zh" ? "想支持或合作的工作包：\n我可以提供的支持：\n我想先确认的问题：\n是否同意就此次讨论跟进（请填写）：\n" : "Work package I would like to support or collaborate on:\nSupport I could provide:\nQuestions to clarify first:\nMay I be contacted about this discussion? (please fill in):\n"), c.supportCta, true)}${paragraph(c.mailNote)}</section>
<section class="overview-section" id="roadmap"><h2>${esc(c.workHeading)}</h2><div class="overview-grid overview-grid-two">${c.work.map(([title, text]) => `<article><h3>${esc(title)}</h3>${paragraph(text)}</article>`).join("")}</div>${paragraph(c.workNote)}</section>
<section class="overview-section"><h2>${esc(c.participateTitle)}</h2><div class="overview-grid">${c.supportBottomCards.map(([title, text, action], i) => `<article><h3>${esc(title)}</h3>${paragraph(text)}<a href="${bottomUrls[i]}">${esc(action)} →</a></article>`).join("")}</div>
<p class="support-k4v-sep">${lang === "zh"
    ? `注：未来如考虑与研究关注相关的纯 meme 代币方案（K4V），该机制与上述研究资助完全隔离，不涉及股权、分配或任何收益权利。<a href="/official-k4v/">核验 K4V 尚未发行声明</a> · <a href="${route(lang, "interest/")}">查看早期方案并提交非约束反馈</a>`
    : `Separate gate: any hypothetical K4V meme token proposal stays strictly separate from research patronage and confers no equity, allocation, or rights. <a href="/official-k4v/">Verify the no-mint attestation</a> · <a href="${route(lang, "interest/")}">Read the K4V proposal &amp; early feedback form</a>`}</p></section>`, options);
}

export function renderInterest(lang, options) {
  const c = overview[lang];
  const select = (name, labels, values) => `<select id="${name}" name="${name}" required><option value="">${esc(c.choose)}</option>${labels.map((label, i) => `<option value="${values[i]}">${esc(label)}</option>`).join("")}</select>`;
  const question = (i, field, limit = 0) => `<div class="interest-question"><div class="interest-qhead"><label for="q${i + 1}">${i + 1}. ${esc(c.questions[i])}</label>${limit ? `<span class="interest-count" data-count-for="q${i + 1}">0 / ${limit}</span>` : ""}</div>${field}</div>`;
  return shell(lang, "interest", `<section class="overview-section overview-intro"><p class="eyebrow">${esc(c.proposalLabel)}</p><h1>${esc(c.interestHeading)}</h1><p class="overview-lead">${esc(c.interestLead)}</p>
<dl class="overview-terms">${c.terms.map(([title, text]) => `<div><dt>${esc(title)}</dt><dd>${esc(text)}</dd></div>`).join("")}</dl><p><a href="https://github.com/magicknight/k4v-research-funding-vaults">${lang === "zh" ? "查看公开金库工程及当前限制" : "Inspect the public vault engineering and current limitations"} →</a></p></section>
<section class="overview-section"><noscript>${paragraph(c.noscript)}</noscript><form id="interest-form" data-language="${lang}">
${c.questions.map((_, i) => question(i, i === 2 ? select("q3", c.interests, ["NO", "LEARN", "CONDITIONAL_SMALL", "INCLINED"]) : i === 5 ? select("q6", c.revisit, ["YES", "NO", "UNSURE"]) : `<textarea id="q${i + 1}" name="q${i + 1}" rows="2" maxlength="160" required></textarea>`, (i === 2 || i === 5) ? 0 : 160)).join("")}
<div class="interest-question"><div class="interest-qhead"><label for="contact">${esc(c.optionalContact)}</label><span class="interest-count" data-count-for="contact">0 / 100</span></div><input id="contact" name="contact" maxlength="100" autocomplete="off"></div>
<div class="interest-question"><div class="interest-qhead"><label for="channel">${esc(c.optionalChannel)}</label><span class="interest-count" data-count-for="channel">0 / 80</span></div><input id="channel" name="channel" maxlength="80" autocomplete="off"></div>
<label class="interest-consent"><input type="checkbox" name="consent" id="consent"> <span>${esc(c.consent)}</span></label>
<p class="interest-privacy">${esc(c.privacy)}</p>
<button class="button primary" type="button" id="prepare-email">${esc(c.prepare)}</button>
<p id="draft-status" role="status" aria-live="polite"></p>
<div id="draft-preview" hidden><label for="draft-body">${esc(c.preview)}</label><textarea id="draft-body" readonly rows="14"></textarea>
<div class="draft-actions">${button("mailto:zhihua@k4cell.com", c.send, true).replace('<a ', '<a id="open-email" ')}<button type="button" class="button" id="copy-draft">${esc(c.copyDraft)}</button></div><p id="draft-warn" class="draft-warn" hidden></p>${paragraph(c.fallbackNote)}</div>
</form><p><a href="${email(`K4V early feedback / K4V-180D-2026-09-09 / ${lang}`, c.questions.map((q, i) => `${i + 1}. ${q}\n\n`).join("\n") + (lang === "zh" ? "是否同意一次跟进（请自行填写）：\n" : "Consent to one follow-up? (please fill in):\n"))}">${esc(c.fallback)}</a> · zhihua@k4cell.com</p></section>`, { ...options, script: true });
}
