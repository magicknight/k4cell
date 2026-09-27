/* Independently pinned observed value and exact arithmetic for the headline
   comparison. The source record explicitly leaves the K4 derivation open. */

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";

import { root } from "./common.mjs";

const { stdout } = await promisify(execFile)("python3", [
  "-B", join(root, "evidence", "hero-mu-e", "verify.py"),
]);
const result = JSON.parse(stdout);
assert.equal(result.result, "PASS");
assert.equal(result.comparison, "RETROSPECTIVE");
assert.equal(result.observed_source, "NIST/CODATA 2022");
assert.equal(result.resolved_digits, 8);
assert.equal(result.k4_derivation_reproduced, false);
