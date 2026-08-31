import assert from "node:assert/strict";

import { EDGES, states } from "../data.mjs";

/* FIG. 1 — the pigeonhole argument PERFORMED, not asserted. A single frozen
 * frame can only claim that some pair collides; these six frames let the
 * reader watch the object try to escape and fail, six times, without reading
 * a word.
 *
 * The six words are real members of the 81, and the edge lit on each frame is
 * asserted here against the enumeration, so the drawing cannot drift away from
 * the arithmetic it illustrates. The frames are then emitted as SMIL <animate>
 * elements built FROM those two tables — there is no hand-written twin of the
 * timeline in the stylesheet any more, and nothing here can disagree with the
 * enumeration without failing the build.
 *
 * prefers-reduced-motion cannot switch SMIL off, so the glyph ships twice: an
 * animated group and a still one drawn at frame 0. The stylesheet shows one or
 * the other; both are generated from the same tables. */
export const DEAL_WORDS = [
  [0, 1, 2, 0], [0, 0, 1, 1], [1, 2, 2, 1],
  [2, 0, 0, 0], [1, 1, 1, 0], [2, 2, 2, 2],
];
export const DEAL_LIT = [
  ["e03"], ["e01", "e23"], ["e03", "e12"],
  ["e12", "e13", "e23"], ["e01", "e02", "e12"],
  ["e01", "e02", "e03", "e12", "e13", "e23"],
];
export const EDGE_NAMES = EDGES.map(([a, b]) => `e${a}${b}`);

DEAL_WORDS.forEach((word, frame) => {
  const state = states.find((candidate) => candidate.word.join("") === word.join(""));
  assert.ok(state, `deal frame ${frame}: ${word.join("")} is not one of the 81`);
  const lit = state.mono.map(([a, b]) => `e${a}${b}`).sort();
  assert.deepEqual(lit, [...DEAL_LIT[frame]].sort(),
    `deal frame ${frame}: the drawing lights ${DEAL_LIT[frame]}, the arithmetic gives ${lit}`);
});
assert.equal(DEAL_LIT.length, DEAL_WORDS.length, "one lit set per frame");
assert.equal(new Set(DEAL_WORDS.map((word) => states.find((s2) => s2.word.join("") === word.join("")).signature)).size, 4,
  "the frames must show all four colouring classes");
assert.equal(DEAL_LIT.filter((lit) => lit.length === 0).length, 0,
  "no frame may be collision-free: that is the whole point of the figure");

export const DEAL_V = [[100, 16], [16, 152], [184, 152], [100, 104]];

/* One frame every two seconds; the hero turn is therefore twelve seconds. */
export const DEAL_SECONDS_PER_FRAME = 2;
export const DEAL_DUR = `${DEAL_WORDS.length * DEAL_SECONDS_PER_FRAME}s`;

const EDGE_OFF = "0.3";
const EDGE_ON = "1";
const WIDTH_OFF = "1.8";
const WIDTH_ON = "4";

/* Values wrap back to frame 0 so the loop closes on the frame it opened with. */
const timeline = (perFrame) => [...perFrame, perFrame[0]].join(";");
const KEY_TIMES = timeline(DEAL_WORDS.map((_, index) =>
  (index / DEAL_WORDS.length).toFixed(4))).replace(/;[^;]*$/, ";1");

const animate = (attribute, perFrame) =>
  `<animate attributeName="${attribute}" values="${timeline(perFrame)}" keyTimes="${KEY_TIMES}" dur="${DEAL_DUR}" calcMode="discrete" repeatCount="indefinite"/>`;

/* The edges: opacity and weight both come from DEAL_LIT, frame by frame. */
const edgeFrames = (name, attribute) => DEAL_LIT.map((lit) => {
  const on = lit.includes(name);
  return attribute === "opacity" ? (on ? EDGE_ON : EDGE_OFF) : (on ? WIDTH_ON : WIDTH_OFF);
});

/* The vertices: three fixed-colour discs per site, one visible per frame, so
   the colour itself stays a stylesheet token and never a literal in the SVG. */
const discFrames = (site, colour) =>
  DEAL_WORDS.map((word) => (word[site] === colour ? "1" : "0"));

const glyphBody = (animated) => {
  const lines = EDGES.map(([a, b], index) => {
    const name = EDGE_NAMES[index];
    const opacity = edgeFrames(name, "opacity");
    const width = edgeFrames(name, "stroke-width");
    const inner = animated ? `${animate("opacity", opacity)}${animate("stroke-width", width)}` : "";
    return `<line class="ke ${name}" x1="${DEAL_V[a][0]}" y1="${DEAL_V[a][1]}" x2="${DEAL_V[b][0]}" y2="${DEAL_V[b][1]}" opacity="${opacity[0]}" stroke-width="${width[0]}">${inner}</line>`;
  }).join("");

  const discs = DEAL_V.flatMap((point, site) => [0, 1, 2].map((colour) => {
    const frames = discFrames(site, colour);
    const inner = animated ? animate("opacity", frames) : "";
    if (!animated && frames[0] === "0") return "";
    return `<circle class="kv kv-q${colour}" cx="${point[0]}" cy="${point[1]}" r="9" opacity="${frames[0]}">${inner}</circle>`;
  })).join("");

  return `${lines}${discs}`;
};

/* The legend beside it is already bilingual and says the same thing, so the
   figure is decorative to assistive technology rather than a second,
   unlocalised announcement. */
export const k4Glyph = `<svg class="k4-deal" viewBox="0 0 200 168" aria-hidden="true" focusable="false">
<g class="k4-anim">${glyphBody(true)}</g>
<g class="k4-still">${glyphBody(false)}</g>
</svg>`;

/* The still twin must be exactly frame 0: every lit edge of DEAL_LIT[0] and no
   other, and one disc per site. */
assert.equal((k4Glyph.match(/class="k4-still"/g) ?? []).length, 1);
assert.equal((glyphBody(false).match(/<circle /g) ?? []).length, DEAL_V.length,
  "the still glyph draws exactly one disc per site");
assert.equal((glyphBody(false).match(new RegExp(`<line [^>]*opacity="${EDGE_ON}"`, "g")) ?? []).length,
  DEAL_LIT[0].length, "the still glyph lights exactly the edges frame 0 lights");
