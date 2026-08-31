import assert from "node:assert/strict";

import { ledger, resolvedDigitsOf } from "../data.mjs";
import { esc } from "../html.mjs";
import { FIG } from "./order.mjs";
import { splitNumber } from "./digits.mjs";
import { ADV, bracketDown, bracketRight, bracketUp, figWidth, round1, svgLines, svgText } from "./text.mjs";

/* ==================================================================== *
 * FIGURE - the digit ruler: where the experiment runs out.             *
 * m_μ/m_e digit by digit (panel A, two orientations) plus λ_C and      *
 * sin²θ_W on one shared axis (panel B). Needs copy.figures.ruler,       *
 * copy.hero.rulerComputed/rulerMeasured/rulerLabel/rulerCut/          *
 * rulerGhost and copy.ledger.exactNote.                                 *
 * ==================================================================== */

export const significand = (text) => {
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
export const rationalDigits = (expr, count) => {
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
export const rulerRow = (row, columns) => {
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

/* ---- panel A, landscape ---------------------------------------------- */

/* The left gutter of panel A holds three right-anchored labels — computed,
   measured, and the axis name — set in .fr-lab: 11.5px --mono, tracked .05em.
   It used to be a hard 120 units, and the English axis name "significant
   digit" measures 127, so the plate's own viewBox clipped its first letter and
   the desktop read "ignificant digit". The gutter is therefore measured, not
   assumed; the plate widens by exactly what the gutter took, so the right-hand
   block (the sigma span runs to within 13 units of the edge) keeps its margin.
   Chinese needs 60 units and comes out byte for byte as before. */
export const FR_LAB_SIZE = 11.5;
export const FR_LAB_TRACK = 0.05;
export const rulerGutter = (copy) => Math.max(120, Math.ceil(Math.max(
  ...[copy.hero.rulerComputed, copy.hero.rulerMeasured, copy.figures.ruler.axisName]
    .map((label) => figWidth(label, FR_LAB_SIZE, ADV.mono, FR_LAB_TRACK)),
)) + 4);

export const rulerPanelWide = (row, copy, letter) => {
  const t = copy.figures.ruler;
  const N = row.computed.length;
  const labX = rulerGutter(copy);
  const cell = 32, X0 = labX + 12, PT = 13, W = 760 + (X0 - 132);
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
${svgText(labX, yC, "fr-lab fr-end", esc(copy.hero.rulerComputed))}${svgText(labX, yM, "fr-lab fr-end", esc(copy.hero.rulerMeasured))}${svgText(labX, yPos, "fr-lab fr-end", esc(t.axisName))}
${point}${digits(row.computed, yC, "fr-d-tail")}${row.endless ? svgText(right + 8, yC, "fr-d-tail fr-inf", "&#8230;&#8734;") : ""}
${digits(row.measured, yM, "fr-d-past")}${voids}${svgText(right + 12, yM, "fr-sig", esc(row.sigmaText))}
<line class="fr-axis" x1="${round1(xl(1))}" y1="${yAxis}" x2="${round1(right)}" y2="${yAxis}"/>${ticks}${posns}
${bracketUp(cut, right, ySig, "fr-brk-sig")}
${svgText(cut + 4, 186, "fr-note fr-note-sig", esc(t.sigmaSpan.replace("{s}", row.sigmaText).replace("{k}", String(row.resolved + 1))))}
${svgText(cut - 8, 214, "fr-note fr-note-cut fr-end", esc(t.cutLabel.replace("{n}", String(row.resolved))))}
</svg>`;
};

/* ---- panel A, portrait ------------------------------------------------ */

export const rulerPanelTall = (row, copy, letter) => {
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

export const rulerPanelPair = (rows, copy, letter, wide) => {
  const t = copy.figures.ruler;
  const N = Math.max(...rows.map((r) => r.computed.length));
  const W = wide ? 760 : 360;
  const cell = wide ? 34 : 27;
  const X0 = wide ? Math.max(226, rulerGutter(copy) + 94) : 44;
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

export const renderRulerFigure = (copy, options = {}) => {
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

  const number = options.n ?? FIG.ruler;
  const caption = [
    `<b class="fig-n">${esc(t.figWord)} ${number}</b>`,
    esc(`${copy.hero.rulerLabel}${t.stop}`),
    esc(t.capA
      .replace("{sym}", lead.symbol)
      .replace("{N}", String(lead.computed.length))
      /* The caption quotes the label the plate actually draws (both plates
         use t.cutLabel), not the hero readout's own wording. The two are
         identical in Chinese, so quoting the wrong one was invisible there
         and printed a label the English plate never draws. */
      .replace("{cut}", t.cutLabel.replace("{n}", String(lead.resolved)))
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
