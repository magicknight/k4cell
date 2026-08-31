/* ------------------------------------------------------------------ *
 * STRUCTURE GATES — the pins on the page's own DOM and on the copy    *
 * decks that describe it. Rewritten with the 2026-08-30 architecture. *
 *                                                                     *
 * Two kinds of gate live here and nothing else does:                  *
 *   (a) NUMERIC SEMANTICS. The lit/ghost digit split must equal the    *
 *       ledger's resolvedDigits, per row and per side; the hero's      *
 *       promoted readout must light exactly its own resolved digits;   *
 *       81 states must be server-rendered.                             *
 *   (b) THE CONTRACTS the page cannot be read without: the interactive *
 *       hooks app.js binds to, the eleven claims and their tiers, the  *
 *       sentences the honest boundary is made of, and the colour       *
 *       semantics of the stylesheet.                                   *
 *                                                                     *
 * Gates that only pinned the OLD layout (the concept-art plate, the    *
 * anchor band, the colophon block, the four chips, the two epigraphs,  *
 * the holography rebuttal, the xrow/xdef vocabulary) are gone; where    *
 * one carried a meaning rather than a layout, the meaning is re-        *
 * expressed against the new markup below.                              *
 * ------------------------------------------------------------------ */

import assert from "node:assert/strict";

import { chinese, css, decks, english, javascript, ledger, textOf } from "./common.mjs";

const pages = [["en", english], ["zh", chinese]];
const deckOf = (name) => decks.find((deck) => deck.dir === name);

/* Escape a copy string so it can be searched for inside rendered HTML. */
const escaped = (value) => String(value)
  .replaceAll("&", "&amp;").replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/* One <article> block, addressed by an attribute. Non-greedy, so a block never
   swallows the next one. */
const blockOf = (page, attribute) => {
  const match = page.match(new RegExp(`${attribute}[\\s\\S]*?</article>`));
  return match ? match[0] : null;
};
const countOf = (text, cls) => (text.match(new RegExp(`class="${cls}(?=[" ])`, "g")) ?? []).length;

/* ================================================================== *
 * 1. The argument is server-rendered: no JavaScript, no missing half. *
 * ================================================================== */

for (const [name, page] of pages) {
  assert.match(page, /class="st" data-sig=/, `${name}: the 81 states must be server-rendered`);
  assert.match(page, /class="d-lit"/, `${name}: resolved digits must be server-rendered`);
  assert.match(page, /class="d-ghost"/, `${name}: the untestable tail must be server-rendered`);
  assert.match(page, /class="figr"/, `${name}: the digit-ruler figure must be server-rendered`);
  assert.match(page, /class="fr-cut"/, `${name}: the figure must draw where the experiment stops resolving`);
  assert.match(page, /class="sg-fig"/, `${name}: the sigma axis must be server-rendered`);
  /* Both claim-row figures are inserted by a name written in the deck. Nothing
     pinned them, so dropping that name would have taken Fig. 2 and Fig. 3 off
     the page — including the tier labels claim 06 is split by — in silence. */
  assert.match(page, /class="ifig"/, `${name}: the imaginary-unit figure must be server-rendered`);
  assert.match(page, /class="hy"/, `${name}: the hypercharge figure must be server-rendered`);
  assert.ok((page.match(/class="pullbar"/g) ?? []).length >= 8,
    `${name}: every comparable row must carry its pull bar`);
}

export const stateCount = (english.match(/class="st" data-sig=/g) ?? []).length;
assert.equal(stateCount, 81, "exactly 81 basis states must be rendered");

/* ================================================================== *
 * 2. NUMERIC SEMANTIC: the lit/ghost split IS resolvedDigits.         *
 * ================================================================== */

