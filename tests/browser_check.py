#!/usr/bin/env python3
"""Browser acceptance suite for a running preview of the K4 Cell site.

Three things are checked, and they matter more than pixels:

  1. with JavaScript DISABLED the whole argument is still on the page — the
     81 states, the digit split, the eleven claims and their tiers, the six
     falsifiers, every load-bearing number, and none of the retracted or
     banned phrases;
  2. the interactions that teach something actually change the page;
  3. on a 390-wide phone the object and the readout are reachable inside the
     first three screens, and nothing overflows sideways;
  4. at sixteen widths from 320 to 2560, in both languages, the page never
     scrolls sideways and no SVG label is cut off by its own plate.

Run against a local preview:
    node scripts/build.mjs
    python3 -m http.server 4173 --directory site &
    python3 tests/browser_check.py
"""

import os
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright

BASE = os.environ.get("K4CELL_TEST_BASE_URL", "http://127.0.0.1:4173/")
ARTIFACTS = Path(__file__).resolve().parents[1] / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)

NUMBERS = [
    "206.768282688691",   # the hero row, computed
    "206.7682827",        # the hero row, measured
    "0.231219995",
    "0.22501",
    "53.97",
    "2.93",               # Lambda mantissa
    "30.135",             # the worst row
    "34.40",
    "3.69",
    "727",
    "771",
    "1003",
    "CQG-116665",
    "JGP13432",
    "727d7c1fd690655a7a487afd66ba39b12f5b0eae5a622e2a224005a02d27c479",
]

# Retracted claims, plus the vocabulary the author's own glossary bans.
FORBIDDEN = [
    "full-order", "全阶", "the universe is a hologram", "全息宇宙",
    "2D quantum ocean", "二维量子海洋", "information paradox", "Page curve",
    "theory of everything", "ultimate theory", "paradigm shift", "revolutionary",
    "万物理论", "终极理论", "颠覆", "推翻", "震惊", "革命性", "天才", "诺贝尔",
    "独立研究者", "梁志华", "全息", "Planck length", "普朗克长度",
]

MOBILE_FOLD = 3 * 844   # the first three screens of a 390 x 844 phone


def check_static(page, path: str, language: str) -> None:
    """With JavaScript off, the page must still carry the whole argument."""
    response = page.goto(urljoin(BASE, path), wait_until="load")
    assert response and response.ok, (path, response.status if response else None)
    assert page.locator("html").get_attribute("lang") == language

    assert page.locator(".st").count() == 81, "all 81 basis states must be server-rendered"
    assert page.locator(".d-lit").count() > 0, "lit digits must be server-rendered"
    assert page.locator(".d-ghost").count() > 0, "the untestable tail must be server-rendered"
    assert page.locator(".pullbar").count() >= 8, "pull bars must be server-rendered"
    assert page.locator(".lrow").count() == 11, "every ledger row must be server-rendered"
    assert page.locator(".wrow").count() == 11, "eleven claim rows must be server-rendered"
    assert page.locator(".wrow .wtags .tag").count() >= 16, "every claim carries its evidence tiers"
    assert page.locator(".steps li").count() == 6, "the division must be complete without JS"
    assert page.locator(".kcard").count() == 6, "six falsifiers must be server-rendered"
    assert page.locator(".gap").count() == 5, "five named interfaces must be drawn as gaps"
    assert page.locator(".gap-toggle").count() == 0, "no dead control may ship without JavaScript"
    assert page.locator(".figr").count() == 1, "the digit-ruler figure must be server-rendered"
    assert page.locator(".sg-fig").count() == 1, "the sigma axis must be server-rendered"
    assert page.locator(".ifig").count() == 1, "the imaginary-unit figure must be server-rendered"
    assert page.locator(".hy").count() == 1, "the hypercharge figure must be server-rendered"
    assert page.locator(".wlead").count() == 11, "every claim must lead with one plain sentence"
    assert page.locator(".scale-note").count() == 1, "the scale strip must carry its qualifying sentence"
    computed = page.locator(".hero-ruler .rrow").nth(0)
    measured = page.locator(".hero-ruler .rrow").nth(1)
    assert computed.locator(".d-lit").count() == 8, "the hero lights the 8 resolved computed digits"
    assert measured.locator(".d-lit").count() == 8, "the hero lights the 8 resolved measured digits"
    assert computed.locator(".d-ghost").count() == 7, "seven digits wait to be checked"

    body = page.locator("body").inner_text()
    for number in NUMBERS:
        assert number in body, f"{path} (no JS): missing {number}"
    lowered = body.lower()
    for phrase in FORBIDDEN:
        assert phrase.lower() not in lowered, f"{path}: banned phrase present — {phrase!r}"

    # No interface code may reach the first screen.
    hero = page.locator("#hero").inner_text()
    assert not any(f"E{n}" in hero for n in range(1, 12)), f"{path}: an interface code is on the fold"


