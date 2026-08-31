/* ------------------------------------------------------------------ *
 * ASSEMBLE THE COPY DECKS.                                            *
 *                                                                     *
 *   in   src/copy/fragments/<cluster>.json   (eight reviewed clusters) *
 *   out  src/copy/zh.js  and  src/copy/en.js                          *
 *                                                                     *
 * Run it with `npm run copy`. The decks are generated: never hand-edit  *
 * src/copy/{zh,en}.js — edit the fragment and re-run. `npm test` fails  *
 * if the two ever disagree (scripts/check/copy.mjs re-assembles in      *
 * memory and compares byte for byte), so a hand-edit cannot ship.       *
 *                                                                     *
 * Each fragment carries a { zh, en } pair covering one cluster of the   *
 * page, so a copy reviewer reads one section at a time instead of a     *
 * thousand-line deck. The eleven claim rows arrive in three fragments   *
 * (01-04, 05-08, 09-11) and are concatenated in that order. A derived   *
 * `explain` view is written into each deck for the figure modules and   *
 * the honesty gates, which address rows by body/ridesOn/checkAt.        *
 * ------------------------------------------------------------------ */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const root = dirname(here);
export const fragmentsDir = join(root, "src", "copy", "fragments");
export const deckPath = (dir) => join(root, "src", "copy", `${dir}.js`);

export const CLUSTERS = ["front", "whys-a", "whys-b", "whys-c", "numbers", "kill-machine", "boundary", "verify-next"];
export const ROW_ORDER = ["whys-a", "whys-b", "whys-c"];
export const DIRECTIONS = ["zh", "en"];

const load = async (cluster) => {
  const path = join(fragmentsDir, `${cluster}.json`);
  return { cluster, path, data: JSON.parse(await readFile(path, "utf8")) };
};

const isPlain = (v) => v && typeof v === "object" && !Array.isArray(v);

/* Merge, but never let a later fragment silently overwrite an earlier one:
   the only key two fragments may share is whys, whose rows are concatenated. */
export const merge = (into, from, trail = []) => {
  for (const [key, value] of Object.entries(from)) {
    const here_ = [...trail, key];
    if (!(key in into)) { into[key] = value; continue; }
    if (isPlain(into[key]) && isPlain(value)) { merge(into[key], value, here_); continue; }
    if (key === "rows" && Array.isArray(into[key]) && Array.isArray(value)) {
      into[key] = [...into[key], ...value];
      continue;
    }
    throw new Error(`copy collision at ${here_.join(".")}`);
  }
  return into;
};

/* ---- the derived compatibility view the figures and gates read ---- */

export const withExplain = (deck) => {
  const rows = deck.whys.rows.map((row) => ({
    n: row.n,
    tags: row.tags,
    h3: row.q,
    body: row.answer,
    ridesOn: row.rides,
    checkAt: row.check,
  }));
  /* No second copy of anything: the route figure and its cross-deck assert
     read copy.boundary.route, which is what the page renders, and data.mjs
     pins the Lean figures to machine.lead + machine.what, which is what the
     page prints. Both aliases were removed 2026-08-30 (code review G1, G2). */
  return {
    ...deck,
    explain: {
      rows,
      tagKey: deck.tiers.key,
      ridesOnLabel: deck.whys.ridesLabel,
      checkLabel: deck.whys.checkLabel,
      tagKeyTitle: deck.tiers.title,
    },
  };
};

/* ---- serialise as readable JS ---- */

const q = (s) => JSON.stringify(s);

const isRowLike = (v) => isPlain(v) && ("n" in v) && ("q" in v || "h3" in v);

export const write = (value, indent) => {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);
  if (typeof value === "string") return q(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    const flat = value.every((v) => typeof v === "string" || typeof v === "number");
    const short = flat && value.reduce((n, v) => n + String(v).length, 0) < 70;
    if (short) return `[${value.map((v) => write(v, indent)).join(", ")}]`;
    const pairs = value.every((v) => Array.isArray(v) && v.every((x) => typeof x === "string"));
    if (pairs) {
      return `[\n${value.map((v) => `${padIn}${write(v, indent + 1)},`).join("\n")}\n${pad}]`;
    }
    return `[\n${value.map((v) => `${padIn}${write(v, indent + 1)},`).join("\n")}\n${pad}]`;
  }
  const entries = Object.entries(value);
  if (!entries.length) return "{}";
  const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : q(k));
  const body = entries.map(([k, v]) => `${padIn}${key(k)}: ${write(v, indent + 1)},`).join(isRowLike(value) ? "\n" : "\n");
  return `{\n${body}\n${pad}}`;
};

export const header = (dir) => `/* k4cell.com — ${dir === "zh" ? "中文文案" : "English copy"}.
 *
 * GENERATED FILE — DO NOT EDIT.
 *   source   src/copy/fragments/*.json   (eight reviewed clusters)
 *   command  npm run copy                (scripts/assemble-copy.mjs)
 *   gate     scripts/check/copy.mjs re-assembles and compares byte for byte,
 *            so a hand-edit here fails \`npm test\`.
 *
 * Every number here comes from src/data/ledger.json (frozen public-review
 * release, 2026-07-08) and is re-checked at build time; the build fails rather
 * than publish a figure the ledger does not support.
 *
 * \`explain\` at the foot is a derived view of \`whys\` kept for the figure
 * generators and the honesty gates, which address rows by body/ridesOn/checkAt.
 * It is written by the assembler; edit \`whys\` in the fragment.
 */

export default `;

/* The decks, as source text, without touching the disk. The gate and the CLI
   both go through here, so what is checked is what would be written. */
export const assembleDecks = async () => {
  const fragments = await Promise.all(CLUSTERS.map(load));
  const decks = {};

  for (const dir of DIRECTIONS) {
    const deck = {};
    /* whys rows must land in 01..11 order regardless of fragment order */
    const ordered = [
      ...fragments.filter((f) => !ROW_ORDER.includes(f.cluster) && f.cluster === "front"),
      ...ROW_ORDER.map((c) => fragments.find((f) => f.cluster === c)),
      ...fragments.filter((f) => !ROW_ORDER.includes(f.cluster) && f.cluster !== "front"),
    ];
    for (const f of ordered) {
      if (!f.data[dir]) throw new Error(`${f.cluster}: no ${dir} object`);
      merge(deck, f.data[dir]);
    }
    const ns = deck.whys.rows.map((r) => r.n);
    const want = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"];
    if (ns.join(",") !== want.join(",")) throw new Error(`${dir}: whys rows are ${ns.join(",")}`);

    decks[dir] = `${header(dir)}${write(withExplain(deck), 0)};\n`;
  }
  return decks;
};

const main = async () => {
  const decks = await assembleDecks();
  const report = [];
  for (const dir of DIRECTIONS) {
    const out = deckPath(dir);
    await writeFile(out, decks[dir], "utf8");
    report.push({ dir, out, bytes: Buffer.byteLength(decks[dir]) });
  }
  console.log(JSON.stringify({ result: "ASSEMBLED", clusters: CLUSTERS, decks: report }, null, 2));
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
