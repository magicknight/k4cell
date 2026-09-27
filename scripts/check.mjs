/* Check entry. The source and copy gates run before the rendered-site checks:
   the decks must match their fragments, every reviewed string must reach a
   reader, and the headline observed value must match its independent source.
   Then the integrity and honesty gates check scientific boundaries and signed
   evidence, the SVG label gate keeps figure text inside its viewBox,
   the orientation gate (every plate ships in two orientations, so nothing
   outside a plate may point at a place inside one), the structure gates (pins
   on the DOM, rewritten with the page), the theme gates (a palette is one
   :root block, every palette declares the same names, and the emitted sheet is
   the concatenation of the sources rather than a hand edit), the social-card
   gate (the two baked JPEGs are still pictures of THIS page: right size, and
   the palette and headline they were drawn from are the ones the site has),
   and the byte budgets. Each module is a bag of top-level asserts that runs on import; the
   first failure stops the run. */

import "./check/copy.mjs";
import "./check/hero-source.mjs";
import "./check/integrity.mjs";
import "./check/overview.mjs";
import { svgTextMeasured } from "./check/svgtext.mjs";
import { orientationChecked } from "./check/orientation.mjs";
import { stateCount } from "./check/structure.mjs";
import { themesChecked } from "./check/themes.mjs";
import { cardsChecked } from "./check/cards.mjs";
import { totalBytes } from "./check/budgets.mjs";
import { css, files, javascript, ledger } from "./check/common.mjs";

console.log(JSON.stringify({
  result: "PASS",
  files: files.length,
  total_bytes: totalBytes,
  javascript_bytes: Buffer.byteLength(javascript),
  css_bytes: Buffer.byteLength(css),
  basis_states_rendered: stateCount,
  figure_labels_measured: svgTextMeasured,
  figure_plates_paired: orientationChecked,
  ledger_rows: ledger.gaussian.length + ledger.diagnostics.length + ledger.bounds.length,
  themes: themesChecked,
  social_cards: cardsChecked,
  indexable: true,
  official_mint: null,
}, null, 2));
