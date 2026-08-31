import assert from "node:assert/strict";

import { esc, colon } from "../html.mjs";
import { FIG } from "./order.mjs";
import { ADV, figWrap } from "./text.mjs";

/* ------------------------------------------------------------------ *
 * Figure for explain row 06 — the hypercharges, times six.            *
 *                                                                     *
 * No number below is typed. The seven fractions, the seven integers    *
 * and the seven names are lifted out of the row-06 sentence in each    *
 * deck, so the drawing cannot drift away from the prose it draws; the  *
 * multiplication is then recomputed and asserted, so a mis-parse can   *
 * only fail the build, never print a false equality.                   *
 * ------------------------------------------------------------------ */

export const HY_LIFT = 6;
export const HY_MINUS = "−";
/* .hy-narrow .hy-n, as site.css draws it. check/svgtext.mjs re-reads both
   numbers out of the stylesheet, so a change there fails the build here. */
export const HY_NOTE_SIZE = 9.5;
export const HY_NOTE_TRACK = 0.005;

/* Seven numbers in a row, separated by a comma or an ideographic comma.
   The row-06 body contains exactly two such runs: the hypercharges, then
   the integers. */
export const HY_RUN = /[−-]?\d+(?:\/\d+)?(?:\s*[,、]\s*[−-]?\d+(?:\/\d+)?){6}/g;
/* The name list is the em-dash aside; it is the one place the names appear. */
export const HY_NAMES = { en: /names — ([^—]+) —/, zh: /名字——([^—]+)——/ };

export const hyRational = (text) => {
  const match = String(text).match(/^([−-]?)(\d+)(?:\/(\d+))?$/);
  assert.ok(match, `row 06: unparseable hypercharge "${text}"`);
  const sign = match[1] ? -1 : 1;
  return { n: sign * Number(match[2]), d: match[3] ? Number(match[3]) : 1 };
};

