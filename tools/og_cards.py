#!/usr/bin/env python3
"""Open Graph cards for k4cell.com.

The card says what the first screen says, in the same order and in the same
colours: the review state, the headline with its numerals in the accent, the
object itself, and the byline's honesty clause. Nothing is retyped — every
string is read out of src/copy/{en,zh}.js, and the tetrahedron is drawn from
the same frame-0 table that scripts/lib/figures/deal.mjs animates, so a card
cannot drift away from the page it advertises.

Every card carries, in its own JPEG comment marker, the record of what it was
drawn from: the palette it was inked in, token by token, and the deck strings
it printed. scripts/check/cards.mjs recomputes that record from the live
sources and fails `npm test` if it has moved — so a headline edit or a palette
swap cannot leave a card behind advertising a page that no longer exists.

It also writes the two lines in provenance/HERO_PLATE_PROVENANCE.md that
publish each card's size and stamp, so the written record cannot fall behind
the file it describes.

Run by hand, not by the build — after a headline edit or a palette change:

  python3 tools/og_cards.py
"""
import datetime
import hashlib
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets"

# ---------------------------------------------------------------------------
# The card is inked from the SHIPPING PALETTE, read here rather than typed.
# A card is the highest-velocity surface this site has, and a hard-coded
# palette is exactly the thing a theme swap leaves behind: it would go on
# advertising the page in the ground the page no longer has. So the values
# come out of src/assets/themes/<default>.css, whose name comes out of
# scripts/lib/theme.mjs. Change the theme and the next run of this script
# redraws the cards in it.
# ---------------------------------------------------------------------------


def shipping_theme():
    source = (ROOT / "scripts" / "lib" / "theme.mjs").read_text(encoding="utf8")
    match = re.search(r'DEFAULT_THEME\s*=\s*"([a-z0-9][a-z0-9-]*)"', source)
    assert match, "scripts/lib/theme.mjs names no DEFAULT_THEME"
    return match.group(1)


def palette(theme):
    """The theme's :root block as {name: 'value'}, comments dropped."""
    text = (ROOT / "src" / "assets" / "themes" / f"{theme}.css").read_text(encoding="utf8")
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    block = re.search(r":root\s*\{(.*?)\n\}", text, flags=re.S)
    assert block, f"themes/{theme}.css has no :root block"
    return {name.strip(): value.strip()
            for name, _, value in (part.partition(":") for part in block.group(1).split(";"))
            if name.strip().startswith("--")}


# Every token this card is inked with, as the stylesheet writes it. Filled by
# rgb() as it resolves, so it records what was actually READ — an alias it
# followed and the ground it composited a scrim over are in here too, and a
# value moving anywhere along that chain moves the stamp.
INKED = {}


def rgb(tokens, name, over=None, _seen=None):
    """One token as an opaque 8-bit triple. var() aliases are followed and a
    translucent value is composited over `over` (the ground, by default)."""
    _seen = _seen or set()
    assert name not in _seen, f"{name} resolves in a cycle"
    value = tokens[name]
    INKED[name] = value
    alias = re.fullmatch(r"var\(\s*(--[\w-]+)\s*\)", value)
    if alias:
        return rgb(tokens, alias.group(1), over, _seen | {name})
    hexes = re.fullmatch(r"#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})", value)
    if hexes:
        digits = hexes.group(1)
        if len(digits) == 3:
            digits = "".join(c * 2 for c in digits)
        return tuple(int(digits[i:i + 2], 16) for i in (0, 2, 4))
    scrim = re.fullmatch(r"rgba?\(([^)]*)\)", value)
    assert scrim, f"{name}: {value!r} is neither a hex nor an rgb()"
    parts = [float(x) for x in scrim.group(1).replace("/", ",").split(",")]
    r, g, b = parts[:3]
    a = parts[3] if len(parts) > 3 else 1.0
    base = over if over is not None else rgb(tokens, "--bg-0")
    return tuple(round(c * a + base[i] * (1 - a)) for i, c in enumerate((r, g, b)))


