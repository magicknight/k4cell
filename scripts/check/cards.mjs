/* ------------------------------------------------------------------ *
 * SOCIAL CARDS. assets/og-k4cell-{en,zh}.jpg are the only pictures of *
 * this page that are BAKED. Every other surface is regenerated from   *
 * the sources on each build, so a headline edit or a palette swap     *
 * reaches it automatically; a card is drawn once, by a tool run by     *
 * hand, and then served to every reader who is shown the link before   *
 * they have seen the page. That makes it the one artefact that can go  *
 * quietly, durably wrong — and it went wrong exactly that way when the *
 * site left the dark ground: for a day the link previewed as near-     *
 * black with an amber accent, a page that no longer existed.           *
 *                                                                      *
 * So the card carries its own provenance. tools/og_cards.py writes,    *
 * into the JPEG's comment marker, the record of what it drew from:     *
 * the palette values it inked with — as the stylesheet writes them,    *
 * including every alias it followed and the ground it composited a     *
 * scrim over — and the deck strings it printed, under the deck paths   *
 * they came from. This module reads that record back out of the        *
 * shipped file and recomputes it from src/assets/themes/ and           *
 * src/copy/. If they disagree, the card is a picture of a page that    *
 * has moved, and the build says so and names the key that moved.       *
 *                                                                      *
 * What this cannot catch: a change to the drawing code in og_cards.py  *
 * itself. The stamp records the tool's INPUTS, not its source — a      *
 * digest over the tool would fire on a comment edit and be turned off  *
 * within a week. Layout is reviewed by looking at the card; the theme  *
 * and the copy are reviewed here, because those are what rot.          *
 * ------------------------------------------------------------------ */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { DEAL_LIT, DEAL_WORDS, EDGE_NAMES } from "../lib/figures/deal.mjs";
import { DEFAULT_THEME, readTheme, rootBlockOf, uncommentCss } from "../lib/theme.mjs";
import { srcAssets } from "../lib/paths.mjs";
import { decks, site } from "./common.mjs";

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;
/* Twitter's summary_large_image and Facebook's scraper both fetch the file
   before they show it; a card nobody waits for is a card nobody sees. */
export const CARD_BUDGET = 260_000;
const STAMP_MARK = "k4cell-og-card";
const STAMP_VERSION = 1;
const REGENERATE = "re-run `python3 tools/og_cards.py` and rebuild";

/* The honesty clause is not decoration on this card. A social preview is the
   highest-velocity surface this project has and the one most likely to be
   read by somebody who never opens the page, so the review state ships on the
   picture. provenance/HERO_PLATE_PROVENANCE.md records that as a requirement;
   this is where it is enforced. */
const CLAUSE = { en: "not peer reviewed", zh: "未经同行评议" };

/* ---- reading a JPEG far enough to see its size and its comment ---- */

/* Markers that stand alone: SOI, the restart markers, TEM. Everything else up
   to the start of scan carries a two-byte length. */
const STANDALONE = (marker) => marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7);
/* SOF0…SOF15 minus the three that are not frame headers (DHT, JPG, DAC). */
const IS_FRAME = (marker) => marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);

const readJpeg = (bytes, where) => {
  assert.equal(bytes.readUInt16BE(0), 0xffd8, `${where} is not a JPEG`);
  let at = 2;
  let frame = null;
  const comments = [];
  while (at < bytes.length - 1) {
    while (bytes[at] === 0xff && bytes[at + 1] === 0xff) at += 1;   /* fill bytes */
    assert.equal(bytes[at], 0xff, `${where}: no marker at byte ${at}`);
    const marker = bytes[at + 1];
    if (STANDALONE(marker)) { at += 2; continue; }
    if (marker === 0xd9 || marker === 0xda) break;   /* EOI, or entropy data */
    const length = bytes.readUInt16BE(at + 2);
    const payload = bytes.subarray(at + 4, at + 2 + length);
    if (IS_FRAME(marker)) frame = { height: payload.readUInt16BE(1), width: payload.readUInt16BE(3) };
    if (marker === 0xfe) comments.push(payload.toString("utf8"));
    at += 2 + length;
  }
  return { frame, comments };
};

