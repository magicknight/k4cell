/* ------------------------------------------------------------------ *
 * The page. One document per language, eleven sections, everything    *
 * server-rendered: with JavaScript off the whole argument still reads.*
 *                                                                     *
 * Order: the object, then the numbers, then the claims, then how to    *
 * kill it, then the machine, then the boundary, then how to check it.  *
 * The honest boundary is not weakened anywhere — it is moved behind    *
 * the idea and worn as a small tag per claim instead of a red slab.    *
 *                                                                     *
 * No user-visible string is written here. Every word comes from        *
 * src/copy/{zh,en}.js; every number from src/data/ledger.json.         *
 * ------------------------------------------------------------------ */

import assert from "node:assert/strict";

import en from "../../../src/copy/en.js";
import zh from "../../../src/copy/zh.js";

import { classCensus, external, heroRow, ledger, machine, notCertified, states } from "../data.mjs";
import { CSP, assertThemeColour, brandMark, colon, esc, ogFor, renderHead } from "../html.mjs";
import { linkCodes, links } from "../links.mjs";
import { k4Glyph } from "../figures/deal.mjs";
import { pullBar, ruler } from "../figures/digits.mjs";
import { renderGrid } from "../figures/grid81.mjs";
import { FIG, figNumeral } from "../figures/order.mjs";
import { renderHypercharge } from "../figures/hypercharge.mjs";
import { renderImaginaryFigure } from "../figures/imaginary.mjs";
import { renderRouteFigure } from "../figures/route.mjs";
import { rationalDigits, renderRulerFigure } from "../figures/ruler.mjs";
import { sigmaFigure } from "../figures/sigma.mjs";

/* ---- small typographic helpers ------------------------------------ */

/* The ledger writes symbols the way a file does: m_mu/m_e. Printing the
   underscore is what made the old page read as a machine log, so the display
   layer lowers the subscript. The ledger itself is never touched. */
export const sym = (symbol) => esc(symbol).replace(/_([A-Za-z*µμα-ω]+)/g, "<sub>$1</sub>");

/* Emphasis is allowed on numbers and nowhere else, so the headline colours its
   numerals and leaves every word of the sentence alone. */
export const numerals = (text) => esc(text).replace(/\d+/g, '<span class="num">$&</span>');

/* RETIRED 2026-08-30. A strip-the-code helper used to delete "(E8)" from the
   two tier chips before rendering — a silent rewrite of reviewed copy, and
   the one place where what the deck said and what the page printed could
   differ with every gate green. The decks now carry the clause without the
   code, so the chips render as written; check/structure.mjs asserts both
   halves (the clause is printed in full, and no code reaches the fold).

   The tier chip already carries the tier's own name; the tag beside it prints
   the same word. Drop the duplicate lead-in, but only when it really is one. */
