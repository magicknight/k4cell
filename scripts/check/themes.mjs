/* ------------------------------------------------------------------ *
 * THEMES. assets/site.css is assembled from source files             *
 * (scripts/lib/theme.mjs): the masthead comment, ONE palette out of   *
 * src/assets/themes/, the body of rules, and that palette's optional  *
 * override sheet. This module guards the ways that shape can be       *
 * abused.                                                             *
 *                                                                     *
 * 1. A theme may not carry a RULE. It is a palette, not a second      *
 *    stylesheet: anything outside its one `:root{…}` block must be a  *
 *    comment. Without this a theme could restyle the page — or slip a  *
 *    hex past scripts/check/budgets.mjs, whose gate only reads the     *
 *    emitted sheet AFTER the first `}`.                                *
 * 2. A theme may not DROP a name. The server-rendered figures ask for  *
 *    --c1/2/3 and their -lt twins, --fig-bg/--fig-fg, --text*,         *
 *    --rule*, --alert, --cut, --paper-hi, --card, --accent, --link and *
 *    --fact; a missing one is a drawing that loses its colour with     *
 *    every other gate green. So every theme must declare exactly the   *
 *    same set of custom property names — no more, no fewer.            *
 *                                                                     *
 * 3. A theme's optional <name>.overrides.css is the escape hatch for   *
 *    what a token cannot say — a name that must hold two colours in    *
 *    two places, which is what a section that inverts its ground       *
 *    needs. It is the ONE place a palette may write a rule, so it is   *
 *    fenced: it may only set names the contract already holds, it may  *
 *    not open a second :root, and it may not smuggle in a colour —     *
 *    every value it writes has to come from the token block.           *
 *                                                                     *
 * The emitted sheet is then tied back to the sources: it must BE the   *
 * concatenation of one of them, so a hand edit to site/assets/site.css *
 * fails the build rather than surviving to the next rebuild.           *
 * ------------------------------------------------------------------ */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  DEFAULT_THEME, GROUND_TOKEN, OVERRIDES_SUFFIX, bodyPath, composeStylesheet, groundOf, headPath,
  listOverrides, listThemes, outsideRootBlock, readOverrides, readTheme, rootBlockOf,
} from "../lib/theme.mjs";
import { srcAssets } from "../lib/paths.mjs";
import { chinese, css, english, noticeEn, noticeZh, notFoundPage, officialPage, rootPage } from "./common.mjs";

/* A declaration head: after `{`, `;` or a newline, so a `--name:` written
   inside a value string is not mistaken for one. */
const DECLARATION = /(?:^|[{;\n])\s*(--[a-zA-Z0-9_-]+)\s*:/g;
const uncomment = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "");
const tokenNames = (block) => [...uncomment(block).matchAll(DECLARATION)].map((match) => match[1]);

/* The names the figure CSS reads. This list is a floor under the "every theme
   agrees with the default" gate below: without it, the default theme could drop
   a name and every theme would agree about its absence. */
export const REQUIRED_TOKENS = [
  "--c1", "--c2", "--c3", "--c1-lt", "--c2-lt", "--c3-lt",
  "--fig-bg", "--fig-fg",
  "--text", "--text-2", "--text-3",
  "--rule", "--rule-2", "--rule-3",
  "--alert", "--cut", "--paper-hi", "--card", "--accent", "--link", "--fact",
];

const themes = await listThemes();
assert.ok(themes.length > 0, "src/assets/themes/ holds no palette");
assert.ok(themes.includes(DEFAULT_THEME), `the default theme ${DEFAULT_THEME} is missing from src/assets/themes/`);

/* ---- the masthead names nothing ---- */

/* Everything before the token block lands in the region budgets.mjs treats as
   "the token block" and never scans for stray hex. Keeping it comment-only is
   what makes that exemption safe. */
const head = await readFile(headPath, "utf8");
assert.equal(uncomment(head).trim(), "",
  "src/assets/site-head.css is the sheet's masthead; it must be comments only, never a rule");

/* ---- each theme is one :root block and nothing else ---- */

