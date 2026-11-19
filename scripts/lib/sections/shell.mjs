import { overview } from "../../../src/copy/overview.js";
import { brandMark, esc } from "../html.mjs";
import { links } from "../links.mjs";

const route = (lang, path = "") => `/${lang}/${path}`;

const ICONS = {
  home: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 4l8 7.5V20h-5.5v-5h-5v5H4z"/></svg>',
  research: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 4.5 19.5h15Zm0 0v10.5M4.5 19.5l7.5-5.5 7.5 5.5"/></svg>',
  progress: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12h3.5l2.5-6.5 4 13 2.8-6.5H20.5"/></svg>',
  predictions: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><path d="M12 2v3.5m0 13V22M2 12h3.5m13 0H22"/></svg>',
  support: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5v15M4.5 12h15"/></svg>',
  lock: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  doc: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4v13H6zM14 3.5v4.5h4.5"/></svg>',
  search: '<svg class="cmd-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/></svg>',
  sunMoon: '<svg class="th-ico th-auto" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><path d="M12 4.5a7.5 7.5 0 0 1 0 15z" fill="currentColor" stroke="none"/></svg>'
    + '<svg class="th-ico th-light" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>'
    + '<svg class="th-ico th-dark" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/></svg>',
};

const PROV_ICONS = [ICONS.lock, ICONS.doc, ICONS.doc, ICONS.doc];

export function renderConsoleShell({
  lang,
  kind,
  head,
  mainContent,
  footerContent,
  mainAttrs = "",
  bodyClass = "",
  root = false,
  interactive = true,
  brandName,
  brandTagline = "",
  skipLabel,
  langHref,
  langClass = "overview-language",
  langLabel,
  altHtmlLang,
  scripts = [],
}) {
  const c = overview[lang];
  const homeHref = root ? "/" : route(lang);
  const channels = [
    { id: "home", code: c.channelCodes[0], label: c.nav[0], tab: c.tabLabels[0], href: homeHref, icon: ICONS.home },
    { id: "research", code: c.channelCodes[1], label: c.nav[1], tab: c.tabLabels[1], href: route(lang, "research.html"), icon: ICONS.research },
    { id: "progress", code: c.channelCodes[2], label: c.nav[2], tab: c.tabLabels[2], href: route(lang, "progress/"), icon: ICONS.progress },
    { id: "predictions", code: c.channelCodes[3], label: c.nav[3], tab: c.nav[3], href: "/predictions/", icon: ICONS.predictions },
    { id: "support", code: c.channelCodes[4], label: c.nav[4], tab: c.tabLabels[3], href: route(lang, "support/"), icon: ICONS.support },
  ];

  const railLinks = channels.map((ch) => {
    const cur = kind === ch.id ? ' aria-current="page"' : "";
    return `<a href="${ch.href}" class="it"${cur} title="${esc(ch.label)}" aria-label="${esc(ch.label)}"><span class="no mono" aria-hidden="true">${ch.code}</span>${ch.icon}<span class="lb">${esc(ch.label)}</span></a>`;
  }).join("");

  const provLinks = c.railProvenance.map(([label, href], idx) =>
    `<a href="${href}" class="it sub-it" title="${esc(label)}" aria-label="${esc(label)}">${PROV_ICONS[idx]}<span class="lb">${esc(label)}</span></a>`,
  ).join("");

  const tabLinks = [channels[0], channels[1], channels[2], channels[4]].map((ch) => {
    const cur = kind === ch.id ? ' aria-current="page"' : "";
    return `<a href="${ch.href}" class="tab"${cur}>${ch.icon}<span>${esc(ch.tab)}</span></a>`;
  }).join("");

  const cmdTrigger = interactive
    ? `<button type="button" class="cmd" id="cmd-trigger" aria-label="${esc(c.cmdAria)}" aria-haspopup="dialog"><span class="cmd-gt mono" aria-hidden="true">&gt;</span>${ICONS.search}<span class="cmd-txt">${esc(c.cmdPlaceholder)}</span><span class="cmd-keys" aria-hidden="true"><span class="kbd">Ctrl</span><span class="kbd">K</span></span></button>`
    : "";

  const interactiveTools = interactive
    ? `<button class="tool fx" id="fx-toggle" type="button" aria-pressed="true" aria-label="${esc(c.fxLabel)}"><span class="dot ok" aria-hidden="true"></span><span class="fx-txt">FX</span></button><button class="tool theme" id="theme-toggle" type="button" aria-label="${esc(c.themeLabel)}">${ICONS.sunMoon}<span class="theme-txt">DARK</span></button>`
    : "";

  const railFoot = interactive
    ? `<div class="rail-foot"><button type="button" class="keys" id="rail-keys-btn" aria-label="${esc(c.shortcutsLabel)}"><span class="kbd">?</span><span class="keys-t">${esc(c.shortcutsLabel)}</span></button></div>`
    : "";

  const resolvedBrand = brandName || c.brand;
  const resolvedSkip = skipLabel || c.skipLabel;
  const resolvedLangLabel = langLabel || c.other;
  const resolvedAltLang = altHtmlLang || overview[lang === "zh" ? "en" : "zh"].lang;
  const taglineEl = brandTagline ? `<span class="brand-t">${esc(brandTagline)}</span>` : "";

  return `<!doctype html>
<html lang="${c.lang}">
${head}
<body${bodyClass ? ` class="${esc(bodyClass)}"` : ""}>
<div class="app-shell">
<a class="skip" href="#main">${esc(resolvedSkip)}</a>
<header class="hd topbar sh-top"><div class="hd-in topbar-inner">
<a class="brand" href="${homeHref}">${brandMark}<span class="brand-name glitch" data-text="${esc(resolvedBrand)}">${esc(resolvedBrand)}</span>${taglineEl}</a>
${cmdTrigger}
<div class="tools">${interactiveTools}<a class="${esc(langClass)}" href="${langHref}" hreflang="${resolvedAltLang}" lang="${resolvedAltLang}">${esc(resolvedLangLabel)}</a></div>
</div></header>
<aside class="rail sh-rail overview-bar" aria-label="${esc(c.railNavLabel)}">
<nav class="sec-railnav" aria-label="${esc(c.navLabel)}">${railLinks}</nav>
<div class="rail-group"><p class="rail-group-title">${esc(c.railProvenanceTitle)}</p><nav class="rail-subnav" aria-label="${esc(c.railProvenanceTitle)}">${provLinks}</nav></div>
${railFoot}
</aside>
<main id="main" class="sh-main"${mainAttrs ? ` ${mainAttrs}` : ""}>
${mainContent}
</main>
<footer class="ft sh-foot">${footerContent}</footer>
<nav class="tabbar" aria-label="${esc(c.navLabel)}">${tabLinks}</nav>
</div>
${scripts.map((s) => (typeof s === "string"
    ? `<script src="${s}" defer></script>`
    : `<script type="module" src="${s.src}"></script>`)).join("\n")}
</body>
</html>\n`;
}

export { links };