export const stripTierPrefix = (copy, text) => {
  for (const [, label] of copy.tiers.key) {
    const head = new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[·–—:：]\\s*`);
    if (head.test(text)) return text.replace(head, "");
  }
  return text;
};

/* Two sentences joined by the template. A full stop takes a space after it;
   a full-width one does not (CY/T 154 §8.2) — there it reads as a typo. */
const gap = (copy) => (copy.dir === "zh" ? "" : " ");

const tierLabels = (copy) => Object.fromEntries(copy.tiers.key.map(([id, label]) => [id, label]));

const tagChips = (copy, list) => {
  const label = tierLabels(copy);
  return list.map((tier) => `<span class="tag ${tier}">${esc(label[tier])}</span>`).join("");
};

/* Every section is laid on the same two tracks: a rail carrying the section
   numeral and its running head, and one reading measure. The rail's left edge
   is where the page-long scale spine is drawn. */
const sec = (id, cls, number, kicker, body, extra = "") =>
  `<section id="${id}" class="sec ${cls}"><div class="shell sec-in">
<aside class="sec-rail"><p class="sec-n">${esc(number)}</p><p class="sec-k">${esc(kicker)}</p></aside>
<div class="sec-main">${body}</div>
</div>${extra}</section>`;

const lambdaC = ledger.gaussian.find((row) => row.id === "lambda_c");
const alphaS = ledger.gaussian.find((row) => row.id === "alpha_s");

/* ------------------------------------------------------------------ *
 * A  the first screen                                                 *
 * ------------------------------------------------------------------ */

export const renderHero = (copy) => {
  const t = copy.figures.ruler;
  /* The hero promotes one ledger row to display size. Its tier is not typed:
     it is read off that row's own open interfaces, so the chip cannot outlive
     the interface it depends on. check/structure.mjs re-derives it. */
  const heroTiers = heroRow.interfaces.length ? ["conditional"] : ["closed"];
  const chip = stripTierPrefix(copy, copy.hero.tierChip);
  const rowLabel = copy.nav.find(([id]) => id === "numbers")[1];

  const actions = copy.hero.actions.map(([label, href], index) =>
    `<a class="button${index === 0 ? " primary" : ""}" href="${href}">${esc(label)}</a>`).join("");

  return `<section id="hero" class="hero"><div class="shell hero-in">
<div class="hero-main">
<p class="eyebrow">${esc(copy.hero.eyebrow)}</p>
<h1><span class="h1a">${numerals(copy.hero.h1a)}</span><span class="h1b">${numerals(copy.hero.h1b)}</span></h1>
<p class="hero-sub">${esc(copy.hero.sub)}</p>
<figure class="hero-ruler inst" aria-label="${esc(copy.hero.rulerAlt)}">
<p class="inst-lab">${sym(copy.hero.rulerLabel)}</p>
${ruler(heroRow, copy, { hero: true })}
<figcaption class="hero-tier">${tagChips(copy, heroTiers)}<span class="hero-tier-t">${esc(chip)}</span><a class="hero-tier-l" href="#l-${heroRow.id}">${esc(rowLabel)}</a></figcaption>
</figure>
<p class="hero-bet"><strong>${esc(copy.hero.bet)}</strong><span>${esc(copy.hero.betNote)}</span></p>
<div class="hero-actions">${actions}</div>
<p class="byline">${copy.hero.byline.map((line) => `<span>${esc(line)}</span>`).join("")}</p>
</div>
<div class="hero-app">
<figure class="k4fig k4fig-hero" aria-label="${esc(copy.hero.glyphAlt)}">
<div class="orb">${k4Glyph}</div>
<figcaption><b class="fig-n">${esc(figNumeral(copy, FIG.glyph))}</b>${esc(copy.hero.glyphA)}${esc(t.stop)}${gap(copy)}${esc(copy.hero.glyphB)}${esc(t.stop)}</figcaption>
</figure>
</div>
</div></section>`;
};

/* ------------------------------------------------------------------ *
 * B  twenty-odd numbers, every one of them turned by hand             *
 * ------------------------------------------------------------------ */

export const renderWhy = (copy) => {
  const dials = copy.why.dials.map(([symbol, name]) =>
    `<li><span class="knob" aria-hidden="true"></span><b>${sym(symbol)}</b><span>${esc(name)}</span></li>`).join("");

  return sec("why", "sec-why", copy.why.number, copy.why.kicker, `<p class="spine-tick">${esc(copy.whys.scaleLabelA)}</p>
<h2>${esc(copy.why.h2)}</h2>
<p class="lede">${esc(copy.why.lede)}</p>
<ul class="dials" aria-label="${esc(copy.why.kicker)}">${dials}</ul>
<p class="contrast">${esc(copy.why.contrast)}</p>
<p class="fine">${esc(copy.why.contrastNote)}</p>
<p class="noknob">${esc(copy.why.noKnob)}</p>`);
};

/* ------------------------------------------------------------------ *
 * C  the object: four points, six links, three colours, one rule      *
 * ------------------------------------------------------------------ */

export const renderObject = (copy) => {
  const label = tierLabels(copy);
  const beats = copy.object.beats.map((beat) => `<article class="beat">
<span class="beat-n">${esc(beat.n)}</span>
<div><h3>${esc(beat.h3)}</h3><span class="tag ${beat.tag}">${esc(label[beat.tag])}</span><p>${beat.body}</p></div>
</article>`).join("");

  const classes = [...classCensus.entries()]
    .sort((a, b) => b[1].states - a[1].states)
    .map(([signature, value]) => `<button type="button" class="qfilter" data-sig="${signature}" aria-pressed="false"><strong>${value.states}</strong><span>${esc(copy.object.classLabels[signature])}</span><em>${value.mono} ${esc(copy.object.classMono)}</em></button>`).join("");

  /* Counted here, never typed: how many of the 81 escape the rule. */
  const free = states.filter((state) => state.mono.length === 0).length;

  return sec("object", "sec-object", copy.object.number, copy.object.kicker, `<h2>${esc(copy.object.h2)}</h2>
<p class="lede">${esc(copy.object.intro)}</p>
<div class="beats">${beats}</div>
<div class="forced"><span class="tag ${copy.object.forcedTier}">${esc(label[copy.object.forcedTier])}</span><p>${esc(copy.object.forced)}</p></div>
<p class="two-minutes">${esc(copy.object.twoMinutes)}</p>
<div class="grid-block">
<div class="grid-copy">
<h3>${esc(copy.object.gridTitle)}</h3>
<p class="fine">${esc(copy.object.gridIntro)}</p>
<div class="qfilters" role="group" aria-label="${esc(copy.object.gridFilterLabel)}">
<button type="button" class="qfilter" data-sig="all" aria-pressed="true"><span>${esc(copy.object.gridFilterAll)}</span><em></em></button>
${classes}</div>
<p class="qmean"><span>${esc(copy.object.gridMeanLabel)}</span><strong>${esc(copy.object.gridMeanValue)}</strong><em>${esc(copy.object.gridMeanNote)}</em></p>
<button type="button" class="button qsweep" data-done="${esc(copy.object.gridSweepDone)}">${esc(copy.object.gridSweep)}</button>
<p class="score"><b>${free}</b><span>/${states.length} ${esc(copy.object.classStates)}</span></p>
<p class="qlive" data-live aria-live="polite">${esc(copy.object.gridSweepResult)}</p>
</div>
<figure class="grid-figure">${renderGrid(copy.object.gridTitle)}<figcaption class="counts">${esc(copy.object.countsCaption)}</figcaption></figure>
</div>
<p class="qcaveat">${esc(copy.object.gridCaveat)}</p>`);
};

/* ------------------------------------------------------------------ *
 * D  check one yourself: 9 divided by 40                              *
 * ------------------------------------------------------------------ */

export const renderCheck = (copy) => {
  const label = tierLabels(copy);
  /* Not typed: read off lambda_c's own open interfaces, exactly as the hero
     reads off mu_e's. Empty that list in the ledger and this chip flips with
     it instead of going on saying "conditional". check/structure.mjs pins the
     tier, the clause and the absence of an interface code, as it does for the
     hero — this chip went through the same silent-rewrite helper with no gate
     at all until 2026-08-30. */
  const checkTier = lambdaC.interfaces.length ? "conditional" : "closed";
  /* Long division from the ledger's own rational, never a typed decimal. */
  const digits = rationalDigits(lambdaC.predictedExact, 6);
  const steps = digits.map((_, index) => {
    const shown = `0.${digits.slice(0, index + 1).join("")}`;
    const tail = index === digits.length - 1 ? `<span class="dinf">&#8230;&#8734;</span>` : "";
    return `<li>${shown}${tail}</li>`;
  }).join("");

  return sec("check", "sec-check", copy.checkIt.number, copy.checkIt.kicker, `<h2>${esc(copy.checkIt.h2)}</h2>
<div class="check-grid">
<div class="check-prose">
<p class="lede">${esc(copy.checkIt.body)}</p>
<p class="check-after">${esc(copy.checkIt.after)}</p>
<p class="check-tier"><span class="tag ${checkTier}">${esc(label[checkTier])}</span><span>${esc(stripTierPrefix(copy, copy.checkIt.tierChip))}</span></p>
</div>
<div class="division inst">
<p class="inst-lab">${esc(copy.checkIt.h2)}</p>
<ol class="steps" data-step="${esc(copy.checkIt.stepButton)}" data-reset="${esc(copy.checkIt.resetButton)}">${steps}</ol>
<p class="check-measured"><span>${esc(copy.checkIt.measuredLabel)}</span><code>${esc(lambdaC.measured)} &#177; ${esc(lambdaC.sigma)}</code></p>
<p class="check-contains">${esc(copy.checkIt.containsLabel)}</p>
</div>
</div>
<div class="check-second"><h3>${esc(copy.checkIt.second.h3)}</h3><p>${esc(copy.checkIt.second.body)}</p></div>`);
};

