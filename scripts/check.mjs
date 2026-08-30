import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, "site");
const execFileAsync = promisify(execFile);

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
  "assets/hero-web-land.webp",
  "assets/hero-web-port.webp",
  "provenance/README.md",
  "provenance/K4V_FOUNDER_OPENPGP_KEY_v1.asc",
  "provenance/K4V_FOUNDER_OPENPGP_KEY_v2.asc",
  "provenance/K4V_FOUNDER_OPENPGP_FINGERPRINT_v1.txt",
  "provenance/K4V_FOUNDER_OPENPGP_FINGERPRINT_v2.txt",
  "provenance/tests/SERVER_SIGNING_SUBKEY_TEST_v1.txt",
  "provenance/tests/SERVER_SIGNING_SUBKEY_TEST_v1.txt.asc",
  "provenance/tests/VERIFICATION.md",
  "official-k4v/index.html",
  "official-k4v/official-k4v.v1.json",
  "official-k4v/K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt",
  "official-k4v/K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt.asc",
  "official-k4v/VERIFY.md",
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
const founderPublicKeyV2 = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_KEY_v2.asc"), "utf8");
const founderFingerprint = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_FINGERPRINT_v1.txt"), "utf8");
const founderFingerprintV2 = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_FINGERPRINT_v2.txt"), "utf8");
const founderTestPayloadPath = join(site, "provenance", "tests", "SERVER_SIGNING_SUBKEY_TEST_v1.txt");
const founderTestSignaturePath = `${founderTestPayloadPath}.asc`;
const founderTestPayload = await readFile(founderTestPayloadPath);
const founderTestSignature = await readFile(founderTestSignaturePath);
const officialPage = await readFile(join(site, "official-k4v", "index.html"), "utf8");
const officialStatus = JSON.parse(await readFile(join(site, "official-k4v", "official-k4v.v1.json"), "utf8"));
const officialPayloadPath = join(site, "official-k4v", "K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt");
const officialSignaturePath = `${officialPayloadPath}.asc`;
const officialPayload = await readFile(officialPayloadPath);
const officialSignature = await readFile(officialSignaturePath);

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

/* ---- the concept-art plate: present, sized, and honestly labelled ---- */

/* srcset is not covered by the link walker, so pin the portrait source too. */
for (const [name, page] of [["en", english], ["zh", chinese]]) {
  assert.match(page, /srcset="\.\.\/assets\/hero-web-port\.webp"/, `${name}: portrait plate not referenced`);
  assert.match(page, /src="\.\.\/assets\/hero-web-land\.webp"/, `${name}: landscape plate not referenced`);
  assert.match(page, /class="ruler ruler-hero"/, `${name}: the hero ruler must stay server-rendered`);
  assert.ok(page.indexOf("data-row=") > page.indexOf('id="ledger"'),
    `${name}: no data-row may appear before the ledger section`);
}

/* All three clauses of the label ship, in both languages. A picture of a toy
   simulation must never read as an observation, nor as this framework's output. */
