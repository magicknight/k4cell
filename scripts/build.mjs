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
  /* The row already prints its pull as text in .lpull, so the bar is decoration
     for assistive technology rather than a second, unlocalized announcement. */
  return `<svg class="pullbar" viewBox="0 0 300 10" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect x="0" y="4" width="300" height="2" class="pb-track"/><rect x="0" y="1" width="${Math.max(width, 1).toFixed(1)}" height="8" class="pb-fill${value >= 3 ? " pb-bad" : ""}"/></svg>`;
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

const heroRow = ledger.gaussian.find((row) => row.id === "mu_e");

/* The pigeonhole argument, drawn: three colours across four points force a
   repeat, and the amber edge is the pair that must collide. It is an emblem in
   a framed card — never an object located in the field behind it, which would
   assert the main open bridge. */
const k4Glyph = `<svg class="k4-glyph" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
<path d="M16 3 4 24h24Z"/><line x1="4" y1="24" x2="16" y2="18"/><line x1="28" y1="24" x2="16" y2="18"/>
<line class="collide" x1="16" y1="3" x2="16" y2="18"/>
<circle class="c-mint" cx="16" cy="3" r="2.4"/><circle class="c-violet" cx="4" cy="24" r="2.4"/>
<circle class="c-amber" cx="28" cy="24" r="2.4"/><circle class="c-mint" cx="16" cy="18" r="2.4"/></svg>`;


const renderObject = (copy) => {
  const beats = copy.object.beats.map((beat) => `<article class="beat">
<span class="beat-n">${esc(beat.n)}</span>
<div><span class="tag ${beat.state}">${esc(beat.stateLabel)}</span><h3>${esc(beat.h3)}</h3><p>${beat.body}</p></div>
</article>`).join("");

  const classes = [...classCensus.entries()]
    .sort((a, b) => b[1].states - a[1].states)
    .map(([signature, value]) => `<button type="button" class="qfilter" data-sig="${signature}" aria-pressed="false"><strong>${value.states}</strong><span>${esc(copy.object.classLabels[signature])}</span><em>${value.mono} ${esc(copy.object.classMono)}</em></button>`).join("");

  return `<section id="object" class="object"><div class="shell">
${sectionHead(copy.object.number, copy.object.kicker, copy.object.h2, copy.object.intro)}
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
</div>
</div></section>`;
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
    .replace(/\b(Target|Targets|靶点)\s?([A-D0-9]+(?:\s?(?:and|与|、)\s?[A-D0-9]+)*)/g,
      `<a href="${links.targets}">$1 $2</a>`);

  const row = (r) => `<article class="xrow${r.lead ? " xlead" : ""}">
<h3 class="xhead"><span class="xn">${esc(r.n)}</span>${esc(r.h3)}</h3>
<p class="xtags">${chips(r.tags)}</p>
<p class="xbody">${r.body}</p>
<dl class="xmeta">
<div><dt>${esc(x.ridesOnLabel)}</dt><dd>${linkCodes(r.ridesOn)}</dd></div>
<div><dt>${esc(x.checkLabel)}</dt><dd>${esc(r.checkAt)}</dd></div>
</dl>
</article>`;

  const keys = x.tagKey.map(([state, label, gloss]) =>
    `<div><dt><span class="tag ${state}">${esc(label)}</span></dt><dd>${esc(gloss)}</dd></div>`).join("");

  return `<section id="explain" class="explain"><div class="shell">
${sectionHead(x.number, x.kicker, x.h2, x.intro)}
<blockquote class="xepigraph"><p>${esc(x.epigraph.text)}</p>${x.epigraph.gloss ? `<p class="xgloss">${esc(x.epigraph.gloss)}</p>` : ""}<cite>${esc(x.epigraph.cite)}</cite></blockquote>
<div class="xdef"><h3>${esc(x.closedDefTitle)}</h3><p>${esc(x.closedDef)}</p><p class="xcite">${esc(x.closedDefCite)}</p></div>
<div class="xkey"><h3>${esc(x.tagKeyTitle)}</h3><dl>${keys}</dl></div>
<div class="xrows">${x.rows.map(row).join("")}</div>
<div class="xholo"><h3>${esc(x.holoTitle)}</h3>${x.holo.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
</div></section>`;
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

  return `<section id="ledger" class="ledger"><div class="shell">
${sectionHead(copy.ledger.number, copy.ledger.kicker, copy.ledger.h2, copy.ledger.intro)}
<div class="legend"><strong>${esc(copy.ledger.legendTitle)}</strong> ${esc(copy.ledger.legend)}</div>
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
<p class="lane-note">${esc(copy.ledger.measuredNote)}</p>
</div></section>`;
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

  return `<section id="route" class="route"><div class="shell">
${sectionHead(copy.route.number, copy.route.kicker, copy.route.h2, copy.route.intro)}
<ol class="stations">${stations}</ol>
<p class="main-bridge"><span class="tag open">${esc(copy.route.mainBridgeLabel)}</span> <code>${esc(copy.route.mainBridge)}</code></p>
<div class="gaps">${gaps}</div>
<div class="killswitch">
<button type="button" class="button" data-killswitch><span data-kill-on>${esc(copy.route.killSwitch)}</span><span data-kill-off hidden>${esc(copy.route.killSwitchReset)}</span></button>
<p class="killswitch-note">${esc(copy.route.killSwitchCaption)}</p>
</div>
</div></section>`;
};

