/* ------------------------------------------------------------------ *
 * HTML primitives shared by every page and figure: the escaper, the   *
 * language-aware colon, the brand mark, and the <head> builder.       *
 * ------------------------------------------------------------------ */

export const esc = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

/* Chinese takes a full-width colon; English a half-width one plus a space. */
export const colon = (copy) => (copy.dir === "zh" ? "：" : ": ");

export const brandMark = `<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
<path d="M16 3 4 24h24Z"/><line x1="16" y1="3" x2="16" y2="18"/><line x1="4" y1="24" x2="16" y2="18"/><line x1="28" y1="24" x2="16" y2="18"/>
<circle cx="16" cy="3" r="2"/><circle cx="4" cy="24" r="2"/><circle cx="28" cy="24" r="2"/><circle cx="16" cy="18" r="2"/></svg>`;

/* ---- the <head> ------------------------------------------------------ */

export const SITE_ORIGIN = "https://k4cell.com";

/* Two policies. The main pages load ../assets/app.js, so they allow
   script-src 'self'; every other page omits script-src entirely, so its
   default-src blocks scripts. No inline style or script anywhere. */
export const CSP = {
  page: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests",
  static: "default-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'",
};

/* The hreflang triple every language-gated page announces. */
export const ALTERNATES = [["en", "en/"], ["zh-Hans", "zh/"], ["x-default", ""]];

/* <meta name="theme-color"> is the page's ground, painted by the BROWSER —
   Android's toolbar, Safari's — outside anything the stylesheet can reach. So
   it is not a value that may be typed here: it is the palette's own --bg-0,
   read out of the theme the build was asked for (lib/theme.mjs `groundOf`)
   and passed down as `themeColor`. A literal here is a colour that survives a
   theme swap and paints the browser's chrome in the previous palette's
   ground; check/themes.mjs asserts the emitted tag against the emitted token
   so that cannot come back. */
export const assertThemeColour = (value) => {
  if (!/^#[0-9a-f]{3,8}$/.test(String(value))) {
    throw new Error(`the page head needs the theme's ground as themeColor, got ${JSON.stringify(value)}`);
  }
  return value;
};

/* The tags of a page head, grouped into output lines.
 *
 *   description   plain text (escaped here)
 *   title         HTML (caller escapes; the root page carries an entity)
 *   csp           "page" | "static"
 *   canonical     path under SITE_ORIGIN, e.g. "en/" or "" (root)
 *   alternates    emit the hreflang triple
 *   assetRoot     prefix from the page to /assets, e.g. "../" or ""
 *   og            { title, description, url, image } or null
 *   robotsFirst   robots meta before description (notice and root pages)
 *   compact       the root page packs related tags on one line
 *   themeColor    the palette's --bg-0; see assertThemeColour above
 */
export const headGroups = ({
  description, title, csp = "static", canonical, alternates = false,
  assetRoot = "", og = null, robotsFirst = false, compact = false, themeColor,
}) => {
  const charset = `<meta charset="utf-8">`;
  const viewport = `<meta name="viewport" content="width=device-width,initial-scale=1">`;
  const theme = `<meta name="theme-color" content="${assertThemeColour(themeColor)}">`;
  const desc = `<meta name="description" content="${esc(description)}">`;
  const robots = `<meta name="robots" content="index,follow">`;
  const policy = `<meta http-equiv="Content-Security-Policy" content="${CSP[csp]}">`;
  const canon = `<link rel="canonical" href="${SITE_ORIGIN}/${canonical}">`;
  const alts = alternates
    ? ALTERNATES.map(([lang, path]) => `<link rel="alternate" hreflang="${lang}" href="${SITE_ORIGIN}/${path}">`)
    : [];
  const icon = `<link rel="icon" href="${assetRoot}assets/favicon.svg" type="image/svg+xml">`;
  const sheet = `<link rel="stylesheet" href="${assetRoot}assets/site.css">`;
  const social = og ? [
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(og.title)}">`,
    `<meta property="og:description" content="${esc(og.description)}">`,
    `<meta property="og:url" content="${og.url}">`,
    `<meta property="og:image" content="${og.image}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ] : [];
  const titleTag = `<title>${title}</title>`;

  if (compact) {
    return [[charset, viewport], [theme, robots], [desc], [policy], [canon, ...alts], [icon, sheet],
      ...social.map((tag) => [tag]), [titleTag]];
  }
  return [[charset], [viewport], [theme],
    ...(robotsFirst ? [[robots], [desc]] : [[desc], [robots]]),
    [policy], [canon], ...alts.map((tag) => [tag]), [icon], [sheet],
    ...social.map((tag) => [tag]), [titleTag]];
};

export const renderHead = (spec) =>
  `<head>\n  ${headGroups(spec).map((group) => group.join("")).join("\n  ")}\n</head>`;

/* The og:* block for a main language page. */
export const ogFor = (copy) => ({
  title: copy.title,
  description: copy.description,
  url: `${SITE_ORIGIN}/${copy.dir}/`,
  image: `${SITE_ORIGIN}/assets/og-k4cell-${copy.dir}.jpg`,
});
