/* ------------------------------------------------------------------ *
 * THE COPY PIPELINE GATE.                                             *
 *                                                                     *
 * src/copy/{zh,en}.js are generated from src/copy/fragments/*.json by  *
 * scripts/assemble-copy.mjs (`npm run copy`). They stay checked in on   *
 * purpose: a deck is what a copy reviewer and a diff actually read, and *
 * the build must not depend on a generator having been run in the right *
 * order. The price of keeping both is that they can drift, so this gate *
 * re-assembles the decks in memory and compares them byte for byte.     *
 *                                                                     *
 * A hand-edit to a deck therefore fails `npm test` by name, and so does *
 * a fragment edit that was never assembled. Either way the fix is one    *
 * command: npm run copy.                                                *
 * ------------------------------------------------------------------ */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { CLUSTERS, DIRECTIONS, assembleDecks, deckPath, fragmentsDir } from "../assemble-copy.mjs";
import { join } from "node:path";

/* Every fragment the assembler names is present and is a { zh, en } pair. */
for (const cluster of CLUSTERS) {
  const raw = await readFile(join(fragmentsDir, `${cluster}.json`), "utf8");
  const data = JSON.parse(raw);
  for (const dir of DIRECTIONS) {
    assert.ok(data[dir] && typeof data[dir] === "object",
      `copy fragment ${cluster}.json is missing its "${dir}" half`);
  }
}

const assembled = await assembleDecks();
for (const dir of DIRECTIONS) {
  const onDisk = await readFile(deckPath(dir), "utf8");
  assert.equal(onDisk, assembled[dir],
    `src/copy/${dir}.js is not what src/copy/fragments/*.json assembles to. `
    + "The decks are generated: edit the fragment, then run `npm run copy`.");
}

/* ------------------------------------------------------------------ *
 * EVERY REVIEWED STRING REACHES A READER.                             *
 *                                                                     *
 * A deck string that no page prints is worse than dead weight: a copy  *
 * reviewer keeps polishing it, a translator keeps translating it, and  *
 * the page it was written for silently says something else. Three were *
 * inert on 2026-08-30 (both glyph alt sentences and the Chinese 404    *
 * headline) and eleven more hypercharge strings lived in the figure    *
 * module where no copy pass could see them at all.                    *
 *                                                                     *
 * So: walk every string in both decks and require it on some published *
 * page. The page is searched four ways, because the templates do four  *
 * things to a string on the way out — escape it, insert it raw (the    *
 * deck may carry <em>/<strong>), wrap digits and codes in tags, and    *
 * split one sentence across several SVG <text> lines. Placeholders     *
 * ({n}, {sym}, {delta} …) are matched around.                          *
 * ------------------------------------------------------------------ */

import { chinese, english, noticeEn, noticeZh, rootPage } from "./common.mjs";
import { readFile as readSite } from "node:fs/promises";
import { join as joinPath } from "node:path";
import { site } from "./common.mjs";

const published = [english, chinese, noticeEn, noticeZh, rootPage,
  await readSite(joinPath(site, "404.html"), "utf8")].join("\n");
const tagless = published.replace(/<[^>]*>/g, "");
const spaced = published.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const collapse = (value) => value.replace(/\s+/g, " ").trim();
const quoteRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Positions that hold a LOOKUP KEY rather than a sentence (the template turns
   them into an href or a class), one string the page prints with its tier word
   removed and gated by name in check/structure.mjs, and the two symbols the
   page renders through sym(), which lowers the subscript. */
const NOT_PROSE = [
  /^\.htmlLang$/, /^\.dir$/, /^\.alternateDir$/,
  /^\.verify\.links\[\d+\]\[2\]$/, /^\.footer\.nav\[\d+\]\[1\]$/,
  /^\.boundary\.submissions\.records\[\d+\]\[3\]$/,
  /^\.whys\.rows\[\d+\]\.(figure|tags)/, /^\.explain\.rows\[\d+\]\.tags/,
  /^\.tiers\.key\[\d+\]\[0\]$/, /^\.explain\.tagKey\[\d+\]\[0\]$/,
  /^\.kill\.gradeKey\[\d+\]\[0\]$/,
  /^\.boundary\.route\.(stations|gaps)\[\d+\]\[2\]/,
  /^\.hero\.tierChip$/, /^\.checkIt\.tierChip$/,
  /^\.why\.dials\[\d+\]\[0\]$/,
];