THEME = shipping_theme()
TOKENS = palette(THEME)
BG_0 = rgb(TOKENS, "--bg-0")
ORB = rgb(TOKENS, "--orb-3")          # the hero's own field behind the object
FG_0 = rgb(TOKENS, "--fg-0")
FG_1 = rgb(TOKENS, "--fg-1")
FG_2 = rgb(TOKENS, "--fg-2")
FG_3 = rgb(TOKENS, "--fg-3")
FACT = rgb(TOKENS, "--fact")
HAIR = rgb(TOKENS, "--hair", over=ORB)   # the ring is drawn on the field
RULE = rgb(TOKENS, "--hair-2")           # the footer rule is on the ground
SITE_COLOURS = tuple(rgb(TOKENS, n) for n in ("--c1", "--c2", "--c3"))

# Keyed by the deck PATH, not by a name of this script's own: the stamp records
# the same keys, so the gate can resolve each one against the live deck without
# either side holding a private translation table.
EYEBROW, TITLE, DECK, SUB, FOOT = (
    "footer.status", "hero.h1a", "hero.h1b", "hero.sub", "brand.tagline")

READ_DECKS = """
import en from "./src/copy/en.js";
import zh from "./src/copy/zh.js";
import { DEAL_WORDS, DEAL_LIT, DEAL_V, EDGE_NAMES } from "./scripts/lib/figures/deal.mjs";
import { EDGES } from "./scripts/lib/data.mjs";
const card = (c) => ({
  "footer.status": c.footer.status,
  "hero.h1a": c.hero.h1a,
  "hero.h1b": c.hero.h1b,
  "hero.sub": c.hero.sub,
  "brand.tagline": c.brand.tagline,
});
process.stdout.write(JSON.stringify({
  en: card(en), zh: card(zh),
  frame: { word: DEAL_WORDS[0], lit: DEAL_LIT[0], verts: DEAL_V, edges: EDGES, names: EDGE_NAMES },
}));
"""


