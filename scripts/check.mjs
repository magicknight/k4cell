import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, "site");

const required = [
  "index.html",
  "en/index.html",
  "zh/index.html",
  "en/notice/index.html",
  "zh/notice/index.html",
  "404.html",
  "assets/site.css",
  "assets/app.js",
  "assets/favicon.svg",
  "provenance/README.md",
  "provenance/K4V_FOUNDER_OPENPGP_KEY_v1.asc",
  "provenance/K4V_FOUNDER_OPENPGP_FINGERPRINT_v1.txt",
  "status.json",
  "ledger.json",
  "season-01.json",
  "robots.txt",
  "sitemap.xml",
  "CNAME",
  "_headers",
  "SITE_SHA256SUMS.txt",
];

for (const path of required) await access(join(site, path));

const english = await readFile(join(site, "en", "index.html"), "utf8");
const chinese = await readFile(join(site, "zh", "index.html"), "utf8");
const rootPage = await readFile(join(site, "index.html"), "utf8");
const noticeEn = await readFile(join(site, "en", "notice", "index.html"), "utf8");
const noticeZh = await readFile(join(site, "zh", "notice", "index.html"), "utf8");
const css = await readFile(join(site, "assets", "site.css"), "utf8");
const javascript = await readFile(join(site, "assets", "app.js"), "utf8");
const headers = await readFile(join(site, "_headers"), "utf8");
const robots = await readFile(join(site, "robots.txt"), "utf8");
const cname = await readFile(join(site, "CNAME"), "utf8");
const status = JSON.parse(await readFile(join(site, "status.json"), "utf8"));
const ledger = JSON.parse(await readFile(join(site, "ledger.json"), "utf8"));
const season = JSON.parse(await readFile(join(site, "season-01.json"), "utf8"));
const checksumText = await readFile(join(site, "SITE_SHA256SUMS.txt"), "utf8");
const founderPublicKey = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_KEY_v1.asc"), "utf8");
const founderFingerprint = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_FINGERPRINT_v1.txt"), "utf8");

const both = `${english}\n${chinese}`;

/* ---- the load-bearing numbers must be present in the STATIC html ---- */

/* The digit ruler renders one <span> per character, so numeric strings are only
   contiguous once the tags are stripped. Checking the text is the point: it is
   what a reader with JavaScript disabled actually sees. */
const textOf = (html) => html.replace(/<[^>]*>/g, "");
/* The PDF checksum starts "727..." and would otherwise satisfy a bare substring
   test for any headline figure, making those guards unfailable. */
const hexless = (text) => text.replace(/[0-9a-f]{16,}/gi, " ");
const searchable = (value) => (/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value)
  ? String(value).split(/e/i)[0]
  : String(value));

for (const [name, page] of [["en", english], ["zh", chinese]]) {
  const text = textOf(page);
  for (const row of [...ledger.gaussian, ...ledger.diagnostics, ...ledger.bounds]) {
    assert.ok(text.includes(searchable(row.predicted)),
      `${name}: computed value ${row.predicted} is not in the static text`);
  }
  for (const row of ledger.gaussian) {
    assert.ok(text.includes(searchable(row.measured)),
      `${name}: measured value ${row.measured} is not in the static text`);
  }
  assert.ok(text.includes(ledger.artifact.sha256), `${name}: the PDF checksum must appear`);
  assert.ok(text.includes("34.40"), `${name}: the worst row's chi-square must appear`);
  const prose = hexless(text);
  assert.ok(prose.includes(String(ledger.machine.leanCertified)), `${name}: certified count`);
  assert.ok(prose.includes(String(ledger.machine.rows)), `${name}: row total`);
  assert.ok(prose.includes(String(ledger.artifact.pages)), `${name}: page count`);
  assert.ok(text.includes("CQG-116665"), `${name}: the CQG submission id must appear`);
  assert.ok(text.includes("JGP13432"), `${name}: the JGP submission id must appear`);
  assert.match(page, /class="st" data-sig=/, `${name}: the 81 states must be server-rendered`);
  assert.match(page, /class="d-lit"/, `${name}: digit-ruler states must be server-rendered`);
  assert.match(page, /class="d-ghost"/, `${name}: the untestable tail must be server-rendered`);
  assert.match(page, /class="pullbar"/, `${name}: pull bars must be server-rendered`);
}

for (const [name, page] of [["en", english], ["zh", chinese], ["root", rootPage], ["notice-en", noticeEn], ["notice-zh", noticeZh]]) {
  assert.doesNotMatch(page, />undefined(?=[<\s])/, `${name}: a copy lookup rendered undefined`);
}

