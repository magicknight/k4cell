/* Build the site twice into two fresh temporary directories and diff the
   checksum manifests. Same tree -> same SITE_SHA256SUMS.txt is the whole
   integrity story of this site; anything environment-dependent (a clock, a
   random id, an unordered map, a locale) shows up here first. Also reports
   whether the two agree with the committed site/SITE_SHA256SUMS.txt.

   Not wired into npm test; run by hand: node scripts/verify-determinism.mjs */

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { buildSite } from "./build.mjs";
import { defaultOut } from "./lib/paths.mjs";

const manifestOf = async (dir) => readFile(join(dir, "SITE_SHA256SUMS.txt"), "utf8");

const a = await mkdtemp(join(tmpdir(), "k4cell-det-a-"));
const b = await mkdtemp(join(tmpdir(), "k4cell-det-b-"));
try {
  await buildSite(a);
  await buildSite(b);
  const [ma, mb] = await Promise.all([manifestOf(a), manifestOf(b)]);
  const committed = await manifestOf(defaultOut).catch(() => null);

  const linesA = ma.trim().split("\n");
  const linesB = mb.trim().split("\n");
  const differing = linesA.filter((line, index) => line !== linesB[index])
    .concat(linesB.slice(linesA.length));
  const result = {
    result: differing.length === 0 ? "DETERMINISTIC" : "NONDETERMINISTIC",
    files: linesA.length,
    differing_entries: differing,
    matches_committed_site: committed === null ? null : committed === ma,
  };
  console.log(JSON.stringify(result, null, 2));
  if (differing.length) process.exit(1);
} finally {
  await rm(a, { recursive: true, force: true });
  await rm(b, { recursive: true, force: true });
}