def check_live(page, path: str, language: str, screenshot: str) -> None:
    errors: list[str] = []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    response = page.goto(urljoin(BASE, path), wait_until="networkidle")
    assert response and response.ok, (path, response.status if response else None)
    assert page.locator("html").get_attribute("lang") == language

    assert page.evaluate(
        "document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"
    ), f"{path}: horizontal overflow"

    # The 81-state filter dims the states outside the selected class.
    assert page.locator(".st.dim").count() == 0
    page.locator('.qfilter[data-sig="4,0,0"]').click()
    assert page.locator(".st.dim").count() == 78, "only the 3 monochrome states stay lit"
    page.locator('.qfilter[data-sig="all"]').click()
    assert page.locator(".st.dim").count() == 0

    # The sweep reports that no collision-free state exists: it marks all 81
    # and the display score beside it reads zero.
    assert page.locator(".score b").first.inner_text().strip() == "0"
    # A control that switches itself off must LOOK off. app.js never sets the
    # disabled property (that would drop focus to <body>), so aria-disabled is
    # the only signal — and it had no visual state at all, which made the swept
    # button and the sixth press of the divider read as broken.
    look = ("(() => { const s = getComputedStyle(document.querySelector('.qsweep'));"
            " return [s.borderTopColor, s.color, s.cursor, s.backgroundColor].join('|'); })()")
    page.mouse.move(0, 0)          # :hover would change the answer on its own
    live_look = page.evaluate(look)
    page.locator(".qsweep").click()
    page.mouse.move(0, 0)
    off_look = page.evaluate(look)
    assert off_look != live_look, (
        f"{path}: aria-disabled has no visual state ({live_look} unchanged)")
    assert page.locator(".st.swept").count() == 81, "the sweep must visit every state"
    assert page.locator(".qsweep").get_attribute("aria-disabled") == "true"
    assert page.locator(".qlive").inner_text().strip(), "the sweep result must be announced"

    # The division starts collapsed under JS and steps open.
    assert page.locator(".steps li:visible").count() == 1
    page.locator(".step-bar button").first.click()
    assert page.locator(".steps li:visible").count() == 2

    # Pulling one named interface darkens exactly the rows it carries.
    toggle = page.locator('.gap[data-code="E8"] .gap-toggle')
    assert toggle.count() == 1, "the interface toggle must be a real button"
    toggle.click()
    assert page.locator(".lrow.dark").count() == 4, "E8 carries four numeric rows"
    assert toggle.get_attribute("aria-pressed") == "true"
    toggle.click()
    assert page.locator(".lrow.dark").count() == 0

    # The kill switch darkens every row at once.
    page.locator("[data-killswitch]").click()
    assert page.locator(".lrow.dark").count() == 11
    assert page.locator(".route.killed").count() == 1
    # Focus must survive every control that switches itself off.
    page.locator(".qsweep").focus()
    assert page.evaluate("document.activeElement.className").find("qsweep") >= 0

    # The English page must run on a Latin-first stack. A CJK face renders
    # U+2019 at full width, so with --han in front every apostrophe on that
    # page came out with a space inside it (author’ s). The cure is one
    # attribute selector in site.css and nothing here captured it.
    first_face = page.evaluate(
        "getComputedStyle(document.querySelector('.wbody')).fontFamily"
    ).split(",")[0].strip().strip('"')
    if language == "en":
        assert not any(cjk in first_face for cjk in ("PingFang", "Hiragino", "Han", "YaHei", "Songti")), (
            f"{path}: the English page leads with a CJK face ({first_face!r})"
        )
    else:
        assert "PingFang" in first_face or "Han" in first_face or "Hiragino" in first_face, (
            f"{path}: the Chinese page must keep its CJK stack ({first_face!r})"
        )

    # The nav says which section the reader is in.
    page.locator("#object").scroll_into_view_if_needed()
    page.wait_for_timeout(400)
    assert page.locator(".site-nav a[aria-current]").count() == 1, "the nav must mark the current section"

    check_svg_labels(page, path)

    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(100)
    page.screenshot(path=str(ARTIFACTS / screenshot), full_page=True)
    assert not errors, errors


def check_mobile_fold(page, path: str) -> None:
    """The object and the readout inside the first three screens, no overflow."""
    response = page.goto(urljoin(BASE, path), wait_until="load")
    assert response and response.ok, (path, response.status if response else None)
    assert page.evaluate(
        "document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"
    ), f"{path}: horizontal overflow at 390px"
    for selector in (".hero-ruler", ".k4fig-hero", ".hero-bet", ".byline"):
        box = page.locator(selector).first.bounding_box()
        assert box, f"{path}: {selector} does not render at 390px"
        assert box["y"] < MOBILE_FOLD, f"{path}: {selector} is below the third screen ({box['y']:.0f}px)"
    # The section nav survives on a phone; a 15,000px page cannot lose it.
    assert page.locator(".site-nav a").count() == 5, f"{path}: the nav must stay on a phone"
    check_svg_labels(page, path)