/* [56] the lit/ghost split must actually match resolvedDigits, per row and per side. */
for (const [name, page] of [["en", english], ["zh", chinese]]) {
  for (const row of ledger.gaussian) {
    const block = page.match(new RegExp(`data-row="${row.id}"[\\s\\S]*?</article>`));
    assert.ok(block, `${name}/${row.id}: ledger row is not rendered`);
    const sides = block[0].split(/class="rlab"/).slice(1);
    assert.equal(sides.length, 2, `${name}/${row.id}: expected a computed and a measured line`);
    const count = (side, cls) => (side.match(new RegExp(`class="${cls}(?=[" ])`, "g")) ?? []).length;
    if (!row.noPull) {
      assert.equal(count(sides[0], "d-lit"), row.resolvedDigits,
        `${name}/${row.id}: computed line lights ${count(sides[0], "d-lit")} digits, resolvedDigits is ${row.resolvedDigits}`);
      assert.equal(count(sides[1], "d-lit"), row.resolvedDigits,
        `${name}/${row.id}: measured line lights ${count(sides[1], "d-lit")} digits, resolvedDigits is ${row.resolvedDigits}`);
      assert.ok(count(sides[0], "d-ghost") > 0 || row.predictedExact,
        `${name}/${row.id}: a committed tail must be marked as untestable`);
    } else {
      assert.equal(count(sides[0], "d-lit"), 0, `${name}/${row.id}: a no-pull row must light no computed digit`);
    }
  }
}

const stateCount = (english.match(/class="st" data-sig=/g) ?? []).length;
assert.equal(stateCount, 81, "exactly 81 basis states must be rendered");

/* ---- honesty pairs: every claim carries its counterpart ---- */

assert.match(english, /K4V has not launched/);
assert.match(chinese, /K4V 尚未发行/);
assert.match(noticeEn, /K4V has not launched/);
assert.match(noticeZh, /K4V 尚未发行/);
assert.match(english, /not peer reviewed/);
assert.match(chinese, /未经同行评议/);
assert.match(english, /finite K4 substrate → faithful physical realization/);
assert.match(chinese, /有限 K4 基底 → 忠实物理实现/);
assert.match(english, /It is not an empirical claim about nature/);
assert.match(chinese, /核验断言的是逻辑结构，不是自然界/);
assert.match(english, /desk-rejected at editorial screening/);
assert.match(chinese, /编辑部初筛退稿/);
assert.match(english, /carrier-capped/);
assert.match(chinese, /载体封顶/);
assert.match(english, /What is not derived/);
assert.match(chinese, /哪些还没有推出来/);

/* ---- the never-say list ---- */

for (const forbidden of [
  /full-order Einstein/i,
  /official mint address/i,
  /peer[- ]reviewed publication/i,
  /at full granularity/i,
  /\b774\b/,
  /\b730\b/,
  /40,727/,
  /10,110/,
]) {
  assert.doesNotMatch(both, forbidden, `forbidden string present: ${forbidden}`);
}

/* ---- transport, indexing, and content-security posture ---- */

assert.match(english, /meta name="robots" content="index,follow"/);
assert.match(chinese, /meta name="robots" content="index,follow"/);
assert.equal(robots, "User-agent: *\nAllow: /\n\nSitemap: https://k4cell.com/sitemap.xml\n");
assert.equal(cname.trim(), "k4cell.com");
assert.doesNotMatch(headers, /X-Robots-Tag/, "the noindex header must be gone once the site is public");
assert.match(headers, /Content-Security-Policy/);
assert.match(english, /Content-Security-Policy/);
assert.match(chinese, /Content-Security-Policy/);
assert.match(english, /hreflang="zh-Hans"/);
assert.match(chinese, /hreflang="en"/);
assert.match(rootPage, /href="en\/"/);
assert.match(rootPage, /href="zh\/"/);

