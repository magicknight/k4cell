import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { ledger } from "./data.mjs";
import { officialK4vDir, predictionsDir, provenanceDir, seasonManifest, srcAssets } from "./paths.mjs";
import { status } from "./status.mjs";
import { DEFAULT_THEME, composeStylesheet, themeSourceNames } from "./theme.mjs";

/* ------------------------------------------------------------------ *
 * Emit: everything that lands in the output directory that is not a   *
 * rendered page. The frozen evidence (provenance/, official-k4v/,      *
 * predictions/) and the assets are copied byte for byte; the manifest  *
 * is written last.                                                     *
 * ------------------------------------------------------------------ */

export const SITEMAP_PATHS = ["", "en/", "zh/", "en/notice/", "zh/notice/", "official-k4v/", "predictions/"];

export const sitemapFor = (paths, lastmod) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) =>
  `  <url><loc>https://k4cell.com/${path}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n")}
</urlset>
`;

export const ROBOTS = "User-agent: *\nAllow: /\n\nSitemap: https://k4cell.com/sitemap.xml\n";
export const CNAME = "k4cell.com\n";
/* GitHub Pages ignores _headers; it is kept as the statement of intent and
   check/integrity.mjs requires it. */
export const HEADERS = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests

/assets/*
  Cache-Control: public, max-age=3600
`;

export const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

/* The stylesheet's source files are not assets; they are the parts
   assets/site.css is assembled from (lib/theme.mjs). Shipping them would put
   the body sheet on the site twice and every unbuilt palette beside it. */
const isStylesheetSource = (path) => {
  const relative = path.slice(srcAssets.length + 1);
  return themeSourceNames.some((name) => relative === name || relative.startsWith(`${name}/`));
};

/* Wipe the output and copy in the assets and the frozen evidence. The
   stylesheet arrives already composed, because the wipe below is destructive:
   a mistyped --theme must fail before site/ is deleted, not halfway through. */
export const prepareOut = async (out, stylesheet) => {
  await rm(out, { recursive: true, force: true });
  for (const directory of ["en/notice", "zh/notice", "assets", "provenance"]) {
    await mkdir(join(out, directory), { recursive: true });
  }
  await cp(srcAssets, join(out, "assets"), {
    recursive: true,
    filter: (source) => source === srcAssets || !isStylesheetSource(source),
  });
  await writeFile(join(out, "assets", "site.css"), stylesheet);
  await cp(provenanceDir, join(out, "provenance"), { recursive: true });
  await cp(officialK4vDir, join(out, "official-k4v"), { recursive: true });
  /* The signed prediction registry is published bytes: the page, the two
     configs, their schemas, the frozen ledger snapshot, the receipt and the
     author's own validators. It is copied, never generated and never
     reformatted — a rebuild that dropped it would delete a live section of
     the site. */
  await cp(predictionsDir, join(out, "predictions"), { recursive: true });
};

/* The machine-readable and transport files. */
export const writeStatic = async (out) => {
  await writeFile(join(out, "status.json"), json(status));
  await writeFile(join(out, "ledger.json"), json(ledger));
  await writeFile(join(out, "robots.txt"), ROBOTS);
  await writeFile(join(out, "sitemap.xml"), sitemapFor(SITEMAP_PATHS, ledger.recorded_at_utc));
  await writeFile(join(out, "CNAME"), CNAME);
  await writeFile(join(out, "_headers"), HEADERS);
  const manifest = JSON.parse(await readFile(seasonManifest, "utf8"));
  await writeFile(join(out, "season-01.json"), json(manifest));
};

export const walk = async (directory) => {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path));
    else paths.push(path);
  }
  return paths;
};

/* One `sha256  relpath` line per file, sorted, excluding only itself. Written
   last, so it covers everything. */
export const writeChecksums = async (out) => {
  const checksumLines = [];
  for (const file of (await walk(out)).sort()) {
    const bytes = await readFile(file);
    checksumLines.push(`${createHash("sha256").update(bytes).digest("hex")}  ${file.slice(out.length + 1)}`);
  }
  await writeFile(join(out, "SITE_SHA256SUMS.txt"), `${checksumLines.join("\n")}\n`);
};

/* html: { "<relative path>": "<document>" }. Directories are created as needed.
   `theme` names a file stem in src/assets/themes/ and defaults to the shipping
   palette; it is a parameter, never an environment read. */
export const emitSite = async ({ out, html, theme = DEFAULT_THEME }) => {
  const stylesheet = await composeStylesheet(theme);
  await prepareOut(out, stylesheet);
  for (const [path, document] of Object.entries(html)) {
    await mkdir(join(out, path, ".."), { recursive: true });
    await writeFile(join(out, path), document);
  }
  await writeStatic(out);
  await writeChecksums(out);
};
