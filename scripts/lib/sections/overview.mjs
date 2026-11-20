import { overview } from "../../../src/copy/overview.js";
import { k4Glyph } from "../figures/deal.mjs";
import { esc, renderHead } from "../html.mjs";
import { links } from "../links.mjs";
import { renderConsoleShell } from "./shell.mjs";

const email = (subject, body) => `mailto:zhihua@k4cell.com?subject=${encodeURIComponent(subject)}&amp;body=${encodeURIComponent(body)}`;
const route = (lang, path = "") => `/${lang}/${path}`;
const button = (href, label, primary = false) => `<a class="button${primary ? " primary" : ""}" href="${href}">${esc(label)}</a>`;
const paragraph = (text) => `<p>${esc(text)}</p>`;
const sym = (text) => esc(text).replace(/_([A-Za-z*µμα-ω]+)/g, "<sub>$1</sub>");
const proofMetric = (text) => sym(text).replace(/(\d+(?:\.\d+)?)/, '<span class="num">$1</span>');

function consolePage(lang, kind, content, { themeColor, root = false, script = false, legacyIds = [] } = {}) {
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
  const langHref = root ? "zh/" : route(other, path);

  const pageUrl = `https://k4cell.com/${canonical}`;
  const jsonLd = kind === "home"
    ? {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: c.brand,
        url: pageUrl,
        description,
        inLanguage: lang === "zh" ? "zh-Hans" : "en",
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        url: pageUrl,
        description,
        inLanguage: lang === "zh" ? "zh-Hans" : "en",
        isPartOf: { "@type": "WebSite", name: c.brand, url: "https://k4cell.com/" },
      };

  const head = renderHead({
    description,
    title: esc(title),
    csp: "page",
    canonical,
    hreflangs,
    assetRoot: "/",
    themeColor,
    jsonLd,
    og: {
      title,
      description,
      url: pageUrl,
      image: `https://k4cell.com/assets/og-k4cell-${lang}.jpg`,
      locale: lang === "zh" ? "zh_CN" : "en_US",
    },
  });

  const footerContent = `<div class="ft-in overview-shell">
<div class="ft-brand"><span class="ft-name glitch" data-text="${esc(c.brand)}">${esc(c.brand)}</span><p class="ft-tag">${esc(c.brandTag)}</p></div>
<nav class="ft-links" aria-label="${esc(c.navLabel)}"><a href="${homeHref}">${esc(c.home)}</a><a href="${route(lang, "research.html")}">${esc(c.nav[1])}</a><a href="/predictions/">${esc(c.predictionsLabel)}</a><a href="/official-k4v/">${esc(c.official)}</a><a href="/status.json">status.json</a><a href="${links.repository}">GitHub</a></nav>
<p class="ft-credit">${esc(c.footer)} <strong>${esc(c.noMint)}</strong>${c.lang === "zh-Hans" ? "。" : "."}</p>
</div>`;

  const scripts = ["/assets/shell.js"];
  if (script) scripts.push({ src: "/assets/interest.js", module: true });
  if (kind === "home") scripts.push("/assets/overview.js");

  return renderConsoleShell({
    lang,
    kind,
    head,
    mainContent: content,
    footerContent,
    mainAttrs: kind === "home"
      ? `data-research-route="${route(lang, "research.html")}" data-legacy-anchors="${esc(legacyIds.join(" "))}"`
      : "",
    bodyClass: "overview-page",
    root,
    interactive: true,
    langHref,
    langClass: "overview-language",
    scripts,
  });
}

const figure = (c) => `<figure class="overview-object hp" aria-label="${esc(c.figure)}">
<header class="hp-head"><span class="hp-code mono">${esc(c.k4ObjCode)}</span><span class="hp-sub mono">${esc(c.k4ObjSub)}</span></header>
<div class="hp-body"><div class="orb">${k4Glyph}</div><figcaption>${esc(c.figure)}</figcaption></div>
</figure>`;

