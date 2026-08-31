# Hero plate and social cards — provenance

## The hero plate was withdrawn on 2026-08-31

**The two hero plates no longer ship.** They were removed with the dark ground
they were painted for, when the site adopted the `paper` palette. This file is
kept as the record of what was once published, so that a copy of the site taken
while they were deployed can be identified and accounted for.

They had in fact stopped being *used* before they stopped being *deployed*: the
2026-08-30 rewrite replaced the image-backed hero with a server-rendered
tetrahedron, and after it no page and no rule in the stylesheet referenced
either file. For their last day they were 224 KB of unreferenced payload.

The generator, `tools/hero_plate.py`, was deleted with them: it wrote only
these two files and its own contrast gate was tied to a `.hero-band::after`
rule the rewrite had already removed. Both the generator and the binaries are
in the repository's history.

## What the image was

It is **concept art**: a toy simulation rendered on the author's machine. It
was not an observation, and no quantity from the K4 Cell Framework entered it
at any point.

A Zel'dovich (1970) first-order displacement of a uniform Lagrangian grid,
seeded by a Gaussian random field with a scale-free spectrum and a Gaussian
small-scale cut, cloud-in-cell deposited and tone-mapped through the site's own
colour tokens. This is the textbook toy that produces the filament / node /
void morphology of large-scale structure. No telescope data was used. Nothing
in it was fitted to anything.

## Record of what was published

```text
generator        tools/hero_plate.py   (deleted 2026-08-31)
seed             20260830
toolchain        numpy 1.26.4, Pillow 9.4.0, Python 3.10
generated        2026-08-30 UTC
withdrawn        2026-08-31 UTC

hero-web-land.webp  1920x1080   99102 B
  sha256 920e28bdd780353c70ee5a1dd844fc8021ba41028c9f67028c89e915f631f638
hero-web-port.webp  1080x1440  125662 B
  sha256 0b1898a10358a1428f9e4340185f6ee31251266da310878bac6f457cab440203
```

## Social cards — these still ship

`tools/og_cards.py` draws the cards from the copy decks and from frame 0 of the
same tetrahedron table the page animates. It has never used the hero plate; the
field behind the object on the card is drawn from the palette's own `--orb-*`
tokens, like the page's. Since 2026-08-31 every colour on the card is read out
of the shipping theme in `src/assets/themes/`, so the card cannot advertise a
page in a palette the page no longer has.

The cards carry the review status, the headline, the headline's own
qualification — *experiment can check only the first 8* — and the object.
Social previews are the highest-velocity surface for the misreading that the
review label exists to prevent, so the label ships on the cards as well as on
the page. **That is a requirement, not a layout choice**, and since 2026-08-31
it is enforced twice: `tools/og_cards.py` refuses to write a card whose status
line has lost the clause, and `scripts/check/cards.mjs` refuses to ship one.

```text
og-k4cell-en.jpg  1200x630   76208 B   drawn 2026-08-31, palette `paper`
  stamp sha256 31ab69ca3a694bb6e8988c22f3268896781bb35cd370dd42ee1a8e630613b7cb
og-k4cell-zh.jpg  1200x630   67728 B   drawn 2026-08-31, palette `paper`
  stamp sha256 561a6586dbcfb9f7dabf00d59cfc727fab08f6d8129f2662539c2114d6177f10
```

**The four lines above are written by `tools/og_cards.py`, not by hand.** A
record of a generated file goes stale the way the file does, so the script that
draws the cards is the thing that says what they are; `scripts/check/cards.mjs`
then holds these lines to the two files, and fails the build if either side has
been edited alone.

The stamp is not a hash of the file. It is a SHA-256 over the record of what
the card was **drawn from** — the palette values, token by token, and the deck
strings, under the deck paths they came from — and it is written into the JPEG's
own comment marker, so it travels with the picture and cannot be separated from
it. `scripts/check/cards.mjs` recomputes that record from the live sources on
every build; a headline edit or a palette change that does not reach the cards
now fails `npm test` by name. Read a card's own account of itself with:

```bash
python3 -c "from PIL import Image; print(Image.open('src/assets/og-k4cell-en.jpg').info['comment'].decode())"
```

The Chinese card is set in Noto Sans CJK SC: this machine has no CJK serif, so
the Han headline is sans where the page's `--han-serif` stack would resolve to
Songti or Noto Serif CJK. The Latin card uses DejaVu Serif. Regenerating on a
machine with a Han serif installed will change the Chinese card's type, and
should.

Regenerate by hand with `python3 tools/og_cards.py`; rebuild, and commit both
the cards and the rebuilt `site/`.
