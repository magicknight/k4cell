#!/usr/bin/env python3
"""Browser acceptance suite for a running preview of the K4 Cell site.

Two things are checked that matter more than pixels:
  1. every load-bearing number is present with JavaScript DISABLED;
  2. the interactions that teach something actually change the page.
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

FORBIDDEN = ["full-order", "全阶", "the universe is a hologram", "全息宇宙",
             "2D quantum ocean", "二维量子海洋"]


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
    assert page.locator(".gap-toggle").count() == 0, "no dead control may ship without JavaScript"
    assert page.locator(".xrow").count() == 11, "eleven claim rows must be server-rendered"
    assert page.locator(".xholo").count() == 1, "the holography correction must be present"
    assert page.locator(".xrow .xtags .tag").count() >= 11, "every claim carries its evidence state"
    assert page.locator(".steps li").count() == 6, "the division must be complete without JS"
    body = page.locator("body").inner_text()
    for number in NUMBERS:
        assert number in body, f"{path} (no JS): missing {number}"
    lowered = body.lower()
    for phrase in FORBIDDEN:
        assert phrase.lower() not in lowered, f"{path}: retracted claim present — {phrase!r}"


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

    # The sweep reports that no collision-free state exists.
    page.locator(".qsweep").click()
    assert "0" in page.locator(".qlive").inner_text()

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

    page.screenshot(path=str(ARTIFACTS / screenshot), full_page=True)
    assert not errors, errors


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
    mobile.close()
    browser.close()

print("browser acceptance: PASS")