for (const [name, page] of pages) {
  for (const row of ledger.gaussian) {
    const block = blockOf(page, `data-row="${row.id}"`);
    assert.ok(block, `${name}/${row.id}: ledger row is not rendered`);
    const sides = block.split(/class="rlab"/).slice(1);
    assert.equal(sides.length, 2, `${name}/${row.id}: expected a computed and a measured line`);
    if (!row.noPull) {
      assert.equal(countOf(sides[0], "d-lit"), row.resolvedDigits,
        `${name}/${row.id}: computed line lights ${countOf(sides[0], "d-lit")} digits, resolvedDigits is ${row.resolvedDigits}`);
      assert.equal(countOf(sides[1], "d-lit"), row.resolvedDigits,
        `${name}/${row.id}: measured line lights ${countOf(sides[1], "d-lit")} digits, resolvedDigits is ${row.resolvedDigits}`);
      assert.ok(countOf(sides[0], "d-ghost") > 0 || row.predictedExact,
        `${name}/${row.id}: a committed tail must be marked as untestable`);
    } else {
      assert.equal(countOf(sides[0], "d-lit"), 0,
        `${name}/${row.id}: a no-pull row must light no computed digit`);
    }
  }
}

/* The hero promotes one row to display size. It must light exactly that row's
   resolved digits — no more, or the first screen overclaims by a digit. */
const heroRow = ledger.gaussian.find((row) => row.id === "mu_e");
for (const [name, page] of pages) {
  const hero = page.match(/<section id="hero"[\s\S]*?<\/section>/);
  assert.ok(hero, `${name}: the first screen is missing`);
  const ruler = hero[0].match(/class="ruler ruler-hero"[\s\S]*?<\/figure>/);
  assert.ok(ruler, `${name}: the hero readout is missing`);
  const sides = ruler[0].split(/class="rlab"/).slice(1);
  assert.equal(sides.length, 2, `${name}: the hero readout needs a computed and a measured line`);
  assert.equal(countOf(sides[0], "d-lit"), heroRow.resolvedDigits,
    `${name}: the hero lights ${countOf(sides[0], "d-lit")} computed digits, resolvedDigits is ${heroRow.resolvedDigits}`);
  assert.equal(countOf(sides[1], "d-lit"), heroRow.resolvedDigits,
    `${name}: the hero lights ${countOf(sides[1], "d-lit")} measured digits, resolvedDigits is ${heroRow.resolvedDigits}`);
  assert.ok(countOf(sides[0], "d-ghost") > 0, `${name}: the hero must mark the untestable tail`);
}

/* Every numeric row is addressable, and data-row lives in the numbers section
   only — the section-order pin, re-expressed. */