export function renderOverview(lang, options) {
  const c = overview[lang];
  const paperLinks = [links.pdf, links.targets, route(lang, "progress/"), "/predictions/"];
  const participationLinks = [route(lang, "research.html"), route(lang, "progress/#updates"), route(lang, "support/")];
  const readouts = c.readouts.map(([label, val, tone]) =>
    `<div class="readout"><span class="rl">${esc(label)}</span><span class="rv ${tone}">${esc(val)}</span></div>`).join("");
  const proof = c.proofCards.map(([label, metric, note, action, anchor]) =>
    `<article class="hp proof-hp"><header class="hp-head"><span class="hp-code mono">${esc(label.split(" / ")[0])}</span><span class="hp-sub">${esc(label.split(" / ").slice(1).join(" · "))}</span></header><div class="hp-body"><h3>${proofMetric(metric)}</h3><p>${sym(note)}</p><a class="hp-more" href="${route(lang, `research.html#${anchor}`)}">${esc(action)}</a></div></article>`).join("");
  return consolePage(lang, "home", `
<section class="overview-hero" id="hero"><div class="overview-shell">
<div class="hero-meta mono"><span class="path-tag">${esc(c.pathTag)}</span><span class="dot-sep" aria-hidden="true">·</span><p class="overview-status"><span class="dot ok" aria-hidden="true"></span><span>${esc(c.status)}</span> ${esc(c.date)}</p></div>
<div class="overview-hero-grid">
<div class="overview-hero-main"><p class="eyebrow">${esc(c.eyebrow)}</p>
<h1>${c.headline}</h1><p class="overview-lead">${esc(c.lead)}</p>
<div class="hero-readouts">${readouts}</div>
<div class="overview-proof">${proof}</div>
<p class="hero-actions">${button(route(lang, "research.html"), c.read, true)}${button(route(lang, "support/"), c.support)}</p>
<p class="overview-byline">${c.byline.map((line) => `<span>${esc(line)}</span>`).join("")}</p></div>
${figure(c)}
</div>
</div></section>
<section class="overview-section" id="home-object"><div class="overview-shell"><p class="eyebrow">K4 / 01</p><h2>${esc(c.introTitle)}</h2>
<div class="hp"><div class="hp-body overview-prose">${paragraph(c.intro)}<details><summary>${esc(c.detailTitle)}</summary>${paragraph(c.detail)}</details><p><a class="hp-more" href="${route(lang, "research.html#object")}">${esc(c.deep.replace(/\s*→\s*$/, ""))}</a></p></div></div></div></section>
<section class="overview-section" id="home-evidence"><div class="overview-shell"><p class="eyebrow">K4 / 02</p><h2>${esc(c.evidenceTitle)}</h2>
<div class="overview-grid">${c.evidenceCards.map(([tag, title, text, action, anchor]) => `<article class="hp"><header class="hp-head"><span class="hp-code mono">${esc(tag.split(" / ")[0])}</span><span class="hp-sub">${esc(tag.split(" / ")[1] || "")}</span></header><div class="hp-body"><h3>${sym(title)}</h3><p>${sym(text)}</p><a class="hp-more" href="${route(lang, `research.html#${anchor}`)}">${esc(action)}</a></div></article>`).join("")}</div></div></section>
<section class="overview-section" id="home-papers"><div class="overview-shell"><p class="eyebrow">K4 / 03</p><h2>${esc(c.papersTitle)}</h2>
<div class="overview-paper-list hp">${c.papers.map(([tag, title, text], i) => `<a href="${paperLinks[i]}"><span class="mono">${esc(tag)}</span><strong>${esc(title)}</strong><span>${esc(text)} →</span></a>`).join("")}</div></div></section>
<section class="overview-section" id="home-participate"><div class="overview-shell"><p class="eyebrow">K4 / 04</p><h2>${esc(c.participateTitle)}</h2>
<div class="overview-grid">${c.participate.map(([title, text, action], i) => `<article class="hp"><div class="hp-body"><h3>${esc(title)}</h3>${paragraph(text)}<a class="hp-more" href="${participationLinks[i]}">${esc(action)}</a></div></article>`).join("")}</div></div></section>`, options);
}

export function renderProgress(lang, options) {
  const c = overview[lang];
  const urls = [links.pdf, "/predictions/", route(lang, "research.html")];
  return consolePage(lang, "progress", `<section class="overview-section overview-intro"><div class="overview-shell"><p class="eyebrow">${esc(c.date)}</p><h1>${esc(c.progressHeading)}</h1><p class="overview-lead">${esc(c.progressNote)}</p>
<ol class="overview-timeline">${c.progressRows.map(([date, title, text], i) => `<li class="hp"><div class="hp-body timeline-row"><time datetime="${date}">${date}</time><div><h2>${esc(title)}</h2>${paragraph(text)}<a class="hp-more" href="${urls[i]}">${esc(c.progressRowActions[i])}</a></div></div></li>`).join("")}</ol>
<p class="overview-prose">${esc(c.journalNote)} <a href="${links.repository}">GitHub →</a></p>
</div></section><section class="overview-section" id="updates"><div class="overview-shell"><div class="hp"><header class="hp-head"><span class="hp-code mono">UPDATES</span><h2 class="hp-title">${esc(c.updatesHeading)}</h2></header><div class="hp-body">${paragraph(c.updatesNote)}
<p class="hero-actions">${button(email(`K4 research updates / ${lang}`, lang === "zh" ? "我想了解的研究主题：\n\n是否愿意接收后续研究更新（请自行填写）：\n" : "Research topics I would like to follow:\n\nMay I be contacted with future research updates? (please fill in):\n"), c.updatesCta, true)}</p>${paragraph(c.mailNote)}</div></div></div></section>`, options);
}

export function renderSupport(lang, options) {
  const c = overview[lang];
  const bottomUrls = [route(lang, "research.html"), route(lang, "progress/#updates"), "/predictions/"];
  return consolePage(lang, "support", `<section class="overview-section overview-intro"><div class="overview-shell"><p class="eyebrow">${esc(c.supportEyebrow)}</p><h1>${esc(c.supportHeading)}</h1><p class="overview-lead">${esc(c.supportLead)}</p>
<p class="hero-actions">${button(email(`K4 research support / ${lang}`, lang === "zh" ? "希望支持或合作的研究方向：\n我可以提供的支持：\n需先确认的问题：\n是否同意就此沟通跟进（请填写）：\n" : "Research area I would like to support or collaborate on:\nSupport I could provide:\nQuestions to clarify first:\nMay I be contacted about this discussion? (please fill in):\n"), c.supportCta, true)}</p>${paragraph(c.mailNote)}</div></section>
<section class="overview-section" id="roadmap"><div class="overview-shell"><h2>${esc(c.workHeading)}</h2><div class="overview-grid overview-grid-two">${c.work.map(([title, text], idx) => `<article class="hp"><header class="hp-head"><span class="hp-code mono">0${idx + 1}</span><span class="hp-sub">${esc(title)}</span></header><div class="hp-body">${paragraph(text)}</div></article>`).join("")}</div><p class="overview-prose fine">${esc(c.workNote)}</p></div></section>
<section class="overview-section"><div class="overview-shell"><h2>${esc(c.participateTitle)}</h2><div class="overview-grid">${c.supportBottomCards.map(([title, text, action], i) => `<article class="hp"><div class="hp-body"><h3>${esc(title)}</h3>${paragraph(text)}<a class="hp-more" href="${bottomUrls[i]}">${esc(action)}</a></div></article>`).join("")}</div>
<p class="support-k4v-sep">${lang === "zh"
    ? `注：未来如考量与公众关注相关的纯纪念性代币（K4V）草案，该机制与上述科研资助完全隔离，不涉及任何股权、额度分配或收益权利。<a href="/official-k4v/">核验 K4V 尚未发行官方声明</a> · <a href="${route(lang, "interest/")}">查看早期方案并提交非约束反馈</a>`
    : `Separate gate: any hypothetical K4V meme token proposal stays strictly separate from research patronage and confers no equity, allocation, or rights. <a href="/official-k4v/">Verify the no-mint attestation</a> · <a href="${route(lang, "interest/")}">Read the K4V proposal &amp; early feedback form</a>`}</p></div></section>`, options);
}

export function renderInterest(lang, options) {
  const c = overview[lang];
  const select = (name, labels, values) => `<select id="${name}" name="${name}" required><option value="">${esc(c.choose)}</option>${labels.map((label, i) => `<option value="${values[i]}">${esc(label)}</option>`).join("")}</select>`;
  const question = (i, field, limit = 0) => `<div class="interest-question"><div class="interest-qhead"><label for="q${i + 1}">${i + 1}. ${esc(c.questions[i])}</label>${limit ? `<span class="interest-count" data-count-for="q${i + 1}">0 / ${limit}</span>` : ""}</div>${field}</div>`;
  return consolePage(lang, "interest", `<section class="overview-section overview-intro"><div class="overview-shell"><p class="eyebrow">${esc(c.proposalLabel)}</p><h1>${esc(c.interestHeading)}</h1><p class="overview-lead">${esc(c.interestLead)}</p>
<div class="hp"><div class="hp-body"><dl class="overview-terms">${c.terms.map(([title, text]) => `<div><dt>${esc(title)}</dt><dd>${esc(text)}</dd></div>`).join("")}</dl><p><a class="hp-more" href="https://github.com/magicknight/k4v-research-funding-vaults">${lang === "zh" ? "查看公开金库工程及当前限制" : "Inspect the public vault engineering and current limitations"}</a></p></div></div></div></section>
<section class="overview-section"><div class="overview-shell"><noscript>${paragraph(c.noscript)}</noscript><form id="interest-form" class="hp" data-language="${lang}"><div class="hp-body">
${c.questions.map((_, i) => question(i, i === 2 ? select("q3", c.interests, ["NO", "LEARN", "CONDITIONAL_SMALL", "INCLINED"]) : i === 5 ? select("q6", c.revisit, ["YES", "NO", "UNSURE"]) : `<textarea id="q${i + 1}" name="q${i + 1}" rows="2" maxlength="160" required></textarea>`, (i === 2 || i === 5) ? 0 : 160)).join("")}
<div class="interest-question"><div class="interest-qhead"><label for="contact">${esc(c.optionalContact)}</label><span class="interest-count" data-count-for="contact">0 / 100</span></div><input id="contact" name="contact" maxlength="100" autocomplete="off"></div>
<div class="interest-question"><div class="interest-qhead"><label for="channel">${esc(c.optionalChannel)}</label><span class="interest-count" data-count-for="channel">0 / 80</span></div><input id="channel" name="channel" maxlength="80" autocomplete="off"></div>
<label class="interest-consent"><input type="checkbox" name="consent" id="consent"> <span>${esc(c.consent)}</span></label>
<p class="interest-privacy">${esc(c.privacy)}</p>
<button class="button primary" type="button" id="prepare-email">${esc(c.prepare)}</button>
<p id="draft-status" role="status" aria-live="polite"></p>
<div id="draft-preview" hidden><label for="draft-body">${esc(c.preview)}</label><textarea id="draft-body" readonly rows="14"></textarea>
<div class="draft-actions">${button("mailto:zhihua@k4cell.com", c.send, true).replace('<a ', '<a id="open-email" ')}<button type="button" class="button" id="copy-draft">${esc(c.copyDraft)}</button></div><p id="draft-warn" class="draft-warn" hidden></p>${paragraph(c.fallbackNote)}</div>
</div></form><p class="overview-prose"><a href="${email(`K4V early feedback / K4V-180D-2026-09-09 / ${lang}`, c.questions.map((q, i) => `${i + 1}. ${q}\n\n`).join("\n") + (lang === "zh" ? "是否同意一次跟进（请自行填写）：\n" : "Consent to one follow-up? (please fill in):\n"))}">${esc(c.fallback)}</a> · zhihua@k4cell.com</p></div></section>`, { ...options, script: true });
}