/* ---- the record, recomputed from the live sources ---- */

/* The same extraction tools/og_cards.py does: split the token block on `;`,
   partition each declaration on its first `:`. Raw text, not a resolved
   colour — a resolver written twice in two languages is the drift this gate
   exists to prevent, and the tool records every token it touched, so a value
   moving anywhere along an alias chain moves the record anyway. */
const tokensOf = (block) => Object.fromEntries(
  uncommentCss(block.slice(block.indexOf("{") + 1, block.lastIndexOf("}")))
    .split(";")
    .filter((part) => part.includes(":"))
    .map((part) => [part.slice(0, part.indexOf(":")).trim(), part.slice(part.indexOf(":") + 1).trim()])
    .filter(([name]) => name.startsWith("--")));

const reach = (deck, path) => path.split(".").reduce((value, key) => value?.[key], deck);

/* JSON with the keys in sorted order at every level — byte-identical to
   Python's json.dumps(sort_keys=True, ensure_ascii=False, separators=(",",":")).
   Every leaf is a string or a small integer, so there is no number formatting
   for the two languages to disagree about. */
const canonical = (value) => (value && typeof value === "object" && !Array.isArray(value)
  ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`
  : JSON.stringify(value));

const theme = tokensOf(rootBlockOf(await readTheme(DEFAULT_THEME), `themes/${DEFAULT_THEME}.css`));
const frameKey = [DEAL_WORDS[0].join(""), DEAL_LIT[0].join(","), EDGE_NAMES.join(",")].join("|");

export const cardsChecked = [];

for (const [index, language] of ["en", "zh"].entries()) {
  const name = `assets/og-k4cell-${language}.jpg`;
  const bytes = await readFile(join(site, name));

  const { frame, comments } = readJpeg(bytes, name);
  assert.ok(frame, `${name} carries no frame header; it is not a readable JPEG`);
  assert.deepEqual(frame, { width: CARD_WIDTH, height: CARD_HEIGHT },
    `${name} is ${frame.width}x${frame.height}; a social card is ${CARD_WIDTH}x${CARD_HEIGHT}`);
  assert.ok(bytes.length < CARD_BUDGET, `${name} is ${bytes.length} B, over the ${CARD_BUDGET} B card budget`);

  /* ---- the card must carry a stamp, and the stamp must be its own ---- */

  assert.equal(comments.length, 1,
    `${name} carries ${comments.length} JPEG comment markers; it must carry exactly one, the provenance stamp — ${REGENERATE}`);
  let stamped;
  try {
    stamped = JSON.parse(comments[0]);
  } catch {
    assert.fail(`${name}: the JPEG comment is not the provenance stamp — ${REGENERATE}`);
  }
  const recorded = stamped.record ?? {};
  assert.equal(recorded.mark, STAMP_MARK,
    `${name} was not drawn by tools/og_cards.py, or was drawn before it stamped its output — ${REGENERATE}`);
  assert.equal(recorded.v, STAMP_VERSION,
    `${name} carries a v${recorded.v} stamp and this gate reads v${STAMP_VERSION} — ${REGENERATE}`);
  assert.equal(createHash("sha256").update(canonical(recorded), "utf8").digest("hex"), stamped.sha256,
    `${name}: the stamp's own digest does not cover its record; the marker has been edited by hand — ${REGENERATE}`);

  /* ---- the floor: whatever else a future stamp records, it records these ----
     The gate is only as wide as the record the tool chose to write, so the two
     inputs that actually rot — the ground the card is painted on and the
     headline it prints — are required by name here rather than trusted to
     stay in whatever tools/og_cards.py happens to read next year. */

  for (const token of ["--bg-0"]) {
    assert.ok(token in (recorded.tokens ?? {}),
      `${name}'s stamp does not record ${token}; the ground is what a stale card gets wrong first`);
  }
  for (const path of ["hero.h1a", "hero.h1b"]) {
    assert.ok(path in (recorded.text ?? {}),
      `${name}'s stamp does not record ${path}; the headline is what the card is FOR`);
  }
  assert.ok((recorded.text["footer.status"] ?? "").includes(CLAUSE[language]),
    `${name} does not carry “${CLAUSE[language]}”; the review state ships on the card, not only on the page`);

  /* ---- and the record must still be true ---- */

  const live = {
    mark: STAMP_MARK,
    v: STAMP_VERSION,
    lang: language,
    theme: DEFAULT_THEME,
    w: CARD_WIDTH,
    h: CARD_HEIGHT,
    frame: frameKey,
    tokens: Object.fromEntries(Object.keys(recorded.tokens).sort().map((token) => [token, theme[token]])),
    text: Object.fromEntries(Object.keys(recorded.text).sort().map((path) => [path, reach(decks[index], path)])),
  };

  const moved = [];
  for (const [group, was, now] of [["", recorded, live],
    ["tokens.", recorded.tokens, live.tokens], ["text.", recorded.text, live.text]]) {
    for (const key of new Set([...Object.keys(was), ...Object.keys(now)])) {
      if (typeof was[key] === "object") continue;
      if (was[key] !== now[key]) moved.push(`${group}${key}: card has ${JSON.stringify(was[key])}, the site now has ${JSON.stringify(now[key])}`);
    }
  }
  assert.deepEqual(moved, [],
    `${name} is stale — it is a picture of a page that has since changed:\n    ${moved.join("\n    ")}\n  ${REGENERATE}`);
  assert.equal(createHash("sha256").update(canonical(live), "utf8").digest("hex"), stamped.sha256,
    `${name}'s stamp does not match the live sources — ${REGENERATE}`);

  /* The shipped card is the source card: the build copies src/assets byte for
     byte, so this only fires when `npm run check` is run on its own against a
     tree whose cards were regenerated after the last build. */
  assert.ok(bytes.equals(await readFile(join(srcAssets, `og-k4cell-${language}.jpg`))),
    `site/${name} is not src/assets/og-k4cell-${language}.jpg; rebuild`);

  cardsChecked.push({ file: name, bytes: bytes.length, sha256: stamped.sha256 });
}