assert.match(english, /NOT AN OBSERVATION/);
assert.match(chinese, /不是观测/);
assert.match(english, /NOT THIS FRAMEWORK'S OUTPUT/i);
assert.match(chinese, /也不是本框架的计算结果/);
assert.match(english, /A picture of an idea, not a picture of the sky/);
assert.match(chinese, /这是一幅关于想法的图，不是一幅天空的照片/);

/* The refusal that stops a cosmic image from implying a cosmic result. */
assert.match(english, /The cosmological-constant problem is not solved here/);
assert.match(chinese, /这里没有解决宇宙学常数问题/);

/* The parameter count may never appear without its convention hedge. */
assert.match(english, /26 to 28 once neutrino masses are included/);
assert.match(chinese, /26 到 28 个/);

/* "Planck length" must not appear on the first screen: l_* = l_P is a
   normalisation, not a result, and printing it beside the glyph would assert
   the main open bridge. */
assert.doesNotMatch(both, /Planck length/i);
assert.doesNotMatch(both, /普朗克长度/);

/* og:image lives in a content= attribute the link walker never visits. */
for (const dir of ["en", "zh"]) {
  await access(join(site, "assets", `og-k4cell-${dir}.jpg`));
}
assert.match(english, /og:image" content="https:\/\/k4cell\.com\/assets\/og-k4cell-en\.jpg"/);
assert.match(chinese, /og:image" content="https:\/\/k4cell\.com\/assets\/og-k4cell-zh\.jpg"/);

for (const [name, path] of [["land", "hero-web-land.webp"], ["port", "hero-web-port.webp"]]) {
  const details = await stat(join(site, "assets", path));
  assert.ok(details.size < (name === "land" ? 160_000 : 180_000), `${path} has grown past its budget`);
}

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

/* ---- section 02: what it claims to explain ---- */

const decks = await Promise.all([
  import("../src/copy/en.js"), import("../src/copy/zh.js"),
]).then((mods) => mods.map((m) => m.default));

for (const deck of decks) {
  assert.equal(deck.explain.rows.length, 11, `${deck.dir}: the explain section must carry eleven rows`);
  assert.equal(deck.hero.chips.length, 4, `${deck.dir}: the hero carries four chips`);
  const states = new Set(deck.explain.tagKey.map(([state]) => state));
  for (const row of deck.explain.rows) {
    assert.ok(row.tags.length > 0, `${deck.dir}/${row.n}: a claim must carry its evidence state`);
    for (const tag of row.tags) {
      assert.ok(states.has(tag), `${deck.dir}/${row.n}: unknown state "${tag}"`);
    }
    /* "rides on" is never empty: rows with no open interface print their class
       boundary there instead. The scope must live in the row, not a footnote. */
    assert.ok(row.ridesOn && row.ridesOn.length > 20, `${deck.dir}/${row.n}: rides-on is missing`);
    assert.ok(row.checkAt && row.checkAt.length > 20, `${deck.dir}/${row.n}: check-it-at is missing`);
    for (const code of row.ridesOn.match(/\bE(?:1[01]|[1-9])\b/g) ?? []) {
      assert.ok(/^E(?:1[01]|[1-9])$/.test(code), `${deck.dir}/${row.n}: bad interface code ${code}`);
    }
  }
}

for (const [name, page] of [["en", english], ["zh", chinese]]) {
  assert.equal((page.match(/class="xrow[" ]/g) ?? []).length, 11, `${name}: eleven claim rows must render`);
  assert.match(page, /id="explain"/, `${name}: the explain section must be present`);
  assert.match(page, /class="xholo"/, `${name}: the holography correction must be present`);
  assert.match(page, /Was mich eigentlich interessiert/, `${name}: the Einstein epigraph must render`);
  assert.match(page, /知之為知之/, `${name}: the Analects epigraph must render`);
}

/* The two split-tier leads must show BOTH tiers; collapsing a row to its
   stronger half is the overclaim this section exists to prevent. */
for (const deck of decks) {
  for (const n of ["02", "03", "05", "06", "08"]) {
    const row = deck.explain.rows.find((r) => r.n === n);
    assert.ok(row.tags.length === 2, `${deck.dir}/${n}: split-tier row must print both tiers`);
  }
}

/* ---- the never-say list ---- */

for (const forbidden of [
  /full[- ]order/i,           // E4: a higher response-moment tower survives
  /全阶/,
  /official mint address/i,
  /peer[- ]reviewed publication/i,
  /at full granularity/i,
  /the universe is a hologram/i,
  /全息宇宙/,
  /2D quantum ocean/i,
  /二维量子海洋/,
  /information paradox/i,     // E6
  /Page curve/i,
  /\b774\b/,
  /\b730\b/,
  /40,727/,
  /10,110/,
]) {
  assert.doesNotMatch(both, forbidden, `forbidden string present: ${forbidden}`);
}

/* AdS/CFT may appear only where the site disowns it as a premise, which is what
   the monograph's own abstract does. Assert the disclaimer rather than the word. */
assert.match(english, /AdS\/CFT are not premises of this route/);
assert.match(chinese, /AdS\/CFT 都不是这条路线的前提/);
assert.equal((english.match(/AdS\/CFT/gi) ?? []).length, 1, "en: AdS/CFT may appear only in the disclaimer");
assert.equal((chinese.match(/AdS\/CFT/gi) ?? []).length, 1, "zh: AdS/CFT may appear only in the disclaimer");

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

for (const page of [english, chinese, rootPage, noticeEn, noticeZh, officialPage]) {
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
assert.equal(status.public_science.start_gate.founder_signed_no_official_mint, "PASS");
assert.match(status.public_science.start_gate.canonical_https_source_graph, /^SIGNED_ARTIFACTS_PUBLISHED/);
assert.equal(status.founder_identity.fingerprint, "C74953F60AD573F54A3FD06C72213914E4860F47");
assert.equal(status.founder_identity.signing_subkey_fingerprint, "0427411FA4820FDA5EBFB79B48D9A06D3C49431F");
assert.equal(status.founder_identity.server_subkey_test_signature, "PASS");
assert.equal(status.founder_identity.server_subkey_test_signed_at_utc, "2026-08-30T09:53:46Z");
assert.equal(
  createHash("sha256").update(founderTestPayload).digest("hex").toUpperCase(),
  status.founder_identity.server_subkey_test_payload_sha256);
assert.equal(
  createHash("sha256").update(founderTestSignature).digest("hex").toUpperCase(),
  status.founder_identity.server_subkey_test_signature_sha256);
assert.match(founderPublicKey, /BEGIN PGP PUBLIC KEY BLOCK/);
assert.doesNotMatch(founderPublicKey, /PRIVATE KEY/);
assert.match(founderPublicKeyV2, /BEGIN PGP PUBLIC KEY BLOCK/);
assert.doesNotMatch(founderPublicKeyV2, /PRIVATE KEY/);
assert.match(founderFingerprint, /fingerprint=C74953F60AD573F54A3FD06C72213914E4860F47/);
assert.match(founderFingerprintV2, /signing_subkey_fingerprint=0427411FA4820FDA5EBFB79B48D9A06D3C49431F/);
assert.match(founderFingerprintV2, /server_subkey_test_signature=PASS/);
assert.match(founderFingerprintV2, /no_mint_payload_signature=PASS/);
assert.doesNotMatch(founderFingerprintV2, /windows_full_backup|secret_subkey_package/);
assert.equal(status.founder_identity.official_no_mint_signature, "PASS");
assert.equal(status.founder_identity.official_no_mint_signed_at_utc, "2026-08-30T10:30:37Z");
assert.equal(
  createHash("sha256").update(officialPayload).digest("hex").toUpperCase(),
  status.founder_identity.official_no_mint_payload_sha256);
assert.equal(
  createHash("sha256").update(officialSignature).digest("hex").toUpperCase(),
  status.founder_identity.official_no_mint_signature_sha256);
assert.equal(officialStatus.artifact_status, "PUBLISHED_CANONICAL_HTTPS");
assert.equal(officialStatus.signature_status, "PASS_FOUNDER_OPENPGP");
assert.equal(officialStatus.launch_state.launched, false);
assert.equal(officialStatus.launch_state.official_mint, null);
assert.equal(officialStatus.launch_state.official_payment_wallet, null);
assert.equal(officialStatus.launch_state.tge_date, null);
assert.equal(officialStatus.launch_state.mainnet_authorized, false);
assert.equal(officialStatus.openpgp.payload_sha256,
  createHash("sha256").update(officialPayload).digest("hex"));
assert.equal(officialStatus.openpgp.signature_sha256,
  createHash("sha256").update(officialSignature).digest("hex"));
assert.match(officialPayload.toString("utf8"), /^K4V FOUNDER NO-OFFICIAL-MINT ATTESTATION v1\n/);
assert.match(officialPayload.toString("utf8"), /official_mint=NONE/);
assert.match(officialPayload.toString("utf8"), /authorization_boundary=This attestation authorizes no mint/);
assert.doesNotMatch(officialPayload.toString("utf8"), /LOCAL_DRAFT|UNSIGNED/);
assert.match(officialPage, /K4V has not launched/);
assert.match(officialPage, /K4V 尚未发行/);
assert.match(officialPage, /3d972bdaec125196f5629485d1bec3f80b4c64c234d547903051c73172063a15/);
assert.match(officialPage, /83447c16556ba4f68c04c295fefa8924b2e07d5115f5c08e7498c7c39775fd36/);
assert.match(officialPage, /github\.com\/magicknight\/k4cell\/tree\/main\/official-k4v/);
assert.doesNotMatch(Buffer.concat([officialPayload, officialSignature]).toString("utf8"),
  /BEGIN PGP (?:PRIVATE|SECRET) KEY BLOCK/);

/* Verify the detached signature cryptographically in an isolated keyring. The
   GOODSIG key ID is useful to humans, but VALIDSIG is the acceptance object:
   it binds the complete signing-subkey fingerprint to the primary fingerprint. */
const verificationHome = await mkdtemp(join(tmpdir(), "k4cell-gpg-"));
try {
  await execFileAsync("gpg", [
    "--homedir", verificationHome, "--batch", "--import",
    join(site, "provenance", "K4V_FOUNDER_OPENPGP_KEY_v2.asc"),
  ]);
  const { stdout: gpgStatus } = await execFileAsync("gpg", [
    "--homedir", verificationHome, "--batch", "--status-fd", "1", "--verify",
    founderTestSignaturePath, founderTestPayloadPath,
  ]);
  assert.match(gpgStatus,
    /\[GNUPG:\] GOODSIG 48D9A06D3C49431F Zhihua Liang <zhihua@k4cell\.com>/);
  assert.match(gpgStatus,
    /\[GNUPG:\] VALIDSIG 0427411FA4820FDA5EBFB79B48D9A06D3C49431F .* C74953F60AD573F54A3FD06C72213914E4860F47/);
  const { stdout: officialGpgStatus } = await execFileAsync("gpg", [
    "--homedir", verificationHome, "--batch", "--status-fd", "1", "--verify",
    officialSignaturePath, officialPayloadPath,
  ]);
  assert.match(officialGpgStatus,
    /\[GNUPG:\] GOODSIG 48D9A06D3C49431F Zhihua Liang <zhihua@k4cell\.com>/);
  assert.match(officialGpgStatus,
    /\[GNUPG:\] VALIDSIG 0427411FA4820FDA5EBFB79B48D9A06D3C49431F .* C74953F60AD573F54A3FD06C72213914E4860F47/);
} finally {
  await rm(verificationHome, { recursive: true, force: true });
}
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
