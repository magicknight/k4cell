/* ------------------------------------------------------------------ *
 * INTEGRITY AND HONESTY GATES — moved verbatim from the old check.mjs. *
 * Nothing here pins the page layout; everything here pins what the     *
 * site is allowed to claim, the frozen signed evidence, the transport   *
 * posture, the checksum manifest and the link graph. A redesign must   *
 * keep every gate in this file green without editing it.               *
 * ------------------------------------------------------------------ */

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";

import {
  both, checksumText, chinese, decks, english, files, founderFingerprint, founderFingerprintV2,
  founderPublicKey, founderPublicKeyV2, founderTestPayload, founderTestPayloadPath,
  founderTestSignature, founderTestSignaturePath, headers, hexless, ledger, noticeEn, noticeZh,
  officialPage, officialPayload, officialPayloadPath, officialSignature, officialSignaturePath,
  notFoundPage, officialStatus, publicationReceipt, robots, cname, rootPage, searchable, season, site, status,
  textOf, css,
} from "./common.mjs";

const execFileAsync = promisify(execFile);

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
}

for (const [name, page] of [["en", english], ["zh", chinese], ["root", rootPage], ["notice-en", noticeEn], ["notice-zh", noticeZh]]) {
  assert.doesNotMatch(page, />undefined(?=[<\s])/, `${name}: a copy lookup rendered undefined`);
}

/* RETIRED 2026-08-30 with the thing it guarded. The three-clause concept-art
   label ("NOT AN OBSERVATION / NOT THIS FRAMEWORK'S OUTPUT / a picture of an
   idea, not a picture of the sky") existed because the first screen carried a
   cosmic-web plate. The redesign removes the plate: the object itself is the
   hero image, and it is a drawing of the thing the page is about, not a
   picture of the sky. The gate below keeps the rule rather than the strings —
   if any bitmap plate ever returns to a page, its label has to return too. */
for (const [name, page] of [["en", english], ["zh", chinese]]) {
  /* <image> as well as <img>: the SVG raster element is the same bitmap by
     another name, and \b after "img" let it through. */
  assert.doesNotMatch(page, /<im(?:g|age)\b/i,
    `${name}: a bitmap plate is back; restore its three-clause label with it`);
}
/* The other way a plate returns: through the stylesheet. It references no
   asset of any kind today — no font, no image — so this costs nothing and
   closes the second door. */
