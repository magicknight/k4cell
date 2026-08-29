# K4 Cell Public Science

> Status: `PRELAUNCH PREVIEW / NOINDEX / NO OFFICIAL K4V MINT`
>
> Intended canonical domain: `https://k4cell.com`
>
> Scientific state: `CANDIDATE RESEARCH PROGRAM / NOT PEER REVIEWED / FULL PHYSICAL REALIZATION OPEN`

This independent public repository builds the bilingual public-science surface
for the K4 Cell Framework. Its purpose is to make one high-value research object
visible, navigable, and challengeable without turning publicity, popularity, or
funding into scientific evidence.

The public story is deliberately science-first:

```text
one finite K4 cell
  -> an inspectable candidate route
  -> explicit evidence states and open bridges
  -> public criticism and participation
  -> measured attention and voluntary support
  -> only then, a token / no-token decision
```

## Current publication gate

The generated site is a non-indexed preview. The public-science season does not
start until all of these are true:

1. the frozen public-review status surface is synchronized without changing the
   historical PDF bytes;
2. the Founder signs the exact `NO OFFICIAL MINT` payload outside Git, chat, and
   CI;
3. the signed record and canonical domain link to one another;
4. the twelve season cards, cohort rule, metrics dictionary, and stop rules are
   frozen by commit;
5. the canonical domain passes HTTPS, mobile, accessibility, and content-boundary
   validation.

Until then:

```text
K4V has not launched.
No official mint, presale, whitelist, or payment wallet exists.
```

## Repository map

- `src/` — source content, visual system, and interaction code;
- `scripts/build.mjs` — deterministic, dependency-free static build;
- `scripts/check.mjs` — structural, scope, link, and size validation;
- `site/` — generated deployable site;
- `docs/PUBLIC_SCIENCE_PROTOCOL_v1.md` — frozen experiment design;
- `docs/PUBLICATION_AND_DOMAIN_HANDOFF.md` — DNS, HTTPS, publication, and rollback gate;
- `docs/IMPACT_REGRESSION_2026-08-29.md` — value and scope comparison against the earlier public surface;
- `content/season-01/` — twelve bilingual content-card specifications;
- `.github/workflows/pages.yml` — build, validate, and GitHub Pages deployment.

## Local use

```bash
npm test
python3 -m http.server 4173 --directory site
```

Then open `http://127.0.0.1:4173/`.

With Python Playwright and Chromium available, the desktop/mobile interaction
acceptance run is:

```bash
python3 tests/browser_check.py
```

## Evidence boundaries

- The current public-review manuscript is a frozen historical review object,
  not a peer-reviewed publication or settled physics.
- Exact finite/model-internal statements do not by themselves close the bridge
  to a faithful continuum theory of nature.
- Funding-vault engineering reproduces funding infrastructure, not the K4
  scientific theory, and authorizes no token launch.
- A missing bridge remains `OPEN`; it neither becomes established through
  attention nor silently deletes independent surviving structure.

See [the protocol](docs/PUBLIC_SCIENCE_PROTOCOL_v1.md) for the target quantifier,
measurement rules, and stop conditions.
