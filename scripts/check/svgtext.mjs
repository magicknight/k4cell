/* ------------------------------------------------------------------ *
 * NO LABEL MAY FALL OFF ITS OWN PLATE.                                *
 *                                                                     *
 * Every figure on this site is server-rendered SVG, and SVG has no     *
 * line box: a <text> that is wider than its viewBox is simply cut off  *
 * by the plate's own edge, silently, in one language and not the       *
 * other. Two shipped that way — the English digit ruler printed        *
 * "ignificant digit", and the English route plate cut the site's one   *
 * verbatim open-bridge sentence to "faithful phys / realization" on    *
 * every phone. Neither `npm test` (which reads text) nor the browser   *
 * suite (which reads document scrollWidth) could see either one.       *
 *                                                                     *
 * So this gate re-measures every <text> the build emits, in both       *
 * languages, and refuses a box that escapes its viewBox. It measures   *
 * with the SAME figWidth the figures wrap with, and it takes the size  *
 * and the family from site.css rather than from the call site — so a   *
 * call site that measures at 12px what the stylesheet draws at 14px    *
 * fails the build here rather than clipping on a reader's phone.       *
 *                                                                     *
 * A <text> whose class the stylesheet gives no font-size to also fails:*
 * an unstyled label is one that nobody has measured at all.            *
 * ------------------------------------------------------------------ */

import assert from "node:assert/strict";

import { ADV, figWidth } from "../lib/figures/text.mjs";
import { chinese, css, english } from "./common.mjs";

/* figWidth is a mean advance, so the budget is not to the pixel. Two units at
   design size is under a fifth of a glyph and still catches every real clip:
   the two that shipped ran 7 and 34 units over. */
export const SVG_TEXT_SLACK = 2;

/* ---- 1. the stylesheet, as rules ---------------------------------- */

/* Declarations are read from the flat rule list. @media blocks are skipped:
   the only ones that touch figure text are forced-colors (fill) and the
   width switches that show one orientation and hide the other (display), and
   a size set inside a query would be a size the base rule does not carry,
   which is a different bug and one this gate should not paper over. */
