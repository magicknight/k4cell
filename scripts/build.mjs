import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import en from "../src/copy/en.js";
import zh from "../src/copy/zh.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "site");
const assets = join(root, "src", "assets");
const provenance = join(root, "provenance");
const officialK4v = join(root, "official-k4v");
const predictions = join(root, "predictions");

const ledger = JSON.parse(await readFile(join(root, "src", "data", "ledger.json"), "utf8"));
const external = JSON.parse(await readFile(join(root, "src", "data", "external.json"), "utf8"));

const publicReviewCommit = "36becf6d6941fc5e51fb7897a93a6b8443f100ba";
const publicStatusCommit = "f7393338360c0bb972a5c662f744175f9ecdf9e7";
const repo = "https://github.com/magicknight/k4-cell-framework-public-review";

const links = {
  repository: repo,
  pdf: `${repo}/blob/${publicReviewCommit}/K4_Cell_Framework_v2.0-public-review.pdf`,
  conceptDoi: `https://doi.org/${ledger.artifact.conceptDoi}`,
  targets: `${repo}/blob/${publicStatusCommit}/REVIEW_TARGETS.md`,
  checksums: `${repo}/blob/${publicStatusCommit}/CHECKSUMS.txt`,
  errata: `${repo}/blob/${publicStatusCommit}/ERRATA.md`,
  discussions: `${repo}/discussions`,
  issues: `${repo}/issues/new/choose`,
  vaults: "https://github.com/magicknight/k4v-research-funding-vaults/tree/e1afead138fbf56956b298ebae7a97a8ae9ad956",
  contact: "mailto:zhihua@k4cell.com",
  orcid: "https://orcid.org/0000-0001-6027-6883",
};

const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

/* ------------------------------------------------------------------ *
 * Numeric integrity: recompute what the page prints, and refuse to    *
 * build if the recomputation disagrees with the stored value.         *
 * ------------------------------------------------------------------ */

const resolvedDigitsOf = (measured, sigma) =>
  Math.floor(Math.log10(Math.abs(Number(measured)) / sigma)) + 1;

const pullOf = (predicted, measured, sigma) =>
  Math.abs((Number(predicted) - Number(measured)) / sigma);

for (const row of ledger.gaussian) {
  const resolved = resolvedDigitsOf(row.measured, row.sigma);
  assert.equal(resolved, row.resolvedDigits,
    `${row.id}: resolved digits recompute to ${resolved}, stored ${row.resolvedDigits}`);
  if (!row.noPull) {
    const pull = pullOf(row.predicted, row.measured, row.sigma);
    assert.ok(Math.abs(pull - row.pull) <= Math.max(5e-4, row.pull * 0.02),
      `${row.id}: pull recomputes to ${pull}, stored ${row.pull}`);
  }
}

const lambdaRow = ledger.gaussian.find((row) => row.id === "lambda");
assert.equal(lambdaRow.pullDisplay, "0.9 σ", "the Lambda row must print the published 0.9 sigma");
assert.ok(Math.abs(pullOf(lambdaRow.predicted, lambdaRow.measured, lambdaRow.sigma) - 0.92) < 0.01);

const machine = ledger.machine;
assert.equal(
  machine.leanCertified + machine.provedCoreOnly + machine.needsLeanNode + machine.proseEmpiricalOpen,
  machine.rows, "Lean sign-off buckets must sum to the row total");
const notCertified = machine.rows - machine.leanCertified;
assert.equal(notCertified, 44,
  `ledger.machine: ${machine.rows} - ${machine.leanCertified} = ${notCertified}, but the 2026-07-08 release records 44 non-certified rows`);

/* The bucket figures are printed twice — as data in the bar keys and as prose in
   machine.figures. Pin the prose to the data so the two cannot drift apart. */
for (const copy of [en, zh]) {
  for (const value of [machine.rows, machine.leanCertified, machine.provedCoreOnly,
    machine.needsLeanNode, machine.proseEmpiricalOpen, machine.modules]) {
    assert.ok(copy.machine.figures.includes(String(value)),
      `${copy.dir}: machine.figures no longer prints ${value}`);
  }
  for (const axiom of machine.axioms) {
    assert.ok(copy.machine.figures.includes(axiom), `${copy.dir}: machine.figures omits ${axiom}`);
  }
}

/* A missing copy key would otherwise print the literal string "undefined" on the
   live page. Fail the build instead. */
const rowIds = [...ledger.gaussian, ...ledger.diagnostics, ...ledger.bounds].map((row) => row.id);
for (const copy of [en, zh]) {
  for (const id of rowIds) {
    assert.ok(copy.ledger.types[id], `${copy.dir}: ledger.types is missing "${id}"`);
  }
  for (const key of Object.keys(copy.ledger.types)) {
    assert.ok(rowIds.includes(key), `${copy.dir}: ledger.types has a stale key "${key}"`);
  }
}

/* ------------------------------------------------------------------ *
 * The 81 basis states, enumerated at build time.                      *
 * ------------------------------------------------------------------ */

const EDGES = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
const VERTS = [[19, 5], [4, 31], [34, 31], [19, 21]];

const states = [];
for (let index = 0; index < 81; index += 1) {
  const word = [
    Math.floor(index / 27) % 3,
    Math.floor(index / 9) % 3,
    Math.floor(index / 3) % 3,
    index % 3,
  ];
  const counts = [0, 0, 0];
  for (const colour of word) counts[colour] += 1;
  const signature = [...counts].sort((a, b) => b - a).join(",");
  const mono = EDGES.filter(([a, b]) => word[a] === word[b]);
  states.push({ index, word, signature, mono });
}

assert.equal(states.length, 81);
const monoTotal = states.reduce((sum, state) => sum + state.mono.length, 0);
assert.equal(monoTotal, 162, "total same-colour edges over all 81 states must be 162");
assert.equal(monoTotal / 81, 2, "mean same-colour edges per state must be exactly 2");
assert.equal(states.filter((state) => state.mono.length === 0).length, 0, "no state may be collision-free");

const classCensus = new Map();
for (const state of states) {
  const entry = classCensus.get(state.signature) ?? { states: 0, mono: state.mono.length };
  entry.states += 1;
  classCensus.set(state.signature, entry);
}
assert.deepEqual(
  [...classCensus.entries()].map(([key, value]) => [key, value.states, value.mono]).sort(),
  [["2,1,1", 36, 1], ["2,2,0", 18, 2], ["3,1,0", 24, 3], ["4,0,0", 3, 6]]);

const renderGrid = (label) => {
  const cells = states.map((state, index) => {
    const dots = state.word
      .map((colour, site) => `<circle cx="${VERTS[site][0]}" cy="${VERTS[site][1]}" r="3.4" class="q${colour}"/>`)
      .join("");
    const monoLines = state.mono
      .map(([a, b]) => `<line x1="${VERTS[a][0]}" y1="${VERTS[a][1]}" x2="${VERTS[b][0]}" y2="${VERTS[b][1]}" class="me"/>`)
      .join("");
    const x = (index % 9) * 40;
    const y = Math.floor(index / 9) * 40;
    return `<g class="st" data-sig="${state.signature}" transform="translate(${x} ${y})"><use href="#tet"/>${monoLines}${dots}</g>`;
  }).join("");

  const skeleton = EDGES
    .map(([a, b]) => `<line x1="${VERTS[a][0]}" y1="${VERTS[a][1]}" x2="${VERTS[b][0]}" y2="${VERTS[b][1]}"/>`)
    .join("");

  return `<svg class="grid81" viewBox="-2 -2 364 364" role="img" aria-label="${esc(label)}">
<defs><g id="tet" class="te">${skeleton}</g></defs>${cells}</svg>`;
};

/* ------------------------------------------------------------------ *
 * The digit ruler.                                                    *
 * ------------------------------------------------------------------ */

const splitNumber = (text) => {
  const match = String(text).match(/^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i);
  assert.ok(match, `unparseable numeric string: ${text}`);
  return {
    sign: match[1] ?? "",
    whole: match[2],
    fraction: match[3] ?? "",
    exponent: match[4] ? Number(match[4]) : null,
  };
};

const digitCells = (text, resolved, mode) => {
  const parts = splitNumber(text);
  const chars = [];
  let significant = 0;
  let seenNonZero = parts.whole !== "0";

  for (const character of parts.whole) {
    if (!seenNonZero && character !== "0") seenNonZero = true;
    chars.push({ character, index: seenNonZero ? significant++ : null });
  }
  if (parts.fraction) {
    chars.push({ point: true });
    for (const character of parts.fraction) {
      if (!seenNonZero && character !== "0") seenNonZero = true;
      chars.push({ character, index: seenNonZero ? significant++ : null });
    }
  }

  const cells = chars.map((cell) => {
    if (cell.point) return `<span class="dp">.</span>`;
    let state = "d-flat";
    if (mode !== "flat" && cell.index !== null) {
      state = cell.index < resolved ? "d-lit" : mode === "measured" ? "d-flat" : "d-ghost";
    }
    const cut = mode !== "flat" && cell.index === resolved ? " d-cut" : "";
    return `<span class="${state}${cut}">${cell.character}</span>`;
  });

  const exponent = parts.exponent === null
    ? ""
    : `<span class="dx">&#215;10<sup>${parts.exponent < 0 ? "&#8722;" : ""}${Math.abs(parts.exponent)}</sup></span>`;

  return `${parts.sign ? `<span class="d-flat">${parts.sign}</span>` : ""}${cells.join("")}${exponent}`;
};

const ruler = (row, copy, options = {}) => {
  const mode = row.noPull ? "flat" : "predicted";
  const approx = row.predictedApproximate ? `<span class="d-flat">&#8776;</span>` : "";
  const exact = row.predictedExact ? `<span class="dexact">= ${esc(row.predictedExact)}</span>` : "";
  /* An exact rational continues past the last resolved digit, so its tail carries
     the cut marker that digitCells() cannot place. */
  const tail = row.predictedExact
    ? `<span class="d-ghost${mode === "flat" ? "" : " d-cut"}">000</span><span class="dinf">&#8230;&#8734;</span>` : "";
  const sigmaText = row.sigmaNote ? `&#177;${esc(row.sigmaNote)}` : `&#177;${row.sigma}`;

  return `<div class="ruler${options.hero ? " ruler-hero" : ""}">
<div class="rrow"><span class="rlab">${esc(copy.hero.rulerComputed)}</span><span class="rnum">${approx}${digitCells(row.predicted, row.resolvedDigits, mode)}${tail}${exact}</span></div>
<div class="rrow"><span class="rlab">${esc(copy.hero.rulerMeasured)}</span><span class="rnum">${digitCells(row.measured, row.resolvedDigits, "measured")}<span class="dsig">${sigmaText}</span></span></div>
${row.noPull ? "" : `<p class="rcut">${esc(copy.hero.rulerCut.replace("{n}", String(row.resolvedDigits)))}</p>`}
</div>`;
};

const pullBar = (value, max = 4) => {
  assert.ok(Number.isFinite(value), `pullBar needs a number, received ${value}`);
  const width = Math.min(1, value / max) * 300;
  /* Every bar carries the same axis and the same ticks at 1 sigma and 3 sigma.
     Without them 0.002 and 3.28 are two rectangles and the reader cannot see
     that ten rows cluster at zero and one sits alone past three. The row also
     prints its pull as text in .lpull, so the bar is decoration for assistive
     technology rather than a second, unlocalized announcement. */
  const tick = (sigma, cls) =>
    `<rect x="${((sigma / max) * 300).toFixed(1)}" y="0" width="1" height="14" class="${cls}"/>`;
  return `<svg class="pullbar" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect x="0" y="6" width="300" height="2" class="pb-track"/>${tick(1, "pb-tick")}${tick(2, "pb-tick")}${tick(3, "pb-tick3")}<rect x="0" y="3" width="${Math.max(width, 1).toFixed(1)}" height="8" class="pb-fill${value >= 3 ? " pb-bad" : ""}"/></svg>`;
};

/* Chinese takes a full-width colon; English a half-width one plus a space. */
const colon = (copy) => (copy.dir === "zh" ? "：" : ": ");

/* ------------------------------------------------------------------ *
 * Page fragments.                                                     *
 * ------------------------------------------------------------------ */

const brandMark = `<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
<path d="M16 3 4 24h24Z"/><line x1="16" y1="3" x2="16" y2="18"/><line x1="4" y1="24" x2="16" y2="18"/><line x1="28" y1="24" x2="16" y2="18"/>
<circle cx="16" cy="3" r="2"/><circle cx="4" cy="24" r="2"/><circle cx="28" cy="24" r="2"/><circle cx="16" cy="18" r="2"/></svg>`;

const sectionHead = (number, kicker, h2, intro) => `<span class="section-number">${esc(number)} / ${esc(kicker)}</span>
<h2>${h2}</h2>${intro ? `<p class="section-intro">${intro}</p>` : ""}`;

/* Every section is laid on the same three tracks as the masthead: a rail for
   the section number and its running head, a main measure, and an apparatus
   column that only exists when the section has figures for it. */
const sectionRail = (number, kicker, extra = "") =>
  `<aside class="sec-rail"><p class="rail-h">${esc(number)}</p><p class="rail-k">${esc(kicker)}</p>${extra}</aside>`;

const sec = (id, cls, number, kicker, body, app = "") =>
  `<section id="${id}" class="${cls}"><div class="shell sec-in${app ? " has-app" : ""}">
${sectionRail(number, kicker)}
<div class="sec-main">${body}</div>${app ? `<div class="sec-app">${app}</div>` : ""}
</div></section>`;

/* The rail head no longer repeats the number, so section heads drop it. */
const headOnly = (h2, intro) => `<h2>${h2}</h2>${intro ? `<p class="section-intro">${intro}</p>` : ""}`;

const heroRow = ledger.gaussian.find((row) => row.id === "mu_e");

/* The pigeonhole argument PERFORMED, not asserted. A single frozen frame can
 * only claim that some pair collides; these eight frames let the reader watch
 * the object try to escape and fail, eight times, without reading a word.
 *
 * The eight words are real members of the 81, and the edge the stylesheet
 * lights on each frame is asserted here against the enumeration above, so the
 * drawing cannot drift away from the arithmetic it is illustrating. */
const DEAL_WORDS = [
  [0, 1, 2, 0], [0, 0, 1, 1], [1, 2, 2, 1],
  [2, 0, 0, 0], [1, 1, 1, 0], [2, 2, 2, 2],
];
const DEAL_LIT = [
  ["e03"], ["e01", "e23"], ["e03", "e12"],
  ["e12", "e13", "e23"], ["e01", "e02", "e12"],
  ["e01", "e02", "e03", "e12", "e13", "e23"],
];
const EDGE_NAMES = EDGES.map(([a, b]) => `e${a}${b}`);

DEAL_WORDS.forEach((word, frame) => {
  const state = states.find((candidate) => candidate.word.join("") === word.join(""));
  assert.ok(state, `deal frame ${frame}: ${word.join("")} is not one of the 81`);
  const lit = state.mono.map(([a, b]) => `e${a}${b}`).sort();
  assert.deepEqual(lit, [...DEAL_LIT[frame]].sort(),
    `deal frame ${frame}: the stylesheet lights ${DEAL_LIT[frame]}, the arithmetic gives ${lit}`);
});
assert.equal(new Set(DEAL_WORDS.map((word) => states.find((s2) => s2.word.join("") === word.join("")).signature)).size, 4,
  "the eight frames must show all four colouring classes");

const DEAL_V = [[100, 16], [16, 152], [184, 152], [100, 104]];
/* The legend beside it is already bilingual and says the same thing, so the
   figure is decorative to assistive technology rather than a second, English
   announcement on a Chinese page. */
const k4Glyph = `<svg class="k4-deal" viewBox="0 0 200 168" aria-hidden="true" focusable="false">
${EDGES.map(([a, b], index) => `<line class="ke ${EDGE_NAMES[index]}" x1="${DEAL_V[a][0]}" y1="${DEAL_V[a][1]}" x2="${DEAL_V[b][0]}" y2="${DEAL_V[b][1]}"/>`).join("")}
${DEAL_V.map((point, site) => `<circle class="kv kv${site}" cx="${point[0]}" cy="${point[1]}" r="9"/>`).join("")}
</svg>`;

const renderObject = (copy) => {
  const beats = copy.object.beats.map((beat) => `<article class="beat">
<span class="beat-n">${esc(beat.n)}</span>
<div><span class="tag ${beat.state}">${esc(beat.stateLabel)}</span><h3>${esc(beat.h3)}</h3><p>${beat.body}</p></div>
</article>`).join("");

  const classes = [...classCensus.entries()]
    .sort((a, b) => b[1].states - a[1].states)
    .map(([signature, value]) => `<button type="button" class="qfilter" data-sig="${signature}" aria-pressed="false"><strong>${value.states}</strong><span>${esc(copy.object.classLabels[signature])}</span><em>${value.mono} ${esc(copy.object.classMono)}</em></button>`).join("");

  return sec("object", "object", copy.object.number, copy.object.kicker, `${headOnly(copy.object.h2, copy.object.intro)}
<blockquote class="xepigraph"><p>${esc(copy.object.epigraph.text)}</p><p class="xgloss">${esc(copy.object.epigraph.gloss)}</p><cite>${esc(copy.object.epigraph.cite)}</cite></blockquote>
<div class="beats">${beats}</div>
<div class="tagkey"><h3>${esc(copy.object.tagKeyTitle)}</h3><dl>${copy.object.tagKey.map(([state, label, gloss]) =>
  `<div><dt><span class="tag ${state}">${esc(label)}</span></dt><dd>${esc(gloss)}</dd></div>`).join("")}</dl></div>
<p class="counts">${esc(copy.object.countsCaption)}</p>
<div class="grid-block">
<div class="grid-copy">
<h3>${esc(copy.object.gridTitle)}</h3>
<p>${esc(copy.object.gridIntro)}</p>
<div class="qfilters" role="group" aria-label="${esc(copy.object.gridFilterLabel)}">
<button type="button" class="qfilter" data-sig="all" aria-pressed="true"><strong>81</strong><span>${esc(copy.object.gridFilterAll)}</span><em>&nbsp;</em></button>
${classes}</div>
<p class="qmean"><span>${esc(copy.object.gridMeanLabel)}</span><strong>${esc(copy.object.gridMeanValue)}</strong><em>${esc(copy.object.gridMeanNote)}</em></p>
<button type="button" class="button qsweep" data-done="${esc(copy.object.gridSweepDone)}">${esc(copy.object.gridSweep)}</button>
<p class="qlive" data-live aria-live="polite">${esc(copy.object.gridSweepResult)}</p>
<p class="caveat">${esc(copy.object.gridCaveat)}</p>
</div>
<figure class="grid-figure">${renderGrid(copy.object.gridTitle)}</figure>
</div>`);
};

const renderExplain = (copy) => {
  const x = copy.explain;
  const tagLabel = Object.fromEntries(x.tagKey.map(([state, label]) => [state, label]));

  const chips = (tags) => tags
    .map((state) => `<span class="tag ${state}">${esc(tagLabel[state])}</span>`).join("");

  /* Interface codes and target names link to the author's own published errata
     and review targets, so a reader can go straight to the objection. */
  const linkCodes = (text) => esc(text)
    .replace(/\bE(1[01]|[1-9])\b/g, `<a href="${links.errata}">E$1</a>`)
    /* Two branches: \b cannot fire before a Han character, so the Chinese
       review targets never linked at all under the single combined pattern. */
    .replace(/\b(Targets?)\s?([A-D0-9]+(?:\s?and\s?[A-D0-9]+)*)/g,
      `<a href="${links.targets}">$1 $2</a>`)
    .replace(/(靶点)\s?([A-D0-9]+(?:\s?[与、]\s?[A-D0-9]+)*)/g,
      `<a href="${links.targets}">$1 $2</a>`);

  const row = (r) => `<article class="xrow${r.lead ? " xlead" : ""}" id="x-${esc(r.n)}">
<h3 class="xhead"><span class="xn">${esc(r.n)}</span>${esc(r.h3)}</h3>
<p class="xtags">${chips(r.tags)}</p>
<p class="xbody">${r.body}</p>
<p class="xrides"><span class="xlab">${esc(x.ridesOnLabel)}</span>${linkCodes(r.ridesOn)}</p>
<details class="xcheck"><summary>${esc(x.checkLabel)}</summary><p>${esc(r.checkAt)}</p></details>
</article>`;

  const keys = x.tagKey.map(([state, label, gloss]) =>
    `<div><dt><span class="tag ${state}">${esc(label)}</span></dt><dd>${esc(gloss)}</dd></div>`).join("");

  return sec("explain", "explain", x.number, x.kicker, `${headOnly(x.h2, x.intro)}
<div class="xkey"><h3>${esc(x.tagKeyTitle)}</h3><dl>${keys}</dl>
<details class="xdef"><summary>${esc(x.closedDefTitle)}</summary><p>${esc(x.closedDef)}</p><p class="xcite">${esc(x.closedDefCite)}</p></details></div>
<div class="xrows">${x.rows.map((r) => {
  const after = r.n === "05" ? renderImaginaryFigure(copy)
    : r.n === "06" ? renderHypercharge(copy, { figure: "3", linkCodes }) : "";
  return `${row(r)}${after ? `<div class="xfig">${after}</div>` : ""}`;
}).join("")}</div>
<blockquote class="xepigraph"><p>${esc(x.epigraph.text)}</p>${x.epigraph.gloss ? `<p class="xgloss">${esc(x.epigraph.gloss)}</p>` : ""}<cite>${esc(x.epigraph.cite)}</cite></blockquote>
<div class="xholo"><h3>${esc(x.holoTitle)}</h3>${x.holo.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`);
};