const renderKill = (copy) => {
  const cards = copy.kill.cards.map((card) => `<article class="kcard">
<h3>${esc(card.h3)}</h3>
<p class="kclaim">${esc(card.claim)}</p>
<p class="kthreshold">${esc(card.threshold)}</p>
${card.note ? `<p class="knote">${esc(card.note)}</p>` : ""}
<p class="kwhere">${esc(card.where)}</p>
</article>`).join("");

  return `<section id="kill" class="kill"><div class="shell">
${sectionHead(copy.kill.number, copy.kill.kicker, copy.kill.h2, copy.kill.intro)}
<div class="kgrid">${cards}</div>
<p class="stamp">${esc(copy.kill.stamp)}${colon(copy)}${ledger.recorded_at_utc}</p>
</div></section>`;
};

const renderNotDerived = (copy) => {
  const items = copy.notDerived.items.map((item) => `<li>${item}</li>`).join("");
  const submissions = external.submissions.map((entry) => {
    const statusText = entry.status === "UNDER_REVIEW"
      ? copy.notDerived.submissionsUnderReview
      : copy.notDerived.submissionsAwaiting;
    const prior = entry.priorSubmission
      ? `<p class="sub-prior">${esc(copy.notDerived.submissionsPrior)} <em>${esc(entry.priorSubmission.journal)}</em> (${entry.priorSubmission.submitted}) &#183; ${esc(copy.notDerived.submissionsDeskReject)} (${entry.priorSubmission.outcomeDate})</p>`
      : "";
    return `<article class="sub"><span class="sub-id">${esc(entry.id)}</span>
<h4>${esc(entry.title)}</h4>
<p class="sub-meta"><em>${esc(entry.journal)}</em> &#183; ${esc(copy.notDerived.submissionsSubmitted)} ${entry.submitted} &#183; <strong>${esc(statusText)}</strong></p>
${prior}</article>`;
  }).join("");

  return `<section id="not-derived" class="not-derived"><div class="shell">
${sectionHead(copy.notDerived.number, copy.notDerived.kicker, copy.notDerived.h2, "")}
<p class="stamp">${esc(copy.notDerived.updated)} ${ledger.recorded_at_utc}</p>
<ol class="nd-list">${items}</ol>
<h3 class="sub-title">${esc(copy.notDerived.submissionsTitle)}</h3>
<p class="section-intro">${esc(copy.notDerived.submissionsIntro)}</p>
<div class="subs">${submissions}</div>
<p class="lane-note">${esc(copy.notDerived.submissionsNoArxiv)}</p>
</div></section>`;
};

const renderMachine = (copy) => {
  const total = machine.rows;
  const segments = [
    ["leanCertified", machine.leanCertified, "seg-a"],
    ["provedCoreOnly", machine.provedCoreOnly, "seg-b"],
    ["needsLeanNode", machine.needsLeanNode, "seg-c"],
    ["proseEmpiricalOpen", machine.proseEmpiricalOpen, "seg-d"],
  ];
  let cursor = 0;
  const rects = segments.map(([, count, cls]) => {
    const x = (cursor / total) * 900;
    const width = (count / total) * 900;
    cursor += count;
    return `<rect x="${x.toFixed(2)}" y="0" width="${Math.max(width, 1.5).toFixed(2)}" height="34" class="${cls}"/>`;
  }).join("");

  const keys = segments.map(([key, count, cls]) =>
    `<li><span class="key ${cls}"></span><code>${esc(copy.machine.barLabels[key])}</code> <strong>${count}</strong></li>`).join("");

  return `<section id="machine" class="machine"><div class="shell">
${sectionHead(copy.machine.number, copy.machine.kicker, copy.machine.h2, "")}
<p class="mfigures">${copy.machine.figures}</p>
<svg class="mbar" viewBox="0 0 900 34" preserveAspectRatio="none" role="img" aria-label="${esc(copy.machine.barAria.replace("{total}", String(total)).replace("{certified}", String(machine.leanCertified)).replace("{open}", String(notCertified)))}">${rects}</svg>
<ul class="mkeys">${keys}</ul>
<p class="mnote">${esc(copy.machine.barNote)}</p>
<div class="meaning"><p>${copy.machine.meaning}</p></div>
</div></section>`;
};

