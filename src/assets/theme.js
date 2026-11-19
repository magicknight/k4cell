/* K4 Cell Quantum Signal — Early Theme & FX Bootloader
   Runs synchronously in <head> before first paint so there is no flash of
   wrong ground. Default theme: "dark" (Night Signal); cycles dark -> light ->
   system via localStorage("k4cell_theme"). Also sets html.fx-lite early. */
"use strict";
(() => {
  const THEME_KEY = "k4cell_theme";
  const FX_KEY = "k4cell_fx";
  const ORDER = ["dark", "light", "system"];
  const root = document.documentElement;
  const mqTheme = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
  const mqMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  let pref = "dark";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (ORDER.includes(saved)) pref = saved;
  } catch (_) {}

  let savedFx = null;
  try { savedFx = localStorage.getItem(FX_KEY); } catch (_) {}
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const initialLite = (mqMotion && mqMotion.matches) || savedFx === "lite" || (!savedFx && saveData);
  if (initialLite) root.classList.add("fx-lite");

  const isZh = () => (root.lang || "").startsWith("zh");
  const LABELS = {
    dark: ["主题：深空夜频", "Theme: dark signal", "DARK"],
    light: ["主题：日间浅纸", "Theme: day signal", "LIGHT"],
    system: ["主题：跟随系统", "Theme: follow system", "AUTO"],
  };

  const syncButtons = () => {
    const [zhLabel, enLabel, shortText] = LABELS[pref];
    const label = isZh() ? zhLabel : enLabel;
    const hint = isZh() ? "（点击切换）" : " (click to switch)";
    for (const btn of document.querySelectorAll("#theme-toggle, .tool.theme")) {
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label + hint);
      const txt = btn.querySelector(".theme-txt");
      if (txt) txt.textContent = shortText;
    }
  };

  const applyTheme = () => {
    const resolved = pref === "system" ? (mqTheme && mqTheme.matches ? "light" : "dark") : pref;
    root.dataset.theme = resolved;
    root.dataset.themePref = pref;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "light" ? "#f4f5f8" : "#07080d");
    syncButtons();
  };

  const cycle = () => {
    pref = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
    try {
      if (pref === "dark") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, pref);
    } catch (_) {}
    root.classList.add("theme-swap");
    applyTheme();
    void root.offsetHeight;
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(() => root.classList.remove("theme-swap"));
    } else {
      root.classList.remove("theme-swap");
    }
  };

  applyTheme();

  if (mqTheme) {
    const onSystemChange = () => { if (pref === "system") applyTheme(); };
    if (mqTheme.addEventListener) mqTheme.addEventListener("change", onSystemChange);
    else if (mqTheme.addListener) mqTheme.addListener(onSystemChange);
  }

  window.addEventListener("storage", (event) => {
    if (event.key === THEME_KEY) {
      pref = ORDER.includes(event.newValue) ? event.newValue : "dark";
      applyTheme();
    }
  });

  const wire = () => {
    for (const btn of document.querySelectorAll("#theme-toggle, .tool.theme")) {
      btn.addEventListener("click", cycle);
    }
    syncButtons();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();

  window.K4Theme = { cycle, get: () => pref };
})();