for (const page of [english, chinese, rootPage, noticeEn, noticeZh]) {
  assert.doesNotMatch(page, /<script(?![^>]*\bsrc=)/i, "no inline script (CSP forbids it)");
  assert.doesNotMatch(page, /<style\b/i, "no inline style element (CSP forbids it)");
  assert.doesNotMatch(page, /\sstyle="/i, "no inline style attribute (CSP forbids it)");
}

/* ---- machine-readable status ---- */

assert.equal(status.artifact_status, "PUBLISHED");
assert.equal(status.science.peer_reviewed, false);
assert.equal(status.science.monograph_under_journal_review, false);
assert.equal(status.science.full_physical_realization, "OPEN");
assert.equal(status.science.full_scientific_reproduction_package, "OPEN");
assert.equal(status.science.public_review_pdf_sha256, ledger.artifact.sha256);
assert.equal(status.science.carved_submissions.length, 2);
assert.equal(status.public_science.season, "NOT_STARTED");
assert.match(status.public_science.start_gate.public_review_status_sync, /^PASS@f739333/);
assert.equal(status.public_science.start_gate.founder_signed_no_official_mint, "OPEN");
assert.equal(status.founder_identity.fingerprint, "C74953F60AD573F54A3FD06C72213914E4860F47");
assert.match(founderPublicKey, /BEGIN PGP PUBLIC KEY BLOCK/);
assert.doesNotMatch(founderPublicKey, /PRIVATE KEY/);
assert.match(founderFingerprint, /fingerprint=C74953F60AD573F54A3FD06C72213914E4860F47/);
assert.equal(status.k4v.launched, false);
assert.equal(status.k4v.official_mint, null);
assert.equal(status.k4v.mainnet_authorized, false);

assert.equal(season.cards.length, 12);
assert.equal(new Set(season.cards.map((card) => card.id)).size, 12);
assert.deepEqual([...season.cards.map((card) => card.day)].sort((a, b) => a - b), season.cards.map((card) => card.day));
assert.ok(season.cards.every((card) => card.state === "DRAFT"));

/* ---- the numbers on the page must still recompute ---- */

for (const row of ledger.gaussian) {
  const resolved = Math.floor(Math.log10(Math.abs(Number(row.measured)) / row.sigma)) + 1;
  assert.equal(resolved, row.resolvedDigits, `${row.id}: resolved-digit drift`);
  if (!row.noPull) {
    const pull = Math.abs((Number(row.predicted) - Number(row.measured)) / row.sigma);
    assert.ok(Math.abs(pull - row.pull) <= Math.max(5e-4, row.pull * 0.02), `${row.id}: pull drift`);
  }
}
assert.equal(
  ledger.machine.leanCertified + ledger.machine.provedCoreOnly
  + ledger.machine.needsLeanNode + ledger.machine.proseEmpiricalOpen,
  ledger.machine.rows);

/* ---- budgets ---- */

assert.ok(Buffer.byteLength(javascript) < 16_000, "interactive JavaScript must remain below 16 KB uncompressed");
assert.ok(Buffer.byteLength(css) < 32_000, "CSS must remain below 32 KB uncompressed");

const walk = async (directory) => {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path));
    else paths.push(path);
  }
  return paths;
};

const files = await walk(site);
let totalBytes = 0;
for (const file of files) {
  const details = await stat(file);
  totalBytes += details.size;
  assert.ok(details.size < 25 * 1024 * 1024, `${file} exceeds the Pages file-size limit`);
}
assert.ok(totalBytes < 3 * 1024 * 1024, "the site should remain below 3 MB");

const checksumEntries = checksumText.trim().split("\n").map((line) => {
  const match = line.match(/^([0-9a-f]{64})  (.+)$/);
  assert.ok(match, `malformed checksum line: ${line}`);
  return { digest: match[1], path: match[2] };
});
for (const entry of checksumEntries) {
  const bytes = await readFile(join(site, entry.path));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), entry.digest, entry.path);
}
assert.equal(checksumEntries.length, files.length - 1, "checksum manifest covers every file except itself");

/* ---- every internal link resolves ---- */

const htmlFiles = files.filter((file) => file.endsWith(".html"));
for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
    const clean = reference.split(/[?#]/, 1)[0];
    /* A leading slash is relative to the deploy root, not to the filesystem. */
    const target = clean.startsWith("/") ? join(site, clean) : resolve(dirname(htmlFile), clean);
    assert.ok(target.startsWith(site), `path escapes deploy root: ${reference}`);
    await access(clean.endsWith("/") ? join(target, "index.html") : target);
  }
}

const combined = await Promise.all(files.map((file) => readFile(file).catch(() => Buffer.alloc(0))));
const text = combined.map((value) => value.toString("utf8")).join("\n");
for (const forbidden of [/ghp_[A-Za-z0-9]{20,}/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /seed phrase/i]) {
  assert.doesNotMatch(text, forbidden);
}

console.log(JSON.stringify({
  result: "PASS",
  files: files.length,
  total_bytes: totalBytes,
  javascript_bytes: Buffer.byteLength(javascript),
  css_bytes: Buffer.byteLength(css),
  basis_states_rendered: stateCount,
  ledger_rows: ledger.gaussian.length + ledger.diagnostics.length + ledger.bounds.length,
  indexable: true,
  official_mint: null,
}, null, 2));