/* ------------------------------------------------------------------ *
 * E  eleven whys: one journey from four points to the universe        *
 * ------------------------------------------------------------------ */

/* ---- a reviewed string that arrives in more than one piece ---------- *
 *
 * A deck string may carry several segments, one per line, and the template
 * that prints it decides what a segment is. Two claims use this:
 *
 *   answer   every segment is its own paragraph. Claims 09 and 11 ran 684
 *            and 583 characters as a single block — about thirty-six lines
 *            on a 390px phone — and a lay reader reported sliding past 09.
 *            The break is placed where the argument turns, in the reviewed
 *            copy; no word is added, cut or reordered here.
 *
 *   rides    a segment opening with "- " is a list item, and a run of them
 *            becomes a real <ul>. Claim 08 leans on four separately named
 *            open steps and printed them as one 138-character sentence with
 *            one colon and three semicolons — the longest visible sentence
 *            on the page, and the one the reader skipped.
 *
 * Nothing is rewritten at render time. check/copy.mjs walks each segment on
 * its own, so a segment that reaches no reader still fails the build.       */
export const segments = (text) => String(text).split("\n").map((line) => line.trim()).filter(Boolean);

export const bodyParagraphs = (answer) =>
  segments(answer).map((paragraph) => `<p class="wbody">${paragraph}</p>`).join("\n");

