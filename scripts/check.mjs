import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, "site");

const required = [
  "index.html",
  "en/index.html",
  "zh/index.html",
  "404.html",
  "assets/site.css",
  "assets/cell.js",
  "assets/favicon.svg",
  "provenance/README.md",
  "provenance/K4V_FOUNDER_OPENPGP_KEY_v1.asc",
  "provenance/K4V_FOUNDER_OPENPGP_FINGERPRINT_v1.txt",
  "status.json",
  "season-01.json",
  "robots.txt",
  "_headers",
  "SITE_SHA256SUMS.txt",
];

for (const path of required) await access(join(site, path));

const english = await readFile(join(site, "en", "index.html"), "utf8");
const chinese = await readFile(join(site, "zh", "index.html"), "utf8");
const rootPage = await readFile(join(site, "index.html"), "utf8");
const css = await readFile(join(site, "assets", "site.css"), "utf8");
const javascript = await readFile(join(site, "assets", "cell.js"), "utf8");
const headers = await readFile(join(site, "_headers"), "utf8");
const robots = await readFile(join(site, "robots.txt"), "utf8");
const status = JSON.parse(await readFile(join(site, "status.json"), "utf8"));
const season = JSON.parse(await readFile(join(site, "season-01.json"), "utf8"));
const checksumText = await readFile(join(site, "SITE_SHA256SUMS.txt"), "utf8");
const founderPublicKey = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_KEY_v1.asc"), "utf8");
const founderFingerprint = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_FINGERPRINT_v1.txt"), "utf8");

assert.match(english, /K4V has not launched/);
assert.match(chinese, /K4V 尚未发行/);
assert.match(english, /not settled physics/i);
assert.match(chinese, /不是已经定论的物理/);
assert.match(english, /finite K4 substrate → faithful physical realization/);
assert.match(chinese, /有限 K4 基底 → 忠实物理实现/);
assert.match(english, /meta name="robots" content="noindex,nofollow,noarchive"/);
assert.match(chinese, /meta name="robots" content="noindex,nofollow,noarchive"/);
assert.match(english, /Content-Security-Policy/);
assert.match(chinese, /Content-Security-Policy/);
assert.match(english, /hreflang="zh-Hans"/);
assert.match(chinese, /hreflang="en"/);
assert.match(rootPage, /href="en\/"/);
assert.match(rootPage, /href="zh\/"/);
assert.doesNotMatch(english, /<script(?![^>]*\bsrc=)/i);
assert.doesNotMatch(chinese, /<script(?![^>]*\bsrc=)/i);
assert.doesNotMatch(english, /<style\b/i);
assert.doesNotMatch(chinese, /<style\b/i);
assert.match(headers, /X-Robots-Tag: noindex, nofollow, noarchive/);
assert.equal(robots, "User-agent: *\nDisallow: /\n");

assert.equal(status.artifact_status, "PRELAUNCH_PREVIEW_NOINDEX");
assert.equal(status.science.peer_reviewed, false);
assert.equal(status.science.full_physical_realization, "OPEN");
assert.equal(status.science.full_scientific_reproduction_package, "OPEN");
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

assert.ok(Buffer.byteLength(javascript) < 16_000, "interactive JavaScript must remain below 16 KB uncompressed");
assert.ok(Buffer.byteLength(css) < 32_000, "CSS must remain below 32 KB uncompressed");
assert.doesNotMatch(`${english}\n${chinese}`, /full-order Einstein/i);
assert.doesNotMatch(`${english}\n${chinese}`, /official mint address/i);

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
assert.ok(totalBytes < 2 * 1024 * 1024, "preview site should remain below 2 MB before OG images");

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

const htmlFiles = files.filter((file) => file.endsWith(".html"));
for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
    const clean = reference.split(/[?#]/, 1)[0];
    const target = resolve(dirname(htmlFile), clean);
    assert.ok(target.startsWith(site), `path escapes deploy root: ${reference}`);
    const candidate = clean.endsWith("/") ? join(target, "index.html") : target;
    await access(candidate);
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
  season_cards: season.cards.length,
  indexable: false,
  official_mint: null,
}, null, 2));
