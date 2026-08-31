import assert from "node:assert/strict";

import { esc } from "../html.mjs";

/* ------------------------------------------------------------------ *
 * The digit ruler.                                                    *
 * ------------------------------------------------------------------ */

export const splitNumber = (text) => {
  const match = String(text).match(/^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i);
  assert.ok(match, `unparseable numeric string: ${text}`);
  return {
    sign: match[1] ?? "",
    whole: match[2],
    fraction: match[3] ?? "",
    exponent: match[4] ? Number(match[4]) : null,
  };
};

export const digitCells = (text, resolved, mode) => {
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

export const ruler = (row, copy, options = {}) => {
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

export const pullBar = (value, max = 4) => {
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
