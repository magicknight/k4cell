#!/usr/bin/env python3
"""Open Graph cards for k4cell.com — the hero plate, the headline, and the same
three-clause concept-art label the page carries. Run by hand, not by the build.

  python3 tools/og_cards.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
ROOT = Path(__file__).resolve().parent.parent
PLATE = ROOT / "src" / "assets" / "hero-web-land.webp"
OUT = ROOT / "src" / "assets"

INK = (5, 7, 12)
PAPER = (244, 240, 229)
MUTED = (174, 180, 196)
MINT = (105, 230, 199)
VIOLET = (169, 140, 255)
AMBER = (255, 194, 108)

CARDS = {
    "en": {
        "title": ["Nobody knows why the universe", "runs on these numbers."],
        "deck": ["This work is an attempt to compute them instead —", "off one finite object, with no dial to turn."],
        "tag": "CONCEPT ART · NOT AN OBSERVATION · NOT THIS FRAMEWORK'S OUTPUT",
        "foot": ["0 continuous parameters fitted", "best 0.002 σ · worst 3.28 σ_eq", "not peer reviewed", "k4cell.com"],
    },
    "zh": {
        "title": ["没有人知道，", "宇宙为什么偏偏用这些数。"],
        "deck": ["这项工作试的是另一条路：把它们从一个有限的对象上算出来。", "那个对象里，没有一个可以拧的旋钮。"],
        "tag": "概念图 · 不是观测 · 也不是本框架的计算结果",
        "foot": ["拟合的连续参数 0 个", "最好 0.002 σ · 最差 3.28 σ_eq", "未经同行评议", "k4cell.com"],
    },
}

def font(paths, size):
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()

SERIF = ["/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"]
SANS = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
MONO = ["/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"]
CJK = [str(Path.home() / ".local/share/fonts/NotoSansCJKsc-Regular.otf"),
       "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"]
CJK_BOLD = [str(Path.home() / ".local/share/fonts/NotoSansCJKsc-Bold.otf")] + CJK

def build(lang, spec):
    plate = Image.open(PLATE).convert("RGB").resize((W, int(W * 1080 / 1920)), Image.LANCZOS)
    img = Image.new("RGB", (W, H), INK)
    img.paste(plate, (0, (H - plate.height) // 2))

    # Scrim: same shape as the page's, so the card cannot be more legible than
    # the design it advertises.
    scrim = Image.new("L", (W, 1))
    for x in range(W):
        u = x / W
        a = 247 - 215 * max(0.0, min(1.0, (u - 0.03) / 0.62)) ** 1.1
        scrim.putpixel((x, 0), int(max(30, a)))
    img = Image.composite(Image.new("RGB", (W, H), INK), img, scrim.resize((W, H)))

    d = ImageDraw.Draw(img)
    cjk = lang == "zh"
    f_title = font(CJK_BOLD if cjk else SERIF, 54 if cjk else 60)
    f_deck = font(CJK if cjk else SANS, 25 if cjk else 26)
    f_tag = font(CJK if cjk else MONO, 15 if cjk else 15)
    f_foot = font(CJK if cjk else MONO, 18)

    y = 92
    for line in spec["title"]:
        d.text((70, y), line, font=f_title, fill=PAPER)
        y += (72 if cjk else 74)
    y += 18
    for line in spec["deck"]:
        d.text((70, y), line, font=f_deck, fill=MUTED)
        y += 36

    # The label ships on the card, in a backing chip, exactly as on the page.
    tb = d.textbbox((0, 0), spec["tag"], font=f_tag)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    d.rounded_rectangle([70 - 10, 34 - 8, 70 + tw + 10, 34 + th + 12], 6,
                        fill=(5, 7, 12), outline=(60, 64, 76))
    d.text((70, 34), spec["tag"], font=f_tag, fill=MUTED)

    x = 70
    for i, item in enumerate(spec["foot"]):
        colour = (MINT, VIOLET, AMBER, MUTED)[i]
        d.text((x, H - 62), item, font=f_foot, fill=colour)
        x += d.textbbox((0, 0), item, font=f_foot)[2] + 34

    path = OUT / f"og-k4cell-{lang}.jpg"
    img.save(path, quality=88, optimize=True, progressive=True)
    print(f"  {path.name}  {path.stat().st_size} bytes")

if __name__ == "__main__":
    print("og cards:")
    for lang, spec in CARDS.items():
        build(lang, spec)