export const ridesBlock = (label, text) => {
  const parts = segments(text);
  assert.ok(parts.length && !parts[0].startsWith("- "),
    `a "rides on" string must open with a sentence, not a list item: ${parts[0]}`);
  const out = [];
  let items = [];
  const flush = () => {
    if (!items.length) return;
    out.push(`<ul class="wrl">${items.map((item) => `<li>${linkCodes(item)}</li>`).join("")}</ul>`);
    items = [];
  };
  for (const part of parts) {
    if (part.startsWith("- ")) { items.push(part.slice(2)); continue; }
    flush();
    const lead = out.length === 0;
    out.push(`<p class="wrides${lead ? "" : " wrides-tail"}">`
      + (lead ? `<span class="wlab">${esc(label)}</span>` : "")
      + `${linkCodes(part)}</p>`);
  }
  flush();
  return out.join("\n");
};

export const renderWhys = (copy) => {
  const x = copy.whys;
  const keys = copy.tiers.key.map(([tier, label, plain]) =>
    `<div><dt><span class="tag ${tier}">${esc(label)}</span></dt><dd>${esc(plain)}</dd></div>`).join("");

  const strip = x.rows.map((row) =>
    `<li><a href="#w-${esc(row.n)}"><b>${esc(row.n)}</b><span>${esc(row.scale)}</span></a></li>`).join("");

  /* The lead is the one sentence a reader can carry away and repeat; the
     answer is the mechanism, for the reader who wants it. It is a sentence,
     not a form field, so it takes no label — only its own weight. */
  const card = (row) => `<article class="wrow" id="w-${esc(row.n)}" data-tags="${esc(row.tags.join(" "))}">
<header class="whead"><span class="wn">${esc(row.n)}</span><h3>${esc(row.q)}</h3></header>
<p class="wtags">${tagChips(copy, row.tags)}<span class="wscale">${esc(row.scale)}</span></p>
<p class="wlead">${esc(row.lead)}</p>
${bodyParagraphs(row.answer)}
${ridesBlock(x.ridesLabel, row.rides)}
<details class="wcheck"><summary>${esc(x.checkLabel)}</summary><p>${esc(row.check)}</p></details>
</article>`;

  /* A row names its own figure. An unknown name used to be skipped in silence,
     which is how a figure disappears from the page with every gate green. */
  const figures = {
    imaginary: () => renderImaginaryFigure(copy),
    hypercharge: () => renderHypercharge(copy, { figure: FIG.hypercharge, linkCodes }),
  };
  const rows = x.rows.map((row) => {
    if (row.figure !== undefined) {
      assert.ok(figures[row.figure],
        `${copy.dir}/${row.n}: claim row asks for a figure called "${row.figure}", which does not exist`);
    }
    const after = row.figure ? figures[row.figure]() : "";
    return `${card(row)}${after ? `<div class="wfig">${after}</div>` : ""}`;
  }).join("");

  return sec("whys", "sec-whys", x.number, x.kicker, `<h2>${esc(x.h2)}</h2>
<p class="lede">${esc(x.intro)}</p>
<div class="tierkey"><h3>${esc(copy.tiers.title)}</h3><dl>${keys}</dl></div>
<div class="scale-ends"><span>${esc(x.scaleLabelA)}</span><span>${esc(x.scaleLabelB)}</span></div>
<ol class="scale" aria-label="${esc(x.kicker)}">${strip}</ol>
<p class="fine scale-note">${esc(x.scaleNote)}</p>
<div class="wrows">${rows}</div>`);
};

/* ------------------------------------------------------------------ *
 * F  the numbers: the best row and the worst row on one table         *
 * ------------------------------------------------------------------ */