export const hyRead = (copy) => {
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

/* The decks must be drawing the same seven numbers, and the integers the
   figure prints must really cancel the four anomalies. The build entry
   passes every deck it renders. */
export const assertHyperchargeDecks = (decks) => {
  /* Set equality, both directions at once. A deck key outside HY_KEYS is
     written and printed nowhere; a HY_KEYS entry the deck omits used to fall
     back to a module default with every gate green, which is the same failure
     turned around. Neither is possible now. */
  for (const copy of decks) {
    assert.deepEqual(Object.keys(copy.hypercharge ?? {}).sort(), [...HY_KEYS].sort(),
      `${copy.dir}: copy.hypercharge and HY_KEYS must be the same set of keys `
      + `(the figure prints every one of them, and nothing else)`);
    /* Resolve every printed string once here, so a missing one fails the build
       instead of reaching a reader as the word "undefined". */
    hyStrings(copy, FIG.hypercharge);
    assert.ok(String(copy.hypercharge.colOp).includes(String(HY_LIFT)),
      `${copy.dir}: the operator column head must still say ${HY_LIFT}`);
    assert.ok(/\bE8\b/.test(copy.hypercharge.ridesOn),
      `${copy.dir}: the figure's rides-on line no longer names E8`);
  }

  const reads = decks.map(hyRead);
  const a = reads[0];
  for (const b of reads.slice(1)) {
    assert.deepEqual(a.rows.map((r) => r.text), b.rows.map((r) => r.text),
      "row 06: the English and Chinese decks print different hypercharges");
    assert.deepEqual(a.rows.map((r) => r.integer), b.rows.map((r) => r.integer),
      "row 06: the English and Chinese decks print different integers");
  }


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
};

/* Two orientations of one table. The phone cannot hold a fourth column, so
   there the name drops to an indented grey line under its own row, still
   behind a rule of its own; nothing else changes. */
export const HY_GEO = {
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

/* Every string the figure prints, in the order it prints them, and — since
   2026-08-30 — the complete contract in BOTH directions: a deck key outside
   this list is written and never rendered, and a key in this list that a deck
   omits fails the build. There is no default layer any more.

   There used to be one, and eleven of the strings below lived only in it:
   intNoteA, nameNoteA/B, idxNote, idxNoteN, narrowNoteA/B and the four aria
   strings were invisible to the copy reviewers, untranslatable by the copy
   pass, and drifted — the plate's own foot note called the seven rows the
   SUBSTRATE's while the caption ten lines above called them the RING's. Every
   other figure module (sigma.mjs, imaginary.mjs, route.mjs, ruler.mjs) takes
   all of its words from the deck; so does this one now. */
export const HY_KEYS = [
  "kicker", "title",
  "colFrac", "colOp", "colInt", "colName",
  "intNoteA", "intNoteB", "nameNoteA", "nameNoteB",
  "idxNote", "narrowNote",
  "caption", "note", "tierClosed", "tierCond",
  "ridesOnLabel", "ridesOn",
  "ariaA", "ariaB", "ariaC", "ariaD",
];

/* One resolution for both the renderer and the gate. Deck only: a key the deck
   does not carry is a build failure, never the string "undefined" on a
   published page and never a module default quietly taking over. The
   placeholders {figure}, {lift} and {delta} are filled here so a reviewer edits
   one number in one place; the physics in the deck's own words is the
   manuscript's — the proof of the chiral-anomaly-dressing theorem reads
   "over-determined (two independent numerical fixes)", the third condition
   requiring only that the two lepton rows shift alike. */
export const hyStrings = (copy, figure) => {
  const delta = `δ = ${HY_MINUS}5`;
  const fill = (value) => (Array.isArray(value) ? value.map(fill) : String(value)
    .replaceAll("{figure}", String(figure))
    .replaceAll("{lift}", String(HY_LIFT))
    .replaceAll("{delta}", delta));

  const t = {};
  for (const key of HY_KEYS) {
    const value = copy.hypercharge?.[key];
    assert.ok(value !== undefined,
      `${copy.dir}: the hypercharge figure prints "${key}" and the deck does not carry it`);
    t[key] = fill(value);
  }
  return { t, delta };
};

export const renderHypercharge = (copy, { figure = FIG.hypercharge, linkCodes = esc } = {}) => {
  const { row, rows, fractions, integers, nameList } = hyRead(copy);
  const zhDeck = copy.dir === "zh";
  const listSep = zhDeck ? "、" : ", ";
  const { t, delta } = hyStrings(copy, figure);

  const aria = t.ariaA + fractions.join(listSep) + t.ariaB + integers.join(listSep)
    + t.ariaC + nameList.join(listSep) + t.ariaD;

  const plate = (key) => {
    const g = HY_GEO[key];
    const narrow = key === "narrow";
    const at = (index) => g.top + g.pitch / 2 + index * g.pitch;
    /* The phone's last name sits below its row, so the foot rule needs the
       extra leading or it cuts through the descenders. */
    const bottom = g.top + rows.length * g.pitch + (narrow ? 16 : 0);
    const noteLines = narrow
      ? [t.idxNote, t.narrowNote].reduce((sum, block) =>
        sum + figWrap(block, HY_NOTE_SIZE, g.w - 4, ADV.sans, HY_NOTE_TRACK).length, 0)
      : 0;
    const height = bottom + (narrow ? 56 + 13 * noteLines + 16 : 68);

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
      /* The phone's two foot notes are wrapped here, at the size and family the
         stylesheet draws them (.hy-narrow .hy-n: 9.5px --sans, tracked .005em)
         and against the plate's real width. They used to be hand-split into
         fixed lines in the copy, so the English pair ran 22 and 27 units past
         the viewBox and the phone cut them off mid-word. */
      let line = bottom + 56;
      for (const block of [t.idxNote, t.narrowNote]) {
        for (const text of figWrap(block, HY_NOTE_SIZE, g.w - 4, ADV.sans, HY_NOTE_TRACK)) {
          notes.push(note("", 0, line, esc(text)));
          line += 13;
        }
        line += 5;
      }
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

  /* The chips print the deck's own half-by-half labels — "closed · the
     integers", "conditional · the names" — not the bare tier word. Which half
     of the claim is closed is the entire reason this claim is split in two. */
  const chipText = { closed: t.tierClosed, conditional: t.tierCond };
  const chips = row.tags
    .map((state) => `<span class="tag ${state}">${esc(chipText[state])}</span>`).join("");

  return `<figure class="hy">
<p class="hy-k"><span>${esc(t.kicker)}</span>${esc(t.title)}</p>
${plate("wide")}${plate("narrow")}
<figcaption class="hy-cap">
<p class="hy-lead">${esc(t.caption)}</p>
<p class="hy-note">${esc(t.note)}</p>
<p class="hy-tier">${chips}</p>
<p class="hy-rides"><span>${esc(t.ridesOnLabel)}${colon(copy)}</span>${linkCodes(t.ridesOn)}</p>
</figcaption>
</figure>`;
};
