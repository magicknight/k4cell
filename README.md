# K4 Cell Public Science

> Canonical domain: `https://k4cell.com`
>
> Scientific state: `CANDIDATE RESEARCH PROGRAM / NOT PEER REVIEWED / FULL PHYSICAL REALIZATION OPEN`

The bilingual public surface for the K4 Cell Framework. Its job is to put one
checkable, falsifiable, parameter-free comparison in front of a reader inside ten
seconds, and to attach to every number the evidence state, the open interface, and
the route by which the reader can attack it.

The page is built around a ledger, not around a pitch:

```text
one number the reader can check
  -> what the object actually is
  -> every computed row, worst agreement first
  -> what went in (nothing you can turn)
  -> the route, with its open interfaces drawn as gaps
  -> what would kill it, and roughly when
  -> what is not derived
  -> what the machine checked, and what that does not mean
  -> verify this page yourself
```

## Numeric integrity

Every figure printed on the site comes from `src/data/ledger.json`. No numeric
literal appears in a template. At build time `scripts/build.mjs` **recomputes**
the resolved-digit count `floor(log10(|x|/σ)) + 1` and the pull `|pred − meas|/σ`
for every row and asserts them against the stored values; it enumerates all 81
basis states and asserts the census (36/24/18/3), the total of 162 same-colour
edges, and the mean of exactly 2. `scripts/check.mjs` then re-asserts the same
quantities against the built HTML.

If a figure on the page ever disagrees with the manuscript, the build fails
rather than publishing the disagreement.

## Static first

Hero, digit rulers, all 81 basis states, every ledger row, the pull bars, the
route map, the falsifier board and the Lean sign-off bar are **server-rendered**.
With JavaScript disabled the page carries the entire argument; `tests/browser_check.py`
runs a dedicated no-JS pass that asserts this. JavaScript only adds the filters,
the sweep, the division stepper and the interface kill switch.

The Content-Security-Policy is `script-src 'self'; style-src 'self'`, so there is
no inline script, no inline style element, and no `style=` attribute anywhere —
`check.mjs` enforces all three.

## Repository map

- `src/data/ledger.json` — every number on the page, with its source;
- `src/data/external.json` — journal submission status;
- `src/copy/{en,zh}.js` — all prose, both languages first-class;
- `src/assets/` — stylesheet, interaction layer, favicon, OG images;
- `scripts/build.mjs` — deterministic dependency-free build with numeric asserts;
- `scripts/check.mjs` — structural, honesty, budget, link and checksum validation;
- `site/` — the generated deployable site;
- `docs/` — the frozen public-science protocol and the publication handoff;
- `provenance/` — Founder public OpenPGP key and fingerprint; no secret material.

## Local use

```bash
npm test                                        # build + validate
python3 -m http.server 4173 --directory site
python3 tests/browser_check.py                  # needs Playwright + Chromium
```

Set `K4CELL_TEST_BASE_URL` to run the acceptance suite against a deployed host.

## Deployment blocker

`k4cell.com` currently serves GitHub's `*.github.io` certificate, so **HTTPS
fails in every browser**. The apex A records are incomplete — DNS has only
`185.199.108.153` and `185.199.109.153`; GitHub Pages requires all four:

```text
185.199.108.153   185.199.109.153   185.199.110.153   185.199.111.153
```

Add the two missing records, then re-save the custom domain in Settings → Pages
to trigger certificate issuance, then enable Enforce HTTPS. Verify with:

```bash
echo | openssl s_client -connect k4cell.com:443 -servername k4cell.com 2>/dev/null \
  | openssl x509 -noout -subject
```

It must print `subject=CN = k4cell.com`. Until it does, the site is only reachable
over plain HTTP.

## Evidence boundaries

- The public-review manuscript is a frozen historical review object, not a
  peer-reviewed publication and not settled physics.
- Exact finite and model-internal statements do not by themselves close the
  bridge to a faithful continuum theory of nature.
- Lean certification is a claim about logical structure, not about nature; most
  certificates are carrier-capped, and the 44 non-certified rows are labelled.
- Funding-vault engineering reproduces funding infrastructure, not the K4
  science, and authorizes no token launch.

```text
K4V has not launched.
No official mint, presale, whitelist, or payment wallet exists.
```

See [the protocol](docs/PUBLIC_SCIENCE_PROTOCOL_v1.md) for the preregistered
season design, measurement rules, and stop conditions.
