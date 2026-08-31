import { esc } from "../html.mjs";

/* ------------------------------------------------------------------ *
 * Text inside SVG. Two families: the CJK-aware measure/wrap used by   *
 * the route figure, and the rounded-coordinate helpers used by the    *
 * digit-ruler figure. figText escapes its content; svgText does not.  *
 * ------------------------------------------------------------------ */

export const FIG_CJK = /[⺀-鿿　-〿＀-￯]/;
/* One em in any family: an em dash is an em by definition, and an ellipsis is
   within a few percent of one in every face this site can reach. */
export const FIG_EM_WIDE = /[—―…]/;
/* One em only when a CJK face is drawing the run. The browser picks a font per
   character, so “ ” ’ · come from the Latin face on the English page (narrow)
   and from the CJK face on the Chinese page (full width) — which is why a
   Chinese figure note measured 8 units short and ran off its plate. */
export const FIG_HAN_WIDE = /[‘’“”·]/;

/* SVG has no line box, so every wrap is measured here.
 *
 * THE CONTRACT, and it is load-bearing: `size` must be the size the STYLESHEET
 * draws that class at, and `advance` must be the family the stylesheet draws it
 * in. Measure at 12px what the CSS sets at 14px and the label runs off the
 * plate — which is exactly how the English route figure came to print the main
 * open bridge as "finite K4 substrate → faithful phys / realization".
 *
 * ADV is a mean advance per glyph, in ems. The 0.56 that served both families
 * until 2026-08-30 was a Latin proportional mean; the monospace faces in --mono
 * (SF Mono, Menlo, Consolas, Liberation Mono, DejaVu Sans Mono) sit a full
 * 0.60, so every mono label was measured ~7% short. A Han glyph is 1em in
 * either family. Letter-spacing is NOT included: a class that sets it passes
 * its own tracking, in ems, as the fourth argument.
 *
 * check/svgtext.mjs re-measures every <text> the figures emit with these same
 * numbers, reading the size and the family out of site.css rather than from
 * the call site, so a call site that disagrees with the stylesheet fails the
 * build instead of clipping a label on someone's phone. */
export const ADV = Object.freeze({ sans: 0.56, mono: 0.6 });

export const figWidth = (text, size, advance = ADV.sans, tracking = 0) => {
  const han = FIG_CJK.test(String(text));
  return [...String(text)].reduce((sum, ch) => {
    const wide = FIG_CJK.test(ch) || FIG_EM_WIDE.test(ch) || (han && FIG_HAN_WIDE.test(ch));
    return sum + (wide ? size : size * advance) + size * tracking;
  }, 0);
};

export const figWrap = (text, size, max, advance = ADV.sans, tracking = 0) => {
  const lines = [];
  let line = "";
  for (const token of String(text).split(/(\s+)/)) {
    if (token === "") continue;
    if (/^\s+$/.test(token)) { if (line) line += " "; continue; }
    /* Han runs carry no spaces, so they break per glyph or not at all. */
    for (const unit of (FIG_CJK.test(token) ? [...token] : [token])) {
      if (line && figWidth((line + unit).trim(), size, advance, tracking) > max) { lines.push(line.trim()); line = unit; }
      else line += unit;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
};

export const figText = (cls, x, y, anchor, content) =>
  `<text class="${cls}" x="${x}" y="${y}"${anchor ? ` text-anchor="${anchor}"` : ""}>${esc(content)}</text>`;

export const figLines = (cls, x, y, step, anchor, lines) => lines
  .map((line, index) => figText(cls, x, (y + step * index).toFixed(1), anchor, line)).join("");

/* ---- rounded-coordinate helpers (digit-ruler figure) ------------------ */

export const round1 = (value) => Math.round(value * 10) / 10;
export const bracketDown = (x1, x2, y, cls, arm = 6) =>
  `<path class="${cls}" d="M${round1(x1)} ${round1(y + arm)}V${round1(y)}H${round1(x2)}V${round1(y + arm)}"/>`;
export const bracketUp = (x1, x2, y, cls, arm = 6) =>
  `<path class="${cls}" d="M${round1(x1)} ${round1(y - arm)}V${round1(y)}H${round1(x2)}V${round1(y - arm)}"/>`;
export const bracketRight = (y1, y2, x, cls, arm = 6) =>
  `<path class="${cls}" d="M${round1(x + arm)} ${round1(y1)}H${round1(x)}V${round1(y2)}H${round1(x + arm)}"/>`;
export const svgText = (x, y, cls, body) => `<text class="${cls}" x="${round1(x)}" y="${round1(y)}">${body}</text>`;
/* Figure labels do not wrap, so the portrait orientation takes its longer
   labels as an explicit array of lines from the copy file. */
export const svgLines = (x, y, cls, list, step = 15) =>
  list.map((line, i) => svgText(x, y + i * step, cls, esc(line))).join("");
