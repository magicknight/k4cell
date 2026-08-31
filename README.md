# K4 Cell Public Science

> Canonical domain: `https://k4cell.com`
>
> Scientific state: `CANDIDATE RESEARCH PROGRAM / NOT PEER REVIEWED / FULL PHYSICAL REALIZATION OPEN`

The bilingual public surface for the K4 Cell Framework. Its job is to put one
checkable, falsifiable, parameter-free comparison in front of a reader inside ten
seconds, and to attach to every number the evidence state, the open interface, and
the route by which the reader can attack it.

The page is built around a ledger, not around a pitch. It runs the object
before the numbers, the numbers before the classification, and it never puts a
caveat in front of the idea it qualifies:

```text
hero    one number, computed to 15 digits and checked to 8, and the bet
01 why  twenty-odd constants, every one of them turned by hand
02 the object            four points, six links, three colours, one rule
03 check one yourself    9 / 40, carried out by the reader
04 eleven whys           one journey, 10^-35 m to 10^26 m, tiered per claim
05 the numbers           digit rulers, the sigma axis, eleven rows in three lanes
06 how to kill it        six falsifiers, with the experiment and the year
07 the machine           727 of 771 Lean-certified, and what that does not mean
08 the boundary          the route with its open interfaces drawn as gaps
09 verify it             the checksum, the errata, the review targets
10 what happens next     dates, not a peroration
```

The page architecture, the visual system and the check gates are one design:
`scripts/lib/sections/page.mjs` renders it, `src/assets/site-body.css` plus one
palette out of `src/assets/themes/` is the entire visual system, and
`scripts/check/structure.mjs` pins the parts of both that carry meaning.

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

The hero readout, the digit rulers, all 81 basis states, every ledger row, the
pull bars, the sigma axis, the route map, the falsifier board and the Lean
sign-off are **server-rendered**. With JavaScript disabled the page carries the
entire argument; `tests/browser_check.py` runs a dedicated no-JS pass that
asserts this. JavaScript only adds five progressive enhancements: the 81-state
filter, the sweep, the division stepper, the interface kill switch, and two
observers (the hero readout lighting its digits, and `aria-current` on the nav).

Figure 1, the tetrahedron, animates from SMIL `<animate>` elements **generated
from the same `DEAL_WORDS` / `DEAL_LIT` tables the build asserts against the
81-state enumeration** — there is no hand-written copy of the timeline in the
stylesheet. Because CSS cannot switch SMIL off, the glyph ships twice: the
animated group and a still twin drawn at frame 0, and `prefers-reduced-motion`
chooses between them.

The Content-Security-Policy is `script-src 'self'; style-src 'self'`, so there is
no inline script, no inline style element, and no `style=` attribute anywhere —
`check/integrity.mjs` enforces all three.

## Colour has one meaning each

The stylesheet is warm paper, near-black ink, one accent and one warning
colour, and the build enforces the difference:

