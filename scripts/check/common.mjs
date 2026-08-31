/* Shared by the three check modules: where the site is, the required-file
   list, every emitted file read once, and the text helpers. No gate lives
   here. */

import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
export const site = join(root, "site");

/* Output paths the site must ship. Add when a page is added; never remove
   without updating the gate that reads the file. */
export const required = [
  "index.html",
  "en/index.html",
  "zh/index.html",
  "en/notice/index.html",
  "zh/notice/index.html",
  "404.html",
  "assets/site.css",
  "assets/app.js",
  "assets/favicon.svg",
  "assets/og-k4cell-en.jpg",
  "assets/og-k4cell-zh.jpg",
  "provenance/README.md",
  "provenance/K4V_FOUNDER_OPENPGP_KEY_v1.asc",
  "provenance/K4V_FOUNDER_OPENPGP_KEY_v2.asc",
  "provenance/K4V_FOUNDER_OPENPGP_FINGERPRINT_v1.txt",
  "provenance/K4V_FOUNDER_OPENPGP_FINGERPRINT_v2.txt",
  "provenance/tests/SERVER_SIGNING_SUBKEY_TEST_v1.txt",
  "provenance/tests/SERVER_SIGNING_SUBKEY_TEST_v1.txt.asc",
  "provenance/tests/VERIFICATION.md",
  "provenance/SCIENCE_VALIDATION_PUBLIC_COMMUNICATION_BOUNDARY_v1.md",
  "official-k4v/index.html",
  "official-k4v/official-k4v.v1.json",
  "official-k4v/K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt",
  "official-k4v/K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt.asc",
  "official-k4v/VERIFY.md",
  "official-k4v/PUBLICATION_RECEIPT_v1.json",
  "predictions/index.html",
  "predictions/README.md",
  "predictions/schemas/k4_prediction_registry.schema.json",
  "predictions/schemas/k4_claim_observability_inventory.schema.json",
  "predictions/config/K4_PREDICTION_REGISTRY_v0.1.json",
  "predictions/config/K4_CLAIM_OBSERVABILITY_INVENTORY_v0.1.json",
  "predictions/validate_prediction_registry.py",
  "predictions/test_prediction_registry.py",
  "predictions/evidence/snapshots/K4CELL_LEDGER_5ac0ca2.json",
  "predictions/PUBLICATION_RECEIPT_v0.1.json",
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

export const english = await readFile(join(site, "en", "index.html"), "utf8");
export const chinese = await readFile(join(site, "zh", "index.html"), "utf8");
export const rootPage = await readFile(join(site, "index.html"), "utf8");
export const noticeEn = await readFile(join(site, "en", "notice", "index.html"), "utf8");
export const noticeZh = await readFile(join(site, "zh", "notice", "index.html"), "utf8");
export const css = await readFile(join(site, "assets", "site.css"), "utf8");
export const javascript = await readFile(join(site, "assets", "app.js"), "utf8");
export const headers = await readFile(join(site, "_headers"), "utf8");
export const robots = await readFile(join(site, "robots.txt"), "utf8");
export const cname = await readFile(join(site, "CNAME"), "utf8");
export const status = JSON.parse(await readFile(join(site, "status.json"), "utf8"));
export const ledger = JSON.parse(await readFile(join(site, "ledger.json"), "utf8"));
export const season = JSON.parse(await readFile(join(site, "season-01.json"), "utf8"));
export const checksumText = await readFile(join(site, "SITE_SHA256SUMS.txt"), "utf8");
export const founderPublicKey = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_KEY_v1.asc"), "utf8");
export const founderPublicKeyV2 = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_KEY_v2.asc"), "utf8");
export const founderFingerprint = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_FINGERPRINT_v1.txt"), "utf8");
export const founderFingerprintV2 = await readFile(join(site, "provenance", "K4V_FOUNDER_OPENPGP_FINGERPRINT_v2.txt"), "utf8");
export const founderTestPayloadPath = join(site, "provenance", "tests", "SERVER_SIGNING_SUBKEY_TEST_v1.txt");
export const founderTestSignaturePath = `${founderTestPayloadPath}.asc`;
export const founderTestPayload = await readFile(founderTestPayloadPath);
export const founderTestSignature = await readFile(founderTestSignaturePath);
export const officialPage = await readFile(join(site, "official-k4v", "index.html"), "utf8");
export const notFoundPage = await readFile(join(site, "404.html"), "utf8");
export const officialStatus = JSON.parse(await readFile(join(site, "official-k4v", "official-k4v.v1.json"), "utf8"));
export const officialPayloadPath = join(site, "official-k4v", "K4V_NO_OFFICIAL_MINT_ATTESTATION_v1.txt");
export const officialSignaturePath = `${officialPayloadPath}.asc`;
export const officialPayload = await readFile(officialPayloadPath);
export const officialSignature = await readFile(officialSignaturePath);
export const publicationReceipt = JSON.parse(await readFile(join(site, "official-k4v", "PUBLICATION_RECEIPT_v1.json"), "utf8"));
export const predictionPage = await readFile(join(site, "predictions", "index.html"), "utf8");
export const predictionRegistry = JSON.parse(await readFile(join(site, "predictions", "config", "K4_PREDICTION_REGISTRY_v0.1.json"), "utf8"));
export const observabilityInventory = JSON.parse(await readFile(join(site, "predictions", "config", "K4_CLAIM_OBSERVABILITY_INVENTORY_v0.1.json"), "utf8"));
export const predictionPublicationReceipt = JSON.parse(await readFile(join(site, "predictions", "PUBLICATION_RECEIPT_v0.1.json"), "utf8"));

export const both = `${english}\n${chinese}`;

/* ---- the load-bearing numbers must be present in the STATIC html ---- */

/* The digit ruler renders one <span> per character, so numeric strings are only
   contiguous once the tags are stripped. Checking the text is the point: it is
   what a reader with JavaScript disabled actually sees. */
export const textOf = (html) => html.replace(/<[^>]*>/g, "");
/* The PDF checksum starts "727..." and would otherwise satisfy a bare substring
   test for any headline figure, making those guards unfailable. */
export const hexless = (text) => text.replace(/[0-9a-f]{16,}/gi, " ");
export const searchable = (value) => (/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value)
  ? String(value).split(/e/i)[0]
  : String(value));

export const decks = await Promise.all([
  import("../../src/copy/en.js"), import("../../src/copy/zh.js"),
]).then((mods) => mods.map((m) => m.default));

export const walk = async (directory) => {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path));
    else paths.push(path);
  }
  return paths;
};

export const files = await walk(site);