export const renderNumbers = (copy) => {
  const L = copy.ledger;
  const label = tierLabels(copy);

  const conditional = (row) => (row.interfaces.length
    ? `<p class="lif"><span class="tag conditional">${esc(label.conditional)}</span><span class="lif-t">${esc(L.conditionalOn)}</span>${row.interfaces.map((code) => `<code>${esc(code)}</code>`).join("")}</p>`
    : "");

  const gaussian = ledger.gaussian.map((row) => `<article class="lrow" id="l-${row.id}" data-row="${row.id}">
<div class="lhead"><h3 class="lsym">${sym(row.symbol)}</h3><span class="lp-val">${esc(row.pullDisplay)}</span></div>
<p class="ltype">${esc(L.types[row.id])}</p>
${ruler(row, copy)}
<div class="lpull"><span class="lp-lab">${esc(L.colPull)}</span>${row.noPull ? "" : pullBar(row.pull)}</div>
${row.predictedExact ? `<p class="lnote">${esc(L.exactNote)}</p>` : ""}
${row.noPull ? `<p class="lnote">${esc(L.noPullNote)}</p>` : ""}
${row.id === "lambda" ? `<p class="lnote lambda-note">${esc(L.lambdaNote)}</p>` : ""}
${conditional(row)}
<p class="lstate"><span>${esc(L.colState)}</span>${esc(L.darkLabel)}</p>
</article>`).join("");

  const diagnostics = ledger.diagnostics.map((row) => `<article class="lrow lrow-diag${row.worst ? " lrow-worst" : ""}" id="l-${row.id}" data-row="${row.id}">
<div class="lhead"><h3 class="lsym">${sym(row.symbol)}</h3><span class="lp-val">${esc(row.equivalent)}</span></div>
<p class="ltype">${esc(L.types[row.id])}</p>
<p class="ldiag"><span>${esc(L.colComputed)}</span><code>${esc(row.predicted)}</code></p>
<p class="ldiag"><span>${esc(L.colMeasured)}</span><code>${esc(row.measured)}</code></p>
<div class="lpull"><span class="lp-lab">${esc(L.colPull)}</span>${pullBar(Number.parseFloat(row.equivalent))}</div>
<p class="lstate"><span>${esc(L.colState)}</span>${esc(L.darkLabel)}</p>
</article>`).join("");

  const bounds = ledger.bounds.map((row) => `<article class="lrow lrow-bound" id="l-${row.id}" data-row="${row.id}">
<div class="lhead"><h3 class="lsym">${sym(row.symbol)}</h3><span class="lp-val lp-open">&#8595;</span></div>
<p class="ltype">${esc(L.types[row.id])}</p>
<p class="ldiag"><span>${esc(L.colComputed)}</span><code>${row.predictedApproximate ? "&#8776; " : ""}${esc(row.predicted)}</code></p>
<p class="lstate"><span>${esc(L.colState)}</span>${esc(L.darkLabel)}</p>
</article>`).join("");

  return sec("numbers", "sec-numbers", L.number, L.kicker, `<h2>${esc(L.h2)}</h2>
<p class="lede">${esc(L.intro)}</p>
${renderRulerFigure(copy, { n: FIG.ruler })}
${sigmaFigure(copy)}
<p class="legend"><strong>${esc(L.legendTitle)}</strong> ${esc(L.legend)}</p>
<h3 class="lane">${esc(L.laneGaussian)}</h3>
<div class="lgrid">${gaussian}</div>
<h3 class="lane">${esc(L.laneDiagnostic)}</h3>
<p class="lane-note">${esc(L.laneDiagnosticNote)}</p>
<div class="lgrid">${diagnostics}</div>
<h3 class="lane">${esc(L.laneBounds)}</h3>
<p class="lane-note">${esc(L.laneBoundsNote)}</p>
<div class="lgrid">${bounds}</div>
<p class="noscore">${esc(L.noScore)}</p>
<p class="lane-note">${esc(L.censusNote)} <a href="${links.pdf}">${esc(L.censusAuthority)}</a></p>
<p class="lane-note">${esc(L.measuredNote)}</p>`);
};

/* ------------------------------------------------------------------ *
 * G  how to kill it. The one section allowed the warning colour.      *
 * ------------------------------------------------------------------ */

export const renderKill = (copy) => {
  const k = copy.kill;
  const gradeLabel = Object.fromEntries(k.gradeKey.map(([id, text]) => [id, text]));

  const cards = k.cards.map((card) => `<article class="kcard" data-grade="${esc(card.grade)}">
<h3>${esc(card.h3)}</h3>
<p class="kclaim">${esc(card.claim)}</p>
<p class="kthreshold"><span class="klab">${esc(k.thresholdLabel)}</span>${esc(card.threshold)}</p>
<dl class="kmeta">
<dt>${esc(k.whereLabel)}</dt><dd class="kwhere">${esc(card.where)}</dd>
<dt>${esc(k.whenLabel)}</dt><dd class="kwhen">${esc(card.when)}</dd>
<dt>${esc(k.gradeLabel)}</dt><dd class="kgrade"><span class="kchip">${esc(gradeLabel[card.grade])}</span></dd>
${card.note ? `<dt>${esc(k.noteLabel)}</dt><dd class="knote">${esc(card.note)}</dd>` : ""}
</dl>
${card.check ? `<details class="kcheck"><summary>${esc(k.checkLabel)}</summary><p>${esc(card.check)}</p></details>` : ""}
</article>`).join("");

  const more = k.more.map(([title, claim, where, when, grade]) =>
    `<li><b>${esc(title)}</b><span class="kmore-c">${esc(claim)}</span><span class="kmore-m">${esc(where)} &#183; ${esc(when)}</span><span class="kchip">${esc(gradeLabel[grade])}</span></li>`).join("");

  const gradekey = k.gradeKey.map(([id, text, plain]) =>
    `<p data-grade="${esc(id)}"><b>${esc(text)}</b>${colon(copy)}${esc(plain)}</p>`).join("");

  return sec("kill", "sec-kill", k.number, k.kicker, `<h2>${esc(k.h2)}</h2>
<p class="lede">${esc(k.intro)}</p>
<div class="kgrid">${cards}</div>
<div class="kmore"><h3>${esc(k.moreTitle)}</h3><ul>${more}</ul></div>
<div class="gradekey"><p class="gradeintro">${esc(k.gradeIntro)}</p>${gradekey}</div>
<p class="today">${esc(k.today)}</p>
<p class="decade">${esc(k.decade)}</p>`);
};

