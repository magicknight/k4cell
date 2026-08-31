/* ------------------------------------------------------------------ *
 * THEMES. The emitted assets/site.css is these source files joined   *
 * in this order:                                                      *
 *                                                                     *
 *   src/assets/site-head.css      the sheet's masthead comment — the   *
 *                                 four rules every palette obeys;      *
 *                                 emitted verbatim.                    *
 *   src/assets/themes/<name>.css  ONE `:root{…}` block: the palette.   *
 *                                 Only the block is emitted; anything  *
 *                                 else in the file must be a comment   *
 *                                 and is dropped, so a theme can carry *
 *                                 its own notes without shipping them. *
 *   src/assets/site-body.css      every rule of the visual system;     *
 *                                 emitted verbatim. Names no colour.   *
 *   src/assets/themes/            OPTIONAL, and only for what a token  *
 *     <name>.overrides.css        cannot say. A palette can restate a  *
 *                                 colour but not RE-SCOPE one, and one *
 *                                 thing on this page needs re-scoping: *
 *                                 the falsifier section inverts its    *
 *                                 ground, so on a light palette the    *
 *                                 four ink tokens must be remapped     *
 *                                 inside .sec-kill. Appended last, so  *
 *                                 it wins; hex-free like the body, so  *
 *                                 budgets.mjs still finds the whole    *
 *                                 palette in the token block; gated by *
 *                                 check/themes.mjs, which refuses any  *
 *                                 name the contract does not hold.     *
 *                                 Every override is a place two themes *
 *                                 can drift: keep it to what a token   *
 *                                 genuinely cannot express.            *
 *                                                                     *
 * The theme is an explicit parameter with a default, never an          *
 * environment variable: scripts/verify-determinism.mjs builds the same *
 * tree twice and compares checksums, so anything the build reads from  *
 * outside the tree is a determinism bug waiting to happen.             *
 *                                                                     *
 * Two gates live on this shape. scripts/check/budgets.mjs reads the    *
 * emitted sheet's first `:root{…}` block and fails on a hex written    *
 * anywhere after it. scripts/check/themes.mjs reads the source themes  *
 * and fails if one smuggles in a rule or drops a custom property that  *
 * another theme — and therefore a figure — defines.                    *
 * ------------------------------------------------------------------ */

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { srcAssets } from "./paths.mjs";

/* The shipping palette. `paper` was chosen on 2026-08-31 after the three
   were built and read at length: it is the only one that answers halation
   at the mechanism rather than by degree, it dissolves the accent/site-colour
   hue collision, and it is the only ground on which the falsifier section can
   invert and become the page's one visible landmark. `instrument` and
   `lifted` are kept as alternates -- one file each -- because they are the
   comparison the decision rests on. Nothing treats either as canonical. */
export const DEFAULT_THEME = "paper";

export const themesDir = join(srcAssets, "themes");
export const headPath = join(srcAssets, "site-head.css");
export const bodyPath = join(srcAssets, "site-body.css");

/* The stylesheet's sources are copied into the output by name, never by the
   recursive asset copy; emit.mjs filters them out of it. `themes` covers a
   palette and its override sheet alike. Keep in sync. */
export const themeSourceNames = ["site-head.css", "site-body.css", "themes"];

/* A theme name is a file stem, so it may not contain a separator. Rejecting
   the name rather than resolving the path keeps `--theme=../../etc/passwd`
   from being a path question at all. */
export const assertThemeName = (name) => {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new Error(`theme name must match [a-z0-9][a-z0-9-]*, got ${JSON.stringify(name)}`);
  }
  return name;
};

export const themePath = (name) => join(themesDir, `${assertThemeName(name)}.css`);

/* A theme's optional override sheet. The suffix is checked BEFORE the plain
   one everywhere below, since "paper.overrides.css" also ends in ".css". */
export const OVERRIDES_SUFFIX = ".overrides.css";
export const overridesPath = (name) => join(themesDir, `${assertThemeName(name)}${OVERRIDES_SUFFIX}`);

