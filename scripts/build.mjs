/* Build entry. `npm run build` renders the site into site/; the modules under
   scripts/lib/ do the work and carry their own build-time asserts, which run
   on import. Every deck the site renders is passed to the cross-deck asserts
   here, so a figure module never imports src/copy itself. */

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import en from "../src/copy/en.js";
import zh from "../src/copy/zh.js";

import { assertDecks } from "./lib/data.mjs";
import { emitSite } from "./lib/emit.mjs";
import { assertHyperchargeDecks } from "./lib/figures/hypercharge.mjs";
import { assertFigureNumbers } from "./lib/figures/order.mjs";
import { assertRouteDecks } from "./lib/figures/route.mjs";
import { assertSigmaDecks } from "./lib/figures/sigma.mjs";
import { defaultOut } from "./lib/paths.mjs";
import { notFound, renderNotice, renderPage, renderRoot } from "./lib/sections/page.mjs";
import { DEFAULT_THEME, assertThemeName, groundOf } from "./lib/theme.mjs";

const decks = [en, zh];
assertDecks(decks);
assertFigureNumbers(decks);
assertHyperchargeDecks(decks);
assertRouteDecks(decks);
assertSigmaDecks(decks);

/* `theme` names a file stem in src/assets/themes/; the palette it holds is
   concatenated with src/assets/site-{head,body}.css to make assets/site.css
   (lib/theme.mjs). It is an explicit parameter with a default and is NEVER
   read from the environment: two builds of the same tree must agree byte for
   byte, which is what scripts/verify-determinism.mjs checks. */
export const buildSite = async (out = defaultOut, { theme = DEFAULT_THEME } = {}) => {
  assertThemeName(theme);
  /* The palette's ground, read once and handed to every page: it is what the
     browser paints outside the document (<meta name="theme-color">), so it
     has to follow the theme rather than be typed into lib/html.mjs. */
  const themeColor = await groundOf(theme);
  const page = { themeColor };
  await emitSite({
    out,
    theme,
    html: {
      "index.html": renderRoot(page),
      "en/index.html": renderPage(en, page),
      "zh/index.html": renderPage(zh, page),
      "en/notice/index.html": renderNotice(en, page),
      "zh/notice/index.html": renderNotice(zh, page),
      "404.html": notFound(page),
    },
  });
  return out;
};

/* node scripts/build.mjs [--theme=<name>] [--out=<dir>] */
export const parseArgs = (argv) => {
  const options = { out: defaultOut, theme: DEFAULT_THEME };
  for (const argument of argv) {
    const match = /^--(theme|out)=(.+)$/.exec(argument);
    if (!match) throw new Error(`unknown argument ${argument}; usage: build.mjs [--theme=<name>] [--out=<dir>]`);
    options[match[1]] = match[1] === "out" ? resolve(match[2]) : match[2];
  }
  return options;
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { out, theme } = parseArgs(process.argv.slice(2));
  await buildSite(out, { theme });
}