/* ------------------------------------------------------------------ *
 * H  what the machine checked, and what it did not                    *
 * ------------------------------------------------------------------ */

export const renderMachine = (copy) => {
  const m = copy.machine;
  /* The residue is printed in prose, so the prose has to agree with the
     ledger's own arithmetic rather than restate it from memory. */
  assert.ok(m.barNote.includes(String(notCertified)),
    `${copy.dir}: machine.barNote no longer prints the ${notCertified} uncertified rows`);
  const buckets = [
    ["leanCertified", machine.leanCertified],
    ["provedCoreOnly", machine.provedCoreOnly],
    ["needsLeanNode", machine.needsLeanNode],
    ["proseEmpiricalOpen", machine.proseEmpiricalOpen],
  ];
  /* Lead with what passed, not with the residue: the old page made the 44 the
     largest glyph on the site, which inverted its own meaning. */
  const keys = buckets.map(([key, count]) =>
    `<li><strong>${count}</strong><span>${esc(m.barLabels[key])}</span><code>${esc(m.barCodes[key])}</code><em>${esc(m.bucketsPlain[key])}</em></li>`).join("");

  return sec("machine", "sec-machine", m.number, m.kicker, `<h2>${esc(m.h2)}</h2>
<p class="score score-lean"><b>${machine.leanCertified}</b><span>/${machine.rows} ${esc(m.barLabels.leanCertified)}</span></p>
<p class="lede">${esc(m.lead)}</p>
<p class="mfigures">${esc(m.what)}</p>
<div class="note note--hedge"><p>${esc(m.meaning)}</p></div>
<h3 class="mbar-t">${esc(m.barTitle)}</h3>
<ul class="mkeys">${keys}</ul>
<p class="fine">${esc(m.barNote)} ${esc(m.asOf)}</p>`);
};

/* ------------------------------------------------------------------ *
 * I  the boundary: theorem, interface, bet — drawn as a route         *
 * ------------------------------------------------------------------ */

export const renderBoundary = (copy) => {
  const b = copy.boundary;
  const r = b.route;

  const stations = r.stations.map(([title, sub, tier], index) =>
    `<li class="station" data-state="${esc(tier)}"><span class="st-n">${String(index + 1).padStart(2, "0")}</span><strong>${esc(title)}</strong><span class="st-sub">${esc(sub)}</span></li>`).join("");

  const gaps = r.gaps.map(([code, description, carries]) => {
    const rows = carries.length
      ? `${esc(r.gapCarries)}${colon(copy)}${carries.map((id) => `<code>${sym(ledger.gaussian.find((row) => row.id === id).symbol)}</code>`).join(" ")}`
      : esc(r.gapCarriesNothing);
    return `<article class="gap" data-carries="${carries.join(" ")}" data-code="${esc(code)}">
<span class="gap-code">${esc(code)}</span><p>${esc(description)}</p><p class="gap-carries">${rows}</p></article>`;
  }).join("");

  const iface = b.interfaces.items.map(([code, plain]) =>
    `<div><dt><code>${esc(code)}</code></dt><dd>${esc(plain)}</dd></div>`).join("");

  const notDerived = b.notDerived.items.map((item, index) => {
    const refs = (b.notDerived.refs[index] ?? []).map((code) => `<code>${esc(code)}</code>`).join("");
    return `<li>${item}${refs ? `<span class="nd-refs">${refs}</span>` : ""}</li>`;
  }).join("");

  const submissions = b.submissions.records.map(([id, journal, submitted, state]) =>
    `<article class="sub"><span class="sub-id">${esc(id)}</span><p class="sub-meta"><em>${esc(journal)}</em> &#183; ${esc(b.submissions.submittedOn)} ${esc(submitted)} &#183; <strong>${esc(b.submissions[state])}</strong></p></article>`).join("");

  return sec("deeper", "sec-boundary route", b.number, b.kicker, `<h2>${esc(b.h2)}</h2>
<p class="lede">${esc(b.intro)}</p>
<div class="route-block">
<h3>${esc(r.h3)}</h3>
<p class="fine route-intro">${esc(r.intro)}</p>
${renderRouteFigure(copy)}
<ol class="stations">${stations}</ol>
<p class="mainbridge"><span class="tag open">${esc(r.mainBridgeLabel)}</span><code>${esc(r.mainBridge)}</code></p>
<div class="gaps">${gaps}</div>
<div class="killswitch">
<button type="button" class="button" data-killswitch><span data-kill-on>${esc(r.killSwitch)}</span><span data-kill-off hidden>${esc(r.killSwitchReset)}</span></button>
<p class="killswitch-note">${esc(r.killSwitchCaption)}</p>
</div>
</div>
<div class="iface"><h3>${esc(b.interfaces.h3)}</h3><dl>${iface}</dl></div>
<div class="notderived"><h3>${esc(b.notDerived.h3)}</h3><ol class="nd-list">${notDerived}</ol></div>
<div class="inputs"><h3>${esc(b.inputs.h3)}</h3><p>${esc(b.inputs.closed)}</p><p>${esc(b.inputs.closed2)}</p><p class="inputs-open">${esc(b.inputs.open)}</p></div>
<div class="subs"><h3>${esc(b.submissions.h3)}</h3><p>${b.submissions.intro}</p>${submissions}<p class="fine">${esc(b.submissions.noArxiv)}</p><p class="defect">${esc(b.submissions.defect)}</p></div>`);
};

