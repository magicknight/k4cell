import assert from "node:assert/strict";

import { ledger } from "../data.mjs";
import { esc } from "../html.mjs";

/* ==================================================================== *
 * Figure 04·1 — THE SIGMA AXIS.                                          *
 * Eleven rows on one σ scale: a build-time beeswarm in two orientations *
 * with a caption sliced out of the deck prose. Needs copy.ledger.sigma  *
 * (SIGMA_KEYS) and the anchors named in sigmaCaption().                 *
 * ==================================================================== */

export const SIGMA_KEYS = ["figNumber", "figTitle", "laneKeys", "noDigits", "bandTag", "ruleTag",
  "keyTitle", "keyPull", "keyCond", "keyDiag", "keyBand", "keyRule", "noneTag", "keyNone",
  "ariaLead", "ariaOff", "ariaWorst"];
/* The build entry passes every deck it renders. */
export const assertSigmaDecks = (decks) => {
for (const copy of decks) {
  for (const key of SIGMA_KEYS) {
    assert.ok(copy.ledger.sigma?.[key], `${copy.dir}: ledger.sigma is missing "${key}"`);
  }
  assert.equal(copy.ledger.sigma.laneKeys.length, 3,
    `${copy.dir}: ledger.sigma.laneKeys must name exactly three lanes`);
}
};

export const SIGMA_MAX = 4;

/* One pass over the ledger builds the plot model. Nothing below may type
   a number that did not come out of here. */
export const sigmaModel = () => [
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

export const sigmaRows = sigmaModel();
export const sigmaLaneCount = { a: 0, b: 0, c: 0 };
for (const row of sigmaRows) sigmaLaneCount[row.lane] += 1;

/* ---- honesty gate --------------------------------------------------- *
 * The drawing is an argument about eleven numbers. These refuse to build
 * it if the numbers stop supporting the argument. */
assert.equal(sigmaRows.length, 11, `the σ axis must carry all eleven rows, built ${sigmaRows.length}`);
assert.equal(new Set(sigmaRows.map((r) => r.id)).size, 11, "a row is plotted twice on the σ axis");
assert.equal(sigmaLaneCount.a + sigmaLaneCount.b + sigmaLaneCount.c, 11,
  "the three lane counts must sum to eleven");

export const sigmaPlotted = sigmaRows.filter((r) => r.value !== null);
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
export const sigmaOff = sigmaRows.filter((r) => r.offScale);
assert.equal(sigmaOff.length, 1, "expected exactly one row that commits no digits");
assert.equal(sigmaOff[0].id, "alpha_s");
assert.equal(sigmaOff[0].value, null, "a row that commits no digits may not be plotted at zero");

/* The argument of the figure: the worst row is alone past the 3 σ rule. */
export const sigmaWorst = sigmaRows.find((r) => r.worst);
assert.ok(sigmaWorst, "ledger.diagnostics no longer marks a worst row");
assert.ok(sigmaWorst.value >= 3,
  `the worst row is ${sigmaWorst.value} σ; the 3 σ rule no longer separates it`);
for (const r of sigmaPlotted) {
  if (r.id === sigmaWorst.id) continue;
  assert.ok(r.value < 3, `${r.id} has also crossed 3 σ; the caption's "alone" is no longer true`);
}

/* ---- monospace metrics, so a label can be dodged without a browser --- */
export const SIGMA_WIDE_CH = /[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/;
export const sigmaAdvance = (text, size) => {
  let units = 0;
  for (const ch of String(text)) units += SIGMA_WIDE_CH.test(ch) ? 1 : 0.62;
  return units * size;
};
export const sigmaLabelWidth = (r, sym, code) => sigmaAdvance(r.symbol, sym) + 8 + sigmaAdvance(r.display, sym)
  + (r.interfaces.length ? 8 + sigmaAdvance(r.interfaces.join(" "), code) : 0);

export const sigmaLabel = (r, x, y, cls) =>
  `<text class="sg-lab${cls ? ` ${cls}` : ""}" x="${x.toFixed(1)}" y="${y.toFixed(1)}">`
  + `<tspan class="sg-sym">${esc(r.symbol)}</tspan>`
  + `<tspan class="sg-val" dx="8">${esc(r.display)}</tspan>`
  + (r.interfaces.length ? `<tspan class="sg-if" dx="8">${esc(r.interfaces.join(" "))}</tspan>` : "")
  + `</text>`;

/* Marker SHAPE, never marker colour, carries the lane and the ride-on:
   filled disc = a comparable pull; ring around it = conditional on a named
   open interface; open diamond = a χ²-equivalent; dashed hollow = commits
   nothing. Colour only ever repeats what a shape and a word already say. */
export const sigmaMarker = (r, x, y) => {
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
export const sigmaAria = (copy, sx) => {
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
export const sigmaWide = (copy, sx) => {
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
export const sigmaTall = (copy, sx) => {
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
export const sigmaSentence = (text, anchor, dir, toEnd = false) => {
  const at = String(text).indexOf(anchor);
  assert.ok(at >= 0, `σ-axis caption anchor "${anchor}" is gone from the deck`);
  if (toEnd) return text.slice(at).trim();
  const stop = dir === "zh" ? text.indexOf("。", at) : text.indexOf(". ", at);
  assert.ok(stop > at, `σ-axis caption anchor "${anchor}" no longer ends a sentence`);
  return text.slice(at, stop + 1).trim();
};

export const sigmaCaption = (copy) => {
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
/* The deck carries this figure's numeral, and figures/order.mjs refuses the
   build unless it agrees with the reading order. The page used to pass one in
   and override it, which left the deck's own string dead. */
export const sigmaFigure = (copy) => {
  const sx = copy.ledger.sigma;
  const figNumber = sx.figNumber;
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
<figcaption class="sg-cap"><span class="sg-fignum">${esc(figNumber)}</span> <span class="sg-figtitle">${esc(sx.figTitle)}</span> ${esc(sigmaCaption(copy))}</figcaption>
</figure>`;
};