assert.doesNotMatch(css, /url\(/,
  "site.css must reference no asset: a background-image is a bitmap plate too");

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

/* og:image lives in a content= attribute the link walker never visits. The
   files themselves are in common.mjs's required list, and check/cards.mjs
   reads what is inside them. */
assert.match(english, /og:image" content="https:\/\/k4cell\.com\/assets\/og-k4cell-en\.jpg"/);
assert.match(chinese, /og:image" content="https:\/\/k4cell\.com\/assets\/og-k4cell-zh\.jpg"/);

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
/* A submission history at another journal is the author's own record, not the
   page's business: it is not a claim, and publishing it discloses more than a
   reader needs to judge the work. The data stays in src/data/external.json,
   which the build never emits; the gate now makes sure it cannot leak back in.
   The peer-review status itself is unaffected and is asserted above. */
assert.doesNotMatch(both, /desk-rejected|编辑部初筛|Physical Review D/);
assert.doesNotMatch(`${JSON.stringify(status)}\n${JSON.stringify(ledger)}`,
  /desk-rejected|编辑部初筛|priorSubmission/);
/* RE-EXPRESSED 2026-08-30. This gate used to pin the author's term of art,
   "carrier-capped" / "载体封顶", so the machine section could never claim more
   than the certificates support. The rewrite drops the jargon from the public
   page (a term of art was never the safeguard; the sentence under it was), so
   the gate now gates that sentence: most certificates stop at a named input,
   and the missing piece of analysis is written into the statement as an
   explicit hypothesis, in the open. Same commitment, the page's own words. */
assert.match(english, /Most certificates stop at a named input/);
assert.match(english, /in plain view rather than buried/);
assert.match(chinese, /多数证书到某一步就停/);
assert.match(chinese, /写成一条点名的假设/);
assert.match(english, /What is not derived/);
assert.match(chinese, /哪些还没有推出来/);

/* ---- section 02: what it claims to explain ---- */


for (const deck of decks) {
  assert.equal(deck.explain.rows.length, 11, `${deck.dir}: the explain section must carry eleven rows`);
  /* MOVED 2026-08-30 to check/structure.mjs. The old hero promoted two CLAIMS
     to display size, so its honesty gate was written against deck.hero.asks /
     askRider / chips — copy fields that describe a hero that no longer exists.
     The new hero promotes one NUMBER, so the equivalent gate is now expressed
     against the rendered page: the promoted row's tier chip must name exactly
     the tiers implied by that ledger row's own open interfaces, and must link
     to the claim row it was lifted from. Same rule, current markup. */
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
]) {
  assert.doesNotMatch(both, forbidden, `forbidden string present: ${forbidden}`);
}

/* The banned NUMBERS are superseded Lean tallies, so they are banned from what
   the page prints rather than from its markup: an SVG coordinate that happens
   to read 774 is a false positive, and pinning a figure's geometry to dodge one
   would be the gate deforming the drawing instead of protecting the claim. */
const bothText = `${textOf(english)}\n${textOf(chinese)}`;
for (const forbidden of [/\b774\b/, /\b730\b/, /40,727/, /10,110/]) {
  assert.doesNotMatch(bothText, forbidden, `forbidden figure printed: ${forbidden}`);
}

/* AdS/CFT may appear only where the site disowns it as a premise, which is what
   the monograph's own abstract does. The 2026-08-30 rewrite drops the
   pre-emptive rebuttal it lived in, so the gate is now conditional: if the
   phrase ever comes back, it comes back once and with its disclaimer. */
assert.ok((english.match(/AdS\/CFT/gi) ?? []).length <= 1, "en: AdS/CFT may appear at most once");
assert.ok((chinese.match(/AdS\/CFT/gi) ?? []).length <= 1, "zh: AdS/CFT may appear at most once");
if (/AdS\/CFT/i.test(english)) assert.match(english, /AdS\/CFT are not premises of this route/);
if (/AdS\/CFT/i.test(chinese)) assert.match(chinese, /AdS\/CFT 都不是这条路线的前提/);

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

/* ---- the two bilingual shells ------------------------------------- *
 *
 * The root language gate and the 404 are served as <html lang="en"> and both
 * print Chinese inside it — the sentence and the button that offer the Chinese
 * page. Unmarked, a screen reader speaks those with English phonemes. Every
 * Han run on those two pages must therefore sit inside an element that
 * declares its own language. The 404 also shipped without the CSP <meta> the
 * other static pages carry: production is covered by site/_headers either way,
 * but a page opened from disk or served by anything else was not. */

/* read once, in common.mjs */
const HAN = /[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/;

for (const [name, page] of [["index.html", rootPage], ["404.html", notFoundPage]]) {
  assert.match(page, /<html lang="en">/, `${name}: the bilingual shell is served as an English document`);
  assert.match(page, /<meta http-equiv="Content-Security-Policy"/, `${name}: no CSP meta`);
  /* Strip every element that declares Chinese, then nothing Chinese may be left. */
  let rest = page;
  for (let pass = 0; pass < 8; pass += 1) {
    const next = rest.replace(/<(\w+)[^>]*\slang="zh-Hans"[^>]*>[\s\S]*?<\/\1>/g, " ");
    if (next === rest) break;
    rest = next;
  }
  const stray = textOf(rest).split("\n").find((line) => HAN.test(line));
  assert.equal(stray, undefined,
    `${name}: a Chinese run sits in an <html lang="en"> with no lang of its own — `
    + `wrap it in <span lang="zh-Hans">: ${String(stray).trim().slice(0, 60)}`);
  assert.match(page, /\slang="zh-Hans"/,
    `${name}: this page is bilingual and must mark its Chinese`);
}

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
assert.equal(status.public_science.start_gate.canonical_https_source_graph,
  "PASS@34a7aa92d2badc20d292a01a6be4770b1631ebb8");
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
assert.equal(officialStatus.publication.first_live_at_utc, "2026-08-30T10:37:33Z");
assert.equal(officialStatus.publication.source_commit, "34a7aa92d2badc20d292a01a6be4770b1631ebb8");
assert.equal(publicationReceipt.first_live_observed_at_utc, "2026-08-30T10:37:33Z");
assert.equal(publicationReceipt.first_publication_commit, "34a7aa92d2badc20d292a01a6be4770b1631ebb8");
assert.equal(publicationReceipt.verification.cryptographic_result, "PASS");
assert.equal(publicationReceipt.verification.validsig_signing_subkey_fingerprint,
  "0427411FA4820FDA5EBFB79B48D9A06D3C49431F");
assert.equal(publicationReceipt.verification.validsig_primary_fingerprint,
  "C74953F60AD573F54A3FD06C72213914E4860F47");
assert.equal(publicationReceipt.launch_boundary.official_mint, null);
assert.equal(publicationReceipt.launch_boundary.mainnet_authorized, false);
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
assert.match(officialPage, /github\.com\/magicknight\/k4cell\/tree\/34a7aa92d2badc20d292a01a6be4770b1631ebb8\/official-k4v/);
assert.match(officialPage, /PUBLICATION_RECEIPT_v1\.json/);
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

/* ---- every class the hand-written and notice pages use is styled ---- */

/* official-k4v/index.html is hand-written and links ../assets/site.css; the
   notice pages are templated but share the same small vocabulary. A stylesheet
   rewrite that dropped one of these names would leave the Founder attestation
   page unstyled with nothing failing, so every class they use must be a
   selector in the shipped stylesheet. */
const styledClasses = new Set(
  [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]));
for (const [name, page] of [["official-k4v", officialPage], ["notice-en", noticeEn], ["notice-zh", noticeZh]]) {
  const used = new Set([...page.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean));
  for (const cls of used) {
    assert.ok(styledClasses.has(cls), `${name}: class "${cls}" is used but site.css styles no .${cls}`);
  }
}

/* ---- the checksum manifest covers every file and every digest is right ---- */

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
