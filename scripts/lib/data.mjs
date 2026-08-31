import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { root } from "./paths.mjs";

/* Every number on the site comes from these two files. */
export const ledger = JSON.parse(await readFile(join(root, "src", "data", "ledger.json"), "utf8"));
export const external = JSON.parse(await readFile(join(root, "src", "data", "external.json"), "utf8"));

/* ------------------------------------------------------------------ *
 * Numeric integrity: recompute what the page prints, and refuse to    *
 * build if the recomputation disagrees with the stored value.         *
 * ------------------------------------------------------------------ */

export const resolvedDigitsOf = (measured, sigma) =>
  Math.floor(Math.log10(Math.abs(Number(measured)) / sigma)) + 1;

export const pullOf = (predicted, measured, sigma) =>
  Math.abs((Number(predicted) - Number(measured)) / sigma);

for (const row of ledger.gaussian) {
  const resolved = resolvedDigitsOf(row.measured, row.sigma);
  assert.equal(resolved, row.resolvedDigits,
    `${row.id}: resolved digits recompute to ${resolved}, stored ${row.resolvedDigits}`);
  if (!row.noPull) {
    const pull = pullOf(row.predicted, row.measured, row.sigma);
    assert.ok(Math.abs(pull - row.pull) <= Math.max(5e-4, row.pull * 0.02),
      `${row.id}: pull recomputes to ${pull}, stored ${row.pull}`);
  }
}

const lambdaRow = ledger.gaussian.find((row) => row.id === "lambda");
assert.equal(lambdaRow.pullDisplay, "0.9 σ", "the Lambda row must print the published 0.9 sigma");
assert.ok(Math.abs(pullOf(lambdaRow.predicted, lambdaRow.measured, lambdaRow.sigma) - 0.92) < 0.01);

export const machine = ledger.machine;
assert.equal(
  machine.leanCertified + machine.provedCoreOnly + machine.needsLeanNode + machine.proseEmpiricalOpen,
  machine.rows, "Lean sign-off buckets must sum to the row total");
export const notCertified = machine.rows - machine.leanCertified;
assert.equal(notCertified, 44,
  `ledger.machine: ${machine.rows} - ${machine.leanCertified} = ${notCertified}, but the 2026-07-08 release records 44 non-certified rows`);

export const rowIds = [...ledger.gaussian, ...ledger.diagnostics, ...ledger.bounds].map((row) => row.id);

/* The ledger-versus-deck asserts. They need every deck the site renders, so
   the build entry passes them in; nothing here imports src/copy. */
export const assertDecks = (decks) => {
  /* The bucket figures are printed twice — as data in the bar keys and as prose
     in the two paragraphs the machine section leads with. Pin the prose to the
     data so the two cannot drift apart. This used to pin machine.figures, a
     third copy of the same prose that no page ever printed, which left the
     printed 19 / 4 / 21 / 313 and the three axiom names ungated. */
  for (const copy of decks) {
    const printed = `${copy.machine.lead}\n${copy.machine.what}`;
    for (const value of [machine.rows, machine.leanCertified, machine.provedCoreOnly,
      machine.needsLeanNode, machine.proseEmpiricalOpen, machine.modules]) {
      assert.ok(printed.includes(String(value)),
        `${copy.dir}: machine.lead + machine.what no longer print ${value}`);
    }
    for (const axiom of machine.axioms) {
      assert.ok(printed.includes(axiom), `${copy.dir}: the machine section omits ${axiom}`);
    }
    assert.equal(copy.machine.figures, undefined,
      `${copy.dir}: machine.figures is dead copy — the page prints machine.lead and machine.what`);
  }

  /* A missing copy key would otherwise print the literal string "undefined" on the
     live page. Fail the build instead. */
  for (const copy of decks) {
    for (const id of rowIds) {
      assert.ok(copy.ledger.types[id], `${copy.dir}: ledger.types is missing "${id}"`);
    }
    for (const key of Object.keys(copy.ledger.types)) {
      assert.ok(rowIds.includes(key), `${copy.dir}: ledger.types has a stale key "${key}"`);
    }
  }
};

/* The row the first screen and the ruler figure lead with. */
export const heroRow = ledger.gaussian.find((row) => row.id === "mu_e");

/* ------------------------------------------------------------------ *
 * The 81 basis states, enumerated at build time.                      *
 * ------------------------------------------------------------------ */

export const EDGES = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
export const VERTS = [[19, 5], [4, 31], [34, 31], [19, 21]];

export const states = [];
for (let index = 0; index < 81; index += 1) {
  const word = [
    Math.floor(index / 27) % 3,
    Math.floor(index / 9) % 3,
    Math.floor(index / 3) % 3,
    index % 3,
  ];
  const counts = [0, 0, 0];
  for (const colour of word) counts[colour] += 1;
  const signature = [...counts].sort((a, b) => b - a).join(",");
  const mono = EDGES.filter(([a, b]) => word[a] === word[b]);
  states.push({ index, word, signature, mono });
}

assert.equal(states.length, 81);
export const monoTotal = states.reduce((sum, state) => sum + state.mono.length, 0);
assert.equal(monoTotal, 162, "total same-colour edges over all 81 states must be 162");
assert.equal(monoTotal / 81, 2, "mean same-colour edges per state must be exactly 2");
assert.equal(states.filter((state) => state.mono.length === 0).length, 0, "no state may be collision-free");

export const classCensus = new Map();
for (const state of states) {
  const entry = classCensus.get(state.signature) ?? { states: 0, mono: state.mono.length };
  entry.states += 1;
  classCensus.set(state.signature, entry);
}
assert.deepEqual(
  [...classCensus.entries()].map(([key, value]) => [key, value.states, value.mono]).sort(),
  [["2,1,1", 36, 1], ["2,2,0", 18, 2], ["3,1,0", 24, 3], ["4,0,0", 3, 6]]);