/* ---- and the written record says what actually ships ----
   provenance/HERO_PLATE_PROVENANCE.md is where this project keeps its account
   of the images it has published, including the two hero plates it withdrew.
   A record of a generated artefact is itself a generated artefact's shadow: it
   goes stale the same way, and it is read by people rather than by the build,
   which is worse. tools/og_cards.py therefore writes those two lines itself,
   and this ties them to the files they describe — so what fails here is a hand
   edit to one side or the other, not a forgotten step. */

const provenance = await readFile(join(site, "provenance", "HERO_PLATE_PROVENANCE.md"), "utf8");
for (const card of cardsChecked) {
  const filename = card.file.slice("assets/".length);
  assert.match(provenance, new RegExp(`${filename.replace(".", "\\.")}\\s+${CARD_WIDTH}x${CARD_HEIGHT}\\s+${card.bytes} B`),
    `provenance/HERO_PLATE_PROVENANCE.md does not record ${filename} at ${CARD_WIDTH}x${CARD_HEIGHT}, ${card.bytes} B; ${REGENERATE}, which rewrites that record — do not edit it by hand`);
  assert.ok(provenance.includes(card.sha256),
    `provenance/HERO_PLATE_PROVENANCE.md does not record ${filename}'s stamp ${card.sha256}; ${REGENERATE}, which rewrites that record — do not edit it by hand`);
}
