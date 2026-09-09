import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prepareDraft, PROPOSAL_VERSION } from "../../src/assets/interest.js";
import { site, status, english, chinese } from "./common.mjs";

assert.equal(status.science.working_monograph.version, "v3.0");
assert.equal(status.science.working_monograph.public_pdf, null);
assert.equal(status.k4v.implementation_candidate.new_program_verified, false);
assert.equal(status.k4v.implementation_candidate.founder_cliff_days, 180);
assert.equal(status.k4v.implementation_candidate.public_program_cliff_days, 730);

for (const language of ["en", "zh"]) {
  const home = await readFile(join(site, language, "index.html"), "utf8");
  assert.equal((home.match(/<section\b/g) || []).length, 5, "home must remain a five-section introduction");
  assert.ok(home.length < 18000, "a short homepage must not contain the old long account");
  for (const path of ["research.html", "progress/", "support/", "interest/"]) {
    assert.ok(home.includes(`/${language}/${path}`), `${language} homepage misses ${path}`);
  }
  for (const kind of ["", "progress/", "support/", "interest/"]) {
    const html = await readFile(join(site, language, kind, "index.html"), "utf8");
    assert.ok(html.includes(`<html lang="${language === "zh" ? "zh-Hans" : "en"}">`));
    assert.match(html, /http-equiv="Content-Security-Policy"/);
    assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)|<style\b|\sstyle="|>undefined[<\s]/i);
    assert.ok(html.includes('/official-k4v/'));
    const other = language === "zh" ? "en" : "zh";
    assert.ok(html.includes(`href="/${other}/${kind}"`), "language switch must preserve purpose");
  }
  const interest = await readFile(join(site, language, "interest/index.html"), "utf8");
  assert.ok(interest.includes(PROPOSAL_VERSION));
  assert.match(interest, /730/);
  assert.match(interest, /180/);
  assert.doesNotMatch(interest, /\bchecked(?:\s|=|>)/i, "follow-up consent must be opt-in");
  assert.match(interest, /<noscript>/, "email fallback must work without JavaScript");
  assert.match(interest, /id="draft-preview" hidden/);
}

// The reviewed full account is still published and tested by all existing
// scientific/figure/integrity gates; it is not replaced by a marketing summary.
assert.ok(english.length > 150000 && chinese.length > 150000);
const answers = { q1: "No interest & no return", q2: "No rights", q3: "NO", q4: "Price unknown", q5: "Unclear liquidity", q6: "NO", contact: "test@example.invalid", channel: "manual", consent: false };
for (const language of ["en", "zh"]) {
  const draft = prepareDraft(answers, language);
  const url = new URL(draft.href);
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, "zhihua@k4cell.com");
  assert.deepEqual([...url.searchParams.keys()], ["subject", "body"]);
  assert.equal(url.searchParams.get("body"), draft.body);
  assert.match(draft.body, /3\. Interest \/ 条件兴趣: NO/);
  assert.match(draft.body, /一次跟进同意: NO/);
  assert.match(draft.body, /not an order or funding commitment/);
  assert.throws(() => prepareDraft({ ...answers, q3: "" }, language));
  assert.throws(() => prepareDraft({ ...answers, q2: " " }, language));
  assert.throws(() => prepareDraft({ ...answers, q1: "x".repeat(161) }, language));
}
assert.match(prepareDraft({ ...answers, consent: true }, "en").body, /一次跟进同意: YES/);
assert.match(prepareDraft({ ...answers, consent: "YES" }, "en").body, /一次跟进同意: NO/);
const injection = prepareDraft({ ...answers, q1: "&bcc=elsewhere@example.invalid\nsubject=other" }, "en");
assert.deepEqual([...new URL(injection.href).searchParams.keys()], ["subject", "body"]);