const renderVerify = (copy) => {
  const items = copy.verify.links.map(([label, note, key]) => {
    const href = key === "statusJson" ? "../status.json"
      : key === "siteSums" ? "../SITE_SHA256SUMS.txt" : links[key];
    return `<li><a href="${href}"><strong>${esc(label)}</strong><span>${esc(note)}</span></a></li>`;
  }).join("");

  return `<section id="verify" class="verify"><div class="shell">
${sectionHead(copy.verify.number, copy.verify.kicker, copy.verify.h2, "")}
<p class="section-intro">${esc(copy.verify.checksumIntro)}</p>
<pre class="sha" tabindex="0" role="group" aria-label="${esc(copy.verify.checksumLabel)}"><code>sha256sum K4_Cell_Framework_v2.0-public-review.pdf
${ledger.artifact.sha256}</code></pre>
<p class="frozen">${esc(copy.verify.frozen)}</p>
<ul class="vlinks">${items}</ul>
<p class="lane-note">${esc(copy.verify.buildNote)}</p>
<div class="defect">${esc(copy.verify.artifactDefect)}</div>
</div></section>`;
};

const renderAttack = (copy) => {
  const targets = copy.attack.targets.map(([label, note]) =>
    `<li><a href="${links.targets}"><strong>${esc(label)}</strong><span>${esc(note)}</span></a></li>`).join("");
  const depths = copy.attack.depths.map(([time, note]) =>
    `<li><span class="depth-time">${esc(time)}</span>${esc(note)}</li>`).join("");
  const person = copy.attack.personLines.map((line) => `<li>${esc(line)}</li>`).join("");

  return `<section id="attack" class="attack"><div class="shell">
${sectionHead(copy.attack.number, copy.attack.kicker, copy.attack.h2, copy.attack.intro)}
<ul class="targets">${targets}</ul>
<ul class="depths">${depths}</ul>
<p class="section-cta"><a class="button primary" href="${links.issues}">${esc(copy.attack.issueCta)}</a> <a class="button" href="${links.discussions}">${esc(copy.attack.discussCta)}</a></p>
<div class="person">
<h3>${esc(copy.attack.personTitle)}</h3>
<p class="person-name">${esc(copy.attack.personName)}</p>
<ul>${person}</ul>
<p class="person-links"><a href="${links.contact}">${esc(copy.attack.personContact)}</a> &#183; <a href="${links.orcid}">ORCID ${esc(copy.attack.personOrcid)}</a></p>
</div>
</div></section>`;
};

