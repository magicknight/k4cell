/* ------------------------------------------------------------------ *
 * THE FIGURE-CAPTION ORIENTATION GATE.                                *
 *                                                                     *
 * Every numbered plate on this page ships TWICE — a wide build and a   *
 * narrow/tall one — and the stylesheet shows one or the other by       *
 * `display`. The caption under them is printed once. So a caption      *
 * word that points at a place in the drawing ("从上到下", "the digits  *
 * right of it", "the dashed bracket below", "the grey column") is true *
 * of one build and false of the other, and the reader who is holding   *
 * the wrong one is told to look somewhere the drawing has nothing.     *
 *                                                                     *
 * On 2026-08-30 three captions had that defect at once: Fig. 6's       *
 * opened "the chain runs from the top" while the desktop plate runs    *
 * left to right; Fig. 4's panel-A caption named a vertical rule, the   *
 * digits right of it and a bracket below, and on a 390px phone that    *
 * plate cuts horizontally, with the untested digits under the cut and  *
 * the bracket drawn to the right; Fig. 3's caption sent the reader to  *
 * a grey column the phone plate does not have. Three instances, one    *
 * defect: a sentence about a drawing that only one of the two          *
 * drawings satisfies.                                                  *
 *                                                                     *
 * The rule this gate enforces: ANYTHING A READER SEES THAT IS NOT      *
 * INSIDE ONE PLATE MUST HOLD FOR BOTH PLATES. That is the caption, the *
 * figure's own notes and legend, and every aria-label — a figure's and *
 * an svg's alike, since the two builds share one description. Text     *
 * inside an <svg> is exempt and is checked the other way round below:  *
 * it belongs to one plate, so it is allowed to name that plate's       *
 * geometry, and a plate-specific sentence must come in a declared pair.*
 * ------------------------------------------------------------------ */

import assert from "node:assert/strict";

import { chinese, english } from "./common.mjs";
import decksIn from "../../src/copy/en.js";
import decksZh from "../../src/copy/zh.js";

export const pages = [["en", english, decksIn], ["zh", chinese, decksZh]];

/* ------------------------------------------------------------------ *
 * 0. The premise. If a plate ever stops shipping twice this gate is   *
 * guarding nothing, so the twin builds are asserted before the words. *
 * ------------------------------------------------------------------ */

export const PLATES = [
  ["the digit ruler", /class="fr fr-wide"/g, /class="fr fr-tall"/g, 2],
  ["the hypercharge table", /class="hy-svg hy-wide"/g, /class="hy-svg hy-narrow"/g, 1],
  ["the σ axis", /class="sg-h"/g, /class="sg-v"/g, 1],
  ["the route", /class="rt rt-wide"/g, /class="rt rt-narrow"/g, 1],
];

for (const [name, page] of pages) {
  for (const [figure, wide, narrow, count] of PLATES) {
    assert.equal((page.match(wide) ?? []).length, count,
      `${name}: ${figure} must ship ${count} wide plate(s)`);
    assert.equal((page.match(narrow) ?? []).length, count,
      `${name}: ${figure} must ship ${count} narrow plate(s); if it no longer does, this gate is guarding nothing`);
  }
}

/* ------------------------------------------------------------------ *
 * 1. The maintained list.                                             *
 *                                                                     *
 * Each entry is a word or phrase that names a PLACE IN A DRAWING and  *
 * therefore flips when the plate turns. The list is deliberately      *
 * phrase-level where the bare word has an innocent reading this deck  *
 * actually uses, and each of those is named in the note beside it —   *
 * a blunter pattern would fire on a true sentence and the next        *
 * maintainer would widen the exemption rather than fix the caption.   *
 * ------------------------------------------------------------------ */