const renderLedger = (copy) => {
  const gaussian = ledger.gaussian.map((row) => {
    const conditional = row.interfaces.length
      ? ` <span class="cond">${esc(copy.ledger.conditionalOn)} ${row.interfaces.join(", ")}</span>` : "";
    return `<article class="lrow" data-row="${row.id}">
<div class="lhead"><h3>${esc(row.symbol)}</h3><span class="lpull">${esc(row.pullDisplay)}</span></div>
<p class="lstate">${esc(copy.ledger.darkLabel)}</p>
${ruler(row, copy)}
${row.noPull ? `<p class="lnote">${esc(copy.ledger.noPullNote)}</p>` : pullBar(row.pull)}
${row.predictedExact ? `<p class="lnote">${esc(copy.ledger.exactNote)}</p>` : ""}
<p class="ltype">${esc(copy.ledger.types[row.id])}${conditional}</p>
</article>`;
  }).join("");

  const diagnostics = ledger.diagnostics.map((row) => `<article class="lrow lrow-diag${row.worst ? " lrow-worst" : ""}" data-row="${row.id}">
<div class="lhead"><h3>${esc(row.symbol)}</h3><span class="lpull">${esc(row.equivalent)}</span></div>
<p class="ldiag"><span>${esc(copy.ledger.colComputed)}</span> <code>${esc(row.predicted)}</code></p>
<p class="ldiag"><span>${esc(copy.ledger.colMeasured)}</span> <code>${esc(row.measured)}</code></p>
${pullBar(Number.parseFloat(row.equivalent))}
<p class="ltype">${esc(copy.ledger.types[row.id])}</p>
</article>`).join("");

  const bounds = ledger.bounds.map((row) => `<article class="lrow lrow-bound" data-row="${row.id}">
<div class="lhead"><h3>${esc(row.symbol)}</h3><span class="lpull lpull-open">&#8595;</span></div>
<p class="ldiag"><span>${esc(copy.ledger.colComputed)}</span> <code>${row.predictedApproximate ? "&#8776; " : ""}${esc(row.predicted)}</code></p>
<p class="ltype">${esc(copy.ledger.types[row.id])}</p>
</article>`).join("");

  return sec("ledger", "ledger", copy.ledger.number, copy.ledger.kicker, `${headOnly(copy.ledger.h2, copy.ledger.intro)}
<div class="legend"><strong>${esc(copy.ledger.legendTitle)}</strong> ${esc(copy.ledger.legend)}</div>
${sigmaFigure(copy)}
<h3 class="lane">${esc(copy.ledger.laneGaussian)}</h3>
<div class="lgrid">${gaussian}</div>
<h3 class="lane lane-cut">${esc(copy.ledger.laneDiagnostic)}</h3>
<p class="lane-note">${esc(copy.ledger.laneDiagnosticNote)}</p>
<div class="lgrid">${diagnostics}</div>
<h3 class="lane lane-cut">${esc(copy.ledger.laneBounds)}</h3>
<p class="lane-note">${esc(copy.ledger.laneBoundsNote)}</p>
<div class="lgrid">${bounds}</div>
<p class="lane-note">${esc(copy.ledger.noScore)}</p>
<p class="lane-note">${esc(copy.ledger.censusNote)} <a href="${links.pdf}">${esc(copy.ledger.censusAuthority)}</a></p>
<p class="lane-note">${esc(copy.ledger.measuredNote)}</p>`);
};

const renderRoute = (copy) => {
  const stations = copy.route.stations.map(([title, sub, state], index) =>
    `<li class="station" data-state="${state}"><span class="st-n">${String(index + 1).padStart(2, "0")}</span><strong>${esc(title)}</strong><span class="st-sub">${esc(sub)}</span></li>`).join("");

  const gaps = copy.route.gaps.map(([code, description, carries]) => {
    const rows = carries.length
      ? `${esc(copy.route.gapCarries)}${colon(copy)}${carries.map((id) => `<code>${esc(ledger.gaussian.find((row) => row.id === id).symbol)}</code>`).join(" ")}`
      : esc(copy.route.gapCarriesNothing);
    return `<article class="gap" data-carries="${carries.join(" ")}" data-code="${esc(code)}">
<span class="gap-code">${esc(code)}</span><p>${esc(description)}</p><p class="gap-carries">${rows}</p></article>`;
  }).join("");

  return sec("route", "route", copy.route.number, copy.route.kicker, `${headOnly(copy.route.h2, copy.route.intro)}
${renderRouteFigure(copy)}
<ol class="stations">${stations}</ol>
<p class="main-bridge"><span class="tag open">${esc(copy.route.mainBridgeLabel)}</span> <code>${esc(copy.route.mainBridge)}</code></p>
<div class="gaps">${gaps}</div>
<div class="killswitch">
<button type="button" class="button" data-killswitch><span data-kill-on>${esc(copy.route.killSwitch)}</span><span data-kill-off hidden>${esc(copy.route.killSwitchReset)}</span></button>
<p class="killswitch-note">${esc(copy.route.killSwitchCaption)}</p>
</div>`);
};

const renderKill = (copy) => {
  const cards = copy.kill.cards.map((card) => `<article class="kcard">
<h3>${esc(card.h3)}</h3>
<p class="kclaim">${esc(card.claim)}</p>
<p class="kthreshold">${esc(card.threshold)}</p>
${card.note ? `<p class="knote">${esc(card.note)}</p>` : ""}
<p class="kwhere">${esc(card.where)}</p>
</article>`).join("");

  return sec("kill", "kill", copy.kill.number, copy.kill.kicker, `${headOnly(copy.kill.h2, copy.kill.intro)}
<div class="kgrid">${cards}</div>
<p class="stamp">${esc(copy.kill.stamp)}${colon(copy)}${ledger.recorded_at_utc}</p>`);
};

const renderNotDerived = (copy) => {
  const items = copy.notDerived.items.map((item) => `<li>${item}</li>`).join("");
  const submissions = external.submissions.map((entry) => {
    const statusText = entry.status === "UNDER_REVIEW"
      ? copy.notDerived.submissionsUnderReview
      : copy.notDerived.submissionsAwaiting;
    return `<article class="sub"><span class="sub-id">${esc(entry.id)}</span>
<h4>${esc(entry.title)}</h4>
<p class="sub-meta"><em>${esc(entry.journal)}</em> &#183; ${esc(copy.notDerived.submissionsSubmitted)} ${entry.submitted} &#183; <strong>${esc(statusText)}</strong></p>
</article>`;
  }).join("");

  return sec("not-derived", "not-derived", copy.notDerived.number, copy.notDerived.kicker, `${headOnly(copy.notDerived.h2, "")}
<p class="stamp">${esc(copy.notDerived.updated)} ${ledger.recorded_at_utc}</p>
<ol class="nd-list">${items}</ol>
<h3 class="sub-title">${esc(copy.notDerived.submissionsTitle)}</h3>
<p class="section-intro">${esc(copy.notDerived.submissionsIntro)}</p>
<div class="subs">${submissions}</div>
<p class="lane-note">${esc(copy.notDerived.submissionsNoArxiv)}</p>`);
};

const renderMachine = (copy) => {
  const segments = [
    ["leanCertified", machine.leanCertified],
    ["provedCoreOnly", machine.provedCoreOnly],
    ["needsLeanNode", machine.needsLeanNode],
    ["proseEmpiricalOpen", machine.proseEmpiricalOpen],
  ];

  /* No stacked bar. At 771 rows a 94%-full meter reads as "nearly certified",
     which is the one thing this section exists to deny. Lead with the residue. */
  const keys = segments.map(([key, count]) =>
    `<li><code>${esc(copy.machine.barLabels[key])}</code><strong>${count}</strong></li>`).join("");

  return sec("machine", "machine", copy.machine.number, copy.machine.kicker, `${headOnly(copy.machine.h2, "")}
<div class="mfig"><strong>${notCertified}</strong><p>${esc(copy.machine.barNote)}</p></div>
<ul class="mkeys">${keys}</ul>
<p class="mfigures">${copy.machine.figures}</p>
<div class="note note--hedge"><p>${copy.machine.meaning}</p></div>`);
};

const renderVerify = (copy) => {
  const items = copy.verify.links.map(([label, note, key]) => {
    const href = key === "statusJson" ? "../status.json"
      : key === "siteSums" ? "../SITE_SHA256SUMS.txt" : links[key];
    return `<li><a href="${href}"><strong>${esc(label)}</strong><span>${esc(note)}</span></a></li>`;
  }).join("");

  return sec("verify", "verify", copy.verify.number, copy.verify.kicker, `${headOnly(copy.verify.h2, "")}
<p class="section-intro">${esc(copy.verify.checksumIntro)}</p>
<pre class="sha" tabindex="0" role="group" aria-label="${esc(copy.verify.checksumLabel)}"><code>sha256sum K4_Cell_Framework_v2.0-public-review.pdf
${ledger.artifact.sha256}</code></pre>
<p class="frozen">${esc(copy.verify.frozen)}</p>
<ul class="vlinks">${items}</ul>
<p class="lane-note">${esc(copy.verify.buildNote)}</p>
<div class="defect">${esc(copy.verify.artifactDefect)}</div>`);
};

const renderAttack = (copy) => {
  const targets = copy.attack.targets.map(([label, note]) =>
    `<li><a href="${links.targets}"><strong>${esc(label)}</strong><span>${esc(note)}</span></a></li>`).join("");
  const depths = copy.attack.depths.map(([time, note]) =>
    `<li><span class="depth-time">${esc(time)}</span>${esc(note)}</li>`).join("");
  const person = copy.attack.personLines.map((line) => `<li>${esc(line)}</li>`).join("");

  return sec("attack", "attack", copy.attack.number, copy.attack.kicker, `${headOnly(copy.attack.h2, copy.attack.intro)}
<ul class="targets">${targets}</ul>
<ul class="depths">${depths}</ul>
<p class="section-cta"><a class="button primary" href="${links.issues}">${esc(copy.attack.issueCta)}</a> <a class="button" href="${links.discussions}">${esc(copy.attack.discussCta)}</a></p>
<div class="person">
<h3>${esc(copy.attack.personTitle)}</h3>
<p class="person-name">${esc(copy.attack.personName)}</p>
<ul>${person}</ul>
<p class="person-links"><a href="${links.contact}">${esc(copy.attack.personContact)}</a> &#183; <a href="${links.orcid}">ORCID ${esc(copy.attack.personOrcid)}</a></p>
</div>`);
};

/* Paste after the existing 81-state enumeration in scripts/build.mjs; it uses
   the EDGES, ledger, esc and assert already in scope there. Then call
   renderImaginaryFigure(copy) from the section that wants the figure. Verified
   identifier-clean against build.mjs at 869 lines: none of F, POL, ARC, TIP,
   LOOP, PHASE, REAL, CLOCKS, CHORDS, AV, AOUT, AMUL, AHOP, BC, BR, BIN collide. */

/* ------------------------------------------------------------------ *
 * Figure — where i comes from: the four-site loop and the quarter turn *
 *                                                                      *
 * Two panels, one argument. LEFT: the engine is real, and a particle    *
 * pushed round the cell's closed four-site loop accumulates a phase it  *
 * cannot gauge away. RIGHT: that phase is a rotation by 2*pi/n, and a   *
 * genuine complex structure has to square to -1 exactly, which a        *
 * quarter turn does and a third of a turn does not.                     *
 *                                                                      *
 * Nothing below is hand-typed arithmetic. The loop is a Hamiltonian     *
 * cycle of the cell's own six links; the accumulated phases are walked; *
 * the two clocks are complex numbers squared at build time; and the     *
 * "60 degrees off" in the drawing is that arithmetic, not a guess.      *
 * ------------------------------------------------------------------ */