# A <text> wider than its viewBox is cut off by the plate's own edge, with no
# console error and no document overflow, and usually in one language only.
# scripts/check/svgtext.mjs catches the unwrapped ones at build time with the
# same estimator the figures wrap with — which by construction cannot catch a
# wrap the estimator itself got wrong. This is the ground truth: the browser's
# own boxes, at every width the site is designed for.
CLIPPED_LABELS = """() => {
  const out = [];
  for (const svg of document.querySelectorAll('svg')) {
    const box = svg.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    for (const label of svg.querySelectorAll('text')) {
      if (!label.textContent.trim()) continue;
      const b = label.getBoundingClientRect();
      if (b.width < 1) continue;
      if (box.left - b.left > 2 || b.right - box.right > 2) {
        out.push(svg.getAttribute('class') + ' .' + label.getAttribute('class')
                 + ' :: ' + label.textContent.slice(0, 40));
      }
    }
  }
  return out;
}"""


def check_svg_labels(page, path: str) -> None:
    page.evaluate("() => { for (const d of document.querySelectorAll('details')) d.open = true; }")
    clipped = page.evaluate(CLIPPED_LABELS)
    assert not clipped, f"{path}: SVG text clipped by its own viewBox — {clipped}"
    page.evaluate("() => { for (const d of document.querySelectorAll('details')) d.open = false; }")


# Every width the site is designed for, not only the two it is screenshotted
# at. The English scale strip made the whole DOCUMENT scroll sideways from
# 900px to about 1400px — 153px of it at 900 — and neither the 390 fold check
# nor the 1440 live check could see it, because the band between them was
# never visited. Resizing one loaded page is enough: this is a layout question.
WIDTHS = (320, 360, 390, 414, 600, 768, 880, 900, 960, 1024, 1180, 1280, 1399, 1440, 1920, 2560)


def check_widths(page, path: str) -> None:
    response = page.goto(urljoin(BASE, path), wait_until="load")
    assert response and response.ok, (path, response.status if response else None)
    page.evaluate("() => { for (const d of document.querySelectorAll('details')) d.open = true; }")
    for width in WIDTHS:
        page.set_viewport_size({"width": width, "height": 900})
        page.wait_for_timeout(60)
        over = page.evaluate(
            "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
        )
        assert over <= 1, f"{path}: the page scrolls sideways by {over}px at {width}px"
        clipped = page.evaluate(CLIPPED_LABELS)
        assert not clipped, f"{path}: SVG text clipped at {width}px — {clipped}"
    page.evaluate("() => { for (const d of document.querySelectorAll('details')) d.open = false; }")


def check_notice(page, path: str) -> None:
    response = page.goto(urljoin(BASE, path), wait_until="load")
    assert response and response.ok, (path, response.status if response else None)
    body = page.locator("body").inner_text()
    assert "K4V" in body


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    no_js = browser.new_context(viewport={"width": 1440, "height": 1000}, java_script_enabled=False)
    check_static(no_js.new_page(), "en/", "en")
    check_static(no_js.new_page(), "zh/", "zh-Hans")
    no_js.close()

    desktop = browser.new_context(
        viewport={"width": 1440, "height": 1000}, device_scale_factor=1, reduced_motion="reduce",
    )
    check_live(desktop.new_page(), "en/", "en", "k4cell-en-desktop.png")
    check_live(desktop.new_page(), "zh/", "zh-Hans", "k4cell-zh-desktop.png")
    check_notice(desktop.new_page(), "en/notice/")
    check_notice(desktop.new_page(), "zh/notice/")
    desktop.close()

    mobile = browser.new_context(
        viewport={"width": 390, "height": 844}, device_scale_factor=1,
        is_mobile=True, has_touch=True, reduced_motion="reduce",
    )
    check_live(mobile.new_page(), "zh/", "zh-Hans", "k4cell-zh-mobile.png")
    fold = mobile.new_page()
    check_mobile_fold(fold, "zh/")
    fold.screenshot(path=str(ARTIFACTS / "k4cell-zh-mobile-fold.png"))
    check_mobile_fold(mobile.new_page(), "en/")
    mobile.close()

    sweep = browser.new_context(
        viewport={"width": 1440, "height": 900}, device_scale_factor=1, reduced_motion="reduce",
    )
    check_widths(sweep.new_page(), "en/")
    check_widths(sweep.new_page(), "zh/")
    sweep.close()
    browser.close()

print("browser acceptance: PASS")