/* ------------------------------------------------------------------ *
 * J  come and check it, come and break it                             *
 * ------------------------------------------------------------------ */

export const renderVerify = (copy) => {
  const v = copy.verify;
  const items = v.links.map(([label, note, key]) => {
    const href = key === "statusJson" ? "../status.json"
      : key === "siteSums" ? "../SITE_SHA256SUMS.txt"
        : key === "ledgerJson" ? "../ledger.json" : links[key];
    return `<li><a href="${href}"><strong>${esc(label)}</strong><span>${esc(note)}</span></a></li>`;
  }).join("");

  const targets = v.targets.map(([label, note]) =>
    `<li><a href="${links.targets}"><strong>${esc(label)}</strong><span>${esc(note)}</span></a></li>`).join("");
  const depths = v.depths.map(([time, note]) =>
    `<li><span class="depth-time">${esc(time)}</span>${esc(note)}</li>`).join("");

  return sec("verify", "sec-verify", v.number, v.kicker, `<h2>${esc(v.h2)}</h2>
<p class="lede">${esc(v.checksumIntro)}</p>
<pre class="sha" tabindex="0" role="group" aria-label="${esc(v.checksumLabel)}"><code>sha256sum K4_Cell_Framework_v${ledger.artifact.version}.pdf
${ledger.artifact.sha256}</code></pre>
<p class="frozen">${esc(v.frozen)}</p>
<ul class="vlinks">${items}</ul>
<p class="fine">${esc(v.buildNote)}</p>
<ul class="targets">${targets}</ul>
<ul class="depths">${depths}</ul>
<p class="section-cta"><a class="button primary" href="${links.issues}">${esc(v.issueCta)}</a><a class="button" href="${links.discussions}">${esc(v.discussCta)}</a></p>
<div class="person">
<h3>${esc(v.personTitle)}</h3>
<p class="person-name">${esc(v.personName)}</p>
<p>${esc(v.personBody)}</p>
<p class="person-links"><a href="${links.contact}">${esc(v.personContact)}</a> &#183; <a href="${links.orcid}">ORCID ${esc(v.personOrcid)}</a></p>
</div>`);
};

/* ------------------------------------------------------------------ *
 * K  what happens next. A date, not a peroration.                     *
 * ------------------------------------------------------------------ */

export const renderNext = (copy) => {
  const items = copy.next.items.map(([when, what]) =>
    `<li><span class="when">${esc(when)}</span><p class="what">${what}</p></li>`).join("");

  return sec("next", "sec-next", copy.next.number, copy.next.kicker, `<h2>${esc(copy.next.h2)}</h2>
<ol class="timeline">${items}</ol>
<p class="spine-tick spine-end">${esc(copy.whys.scaleLabelB)}</p>
<p class="closing">${esc(copy.next.closing)}</p>`);
};

/* ------------------------------------------------------------------ *
 * The document                                                        *
 * ------------------------------------------------------------------ */

/* `themeColor` is the palette's own ground (lib/theme.mjs `groundOf`), passed
   in rather than imported: the theme is a build parameter, so the tag that
   tells the browser what colour to paint its own chrome has to be one too. */