export const cssRules = (text) => {
  const flat = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  return [...flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((m) => ({ selector: m[1].trim(), body: m[2] }))
    .filter((rule) => !rule.selector.startsWith("@"));
};

/* A selector this gate understands: a descendant chain of compounds, each
   compound either an element name we know or a run of class tokens. Anything
   with a combinator, an attribute, a pseudo-class or a wildcard is ignored —
   none of the figure text is styled that way, and guessing would be worse. */
const parseSelector = (selector) => {
  if (/[>+~[\]*:()]/.test(selector)) return null;
  const parts = selector.split(/\s+/).filter(Boolean).map((part) => {
    const classes = [...part.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
    const element = part.replace(/\.[A-Za-z0-9_-]+/g, "");
    if (element && !/^[a-z]+$/.test(element)) return null;
    return { element: element || null, classes };
  });
  return parts.includes(null) ? null : parts;
};

const matchesCompound = (compound, element, classes) =>
  (!compound.element || compound.element === element)
  && compound.classes.every((cls) => classes.includes(cls));

/* The ancestor chain of a figure label is short and flat: the <svg> and,
   through it, the <figure> that carries it. Both are offered to every
   ancestor compound. */
const selectorApplies = (parts, node, ancestorClasses) => {
  const last = parts[parts.length - 1];
  if (!matchesCompound(last, node.element, node.classes)) return false;
  return parts.slice(0, -1).every((compound) =>
    !compound.element && compound.classes.every((cls) => ancestorClasses.includes(cls)));
};

const FAMILY = { "--mono": ADV.mono, "--sans": ADV.sans, "--fig": ADV.sans };

const rules = cssRules(css);
const rulesForContract = rules;

/* Source order decides, which is right here: every figure rule is one class
   deep or a two-class descendant written after the one-class rule it refines
   (.hy-h then .hy-wide .hy-h), so later-wins agrees with specificity. */
export const resolveStyle = (rules, node, ancestorClasses) => {
  const style = { size: null, advance: ADV.sans, tracking: 0, anchor: "start" };
  for (const rule of rules) {
    const applies = rule.selector.split(",").map((s) => parseSelector(s.trim()))
      .some((parts) => parts && selectorApplies(parts, node, ancestorClasses));
    if (!applies) continue;
    const font = rule.body.match(/(?:^|;)\s*font\s*:\s*([^;]+)/);
    if (font) {
      const size = font[1].match(/(\d+(?:\.\d+)?)px/);
      if (size) style.size = Number(size[1]);
      const family = font[1].match(/var\((--[a-z]+)\)/);
      if (family && FAMILY[family[1]] !== undefined) style.advance = FAMILY[family[1]];
      style.tracking = 0;
    }
    const size = rule.body.match(/(?:^|;)\s*font-size\s*:\s*(\d+(?:\.\d+)?)px/);
    if (size) style.size = Number(size[1]);
    const family = rule.body.match(/(?:^|;)\s*font-family\s*:\s*var\((--[a-z]+)\)/);
    if (family && FAMILY[family[1]] !== undefined) style.advance = FAMILY[family[1]];
    const track = rule.body.match(/(?:^|;)\s*letter-spacing\s*:\s*(-?\d*\.?\d+)em/);
    if (track) style.tracking = Number(track[1]);
    if (/(?:^|;)\s*letter-spacing\s*:\s*0(?:;|\s*$)/.test(rule.body)) style.tracking = 0;
    const anchor = rule.body.match(/(?:^|;)\s*text-anchor\s*:\s*([a-z]+)/);
    if (anchor) style.anchor = anchor[1];
  }
  return style;
};

/* ---- 1b. the wrapping call sites agree with the stylesheet ---------- *
 *
 * The overflow scan below catches a label that is too long. It cannot catch a
 * call site that measures at a size the stylesheet does not draw and happens
 * to wrap too EARLY — and that mis-measure is the hazard, because the next
 * copy edit turns it into a clip. So the four classes the figures wrap and
 * size against are pinned here, one row per constant that appears in a call
 * site under scripts/lib/figures/.
 * ------------------------------------------------------------------ */

export const WRAP_CONTRACT = [
  /* class, plate class it sits in, size the call site measures at, family */
  [".fr-lab", "fr", 11.5, ADV.mono, 0.05],   /* ruler.mjs   FR_LAB_SIZE / FR_LAB_TRACK */
  [".hy-n", "hy-narrow", 9.5, ADV.sans, 0.005], /* hypercharge.mjs HY_NOTE_SIZE / HY_NOTE_TRACK */
  [".rt-bridge", "rt", 14, ADV.mono, 0],     /* route.mjs   the main open bridge */
  [".rt-title", "rt", 13, ADV.sans, 0],      /* route.mjs   the station titles  */
  [".rt-note", "rt", 11, ADV.sans, 0],       /* route.mjs   the gap notes       */
  [".rt-sym", "rt", 12.5, ADV.mono, 0],      /* route.mjs   the chips           */
];

for (const [cls, plate, size, advance, tracking] of WRAP_CONTRACT) {
  const style = resolveStyle(rulesForContract, { element: "text", classes: [cls.slice(1)] }, [plate]);
  assert.equal(style.size, size,
    `${cls}: site.css draws it at ${style.size}px, a figure call site measures it at ${size}px`);
  assert.equal(style.advance, advance,
    `${cls}: site.css draws it in the other family; a figure call site measures the wrong advance`);
  assert.equal(style.tracking, tracking,
    `${cls}: site.css tracks it at ${style.tracking}em, a figure call site measures ${tracking}em`);
}

/* ---- 2. the pages, as plates and labels ---------------------------- */

const attributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([a-zA-Z-]+)\s*=\s*"([^"]*)"/g)].map((m) => [m[1], m[2]]));

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" };
export const decode = (text) => text
  .replace(/<[^>]*>/g, "")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&([a-z#0-9]+);/gi, (whole, name) => ENTITIES[name] ?? whole);

/* Every <svg> on a page, with the classes of the <figure> that holds it. */
export const platesOf = (page) => {
  const plates = [];
  for (const open of page.matchAll(/<svg\b[^>]*>/g)) {
    const svg = attributes(open[0]);
    const box = (svg.viewBox ?? "").split(/\s+/).map(Number);
    if (box.length !== 4) continue;
    const end = page.indexOf("</svg>", open.index);
    const inner = page.slice(open.index + open[0].length, end);
    /* the nearest enclosing <figure ...> tag, for descendant selectors */
    const before = page.slice(0, open.index);
    const figure = [...before.matchAll(/<figure\b[^>]*>/g)].pop();
    plates.push({
      classes: (svg.class ?? "").split(/\s+/).filter(Boolean),
      ancestors: [
        ...(svg.class ?? "").split(/\s+/).filter(Boolean),
        ...((figure ? attributes(figure[0]).class ?? "" : "").split(/\s+/).filter(Boolean)),
      ],
      width: box[2], height: box[3], inner,
    });
  }
  return plates;
};

export const labelsOf = (plate) => [...plate.inner.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)]
  .map((m) => ({ attrs: attributes(m[1]), content: decode(m[2]) }));

/* ---- 3. the gate --------------------------------------------------- */

export const overflows = [];
let measured = 0;
let rotated = 0;

for (const [name, page] of [["en", english], ["zh", chinese]]) {
  for (const plate of platesOf(page)) {
    for (const label of labelsOf(plate)) {
      const classes = (label.attrs.class ?? "").split(/\s+/).filter(Boolean);
      const style = resolveStyle(rules, { element: "text", classes }, plate.ancestors);
      const where = `${name}: <svg class="${plate.classes.join(" ")}"> <text class="${classes.join(" ")}">`;
      assert.ok(style.size, `${where} has no font-size in site.css; an unstyled label is an unmeasured one`);
      if (label.attrs.transform) { rotated += 1; continue; }
      if (!label.content.trim()) continue;
      measured += 1;

      const width = figWidth(label.content, style.size, style.advance, style.tracking);
      const anchor = label.attrs["text-anchor"] ?? style.anchor;
      const x = Number(label.attrs.x ?? 0);
      const left = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
      const right = left + width;
      if (left < -SVG_TEXT_SLACK || right > plate.width + SVG_TEXT_SLACK) {
        overflows.push(`${where} "${label.content.slice(0, 40)}" spans ${left.toFixed(1)}…${right.toFixed(1)} `
          + `in a ${plate.width}-unit box`);
      }
    }
  }
}

assert.deepEqual(overflows, [],
  `SVG text escapes its own viewBox and will be clipped:\n  ${overflows.join("\n  ")}`);
assert.ok(measured > 300, `only ${measured} figure labels were measured; the scan found nothing to check`);

export const svgTextMeasured = measured;
export const svgTextRotated = rotated;