const F = (value) => Number(value.toFixed(2));
const POL = (cx, cy, r, deg) =>
  [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
const ARC = (cx, cy, r, a0, a1) => {
  const [x0, y0] = POL(cx, cy, r, a0);
  const [x1, y1] = POL(cx, cy, r, a1);
  return `M ${F(x0)} ${F(y0)} A ${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 0 ${F(x1)} ${F(y1)}`;
};
/* An arrowhead for a marker travelling counter-clockwise. SVG's y runs down,
   so the screen tangent at angle t is (-sin t, -cos t). */
const TIP = (cx, cy, r, deg, len = 12, half = 5.5) => {
  const [px, py] = POL(cx, cy, r, deg);
  const t = (deg * Math.PI) / 180;
  const dx = -Math.sin(t);
  const dy = -Math.cos(t);
  const bx = px - len * dx;
  const by = py - len * dy;
  return `M ${F(px)} ${F(py)} L ${F(bx - half * dy)} ${F(by + half * dx)} L ${F(bx + half * dy)} ${F(by - half * dx)} Z`;
};

/* ---- the clock, recomputed ---------------------------------------- *
 * The unit the cell emits must be a genuine complex structure: it must
 * really square to -1. Square every clock from n = 2 to n = 12 and see
 * which ones land there. Exactly one does. The panel draws n = 4 against
 * n = 3 and prints how far the third of a turn misses by; if that ever
 * stopped being true, the build must stop rather than the reader. */
const clockOf = (n) => {
  const re = Math.cos((2 * Math.PI) / n);
  const im = Math.sin((2 * Math.PI) / n);
  const squaredDeg = (((720 / n) % 360) + 360) % 360;
  const off = Math.abs(squaredDeg - 180);
  return {
    n,
    turnDeg: 360 / n,
    squaredDeg,
    offDeg: Math.min(off, 360 - off),
    isMinusOne: Math.abs(re * re - im * im + 1) < 1e-12 && Math.abs(2 * re * im) < 1e-12,
  };
};

const CLOCKS = new Map();
for (let n = 2; n <= 12; n += 1) {
  const clock = clockOf(n);
  CLOCKS.set(n, clock);
  assert.equal(clock.isMinusOne, n === 4,
    `clock n=${n}: squaring the turn ${clock.isMinusOne ? "lands" : "does not land"} on -1, but this figure draws n = 4 as the only one that does`);
  assert.equal(clock.isMinusOne, Math.abs(clock.squaredDeg - 180) < 1e-9,
    `clock n=${n}: the complex arithmetic and the drawn angle disagree`);
}
assert.equal(ledger.cell.sites, 4,
  `the figure draws a four-site loop, but ledger.cell.sites is ${ledger.cell.sites}`);
assert.ok(CLOCKS.get(ledger.cell.sites).isMinusOne,
  "the cell's site count and the order of i must be the same number, or this is two figures pretending to be one");
assert.equal(F(CLOCKS.get(3).offDeg), 60,
  "the caption and the drawing both print how far a third of a turn misses by");

/* ---- the loop, taken from the cell's own six links ------------------ */
const LOOP = [0, 1, 2, 3];
const linkKey = (a, b) => (a < b ? `${a}${b}` : `${b}${a}`);
const LOOP_EDGES = LOOP.map((site, step) => linkKey(site, LOOP[(step + 1) % LOOP.length]));
const ALL_EDGES = EDGES.map(([a, b]) => linkKey(a, b));
assert.equal(LOOP.length, ledger.cell.sites, "the loop must visit every site exactly once");
assert.equal(new Set(LOOP_EDGES).size, ledger.cell.sites, "the loop must use one distinct link per hop");
for (const link of LOOP_EDGES) {
  assert.ok(ALL_EDGES.includes(link), `the drawn loop uses link ${link}, which the cell does not have`);
}
const CHORDS = ALL_EDGES.filter((link) => !LOOP_EDGES.includes(link));
assert.equal(CHORDS.length, ledger.cell.edges - ledger.cell.sites,
  `${ledger.cell.edges} links minus a ${ledger.cell.sites}-hop cycle must leave ${ledger.cell.edges - ledger.cell.sites} chords`);
assert.deepEqual([...CHORDS].sort(), ["02", "13"], "the chords are the two links the loop does not use");

/* ---- the accumulated phase, walked rather than typed ---------------- */
const phaseGlyph = ([re, im]) => (im === 0 ? (re > 0 ? "+1" : "−1") : (im > 0 ? "i" : "−i"));
const PHASE = [];
const REAL = [];
let pre = 1;
let pim = 0;
for (let hop = 0; hop < LOOP.length; hop += 1) {
  PHASE.push(phaseGlyph([Math.round(pre), Math.round(pim)]));
  REAL.push(Math.round(pim) === 0);
  [pre, pim] = [-pim, pre];
}
assert.deepEqual([Math.round(pre), Math.round(pim)], [1, 0],
  `${LOOP.length} hops must return the phase to +1, or the loop does not close`);
assert.deepEqual(PHASE, ["+1", "i", "−1", "−i"],
  "the accumulated phase must walk +1, i, −1, −i, which is what the corners are labelled with");
assert.deepEqual(REAL, [true, false, true, false],
  "the walk must alternate real and imaginary, or the panel-A table is lying");
assert.equal(PHASE[LOOP.length / 2], "−1",
  "half a turn round the loop must be exactly -1, or the halfway claim in the caption is false");

/* ---- panel A: the closed four-site loop ----------------------------- */
const AV = [[90, 266], [270, 266], [270, 86], [90, 86]];
const AOUT = [[56, 300], [304, 300], [304, 62], [56, 62]];
const AMUL = [[180, 294, "middle"], [298, 181, "start"], [180, 68, "middle"], [62, 181, "end"]];
const AHOP = [[180, 240], [244, 177], [180, 114], [116, 177]];
assert.equal(AV.length, ledger.cell.sites, "the drawing must have one corner per site");

const panelLoop = (x) => {
  const path = `${AV.map(([px, py], index) => `${index === 0 ? "M" : "L"} ${px} ${py}`).join(" ")} Z`;
  const chords = CHORDS.map((link) => {
    const [a, b] = [Number(link[0]), Number(link[1])];
    return `<line class="ichord" x1="${AV[a][0]}" y1="${AV[a][1]}" x2="${AV[b][0]}" y2="${AV[b][1]}"/>`;
  }).join("");
  const hops = LOOP.map((site, step) => {
    const [mx, my, anchor] = AMUL[step];
    const [hx, hy] = AHOP[step];
    return `<circle class="ihopc" cx="${hx}" cy="${hy}" r="10"/>`
      + `<text class="ihopn" x="${hx}" y="${hy + 4}">${step + 1}</text>`
      + `<text class="imul ia-${anchor}" x="${mx}" y="${my}">&#215;i</text>`;
  }).join("");
  /* Which way round. Without these the static frame a reduced-motion reader
     sees is a square with four numbers on it and no direction of travel. */
  const arrows = LOOP.map((site, step) => {
    const [ax, ay] = AV[site];
    const [bx, by] = AV[LOOP[(step + 1) % LOOP.length]];
    const len = Math.hypot(bx - ax, by - ay);
    const [ux, uy] = [(bx - ax) / len, (by - ay) / len];
    const [tx, ty] = [ax + ux * len * 0.68, ay + uy * len * 0.68];
    return `<path class="iarrow" d="M ${F(tx)} ${F(ty)} L ${F(tx - 9 * ux - 4.5 * uy)} ${F(ty - 9 * uy + 4.5 * ux)} L ${F(tx - 9 * ux + 4.5 * uy)} ${F(ty - 9 * uy - 4.5 * ux)} Z"/>`;
  }).join("");
  const rings = AV.map(([px, py], site) => `<circle class="imk imk${site}" cx="${px}" cy="${py}" r="16"/>`).join("");
  const dots = AV.map(([px, py]) => `<circle class="ivx" cx="${px}" cy="${py}" r="8"/>`).join("");
  const phases = LOOP.map((site, step) => {
    const [px, py] = AOUT[step];
    return `<text class="iph ${REAL[step] ? "iph-re" : "iph-im"}" x="${px}" y="${py}">${PHASE[step]}</text>`;
  }).join("");
  return `<svg class="isvg" viewBox="0 0 360 340" aria-hidden="true" focusable="false">
<g class="ilines">${chords}<path class="iloop" d="${path}"/>
<path class="iwalk iwalk-halo" d="${path}" pathLength="100"/><path class="iwalk" d="${path}" pathLength="100"/></g>
${arrows}${rings}${dots}${hops}${phases}
<text class="ismall" x="${AOUT[0][0]}" y="${AOUT[0][1] + 19}">${esc(x.startLabel)}</text>
</svg>`;
};

/* ---- panel B: the clock -------------------------------------------- */
const BC = [180, 168];
const BR = 105;
const BIN = 66;

const panelClock = () => {
  const four = CLOCKS.get(4);
  const three = CLOCKS.get(3);
  const [cx, cy] = BC;
  const at = (r, deg) => POL(cx, cy, r, deg).map(F);
  const label = (cls, r, deg, dy, body, anchor = "middle") => {
    const [tx, ty] = at(r, deg);
    return `<text class="${cls} ia-${anchor}" x="${tx}" y="${F(ty + dy)}">${body}</text>`;
  };

  /* The four Z4 positions read as ticks outside the circle, so the quarter-turn
     arc can lie on the circle itself without hiding the frame it is measured
     against. */
  const marks = [0, 90, 180, 270].map((deg) => {
    const [t1x, t1y] = at(BR, deg);
    const [t2x, t2y] = at(BR + 9, deg);
    return `<line class="iclk" x1="${t1x}" y1="${t1y}" x2="${t2x}" y2="${t2y}"/>`;
  }).join("");

  const [sx, sy] = at(BIN, 0);
  const [s2x, s2y] = at(BR, 0);
  const [ix, iy] = at(BIN, three.squaredDeg);
  const [mx, my] = at(BR, three.squaredDeg);
  const [lx, ly] = at(BR, four.squaredDeg);
  const [zx, zy] = at(BR, 0);
  const midGap = (180 + three.squaredDeg) / 2;
  const [g1x, g1y] = at(BR + 6, midGap);
  const [g2x, g2y] = at(BR + 16, midGap);

  return `<svg class="isvg" viewBox="0 0 360 340" aria-hidden="true" focusable="false">
<circle class="iring" cx="${cx}" cy="${cy}" r="${BR}"/>
<line class="itick" x1="${cx - 5}" y1="${cy}" x2="${cx + 5}" y2="${cy}"/>
<line class="itick" x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy + 5}"/>
<line class="ispoke" x1="${sx}" y1="${sy}" x2="${s2x}" y2="${s2y}"/>
<line class="ispoke" x1="${ix}" y1="${iy}" x2="${mx}" y2="${my}"/>
${marks}
<path class="itrd" d="${ARC(cx, cy, BIN, 0, three.turnDeg)}"/>
<path class="itrd" d="${ARC(cx, cy, BIN, three.turnDeg, three.squaredDeg)}"/>
<path class="itrd-tip" d="${TIP(cx, cy, BIN, three.turnDeg, 10, 4.5)}"/>
<path class="itrd-tip" d="${TIP(cx, cy, BIN, three.squaredDeg, 10, 4.5)}"/>
<path class="iqtr" d="${ARC(cx, cy, BR, 0, four.turnDeg)}"/>
<path class="iqtr" d="${ARC(cx, cy, BR, four.turnDeg, four.squaredDeg)}"/>
<path class="iqtr-tip" d="${TIP(cx, cy, BR, four.turnDeg)}"/>
<path class="iqtr-tip" d="${TIP(cx, cy, BR, four.squaredDeg)}"/>
<path class="igap" d="${ARC(cx, cy, BR, 180, three.squaredDeg)}"/>
<line class="igapl" x1="${g1x}" y1="${g1y}" x2="${g2x}" y2="${g2y}"/>
<circle class="idot" cx="${zx}" cy="${zy}" r="5"/>
<circle class="iland" cx="${lx}" cy="${ly}" r="10"/>
<circle class="imiss" cx="${mx}" cy="${my}" r="8"/>
${label("iturn", 92, four.turnDeg / 2 - 5, 4, `2&#960;/${four.n}`)}
${label("iturn", 92, four.turnDeg * 1.5 + 5, 4, `2&#960;/${four.n}`)}
${label("iturn3", 40, 75, 4, `2&#960;/${three.n}`)}
${label("iturn3", 40, 195, 4, `2&#960;/${three.n}`)}
${label("ideg", 126, 212, 4, `${F(three.offDeg)}&#176;`)}
${label("imissl", 132, three.squaredDeg, 4, "&#8800; &#8722;1")}
${label("ilab", 130, 0, 5, "+1", "start")}
${label("ilab", 130, 90, 0, "i")}
${label("ilab", 130, 180, 5, "&#8722;1", "end")}
${label("ilab", 130, 270, 12, "&#8722;i")}
</svg>`;
};

/* ---- the figure ----------------------------------------------------- */
const renderImaginaryFigure = (copy) => {
  const x = copy.imaginary;
  for (const field of ["kicker", "title", "aTitle", "aSub", "aNote", "bTitle", "bSub", "bNote",
    "startLabel", "realLabel", "imagLabel", "halfLabel", "closeLabel", "verdictOk", "verdictNo",
    "caption", "tierClosed", "tierCond", "ridesOnLabel", "ridesOn", "checkLabel", "checkAt",
    "drawnLabel", "drawnFrom"]) {
    assert.ok(x[field], `${copy.dir}: imaginary-figure copy is missing "${field}"`);
  }
  const four = CLOCKS.get(4);
  const three = CLOCKS.get(3);

  /* The walk, again, in words. Colour marks nothing the text does not say. */
  const walkRows = LOOP.map((site, index) => {
    const hop = index + 1;
    const stop = hop % LOOP.length;          /* hop 4 arrives back at the start */
    const kind = REAL[stop] ? x.realLabel : x.imagLabel;
    const beat = hop === LOOP.length / 2 ? x.halfLabel : hop === LOOP.length ? x.closeLabel : "";
    return `<div class="iv"><span class="ivg">${hop}</span>
<code class="ivf">i<sup>${hop}</sup> = ${PHASE[stop]}</code>
<span class="ivt">${esc(beat ? `${kind} · ${beat}` : kind)}</span></div>`;
  }).join("");

  const verdict = (clock, ok, note) => `<div class="iv ${ok ? "iv-ok" : "iv-no"}">
<span class="ivg" aria-hidden="true">${ok ? "&#10003;" : "&#10007;"}</span>
<code class="ivf">(2&#960;/${clock.n})&#178; = ${F(clock.squaredDeg)}&#176; ${ok ? "=" : "&#8800;"} &#8722;1</code>
<span class="ivt">${esc(note)}</span></div>`;

  return `<figure class="ifig">
<p class="ifig-k"><span>${esc(x.kicker)}</span>${esc(x.title)}</p>
<div class="ipanels">
<div class="ipanel">
<h4 class="ipt"><b>A</b>${esc(x.aTitle)}</h4>
<p class="ips">${esc(x.aSub)}</p>
${panelLoop(x)}
<div class="itable">${walkRows}</div>
<p class="ipn">${esc(x.aNote)}</p>
</div>
<div class="ipanel">
<h4 class="ipt"><b>B</b>${esc(x.bTitle)}</h4>
<p class="ips">${esc(x.bSub)}</p>
${panelClock()}
<div class="itable">${verdict(four, true, x.verdictOk)}${verdict(three, false, x.verdictNo)}</div>
<p class="ipn">${esc(x.bNote)}</p>
</div>
</div>
<figcaption class="icap">
<p class="icap-b">${x.caption}</p>
<p class="icap-t"><span class="itag itag-closed">${esc(x.tierClosed)}</span><span class="itag itag-cond">${esc(x.tierCond)}</span></p>
<p class="icap-r"><span>${esc(x.ridesOnLabel)}</span>${esc(x.ridesOn)}</p>
<p class="icap-r"><span>${esc(x.drawnLabel)}</span>${esc(x.drawnFrom
    .replace("{loop}", String(LOOP.length))
    .replace("{edges}", String(ledger.cell.edges))
    .replace("{lo}", String(Math.min(...CLOCKS.keys())))
    .replace("{hi}", String(Math.max(...CLOCKS.keys())))
    .replace("{n}", String(ledger.cell.sites)))}</p>
<p class="icap-r"><span>${esc(x.checkLabel)}</span>${esc(x.checkAt)}</p>
</figcaption>
</figure>`;
};

/* ------------------------------------------------------------------ *
 * Figure for explain row 06 — the hypercharges, times six.            *
 *                                                                     *
 * No number below is typed. The seven fractions, the seven integers    *
 * and the seven names are lifted out of the row-06 sentence in each    *
 * deck, so the drawing cannot drift away from the prose it draws; the  *
 * multiplication is then recomputed and asserted, so a mis-parse can   *
 * only fail the build, never print a false equality.                   *
 * ------------------------------------------------------------------ */

const HY_LIFT = 6;
const HY_MINUS = "−";

/* Seven numbers in a row, separated by a comma or an ideographic comma.
   The row-06 body contains exactly two such runs: the hypercharges, then
   the integers. */
const HY_RUN = /[−-]?\d+(?:\/\d+)?(?:\s*[,、]\s*[−-]?\d+(?:\/\d+)?){6}/g;
/* The name list is the em-dash aside; it is the one place the names appear. */
const HY_NAMES = { en: /names — ([^—]+) —/, zh: /名字——([^—]+)——/ };

const hyRational = (text) => {
  const match = String(text).match(/^([−-]?)(\d+)(?:\/(\d+))?$/);
  assert.ok(match, `row 06: unparseable hypercharge "${text}"`);
  const sign = match[1] ? -1 : 1;
  return { n: sign * Number(match[2]), d: match[3] ? Number(match[3]) : 1 };
};

const hyRead = (copy) => {
  const row = copy.explain.rows.find((r) => r.n === "06");
  assert.ok(row, `${copy.dir}: explain row 06 is gone; the hypercharge figure has nothing to draw`);
  assert.deepEqual(row.tags, ["closed", "conditional"],
    `${copy.dir}: row 06 no longer carries closed+conditional; the figure's tier strip would lie`);
  assert.ok(/\bE8\b/.test(row.ridesOn), `${copy.dir}: row 06 no longer names E8`);
  assert.ok(row.body.includes(`δ = ${HY_MINUS}5`),
    `${copy.dir}: row 06 no longer prints the integer lift δ = ${HY_MINUS}5`);

  const runs = row.body.match(HY_RUN) ?? [];
  assert.equal(runs.length, 2,
    `${copy.dir}: row 06 must contain exactly two seven-number runs (the fractions, then the integers); found ${runs.length}`);
  const split = (run) => run.split(/\s*[,、]\s*/);
  const fractions = split(runs[0]);
  const integers = split(runs[1]);
  assert.equal(fractions.length, 7);
  assert.equal(integers.length, 7);

  const names = (row.body.match(HY_NAMES[copy.dir]) ?? [])[1];
  assert.ok(names, `${copy.dir}: row 06 no longer lists the particle names between em dashes`);
  const nameList = names.split(/\s*[,、]\s*/);
  assert.equal(nameList.length, 7, `${copy.dir}: row 06 lists ${nameList.length} names, not 7`);

  /* THE claim of the figure, recomputed: six times each fraction is the
     integer printed beside it. Nothing else in the drawing asserts an
     equality, so this is the whole honesty surface of the arithmetic. */
  const rows = fractions.map((text, index) => {
    const q = hyRational(text);
    const lifted = (HY_LIFT * q.n) / q.d;
    assert.ok(Number.isInteger(lifted),
      `row 06: ${HY_LIFT} × ${text} = ${lifted}, which is not an integer`);
    const stated = hyRational(integers[index]);
    assert.equal(stated.d, 1, `row 06: "${integers[index]}" is not an integer`);
    assert.equal(lifted, stated.n,
      `row 06: ${HY_LIFT} × ${text} = ${lifted}, but the sentence prints ${stated.n}`);
    return { text, q, integer: lifted, name: nameList[index] };
  });

  return { row, rows, fractions, integers, nameList };
};

/* The two decks must be drawing the same seven numbers, and the integers the
   figure prints must really cancel the four anomalies. */
{
  const a = hyRead(en);
  const b = hyRead(zh);
  assert.deepEqual(a.rows.map((r) => r.text), b.rows.map((r) => r.text),
    "row 06: the English and Chinese decks print different hypercharges");
  assert.deepEqual(a.rows.map((r) => r.integer), b.rows.map((r) => r.integer),
    "row 06: the English and Chinese decks print different integers");

  /* The Standard-Model chiral assignment used here is the textbook one, in
     left-handed Weyl form: [row index, colour dimension, isospin dimension,
     conjugation sign]. It is used ONLY to recompute the four anomaly sums. The
     figure draws no representations, and the derivation it illustrates attaches
     no names to its rows; the seventh row is a scalar and enters no anomaly
     condition, so the lift alone checks it. */
  const HY_CHIRAL = [[0, 3, 2, 1], [1, 3, 1, -1], [2, 3, 1, -1], [3, 1, 2, 1], [4, 1, 1, -1], [5, 1, 1, -1]];
  const Y = (e) => e[3] * a.rows[e[0]].integer;
  const sum = (fn) => HY_CHIRAL.reduce((total, e) => total + fn(e), 0);
  assert.equal(sum((e) => e[1] * e[2] * Y(e)), 0, "row 06: the integers fail the gravitational anomaly condition");
  assert.equal(sum((e) => e[1] * e[2] * Y(e) ** 3), 0, "row 06: the integers fail the U(1)³ anomaly condition");
  assert.equal(sum((e) => (e[1] === 3 ? e[2] * Y(e) : 0)), 0, "row 06: the integers fail the SU(3)²U(1) anomaly condition");
  assert.equal(sum((e) => (e[2] === 2 ? e[1] * Y(e) : 0)), 0, "row 06: the integers fail the SU(2)²U(1) anomaly condition");
}

/* Two orientations of one table. The phone cannot hold a fourth column, so
   there the name drops to an indented grey line under its own row, still
   behind a rule of its own; nothing else changes. */
const HY_GEO = {
  /* The wide plate is 662 units across because the narrowest column that ever
     shows it — a 720px viewport — is 680px wide. The drawing therefore never
     renders below its design size, at any width from 720px to 2560px. */
  wide: {
    w: 662, idxX: 16, signX: 60, fracX: 82, railX: 132, railW: 138, eqX: 294,
    intSignX: 324, intX: 333, ruleEnd: 368, breakX: 400, nameX: 430,
    top: 46, pitch: 52, nameDy: 0,
  },
  /* The narrow plate is 300 units across so that a 320px phone — the site's
     shell is 292px there — still renders it at very nearly design size. */
  narrow: {
    w: 300, idxX: 12, signX: 34, fracX: 54, railX: 84, railW: 108, eqX: 212,
    intSignX: 236, intX: 245, ruleEnd: 300, breakX: 84, nameX: 96,
    top: 58, pitch: 76, nameDy: 33,
  },
};

const renderHypercharge = (copy, { figure = "06", linkCodes = esc } = {}) => {
  const { row, rows, fractions, integers, nameList } = hyRead(copy);
  const x = copy.explain;
  const tagLabel = Object.fromEntries(x.tagKey.map(([state, label]) => [state, label]));
  const zhDeck = copy.dir === "zh";
  const listSep = zhDeck ? "、" : ", ";
  const delta = `δ = ${HY_MINUS}5`;

  const t = zhDeck ? {
    figLabel: `图 ${figure}`,
    colFrac: "标准模型超荷",
    colOp: `× ${HY_LIFT}`,
    colInt: "被逼到的整数",
    intNoteA: `反常相消 · 整数提升 ${delta}`,
    intNoteB: "由三条独立方程重复确定",
    colName: "名字",
    nameNoteA: "是最后才贴上去的",
    nameNoteB: "推导中没有任何一个方程用到它们",
    idxNote: "01–07 是基底的七个匿名行，只按它们所处的位置和所带的东西标记，不贴任何粒子名。",
    idxNoteN: ["01–07 是基底的七个匿名行，只按它们所处的", "位置和所带的东西标记，不贴任何粒子名。"],
    narrowNoteA: "每行下方缩进的灰字是粒子名——",
    narrowNoteB: "是最后才贴上去的；推导中没有任何一个方程用到它们。",
    caption:
      "把标准模型的七个超荷乘以六，得到的正是基底七个匿名行被逼到的那串整数，顺序一致。"
      + `整数由反常相消，连同一个整数提升 ${delta}（由三条独立方程重复确定）逼出。`
      + "灰色那一栏的名字是最后才贴上去的；推导中没有任何一个方程用到它们，所以它与前两栏断开排列。",
    ariaA: "第 06 行：标准模型的七个超荷 ",
    ariaB: "，各乘以六，依次等于基底七个匿名行被逼到的整数 ",
    ariaC: "。粒子名（",
    ariaD: "）单列一栏，为事后附加，推导中未用到。",
  } : {
    figLabel: `Fig. ${figure}`,
    colFrac: "Standard Model hypercharge",
    colOp: `× ${HY_LIFT}`,
    colInt: "forced integers",
    intNoteA: `anomaly cancellation · integer lift ${delta}`,
    intNoteB: "over-determined by three independent equations",
    colName: "names",
    nameNoteA: "attached afterwards",
    nameNoteB: "no equation in the derivation uses them",
    idxNote: "01–07 are seven anonymous rows of the substrate, labelled only by where they sit and what they carry.",
    idxNoteN: ["01–07 are seven anonymous rows of the substrate,", "labelled only by where they sit and what they carry."],
    narrowNoteA: "The indented grey line under each row is the particle name —",
    narrowNoteB: "attached afterwards; no equation in the derivation uses them.",
    caption:
      "Multiply the Standard Model's seven hypercharges by six and you get the list "
      + "the substrate's seven anonymous rows are forced to, in order. The integers come from "
      + `anomaly cancellation together with one single integer lift, ${delta}, that three `
      + "independent equations over-determine. The names in the grey column are attached afterwards; "
      + "no equation in the derivation uses them, which is why the column is set apart.",
    ariaA: "Row 06: the Standard Model's seven hypercharges ",
    ariaB: ", each multiplied by six, equal in order the integers ",
    ariaC: " that the substrate's seven anonymous rows are forced to. The particle names (",
    ariaD: ") sit in a column of their own, attached afterwards and used by no equation in the derivation.",
  };

  const aria = t.ariaA + fractions.join(listSep) + t.ariaB + integers.join(listSep)
    + t.ariaC + nameList.join(listSep) + t.ariaD;

  const plate = (key) => {
    const g = HY_GEO[key];
    const narrow = key === "narrow";
    const at = (index) => g.top + g.pitch / 2 + index * g.pitch;
    /* The phone's last name sits below its row, so the foot rule needs the
       extra leading or it cuts through the descenders. */
    const bottom = g.top + rows.length * g.pitch + (narrow ? 16 : 0);
    const height = bottom + (narrow ? 112 : 68);

    /* A printed table's shape: one heading band, the rows, then the notes under
       the foot rule. Wide takes one heading line with the operator centred over
       its own column; narrow takes two, because no phone holds two English
       column heads side by side. */
    const head = narrow ? [
      `<text class="hy-h" x="0" y="28">${esc(`${t.colFrac}  ${t.colOp}`)}</text>`,
      `<text class="hy-h hy-e" x="${g.ruleEnd}" y="44">${esc(t.colInt)}</text>`,
    ] : [
      `<text class="hy-h" x="0" y="30">${esc(t.colFrac)}</text>`,
      `<text class="hy-h hy-mid" x="${g.railX + g.railW / 2}" y="30">${esc(t.colOp)}</text>`,
      `<text class="hy-h hy-e" x="${g.ruleEnd}" y="30">${esc(t.colInt)}</text>`,
      `<text class="hy-h" x="${g.nameX}" y="30">${esc(t.colName)}</text>`,
    ];

    /* Table notes, under the foot rule: what fixed the integers, on the right;
       what the seven rows are and when the names arrived, on the left. */
    const note = (cls, x, y, text) => `<text class="hy-n ${cls}" x="${x}" y="${y}">${text}</text>`;
    const deltaUp = esc(t.intNoteA).replace(esc(delta), `<tspan class="hy-delta">${esc(delta)}</tspan>`);
    const notes = [
      note("hy-e", g.ruleEnd, bottom + 22, deltaUp),
      note("hy-e", g.ruleEnd, bottom + 36, esc(t.intNoteB)),
    ];
    if (narrow) {
      notes.push(note("", 0, bottom + 56, esc(t.idxNoteN[0])));
      notes.push(note("", 0, bottom + 69, esc(t.idxNoteN[1])));
      notes.push(note("", 0, bottom + 87, esc(t.narrowNoteA)));
      notes.push(note("", 0, bottom + 100, esc(t.narrowNoteB)));
    } else {
      notes.push(note("", g.nameX, bottom + 22, esc(t.nameNoteA)));
      notes.push(note("", g.nameX, bottom + 36, esc(t.nameNoteB)));
      notes.push(note("", 0, bottom + 56, esc(t.idxNote)));
    }

    /* Heavy top and foot rules, a light rule under the headings — and both heavy
       rules BREAK across the gap that separates the names from the arithmetic.
       The break is the argument. */
    const rules = narrow
      ? `<path class="hy-rule-hv" d="M0 8H${g.ruleEnd}M0 ${bottom}H${g.ruleEnd}"/>`
        + `<path class="hy-rule" d="M0 ${g.top}H${g.ruleEnd}"/>`
      : `<path class="hy-rule-hv" d="M0 8H${g.ruleEnd}M0 ${bottom}H${g.ruleEnd}M${g.nameX} 8H${g.w}M${g.nameX} ${bottom}H${g.w}"/>`
        + `<path class="hy-rule" d="M0 ${g.top}H${g.ruleEnd}M${g.nameX} ${g.top}H${g.w}"/>`
        + `<path class="hy-break" d="M${g.breakX} 8V${bottom}"/>`;

    /* The operator, drawn: one rail cut into exactly HY_LIFT equal intervals by
       HY_LIFT + 1 marks. The first mark is the fraction taken once; the last is
       the landing, and it is the only mark set in the strongest foreground. */
    const step = g.railW / HY_LIFT;
    const railD = rows.map((_, i) => `M${g.railX} ${at(i)}H${g.railX + g.railW}`).join("");
    const tickD = rows.map((_, i) => Array.from({ length: HY_LIFT }, (_, k) => {
      const h = k === 0 ? 12 : 8;
      return `M${(g.railX + step * k).toFixed(1)} ${(at(i) - h / 2).toFixed(1)}v${h}`;
    }).join("")).join("");
    const landD = rows.map((_, i) => `M${g.railX + g.railW} ${at(i) - 8}v16`).join("");
    const barD = rows.map((r, i) => (r.q.d === 1 ? "" : `M${g.fracX - 11} ${at(i)}h22`)).join("");

    const body = rows.map((r, i) => {
      const y = at(i);
      const parts = [];
      parts.push(`<text class="hy-idx hy-e" x="${g.idxX}" y="${y + 4}">${String(i + 1).padStart(2, "0")}</text>`);
      if (r.q.n < 0) parts.push(`<text class="hy-sign hy-mid" x="${g.signX}" y="${y + 5}">${HY_MINUS}</text>`);
      if (r.q.d === 1) {
        parts.push(`<text class="hy-frac hy-mid" x="${g.fracX}" y="${y + 6}">${Math.abs(r.q.n)}</text>`);
      } else {
        parts.push(`<text class="hy-frac hy-mid" x="${g.fracX}" y="${y - 5}">${Math.abs(r.q.n)}</text>`);
        parts.push(`<text class="hy-frac hy-mid" x="${g.fracX}" y="${y + 17}">${r.q.d}</text>`);
      }
      parts.push(`<text class="hy-eq hy-mid" x="${g.eqX}" y="${y + 5}">=</text>`);
      if (r.integer < 0) parts.push(`<text class="hy-isign hy-mid" x="${g.intSignX}" y="${y + 7}">${HY_MINUS}</text>`);
      parts.push(`<text class="hy-int" x="${g.intX}" y="${y + 7}">${Math.abs(r.integer)}</text>`);
      if (narrow) {
        parts.push(`<path class="hy-break" d="M${g.breakX} ${y + g.nameDy - 11}v15"/>`);
        parts.push(`<text class="hy-name" x="${g.nameX}" y="${y + g.nameDy}">${esc(r.name)}</text>`);
      } else {
        parts.push(`<text class="hy-name" x="${g.nameX}" y="${y + 4}">${esc(r.name)}</text>`);
      }
      return parts.join("");
    }).join("");

    return `<svg class="hy-svg hy-${key}" viewBox="0 0 ${g.w} ${height}" role="img" aria-label="${esc(aria)}">
${head.join("")}${notes.join("")}${rules}
<path class="hy-rail" d="${railD}"/><path class="hy-tk" d="${tickD}"/><path class="hy-land" d="${landD}"/><path class="hy-bar" d="${barD}"/>
${body}</svg>`;
  };

  const chips = row.tags
    .map((state) => `<span class="tag ${state}">${esc(tagLabel[state])}</span>`).join("");

  return `<figure class="hy">${plate("wide")}${plate("narrow")}
<figcaption class="hy-cap">
<p class="hy-lead"><b>${esc(t.figLabel)}</b>${zhDeck ? " · " : " &#8212; "}${esc(t.caption)}</p>
<p class="hy-tier">${chips}<span class="hy-rides">${esc(x.ridesOnLabel)}${colon(copy)}${linkCodes(row.ridesOn)}</span></p>
</figcaption>
</figure>`;
};

/* ---- two edits to wire it in ------------------------------------------
 * 1. Hoist `linkCodes` out of renderExplain to module scope (it is already a
 *    pure function of `links`), so the caption's "rides on" line links E8 and
 *    Target 8 exactly the way the row above it does.
 * 2. In renderExplain's `row()`, drop the plate in after the body:
 *
 *      <p class="xbody">${r.body}</p>
 *      ${r.n === "06" ? renderHypercharge(copy, { figure: "06", linkCodes }) : ""}
 *
 *    Pass the site's global figure number in `figure` once the other plates
 *    are placed; it defaults to the row number so it can never be wrong.
 * --------------------------------------------------------------------- */

/* Paste this whole block into scripts/build.mjs after renderLedger and before
 * renderRoute. It uses only what build.mjs already has in scope: `assert`,
 * `esc`, `colon`, `ledger`, `en`, `zh`.
 *
 * CALL SITE — inside the existing renderRoute(copy), make three edits:
 *   1. sectionHead(copy.route.number, copy.route.kicker, copy.route.h2, "")
 *      (pass "" for the intro: the figure's caption now prints it verbatim,
 *      so it must not appear twice on the page)
 *   2. replace  <ol class="stations">${stations}</ol>
 *          and  <p class="main-bridge">…</p>
 *      with     ${renderRouteFigure(copy)}
 *   3. keep <div class="gaps">${gaps}</div> exactly as it is — those cards
 *      carry the prose description of each interface, which the figure
 *      deliberately does not, and app.js still hangs the .gap-toggle buttons
 *      and the kill switch off them.
 * The `stations` const at the top of renderRoute becomes unused; delete it.
 */

/* ------------------------------------------------------------------ *
 * Figure 6 — the route, drawn as a chain with its published holes.    *
 *                                                                     *
 * The eight text cards this replaces had dashed top borders and no    *
 * line between them, so the one thing the section is about — that the *
 * chain is broken, in named places, by the author himself — was       *
 * carried entirely by prose. Here the breaks are breaks: the rail     *
 * runs into a cut face and stops, the page ground shows through, and  *
 * the erratum code sits in the void.                                  *
 *                                                                     *
 * Nothing is typed in twice. Tiers come from copy.route.stations, the *
 * holes from copy.route.gaps, and the rows hanging under each hole    *
 * are pinned below to the ledger's own interface lists, so a row that *
 * gains or loses an interface cannot leave a stale hole on the page:  *
 * the build fails instead.                                            *
 * ------------------------------------------------------------------ */

for (const copy of [en, zh]) {
  const tiers = copy.route.stations.map(([, , tier]) => tier);
  assert.equal(tiers.length, 8, `${copy.dir}: the route figure is drawn for eight stations, got ${tiers.length}`);

  const known = new Set(copy.explain.tagKey.map(([state]) => state));
  for (const tier of tiers) {
    assert.ok(known.has(tier), `${copy.dir}: route station tier "${tier}" has no label in explain.tagKey`);
  }

  /* One tier change, and the figure hangs the main open bridge on it. A second
     change would mean the drawing invents a bridge nobody published. */
  const flips = tiers.filter((tier, index) => index > 0 && tier !== tiers[index - 1]);
  assert.equal(flips.length, 1, `${copy.dir}: the route must change tier exactly once, found ${flips.length}`);
  assert.equal(tiers.indexOf("conditional"), 4,
    `${copy.dir}: the figure brackets four closed stations, then four conditional ones`);

  /* Each hole hangs exactly the rows the ledger says ride on that interface. */
  for (const [code, , carries] of copy.route.gaps) {
    const fromLedger = ledger.gaussian
      .filter((row) => row.interfaces.includes(code)).map((row) => row.id).sort();
    assert.deepEqual([...carries].sort(), fromLedger,
      `${copy.dir}: route gap ${code} draws [${carries}], the ledger's interface lists give [${fromLedger}]`);
  }

  /* And no numeric row may ride on an interface the figure draws no hole for:
     that would print a chain whose gaps are quietly incomplete. */
  const drawn = new Set(copy.route.gaps.map(([code]) => code));
  for (const row of ledger.gaussian) {
    for (const code of row.interfaces) {
      assert.ok(drawn.has(code),
        `${copy.dir}: ledger row ${row.id} rides on ${code}, which the route figure draws no gap for`);
    }
  }
}

const FIG_CJK = /[⺀-鿿　-〿＀-￯]/;

/* SVG has no line box, so every wrap is measured here. 0.56em is a fair mean
   advance for the Latin faces in --sans and --mono; a Han glyph is 1em. */
const figWidth = (text, size) => [...String(text)]
  .reduce((sum, ch) => sum + (FIG_CJK.test(ch) ? size : size * 0.56), 0);

const figWrap = (text, size, max) => {
  const lines = [];
  let line = "";
  for (const token of String(text).split(/(\s+)/)) {
    if (token === "") continue;
    if (/^\s+$/.test(token)) { if (line) line += " "; continue; }
    /* Han runs carry no spaces, so they break per glyph or not at all. */
    for (const unit of (FIG_CJK.test(token) ? [...token] : [token])) {
      if (line && figWidth((line + unit).trim(), size) > max) { lines.push(line.trim()); line = unit; }
      else line += unit;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
};

const figText = (cls, x, y, anchor, content) =>
  `<text class="${cls}" x="${x}" y="${y}"${anchor ? ` text-anchor="${anchor}"` : ""}>${esc(content)}</text>`;

const figLines = (cls, x, y, step, anchor, lines) => lines
  .map((line, index) => figText(cls, x, (y + step * index).toFixed(1), anchor, line)).join("");

/* One description for both orientations, assembled only out of strings the
   decks already print, so the spoken figure and the drawn figure cannot
   diverge and no English sentence appears on the Chinese page. */
const figRouteLabel = (copy) => {
  const symbolOf = (id) => ledger.gaussian.find((row) => row.id === id).symbol;
  return [
    `${copy.route.kicker}${colon(copy)}${copy.route.h2}`,
    copy.route.stations.map(([title], index) => `${String(index + 1).padStart(2, "0")} ${title}`).join(" · "),
    `${copy.route.mainBridgeLabel}${colon(copy)}${copy.route.mainBridge}`,
    copy.route.gaps.map(([code, , carries]) => carries.length
      ? `${code} ${copy.route.gapCarries}${colon(copy)}${carries.map(symbolOf).join(" ")}`
      : `${code} ${copy.route.gapCarriesNothing}`).join(" · "),
  ].join(" — ");
};

/* A hole is as wide as the number of rows that fall through it. That is the
   only quantity in the drawing, and E8 reads four times a single-row gap. */
const figHoleWidth = (rows, unit, base) => base + unit * rows.length;

const figRouteWide = (copy) => {
  const W = 1200;
  const railY = 92;
  const nodes = copy.route.stations;
  const tiers = nodes.map(([, , tier]) => tier);
  const flip = tiers.indexOf("conditional");
  const tierLabel = Object.fromEntries(copy.explain.tagKey.map(([state, label]) => [state, label]));

  /* Every settled step gets one unit of rail; the span the author calls open
     gets two, so the main bridge is the widest void on the rail and the four
     closed steps read as the tight, finished stretch they are. */
  const spans = nodes.slice(1).map((_, index) => (index === flip - 1 ? 2 : 1));
  const unit = (1116 - 84) / spans.reduce((sum, span) => sum + span, 0);
  const nx = nodes.map((_, index) => 84 + unit * spans.slice(0, index).reduce((sum, span) => sum + span, 0));

  const links = nx.slice(0, -1).map((x, index) => {
    if (index === flip - 1) return "";
    const tier = tiers[index] === "closed" && tiers[index + 1] === "closed" ? "closed" : "conditional";
    const tip = nx[index + 1] - 11;
    return `<line class="rt-link rt-${tier}" x1="${(x + 11).toFixed(1)}" y1="${railY}" x2="${(tip - 6).toFixed(1)}" y2="${railY}"/>`
      + `<path class="rt-arrow rt-${tier}" d="M${(tip - 7).toFixed(1)} ${railY - 4.6} L${tip.toFixed(1)} ${railY} L${(tip - 7).toFixed(1)} ${railY + 4.6}"/>`;
  }).join("");

  const markers = nx.map((x, index) => `<rect class="rt-node rt-${tiers[index]}" x="${(x - 6.5).toFixed(1)}" y="${railY - 6.5}" width="13" height="13"/>`
    + figText("rt-idx", x.toFixed(1), railY + 26, "middle", String(index + 1).padStart(2, "0"))
    + figLines("rt-title", x.toFixed(1), railY + 44, 15, "middle", figWrap(nodes[index][0], 13, unit - 8))).join("");

  /* The bridge the author calls open. The rail runs on past station 04, meets a
     cut face and stops; it starts again at the far cut face. Nothing spans. */
  const bx = (nx[flip - 1] + nx[flip]) / 2;
  const cutA = nx[flip - 1] + 34;
  const cutB = nx[flip] - 34;
  const bridge = `<line class="rt-link rt-open" x1="${(nx[flip - 1] + 11).toFixed(1)}" y1="${railY}" x2="${cutA.toFixed(1)}" y2="${railY}"/>`
    + `<line class="rt-link rt-open" x1="${cutB.toFixed(1)}" y1="${railY}" x2="${(nx[flip] - 11).toFixed(1)}" y2="${railY}"/>`
    + `<line class="rt-cut" x1="${cutA.toFixed(1)}" y1="${railY - 14}" x2="${cutA.toFixed(1)}" y2="${railY + 14}"/>`
    + `<line class="rt-cut" x1="${cutB.toFixed(1)}" y1="${railY - 14}" x2="${cutB.toFixed(1)}" y2="${railY + 14}"/>`
    + `<line class="rt-lead" x1="${bx.toFixed(1)}" y1="64" x2="${bx.toFixed(1)}" y2="${railY - 8}"/>`
    + figText("rt-brk", bx.toFixed(1), 34, "middle", copy.route.mainBridgeLabel)
    + figText("rt-bridge", bx.toFixed(1), 57, "middle", copy.route.mainBridge);

  const bracket = (from, to, tier) => `<line class="rt-bracket" x1="${from.toFixed(1)}" y1="168" x2="${to.toFixed(1)}" y2="168"/>`
    + nx.filter((_, index) => tiers[index] === tier)
      .map((x) => `<line class="rt-bracket" x1="${x.toFixed(1)}" y1="168" x2="${x.toFixed(1)}" y2="160"/>`).join("")
    + figText(`rt-tier rt-${tier}`, from.toFixed(1), 188, "start", tierLabel[tier]);

  const busY = 214;
  const colX = [150, 382, 614, 846, 1078];
  const trunkX = (nx[flip] - 14 + nx[nodes.length - 1] + 14) / 2;
  const bus = `<line class="rt-bus" x1="${trunkX.toFixed(1)}" y1="168" x2="${trunkX.toFixed(1)}" y2="${busY}"/>`
    + `<line class="rt-bus" x1="${colX[0]}" y1="${busY}" x2="${colX[colX.length - 1]}" y2="${busY}"/>`;

  const cutTop = 244;
  const cutBot = 286;
  let deepest = 0;

  const columns = copy.route.gaps.map(([code, , carries], index) => {
    const cx = colX[index];
    const rows = carries.map((id) => ledger.gaussian.find((row) => row.id === id));
    const half = figHoleWidth(rows, 34, 84) / 2;
    const head = `<line class="rt-stub" x1="${cx}" y1="${busY}" x2="${cx}" y2="${cutTop}"/>`
      + `<line class="rt-cut" x1="${(cx - half).toFixed(1)}" y1="${cutTop}" x2="${(cx + half).toFixed(1)}" y2="${cutTop}"/>`
      + figText("rt-code", cx, 272, "middle", code)
      + `<line class="rt-cut" x1="${(cx - half).toFixed(1)}" y1="${cutBot}" x2="${(cx + half).toFixed(1)}" y2="${cutBot}"/>`;

    if (!rows.length) {
      const note = figWrap(copy.route.gapCarriesNothing, 11, 200);
      deepest = Math.max(deepest, 320 + 14 * note.length);
      return head
        + `<line class="rt-drop" x1="${cx}" y1="${cutBot}" x2="${cx}" y2="302"/>`
        + `<line class="rt-dead" x1="${cx - 9}" y1="302" x2="${cx + 9}" y2="302"/>`
        + figLines("rt-note", cx, 320, 14, "middle", note);
    }

    const chipW = Math.min(2 * half - 12,
      Math.max(96, Math.max(...rows.map((row) => figWidth(row.symbol, 12.5))) + 24));
    const chips = rows.map((row, slot) => {
      const y = 320 + slot * 28;
      return `<rect class="rt-chip" x="${(cx - chipW / 2).toFixed(1)}" y="${y}" width="${chipW.toFixed(1)}" height="22" rx="2"/>`
        + (row.interfaces.length > 1
          ? `<rect class="rt-chip-in" x="${(cx - chipW / 2 + 3).toFixed(1)}" y="${y + 3}" width="${(chipW - 6).toFixed(1)}" height="16" rx="1"/>`
          : "")
        + figText("rt-sym", cx, y + 15, "middle", row.symbol);
    }).join("");
    deepest = Math.max(deepest, 320 + 28 * (rows.length - 1) + 22);

    return head
      + `<line class="rt-drop" x1="${cx}" y1="${cutBot}" x2="${cx}" y2="300"/>`
      + figText("rt-carries", cx, 312, "middle", copy.route.gapCarries)
      + chips;
  }).join("");

  /* One row can go dark two ways. Say so, rather than leave a chip drawn twice
     with no explanation; both the fact and the codes come from the ledger. */
  const dupNote = ledger.gaussian.filter((row) => row.interfaces.length > 1)
    .map((row) => (copy.dir === "zh"
      ? `${row.symbol} 同时挂在 ${row.interfaces.join(" 与 ")} 上，因此在图上出现两次。`
      : `${row.symbol} hangs on ${row.interfaces.join(" and ")} at once, so it is drawn twice.`)).join("  ");

  const H = deepest + 40;
  return `<svg class="rt rt-wide" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(figRouteLabel(copy))}">
${links}${bridge}${markers}
${bracket(nx[0] - 14, nx[flip - 1] + 14, "closed")}${bracket(nx[flip] - 14, nx[nodes.length - 1] + 14, "conditional")}
${bus}${figText("rt-buslabel", 8, busY + 4, "start", copy.dir === "zh" ? "具名接口" : "NAMED INTERFACES")}
${columns}
${dupNote ? figText("rt-note", 8, H - 16, "start", dupNote) : ""}</svg>`;
};

/* Below 1024px the same drawing turns through ninety degrees: the rail runs
   down the left margin, the titles sit beside it on one line each, and the
   five holes stack under the chain instead of fanning out beside it. */
const figRouteNarrow = (copy) => {
  const W = 360;
  const railX = 46;
  const nodes = copy.route.stations;
  const tiers = nodes.map(([, , tier]) => tier);
  const flip = tiers.indexOf("conditional");
  const tierLabel = Object.fromEntries(copy.explain.tagKey.map(([state, label]) => [state, label]));
  /* The open span opens exactly as far as its own label needs, and no further. */
  const bridgeLines = figWrap(copy.route.mainBridge, 12, 268);
  const openSpan = 46 + 15 * bridgeLines.length;
  const ny = nodes.map((_, index) => 34 + 56 * index + (index >= flip ? openSpan : 0));

  const links = ny.slice(0, -1).map((y, index) => {
    if (index === flip - 1) return "";
    const tier = tiers[index] === "closed" && tiers[index + 1] === "closed" ? "closed" : "conditional";
    const tip = ny[index + 1] - 11;
    return `<line class="rt-link rt-${tier}" x1="${railX}" y1="${(y + 11).toFixed(1)}" x2="${railX}" y2="${(tip - 6).toFixed(1)}"/>`
      + `<path class="rt-arrow rt-${tier}" d="M${railX - 4.6} ${(tip - 7).toFixed(1)} L${railX} ${tip.toFixed(1)} L${railX + 4.6} ${(tip - 7).toFixed(1)}"/>`;
  }).join("");

  const markers = ny.map((y, index) => `<rect class="rt-node rt-${tiers[index]}" x="${railX - 6.5}" y="${(y - 6.5).toFixed(1)}" width="13" height="13"/>`
    + figText("rt-idx", railX + 20, (y + 4).toFixed(1), "start", String(index + 1).padStart(2, "0"))
    + figText("rt-title", railX + 44, (y + 4).toFixed(1), "start", nodes[index][0])).join("");

  const cutA = ny[flip - 1] + 22;
  const cutB = ny[flip] - 22;
  const bridge = `<line class="rt-link rt-open" x1="${railX}" y1="${(ny[flip - 1] + 11).toFixed(1)}" x2="${railX}" y2="${cutA}"/>`
    + `<line class="rt-link rt-open" x1="${railX}" y1="${cutB}" x2="${railX}" y2="${(ny[flip] - 11).toFixed(1)}"/>`
    + `<line class="rt-cut" x1="${railX - 13}" y1="${cutA}" x2="${railX + 13}" y2="${cutA}"/>`
    + `<line class="rt-cut" x1="${railX - 13}" y1="${cutB}" x2="${railX + 13}" y2="${cutB}"/>`
    + figText("rt-brk", railX + 20, cutA + 18, "start", copy.route.mainBridgeLabel)
    + figLines("rt-bridge", railX + 20, cutA + 38, 15, "start", bridgeLines);

  const bracket = (from, to, tier) => {
    const mid = (from + to) / 2;
    return `<line class="rt-bracket" x1="22" y1="${from.toFixed(1)}" x2="22" y2="${to.toFixed(1)}"/>`
      + ny.filter((_, index) => tiers[index] === tier)
        .map((y) => `<line class="rt-bracket" x1="22" y1="${y.toFixed(1)}" x2="30" y2="${y.toFixed(1)}"/>`).join("")
      + `<text class="rt-tier rt-${tier}" x="13" y="${mid.toFixed(1)}" text-anchor="middle" transform="rotate(-90 13 ${mid.toFixed(1)})">${esc(tierLabel[tier])}</text>`;
  };

  const busY = ny[nodes.length - 1] + 34;
  const bus = `<line class="rt-bus" x1="22" y1="${(ny[nodes.length - 1] + 11).toFixed(1)}" x2="22" y2="${busY}"/>`
    + `<line class="rt-bus" x1="22" y1="${busY}" x2="${railX}" y2="${busY}"/>`
    + figText("rt-buslabel", railX + 12, busY + 4, "start", copy.dir === "zh" ? "具名接口" : "NAMED INTERFACES");

  let y = busY;
  const columns = copy.route.gaps.map(([code, , carries]) => {
    const rows = carries.map((id) => ledger.gaussian.find((row) => row.id === id));
    const half = figHoleWidth(rows, 11, 26) / 2;
    const top = y + 28;
    const bottom = top + 34;
    let block = `<line class="rt-stub" x1="${railX}" y1="${y.toFixed(1)}" x2="${railX}" y2="${top.toFixed(1)}"/>`
      + `<line class="rt-cut" x1="${(railX - half).toFixed(1)}" y1="${top.toFixed(1)}" x2="${(railX + half).toFixed(1)}" y2="${top.toFixed(1)}"/>`
      + figText("rt-code", railX, (top + 22).toFixed(1), "middle", code)
      + `<line class="rt-cut" x1="${(railX - half).toFixed(1)}" y1="${bottom.toFixed(1)}" x2="${(railX + half).toFixed(1)}" y2="${bottom.toFixed(1)}"/>`;

    if (!rows.length) {
      const note = figWrap(copy.route.gapCarriesNothing, 11, 268);
      block += `<line class="rt-drop" x1="${railX}" y1="${bottom.toFixed(1)}" x2="${railX}" y2="${(bottom + 12).toFixed(1)}"/>`
        + `<line class="rt-dead" x1="${railX - 9}" y1="${(bottom + 12).toFixed(1)}" x2="${railX + 9}" y2="${(bottom + 12).toFixed(1)}"/>`
        + figLines("rt-note", railX + 22, bottom + 18, 14, "start", note);
      y = bottom + 18 + 14 * note.length;
      return block;
    }

    /* Chips flow into as many rows as they need; E8's four make two, and the
       block below it grows by exactly that much. */
    const placed = [];
    let cursorX = railX + 22;
    let cursorY = bottom + 24;
    for (const row of rows) {
      const w = Math.max(78, figWidth(row.symbol, 12) + 20);
      if (cursorX + w > W - 8 && cursorX > railX + 22) { cursorX = railX + 22; cursorY += 27; }
      placed.push({ row, x: cursorX, y: cursorY, w });
      cursorX += w + 8;
    }
    const foot = cursorY + 21;
    block += `<line class="rt-drop" x1="${railX}" y1="${bottom.toFixed(1)}" x2="${railX}" y2="${foot.toFixed(1)}"/>`
      + figText("rt-carries", railX + 22, (bottom + 14).toFixed(1), "start", copy.route.gapCarries)
      + placed.map(({ row, x, y: cy, w }) => `<rect class="rt-chip" x="${x.toFixed(1)}" y="${cy.toFixed(1)}" width="${w.toFixed(1)}" height="21" rx="2"/>`
        + (row.interfaces.length > 1
          ? `<rect class="rt-chip-in" x="${(x + 3).toFixed(1)}" y="${(cy + 3).toFixed(1)}" width="${(w - 6).toFixed(1)}" height="15" rx="1"/>`
          : "")
        + figText("rt-sym", (x + w / 2).toFixed(1), (cy + 14.5).toFixed(1), "middle", row.symbol)).join("");
    y = foot + 12;
    return block;
  }).join("");

  const dupLines = ledger.gaussian.filter((row) => row.interfaces.length > 1)
    .flatMap((row) => figWrap(copy.dir === "zh"
      ? `${row.symbol} 同时挂在 ${row.interfaces.join(" 与 ")} 上，因此在图上出现两次。`
      : `${row.symbol} hangs on ${row.interfaces.join(" and ")} at once, so it is drawn twice.`, 11, 344));
  const H = Math.round(y + 16 + 14 * dupLines.length);

  return `<svg class="rt rt-narrow" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(figRouteLabel(copy))}">
${links}${bridge}${markers}
${bracket(ny[0] - 11, ny[flip - 1] + 11, "closed")}${bracket(ny[flip] - 11, ny[nodes.length - 1] + 11, "conditional")}
${bus}
${columns}
${figLines("rt-note", 8, y + 14, 14, "start", dupLines)}</svg>`;
};

const renderRouteFigure = (copy) => {
  const isZh = copy.dir === "zh";
  const carried = new Set(copy.route.gaps.flatMap(([, , carries]) => carries));
  const widest = copy.route.gaps.reduce((best, gap) => (gap[2].length > best[2].length ? gap : best));
  /* Counted, never typed: how many holes, how many rows fall through them, and
     which single hole takes the most. The last clause is the figure's own
     honesty — the errata are not indexed by link, so nothing here claims one. */
  const note = isZh
    ? `${copy.route.gaps.length} 个具名缺口共承载 ${carried.size} 行数值，${widest[0]} 一条承载 ${widest[2].length} 行；缺口画多宽，就是有多少行从这里掉下去。缺口按缺口画，不按链节定位——作者的勘误没有按链节编号。`
    : `The ${copy.route.gaps.length} named gaps carry ${carried.size} numeric rows between them; ${widest[0]} alone carries ${widest[2].length}. A gap is drawn as wide as the number of rows that fall through it. The gaps are drawn as gaps, not placed link by link — the author's errata are not indexed by link.`;

  return `<figure class="fig fig-route">
${figRouteWide(copy)}
${figRouteNarrow(copy)}
<figcaption class="fig-cap"><p><b>${isZh ? "图" : "Figure"} ${Number(copy.route.number)}</b>${esc(copy.route.intro)}</p>
<p class="fig-note">${esc(note)}</p></figcaption>
</figure>`;
};

/* ==================================================================== *
 * Figure 04·1 — THE SIGMA AXIS.
 *
 * Paste into scripts/build.mjs immediately after pullBar(), then DELETE
 * pullBar() and its two call sites in renderLedger(): the eleven little
 * bars are what this replaces. Emit the figure once, right after the
 * <div class="legend"> line in renderLedger():
 *
 *     <div class="legend">…</div>
 *     ${sigmaFigure(copy)}
 *     <h3 class="lane">…
 *
 * Needs `assert`, `esc`, `ledger`, `en`, `zh` — all already in scope.
 * ==================================================================== */

/* ---- new copy keys ------------------------------------------------- *
 * Add to src/copy/zh.js under `ledger`:
 *
 *   sigma: {
 *     figNumber: "图 04·1", figTitle: "同一根 σ 刻度上的十一行。",
 *     laneKeys: ["A", "B", "C"], noDigits: "不承诺位数",
 *     bandTag: "通常意义上的吻合", ruleTag: "必须解释", keyTitle: "图例",
 *     keyPull: "可比的 pull，落在自身的值上",
 *     keyCond: "外环：条件依赖于已具名的开放接口",
 *     keyDiag: "等效 χ²，不是高斯 pull",
 *     keyBand: "0–1 σ 带", keyRule: "3 σ 线",
 *     noneTag: "尚未被检验，不是已被证实",
 *     keyNone: "这一道不画任何符合度数字",
 *     ariaLead: "十一行画在同一根 σ 刻度上。",
 *     ariaOff: "不在刻度上，本行不承诺位数",
 *     ariaWorst: "唯一越过 3 σ 线的一行",
 *   },
 *
 * and to src/copy/en.js under `ledger`:
 *
 *   sigma: {
 *     figNumber: "Figure 04·1", figTitle: "The eleven rows on one σ scale.",
 *     laneKeys: ["A", "B", "C"], noDigits: "commits no digits",
 *     bandTag: "ordinary agreement", ruleTag: "must be explained", keyTitle: "Key",
 *     keyPull: "a comparable pull, at its own value",
 *     keyCond: "ring: conditional on a named open interface",
 *     keyDiag: "a χ²-equivalent, not a Gaussian pull",
 *     keyBand: "the 0–1 σ band", keyRule: "the 3 σ rule",
 *     noneTag: "untested, not confirmed",
 *     keyNone: "no agreement figure is drawn for this lane",
 *     ariaLead: "The eleven rows on one shared σ scale.",
 *     ariaOff: "off the scale, no digits committed",
 *     ariaWorst: "the only row past the 3 σ rule",
 *   },
 * -------------------------------------------------------------------- */

const SIGMA_KEYS = ["figNumber", "figTitle", "laneKeys", "noDigits", "bandTag", "ruleTag",
  "keyTitle", "keyPull", "keyCond", "keyDiag", "keyBand", "keyRule", "noneTag", "keyNone",
  "ariaLead", "ariaOff", "ariaWorst"];
for (const copy of [en, zh]) {
  for (const key of SIGMA_KEYS) {
    assert.ok(copy.ledger.sigma?.[key], `${copy.dir}: ledger.sigma is missing "${key}"`);
  }
  assert.equal(copy.ledger.sigma.laneKeys.length, 3,
    `${copy.dir}: ledger.sigma.laneKeys must name exactly three lanes`);
}

const SIGMA_MAX = 4;

/* One pass over the ledger builds the plot model. Nothing below may type
   a number that did not come out of here. */
const sigmaModel = () => [
  ...ledger.gaussian.map((row) => ({
    id: row.id, lane: "a", symbol: row.symbol,
    value: row.noPull ? null : row.pull,
    display: row.pullDisplay, interfaces: row.interfaces ?? [],
    offScale: Boolean(row.noPull),
  })),
  ...ledger.diagnostics.map((row) => ({
    id: row.id, lane: "b", symbol: row.symbol,
    value: Number.parseFloat(row.equivalent),
    display: row.equivalent, interfaces: [],
    offScale: false, worst: Boolean(row.worst),
  })),
  ...ledger.bounds.map((row) => ({
    id: row.id, lane: "c", symbol: row.symbol,
    value: null, display: null, interfaces: [], noFigure: true,
  })),
];

const sigmaRows = sigmaModel();
const sigmaLaneCount = { a: 0, b: 0, c: 0 };
for (const row of sigmaRows) sigmaLaneCount[row.lane] += 1;

/* ---- honesty gate --------------------------------------------------- *
 * The drawing is an argument about eleven numbers. These refuse to build
 * it if the numbers stop supporting the argument. */
assert.equal(sigmaRows.length, 11, `the σ axis must carry all eleven rows, built ${sigmaRows.length}`);
assert.equal(new Set(sigmaRows.map((r) => r.id)).size, 11, "a row is plotted twice on the σ axis");
assert.equal(sigmaLaneCount.a + sigmaLaneCount.b + sigmaLaneCount.c, 11,
  "the three lane counts must sum to eleven");

const sigmaPlotted = sigmaRows.filter((r) => r.value !== null);
for (const r of sigmaPlotted) {
  assert.ok(Number.isFinite(r.value) && r.value >= 0, `${r.id}: unplottable σ ${r.value}`);
}
assert.ok(Math.max(...sigmaPlotted.map((r) => r.value)) <= SIGMA_MAX,
  `a row now exceeds the ${SIGMA_MAX} σ axis; widen SIGMA_MAX rather than clipping it`);

/* The one-sided lane must stay empty. If a bound ever acquires a measured
   partner, this drawing would silently begin to claim agreement. */
for (const row of ledger.bounds) {
  for (const key of ["measured", "sigma", "pull", "pullDisplay", "equivalent"]) {
    assert.ok(!(key in row),
      `bounds row ${row.id} now carries "${key}"; the one-sided lane may not draw an agreement figure`);
  }
}

/* Exactly one row commits nothing, and it is drawn off the scale — never at 0. */
const sigmaOff = sigmaRows.filter((r) => r.offScale);
assert.equal(sigmaOff.length, 1, "expected exactly one row that commits no digits");
assert.equal(sigmaOff[0].id, "alpha_s");
assert.equal(sigmaOff[0].value, null, "a row that commits no digits may not be plotted at zero");

/* The argument of the figure: the worst row is alone past the 3 σ rule. */
const sigmaWorst = sigmaRows.find((r) => r.worst);
assert.ok(sigmaWorst, "ledger.diagnostics no longer marks a worst row");
assert.ok(sigmaWorst.value >= 3,
  `the worst row is ${sigmaWorst.value} σ; the 3 σ rule no longer separates it`);
for (const r of sigmaPlotted) {
  if (r.id === sigmaWorst.id) continue;
  assert.ok(r.value < 3, `${r.id} has also crossed 3 σ; the caption's "alone" is no longer true`);
}

/* ---- monospace metrics, so a label can be dodged without a browser --- */
const SIGMA_WIDE_CH = /[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/;
const sigmaAdvance = (text, size) => {
  let units = 0;
  for (const ch of String(text)) units += SIGMA_WIDE_CH.test(ch) ? 1 : 0.62;
  return units * size;
};
const sigmaLabelWidth = (r, sym, code) => sigmaAdvance(r.symbol, sym) + 8 + sigmaAdvance(r.display, sym)
  + (r.interfaces.length ? 8 + sigmaAdvance(r.interfaces.join(" "), code) : 0);

const sigmaLabel = (r, x, y, cls) =>
  `<text class="sg-lab${cls ? ` ${cls}` : ""}" x="${x.toFixed(1)}" y="${y.toFixed(1)}">`
  + `<tspan class="sg-sym">${esc(r.symbol)}</tspan>`
  + `<tspan class="sg-val" dx="8">${esc(r.display)}</tspan>`
  + (r.interfaces.length ? `<tspan class="sg-if" dx="8">${esc(r.interfaces.join(" "))}</tspan>` : "")
  + `</text>`;

/* Marker SHAPE, never marker colour, carries the lane and the ride-on:
   filled disc = a comparable pull; ring around it = conditional on a named
   open interface; open diamond = a χ²-equivalent; dashed hollow = commits
   nothing. Colour only ever repeats what a shape and a word already say. */
const sigmaMarker = (r, x, y) => {
  const cx = x.toFixed(1), cy = y.toFixed(1);
  if (r.lane === "b") {
    const s = 5.4;
    return `<path class="sg-diamond${r.worst ? " sg-worst" : ""}" d="M${(x - s).toFixed(1)} ${cy}L${cx} ${(y - s).toFixed(1)}L${(x + s).toFixed(1)} ${cy}L${cx} ${(y + s).toFixed(1)}Z"/>`;
  }
  return (r.interfaces.length ? `<circle class="sg-ring" cx="${cx}" cy="${cy}" r="8"/>` : "")
    + `<circle class="sg-dot" cx="${cx}" cy="${cy}" r="4.4"/>`;
};

/* The two builds are display:none swapped, so only the visible one is in
   the accessibility tree; they may therefore share one aria-label. */
const sigmaAria = (copy, sx) => {
  const zhLike = copy.dir === "zh";
  const sep = zhLike ? "；" : "; ";
  const colon = zhLike ? "：" : ": ";
  const say = (row) => row.offScale ? `${row.symbol} — ${sx.ariaOff}`
    : row.noFigure ? row.symbol
    : `${row.symbol} ${row.display}${row.worst ? `${zhLike ? "，" : ", "}${sx.ariaWorst}` : ""}`;
  const lane = (id, name) => `${name}${colon}${sigmaRows.filter((r) => r.lane === id).map(say).join(sep)}`;
  return [sx.ariaLead, lane("a", copy.ledger.laneGaussian), lane("b", copy.ledger.laneDiagnostic),
    `${lane("c", copy.ledger.laneBounds)}${zhLike ? "——" : " — "}${sx.noneTag}`].join(zhLike ? "" : " ");
};

/* ---- horizontal build (>= 901px) ------------------------------------ */
const sigmaWide = (copy, sx) => {
  const W = 1040, X0 = 162, X1 = 980, STEP = 26, SYM = 13, CODE = 11;
  const OFF_X = 4, OFF_W = 122, BRK = 130;
  const px = (s) => X0 + (s / SIGMA_MAX) * (X1 - X0);
  const AN_Y = 17, BR_Y = 26, NUM_Y = 42, RULE_Y = 52;

  const rowsIn = (id) => sigmaRows.filter((r) => r.lane === id && r.value !== null)
    .sort((a, b) => a.value - b.value);

  /* Build-time beeswarm: the marker keeps its true x, and the label falls
     to the lowest tier whose occupied spans it does not touch. Five rows
     land on five tiers at x ≈ 0 — that pile-up IS the finding. */
  const dodge = (rows) => {
    const tiers = [];
    const placed = [];
    for (const r of rows) {
      const x = px(r.value);
      const w = sigmaLabelWidth(r, SYM, CODE);
      const flip = x + 12 + w + 16 > W - 8;
      const span = flip ? [x - 12 - w - 16, x + 8] : [x - 8, x + 12 + w + 16];
      let tier = 0;
      while (tier < 40 && (tiers[tier] ?? []).some(([a, b]) => span[0] < b && a < span[1])) tier += 1;
      (tiers[tier] ??= []).push(span);
      placed.push({ r, x, tier, flip, span });
    }
    return { placed, tiers: tiers.length };
  };

  const lanes = { a: dodge(rowsIn("a")), b: dodge(rowsIn("b")) };
  for (const lane of Object.values(lanes)) {
    for (const p of lane.placed) {
      assert.ok(p.span[0] >= -1 && p.span[1] <= W + 1, `${p.r.id}: label runs off the ${W}px frame`);
      for (const q of lane.placed) {
        if (q === p || q.tier !== p.tier) continue;
        assert.ok(p.span[1] <= q.span[0] || q.span[1] <= p.span[0],
          `beeswarm overlap: ${p.r.id} and ${q.r.id} collide on tier ${p.tier}`);
      }
    }
  }

  let y = RULE_Y;
  const laneBox = (tiers) => {
    const titleY = y + 27, ruleY = y + 37, first = ruleY + 25;
    y = first + Math.max(0, tiers - 1) * STEP + 17;
    return { titleY, ruleY, first };
  };
  const geo = { a: laneBox(lanes.a.tiers), b: laneBox(lanes.b.tiers) };
  const bandBot = y;
  const cTitleY = y + 27, cRuleY = y + 37, cBoxY = cRuleY + 11, cBoxH = 48;
  const H = cBoxY + cBoxH + 12;

  const ticks = [];
  for (let i = 0; i <= SIGMA_MAX * 2; i += 1) {
    const s = i / 2, x = px(s).toFixed(1), major = Number.isInteger(s);
    ticks.push(`<line class="sg-tick${major ? "" : " sg-tick-min"}" x1="${x}" y1="${major ? RULE_Y - 8 : RULE_Y - 4}" x2="${x}" y2="${RULE_Y}"/>`);
    if (major) ticks.push(`<line class="sg-grid" x1="${x}" y1="${RULE_Y}" x2="${x}" y2="${bandBot}"/>`
      + `<text class="sg-num sg-mid" x="${x}" y="${NUM_Y}">${s}</text>`);
  }

  const points = (lane, g) => lane.placed.map(({ r, x, tier, flip }) => {
    const yy = g.first + tier * STEP;
    return `<g class="sg-pt"><line class="sg-stem" x1="${x.toFixed(1)}" y1="${g.ruleY}" x2="${x.toFixed(1)}" y2="${(yy - 7).toFixed(1)}"/>`
      + sigmaMarker(r, x, yy)
      + sigmaLabel(r, flip ? x - 12 : x + 12, yy + 4.5, flip ? "sg-end" : "") + `</g>`;
  }).join("");

  const title = (k, text, n, ty) => `<text class="sg-lane" x="8" y="${ty}">`
    + `<tspan class="sg-lane-k">${esc(k)}</tspan><tspan dx="9">${esc(text)}</tspan>`
    + `<tspan class="sg-lane-n" dx="10">n = ${n}</tspan></text>`;
  const rule = (ry) => `<line class="sg-lrule" x1="${X0}" y1="${ry}" x2="${X1}" y2="${ry}"/>`;

  /* α_s commits no digits, so it gets a cell BEFORE σ = 0, behind a standard
     axis-break glyph. Drawing it at zero would read as a perfect score. */
  const off = sigmaOff[0], oy = geo.a.first;
  const offCell = `<g class="sg-off"><rect class="sg-offbox" x="${OFF_X}" y="${(oy - 18).toFixed(1)}" width="${OFF_W}" height="39" rx="2"/>`
    + `<circle class="sg-hollow" cx="${OFF_X + 15}" cy="${(oy - 4).toFixed(1)}" r="4.4"/>`
    + `<text class="sg-sym" x="${OFF_X + 27}" y="${(oy + 0.5).toFixed(1)}">${esc(off.symbol)}</text>`
    + `<text class="sg-off-t" x="${OFF_X + 8}" y="${(oy + 15).toFixed(1)}">${esc(sx.noDigits)}</text></g>`
    + `<g class="sg-break"><line class="sg-brkline" x1="${BRK}" y1="${(oy + 15).toFixed(1)}" x2="${BRK + 10}" y2="${(oy - 22).toFixed(1)}"/>`
    + `<line class="sg-brkline" x1="${BRK + 7}" y1="${(oy + 15).toFixed(1)}" x2="${BRK + 17}" y2="${(oy - 22).toFixed(1)}"/></g>`;
  assert.ok(OFF_X + OFF_W <= BRK && BRK + 17 + 5 <= px(0) - 8,
    "wide build: the off-scale cell and its axis break have grown into the first marker");
  assert.ok(OFF_X + 27 + sigmaAdvance(off.symbol, SYM) <= OFF_X + OFF_W
    && OFF_X + 8 + sigmaAdvance(sx.noDigits, 10) <= OFF_X + OFF_W,
    "wide build: the off-scale cell no longer holds its own text");

  /* Lane C shares the axis and plots nothing on it, on purpose. */
  const boundSyms = sigmaRows.filter((r) => r.noFigure).map((r) => r.symbol).join("   ");
  const laneC = title(sx.laneKeys[2], copy.ledger.laneBounds, sigmaLaneCount.c, cTitleY) + rule(cRuleY)
    + `<rect class="sg-nobox" x="${X0}" y="${cBoxY}" width="${X1 - X0}" height="${cBoxH}" rx="2"/>`
    + `<text class="sg-none" x="${X0 + 18}" y="${cBoxY + 20}">${esc(sx.noneTag)}</text>`
    + `<text class="sg-nosym" x="${X0 + 18}" y="${cBoxY + 39}">${esc(boundSyms)}</text>`;
  for (const text of [sx.noneTag, boundSyms]) {
    assert.ok(18 + sigmaAdvance(text, 12) <= X1 - X0 - 18,
      `wide build: "${text}" overflows the one-sided lane`);
  }

  return `<svg class="sg-h" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(sigmaAria(copy, sx))}">
<rect class="sg-band" x="${px(0).toFixed(1)}" y="${RULE_Y}" width="${(px(1) - px(0)).toFixed(1)}" height="${bandBot - RULE_Y}"/>
${ticks.join("")}<line class="sg-axis" x1="${X0}" y1="${RULE_Y}" x2="${X1}" y2="${RULE_Y}"/>
<text class="sg-num" x="${X1 + 12}" y="${NUM_Y}">σ</text>
<path class="sg-brk" d="M${px(0).toFixed(1)} ${BR_Y - 6}V${BR_Y}H${px(1).toFixed(1)}V${BR_Y - 6}"/>
<text class="sg-anno-t sg-mid" x="${((px(0) + px(1)) / 2).toFixed(1)}" y="${AN_Y}">${esc(sx.bandTag)}</text>
<line class="sg-3s" x1="${px(3).toFixed(1)}" y1="${AN_Y + 4}" x2="${px(3).toFixed(1)}" y2="${BR_Y + 4}"/>
<line class="sg-3s" x1="${px(3).toFixed(1)}" y1="${RULE_Y}" x2="${px(3).toFixed(1)}" y2="${bandBot}"/>
<text class="sg-anno-t sg-warn" x="${(px(3) + 9).toFixed(1)}" y="${AN_Y}">${esc(sx.ruleTag)}</text>
${title(sx.laneKeys[0], copy.ledger.laneGaussian, sigmaLaneCount.a, geo.a.titleY)}${rule(geo.a.ruleY)}${offCell}${points(lanes.a, geo.a)}
${title(sx.laneKeys[1], copy.ledger.laneDiagnostic, sigmaLaneCount.b, geo.b.titleY)}${rule(geo.b.ruleY)}${points(lanes.b, geo.b)}
${laneC}</svg>`;
};

/* ---- vertical build (<= 900px): the same figure, turned a quarter turn *
 * Both dodges rotate with it. The MARKER is dodged perpendicular to the
 * axis, across its lane's own slots — a true beeswarm, so four rows that
 * share a σ still read as four dots. The LABEL is dodged along the axis
 * and joined back to its marker by a leader. */
const sigmaTall = (copy, sx) => {
  const W = 380, SP = 46, Y0 = 78, K = 118, STEP = 21, SYM = 11, CODE = 9;
  const SLOT = 16, XA = 56, CLEAR = 18;
  const py = (s) => Y0 + s * K;
  const Y1 = py(SIGMA_MAX);

  const rows = sigmaRows.filter((r) => r.value !== null).sort((a, b) => a.value - b.value);

  /* pass 1 — perpendicular beeswarm, per lane */
  const seats = new Map();
  const swarm = rows.map((r) => {
    const ty = py(r.value);
    const taken = seats.get(r.lane) ?? [];
    let slot = 0;
    while (taken.some((p) => p.slot === slot && Math.abs(p.ty - ty) < CLEAR)) slot += 1;
    taken.push({ slot, ty });
    seats.set(r.lane, taken);
    return { r, ty, slot };
  });
  const widthOf = (lane) => (Math.max(...(seats.get(lane) ?? [{ slot: 0 }]).map((p) => p.slot)) + 1) * SLOT;
  const XB = XA + widthOf("a") + 10;
  const colX = { a: XA, b: XB };
  const PLOT = XB + widthOf("b") + 6, LEAD = PLOT + 6, TEXT = LEAD + 8;

  /* pass 2 — label dodge along the axis */
  let cursor = Y0 - STEP;
  const placed = swarm.map(({ r, ty, slot }) => {
    const ly = Math.max(ty, cursor + STEP);
    cursor = ly;
    return { r, ty, ly, x: colX[r.lane] + slot * SLOT };
  });
  for (let i = 1; i < placed.length; i += 1) {
    assert.ok(placed[i].ly - placed[i - 1].ly >= STEP - 0.01,
      `tall build: labels for ${placed[i - 1].r.id} and ${placed[i].r.id} collide`);
  }
  for (const p of placed) {
    assert.ok(TEXT + sigmaLabelWidth(p.r, SYM, CODE) <= W - 8,
      `tall build: ${p.r.id} label overflows ${W}px`);
    assert.ok(p.ly <= Y1 + 12, `tall build: ${p.r.id} label falls off the axis`);
    for (const q of placed) {
      if (q === p || q.x !== p.x) continue;
      assert.ok(Math.abs(q.ty - p.ty) >= CLEAR,
        `tall build: markers for ${p.r.id} and ${q.r.id} overlap in the same slot`);
    }
  }
  assert.ok(PLOT < LEAD && LEAD < TEXT && TEXT < W - 8,
    "tall build: the lanes have crowded out the label gutter");

  const cBoxY = Y1 + 46, cBoxH = 54, H = cBoxY + cBoxH + 12;

  const ticks = [];
  for (let i = 0; i <= SIGMA_MAX * 2; i += 1) {
    const s = i / 2, yy = py(s).toFixed(1), major = Number.isInteger(s);
    ticks.push(`<line class="sg-tick${major ? "" : " sg-tick-min"}" x1="${major ? SP - 8 : SP - 4}" y1="${yy}" x2="${SP}" y2="${yy}"/>`);
    if (major) ticks.push(`<line class="sg-grid" x1="${SP}" y1="${yy}" x2="${PLOT}" y2="${yy}"/>`
      + `<text class="sg-num sg-end" x="${SP - 12}" y="${(py(s) + 4).toFixed(1)}">${s === SIGMA_MAX ? `${s} σ` : s}</text>`);
  }

  const pts = placed.map(({ r, ty, ly, x }) =>
    `<g class="sg-pt"><line class="sg-stem" x1="${SP}" y1="${ty.toFixed(1)}" x2="${(x - 9).toFixed(1)}" y2="${ty.toFixed(1)}"/>`
    + `<path class="sg-lead" d="M${(x + 9).toFixed(1)} ${ty.toFixed(1)}L${LEAD} ${ly.toFixed(1)}"/>`
    + sigmaMarker(r, x, ty) + sigmaLabel(r, TEXT, ly + 4, "sg-s") + `</g>`).join("");

  const off = sigmaOff[0];
  const offCell = `<g class="sg-off"><rect class="sg-offbox" x="${SP}" y="8" width="${W - 8 - SP}" height="28" rx="2"/>`
    + `<circle class="sg-hollow" cx="${SP + 16}" cy="22" r="4.4"/>`
    + `<text class="sg-sym sg-s" x="${SP + 28}" y="26">${esc(off.symbol)}</text>`
    + `<text class="sg-off-t sg-end" x="${W - 16}" y="26">${esc(sx.noDigits)}</text></g>`
    + `<g class="sg-break"><line class="sg-brkline" x1="${SP - 12}" y1="54" x2="${SP + 14}" y2="46"/>`
    + `<line class="sg-brkline" x1="${SP - 12}" y1="61" x2="${SP + 14}" y2="53"/></g>`;

  const boundSyms = sigmaRows.filter((r) => r.noFigure).map((r) => r.symbol).join("   ");
  const laneC = `<text class="sg-lane sg-s" x="8" y="${Y1 + 36}"><tspan class="sg-lane-k">${esc(sx.laneKeys[2])}</tspan>`
    + `<tspan dx="8">${esc(copy.ledger.laneBounds)}</tspan></text>`
    + `<rect class="sg-nobox" x="8" y="${cBoxY}" width="${W - 16}" height="${cBoxH}" rx="2"/>`
    + `<text class="sg-none sg-s" x="20" y="${cBoxY + 21}">${esc(sx.noneTag)}</text>`
    + `<text class="sg-nosym sg-s" x="20" y="${cBoxY + 41}">${esc(boundSyms)}</text>`;
  for (const text of [sx.noneTag, boundSyms, copy.ledger.laneBounds]) {
    assert.ok(20 + sigmaAdvance(text, SYM) <= W - 16, `tall build: "${text}" overflows ${W}px`);
  }

  const heads = `<text class="sg-lane-k sg-mid" x="${(XA + widthOf("a") / 2).toFixed(1)}" y="${Y0 - 11}">${esc(sx.laneKeys[0])}</text>`
    + `<text class="sg-lane-k sg-mid" x="${(XB + widthOf("b") / 2).toFixed(1)}" y="${Y0 - 11}">${esc(sx.laneKeys[1])}</text>`;

  /* Both axis annotations are right-aligned in the label gutter, so push
     them clear of whatever label the dodge happened to park at that height. */
  const clearOf = (wanted, text) => {
    const start = W - 10 - sigmaAdvance(text, 11);
    let ty = wanted;
    for (const p of placed) {
      if (Math.abs(p.ly - ty) < 14 && TEXT + sigmaLabelWidth(p.r, SYM, CODE) > start) ty = p.ly + 20;
    }
    return ty;
  };
  const bandTagY = clearOf(py(1) + 20, sx.bandTag);
  const ruleTagY = clearOf(py(3) - 8, sx.ruleTag);

  return `<svg class="sg-v" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(sigmaAria(copy, sx))}">
<rect class="sg-band" x="${SP}" y="${py(0).toFixed(1)}" width="${W - 8 - SP}" height="${(py(1) - py(0)).toFixed(1)}"/>
${ticks.join("")}<line class="sg-axis" x1="${SP}" y1="${Y0}" x2="${SP}" y2="${Y1}"/>
<line class="sg-3s" x1="${SP}" y1="${py(3).toFixed(1)}" x2="${W - 8}" y2="${py(3).toFixed(1)}"/>
<text class="sg-anno-t sg-end" x="${W - 10}" y="${bandTagY.toFixed(1)}">${esc(sx.bandTag)}</text>
<text class="sg-anno-t sg-warn sg-end" x="${W - 10}" y="${ruleTagY.toFixed(1)}">${esc(sx.ruleTag)}</text>
${offCell}${heads}${pts}${laneC}</svg>`;
};

/* ---- caption --------------------------------------------------------- *
 * Every load-bearing sentence is SLICED OUT OF THE DECK rather than
 * retyped, so the caption cannot drift from the prose the page prints six
 * inches below it. Reword the deck and the anchors fail; the build stops
 * rather than shipping a stale caption. */
const sigmaSentence = (text, anchor, dir, toEnd = false) => {
  const at = String(text).indexOf(anchor);
  assert.ok(at >= 0, `σ-axis caption anchor "${anchor}" is gone from the deck`);
  if (toEnd) return text.slice(at).trim();
  const stop = dir === "zh" ? text.indexOf("。", at) : text.indexOf(". ", at);
  assert.ok(stop > at, `σ-axis caption anchor "${anchor}" no longer ends a sentence`);
  return text.slice(at, stop + 1).trim();
};

const sigmaCaption = (copy) => {
  const L = copy.ledger, d = copy.dir, zhLike = d === "zh";
  const worstRow = ledger.diagnostics.find((row) => row.worst);
  const alphaRow = ledger.gaussian.find((row) => row.noPull);

  const legendCut = sigmaSentence(L.legend, zhLike ? "小于 1 σ" : "Under 1 σ", d);
  const introCut = sigmaSentence(L.intro, zhLike ? "最差的一行" : "The worst row", d, true);
  const noPullCut = sigmaSentence(L.noPullNote, zhLike ? "框架在这一行" : "The framework commits", d);

  assert.ok(introCut.includes(String(Number.parseFloat(worstRow.equivalent))),
    `${d}: ledger.intro no longer prints the worst row's ${worstRow.equivalent}`);
  assert.ok(legendCut.includes("1 σ") && legendCut.includes("3 σ"),
    `${d}: the quoted legend sentence no longer names both the 1 σ band and the 3 σ rule`);

  const codes = [...new Set(ledger.gaussian.flatMap((row) => row.interfaces ?? []))].sort();
  assert.ok(codes.length, "no open interfaces left in the ledger; drop the ring rather than draw it");

  return (zhLike
    ? [legendCut, introCut, `单边那一道：${L.laneBoundsNote}`,
      `${alphaRow.symbol}：${noPullCut}所以它画在刻度之外，而不是画在零上。`,
      L.noScore, `外环标出${L.conditionalOn}已具名开放接口的行（${codes.join("、")}）。`]
    : [legendCut, introCut, `The one-sided lane. ${L.laneBoundsNote}`,
      `${noPullCut} That is why ${alphaRow.symbol} is drawn off the scale rather than at zero.`,
      L.noScore, `A hollow ring marks a row ${L.conditionalOn} a named open interface (${codes.join(", ")}).`]
  ).join(zhLike ? "" : " ");
};

/* ---- the figure block ------------------------------------------------ */
const sigmaFigure = (copy) => {
  const sx = copy.ledger.sigma;
  const g = (inner) => `<svg class="sg-g" viewBox="0 0 18 18" aria-hidden="true" focusable="false">${inner}</svg>`;
  const keys = [
    [g(`<circle class="sg-dot" cx="9" cy="9" r="4.4"/>`), sx.keyPull],
    [g(`<circle class="sg-ring" cx="9" cy="9" r="7.2"/><circle class="sg-dot" cx="9" cy="9" r="4.4"/>`), sx.keyCond],
    [g(`<path class="sg-diamond" d="M2.4 9L9 2.4L15.6 9L9 15.6Z"/>`), sx.keyDiag],
    [g(`<rect class="sg-band" x="1.5" y="2.5" width="15" height="13"/><rect class="sg-bandkey" x="1.5" y="2.5" width="15" height="13"/>`), sx.keyBand],
    [g(`<line class="sg-3s" x1="9" y1="1" x2="9" y2="17"/>`), sx.keyRule],
    [g(`<rect class="sg-nobox" x="1" y="3" width="16" height="12" rx="1"/>`), sx.keyNone],
  ].map(([glyph, text]) => `<li>${glyph}<span>${esc(text)}</span></li>`).join("");

  return `<figure class="sg-fig">
<div class="sg-plate">${sigmaWide(copy, sx)}${sigmaTall(copy, sx)}</div>
<ul class="sg-key" aria-label="${esc(sx.keyTitle)}">${keys}</ul>
<figcaption class="sg-cap"><span class="sg-fignum">${esc(sx.figNumber)}</span> <span class="sg-figtitle">${esc(sx.figTitle)}</span> ${esc(sigmaCaption(copy))}</figcaption>
</figure>`;
};

/* ==================================================================== *
 * FIGURE - the digit ruler: where the experiment runs out.             *
 *                                                                      *
 * Paste after the existing `ruler()` / `pullBar()` block in build.mjs.  *
 * It reuses that file's `assert`, `esc`, `ledger`, `splitNumber` and    *
 * `resolvedDigitsOf`; it defines no name that file already holds.       *
 * Call site: inside renderLedger(), directly after the <div class=      *
 * "legend"> line and before the first <h3 class="lane">, as             *
 *     ${renderRulerFigure(copy, { n: 4 })}                              *
 * ==================================================================== */

const significand = (text) => {
  const parts = splitNumber(text);
  assert.equal(parts.exponent, null, `the ruler figure draws plain decimals only, received ${text}`);
  assert.equal(parts.sign, "", `the ruler figure draws positive rows only, received ${text}`);
  const whole = parts.whole.replace(/^0+(?=\d)/, "");
  const subOne = whole === "0";
  const stream = (subOne ? "" : whole) + parts.fraction;
  let lead = 0;
  if (subOne) while (lead < stream.length && stream[lead] === "0") lead += 1;
  return { digits: [...stream.slice(lead)], pointAt: subOne ? 0 : whole.length };
};

/* Long division, so an exact-rational row's tail is computed from the rational
   the ledger states and never typed by hand. */
const rationalDigits = (expr, count) => {
  const match = String(expr).match(/^(\d+)\s*\/\s*(\d+)$/);
  assert.ok(match, `rationalDigits: not a rational literal: ${expr}`);
  const den = BigInt(match[2]);
  assert.notEqual(den, 0n, `rationalDigits: zero denominator in ${expr}`);
  let rem = BigInt(match[1]);
  const digits = [];
  let started = false;
  for (let step = 0; digits.length < count && step < 512; step += 1) {
    const q = rem / den;
    rem = (rem % den) * 10n;
    if (!started && q === 0n) continue;
    started = true;
    for (const ch of String(q)) if (digits.length < count) digits.push(ch);
  }
  assert.equal(digits.length, count, `rationalDigits: ${expr} did not yield ${count} digits`);
  return digits;
};

/* One audited row: the two digit strings, the cut, and every check that keeps
   the drawing from claiming more than the ledger says. */
const rulerRow = (row, columns) => {
  const resolved = row.resolvedDigits;
  const computed = significand(row.predicted);
  const measured = significand(row.measured);

  assert.equal(resolvedDigitsOf(row.measured, row.sigma), resolved,
    `${row.id}: the cut this figure draws disagrees with sigma`);
  assert.equal(computed.pointAt, measured.pointAt,
    `${row.id}: computed and measured place the decimal point differently; the columns would not align`);
  assert.ok(measured.digits.length >= resolved,
    `${row.id}: the measured value prints ${measured.digits.length} digits but claims ${resolved} resolved`);
  /* The claim the figure makes with its own geometry: inside the resolved
     region the two rows carry the SAME digits. Draw agreement only where the
     ledger has it. */
  assert.equal(computed.digits.slice(0, resolved).join(""), measured.digits.slice(0, resolved).join(""),
    `${row.id}: computed and measured disagree inside the ${resolved} digits the experiment resolves`);

  /* Where the experiment's own error bar starts biting, recomputed from sigma
     rather than assumed to be the cut. */
  const sigmaColumn = Math.floor(Math.log10(Number(row.measured))) - Math.floor(Math.log10(row.sigma)) + 1;
  assert.equal(sigmaColumn, resolved + 1,
    `${row.id}: sigma's leading digit sits in column ${sigmaColumn}, but the bracket is drawn from column ${resolved + 1}`);

  let computedDigits = computed.digits;
  if (row.predictedExact) {
    computedDigits = rationalDigits(row.predictedExact, Math.max(columns, computed.digits.length));
    assert.equal(computedDigits.slice(0, computed.digits.length).join(""), computed.digits.join(""),
      `${row.id}: ${row.predictedExact} does not expand to ${row.predicted}`);
  }

  assert.ok(row.interfaces.length > 0,
    `${row.id}: this figure captions every row as conditional, and ${row.id} now lists no open interface`);
  assert.ok(computedDigits.length > resolved,
    `${row.id}: nothing is left past the cut, so the figure would draw an empty untestable tail`);

  return {
    id: row.id, symbol: row.symbol, resolved,
    pointAt: computed.pointAt,
    computed: computedDigits,
    measured: measured.digits,
    endless: Boolean(row.predictedExact),
    sigmaText: `±${row.sigma}`,
    pullText: row.pullDisplay,
    interfaces: row.interfaces,
  };
};

const round1 = (value) => Math.round(value * 10) / 10;
const bracketDown = (x1, x2, y, cls, arm = 6) =>
  `<path class="${cls}" d="M${round1(x1)} ${round1(y + arm)}V${round1(y)}H${round1(x2)}V${round1(y + arm)}"/>`;
const bracketUp = (x1, x2, y, cls, arm = 6) =>
  `<path class="${cls}" d="M${round1(x1)} ${round1(y - arm)}V${round1(y)}H${round1(x2)}V${round1(y - arm)}"/>`;
const bracketRight = (y1, y2, x, cls, arm = 6) =>
  `<path class="${cls}" d="M${round1(x + arm)} ${round1(y1)}H${round1(x)}V${round1(y2)}H${round1(x + arm)}"/>`;
const svgText = (x, y, cls, body) => `<text class="${cls}" x="${round1(x)}" y="${round1(y)}">${body}</text>`;
/* Figure labels do not wrap, so the portrait orientation takes its longer
   labels as an explicit array of lines from the copy file. */
const svgLines = (x, y, cls, list, step = 15) =>
  list.map((line, i) => svgText(x, y + i * step, cls, esc(line))).join("");

/* ---- panel A, landscape ---------------------------------------------- */

const rulerPanelWide = (row, copy, letter) => {
  const t = copy.figures.ruler;
  const N = row.computed.length;
  const cell = 32, X0 = 132, PT = 13, W = 760;
  const xl = (k) => X0 + (k - 1) * cell + (k > row.pointAt ? PT : 0);
  const xc = (k) => xl(k) + cell / 2;
  const right = xl(N) + cell;
  const cut = xl(row.resolved + 1);
  const yTop = 26, yC = 68, yM = 106, yAxis = 124, yPos = 142, ySig = 168;

  const digits = (list, y, restCls) => list.map((d, i) =>
    svgText(xc(i + 1), y, `fr-d ${i < row.resolved ? "fr-d-res" : restCls}`, esc(d))).join("");
  const voids = Array.from({ length: N - row.measured.length }, (_, i) =>
    `<line class="fr-void" x1="${round1(xc(row.measured.length + i + 1) - 6)}" y1="${yM - 8}" x2="${round1(xc(row.measured.length + i + 1) + 6)}" y2="${yM - 8}"/>`).join("");
  const ticks = Array.from({ length: N }, (_, i) =>
    `<line class="fr-tick" x1="${round1(xc(i + 1))}" y1="${yAxis}" x2="${round1(xc(i + 1))}" y2="${yAxis + 5}"/>`).join("");
  const posns = Array.from({ length: N }, (_, i) =>
    svgText(xc(i + 1), yPos, i === row.resolved ? "fr-pos fr-pos-cut" : "fr-pos", String(i + 1))).join("");
  const point = row.pointAt > 0 && row.pointAt < N
    ? svgText(xl(row.pointAt + 1) - PT / 2, yC, "fr-pt", ".") + svgText(xl(row.pointAt + 1) - PT / 2, yM, "fr-pt", ".")
    : "";

  return `<svg class="fr fr-wide" viewBox="0 0 ${W} 232" role="img" aria-label="${esc(t.altA)}">
<line class="fr-cut" x1="${round1(cut)}" y1="16" x2="${round1(cut)}" y2="200"/>
${bracketDown(xl(1), cut - 5, yTop, "fr-brk-res")}${bracketDown(cut + 5, right, yTop, "fr-brk-tail")}
${svgText((xl(1) + cut) / 2, 16, "fr-note fr-note-res fr-mid", esc(t.resolvedSpan.replace("{n}", String(row.resolved))))}
${svgText((cut + right) / 2, 16, "fr-note fr-note-tail fr-mid", esc(t.tailSpan.replace("{n}", String(N - row.resolved))))}
${svgText(0, 24, "fr-panel-n", esc(letter))}${svgText(24, 24, "fr-sym", esc(row.symbol))}${svgText(24, 44, "fr-pull", esc(row.pullText))}
${svgText(120, yC, "fr-lab fr-end", esc(copy.hero.rulerComputed))}${svgText(120, yM, "fr-lab fr-end", esc(copy.hero.rulerMeasured))}${svgText(120, yPos, "fr-lab fr-end", esc(t.axisName))}
${point}${digits(row.computed, yC, "fr-d-tail")}${row.endless ? svgText(right + 8, yC, "fr-d-tail fr-inf", "&#8230;&#8734;") : ""}
${digits(row.measured, yM, "fr-d-past")}${voids}${svgText(right + 12, yM, "fr-sig", esc(row.sigmaText))}
<line class="fr-axis" x1="${round1(xl(1))}" y1="${yAxis}" x2="${round1(right)}" y2="${yAxis}"/>${ticks}${posns}
${bracketUp(cut, right, ySig, "fr-brk-sig")}
${svgText(cut + 4, 186, "fr-note fr-note-sig", esc(t.sigmaSpan.replace("{s}", row.sigmaText).replace("{k}", String(row.resolved + 1))))}
${svgText(cut - 8, 214, "fr-note fr-note-cut fr-end", esc(t.cutLabel.replace("{n}", String(row.resolved))))}
</svg>`;
};

/* ---- panel A, portrait ------------------------------------------------ */

const rulerPanelTall = (row, copy, letter) => {
  const t = copy.figures.ruler;
  const N = row.computed.length;
  const rowH = 25, y0 = 78, W = 360;
  const y = (k) => y0 + (k - 1) * rowH;
  const yGap = (k) => y(k) + rowH / 2 - 8;
  const xPos = 28, xAxis = 44, xC = 92, xM = 158, xBrk = 178, xLab = 190;
  const bottom = y(N) + 8;
  const cut = yGap(row.resolved);

  const col = (list, x, restCls) => list.map((d, i) =>
    svgText(x, y(i + 1), `fr-d ${i < row.resolved ? "fr-d-res" : restCls}`, esc(d))).join("");
  const voids = Array.from({ length: N - row.measured.length }, (_, i) =>
    `<line class="fr-void" x1="${xM - 7}" y1="${round1(y(row.measured.length + i + 1) - 8)}" x2="${xM + 7}" y2="${round1(y(row.measured.length + i + 1) - 8)}"/>`).join("");
  const ticks = Array.from({ length: N }, (_, i) =>
    `<line class="fr-tick" x1="${xAxis}" y1="${round1(y(i + 1) - 8)}" x2="${xAxis + 5}" y2="${round1(y(i + 1) - 8)}"/>`).join("");
  const posns = Array.from({ length: N }, (_, i) =>
    svgText(xPos, y(i + 1), i === row.resolved ? "fr-pos fr-pos-cut" : "fr-pos", String(i + 1))).join("");
  const point = row.pointAt > 0 && row.pointAt < N
    ? `<line class="fr-pt-line" x1="66" y1="${round1(yGap(row.pointAt))}" x2="174" y2="${round1(yGap(row.pointAt))}"/>`
      + svgText(182, round1(yGap(row.pointAt) + 4), "fr-note fr-note-pt", esc(t.pointLabel))
    : "";

  return `<svg class="fr fr-tall" viewBox="0 0 ${W} ${round1(bottom + 14)}" role="img" aria-label="${esc(t.altA)}">
${svgText(0, 22, "fr-panel-n", esc(letter))}${svgText(24, 22, "fr-sym", esc(row.symbol))}${svgText(W - 2, 22, "fr-pull fr-end", esc(row.pullText))}
${svgText(xPos, 54, "fr-lab fr-head fr-mid", esc(t.axisNameShort))}${svgText(xC, 54, "fr-lab fr-head fr-mid", esc(copy.hero.rulerComputed))}${svgText(xM, 54, "fr-lab fr-head fr-mid", esc(copy.hero.rulerMeasured))}
<line class="fr-axis" x1="${xAxis}" y1="${round1(y(1) - 16)}" x2="${xAxis}" y2="${round1(bottom)}"/>${ticks}${posns}
${bracketRight(y(1) - 16, cut - 4, 10, "fr-brk-res")}${bracketRight(cut + 4, bottom, 10, "fr-brk-tail")}
${col(row.computed, xC, "fr-d-tail")}${row.endless ? svgText(xC, round1(y(N) + 22), "fr-d-tail fr-inf fr-mid", "&#8230;&#8734;") : ""}
${col(row.measured, xM, "fr-d-past")}${voids}${point}
<line class="fr-cut" x1="8" y1="${round1(cut)}" x2="${W - 8}" y2="${round1(cut)}"/>
${svgText(W - 8, round1(cut - 7), "fr-note fr-note-cut fr-end", esc(t.cutLabel.replace("{n}", String(row.resolved))))}
${svgLines(xLab, round1(y(Math.max(2, row.resolved - 3))), "fr-note fr-note-res", t.resolvedTall.map((l) => l.replace("{n}", String(row.resolved))))}
${svgLines(xLab, round1(y(row.resolved + 2)), "fr-note fr-note-tail", t.tailTall.map((l) => l.replace("{n}", String(N - row.resolved))))}
${bracketRight(cut + 4, bottom, xBrk, "fr-brk-sig")}
${svgText(xLab, round1(y(row.resolved + 4)), "fr-note fr-note-sig", esc(row.sigmaText))}
${svgLines(xLab, round1(y(row.resolved + 5)), "fr-note fr-note-sig", t.sigmaTall.map((l) => l.replace("{k}", String(row.resolved + 1))))}
</svg>`;
};

/* ---- panel B: two more rows on one shared digit axis ------------------ */

const rulerPanelPair = (rows, copy, letter, wide) => {
  const t = copy.figures.ruler;
  const N = Math.max(...rows.map((r) => r.computed.length));
  const W = wide ? 760 : 360;
  const cell = wide ? 34 : 27;
  const X0 = wide ? 226 : 44;
  const xLab = X0 - (wide ? 42 : 4);
  const xl = (k) => X0 + (k - 1) * cell;
  const xc = (k) => xl(k) + cell / 2;
  const right = xl(N) + cell;
  const yAxis = wide ? 116 : 152;
  const yPos = yAxis + 18;
  /* head/cond/pull sit beside the digits when there is room for a left column,
     and above them when there is not. The shared axis sits BETWEEN the two
     rows so each row's cut rule can land on it without crossing the other. */
  const blocks = wide
    ? [{ head: 46, c: 52, m: 84 }, { head: 172, c: 178, m: 210 }]
    : [{ head: 42, c: 88, m: 120 }, { head: 198, c: 244, m: 276 }];
  const height = wide ? 244 : 310;

  const ticks = Array.from({ length: N }, (_, i) =>
    `<line class="fr-tick" x1="${round1(xc(i + 1))}" y1="${yAxis}" x2="${round1(xc(i + 1))}" y2="${yAxis + 5}"/>`).join("");

  const body = rows.map((row, index) => {
    const b = blocks[index];
    const cut = xl(row.resolved + 1);
    const digits = (list, y, restCls) => list.map((d, i) =>
      svgText(xc(i + 1), y, `fr-d fr-d-s ${i < row.resolved ? "fr-d-res" : restCls}`, esc(d))).join("");
    const voids = Array.from({ length: N - row.measured.length }, (_, i) =>
      `<line class="fr-void" x1="${round1(xc(row.measured.length + i + 1) - 5)}" y1="${round1(b.m - 6)}" x2="${round1(xc(row.measured.length + i + 1) + 5)}" y2="${round1(b.m - 6)}"/>`).join("");
    const zero = row.pointAt === 0
      ? svgText(X0 - 4, b.c, "fr-pt fr-pt-s fr-end", "0.") + svgText(X0 - 4, b.m, "fr-pt fr-pt-s fr-end", "0.") : "";
    const heads = svgText(0, b.head, "fr-sym fr-sym-s", esc(row.symbol))
      + svgText(0, b.head + 17, "fr-cond", esc(`${t.condPrefix}${row.interfaces.join(", ")}`))
      + (wide ? svgText(0, b.head + 34, "fr-pull fr-pull-s", esc(row.pullText))
              : svgText(W - 2, b.head, "fr-pull fr-pull-s fr-end", esc(row.pullText)));
    const labs = wide
      ? svgText(xLab, b.c, "fr-lab fr-end", esc(copy.hero.rulerComputed))
        + svgText(xLab, b.m, "fr-lab fr-end", esc(copy.hero.rulerMeasured)) : "";
    const cutTop = index === 0 ? b.c - 22 : yAxis;
    const cutEnd = index === 0 ? yAxis : b.m + 14;
    return `<g><line class="fr-cut" x1="${round1(cut)}" y1="${round1(cutTop)}" x2="${round1(cut)}" y2="${round1(cutEnd)}"/>
${heads}${labs}${zero}${digits(row.computed, b.c, "fr-d-tail")}${row.endless ? svgText(right + 6, b.c, "fr-d-tail fr-inf fr-inf-s", "&#8230;&#8734;") : ""}
${digits(row.measured, b.m, "fr-d-past")}${voids}
${bracketUp(cut, right, b.m + 14, "fr-brk-sig", 4)}${svgText(right + 8, round1(b.m + 18), "fr-sig fr-sig-s", esc(row.sigmaText))}</g>`;
  }).join("");

  return `<svg class="fr ${wide ? "fr-wide" : "fr-tall"}" viewBox="0 0 ${W} ${height}" role="img" aria-label="${esc(t.altB)}">
${svgText(0, 16, "fr-panel-n", esc(letter))}
<line class="fr-axis" x1="${round1(xl(1))}" y1="${yAxis}" x2="${round1(right)}" y2="${yAxis}"/>${ticks}
${Array.from({ length: N }, (_, i) => svgText(xc(i + 1), yPos, "fr-pos", String(i + 1))).join("")}
${svgText(xLab, yPos, "fr-lab fr-end", esc(wide ? t.axisName : t.axisNameShort))}
${body}
</svg>`;
};

/* ---- the figure ------------------------------------------------------- */

const renderRulerFigure = (copy, options = {}) => {
  const t = copy.figures.ruler;
  const pick = (id) => {
    const found = ledger.gaussian.find((r) => r.id === id);
    assert.ok(found, `the ruler figure needs ledger row "${id}"`);
    return found;
  };
  const lead = rulerRow(pick("mu_e"), 0);
  const pair = [rulerRow(pick("lambda_c"), 9), rulerRow(pick("sin2w"), 9)];

  for (const row of [lead, ...pair]) {
    assert.ok(row.interfaces.includes("E8"),
      `${row.id}: the caption names E8 for every row in this figure`);
  }

  const number = options.n ?? 4;
  const caption = [
    `<b class="fig-n">${esc(t.figWord)} ${number}</b>`,
    esc(`${copy.hero.rulerCaption}${t.stop}`),
    esc(t.capA
      .replace("{sym}", lead.symbol)
      .replace("{N}", String(lead.computed.length))
      .replace("{cut}", copy.hero.rulerCut.replace("{n}", String(lead.resolved)))
      .replace("{ghost}", copy.hero.rulerGhost)
      .replace("{s}", lead.sigmaText)
      .replace("{k}", String(lead.resolved + 1))),
    esc(t.capB.replace("{exact}", copy.ledger.exactNote)),
    `<span class="figr-cond">${esc(t.capCond)}</span>`,
    `<span class="figr-src">${esc(t.capSource)}</span>`,
  ].join(" ");

  const svg = [
    rulerPanelWide(lead, copy, "A"), rulerPanelTall(lead, copy, "A"),
    rulerPanelPair(pair, copy, "B", true), rulerPanelPair(pair, copy, "B", false),
  ].join("\n");

  /* The tail may never be lit in the closed tier: these rows are conditional,
     and the colour alone would make a closure claim they cannot support. */
  assert.ok(!/t-closed|d-closed/.test(svg),
    "the ruler figure must not reach for the closed evidence tier");

  return `<figure class="figr"><div class="figr-panels">${svg}</div><figcaption class="figr-cap">${caption}</figcaption></figure>`;
};

/* ---------------------------------------------------------------------- *
 * COPY ADDITIONS. Add `figures.ruler` to src/copy/zh.js and en.js. Every
 * other string the figure prints already exists in the decks and is read
 * from copy.hero.* / copy.ledger.exactNote verbatim.
 *
 * zh.js:
 *   figures: {
 *     ruler: {
 *       figWord: "图", stop: "。",
 *       axisName: "有效数字位", axisNameShort: "位", pointLabel: "小数点",
 *       condPrefix: "条件性 · ",
 *       resolvedSpan: "实验分辨的 {n} 位", tailSpan: "无人能检验的 {n} 位",
 *       cutLabel: "实验分辨到此为止 · 第 {n} 位",
 *       sigmaSpan: "误差棒 {s} 覆盖第 {k} 位起的每一位",
 *       resolvedTall: ["实验分辨的 {n} 位"],
 *       tailTall: ["无人能检验的 {n} 位"],
 *       sigmaTall: ["覆盖第 {k} 位起的每一位"],
 *       altA: "逐位对照图：m_μ/m_e 的算出值有 15 位有效数字，实测值只分辨到第 8 位；从第 9 位起的每一位都无人能检验，实测值自己的误差棒 ±0.0000046 覆盖了那一整段。",
 *       altB: "同一套逐位对照用在 λ_C 与 sin²θ_W 上：两行共用一根有效数字位轴，竖线分别落在第 3 位与第 4 位之后。",
 *       capA: "A：{sym}。框架算出 {N} 位有效数字，{cut}；竖线右边的每一位，都是{ghost}。下方虚线括号是实测值自己的误差棒 {s}：从第 {k} 位起，它盖住了这条比较里剩下的一切——钝的那一边是实验，不是理论。",
 *       capB: "B：同一套记法用在另外两行上，两行共用一根位轴。竖线的位置随实验移动，不随理论移动。λ_C 是{exact}，所以它在轴上每一列都下了注。",
 *       capCond: "本图三行全部是条件性——依赖 E8，作者自己列为开放的接口；sin²θ_W 另外还依赖 E3。分辨区用的是前景色，不是「已闭合」那一档的颜色：这三行都还没有闭合。",
 *       capSource: "数值取自 ledger.json；有效数字位数、分辨位数与误差棒的落点均在构建时重算，对不上则构建失败。",
 *     },
 *   },
 *
 * en.js:
 *   figures: {
 *     ruler: {
 *       figWord: "FIG.", stop: ".",
 *       axisName: "digit", axisNameShort: "digit", pointLabel: "decimal point",
 *       condPrefix: "CONDITIONAL · ",
 *       resolvedSpan: "{n} digits the experiment resolves", tailSpan: "{n} digits nobody can check",
 *       cutLabel: "experiment stops here · digit {n}",
 *       sigmaSpan: "error bar {s} covers every digit from {k}",
 *       resolvedTall: ["{n} digits the", "experiment resolves"],
 *       tailTall: ["{n} digits nobody", "can check"],
 *       sigmaTall: ["covers every digit", "from {k}"],
 *       altA: "Digit-by-digit comparison: the computed value of m_mu over m_e carries 15 significant digits, the measurement resolves only the first 8, and the measurement's own error bar of plus or minus 0.0000046 covers every digit from the ninth onward.",
 *       altB: "The same digit-by-digit comparison applied to lambda_C and sin squared theta_W on one shared digit axis, with the cut falling after digit 3 and digit 4 respectively.",
 *       capA: "A: {sym}. The framework commits {N} significant digits; {cut}. Every digit right of the rule is {ghost}. The dashed bracket below is the measurement's own error bar, {s}: from digit {k} onward it covers everything left in this comparison — the blunt side here is the experiment, not the theory.",
 *       capB: "B: the same notation on two more rows, sharing one digit axis. The rule moves with the experiment, not with the theory. λ_C is an {exact}, so it commits a digit in every column of the axis.",
 *       capCond: "All three rows here are CONDITIONAL on E8, an interface the author lists as open; sin²θ_W rides on E3 as well. The resolved digits are set in the foreground colour, not in the closed-tier colour: none of these rows is closed.",
 *       capSource: "Values from ledger.json; the digit counts, the resolved-digit cut and the error bar's landing column are all recomputed at build time, and the build fails if they disagree.",
 *     },
 *   },
 * ---------------------------------------------------------------------- */

/* ------------------------------------------------------------------ *
 * 00 The first screen: two questions, their answers, and the closed   *
 * facts that keep them from reading as assertions.                    *
 * ------------------------------------------------------------------ */

const renderHero = (copy, nav, alternate) => {
  const x = copy.explain;
  const c = copy.colophon;
  const tagLabel = Object.fromEntries(x.tagKey.map(([state, label]) => [state, label]));
  const tags = (list) => list
    .map((state) => `<span class="tag ${state}">${esc(tagLabel[state])}</span>`).join("");

  const asks = copy.hero.asks.map((ask) => `<article class="ask">
<p class="ask-n">${esc(copy.dir === "zh" ? "\u95ee" : "Q")} ${esc(ask.n)}</p>
<h2 class="ask-q"><a href="${esc(ask.href)}">${esc(ask.q)}${copy.dir === "zh" ? "\uff1f" : "?"}</a></h2>
<p class="ask-a">${esc(ask.a)}</p>
<div class="ask-foot"><p class="ask-t">${tags(ask.tags)}<span class="ask-i">${esc(ask.rides)}</span><a class="ask-r" href="${esc(ask.href)}">${esc(copy.hero.askRead)}</a></p></div>
</article>`).join("");

  const chips = copy.hero.chips.map(([label, value], index) => {
    const [head, ...rest] = index === 0 ? String(value).split(" ") : [value];
    const body = index === 0 && rest.length
      ? `<strong>${esc(head)}<em>${esc(rest.join(" "))}</em></strong>`
      : `<strong>${esc(value)}</strong>`;
    return `<div class="chip${index === 0 ? " chip-lead" : ""}"><span>${esc(label)}</span>${body}</div>`;
  }).join("");

  const actions = copy.hero.actions.map(([label, href], index) =>
    `<a class="button${index === 0 ? " primary" : ""}" href="${href}">${esc(label)}</a>`).join("");

  /* The tier vocabulary is taught once, in the rail, beside the first claims
     that use it — not in a legend further down that nobody reaches. */
  const legend = x.tagKey.map(([state, label, gloss]) =>
    `<div><span class="tag ${state}">${esc(label)}</span><p>${esc(gloss)}</p></div>`).join("");

  return `<div id="top" class="band">
      <figure class="hero-plate" aria-describedby="plate-note">
        <picture>
          <source media="(max-width: 719px)" srcset="../assets/hero-web-port.webp" width="1080" height="1440">
          <img src="../assets/hero-web-land.webp" width="1920" height="1080" alt="${esc(copy.hero.plateAlt)}" decoding="async" fetchpriority="high">
        </picture>
        <figcaption class="plate-tag">${esc(copy.hero.plateTag)}</figcaption>
      </figure>
      <div class="topbar"><div class="topbar-in">
        <a class="brand" href="#top">${brandMark}<span>K4 CELL</span></a>
        <nav class="site-nav" aria-label="${esc(copy.navLabel)}">${nav}</nav>
        <a class="language-link" href="../${alternate.dir}/" hreflang="${alternate.htmlLang}">${esc(copy.languageLabel)}</a>
      </div></div>
      <header class="mast"><div class="shell mast-in">
        <div>
          <p class="eyebrow">${esc(c.eyebrow)}</p>
          <h1>${esc(c.h1a)}<br>${esc(c.h1b)}</h1>
          <p class="mast-sub">${esc(c.sub)}</p>
        </div>
        <dl class="colophon">
          <dt>${esc(c.keys.version)}</dt><dd>${esc(copy.statusLine[0])}</dd>
          <dt>${esc(c.keys.pages)}</dt><dd>${ledger.artifact.pages} ${esc(copy.dir === "zh" ? "\u9875" : "pages")}</dd>
          <dt>${esc(c.keys.author)}</dt><dd>${esc(c.author)}<br>${esc(c.authorRole)}<br><span class="col-track">${esc(c.authorTrack)}</span></dd>
          <dt>${esc(c.keys.review)}</dt><dd><a class="stamp-nr" href="#not-derived">${esc(c.review)}</a><br>${esc(c.reviewNote)}</dd>
          <dt>${esc(c.keys.errata)}</dt><dd><a href="${links.errata}">${esc(c.errata)}</a></dd>
          <dt>${esc(c.keys.archive)}</dt><dd><code>SHA-256 ${ledger.artifact.sha256.slice(0, 8)}&#8230;</code> &#183; <a href="${links.conceptDoi}">DOI ${ledger.artifact.conceptDoi}</a></dd>
        </dl>
      </div></header>
      <div class="hero"><div class="shell hero-in">
        <aside class="rail">
          <p class="rail-h">${esc(c.railTiers)}</p><div class="legend-tiers">${legend}</div>
        </aside>
        <div class="hero-main">
          <p class="hero-open">${esc(copy.hero.open)}</p>
          <div class="asks">${asks}</div>
          <p class="ask-rider"><b>${esc(copy.dir === "zh" ? "\u987b\u4e00\u5e76\u8bfb" : "READ WITH IT")}</b>${esc(copy.hero.askRider)}</p>
        </div>
        <div class="hero-app">
          <figure class="fig k4fig"><div class="fig-frame">${k4Glyph}</div><figcaption><b class="fig-n">${esc(copy.dir === "zh" ? "\u56fe 1" : "FIG. 1")}</b>${esc(copy.hero.glyphLegendA)}${esc(copy.dir === "zh" ? "\u3002" : ". ")}${esc(copy.hero.glyphLegendB)}${esc(copy.dir === "zh" ? "\u3002" : ".")}</figcaption></figure>
        </div>
      </div></div>
      <div class="anchors"><div class="shell">
        <div class="anchors-in">${chips}</div>
        <p class="anchor-note">${esc(copy.hero.chipsNote)}</p>
        <div class="hero-actions">${actions}</div>
      </div></div>
    </div>`;
};

/* Everything the old hero pushed below the fold: the nine other questions, the
   digit ruler, and the prose that frames both. It opens the paper body. */
const renderBelow = (copy) => {
  const x = copy.explain;
  const tagLabel = Object.fromEntries(x.tagKey.map(([state, label]) => [state, label]));
  const shown = new Set(copy.hero.asks.map((ask) => ask.n));
  const index = x.rows.filter((r) => !shown.has(r.n)).map((r) =>
    `<li><a href="#x-${esc(r.n)}"><span class="qi-n">${esc(r.n)}</span><span class="qi-q">${esc(r.h3)}</span><span class="qi-t">${r.tags.map((state) => `<span class="tag ${state}">${esc(tagLabel[state])}</span>`).join("")}</span></a></li>`).join("");

  /* The small two-line rail ruler is superseded by the full figure, which puts
     the measurement's own error bar under the digits it actually covers. */
  const app = "";

  const body = `${headOnly(esc(copy.hero.moreTitle), "")}
<ol class="qindex">${index}</ol>
<p class="hb-all"><a href="#explain">${esc(copy.hero.moreLink)}</a></p>
<div class="xfig">${renderRulerFigure(copy, { n: copy.dir === "zh" ? 2 : 2 })}</div>
<div class="hb-prose">
<p class="hero-lede">${copy.hero.lede}</p>
<p class="hero-body">${esc(copy.hero.body)}</p>
<div class="note note--open hero-caveat">${esc(copy.hero.caveat)}</div>
<p class="plate-note" id="plate-note">${esc(copy.hero.plateNoteA)}<a href="#ledger">${esc(copy.hero.plateNoteLink)}</a>${esc(copy.hero.plateNoteB)}</p>
<p class="hero-fine">${esc(copy.hero.fineprint)}</p>
</div>`;

  return sec("more", "more", "00", esc(copy.hero.moreTitle), body, app);
};

const renderPage = (copy) => {
  const alternate = copy.alternateDir === "en" ? en : zh;
  const nav = copy.nav.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join("");

  return `<!doctype html>
<html lang="${copy.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#080a0f">
  <meta name="description" content="${esc(copy.description)}">
  <meta name="robots" content="index,follow">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests">
  <link rel="canonical" href="https://k4cell.com/${copy.dir}/">
  <link rel="alternate" hreflang="en" href="https://k4cell.com/en/">
  <link rel="alternate" hreflang="zh-Hans" href="https://k4cell.com/zh/">
  <link rel="alternate" hreflang="x-default" href="https://k4cell.com/">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../assets/site.css">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(copy.title)}">
  <meta property="og:description" content="${esc(copy.description)}">
  <meta property="og:url" content="https://k4cell.com/${copy.dir}/">
  <meta property="og:image" content="https://k4cell.com/assets/og-k4cell-${copy.dir}.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <title>${esc(copy.title)}</title>
</head>
<body>
  <a class="skip" href="#main">${esc(copy.skip)}</a>
  ${renderHero(copy, nav, alternate)}
  <main id="main">
    ${renderBelow(copy)}
    ${renderExplain(copy)}
    ${sec("check-it", "check-it", copy.checkIt.number, copy.checkIt.kicker, `      ${headOnly(copy.checkIt.h2, "")}
      <div class="check-grid">
        <div>
          <p class="check-body">${esc(copy.checkIt.body)}</p>
          <div class="note note--open check-counter">${copy.checkIt.counter}</div>
        </div>
        <div class="division">
          <ol class="steps" data-step="${esc(copy.checkIt.stepButton)}" data-reset="${esc(copy.checkIt.resetButton)}"><li>0.2</li><li>0.22</li><li>0.225</li><li>0.2250</li><li>0.22500</li><li>0.225000<span class="dinf">&#8230;&#8734;</span></li></ol>
          <p class="check-measured"><span>${esc(copy.checkIt.measuredLabel)}</span><code>0.22501 &#177; 0.00068</code></p>
          <p class="check-contains">${esc(copy.checkIt.containsLabel)}</p>
        </div>
      </div>`)}
    ${renderObject(copy)}
    ${renderLedger(copy)}
    ${sec("inputs", "inputs", copy.inputs.number, copy.inputs.kicker, `      ${headOnly(copy.inputs.h2, "")}
      <div class="input-cols">
        <div class="col-closed">
          <span class="tag established">${esc(copy.inputs.closedTag)}</span>
          <h3>${esc(copy.inputs.closedTitle)}</h3>
          <p>${esc(copy.inputs.closedBody)}</p>
          <p>${esc(copy.inputs.closedBody2)}</p>
        </div>
        <div class="col-open">
          <span class="tag open">${esc(copy.inputs.openTag)}</span>
          <h3>${esc(copy.inputs.openTitle)}</h3>
          <ol>${copy.inputs.openItems.map((item) => `<li>${esc(item)}</li>`).join("")}</ol>
        </div>
      </div>
      <p class="invitation">${esc(copy.inputs.invitation)} <a href="${links.issues}">${esc(copy.inputs.invitationCta)}</a></p>`)}
    ${renderRoute(copy)}
    ${renderKill(copy)}
    ${renderNotDerived(copy)}
    ${renderMachine(copy)}
    ${renderVerify(copy)}
    ${renderAttack(copy)}
  </main>
  <footer><div class="footer-row shell">
    <div>
      <p>${esc(copy.footer.line)}</p>
      <p class="footer-sub">${esc(copy.footer.funding)} <a href="${links.vaults}">${esc(copy.fundingLinkLabel)}</a></p>
      <p class="footer-sub no-mint">${esc(copy.footer.noMint)} &#183; <a href="notice/">${esc(copy.dir === "zh" ? "声明" : "Notice")}</a></p>
    </div>
    <nav aria-label="${esc(copy.footerNavLabel)}">${copy.footer.nav.map(([label, key]) => {
      const href = key === "statusJson" ? "../status.json" : key === "notice" ? "notice/" : links[key];
      return `<a href="${href}">${esc(label)}</a>`;
    }).join("")}</nav>
  </div></footer>
  <script src="../assets/app.js" defer></script>
</body>
</html>`;
};

const renderNotice = (copy) => `<!doctype html>
<html lang="${copy.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#080a0f">
  <meta name="robots" content="index,follow">
  <meta name="description" content="${esc(copy.notice.h1)}">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'">
  <link rel="canonical" href="https://k4cell.com/${copy.dir}/notice/">
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../assets/site.css">
  <title>${esc(copy.notice.title)}</title>
</head>
<body><main class="notice-page"><div class="notice-inner">
${brandMark}
<h1>${esc(copy.notice.h1)}</h1>
${copy.notice.body.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
<p class="notice-contact">${esc(copy.notice.contactLine)} <a href="${links.contact}">zhihua@k4cell.com</a></p>
<p class="hero-actions"><a class="button primary" href="../">${esc(copy.notice.back)}</a><a class="button" href="../../status.json">status.json</a></p>
</div></main></body>
</html>`;

const rootPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#080a0f"><meta name="robots" content="index,follow">
  <meta name="description" content="${esc(en.description)}">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'">
  <link rel="canonical" href="https://k4cell.com/"><link rel="alternate" hreflang="en" href="https://k4cell.com/en/"><link rel="alternate" hreflang="zh-Hans" href="https://k4cell.com/zh/"><link rel="alternate" hreflang="x-default" href="https://k4cell.com/">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/site.css">
  <title>K4 Cell &#8212; ${esc(en.gate.h1)}</title>
</head>
<body><main class="language-gate"><div class="language-gate-inner">${brandMark}
<p class="eyebrow">K4 CELL</p><h1>${esc(en.gate.h1)}</h1>
<p>${esc(en.gate.line)}<br>${esc(en.gate.lineZh)}</p>
<div class="hero-actions"><a class="button primary" href="en/">English</a><a class="button" href="zh/">简体中文</a></div>
<p class="gate-num"><code>m_&#956;/m_e = ${esc(heroRow.predicted)}</code><span>computed &#183; 0 continuous parameters &#183; the experiment resolves ${heroRow.resolvedDigits} of these digits &#183; conditional on E8, an open interface</span></p>
</div></main></body></html>`;

const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><link rel="stylesheet" href="/assets/site.css"><title>Not found &#183; K4 Cell</title></head><body><main class="language-gate"><div class="language-gate-inner"><p class="eyebrow">${esc(en.notFound.kicker)}</p><h1>${esc(en.notFound.h1)}</h1><div class="hero-actions"><a class="button primary" href="/">${esc(en.notFound.back)}</a></div></div></main></body></html>`;

const status = {
  schema: "K4CELL-PUBLIC-STATUS-v1",
  recorded_at_utc: ledger.recorded_at_utc,
  artifact_status: "PUBLISHED",
  intended_canonical_domain: "k4cell.com",
  science: {
    state: "CANDIDATE_NOT_INDEPENDENTLY_ESTABLISHED",
    public_review: ledger.artifact.version,
    public_review_frozen_at: ledger.artifact.frozen,
    public_review_commit: publicReviewCommit,
    public_status_commit: publicStatusCommit,
    public_review_pdf_sha256: ledger.artifact.sha256,
    peer_reviewed: false,
    monograph_under_journal_review: false,
    full_physical_realization: "OPEN",
    full_scientific_reproduction_package: "OPEN",
    carved_submissions: external.submissions.map((entry) => ({
      id: entry.id,
      journal: entry.journal,
      submitted: entry.submitted,
      status: entry.status,
    })),
  },
  public_science: {
    protocol: "REVISION_IN_PROGRESS_D0076",
    season: "NOT_STARTED",
    scientific_validation: {
      public_participation_direct_weight: 0,
      route: [
        "PAPERS",
        "PROFESSIONAL_CRITICISM",
        "INDEPENDENT_DERIVATION_OR_REPRODUCTION",
        "FOUNDER_SIGNED_PREREGISTERED_PREDICTIONS",
        "EXPERIMENT_OR_OBSERVATION_COMPARISON",
      ],
      prediction_registry: "FOUNDATION_PASS / ENTRIES_0 / PREREGISTERED_0",
      prediction_registry_path: "/predictions/",
      observability_inventory: {
        scope: "PUBLIC_LEDGER_11_ROWS_ONLY",
        retrospective: 11,
        prediction_candidate: 0,
        not_yet_observable: 0,
        registry_eligible: 0,
        global_k4_coverage: false,
        paper_level_inventory: "OPEN",
      },
      boundary_path: "/provenance/SCIENCE_VALIDATION_PUBLIC_COMMUNICATION_BOUNDARY_v1.md",
    },
    public_communication: {
      purpose: ["COMMUNICATION", "RESEARCH_SUPPORT", "SEPARATE_SPECULATIVE_DEMAND"],
      cards: "12_DRAFT",
      campaign: "NOT_STARTED",
      payment_or_wallet_collection_authorized: false,
    },
    start_gate: {
      public_review_status_sync: `PASS@${publicStatusCommit}`,
      founder_signed_no_official_mint: "PASS",
      canonical_https_source_graph: "PASS@34a7aa92d2badc20d292a01a6be4770b1631ebb8",
      twelve_card_and_metrics_hash_freeze: "SUPERSEDED_BY_D0076 / REPLACEMENT_PROTOCOL_OPEN",
    },
  },
  founder_identity: {
    state: "PRIMARY_AND_SIGNING_SUBKEY_PUBLICLY_ANCHORED / FOUNDER_NO_MINT_SIGNATURE_PASS",
    uid: "Zhihua Liang <zhihua@k4cell.com>",
    algorithm: "Ed25519",
    fingerprint: "C74953F60AD573F54A3FD06C72213914E4860F47",
    signing_subkey_fingerprint: "0427411FA4820FDA5EBFB79B48D9A06D3C49431F",
    signing_subkey_expires_at_utc: "2028-08-29",
    public_key_path: "/provenance/K4V_FOUNDER_OPENPGP_KEY_v2.asc",
    server_subkey_test_signature: "PASS",
    server_subkey_test_signed_at_utc: "2026-08-30T09:53:46Z",
    server_subkey_test_payload_path: "/provenance/tests/SERVER_SIGNING_SUBKEY_TEST_v1.txt",
    server_subkey_test_signature_path: "/provenance/tests/SERVER_SIGNING_SUBKEY_TEST_v1.txt.asc",
    server_subkey_test_payload_sha256: "32E1165F280EA1E4D225BBACCDB07987D17354745E694013239C0BFA824E0838",
    server_subkey_test_signature_sha256: "AF453B85021C1980C25BE0247482FDBEBC5B37F2424BB960EEBA5BD86AB99E47",
    official_no_mint_signature: "PASS",
    official_no_mint_issued_at_utc: "2026-08-30T10:05:26Z",
    official_no_mint_signed_at_utc: "2026-08-30T10:30:37Z",
    official_no_mint_path: "/official-k4v/K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt",
    official_no_mint_signature_path: "/official-k4v/K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt.asc",
    official_no_mint_payload_sha256: "3D972BDAEC125196F5629485D1BEC3F80B4C64C234D547903051C73172063A15",
    official_no_mint_signature_sha256: "83447C16556BA4F68C04C295FEFA8924B2E07D5115F5C08E7498C7C39775FD36",
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

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["", "en/", "zh/", "en/notice/", "zh/notice/", "official-k4v/", "predictions/"].map((path) =>
  `  <url><loc>https://k4cell.com/${path}</loc><lastmod>${ledger.recorded_at_utc}</lastmod></url>`).join("\n")}
</urlset>
`;

await rm(out, { recursive: true, force: true });
for (const directory of ["en/notice", "zh/notice", "assets", "provenance"]) {
  await mkdir(join(out, directory), { recursive: true });
}
await cp(assets, join(out, "assets"), { recursive: true });
await cp(provenance, join(out, "provenance"), { recursive: true });
await cp(officialK4v, join(out, "official-k4v"), { recursive: true });
await cp(predictions, join(out, "predictions"), { recursive: true });

await writeFile(join(out, "index.html"), rootPage);
await writeFile(join(out, "en", "index.html"), renderPage(en));
await writeFile(join(out, "zh", "index.html"), renderPage(zh));
await writeFile(join(out, "en", "notice", "index.html"), renderNotice(en));
await writeFile(join(out, "zh", "notice", "index.html"), renderNotice(zh));
await writeFile(join(out, "404.html"), notFound);
await writeFile(join(out, "status.json"), `${JSON.stringify(status, null, 2)}\n`);
await writeFile(join(out, "ledger.json"), `${JSON.stringify(ledger, null, 2)}\n`);
await writeFile(join(out, "robots.txt"), "User-agent: *\nAllow: /\n\nSitemap: https://k4cell.com/sitemap.xml\n");
await writeFile(join(out, "sitemap.xml"), sitemap);
await writeFile(join(out, "CNAME"), "k4cell.com\n");
await writeFile(join(out, "_headers"), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests

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
  checksumLines.push(`${createHash("sha256").update(bytes).digest("hex")}  ${file.slice(out.length + 1)}`);
}
await writeFile(join(out, "SITE_SHA256SUMS.txt"), `${checksumLines.join("\n")}\n`);
