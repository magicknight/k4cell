/* ------------------------------------------------------------------ *
 * PREVIEWS. `npm run preview` builds the whole site once per palette   *
 * in src/assets/themes/ so the three can be read side by side at       *
 * length — which is the only way to judge a ground colour, since the   *
 * page is some thirty screens tall and halation is a fatigue effect,   *
 * not something a swatch shows.                                        *
 *                                                                      *
 * It writes OUTSIDE the repository. site/ is the published tree and is *
 * built only by `npm run build`; a preview that could land in it would *
 * turn "try the other palette" into a dirty working tree, and the      *
 * default build's checksums are the site's whole integrity story.      *
 * The guard below refuses any output path inside the repository.       *
 *                                                                      *
 *   npm run preview                 -> PREVIEW_ROOT/<theme>/           *
 *   node scripts/build-previews.mjs --out=<dir>                        *
 * ------------------------------------------------------------------ */

import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSite } from "./build.mjs";
import { root } from "./lib/paths.mjs";
import { listThemes } from "./lib/theme.mjs";

/* A scratch directory, not a temp file: the previews are meant to be opened,
   compared and left alone between sessions. It must sit outside the repository
   (see the guard below), so it defaults to the platform temp dir rather than to
   anything under root. Override with --out=. */
export const PREVIEW_ROOT = join(tmpdir(), "k4cell-preview");

export const assertOutsideRepo = (out) => {
  const inside = relative(root, out);
  if (inside === "" || (!inside.startsWith("..") && !inside.startsWith(sep) && !/^[A-Za-z]:/.test(inside))) {
    throw new Error(`refusing to write previews inside the repository (${out}); site/ is built only by npm run build`);
  }
  return out;
};

export const parseArgs = (argv) => {
  let out = PREVIEW_ROOT;
  for (const argument of argv) {
    const match = /^--out=(.+)$/.exec(argument);
    if (!match) throw new Error(`unknown argument ${argument}; usage: build-previews.mjs [--out=<dir>]`);
    out = match[1];
  }
  return { out: resolve(out) };
};

export const buildPreviews = async (out) => {
  assertOutsideRepo(out);
  const built = [];
  for (const theme of await listThemes()) {
    built.push({ theme, out: await buildSite(resolve(out, theme), { theme }) });
  }
  return built;
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { out } = parseArgs(process.argv.slice(2));
  const built = await buildPreviews(out);
  console.log(`${built.length} theme${built.length === 1 ? "" : "s"} built, site/ untouched:\n`);
  for (const { theme, out: directory } of built) {
    console.log(`  ${theme.padEnd(16)} ${directory}/en/index.html`);
  }
  console.log("");
}
