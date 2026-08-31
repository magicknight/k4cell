import assert from "node:assert/strict";

import { EDGES, ledger } from "../data.mjs";
import { esc } from "../html.mjs";

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

export const F = (value) => Number(value.toFixed(2));
export const POL = (cx, cy, r, deg) =>
  [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
export const ARC = (cx, cy, r, a0, a1) => {
  const [x0, y0] = POL(cx, cy, r, a0);
  const [x1, y1] = POL(cx, cy, r, a1);
  return `M ${F(x0)} ${F(y0)} A ${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 0 ${F(x1)} ${F(y1)}`;
};
/* An arrowhead for a marker travelling counter-clockwise. SVG's y runs down,
   so the screen tangent at angle t is (-sin t, -cos t). */
export const TIP = (cx, cy, r, deg, len = 12, half = 5.5) => {
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
export const clockOf = (n) => {
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

export const CLOCKS = new Map();
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
export const LOOP = [0, 1, 2, 3];
export const linkKey = (a, b) => (a < b ? `${a}${b}` : `${b}${a}`);
export const LOOP_EDGES = LOOP.map((site, step) => linkKey(site, LOOP[(step + 1) % LOOP.length]));
export const ALL_EDGES = EDGES.map(([a, b]) => linkKey(a, b));
assert.equal(LOOP.length, ledger.cell.sites, "the loop must visit every site exactly once");
assert.equal(new Set(LOOP_EDGES).size, ledger.cell.sites, "the loop must use one distinct link per hop");
for (const link of LOOP_EDGES) {
  assert.ok(ALL_EDGES.includes(link), `the drawn loop uses link ${link}, which the cell does not have`);
}
export const CHORDS = ALL_EDGES.filter((link) => !LOOP_EDGES.includes(link));
assert.equal(CHORDS.length, ledger.cell.edges - ledger.cell.sites,
  `${ledger.cell.edges} links minus a ${ledger.cell.sites}-hop cycle must leave ${ledger.cell.edges - ledger.cell.sites} chords`);
assert.deepEqual([...CHORDS].sort(), ["02", "13"], "the chords are the two links the loop does not use");

/* ---- the accumulated phase, walked rather than typed ---------------- */
export const phaseGlyph = ([re, im]) => (im === 0 ? (re > 0 ? "+1" : "−1") : (im > 0 ? "i" : "−i"));
export const PHASE = [];
export const REAL = [];
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
export const AV = [[90, 266], [270, 266], [270, 86], [90, 86]];
export const AOUT = [[56, 300], [304, 300], [304, 62], [56, 62]];
export const AMUL = [[180, 294, "middle"], [298, 181, "start"], [180, 68, "middle"], [62, 181, "end"]];
export const AHOP = [[180, 240], [244, 177], [180, 114], [116, 177]];
assert.equal(AV.length, ledger.cell.sites, "the drawing must have one corner per site");

export const panelLoop = (x) => {
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
export const BC = [180, 168];
export const BR = 105;
export const BIN = 66;

export const panelClock = () => {
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
export const renderImaginaryFigure = (copy) => {
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