- `--fact` (the shipping palette's ochre) marks a **number** — a computed
  digit, a pull, a score, the bet's rule. Never a whole sentence, never a click
  target, never a section numeral or a nav state.
- `--link` is the only colour that means "click"; `--fg-0` marks the current
  nav item and the collided pair in the glyph.
- `--alert` (red) means **this is how the framework dies** and is allowed in
  one section, `#kill`. `check/structure.mjs` fails the build if any rule
  outside a kill-scoped selector reaches for it — and, since that section is
  also the site's one **inverted ground**, if the accent is painted inside it
  (the page's two warm values must never share a surface) or if a second dark
  ground appears anywhere else (it would inherit no ink remap and draw the
  page's ink on the page's ink).
- `--cut` is the warm line the figures draw for a cut, a hole or a 3 sigma
  rule — none of which is a warning.
- The three evidence tiers are **hue-free**: solid, hatched, dashed. The three
  site colours are separated by lightness as well as hue, so the 81-state grid
  survives greyscale, a photocopy, `forced-colors` and dichromacy.

Every colour is a token: a hex value outside the first `:root` block fails
`check/budgets.mjs`. `--col-read` caps every prose element, so no line of
Chinese runs past roughly forty glyphs at any viewport.

## The palette is swappable

`assets/site.css` is not written by hand. The build joins these files in this
order:

```text
src/assets/site-head.css                the masthead comment — the rules above. Comments only.
src/assets/themes/<name>.css            ONE :root{…} block: the palette. Nothing else.
src/assets/site-body.css                every rule of the visual system. Names no colour.
src/assets/themes/<name>.overrides.css  optional, appended last, and only for what a
                                        token cannot say. Writes no colour of its own.
```

The override sheet exists because a palette can restate a colour but not
**re-scope** one, and one thing on this page needs re-scoping: the falsifier
section inverts its ground, so on a light palette four ink tokens must be
remapped inside `.sec-kill`. Every value it writes has to be another token, and
`check/themes.mjs` refuses a hex, an `rgb()`, a second `:root`, a name the
contract does not hold, and any at-rule but `@media` / `@supports`. A palette
that needs no re-scoping ships no such file and composes to exactly the bytes
it composed before the mechanism existed.

The palette is a build **parameter**, never an environment read — two builds of
the same tree must agree byte for byte:

```bash
node scripts/build.mjs                      # theme: paper (the shipping palette)
node scripts/build.mjs --theme=<name> --out=<dir>
npm run preview                             # every theme, built outside the repo
```

`paper` was chosen on 2026-08-31, after all three were built and read at
length: it is the only one that removes halation rather than reducing it, the
only one on which the falsifier section can invert and become the page's one
visible landmark, and the only one on which a notice saying *K4V has not
launched* reads as a notice. `instrument` (the first dark palette) and `lifted`
(the conservative fix to it) are kept as alternates — one file each — because
they are the comparison that decision rests on. Nothing in the build treats
either as canonical.

To add a palette, copy `themes/paper.css`, change values, and run
`npm run preview`. `scripts/check/themes.mjs` refuses a theme that carries a
rule rather than a palette, or that declares a different **set** of custom
property names than the default one — a dropped name is a figure that quietly
loses its colour — and refuses an `assets/site.css` that is not the
concatenation of these sources, so a hand edit to the emitted sheet fails
the build instead of surviving to the next rebuild.

## Repository map

- `src/data/ledger.json` — every number on the page, with its source;
- `src/data/external.json` — journal submission status (never emitted);
- `src/copy/fragments/*.json` — **the copy source**: eight reviewed clusters,
  each a `{ zh, en }` pair covering one part of the page. This is the file a
  copy reviewer edits;
- `src/copy/{en,zh}.js` — the assembled decks, **generated** from the fragments
  by `npm run copy`; never hand-edited (see *The copy pipeline* below). All
  prose, both languages first-class. No user-visible string is written in
  `page.mjs` or in the stylesheet; the figure modules do derive a few sentences
  in code — `sigma.mjs` joins its lane sentences, and `route.mjs` writes two
  counted notes (how many rows fall through the gaps, and which row hangs on
  two interfaces and is therefore drawn twice) — and those are the only
  exceptions. Both are held to the same rules as the deck: the apostrophe gate
  now reads the built English pages, and the orientation gate reads the
  rendered caption;
- `src/assets/` — the stylesheet's sources (`site-head.css`,
  `themes/<name>.css`, an optional `themes/<name>.overrides.css`,
  `site-body.css`; see *The palette is swappable*), the interaction layer,
  favicon, OG cards;
- `scripts/build.mjs` — the entry: cross-deck asserts, then `emitSite`;
- `scripts/assemble-copy.mjs` — the copy assembler behind `npm run copy`;
- `scripts/lib/` — `paths data links html status emit`, `figures/` (ten files:
  the six numbered plates `deal imaginary hypercharge ruler sigma route`, the
  inline digit readouts `digits.mjs`, the 81-state grid `grid81.mjs`, the
  figure-numbering authority `order.mjs` and the SVG text measure `text.mjs`),
  `sections/page.mjs` (the page itself);
- `scripts/check.mjs` — the entry, printing the PASS JSON;
- `scripts/check/` — `copy.mjs` (the decks are what the fragments assemble to,
  every reviewed string — and every segment of one — reaches a reader, one
  apostrophe on the deck **and on the built English pages**), `integrity.mjs`
  (what the site may claim, the signed evidence, transport, checksums, links,
  and the two bilingual shells: CSP meta, and a `lang` on every Chinese run
  inside their `<html lang="en">`), `svgtext.mjs` (no figure label escapes its
  own viewBox), `orientation.mjs` (every plate ships in two orientations, so
  nothing outside a plate may point at a place inside one — see *Two
  orientations, one caption* below), `structure.mjs` (the DOM and copy
  contracts, the colour semantics, one fold label per page), `themes.mjs` (a
  palette is one `:root` block, every palette declares the same names, and the
  emitted sheet is the concatenation of its sources), `cards.mjs` (the two baked
  social cards are still pictures of *this* page — see *The social cards*
  below), `budgets.mjs` (bytes and tokens);
- `scripts/verify-determinism.mjs` — builds twice and diffs the manifests;
- `scripts/build-previews.mjs` — `npm run preview`: every palette built side by
  side, outside the repository, leaving `site/` alone;
- `tools/og_cards.py` — regenerates the OG cards from the copy decks and the
  shipping palette, and stamps each one with the record of what it drew from;
- `site/` — the generated deployable site;
- `docs/` — the frozen public-science protocol and the publication handoff;
- `provenance/` — Founder public OpenPGP key and fingerprint; no secret material.

## Two orientations, one caption

Every numbered plate is drawn twice — a wide build and a narrow/tall one — and
the stylesheet swaps them with `display`. The caption under them is printed
**once**. So any word in a caption that points at a place in the drawing is
true of at most one of the two builds:

```text
figure          wide build                 narrow build
Fig. 3 hy       four columns, one rule     name indented under its own row
Fig. 4 fr       digits run left to right   digits run down; the cut is a rule across
Fig. 5 sg       σ runs left to right       σ runs downward
Fig. 6 rt       chain runs left to right   chain runs top to bottom
```

The rule, enforced by `scripts/check/orientation.mjs`: **anything a reader sees
that is not inside one plate must hold for both plates** — the caption, the
figure's notes and legend, and every `aria-label`, since one description is
shared by both builds. Say what the drawing shows and name the relation
("the names are set in grey, apart from the numbers"), never the side.

Text *inside* an `<svg>` belongs to one plate and may name that plate's own
geometry. The gate checks those the other way round: a sentence that cannot be
written orientation-free without losing its teaching is written twice, once per
plate, and both halves must exist and must reach their own plate. Two figures
do that today — the hypercharge table's name note and the digit ruler's four
span labels — and they are declared in `PAIRED`. Nothing else may quietly go
one-sided, which would leave one build unlabelled.

## The copy pipeline

`src/copy/{zh,en}.js` are **generated**. The source is eight reviewed JSON
fragments under `src/copy/fragments/`, one per cluster of the page:

```text
front  whys-a  whys-b  whys-c  numbers  kill-machine  boundary  verify-next
```

Each fragment carries a `{ zh, en }` pair, so a copy reviewer works on one
section in two languages at a time instead of on a thousand-line deck. The
eleven claim rows arrive in three fragments (01–04, 05–08, 09–11) and are
concatenated in that order; `scripts/assemble-copy.mjs` merges them, refuses a
collision between two fragments, derives the `explain` view the figure modules
and the honesty gates read, and writes the two decks.

```bash
npm run copy      # fragments  ->  src/copy/{zh,en}.js
```

Both the fragments and the decks are checked in, on purpose: a deck is what a
copy reviewer and a `git diff` actually read, and the build must not depend on
a generator having been run in the right order. `scripts/check/copy.mjs` keeps
the two honest — it re-assembles in memory and compares byte for byte, so a
hand-edit to a deck, or a fragment edit that was never assembled, fails
`npm test` by name. The same module asserts that every string in both decks is
printed on some published page (a reviewed sentence that reaches no reader is a
sentence somebody will keep maintaining), and that one apostrophe is used
throughout — on the English deck and on the built English pages, which also
covers the two sentences the figure modules derive in code.

A reviewed string may arrive in **segments, one per line**, and the template
that prints it decides what a segment is: a claim's `answer` takes one
paragraph per segment, and in `rides` a segment opening with `- ` becomes one
`<li>`. Two claims use it — 09 and 11 break where the argument turns, and 08
lists the four open steps it leans on as four items instead of one sentence
with three semicolons. Each segment is checked for a reader separately, so a
template that silently drops one fails the build.

## Figure labels

SVG has no line box: a `<text>` wider than its `viewBox` is cut off by the
plate's own edge, silently, and usually in one language only. Every wrap in
`scripts/lib/figures/` is therefore measured by `figWidth` in `text.mjs`, whose
contract is that the size passed in is the size the **stylesheet** draws and
the advance is the **family** it draws in. `scripts/check/svgtext.mjs` then
re-measures every `<text>` the build emits — roughly 950 of them across both
languages — reading the size, family, tracking and anchor out of `site.css`
rather than from the call site, and fails the build on any box that leaves its
viewBox or any label the stylesheet gives no size to.

## The social cards

`assets/og-k4cell-{en,zh}.jpg` are the only pictures of this page that are
**baked**. Everything else is regenerated from the sources on every build, so a
headline edit or a palette swap reaches it automatically; a card is drawn once,
by hand, and then shown to every reader who meets the link before they meet the
page. That is the one artefact that can go quietly, durably wrong — and it did,
for a day, when the site left the dark ground and the cards went on previewing
it in near-black and amber.

```bash
python3 tools/og_cards.py      # after a headline edit or a palette change
```

The tool retypes nothing. The strings come out of `src/copy/{en,zh}.js`, the
object out of the same frame-0 table the page animates, and every colour out of
the shipping palette in `src/assets/themes/` — whose name it reads from
`scripts/lib/theme.mjs`. Then it writes, into each card's own JPEG comment
marker, the record of what it drew from: the palette values it inked with (as
the stylesheet writes them, including every alias it followed and the ground it
composited a scrim over) and the deck strings it printed, under the deck paths
they came from, with a SHA-256 over the lot.

`scripts/check/cards.mjs` reads that record back out of the shipped file,
recomputes it from `src/copy/` and `src/assets/themes/`, and fails `npm test`
naming the key that moved:

```text
assets/og-k4cell-en.jpg is stale — it is a picture of a page that has since changed:
    tokens.--bg-0: card has "#f4f2ec", the site now has "#080a0f"
    ...
  re-run `python3 tools/og_cards.py` and rebuild
```

The same tool writes the two lines in `provenance/HERO_PLATE_PROVENANCE.md`
that publish each card's size and stamp, so the written record cannot fall
behind the file it describes; the gate holds the record and the cards to each
other.

It also holds the card to 1200×630 and to its byte budget, refuses a card that
carries no stamp or a stamp edited by hand, and requires the review state —
*not peer reviewed* / *未经同行评议* — to be on the picture and not only on the
page. A social preview is the highest-velocity surface this project has and the
one most likely to be read by somebody who never opens the page.

## Budgets

Enforced by `scripts/check/budgets.mjs` on every build, and — for the two
baked cards — by `scripts/check/cards.mjs`:

| budget | cap | at the 2026-08-31 palette ship |
|---|---|---|
| `assets/app.js` | 48 000 B | 9 051 B |
| `assets/site.css` | 160 000 B | 94 572 B |
| `assets/og-k4cell-en.jpg` | 260 000 B | 72 512 B |
| `assets/og-k4cell-zh.jpg` | 260 000 B | 62 675 B |
| whole site | 3 MiB | 718 175 B |
| any one file | 25 MiB | — |
| hex outside the token block | 0 | 0 |

Both cards got *smaller* when the site went light — 141 KB → 73 KB and
131 KB → 63 KB — because a cream ground with a white disc behind the object
compresses far better than a near-black one with three coloured fields.

The stylesheet cap is generous on purpose: the site ships exactly one
stylesheet and no inline style, so that one file is the entire visual system,
including the CSS for every figure.

## Local use

```bash
npm run copy                                    # only after editing a fragment
python3 tools/og_cards.py                       # only after a headline or palette change
npm test                                        # build + validate
npm run preview                                 # every palette, outside the repo
python3 -m http.server 4173 --directory site
python3 tests/browser_check.py                  # needs Playwright + Chromium
node scripts/verify-determinism.mjs             # builds twice, diffs manifests
```

Set `K4CELL_TEST_BASE_URL` to run the acceptance suite against a deployed host.

## Evidence boundaries

- The public-review manuscript is a frozen historical review object, not a
  peer-reviewed publication and not settled physics.
- Exact finite and model-internal statements do not by themselves close the
  bridge to a faithful continuum theory of nature.
- Lean certification is a claim about logical structure, not about nature; most
  certificates stop at a named input written into the statement in the open,
  and the 44 non-certified rows are labelled with the reason.
- Funding-vault engineering reproduces funding infrastructure, not the K4
  science, and authorizes no token launch.

```text
K4V has not launched.
No official mint, presale, whitelist, or payment wallet exists.
```

See [the protocol](docs/PUBLIC_SCIENCE_PROTOCOL_v1.md) for the preregistered
season design, measurement rules, and stop conditions.