export const ORIENTATION = [
  /* ---- Chinese ---- */
  [/从上到下|从下到上|从左到右|从右到左|上到下|左到右/, "a reading direction through the plate"],
  [/上方|下方|左方|右方|上边|下边|左边|右边|左侧|右侧|上侧|下侧/, "a side of the plate"],
  [/左上|右上|左下|右下/, "a corner of the plate"],
  [/上面|下面|顶部|底部|最上|最下|最左|最右/, "a position in the plate"],
  [/往上|往下|往左|往右|向上|向下|向左|向右/, "a direction of travel across the plate"],
  [/竖线|竖排|竖直|横线|横排|水平线|并排|并列/, "the axis a mark happens to be drawn along"],
  [/栏/, "a column of a table — the phone plate has no columns"],
  [/位置低|位置高/, "a height on an axis that is horizontal in the other build"],
  /* 左右 is NOT here on purpose: "3 σ 左右" means "around 3 σ" and is printed
     in the σ-axis caption. 「行」 is not here either: it is this ledger's word
     for a numeric row and appears in almost every caption. */

  /* ---- English ---- */
  [/\bfrom the (top|bottom|left|right)\b/i, "a reading direction through the plate"],
  [/\b(top|bottom|left|right) to (top|bottom|left|right)\b/i, "a reading direction through the plate"],
  [/\bto (the|its) (left|right)\b|\bon (the|its) (left|right)\b/i, "a side of the plate"],
  [/\b(left|right) of (it|its|them|this|that|these|those|the)\b/i, "a side of the plate"],
  [/\b(left|right)-hand side\b|\b(left|right)most\b|\btopmost\b|\bbottommost\b/i, "a side of the plate"],
  [/\bthe (top|bottom) (row|line|edge|corner|half|of)\b/i, "a position in the plate"],
  [/\b(above|below|beneath|underneath|under)\s+(it|its|them|this|that|these|those|each\s+\w+|the\s+(rule|line|cut|axis|chain|plate|figure|drawing|table|row|rows|names|numbers|digits|integers|gaps|stations|bracket))\b/i,
    "a position in the plate"],
  [/\b(above|below)\b(?=\s*[,.;:]|\s+(is|are|was|were|sits?|sat|hangs?|hung|runs?|ran|lies?|lay|comes?|came)\b)/i,
    "a position in the plate, used as a bare adverb"],
  [/\b(lower|further|farther) down\b|\bhigher up\b/i, "a height on an axis that is horizontal in the other build"],
  [/\b(vertical|horizontal|upright|sideways)\b/i, "the axis a mark happens to be drawn along"],
  [/\bcolumns?\b/i, "a column of a table — the phone plate has no columns"],
  [/\bside by side\b|\b(beside|alongside)\b|\bnext to\b/i, "two things the narrow build stacks instead"],
  [/\b(downwards?|upwards?|leftwards?|rightwards?)\b/i, "a direction of travel across the plate"],
  [/\bruns? (down|across|up|left|right)\b/i, "a direction of travel across the plate"],
  /* Bare "right" is NOT here: Fig. 2's caption says "written in the right
     basis", and the hypercharge note names the right-handed neutrino. Bare
     "below"/"under" are not here either: the σ caption says a bound "sits
     below every current limit" and "Under 1 σ is ordinary agreement", both of
     which are comparisons of numbers, not places in a picture. */
];

/* ------------------------------------------------------------------ *
 * 2. What the reader reads outside the plates.                        *
 * ------------------------------------------------------------------ */

export const unescape = (value) => String(value)
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">")
  .replaceAll("&amp;", "&");