const contract = new Map();
for (const theme of themes) {
  const source = await readTheme(theme);
  const where = `themes/${theme}.css`;

  const outside = uncomment(outsideRootBlock(source)).trim();
  assert.equal(outside, "",
    `${where} carries something outside its :root block: ${outside.slice(0, 120)}`);

  const block = rootBlockOf(source, where);
  assert.equal((block.match(/\{/g) ?? []).length, 1, `${where}: the :root block must not nest a block`);
  assert.equal((block.match(/\}/g) ?? []).length, 1, `${where}: the :root block must not nest a block`);
  assert.doesNotMatch(uncomment(source), /@[a-z-]+/i, `${where}: a theme may not carry an at-rule`);

  const names = tokenNames(block);
  const duplicated = names.filter((name, index) => names.indexOf(name) !== index);
  assert.deepEqual(duplicated, [], `${where} declares ${duplicated.join(", ")} twice`);
  contract.set(theme, names.slice().sort());
}

/* ---- every theme defines the same names as the default one ---- */

export const tokenContract = contract.get(DEFAULT_THEME);
for (const token of REQUIRED_TOKENS) {
  assert.ok(tokenContract.includes(token),
    `themes/${DEFAULT_THEME}.css no longer defines ${token}; a figure reads it`);
}
for (const theme of themes) {
  assert.deepEqual(contract.get(theme), tokenContract,
    `themes/${theme}.css does not define the same custom properties as themes/${DEFAULT_THEME}.css`);
}

/* ---- an override sheet is fenced ----
   The one place a palette may carry a rule. Everything it may do is a
   consequence of one sentence: a token cannot hold two values on two
   grounds, and #kill is a second ground. */