export const renderPage = (copy, { themeColor }) => {
  const alternate = copy.alternateDir === "en" ? en : zh;
  const nav = copy.nav.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join("");
  const noticeLabel = copy.footer.nav.find(([, key]) => key === "notice")[0];

  const footerNav = copy.footer.nav.map(([label, key]) => {
    const href = key === "statusJson" ? "../status.json" : key === "notice" ? "notice/" : links[key];
    return `<a href="${href}">${esc(label)}</a>`;
  }).join("");

  return `<!doctype html>
<html lang="${copy.htmlLang}">
${renderHead({
    description: copy.description, title: esc(copy.title), csp: "page",
    canonical: `${copy.dir}/`, alternates: true, assetRoot: "../", og: ogFor(copy),
    themeColor,
  })}
<body>
  <a class="skip" href="#main">${esc(copy.skip)}</a>
  <header class="topbar"><div class="shell bar-in">
    <a class="brand" href="#hero">${brandMark}<span>${esc(copy.brand.name)}</span><span class="brand-t">${esc(copy.brand.tagline)}</span></a>
    <nav class="site-nav" aria-label="${esc(copy.navLabel)}">${nav}</nav>
    <a class="lang" href="../${alternate.dir}/" hreflang="${alternate.htmlLang}">${esc(copy.languageLabel)}</a>
  </div></header>
  <main id="main">
    ${renderHero(copy)}
    ${renderWhy(copy)}
    ${renderObject(copy)}
    ${renderCheck(copy)}
    ${renderWhys(copy)}
    ${renderNumbers(copy)}
    ${renderKill(copy)}
    ${renderMachine(copy)}
    ${renderBoundary(copy)}
    ${renderVerify(copy)}
    ${renderNext(copy)}
  </main>
  <footer class="foot"><div class="shell">
    <p class="footer-status">${esc(copy.footer.status)}</p>
    <p class="no-mint">${esc(copy.footer.noMint)} &#183; <a href="notice/">${esc(noticeLabel)}</a></p>
    <nav aria-label="${esc(copy.footerNavLabel)}">${footerNav}</nav>
  </div></footer>
  <script src="../assets/app.js" defer></script>
</body>
</html>`;
};

export const renderNotice = (copy, { themeColor }) => `<!doctype html>
<html lang="${copy.htmlLang}">
${renderHead({
  description: copy.notice.h1, title: esc(copy.notice.title), csp: "static",
  canonical: `${copy.dir}/notice/`, assetRoot: "../../", robotsFirst: true, themeColor,
})}
<body><main class="notice-page"><div class="notice-inner">
${brandMark}
<p class="eyebrow">${esc(copy.brand.name)}</p>
<h1>${esc(copy.notice.h1)}</h1>
${copy.notice.body.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
<p class="notice-contact">${esc(copy.notice.contactLine)} <a href="${links.contact}">${esc(copy.verify.personContact)}</a></p>
<p class="hero-actions"><a class="button primary" href="../">${esc(copy.notice.back)}</a><a class="button" href="../../status.json">status.json</a></p>
</div></main></body>
</html>`;

export const renderRoot = ({ themeColor }) => `<!doctype html>
<html lang="en">
${renderHead({
  description: en.description, title: `${esc(en.brand.name)} &#8212; ${esc(en.gate.h1)}`, csp: "static",
  canonical: "", alternates: true, assetRoot: "", robotsFirst: true, compact: true, themeColor,
})}
<body><main class="language-gate"><div class="language-gate-inner">${brandMark}
<p class="eyebrow">${esc(en.brand.name)}</p><h1>${esc(en.gate.h1)}</h1>
<p>${esc(en.gate.line)}<br><span lang="${zh.htmlLang}">${esc(en.gate.lineZh)}</span></p>
<div class="hero-actions"><a class="button primary" href="en/">English</a><a class="button" lang="${zh.htmlLang}" href="zh/">&#31616;&#20307;&#20013;&#25991;</a></div>
<p class="gate-num"><code>${sym(heroRow.symbol)} = ${esc(heroRow.predicted)}</code></p>
</div></main></body></html>`;

/* Bilingual, like the root language gate: every other surface of this site is
   published in two languages, and the page a mistyped link lands on was the
   one place a Chinese reader met only English. zh.notFound was written and
   printed nowhere until 2026-08-30.

   Both bilingual shells sit in an <html lang="en">, so every Chinese run in
   them — the sentence and the button label — carries its own lang. Without it
   a screen reader speaks Chinese with English phonemes. This page also missed
   the CSP <meta> the other static pages carry; in production site/_headers
   covers every path either way, but a 404 opened from disk was not. */
export const notFound = ({ themeColor }) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="${assertThemeColour(themeColor)}"><meta http-equiv="Content-Security-Policy" content="${CSP.static}"><meta name="robots" content="noindex"><link rel="stylesheet" href="/assets/site.css"><title>${esc(en.notFound.kicker)} &#183; ${esc(en.brand.name)}</title></head><body><main class="language-gate"><div class="language-gate-inner"><p class="eyebrow">${esc(en.notFound.kicker)}</p><h1>${esc(en.notFound.h1)}</h1><p><span lang="${zh.htmlLang}">${esc(zh.notFound.h1)}</span></p><div class="hero-actions"><a class="button primary" href="/en/">${esc(en.notFound.back)}</a><a class="button" lang="${zh.htmlLang}" href="/zh/">${esc(zh.notFound.back)}</a></div></div></main></body></html>`;