export const collapse = (value) => unescape(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/* Every <figure> on the page, split into what belongs to both plates (the
   caption, the kicker, the panel notes, the legend, and every aria-label) and
   what belongs to one plate (the <svg> bodies, dropped here). */
export const outsideThePlates = (page) => {
  const found = [];
  for (const block of page.match(/<figure\b[^>]*>[\s\S]*?<\/figure>/g) ?? []) {
    const label = (block.match(/class="([^"]*)"/) ?? [, "figure"])[1];
    for (const aria of block.match(/<(?:figure|svg)\b[^>]*aria-label="([^"]*)"/g) ?? []) {
      found.push([`${label} aria-label`, collapse(aria.match(/aria-label="([^"]*)"/)[1])]);
    }
    found.push([`${label} caption and notes`,
      collapse(block.replace(/<svg\b[\s\S]*?<\/svg>/g, " "))]);
  }
  assert.ok(found.length >= 16, `only ${found.length} figure texts found; the extractor has stopped matching`);
  return found;
};

const offences = [];
for (const [name, page] of pages) {
  for (const [where, text] of outsideThePlates(page)) {
    for (const [pattern, why] of ORIENTATION) {
      const hit = text.match(pattern);
      if (!hit) continue;
      const at = Math.max(0, text.indexOf(hit[0]) - 40);
      offences.push(`${name} · ${where}: "${hit[0]}" — ${why}\n      …${text.slice(at, at + 130)}…`);
    }
  }
}
assert.deepEqual(offences, [],
  "a figure caption points at a place in the drawing, and each plate ships in two "
  + "orientations, so it is true of at most one of them. Say what the drawing shows "
  + "and how to read it instead — name the relation, not the side:\n  "
  + offences.join("\n  "));

/* ------------------------------------------------------------------ *
 * 3. The other way round: a sentence that CANNOT be orientation-free  *
 * without losing its teaching may be written twice, once per plate —  *
 * and then both halves must exist, and each must reach its own plate. *
 * Two figures do this today. Nothing else may quietly do it with one  *
 * half missing, which would leave one build silently unlabelled.      *
 * ------------------------------------------------------------------ */

export const PAIRED = [
  ["the hypercharge table", /<svg class="hy-svg hy-wide"[\s\S]*?<\/svg>/, /<svg class="hy-svg hy-narrow"[\s\S]*?<\/svg>/,
    (deck) => [deck.hypercharge.colName, deck.hypercharge.nameNoteA, deck.hypercharge.nameNoteB],
    (deck) => [deck.hypercharge.narrowNote]],
  ["the digit ruler", /<svg class="fr fr-wide"[\s\S]*?<\/svg>/, /<svg class="fr fr-tall"[\s\S]*?<\/svg>/,
    (deck) => [deck.figures.ruler.resolvedSpan, deck.figures.ruler.tailSpan,
      deck.figures.ruler.sigmaSpan, deck.figures.ruler.axisName],
    (deck) => [...deck.figures.ruler.resolvedTall, ...deck.figures.ruler.tailTall,
      ...deck.figures.ruler.sigmaTall, deck.figures.ruler.axisNameShort]],
];

/* A plate's own words, as the RUNS OF CONSECUTIVE <text> elements they are
   drawn as: figWrap and svgLines break a note into one <text> per line and the
   break eats the space, so a wrapped note is a run and a label is a run of
   one. Matching a substring of the whole plate instead would pass for any
   label that merely contains the word — "digit" would go on matching after the
   tall plate had stopped printing its own axis name, which is the regression
   this half of the gate exists to catch. */
export const runsOf = (svg) => {
  const cells = [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)]
    .map((m) => unescape(m[1].replace(/<[^>]*>/g, "")).replace(/\s+/g, ""));
  const runs = new Set();
  for (let index = 0; index < cells.length; index += 1) {
    let joined = "";
    for (let end = index; end < Math.min(cells.length, index + 8); end += 1) {
      joined += cells[end];
      runs.add(joined);
    }
  }
  return runs;
};

/* The deck writes {n}, {k}, {s}; the figure fills them at build time. */
export const asPattern = (value) => new RegExp(`^${String(value).replace(/\s+/g, "")
  .split(/\{[a-zA-Z]+\}/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join(".{0,40}")}$`);

for (const [name, page, deck] of pages) {
  for (const [figure, wideRe, narrowRe, wideOf, narrowOf] of PAIRED) {
    for (const [side, plateRe, stringsOf] of [["wide", wideRe, wideOf], ["narrow", narrowRe, narrowOf]]) {
      const plate = page.match(plateRe);
      assert.ok(plate, `${name}: ${figure} has no ${side} plate to carry its own words`);
      const runs = [...runsOf(plate[0])];
      for (const value of stringsOf(deck)) {
        assert.ok(value && String(value).trim(),
          `${name}: ${figure} declares a ${side}-plate string and the deck does not carry it`);
        const pattern = asPattern(value);
        assert.ok(runs.some((run) => pattern.test(run)),
          `${name}: ${figure}'s ${side} plate does not print "${String(value).slice(0, 40)}", `
          + "so one of the two orientations is going out unlabelled");
      }
    }
  }
}

export const orientationChecked = pages.length * PLATES.length;