def decks():
    """Read the copy decks and the glyph's frame 0 through node."""
    result = subprocess.run(
        ["node", "--input-type=module", "-e", READ_DECKS],
        cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def font(paths, size):
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


SERIF = ["/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"]
SERIF_BOLD = ["/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"] + SERIF
SANS = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
MONO = ["/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"]
CJK = [str(Path.home() / ".local/share/fonts/NotoSansCJKsc-Regular.otf"),
       "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"]
CJK_BOLD = [str(Path.home() / ".local/share/fonts/NotoSansCJKsc-Bold.otf")] + CJK

HAN = re.compile(r"[⺀-鿿＀-￯　-〿]")


def wrap(draw, text, fnt, width):
    """Break Han runs per glyph and Latin runs per word."""
    tokens, buffer = [], ""
    for character in text:
        if HAN.match(character):
            if buffer:
                tokens.append(buffer)
                buffer = ""
            tokens.append(character)
        elif character == " ":
            if buffer:
                tokens.append(buffer)
                buffer = ""
            tokens.append(" ")
        else:
            buffer += character
    if buffer:
        tokens.append(buffer)

    lines, line = [], ""
    for token in tokens:
        candidate = line + token
        if candidate.strip() and draw.textlength(candidate, font=fnt) > width and line.strip():
            lines.append(line.rstrip())
            line = "" if token == " " else token
        else:
            line = candidate
    if line.strip():
        lines.append(line.rstrip())
    return lines


def draw_numbered(draw, x, y, line, fnt, plain, accent):
    """The headline colours its numerals and nothing else — the page's rule."""
    for part in re.split(r"(\d+)", line):
        if not part:
            continue
        draw.text((x, y), part, font=fnt, fill=accent if part.isdigit() else plain)
        x += draw.textlength(part, font=fnt)


def draw_glyph(img, frame, box):
    """Frame 0 of the animated glyph: six links, one lit pair, three colours."""
    left, top, size = box
    # Drawn at 3x and downsampled, so the transparent pixels of this layer are
    # mixed into every antialiased edge. They are therefore filled with the
    # colour BEHIND the glyph rather than with the transparent black PIL
    # defaults to: LANCZOS over transparent black rings every dot and every
    # link in a dark fringe, which on cream reads as soot.
    layer = Image.new("RGBA", (size * 3, size * 3), (*ORB, 0))
    pen = ImageDraw.Draw(layer)
    xs = [v[0] for v in frame["verts"]]
    ys = [v[1] for v in frame["verts"]]
    span = max(max(xs) - min(xs), max(ys) - min(ys))
    scale = (size * 3) * 0.78 / span
    ox = (size * 3 - (max(xs) - min(xs)) * scale) / 2 - min(xs) * scale
    oy = (size * 3 - (max(ys) - min(ys)) * scale) / 2 - min(ys) * scale
    point = lambda i: (frame["verts"][i][0] * scale + ox, frame["verts"][i][1] * scale + oy)

    pen.ellipse([6, 6, size * 3 - 6, size * 3 - 6], outline=HAIR, width=3)
    for index, (a, b) in enumerate(frame["edges"]):
        lit = frame["names"][index] in frame["lit"]
        pen.line([point(a), point(b)],
                 fill=FG_0 if lit else (*FG_2, 90), width=12 if lit else 5)
    for site, colour in enumerate(frame["word"]):
        cx, cy = point(site)
        r = 26
        pen.ellipse([cx - r, cy - r, cx + r, cy + r], fill=SITE_COLOURS[colour])

    layer = layer.resize((size, size), Image.LANCZOS)
    img.alpha_composite(layer, (left, top))


# ---------------------------------------------------------------------------
# THE STAMP. A card is a picture of a page, baked once and then served to
# every reader who shares the link — so the one thing it cannot do is outlive
# what it is a picture of. Each card therefore carries, inside its own JPEG
# comment marker, the record of its inputs: the palette values it was inked
# with (as written in the stylesheet, aliases and composited grounds included)
# and the deck strings it printed, under the deck paths they came from.
# scripts/check/cards.mjs reads that record back out of the shipped file,
# recomputes it from src/copy/ and src/assets/themes/, and fails the build on
# any difference. The digest is over the canonical JSON below; Node's
# JSON.stringify of the same object, keys in sorted order, is byte-identical
# to it (every value is a string, so there is no number formatting to disagree
# about).
# ---------------------------------------------------------------------------

STAMP_MARK = "k4cell-og-card"
STAMP_VERSION = 1


def canonical(record):
    return json.dumps(record, sort_keys=True, ensure_ascii=False, separators=(",", ":"))


def stamp(lang, spec, frame):
    """The record this card is a picture of, and its digest."""
    record = {
        "mark": STAMP_MARK,
        "v": STAMP_VERSION,
        "lang": lang,
        "theme": THEME,
        "w": W,
        "h": H,
        # what the drawing is OF: the colour word, the pair the pigeonhole
        # lights, and the six link names. Not the vertex coordinates, which
        # are layout: a node moving two pixels does not make the card wrong.
        "frame": "|".join((
            "".join(str(colour) for colour in frame["word"]),
            ",".join(frame["lit"]),
            ",".join(frame["names"]))),
        "tokens": dict(sorted(INKED.items())),
        "text": dict(sorted(spec.items())),
    }
    digest = hashlib.sha256(canonical(record).encode("utf8")).hexdigest()
    # The marker carries the record AND its digest, so a reader with `strings`
    # can see what the card claims and check it, and the gate can name the key
    # that moved rather than only reporting a hash that did not match.
    return canonical({"record": record, "sha256": digest}), digest


def build(lang, spec, frame):
    eyebrow, title, deck, sub, foot = (spec[key] for key in
                                       (EYEBROW, TITLE, DECK, SUB, FOOT))
    cjk = lang == "zh"
    img = Image.new("RGBA", (W, H), BG_0)
    draw = ImageDraw.Draw(img)

    # the ground: the hero's own field, behind the object. On a dark palette
    # it is a lift out of the ground; on a light one --orb-3 is brighter than
    # the paper, so the object lands on a disc exactly as it does on the page.
    #
    # The disc is blurred in its ALPHA channel alone. Blurring a whole RGBA
    # layer blurs the transparent pixels' RGB with it, and PIL's transparent is
    # BLACK, so the fade carries black outward and rings the disc in grey:
    # measured on the first cut of this card at 185/243 against the paper, a
    # 58-level smudge that reads as a stain on the print rather than as light.
    halo = Image.new("L", (W, H), 0)
    ImageDraw.Draw(halo).ellipse([760, 60, 1240, 540], fill=255)
    glow = Image.new("RGBA", (W, H), (*ORB, 0))
    glow.putalpha(halo.filter(ImageFilter.GaussianBlur(60)))
    img.alpha_composite(glow)

    draw_glyph(img, frame, (770, 130, 380))

    f_eyebrow = font(CJK if cjk else MONO, 20)
    f_deck = font(CJK if cjk else SANS, 26)
    f_foot = font(CJK if cjk else MONO, 19)

    # Fit, never truncate. A headline cut in the middle of its own claim is
    # worse than a smaller headline, so the size comes down until both
    # sentences fit whole.
    column, room = 660, 306
    for size in range(50, 25, -2):
        f_title = font(CJK_BOLD if cjk else SERIF_BOLD, size)
        step = int(size * (1.36 if cjk else 1.32))
        title_lines = wrap(draw, title, f_title, column)
        deck_lines = wrap(draw, deck, f_title, column)
        if (len(title_lines) + len(deck_lines)) * step + 8 <= room:
            break
    else:
        raise SystemExit(f"{lang}: the headline will not fit the card")

    # the review state, first, small, exactly as the page's status line
    draw.line([(64, 66), (104, 66)], fill=FACT, width=3)
    draw.text((118, 54), eyebrow, font=f_eyebrow, fill=FG_2)

    y = 112
    for line in title_lines:
        draw_numbered(draw, 64, y, line, f_title, FG_0, FACT)
        y += step
    y += 8
    for line in deck_lines:
        draw_numbered(draw, 64, y, line, f_title, FG_1, FACT)
        y += step

    y += 16
    sub_lines = wrap(draw, sub, f_deck, 640)
    assert len(sub_lines) <= 3, f"{lang}: the subtitle does not fit the card"
    for line in sub_lines:
        draw.text((64, y), line, font=f_deck, fill=FG_2)
        y += 38
    assert y < H - 104, f"{lang}: the card overflows its footer rule"

    draw.line([(64, H - 96), (W - 64, H - 96)], fill=RULE, width=1)
    draw.text((64, H - 74), foot, font=f_foot, fill=FG_3)
    domain = "k4cell.com"
    draw.text((W - 64 - draw.textlength(domain, font=f_foot), H - 74), domain, font=f_foot, fill=FG_2)

    record, digest = stamp(lang, spec, frame)
    path = OUT / f"og-k4cell-{lang}.jpg"
    img.convert("RGB").save(path, quality=86, optimize=True, progressive=True,
                            comment=record.encode("utf8"))
    print(f"  {path.name}  {path.stat().st_size} bytes  {digest[:16]}…")
    return path, digest


# ---------------------------------------------------------------------------
# THE WRITTEN RECORD. provenance/HERO_PLATE_PROVENANCE.md publishes what these
# two files are, at what size, and what they were drawn from. A record of a
# generated artefact goes stale exactly the way the artefact does — and worse,
# because it is read by people rather than by the build. So this script writes
# it, rather than asking whoever runs the script to remember; check/cards.mjs
# then holds the record to the cards, which catches a hand edit to either.
# ---------------------------------------------------------------------------

RECORD = ROOT / "provenance" / "HERO_PLATE_PROVENANCE.md"


def record(built):
    text = RECORD.read_text(encoding="utf8")
    drawn = datetime.date.today().isoformat()
    for path, digest in built:
        block = re.compile(rf"^{re.escape(path.name)} +.*\n^  stamp sha256 .*$", re.M)
        assert block.search(text), f"{RECORD.name} has no record block for {path.name}"
        line = (f"{path.name}  {W}x{H}   {path.stat().st_size} B   "
                f"drawn {drawn}, palette `{THEME}`\n  stamp sha256 {digest}")
        # A callable replacement, so nothing in the record is read as a
        # backreference; the record is data, not a pattern.
        text = block.sub(lambda _: line, text)
    RECORD.write_text(text, encoding="utf8")
    print(f"  {RECORD.relative_to(ROOT)} updated")


if __name__ == "__main__":
    data = decks()
    print(f"og cards (palette: {THEME}, ground #%02x%02x%02x):" % BG_0)
    written = []
    for language in ("en", "zh"):
        spec = data[language]
        # The honesty clause is not decoration: if it ever falls out of the
        # deck string this card is drawing, the card must not be written.
        clause = "not peer reviewed" if language == "en" else "未经同行评议"
        assert clause in spec[EYEBROW], f"{language}: the card must carry “{clause}”"
        written.append(build(language, spec, data["frame"]))
        assert written[-1][0].stat().st_size < 260_000, f"{written[-1][0].name} is over budget"
    record(written)
