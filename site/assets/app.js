(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* A single visually-hidden status node, so every enhancement announces through
     one place instead of retro-fitting live regions onto visible prose. */
  const status = document.createElement("p");
  status.className = "sr-live";
  status.setAttribute("role", "status");
  document.body.append(status);
  const announce = (message) => {
    status.textContent = "";
    status.textContent = message;
  };

  /* Never set .disabled on the control that currently holds focus — the browser
     drops focus to <body> and the next Tab restarts from the top of the page. */
  const softDisable = (button, off) => {
    button.setAttribute("aria-disabled", String(off));
  };
  const isOff = (button) => button.getAttribute("aria-disabled") === "true";

  /* ---------------------------------------------------------------- *
   * The 81 basis states.                                              *
   * ---------------------------------------------------------------- */

  const grid = $(".grid81");
  if (grid) {
    const cells = $$(".st", grid);
    const live = $(".qlive");
    const filters = $$(".qfilter");

    const applyFilter = (signature) => {
      for (const cell of cells) {
        cell.classList.toggle("dim", signature !== "all" && cell.dataset.sig !== signature);
      }
      for (const button of filters) {
        button.setAttribute("aria-pressed", String(button.dataset.sig === signature));
      }
    };

    for (const button of filters) {
      button.addEventListener("click", () => {
        applyFilter(button.dataset.sig);
        announce(button.textContent.replace(/\s+/g, " ").trim());
      });
    }

    const sweep = $(".qsweep");
    if (sweep && live) {
      sweep.addEventListener("click", () => {
        if (isOff(sweep)) return;
        applyFilter("all");
        for (const cell of cells) cell.classList.add("swept");
        softDisable(sweep, true);
        announce(sweep.dataset.done || live.textContent);
      });
    }
  }

  /* ---------------------------------------------------------------- *
   * 9 / 40 — let the reader carry the division themselves.            *
   * ---------------------------------------------------------------- */

  const steps = $(".steps");
  if (steps) {
    const items = $$("li", steps);
    let shown = 1;

    const paint = () => {
      items.forEach((item, index) => item.classList.toggle("hid", index >= shown));
    };

    const bar = document.createElement("p");
    bar.className = "step-bar";

    const next = document.createElement("button");
    next.type = "button";
    next.className = "button";
    next.textContent = steps.dataset.step || "Next digit";

    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "button";
    reset.textContent = steps.dataset.reset || "Start over";

    next.addEventListener("click", () => {
      if (isOff(next)) return;
      if (shown < items.length) shown += 1;
      softDisable(next, shown >= items.length);
      paint();
      announce(items[shown - 1].textContent.trim());
    });
    reset.addEventListener("click", () => {
      shown = 1;
      softDisable(next, false);
      paint();
      announce(items[0].textContent.trim());
    });

    bar.append(next, reset);
    steps.after(bar);
    paint();
  }

  /* ---------------------------------------------------------------- *
   * The route: pull an interface out and watch its rows go dark.      *
   * One owner for the darkened set, so the gap toggles and the kill   *
   * switch cannot leave rows stranded.                                *
   * ---------------------------------------------------------------- */

  const gaps = $$(".gap");
  const killswitch = $("[data-killswitch]");
  const route = killswitch && killswitch.closest(".route");

  if (gaps.length) {
    let active = null;

    const render = () => {
      const killed = route && route.classList.contains("killed");
      const carried = new Set(
        killed
          ? $$(".lrow").map((row) => row.dataset.row)
          : (active ? (active.dataset.carries || "").split(" ").filter(Boolean) : []),
      );
      for (const row of $$(".lrow")) {
        row.classList.toggle("dark", carried.has(row.dataset.row));
      }
      for (const gap of gaps) {
        const on = gap === active && !killed;
        gap.classList.toggle("on", on);
        const toggle = $(".gap-toggle", gap);
        if (toggle) toggle.setAttribute("aria-pressed", String(on));
      }
    };

    /* The toggle is created here, not in the HTML: without JavaScript a control
       that does nothing would be worse than no control at all. */
    for (const gap of gaps) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "gap-toggle";
      toggle.setAttribute("aria-pressed", "false");
      toggle.textContent = gap.dataset.code || "";
      toggle.addEventListener("click", () => {
        if (route && route.classList.contains("killed")) return;
        active = active === gap ? null : gap;
        render();
        announce(gap.textContent.replace(/\s+/g, " ").trim());
      });
      gap.append(toggle);
    }

    if (killswitch && route) {
      killswitch.addEventListener("click", () => {
        const on = !route.classList.contains("killed");
        route.classList.toggle("killed", on);
        $("[data-kill-on]", killswitch).hidden = on;
        $("[data-kill-off]", killswitch).hidden = !on;
        if (on) active = null;
        render();
        announce(killswitch.textContent.replace(/\s+/g, " ").trim());
      });
    }
  }
})();
