/* ------------------------------------------------------------------ *
 * BUDGETS. Raised on 2026-08-30 for the redesign: JS 16 KB -> 48 KB,   *
 * CSS 72 KB -> 160 KB; the site total stays under 3 MiB and no file    *
 * may exceed the Pages limit. The hex-outside-the-token-block gate is  *
 * the one that carries meaning and is kept as is.                      *
 * ------------------------------------------------------------------ */

import assert from "node:assert/strict";
import { stat } from "node:fs/promises";

import { css, files, javascript } from "./common.mjs";

/* The two hero plates — 224 KB of dark cosmic backdrop — were withdrawn on
   2026-08-31 with the dark ground they were painted for. They had already
   been deployed with zero references from any page or stylesheet; their size
   budgets went with them. provenance/HERO_PLATE_PROVENANCE.md keeps the
   record of what was once published. */

/* No third-party runtime can load anyway (the CSP allows only 'self'), so the
   byte budget is a discipline on our own code: one file, no bundler. */
assert.ok(Buffer.byteLength(javascript) < 48_000, "interactive JavaScript must remain below 48 KB uncompressed");
/* Raised three times on 2026-08-30: 32 KB -> 40 KB for the question hero, to
   72 KB when the page gained its figures, and to 160 KB for the redesign. The
   site still ships exactly ONE stylesheet and no inline style, so this file is
   the entire visual system. The byte count was never the point; the two
   assertions below are. */
assert.ok(Buffer.byteLength(css) < 160_000, "CSS must remain below 160 KB uncompressed");

/* The palette must stay in the token block. Colour on this site carries
   meaning — an evidence tier, a warning, a link — so a hex value written at
   the use site is how that meaning quietly drifts. */
const cssTokens = css.slice(0, css.indexOf("\n}"));
const cssBody = css.slice(css.indexOf("\n}"));
const strayHex = [...cssBody.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0])
  .filter((hex) => !["#fff", "#ffffff", "#000", "#000000"].includes(hex.toLowerCase()));
assert.deepEqual(strayHex, [],
  `hex colours outside the :root token block: ${strayHex.join(", ")}`);
assert.ok(cssTokens.includes("--alert:"), "the token block must still define the palette");

export let totalBytes = 0;
for (const file of files) {
  const details = await stat(file);
  totalBytes += details.size;
  assert.ok(details.size < 25 * 1024 * 1024, `${file} exceeds the Pages file-size limit`);
}
assert.ok(totalBytes < 3 * 1024 * 1024, "the site should remain below 3 MB");