/* Sorted, so the preview list and any gate that walks the directory are
   deterministic on every filesystem. */
export const listThemes = async () => (await readdir(themesDir))
  .filter((entry) => entry.endsWith(".css") && !entry.endsWith(OVERRIDES_SUFFIX))
  .map((entry) => entry.slice(0, -".css".length))
  .sort();

/* The themes that carry an override sheet, sorted. */
export const listOverrides = async () => (await readdir(themesDir))
  .filter((entry) => entry.endsWith(OVERRIDES_SUFFIX))
  .map((entry) => entry.slice(0, -OVERRIDES_SUFFIX.length))
  .sort();

/* The single definition of "the token block": from `:root` to the first line
   that starts with `}`. budgets.mjs finds the end of the emitted block the
   same way (indexOf("\n}")), so the two agree by construction. */
export const ROOT_BLOCK = /(^|\n):root\s*\{[\s\S]*?\n\}/;

export const uncommentCss = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "");

export const rootBlockOf = (source, label) => {
  const match = source.match(ROOT_BLOCK);
  if (!match) throw new Error(`${label} contains no :root{…} block`);
  return match[0].replace(/^\n/, "");
};

/* The theme's own ground, as a browser paints it behind the page: the value
   of --bg-0 in its token block. lib/html.mjs writes it into every page's
   <meta name="theme-color">, so the browser's own chrome (Android's toolbar,
   Safari's) is the colour of the page rather than of whichever palette was
   default when that meta tag was typed. Derived, never a literal: a theme
   swap must not be able to leave it stale, and check/themes.mjs asserts the
   emitted tag equals the emitted --bg-0. */
export const GROUND_TOKEN = "--bg-0";

export const groundOf = async (theme = DEFAULT_THEME) => {
  const block = rootBlockOf(await readTheme(theme), `themes/${theme}.css`);
  const match = new RegExp(`(?:^|[{;\n])\\s*${GROUND_TOKEN}\\s*:\\s*([^;}]+)`).exec(uncommentCss(block));
  if (!match) throw new Error(`themes/${theme}.css declares no ${GROUND_TOKEN}; it is the page's ground`);
  const value = match[1].trim();
  if (!/^#[0-9a-fA-F]{3,8}$/.test(value)) {
    throw new Error(`themes/${theme}.css: ${GROUND_TOKEN} must be an opaque hex, got ${JSON.stringify(value)}; <meta name="theme-color"> cannot carry a scrim`);
  }
  return value.toLowerCase();
};

/* Everything a theme file holds apart from its one block. The gate asserts
   this is comments and whitespace only; the build simply drops it. */
export const outsideRootBlock = (source) => source.replace(ROOT_BLOCK, "\n");

export const readTheme = async (name) => readFile(themePath(name), "utf8").catch(async (error) => {
  if (error.code !== "ENOENT") throw error;
  throw new Error(`no theme named "${name}"; src/assets/themes/ holds ${(await listThemes()).join(", ")}`);
});

/* Absent is the normal case: a palette that needs no re-scoping has no file
   here, and composes to exactly the bytes it composed before this existed. */
export const readOverrides = async (name) => readFile(overridesPath(name), "utf8").catch((error) => {
  if (error.code !== "ENOENT") throw error;
  return "";
});

/* head + block + body, with exactly one blank line between the parts and one
   newline at the end. Trimming each part means a theme file may end with or
   without a blank line and the emitted bytes do not move. */
export const composeStylesheet = async (theme = DEFAULT_THEME) => {
  const [head, block, body, overrides] = await Promise.all([
    readFile(headPath, "utf8"),
    readTheme(theme).then((source) => rootBlockOf(source, `themes/${theme}.css`)),
    readFile(bodyPath, "utf8"),
    readOverrides(theme),
  ]);
  const parts = [head, block, body, overrides].map((part) => part.trim()).filter(Boolean);
  return `${parts.join("\n\n")}\n`;
};