export const printedSomewhere = (value) => {
  const bare = value.replace(/<[^>]*>/g, "");
  for (const needle of [value, escapeHtml(value), bare, escapeHtml(bare)]) {
    if (published.includes(needle) || tagless.includes(needle)
      || spaced.includes(collapse(needle))) return true;
  }
  if (/\{[a-zA-Z]+\}/.test(value)) {
    for (const needle of [bare, escapeHtml(bare)]) {
      const pattern = collapse(needle).split(/\{[a-zA-Z]+\}/).map(quoteRe).join("[\\s\\S]{0,160}");
      if (new RegExp(pattern).test(spaced)) return true;
    }
  }
  return false;
};

/* A reviewed string may arrive in segments, one per line: page.mjs prints a
   claim's answer as one paragraph per segment, and a "rides on" segment that
   opens with "- " as one <li>. Each segment is then a separate run of text on
   the page, so each is checked on its own — the whole string with its markers
   in it is printed nowhere and would always look dead. */
export const segmentsOf = (value) => (value.includes("\n")
  ? value.split("\n").map((line) => line.trim().replace(/^- /, "")).filter(Boolean)
  : [value]);

const inert = [];
const walkDeck = (node, path, dir) => {
  if (typeof node === "string") {
    if (!node.trim() || NOT_PROSE.some((rule) => rule.test(path))) return;
    for (const segment of segmentsOf(node)) {
      if (!printedSomewhere(segment)) inert.push(`${dir}${path} :: ${segment.slice(0, 60)}`);
    }
    return;
  }
  if (Array.isArray(node)) { node.forEach((v, i) => walkDeck(v, `${path}[${i}]`, dir)); return; }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) walkDeck(value, `${path}.${key}`, dir);
  }
};
for (const deck of [(await import("../../src/copy/en.js")).default,
  (await import("../../src/copy/zh.js")).default]) walkDeck(deck, "", deck.dir);

assert.deepEqual(inert, [],
  `deck strings that no page prints — render them or delete them:\n  ${inert.join("\n  ")}`);

/* ------------------------------------------------------------------ *
 * ONE APOSTROPHE.                                                     *
 * The English deck mixed 31 straight against 63 curly, and the two    *
 * render as visibly different glyphs side by side on one page.        *
 * ------------------------------------------------------------------ */

const straight = [];
const walkQuotes = (node, path) => {
  if (typeof node === "string") {
    if (/'/.test(node)) straight.push(`${path} :: ${node.slice(0, 60)}`);
    return;
  }
  if (Array.isArray(node)) { node.forEach((v, i) => walkQuotes(v, `${path}[${i}]`)); return; }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) walkQuotes(value, `${path}.${key}`);
  }
};
walkQuotes((await import("../../src/copy/en.js")).default, "en");
assert.deepEqual(straight, [],
  `the English deck must use the curly apostrophe ’ throughout:\n  ${straight.join("\n  ")}`);

/* The deck is not the whole English page. Two figure modules derive a sentence
   in code — sigma.mjs joins its lane sentences, route.mjs counts its own gaps
   into a note — and route.mjs's note carried the last straight apostrophe on
   the site ("the author's errata"), invisible to a gate that only walks the
   deck. So the same rule is applied to what is actually published: every
   English surface, tags stripped, plus the attributes a reader can hear. The
   CSP meta is skipped by name — 'self' is required syntax, not prose. */

const englishSurfaces = [["en/index.html", english], ["en/notice/index.html", noticeEn],
  ["index.html", rootPage], ["404.html", await readSite(joinPath(site, "404.html"), "utf8")]];

const printedStraight = [];
for (const [where, page] of englishSurfaces) {
  const readable = page.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/g, "");
  const visible = readable.replace(/<[^>]*>/g, " ");
  const spoken = [...readable.matchAll(/(?:aria-label|alt|title)="([^"]*)"/g)].map((m) => m[1]).join(" ");
  for (const [kind, text] of [["text", visible], ["label", spoken]]) {
    const at = text.indexOf("'");
    if (at >= 0) printedStraight.push(`${where} (${kind}): …${text.slice(Math.max(0, at - 50), at + 40)}…`);
  }
}
assert.deepEqual(printedStraight, [],
  "the published English pages must use the curly apostrophe ’ throughout — including "
  + `the sentences the figure modules derive in code:\n  ${printedStraight.join("\n  ")}`);