const renderPage = (copy) => {
  const alternate = copy.alternateDir === "en" ? en : zh;
  const nav = copy.nav.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join("");
  const chips = copy.hero.chips.map(([label, value]) =>
    `<div class="chip"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("");
  const actions = copy.hero.actions.map(([label, href], index) =>
    `<a class="button${index === 0 ? " primary" : ""}" href="${href}">${esc(label)}</a>`).join("");
  const statusItems = copy.statusLine.map((item) => item === copy.statusNotReviewed
    ? `<a href="#not-derived">${esc(item)}</a>`
    : `<span>${esc(item)}</span>`).join('<i aria-hidden="true">&#183;</i>');

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
  <header class="site-header shell">
    <a class="brand" href="#top" aria-label="K4 Cell">${brandMark}<span>K4 CELL</span></a>
    <nav class="site-nav" aria-label="${esc(copy.navLabel)}">${nav}</nav>
    <a class="language-link" href="../${alternate.dir}/" hreflang="${alternate.htmlLang}">${esc(copy.languageLabel)}</a>
  </header>
  <p class="statusline shell">${statusItems}</p>
  <main id="main">
    <div id="top" class="hero-band">
      <figure class="hero-plate" aria-describedby="plate-note">
        <picture>
          <source media="(max-width: 719px)" srcset="../assets/hero-web-port.webp" width="1080" height="1440">
          <img src="../assets/hero-web-land.webp" width="1920" height="1080" alt="${esc(copy.hero.plateAlt)}" decoding="async" fetchpriority="high">
        </picture>
        <figcaption class="plate-tag">${esc(copy.hero.plateTag)}</figcaption>
      </figure>
      <div class="hero-inner shell">
        <h1>${esc(copy.hero.h1)}</h1>
        <p class="hero-deck">${esc(copy.hero.deck)}</p>
        <blockquote class="hero-epigraph"><p>${esc(copy.hero.epigraph.text)}</p><p class="he-gloss">${esc(copy.hero.epigraph.gloss)}</p><cite>${esc(copy.hero.epigraph.cite)}</cite></blockquote>
        <p class="hero-lede">${copy.hero.lede}</p>
        <p class="hero-claims">${copy.hero.claims}</p>
        <p class="hero-fine">${esc(copy.hero.fineprint)}</p>
        <p class="hero-body">${esc(copy.hero.body)}</p>
        <div class="chips">${chips}</div>
        <div class="hero-actions">${actions}</div>
        <aside class="k4-card">${k4Glyph}<p>${esc(copy.hero.glyphLegendA)}<span>${esc(copy.hero.glyphLegendB)}</span></p></aside>
        <div class="hero-rail">
          ${ruler(heroRow, copy, { hero: true })}
          <div class="rail-notes">
            <p class="rn-lead">${esc(copy.hero.railLead)}</p>
            <p class="rn-ghost">${esc(copy.hero.rulerGhost)}</p>
            <p class="rn-tag">${esc(copy.hero.railTag)}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="shell hero-foot">
      <p class="plate-note" id="plate-note">${esc(copy.hero.plateNoteA)}<a href="#ledger">${esc(copy.hero.plateNoteLink)}</a>${esc(copy.hero.plateNoteB)}</p>
      <p class="hero-caveat">${esc(copy.hero.caveat)}</p>
    </div>
    ${renderObject(copy)}
    ${renderExplain(copy)}
    ${renderLedger(copy)}
    <section id="check-it" class="check-it"><div class="shell">
      ${sectionHead(copy.checkIt.number, copy.checkIt.kicker, copy.checkIt.h2, "")}
      <div class="check-grid">
        <div>
          <p class="check-body">${esc(copy.checkIt.body)}</p>
          <p class="check-counter">${copy.checkIt.counter}</p>
        </div>
        <div class="division">
          <ol class="steps" data-step="${esc(copy.checkIt.stepButton)}" data-reset="${esc(copy.checkIt.resetButton)}"><li>0.2</li><li>0.22</li><li>0.225</li><li>0.2250</li><li>0.22500</li><li>0.225000<span class="dinf">&#8230;&#8734;</span></li></ol>
          <p class="check-measured"><span>${esc(copy.checkIt.measuredLabel)}</span><code>0.22501 &#177; 0.00068</code></p>
          <p class="check-contains">${esc(copy.checkIt.containsLabel)}</p>
        </div>
      </div>
    </div></section>
    <section id="inputs" class="inputs"><div class="shell">
      ${sectionHead(copy.inputs.number, copy.inputs.kicker, copy.inputs.h2, "")}
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
      <p class="invitation">${esc(copy.inputs.invitation)} <a href="${links.issues}">${esc(copy.inputs.invitationCta)}</a></p>
    </div></section>
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
    protocol: "FROZEN_DESIGN",
    season: "NOT_STARTED",
    start_gate: {
      public_review_status_sync: `PASS@${publicStatusCommit}`,
      founder_signed_no_official_mint: "OPEN",
      canonical_https_source_graph: "OPEN",
      twelve_card_and_metrics_hash_freeze: "OPEN",
    },
  },
  founder_identity: {
    state: "PRIMARY_AND_SIGNING_SUBKEY_PUBLICLY_ANCHORED / SERVER_SUBKEY_TEST_PASS",
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
${["", "en/", "zh/", "en/notice/", "zh/notice/"].map((path) =>
  `  <url><loc>https://k4cell.com/${path}</loc><lastmod>${ledger.recorded_at_utc}</lastmod></url>`).join("\n")}
</urlset>
`;

await rm(out, { recursive: true, force: true });
for (const directory of ["en/notice", "zh/notice", "assets", "provenance"]) {
  await mkdir(join(out, directory), { recursive: true });
}
await cp(assets, join(out, "assets"), { recursive: true });
await cp(provenance, join(out, "provenance"), { recursive: true });

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