for (const [name, page] of pages) {
  const section = page.match(/<section id="numbers"[\s\S]*?<\/section>\s*<section id="kill"/);
  assert.ok(section, `${name}: the numbers section is missing or out of order`);
  const rows = [...ledger.gaussian, ...ledger.diagnostics, ...ledger.bounds];
  assert.equal((page.match(/ data-row="/g) ?? []).length, rows.length,
    `${name}: exactly ${rows.length} rows carry data-row`);
  assert.equal((section[0].match(/ data-row="/g) ?? []).length, rows.length,
    `${name}: every data-row must live inside the numbers section`);
  for (const row of rows) {
    assert.ok(page.includes(`id="l-${row.id}" data-row="${row.id}"`),
      `${name}/${row.id}: the row must carry its own anchor`);
  }
}

/* ================================================================== *
 * 3. THE HERO'S HONESTY. The promoted number's tier is not typed; it   *
 *    is read off that row's own open interfaces, and the chip must     *
 *    link to the row it was lifted from.                               *
 * ================================================================== */

const heroTiers = heroRow.interfaces.length ? ["conditional"] : ["closed"];
for (const [name, page] of pages) {
  const caption = page.match(/<figcaption class="hero-tier">[\s\S]*?<\/figcaption>/);
  assert.ok(caption, `${name}: the hero readout must carry its evidence tier`);
  const printed = [...caption[0].matchAll(/<span class="tag ([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(printed, heroTiers,
    `${name}: the hero prints tiers ${printed.join(",")}, but ${heroRow.id} rides on [${heroRow.interfaces.join(",")}]`);
  assert.match(caption[0], new RegExp(`href="#l-${heroRow.id}"`),
    `${name}: the hero's tier chip must link to the claim row it was lifted from`);
  const deck = deckOf(name);
  const label = Object.fromEntries(deck.tiers.key.map(([id, text]) => [id, text]));
  for (const tier of heroTiers) {
    assert.ok(caption[0].includes(escaped(label[tier])),
      `${name}: the hero tag must print the deck's own word for "${tier}"`);
  }
}

/* The chip's own sentence reaches the reader unrewritten. The tier word at its
   head is dropped, and only that, because the tag beside it prints the same
   word; the deck itself carries no interface code any more, so the page needs
   no silent edit to keep the first screen clear of one. */
for (const [name, page] of pages) {
  const deck = deckOf(name);
  const caption = page.match(/<figcaption class="hero-tier">[\s\S]*?<\/figcaption>/)[0];
  assert.doesNotMatch(deck.hero.tierChip, /\bE(?:1[01]|[1-9])\b/,
    `${name}: hero.tierChip carries an interface code; the deck, not the template, must drop it`);
  let clause = deck.hero.tierChip;
  for (const [, label] of deck.tiers.key) {
    const head = new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[·–—:：]\\s*`);
    if (head.test(clause)) { clause = clause.replace(head, ""); break; }
  }
  assert.ok(caption.includes(escaped(clause)),
    `${name}: the hero tier chip must print its clause in full: "${clause}"`);
}

/* An interface code is a thing you look up, not the second thing you read.
   It is allowed in the rows that explain it and nowhere near the first screen. */
for (const [name, page] of pages) {
  const hero = page.match(/<section id="hero"[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(textOf(hero), /\bE(?:1[01]|[1-9])\b/,
    `${name}: no interface code may appear on the first screen`);
  for (const body of page.match(/<p class="wbody">[\s\S]*?<\/p>/g) ?? []) {
    assert.doesNotMatch(textOf(body), /\bE(?:1[01]|[1-9])\b/,
      `${name}: an interface code leaked into a claim's plain-language answer`);
  }
  for (const lede of page.match(/<p class="lede">[\s\S]*?<\/p>/g) ?? []) {
    assert.doesNotMatch(textOf(lede), /\bE(?:1[01]|[1-9])\b/,
      `${name}: an interface code leaked into a section lede`);
  }
}

/* ================================================================== *
 * 4. The eleven claims.                                               *
 * ================================================================== */

for (const [name, page] of pages) {
  const deck = deckOf(name);
  assert.equal((page.match(/class="wrow"/g) ?? []).length, 11, `${name}: eleven claim rows must render`);
  assert.equal((page.match(/id="w-\d\d"/g) ?? []).length, 11, `${name}: every claim row must carry its anchor`);
  const tiers = new Set(deck.tiers.key.map(([id]) => id));
  for (const row of deck.whys.rows) {
    const block = blockOf(page, `id="w-${row.n}"`);
    assert.ok(block, `${name}/${row.n}: claim row missing`);
    const printed = [...block.matchAll(/<span class="tag ([a-z]+)"/g)].map((m) => m[1]);
    assert.deepEqual(printed, row.tags, `${name}/${row.n}: the row must print exactly its own tiers`);
    for (const tag of row.tags) assert.ok(tiers.has(tag), `${name}/${row.n}: unknown tier "${tag}"`);
    assert.match(block, /class="wrides"/, `${name}/${row.n}: the row must say what it rides on`);
    assert.match(block, /class="wcheck"/, `${name}/${row.n}: the row must say where to check it`);
    assert.ok(block.includes(escaped(row.scale)), `${name}/${row.n}: the row must print its own scale`);
    /* One repeatable sentence per card, above the mechanism. Without it the
       card is a technical paragraph and acceptance §7.4 fails. */
    assert.match(block, /class="wlead"/, `${name}/${row.n}: the claim must lead with one plain sentence`);
    assert.ok(block.includes(escaped(row.lead)), `${name}/${row.n}: the lead must print the deck's own sentence`);
  }
  /* MANDATORY, spec §8.1: the strip's left-hand end reads 10^-35 m beside the
     cell, and this is the sentence saying that length is a unit that was set,
     not a result that was derived. Unrendered, it is exactly what the "Planck
     length" ban exists to prevent. It was written in both decks and printed
     nowhere until 2026-08-30, so it is pinned here — visible, never folded. */
  assert.ok(page.includes(escaped(deck.whys.scaleNote)),
    `${name}: the scale strip must carry its qualifying sentence`);
  assert.match(page, /<p class="fine scale-note">/, `${name}: the scale note must not be folded away`);
  /* Never collapse a two-tier claim to its stronger half. */
  for (const n of ["02", "03", "05", "06", "08"]) {
    const block = blockOf(page, `id="w-${n}"`);
    assert.equal((block.match(/<span class="tag /g) ?? []).length, 2,
      `${name}/${n}: a split-tier claim must print both tiers`);
  }
  /* The tier key is taught on the page, in the author's own words, beside the
     first claims that use it. This replaces the old verbatim "closed"
     definition block: same job, one sentence per tier instead of a clause. */
  for (const [, , plain] of deck.tiers.key) {
    assert.ok(page.includes(escaped(plain)), `${name}: the tier key must print "${plain.slice(0, 24)}…"`);
  }
  /* ONE FOLD LABEL PER PAGE. Seventeen <details> open the same kind of thing —
     where to go and check a claim — and the English page labelled eleven of
     them "check it at" and six "Where to check". Read alone on its own line,
     "check it at" is a fragment: check it at what? The Chinese page has always
     used 「去查」 for all seventeen. */
  const folds = [...new Set([...page.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map((m) => m[1]))];
  assert.equal(folds.length, 1,
    `${name}: every fold on the page opens the same kind of thing and must carry `
    + `the same label; found ${folds.length}: ${folds.map((f) => `"${f}"`).join(", ")}`);
  assert.equal((page.match(/<summary>/g) ?? []).length, 17,
    `${name}: eleven claim cards and six falsifier cards fold; that is seventeen labels`);
}

/* `explain` is a derived view of `whys` that the figure generators and the
   integrity gates still read. If the two drift, one of them is a lie. */
for (const deck of decks) {
  assert.equal(deck.explain.rows.length, deck.whys.rows.length, `${deck.dir}: derived view has the wrong length`);
  deck.whys.rows.forEach((row, index) => {
    const derived = deck.explain.rows[index];
    assert.equal(derived.n, row.n, `${deck.dir}/${row.n}: derived view is out of order`);
    assert.deepEqual(derived.tags, row.tags, `${deck.dir}/${row.n}: derived tiers disagree`);
    assert.equal(derived.h3, row.q, `${deck.dir}/${row.n}: derived question disagrees`);
    assert.equal(derived.body, row.answer, `${deck.dir}/${row.n}: derived body disagrees`);
    assert.equal(derived.ridesOn, row.rides, `${deck.dir}/${row.n}: derived rides-on disagrees`);
    assert.equal(derived.checkAt, row.check, `${deck.dir}/${row.n}: derived check-at disagrees`);
  });
  /* The rest of the derived view, same reason. The route figure used to have a
     second copy of its own deck (copy.route beside copy.boundary.route); the
     figure now reads what the page renders, so there is nothing left to pin. */
  assert.deepEqual(deck.explain.tagKey, deck.tiers.key, `${deck.dir}: derived tier key disagrees`);
  assert.equal(deck.explain.ridesOnLabel, deck.whys.ridesLabel, `${deck.dir}: derived rides-on label disagrees`);
  assert.equal(deck.explain.checkLabel, deck.whys.checkLabel, `${deck.dir}: derived check label disagrees`);
  assert.equal(deck.route, undefined, `${deck.dir}: copy.route is a second copy of boundary.route`);
}

/* The route block says two different things in two places: the paragraph
   argues the section, the caption describes the drawing. They used to be the
   same 139-word paragraph, printed twice with only the plate between them. */
for (const [name, page] of pages) {
  const deck = deckOf(name);
  const route = deck.boundary.route;
  const count = (needle) => page.split(escaped(needle)).length - 1;
  assert.equal(count(route.intro), 1,
    `${name}: boundary.route.intro is printed ${count(route.intro)} times; the section paragraph and the figure caption must not be the same words`);
  assert.equal(count(route.figCaption), 1,
    `${name}: the route figure must print its own caption exactly once`);
  assert.notEqual(route.figCaption, route.intro,
    `${name}: boundary.route.figCaption is a copy of the section paragraph`);
  assert.match(page, /<figcaption class="fig-cap"><p><b>[^<]*<\/b>/,
    `${name}: the route figure must carry a numbered caption`);
}

/* The second tier chip. It goes through the same silent-rewrite helper as the
   hero's and, until 2026-08-30, through no gate at all: its tier was typed
   "conditional" rather than read off the row, and nothing checked that its
   sentence reached the reader whole or that it carried no interface code. */
const lambdaCRow = ledger.gaussian.find((row) => row.id === "lambda_c");
const checkTier = lambdaCRow.interfaces.length ? "conditional" : "closed";
for (const [name, page] of pages) {
  const deck = deckOf(name);
  const chip = page.match(/<p class="check-tier">[\s\S]*?<\/p>/);
  assert.ok(chip, `${name}: the 9/40 division must carry its evidence tier`);
  const printed = [...chip[0].matchAll(/<span class="tag ([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(printed, [checkTier],
    `${name}: the division prints tier ${printed.join(",")}, but ${lambdaCRow.id} rides on [${lambdaCRow.interfaces.join(",")}]`);
  const label = Object.fromEntries(deck.tiers.key.map(([id, text]) => [id, text]));
  assert.ok(chip[0].includes(escaped(label[checkTier])),
    `${name}: the division's tag must print the deck's own word for "${checkTier}"`);
  assert.doesNotMatch(deck.checkIt.tierChip, /\bE(?:1[01]|[1-9])\b/,
    `${name}: checkIt.tierChip carries an interface code; the deck, not the template, must drop it`);
  let clause = deck.checkIt.tierChip;
  for (const [, text] of deck.tiers.key) {
    const head = new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[·–—:：]\\s*`);
    if (head.test(clause)) { clause = clause.replace(head, ""); break; }
  }
  assert.ok(chip[0].includes(escaped(clause)),
    `${name}: the division's tier chip must print its clause in full: "${clause}"`);
}

/* ================================================================== *
 * 5. The controls app.js binds to. Renaming one of these silently      *
 *    turns an interaction into dead markup, so they are pinned here    *
 *    and in tests/browser_check.py together.                           *
 * ================================================================== */

for (const [name, page] of pages) {
  assert.equal((page.match(/class="qfilter" data-sig="all"/g) ?? []).length, 1,
    `${name}: exactly one filter must reset the 81-state grid`);
  assert.ok((page.match(/class="qfilter" data-sig=/g) ?? []).length >= 5,
    `${name}: one filter per colouring class, plus the reset`);
  assert.match(page, /class="button qsweep" data-done="/, `${name}: the sweep must announce its own result`);
  assert.match(page, /class="qlive" data-live/, `${name}: the sweep needs its live region`);
  assert.match(page, /<ol class="steps" data-step="[^"]+" data-reset="[^"]+">/, `${name}: the division must carry its labels`);
  assert.equal((page.match(/<ol class="steps"[\s\S]*?<\/ol>/)[0].match(/<li>/g) ?? []).length, 6,
    `${name}: the division must be complete without JavaScript`);
  assert.equal((page.match(/class="gap" data-carries="[^"]*" data-code="/g) ?? []).length, 5,
    `${name}: five named interfaces must be drawn as gaps`);
  assert.equal((page.match(/class="gap-toggle"/g) ?? []).length, 0,
    `${name}: no dead control may ship without JavaScript`);
  const route = page.match(/<section id="deeper" class="[^"]*\broute\b[^"]*"[\s\S]*?<\/section>/);
  assert.ok(route, `${name}: the kill switch's owning section must carry the class app.js looks for`);
  assert.match(route[0], /data-killswitch/, `${name}: the kill switch must live inside that section`);
  assert.match(route[0], /data-kill-on/, `${name}: the kill switch needs its two labels`);
  assert.match(route[0], /data-kill-off/, `${name}: the kill switch needs its two labels`);
  assert.equal((page.match(/class="kcard" data-grade="/g) ?? []).length, 6,
    `${name}: six falsifiers must render, each graded`);
}
assert.match(javascript, /closest\("\.route"\)/, "app.js still scopes the kill switch to .route");

/* ================================================================== *
 * 6. Navigation and metadata.                                          *
 * ================================================================== */

for (const [name, page] of pages) {
  const deck = deckOf(name);
  assert.equal(deck.nav.length, 5, `${deck.dir}: the nav is five items`);
  for (const [id] of deck.nav) {
    assert.match(page, new RegExp(`<a href="#${id}">`), `${name}: the nav must link to #${id}`);
    assert.match(page, new RegExp(`<section id="${id}"`), `${name}: #${id} must exist`);
  }
  const title = page.match(/<title>([\s\S]*?)<\/title>/)[1];
  const og = page.match(/og:title" content="([^"]*)"/)[1];
  assert.equal(title, og, `${name}: <title> and og:title must agree`);
  /* Identity, review state and archive all still reach the reader — the job
     the old colophon did, without the colophon. */
  for (const line of deck.hero.byline) {
    assert.ok(page.includes(escaped(line)), `${name}: the byline must render in full`);
  }
  assert.ok(page.includes(escaped(deck.footer.status)), `${name}: the review state must render`);
  assert.ok(page.includes(ledger.artifact.sha256), `${name}: the archive checksum must render`);
  assert.ok(page.includes(escaped(deck.next.closing)), `${name}: the closing line must render`);
}

/* The two languages must ship the same page, not two different pages. */
const shape = (page) => ({
  wrows: (page.match(/class="wrow"/g) ?? []).length,
  lrows: (page.match(/ data-row="/g) ?? []).length,
  kcards: (page.match(/class="kcard" data-grade="/g) ?? []).length,
  tags: (page.match(/<span class="tag /g) ?? []).length,
  sections: (page.match(/<section id="/g) ?? []).length,
});
assert.deepEqual(shape(english), shape(chinese), "the two languages must render the same structure");

/* ================================================================== *
 * 7. The sentences the honest boundary is made of.                     *
 * ================================================================== */

const mustSay = [
  ["not peer reviewed", /未经同行评议/],
  ["K4V has not launched", /K4V 尚未发行/],
  ["It is not an empirical claim about nature", /核验断言的是逻辑结构，不是自然界/],
  ["The cosmological-constant problem is not solved here", /这里没有解决宇宙学常数问题/],
  ["26 to 28 once neutrino masses are included", /26 到 28 个/],
  ["finite K4 substrate → faithful physical realization", /有限 K4 基底 → 忠实物理实现/],
  ["What is not derived", /哪些还没有推出来/],
];
for (const [enPhrase, zhPattern] of mustSay) {
  assert.ok(english.includes(enPhrase), `en: "${enPhrase}" must appear`);
  assert.match(chinese, zhPattern, `zh: ${zhPattern} must appear`);
}

/* The editorial never-say list: the vocabulary of the crank, and the labels
   the author's own glossary bans. Checked against the printed text, so an SVG
   coordinate or a class name can never trip it. */
const printed = `${textOf(english)}\n${textOf(chinese)}`;
for (const banned of [
  /万物理论/, /终极理论/, /颠覆/, /推翻/, /震惊/, /革命性/, /天才/, /诺贝尔/,
  /theory of everything/i, /ultimate theory/i, /revolutionary/i, /paradigm shift/i,
  /独立研究者/, /梁志华/, /全息/,
]) {
  assert.doesNotMatch(printed, banned, `editorial never-say list: ${banned}`);
}

/* ================================================================== *
 * 8. Colour semantics of the stylesheet itself.                        *
 * ================================================================== */

/* Uppercase-and-tracked Latin small caps were the old page's audit-cover
   voice. The tracking stays; the transform does not. */
assert.doesNotMatch(css, /text-transform:\s*uppercase/,
  "site.css must not shout: no text-transform: uppercase anywhere");

/* --alert is the warning colour and means one thing: this is how the framework
   dies. It may only be reached for inside the falsifier section. Everything
   the figures draw in a warm line — a cut, a hole, a 3 sigma rule — is --cut. */
const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");
const strayAlert = [];
for (const rule of rules.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  /* .sec-kill, not "kill": /kill/ also matched .killswitch and its note, which
     live in the boundary section, so the warning colour could have escaped
     into §I with this gate still green. */
  if (/var\(--alert/.test(rule[2]) && !/\.sec-kill\b/.test(rule[1])) strayAlert.push(rule[1].trim());
}
assert.deepEqual(strayAlert, [],
  `the warning colour escaped the falsifier section: ${strayAlert.join(" / ")}`);
assert.ok(css.includes("--cut:"), "the figures' warm line needs its own token");

/* And its mirror. The accent and the warning colour are the page's two warm
   values and they must never share a surface: on the shipping palette they sit
   33.6 degrees apart in hue, which is close enough that an ochre number beside
   a red threshold on the falsifier plate would read as one family. Today no
   rule does it. This is what keeps that true without anyone having to
   remember the hue angle. */
/* The page has exactly one inverted ground, and a palette that inverts has to
   re-ink everything drawn on it (themes/<name>.overrides.css). A SECOND dark
   ground appearing later would inherit no such remap and would render the
   page's own ink on the page's own ink. So --bg-kill may only be painted
   inside the section the overrides file scopes. */
const strayGround = [];
for (const rule of rules.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (/background[^;]*var\(--bg-kill/.test(rule[2]) && !/\.sec-kill\b/.test(rule[1])) strayGround.push(rule[1].trim());
}
assert.deepEqual(strayGround, [],
  `a second inverted ground: ${strayGround.join(" / ")} paints --bg-kill outside .sec-kill, which is the only section a palette re-inks`);

const warmInKill = [];
for (const rule of rules.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (/var\(--(?:fact|cut)/.test(rule[2]) && /\.sec-kill\b/.test(rule[1])) warmInKill.push(rule[1].trim());
}
assert.deepEqual(warmInKill, [],
  `the accent is painted inside the falsifier section, where the warning colour lives: ${warmInKill.join(" / ")}`);

/* --fact/--cut mean "this is a number". --link is the only colour that means
   "click". One inline link was painted --cut, so the same E8 link was blue in
   claim 06's card and amber in the figure fifteen lines below it. */
const strayLink = [];
for (const rule of rules.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (!/(?:^|;)\s*color\s*:\s*var\(--(?:fact|cut)/.test(rule[2])) continue;
  const anchors = rule[1].split(",").map((s) => s.trim())
    .filter((selector) => /(?:^|[\s>+~])a(?:[.:#[]|$)/.test(selector));
  if (anchors.length) strayLink.push(anchors.join(" / "));
}
assert.deepEqual(strayLink, [],
  `a link is painted in the accent; --link is the only colour that means click: ${strayLink.join(" / ")}`);

/* THE ENGLISH PAGE'S FONT STACK. A CJK face renders U+2019 and U+201C/D at
   full width, so with --han in front every apostrophe on the English page came
   out with a space inside it (author’ s). The cure is one attribute selector,
   and it is one rename away from reverting with all three suites green. */
assert.match(css, /html\[lang=en\]\s*\{[^}]*--sans:\s*var\(--lat\)/,
  "the English page must switch --sans to the Latin-first stack");
assert.match(css, /--lat:\s*system-ui/, "--lat must lead with a Latin system face");
for (const deck of decks) {
  assert.equal(deck.htmlLang, deck.dir === "zh" ? "zh-Hans" : "en",
    `${deck.dir}: htmlLang is "${deck.htmlLang}"; html[lang=en] in site.css matches "en" exactly`);
}
