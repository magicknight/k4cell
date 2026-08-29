#!/usr/bin/env python3
"""Small browser acceptance suite for a running local preview."""

import os
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright


BASE = os.environ.get("K4CELL_TEST_BASE_URL", "http://127.0.0.1:4173/")
ARTIFACTS = Path(__file__).resolve().parents[1] / "artifacts"
ARTIFACTS.mkdir(exist_ok=True)


def check_page(page, path: str, language: str, screenshot: str) -> None:
    errors: list[str] = []
    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(str(error)))
    response = page.goto(urljoin(BASE, path), wait_until="networkidle")
    assert response and response.ok, (path, response.status if response else None)
    assert page.locator("html").get_attribute("lang") == language
    assert page.locator("#cell-svg").count() == 1
    assert page.locator("[data-mode]").count() == 3
    assert page.locator(".status-card").count() == 3
    assert page.locator(".season-card").count() == 4
    assert page.locator(".path").count() == 3
    assert page.locator(".source-card").count() == 4
    # Chromium can report a one-device-pixel rounding difference for the SVG
    # stage at narrow widths even when no element crosses the viewport.
    assert page.evaluate(
        "document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"
    )

    original = page.locator("#cell-caption").inner_text()
    page.locator('[data-mode="relations"]').click()
    assert page.locator("#cell-caption").inner_text() != original
    page.locator("#cell-svg").focus()
    page.keyboard.press("ArrowRight")
    page.keyboard.press("Space")
    assert page.locator("[data-motion]").get_attribute("aria-pressed") == "false"

    page.screenshot(path=str(ARTIFACTS / screenshot), full_page=True)
    assert not errors, errors


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    desktop = browser.new_context(
        viewport={"width": 1440, "height": 1000},
        device_scale_factor=1,
        reduced_motion="reduce",
    )
    check_page(desktop.new_page(), "en/", "en", "k4cell-en-desktop.png")
    check_page(desktop.new_page(), "zh/", "zh-Hans", "k4cell-zh-desktop.png")
    desktop.close()

    mobile = browser.new_context(
        viewport={"width": 390, "height": 844},
        device_scale_factor=1,
        is_mobile=True,
        has_touch=True,
        reduced_motion="reduce",
    )
    check_page(mobile.new_page(), "en/", "en", "k4cell-en-mobile.png")
    mobile.close()
    browser.close()

print("browser acceptance: PASS")