for (const theme of await listOverrides()) {
  const where = `themes/${theme}${OVERRIDES_SUFFIX}`;
  assert.ok(themes.includes(theme),
    `${where} overrides a palette that does not exist; src/assets/themes/ holds ${themes.join(", ")}`);

  const source = uncomment(await readOverrides(theme));
  assert.doesNotMatch(source, /:root\b/,
    `${where} opens a :root block; a palette belongs in themes/${theme}.css, not in its overrides`);
  assert.doesNotMatch(source, /@(?!media\b|supports\b)[a-z-]+/i,
    `${where}: an override may carry @media and @supports and no other at-rule`);

  /* No colour of its own. A hex here would sit after the token block and
     budgets.mjs only reads the DEFAULT build's sheet, so this is the gate
     that keeps a non-default palette honest; rgb()/hsl()/named colours are
     refused for the same reason, since the rule is "every colour is a
     token", not "every colour is spelled in hex". */
  const literal = [
    ...source.matchAll(/#[0-9a-fA-F]{3,8}\b/g),
    ...source.matchAll(/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g),
  ].map((match) => match[0]);
  assert.deepEqual(literal, [],
    `${where} writes a colour of its own (${literal.join(", ")}); an override may only point at a token`);

  const declared = [...new Set(tokenNames(source))].sort();
  const unknown = declared.filter((name) => !contract.get(DEFAULT_THEME).includes(name));
  assert.deepEqual(unknown, [],
    `${where} declares ${unknown.join(", ")}, which no palette holds; a theme may not invent a private token`);
  assert.ok(declared.length > 0, `${where} sets nothing; delete it rather than shipping an empty override`);
}

/* ---- the emitted sheet is one of those themes, unedited ---- */

const emitted = await Promise.all(themes.map((theme) => composeStylesheet(theme)));
assert.ok(emitted.includes(css),
  "site/assets/site.css is not the concatenation of site-head.css + a theme + site-body.css; rebuild rather than edit the emitted sheet");

/* The emitted token block is the one budgets.mjs measures: same slice rule. */
assert.deepEqual(tokenNames(css.slice(0, css.indexOf("\n}"))).sort(), tokenContract,
  "the emitted token block does not declare the theme contract");

/* ---- the browser's own chrome is the palette's ground ----
   <meta name="theme-color"> paints Android's toolbar and Safari's, outside
   anything the stylesheet can reach, so a literal left behind by a theme swap
   is a dark bar over a light page that no gate on the CSS would ever see.
   lib/html.mjs takes it as a parameter; this ties the emitted tag back to the
   emitted token. */

const emittedGround = /(?:^|[{;\n])\s*--bg-0\s*:\s*([^;}]+)/.exec(uncomment(css.slice(0, css.indexOf("\n}"))));
assert.ok(emittedGround, `the emitted token block declares no ${GROUND_TOKEN}`);
const ground = emittedGround[1].trim().toLowerCase();

const themeColorOf = (page) =>
  [...page.matchAll(/<meta name="theme-color" content="([^"]*)">/g)].map((match) => match[1]);

for (const [name, page] of [["index.html", rootPage], ["en/index.html", english],
  ["zh/index.html", chinese], ["en/notice/index.html", noticeEn], ["zh/notice/index.html", noticeZh],
  ["404.html", notFoundPage]]) {
  assert.deepEqual(themeColorOf(page), [ground],
    `${name} must carry exactly one <meta name="theme-color"> and it must be the palette's ${GROUND_TOKEN} (${ground}); it carries ${JSON.stringify(themeColorOf(page))}`);
}

/* official-k4v/index.html is hand-written and copied byte for byte — no
   template reaches it, which is exactly how it kept a dark ground's
   theme-color through a palette change until this gate was written. Because
   the byte-for-byte copy is the point, it cannot track the theme a PREVIEW is
   built with; it is pinned to the SHIPPING palette instead. That is still the
   assertion that matters: the failure this catches is a palette swap that
   leaves the frozen page painted for the ground the site no longer has, and
   changing DEFAULT_THEME without re-inking it fails here. Tying it to the
   emitted theme instead would make `npm run preview` build two palettes that
   cannot pass their own check. */
const shippingGround = await groundOf(DEFAULT_THEME);
assert.deepEqual(themeColorOf(officialPage), [shippingGround],
  `official-k4v/index.html is hand-written and copied byte for byte, so it carries its `
  + `<meta name="theme-color"> as a literal: it must be the SHIPPING palette's ${GROUND_TOKEN} `
  + `(themes/${DEFAULT_THEME}.css, ${shippingGround}); it carries ${JSON.stringify(themeColorOf(officialPage))}`);

/* ---- the tab icon is inked from the same palette ----
   favicon.svg is the one drawing on this site that carries its colours as
   literals, because it is an asset and not the stylesheet — so it is the one
   drawing a theme swap can leave behind, painted for a ground the site no
   longer has. Every colour in it must be a value the shipping palette holds.
   (It keeps a dark tile on purpose: a tile reads on a light tab bar and on a
   dark one, where an untiled mark drawn for either disappears on the other.) */

const favicon = await readFile(join(srcAssets, "favicon.svg"), "utf8");
const paletteValues = new Set([...uncomment(rootBlockOf(await readTheme(DEFAULT_THEME), DEFAULT_THEME))
  .matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((match) => match[0].toLowerCase()));
const foreign = [...new Set([...favicon.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((match) => match[0].toLowerCase()))]
  .filter((hex) => !paletteValues.has(hex)).sort();
assert.deepEqual(foreign, [],
  `assets/favicon.svg is inked in ${foreign.join(", ")}, which themes/${DEFAULT_THEME}.css does not hold; re-ink the tab icon when the palette changes`);

/* No rule may reach for a name nothing defines: a var() that resolves to
   nothing inherits or falls back to the initial value, silently. */
const body = await readFile(bodyPath, "utf8");
const defined = new Set([...tokenContract, ...tokenNames(body)]);
const dangling = [...new Set([...uncomment(css).matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)]
  .map((match) => match[1]))].filter((name) => !defined.has(name)).sort();
assert.deepEqual(dangling, [], `the stylesheet reads custom properties nothing defines: ${dangling.join(", ")}`);

/* ---- every palette, not just the shipping one, keeps its colour in the
       token block. budgets.mjs makes this assertion about the DEFAULT
       build's sheet; a palette that is only ever previewed would escape it. */

for (const [index, sheet] of emitted.entries()) {
  const body = sheet.slice(sheet.indexOf("\n}"));
  const stray = [...uncomment(body).matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((match) => match[0])
    .filter((hex) => !["#fff", "#ffffff", "#000", "#000000"].includes(hex.toLowerCase()));
  assert.deepEqual(stray, [],
    `theme ${themes[index]} composes to a sheet with hex outside the token block: ${stray.join(", ")}`);
}

export const themesChecked = themes;
