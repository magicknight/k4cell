/* K4 Cell Quantum Signal — Offline Console Shell
   Provides: FX/LITE toggle, Command Palette (Ctrl+K / Cmd+K / "/"),
   Keyboard Shortcuts sheet ("?"), and quick g-chord navigation.
   Strict CSP safe: zero inline styles, zero network requests. */
"use strict";
(() => {
  const isMac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || "");
  const modKey = isMac ? "⌘" : "Ctrl";
  const FX_KEY = "k4cell_fx";

  const getLang = () => {
    const docLang = document.documentElement.lang || "";
    if (docLang.startsWith("zh")) return "zh";
    if (location.pathname.startsWith("/zh/") || location.pathname === "/zh") return "zh";
    return "en";
  };

  const T = (zh, en) => (getLang() === "zh" ? zh : en);

  /* ---- FX / LITE toggle ---- */
  const prefersReduced = () =>
    Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const syncFxButtons = () => {
    const isLite = document.documentElement.classList.contains("fx-lite");
    const label = isLite
      ? T("视觉效果：精简模式（点击开启光效）", "Effects: LITE (click to enable glow)")
      : T("视觉效果：全特效模式（点击切换精简）", "Effects: FX (click for flat LITE mode)");
    for (const btn of document.querySelectorAll("#fx-toggle, .tool.fx")) {
      btn.setAttribute("aria-pressed", isLite ? "false" : "true");
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
      btn.classList.toggle("lite", isLite);
      const dot = btn.querySelector(".dot");
      if (dot) dot.className = isLite ? "dot off" : "dot ok";
      const txt = btn.querySelector(".fx-txt");
      if (txt) txt.textContent = isLite ? "LITE" : "FX";
    }
  };

  const setFx = (lite) => {
    const actualLite = prefersReduced() ? true : Boolean(lite);
    document.documentElement.classList.toggle("fx-lite", actualLite);
    try { localStorage.setItem(FX_KEY, actualLite ? "lite" : "fx"); } catch (_) {}
    syncFxButtons();
  };

  const toggleFx = () => {
    const isLite = document.documentElement.classList.contains("fx-lite");
    setFx(!isLite);
  };

  /* ---- Command Palette & Shortcuts Data ---- */
  const routeUrl = (lang, suffix) => `/${lang}/${suffix}`;
  const goResearch = (hash) => {
    const lang = getLang();
    const target = `${routeUrl(lang, "research.html")}#${hash}`;
    if (location.pathname.endsWith("/research.html")) {
      const el = document.getElementById(hash);
      if (el) {
        history.replaceState(null, "", `#${hash}`);
        el.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth" });
        return;
      }
    }
    location.href = target;
  };

  const buildItems = () => {
    const lang = getLang();
    const other = lang === "zh" ? "en" : "zh";
    return [
      /* Primary Channels */
      { kind: "page", icon: "01", label: T("概览首页", "Overview Home"), hint: `/${lang}/`, keys: "home overview 首页", run: () => { location.href = `/${lang}/`; } },
      { kind: "page", icon: "02", label: T("完整研究与 81 态核查", "Full Research & 81-State Checker"), hint: routeUrl(lang, "research.html"), keys: "research monograph 81 states 研究 专著", run: () => { location.href = routeUrl(lang, "research.html"); } },
      { kind: "page", icon: "03", label: T("版本进展与审稿动态", "Progress & Paper Status"), hint: routeUrl(lang, "progress/"), keys: "progress v3 v2 journal 进展 版本", run: () => { location.href = routeUrl(lang, "progress/"); } },
      { kind: "page", icon: "04", label: T("预测登记表（0 项预注册）", "Prediction Registry (0 preregistered)"), hint: "/predictions/", keys: "predictions registry retrospective 预测 登记", run: () => { location.href = "/predictions/"; } },
      { kind: "page", icon: "05", label: T("研究资助与学术合作", "Research Support & Collaboration"), hint: routeUrl(lang, "support/"), keys: "support funding collaboration 支持 资助", run: () => { location.href = routeUrl(lang, "support/"); } },
      { kind: "page", icon: "K4V", label: T("K4V 尚未发行官方签名声明", "Official K4V No-Mint Attestation"), hint: "/official-k4v/", keys: "k4v pgp mint attestation 声明 签名", run: () => { location.href = "/official-k4v/"; } },

      /* Constants & Research Sections */
      { kind: "jump", icon: "μ/e", label: T("m_μ/m_e = 206.768282688691（15 位逐位对照）", "m_μ/m_e = 206.768282688691 (15-digit check)"), hint: "0.002 σ · #l-mu_e", keys: "muon electron mass ratio 206 质量比", run: () => goResearch("l-mu_e") },
      { kind: "jump", icon: "9/40", label: T("λ_C = 9/40 = 0.225 手动长除验算", "λ_C = 9/40 = 0.225 Division Check"), hint: "#check", keys: "cabibbo 9/40 0.225 quark 卡比博", run: () => goResearch("check") },
      { kind: "jump", icon: "θW", label: T("弱混合角 sin²θ_W = 0.231219995", "Weak Mixing Angle sin²θ_W = 0.231219995"), hint: "3/13 · #l-sin2w", keys: "weak mixing angle 3/13 电弱", run: () => goResearch("l-sin2w") },
      { kind: "jump", icon: "BAO", label: T("BAO 宇宙标准尺绝对长度（最差行 3.28 σ_eq）", "BAO Absolute Scale (worst row: 3.28 σ_eq)"), hint: "χ² = 34.40 · #l-bao_scale", keys: "bao desi tension worst 3.28 宇宙", run: () => goResearch("l-bao_scale") },
      { kind: "jump", icon: "Λ", label: T("宇宙学常数几何响应 Λ ℓ_*²", "Cosmological Constant Λ ℓ_*²"), hint: "2.93×10⁻¹²² · #l-lambda", keys: "lambda cosmological constant 宇宙学常数", run: () => goResearch("l-lambda") },
      { kind: "jump", icon: "ββ", label: T("无中微子双 β 衰变 m_ββ = 3.69 meV", "Neutrinoless Double-Beta m_ββ = 3.69 meV"), hint: "#l-m_bb", keys: "majorana neutrino double beta 马约拉纳", run: () => goResearch("l-m_bb") },
      { kind: "jump", icon: "K4", label: T("基本对象与 81 个经典基态交互筛查", "The Object & 81-State Interactive Grid"), hint: "#object", keys: "81 states frustration pigeonhole 基态 阻挫", run: () => goResearch("object") },
      { kind: "jump", icon: "11", label: T("十一项核心推导（10⁻³⁵ m → 10²⁶ m）", "Eleven Whys (10⁻³⁵ m → 10²⁶ m)"), hint: "#whys", keys: "eleven whys generations spacetime 推导", run: () => goResearch("whys") },
      { kind: "jump", icon: "⚠", label: T("六项核心证伪实验检验（2026–2035）", "Six Experimental Falsifiers (2026–2035)"), hint: "#kill", keys: "falsify juno dune hyper-k cp 证伪 中微子", run: () => goResearch("kill") },
      { kind: "jump", icon: "✓", label: T("Lean 4 形式化核验统计（727 / 771）", "Lean 4 Formal Verification (727 / 771)"), hint: "#machine", keys: "lean 4 727 771 formal proof 形式化", run: () => goResearch("machine") },
      { kind: "jump", icon: "E*", label: T("开放边界接口 E3–E11 与拔除开关", "Open Interfaces E3–E11 & Kill Switch"), hint: "#deeper", keys: "open gaps e3 e8 e10 boundary 接口 边界", run: () => goResearch("deeper") },
      { kind: "jump", icon: "#", label: T("SHA-256 校验和与核心审阅问题", "SHA-256 Checksums & Review Targets"), hint: "#verify", keys: "sha256 pdf errata review targets 校验 勘误", run: () => goResearch("verify") },

      /* Console Commands */
      { kind: "cmd", icon: "☀", label: T("切换深空 / 日间主题（DARK / LIGHT / AUTO）", "Cycle Theme (DARK / LIGHT / AUTO)"), hint: "T", keys: "theme dark light auto 主题 深色 浅色", run: () => { if (window.K4Theme) window.K4Theme.cycle(); } },
      { kind: "cmd", icon: "✦", label: T("切换视觉特效（FX / LITE）", "Toggle Visual Effects (FX / LITE)"), hint: "F", keys: "fx lite scanlines glow 特效 精简", run: () => toggleFx() },
      {
        kind: "cmd",
        icon: "◎",
        label: lang === "zh" ? "Switch interface to English" : "切换界面语言为简体中文",
        hint: other.toUpperCase(),
        keys: "language english chinese 语言 中文 英文",
        run: () => {
          const link = document.querySelector("a.overview-language, a.lang");
          if (link) link.click();
          else location.href = `/${other}/`;
        },
      },
      { kind: "cmd", icon: "⌨", label: T("查看键盘快捷键说明", "Show Keyboard Shortcuts"), hint: "?", keys: "shortcuts help keys 快捷键", run: () => openKeys() },
    ];
  };

  /* ---- DOM State ---- */
  let cmdOpen = false;
  let keysOpen = false;
  let selIndex = 0;
  let visibleItems = [];
  let gArmed = false;
  let gTimer = null;
  let focusTimer = null;
  let lastFocus = null;

  const ensureDialogs = () => {
    if (document.getElementById("cmd-dialog")) return;

    const cmdScrim = document.createElement("div");
    cmdScrim.id = "cmd-dialog";
    cmdScrim.className = "cp-scrim";
    cmdScrim.hidden = true;
    cmdScrim.innerHTML = `
      <div class="cp" role="dialog" aria-modal="true" aria-label="${T("命令与检索面板", "Command & Navigation Palette")}">
        <div class="cp-field">
          <span class="gt mono" aria-hidden="true">&gt;</span>
          <input id="cp-input" type="text" class="cp-in" placeholder="${T("检索页面、物理常数、证伪实验或命令…", "Search pages, constants, falsifiers, or commands…")}" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="cp-list">
          <button type="button" class="kbd esc" id="cp-close" aria-label="${T("关闭", "Close")}">Esc</button>
        </div>
        <ul id="cp-list" class="cp-list" role="listbox"></ul>
        <p class="cp-foot mono">${T("↑↓ 选择 · Enter 跳转 · Esc 关闭", "↑↓ navigate · Enter open · Esc close")}</p>
      </div>`;
    document.body.appendChild(cmdScrim);

    const keysScrim = document.createElement("div");
    keysScrim.id = "keys-dialog";
    keysScrim.className = "ks-scrim";
    keysScrim.hidden = true;
    keysScrim.innerHTML = `
      <div class="ks" role="dialog" aria-modal="true" aria-label="${T("快捷键说明", "Keyboard Shortcuts")}">
        <header class="ks-head">
          <span class="ks-code mono">KEYS</span>
          <h2 class="ks-t">${T("控制台快捷键", "Console Shortcuts")}</h2>
          <button type="button" class="icon-btn" id="keys-close" aria-label="${T("关闭", "Close")}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
          </button>
        </header>
        <dl class="ks-list">
          <div class="ks-row"><dt><span class="kbd">${modKey}</span><span class="kbd">K</span><span class="or">/</span><span class="kbd">/</span></dt><dd>${T("打开命令与检索面板", "Open command palette")}</dd></div>
          <div class="ks-row"><dt><span class="kbd">T</span></dt><dd>${T("切换深色 / 浅色 / 自动主题", "Cycle Dark / Light / Auto theme")}</dd></div>
          <div class="ks-row"><dt><span class="kbd">F</span></dt><dd>${T("切换 FX / LITE 视觉效果", "Toggle FX / LITE effects")}</dd></div>
          <div class="ks-row"><dt><span class="kbd">G</span><span class="kbd">H</span></dt><dd>${T("前往概览首页", "Go to Home")}</dd></div>
          <div class="ks-row"><dt><span class="kbd">G</span><span class="kbd">R</span></dt><dd>${T("前往完整研究页", "Go to Full Research")}</dd></div>
          <div class="ks-row"><dt><span class="kbd">G</span><span class="kbd">P</span></dt><dd>${T("前往进展与版本页", "Go to Progress")}</dd></div>
          <div class="ks-row"><dt><span class="kbd">G</span><span class="kbd">S</span></dt><dd>${T("前往资助与合作页", "Go to Support")}</dd></div>
          <div class="ks-row"><dt><span class="kbd">?</span></dt><dd>${T("打开本快捷键说明", "Show shortcuts sheet")}</dd></div>
          <div class="ks-row"><dt><span class="kbd">Esc</span></dt><dd>${T("关闭当前弹窗", "Close active dialog")}</dd></div>
        </dl>
      </div>`;
    document.body.appendChild(keysScrim);

    cmdScrim.addEventListener("click", (e) => { if (e.target === cmdScrim) closeCmd(); });
    keysScrim.addEventListener("click", (e) => { if (e.target === keysScrim) closeKeys(); });
    document.getElementById("cp-close").addEventListener("click", closeCmd);
    document.getElementById("keys-close").addEventListener("click", closeKeys);

    const cpInput = document.getElementById("cp-input");
    cpInput.addEventListener("input", () => filterItems(cpInput.value));
    cpInput.addEventListener("keydown", onPaletteKey);
  };

  const renderList = () => {
    const list = document.getElementById("cp-list");
    if (!list) return;
    list.replaceChildren();
    if (!visibleItems.length) {
      const empty = document.createElement("li");
      empty.className = "none";
      empty.textContent = T("没有匹配的页面、常数或命令", "No matching pages, constants, or commands");
      list.appendChild(empty);
      return;
    }

    const groupNames = {
      page: T("频道与页面", "Channels & Pages"),
      jump: T("研究数值与章节", "Constants & Sections"),
      cmd: T("控制台命令", "Console Commands"),
    };

    let lastKind = null;
    visibleItems.forEach((item, idx) => {
      if (item.kind !== lastKind) {
        lastKind = item.kind;
        const grp = document.createElement("li");
        grp.className = "grp";
        grp.setAttribute("role", "presentation");
        grp.textContent = groupNames[item.kind] || "";
        list.appendChild(grp);
      }

      const li = document.createElement("li");
      li.id = `cp-item-${idx}`;
      li.className = idx === selIndex ? "it sel" : "it";
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", idx === selIndex ? "true" : "false");

      const ico = document.createElement("span");
      ico.className = "ico mono";
      ico.setAttribute("aria-hidden", "true");
      ico.textContent = item.icon;

      const lb = document.createElement("span");
      lb.className = "lb";
      lb.textContent = item.label;

      const hint = document.createElement("span");
      hint.className = "hint mono";
      hint.textContent = item.hint;

      li.append(ico, lb, hint);
      li.addEventListener("click", () => runItem(idx));
      list.appendChild(li);
    });
  };

  const filterItems = (raw) => {
    const q = raw.trim().toLowerCase();
    const all = buildItems();
    visibleItems = q
      ? all.filter((it) => `${it.label} ${it.hint} ${it.keys}`.toLowerCase().includes(q))
      : all;
    selIndex = 0;
    renderList();
  };

  const runItem = (idx) => {
    const item = visibleItems[idx];
    if (!item) return;
    closeCmd();
    item.run();
  };

  const moveSelection = (delta) => {
    if (!visibleItems.length) return;
    selIndex = (selIndex + delta + visibleItems.length) % visibleItems.length;
    renderList();
    const active = document.getElementById(`cp-item-${selIndex}`);
    if (active) active.scrollIntoView({ block: "nearest" });
  };

  const onPaletteKey = (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); moveSelection(1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); moveSelection(-1); }
    else if (event.key === "Enter") { event.preventDefault(); runItem(selIndex); }
    else if (event.key === "Escape") { event.preventDefault(); closeCmd(); }
  };

  const restoreFocus = () => {
    const target = lastFocus;
    lastFocus = null;
    if (target && target !== document.body && document.contains(target) && typeof target.focus === "function") {
      target.focus();
    } else if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const openCmd = (initial = "") => {
    ensureDialogs();
    if (!cmdOpen && !keysOpen) {
      lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    closeKeys(false);
    const dialog = document.getElementById("cmd-dialog");
    const input = document.getElementById("cp-input");
    dialog.hidden = false;
    cmdOpen = true;
    input.value = initial;
    filterItems(initial);
    window.clearTimeout(focusTimer);
    focusTimer = window.setTimeout(() => {
      if (!cmdOpen) return;
      input.focus();
      input.select();
    }, 15);
  };

  const closeCmd = (restore = true) => {
    window.clearTimeout(focusTimer);
    const input = document.getElementById("cp-input");
    if (input) input.blur();
    const dialog = document.getElementById("cmd-dialog");
    if (dialog) dialog.hidden = true;
    cmdOpen = false;
    if (restore) restoreFocus();
  };

  const openKeys = () => {
    ensureDialogs();
    if (!cmdOpen && !keysOpen) {
      lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    closeCmd(false);
    const dialog = document.getElementById("keys-dialog");
    dialog.hidden = false;
    keysOpen = true;
    const closeBtn = document.getElementById("keys-close");
    if (closeBtn) closeBtn.focus();
  };

  const closeKeys = (restore = true) => {
    const dialog = document.getElementById("keys-dialog");
    if (dialog) dialog.hidden = true;
    keysOpen = false;
    if (restore) restoreFocus();
  };

  const isTyping = (target) => {
    if (!target || !(target instanceof Element)) return false;
    if (target.closest("[hidden]")) return false;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
  };

  const handleGlobalKey = (event) => {
    if (event.key === "Escape") {
      if (cmdOpen) { event.preventDefault(); closeCmd(); return; }
      if (keysOpen) { event.preventDefault(); closeKeys(); return; }
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (cmdOpen) closeCmd();
      else openCmd();
      return;
    }

    if (isTyping(event.target) || cmdOpen) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const key = event.key.toLowerCase();
    if (gArmed) {
      gArmed = false;
      window.clearTimeout(gTimer);
      const lang = getLang();
      if (key === "h") { event.preventDefault(); location.href = `/${lang}/`; return; }
      if (key === "r") { event.preventDefault(); location.href = routeUrl(lang, "research.html"); return; }
      if (key === "p") { event.preventDefault(); location.href = routeUrl(lang, "progress/"); return; }
      if (key === "s") { event.preventDefault(); location.href = routeUrl(lang, "support/"); return; }
    }

    if (event.key === "/") {
      event.preventDefault();
      openCmd();
    } else if (event.key === "?") {
      event.preventDefault();
      if (keysOpen) closeKeys();
      else openKeys();
    } else if (key === "t") {
      event.preventDefault();
      if (window.K4Theme) window.K4Theme.cycle();
    } else if (key === "f") {
      event.preventDefault();
      toggleFx();
    } else if (key === "g") {
      gArmed = true;
      window.clearTimeout(gTimer);
      gTimer = window.setTimeout(() => { gArmed = false; }, 900);
    }
  };

  const init = () => {
    syncFxButtons();
    for (const btn of document.querySelectorAll("#fx-toggle, .tool.fx")) {
      btn.addEventListener("click", toggleFx);
    }
    const cmdTrigger = document.getElementById("cmd-trigger");
    if (cmdTrigger) cmdTrigger.addEventListener("click", () => openCmd());
    const keysBtn = document.getElementById("rail-keys-btn");
    if (keysBtn) keysBtn.addEventListener("click", openKeys);
    document.addEventListener("keydown", handleGlobalKey);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.K4Shell = { openCmd, closeCmd, openKeys, closeKeys, toggleFx };
})();
