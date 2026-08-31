import assert from "node:assert/strict";

import { ledger } from "../data.mjs";
import { esc, colon } from "../html.mjs";
import { figNumeral } from "./order.mjs";
import { ADV, figLines, figText, figWidth, figWrap } from "./text.mjs";

/* ------------------------------------------------------------------ *
 * Figure 6 — the route, drawn as a chain with its published holes.    *
 *                                                                     *
 * The eight text cards this replaces had dashed top borders and no    *
 * line between them, so the one thing the section is about — that the *
 * chain is broken, in named places, by the author himself — was       *
 * carried entirely by prose. Here the breaks are breaks: the rail     *
 * runs into a cut face and stops, the page ground shows through, and  *
 * the erratum code sits in the void.                                  *
 *                                                                     *
 * The caption says what the DRAWING shows; the paragraph above the     *
 * figure (page.mjs) says what the SECTION argues. Until 2026-08-30     *
 * both printed boundary.route.intro, so a 139-word English paragraph   *
 * appeared twice on one screen with only the plate between them.       *
 *                                                                     *
 * Nothing is typed in twice. Tiers come from boundary.route.stations  *
 * and the holes from boundary.route.gaps — the same object the page    *
 * renders its own station list from, so the gate below and the drawing *
 * can never read two different lists. The rows hanging under each hole *
 * are pinned below to the ledger's own interface lists, so a row that *
 * gains or loses an interface cannot leave a stale hole on the page:  *
 * the build fails instead.                                            *
 * ------------------------------------------------------------------ */

/* The build entry passes every deck it renders. */
export const assertRouteDecks = (decks) => {
for (const copy of decks) {
  const tiers = copy.boundary.route.stations.map(([, , tier]) => tier);
  assert.equal(tiers.length, 8, `${copy.dir}: the route figure is drawn for eight stations, got ${tiers.length}`);

  const known = new Set(copy.explain.tagKey.map(([state]) => state));
  for (const tier of tiers) {
    assert.ok(known.has(tier), `${copy.dir}: route station tier "${tier}" has no label in explain.tagKey`);
  }

  /* One tier change, and the figure hangs the main open bridge on it. A second
     change would mean the drawing invents a bridge nobody published. */
  const flips = tiers.filter((tier, index) => index > 0 && tier !== tiers[index - 1]);
  assert.equal(flips.length, 1, `${copy.dir}: the route must change tier exactly once, found ${flips.length}`);
  assert.equal(tiers.indexOf("conditional"), 4,
    `${copy.dir}: the figure brackets four closed stations, then four conditional ones`);

  /* Each hole hangs exactly the rows the ledger says ride on that interface. */
  for (const [code, , carries] of copy.boundary.route.gaps) {
    const fromLedger = ledger.gaussian
      .filter((row) => row.interfaces.includes(code)).map((row) => row.id).sort();
    assert.deepEqual([...carries].sort(), fromLedger,
      `${copy.dir}: route gap ${code} draws [${carries}], the ledger's interface lists give [${fromLedger}]`);
  }

  /* And no numeric row may ride on an interface the figure draws no hole for:
     that would print a chain whose gaps are quietly incomplete. */
  const drawn = new Set(copy.boundary.route.gaps.map(([code]) => code));
  for (const row of ledger.gaussian) {
    for (const code of row.interfaces) {
      assert.ok(drawn.has(code),
        `${copy.dir}: ledger row ${row.id} rides on ${code}, which the route figure draws no gap for`);
    }
  }
}
};

/* One description for both orientations, assembled only out of strings the
   decks already print, so the spoken figure and the drawn figure cannot
   diverge and no English sentence appears on the Chinese page. */
export const figRouteLabel = (copy) => {
  const symbolOf = (id) => ledger.gaussian.find((row) => row.id === id).symbol;
  return [
    `${copy.boundary.route.kicker}${colon(copy)}${copy.boundary.route.h2}`,
    copy.boundary.route.stations.map(([title], index) => `${String(index + 1).padStart(2, "0")} ${title}`).join(" · "),
    `${copy.boundary.route.mainBridgeLabel}${colon(copy)}${copy.boundary.route.mainBridge}`,
    copy.boundary.route.gaps.map(([code, , carries]) => carries.length
      ? `${code} ${copy.boundary.route.gapCarries}${colon(copy)}${carries.map(symbolOf).join(" ")}`
      : `${code} ${copy.boundary.route.gapCarriesNothing}`).join(" · "),
  ].join(" — ");
};

/* A hole is as wide as the number of rows that fall through it. That is the
   only quantity in the drawing, and E8 reads four times a single-row gap. */
export const figHoleWidth = (rows, unit, base) => base + unit * rows.length;

export const figRouteWide = (copy) => {
  const W = 1200;
  const railY = 92;
  const nodes = copy.boundary.route.stations;
  const tiers = nodes.map(([, , tier]) => tier);
  const flip = tiers.indexOf("conditional");
  const tierLabel = Object.fromEntries(copy.explain.tagKey.map(([state, label]) => [state, label]));

  /* Every settled step gets one unit of rail; the span the author calls open
     gets two, so the main bridge is the widest void on the rail and the four
     closed steps read as the tight, finished stretch they are. */
  const spans = nodes.slice(1).map((_, index) => (index === flip - 1 ? 2 : 1));
  const unit = (1116 - 84) / spans.reduce((sum, span) => sum + span, 0);
  const nx = nodes.map((_, index) => 84 + unit * spans.slice(0, index).reduce((sum, span) => sum + span, 0));

  const links = nx.slice(0, -1).map((x, index) => {
    if (index === flip - 1) return "";
    const tier = tiers[index] === "closed" && tiers[index + 1] === "closed" ? "closed" : "conditional";
    const tip = nx[index + 1] - 11;
    return `<line class="rt-link rt-${tier}" x1="${(x + 11).toFixed(1)}" y1="${railY}" x2="${(tip - 6).toFixed(1)}" y2="${railY}"/>`
      + `<path class="rt-arrow rt-${tier}" d="M${(tip - 7).toFixed(1)} ${railY - 4.6} L${tip.toFixed(1)} ${railY} L${(tip - 7).toFixed(1)} ${railY + 4.6}"/>`;
  }).join("");

  const markers = nx.map((x, index) => `<rect class="rt-node rt-${tiers[index]}" x="${(x - 6.5).toFixed(1)}" y="${railY - 6.5}" width="13" height="13"/>`
    + figText("rt-idx", x.toFixed(1), railY + 26, "middle", String(index + 1).padStart(2, "0"))
    + figLines("rt-title", x.toFixed(1), railY + 44, 15, "middle", figWrap(nodes[index][0], 13, unit - 8))).join("");

  /* The bridge the author calls open. The rail runs on past station 04, meets a
     cut face and stops; it starts again at the far cut face. Nothing spans. */
  const bx = (nx[flip - 1] + nx[flip]) / 2;
  const cutA = nx[flip - 1] + 34;
  const cutB = nx[flip] - 34;
  const bridge = `<line class="rt-link rt-open" x1="${(nx[flip - 1] + 11).toFixed(1)}" y1="${railY}" x2="${cutA.toFixed(1)}" y2="${railY}"/>`
    + `<line class="rt-link rt-open" x1="${cutB.toFixed(1)}" y1="${railY}" x2="${(nx[flip] - 11).toFixed(1)}" y2="${railY}"/>`
    + `<line class="rt-cut" x1="${cutA.toFixed(1)}" y1="${railY - 14}" x2="${cutA.toFixed(1)}" y2="${railY + 14}"/>`
    + `<line class="rt-cut" x1="${cutB.toFixed(1)}" y1="${railY - 14}" x2="${cutB.toFixed(1)}" y2="${railY + 14}"/>`
    + `<line class="rt-lead" x1="${bx.toFixed(1)}" y1="64" x2="${bx.toFixed(1)}" y2="${railY - 8}"/>`
    + figText("rt-brk", bx.toFixed(1), 34, "middle", copy.boundary.route.mainBridgeLabel)
    + figText("rt-bridge", bx.toFixed(1), 57, "middle", copy.boundary.route.mainBridge);

  const bracket = (from, to, tier) => `<line class="rt-bracket" x1="${from.toFixed(1)}" y1="168" x2="${to.toFixed(1)}" y2="168"/>`
    + nx.filter((_, index) => tiers[index] === tier)
      .map((x) => `<line class="rt-bracket" x1="${x.toFixed(1)}" y1="168" x2="${x.toFixed(1)}" y2="160"/>`).join("")
    + figText(`rt-tier rt-${tier}`, from.toFixed(1), 188, "start", tierLabel[tier]);

  const busY = 214;
  const colX = [150, 382, 614, 846, 1078];
  const trunkX = (nx[flip] - 14 + nx[nodes.length - 1] + 14) / 2;
  const bus = `<line class="rt-bus" x1="${trunkX.toFixed(1)}" y1="168" x2="${trunkX.toFixed(1)}" y2="${busY}"/>`
    + `<line class="rt-bus" x1="${colX[0]}" y1="${busY}" x2="${colX[colX.length - 1]}" y2="${busY}"/>`;

  const cutTop = 244;
  const cutBot = 286;
  let deepest = 0;

  const columns = copy.boundary.route.gaps.map(([code, , carries], index) => {
    const cx = colX[index];
    const rows = carries.map((id) => ledger.gaussian.find((row) => row.id === id));
    const half = figHoleWidth(rows, 34, 84) / 2;
    const head = `<line class="rt-stub" x1="${cx}" y1="${busY}" x2="${cx}" y2="${cutTop}"/>`
      + `<line class="rt-cut" x1="${(cx - half).toFixed(1)}" y1="${cutTop}" x2="${(cx + half).toFixed(1)}" y2="${cutTop}"/>`
      + figText("rt-code", cx, 272, "middle", code)
      + `<line class="rt-cut" x1="${(cx - half).toFixed(1)}" y1="${cutBot}" x2="${(cx + half).toFixed(1)}" y2="${cutBot}"/>`;

    if (!rows.length) {
      const note = figWrap(copy.boundary.route.gapCarriesNothing, 11, 200);
      deepest = Math.max(deepest, 320 + 14 * note.length);
      return head
        + `<line class="rt-drop" x1="${cx}" y1="${cutBot}" x2="${cx}" y2="302"/>`
        + `<line class="rt-dead" x1="${cx - 9}" y1="302" x2="${cx + 9}" y2="302"/>`
        + figLines("rt-note", cx, 320, 14, "middle", note);
    }

    /* .rt-sym is 12.5px --mono; measure it as that, not as 12px --sans. */
    const chipW = Math.min(2 * half - 12,
      Math.max(96, Math.max(...rows.map((row) => figWidth(row.symbol, 12.5, ADV.mono))) + 24));
    const chips = rows.map((row, slot) => {
      const y = 320 + slot * 28;
      return `<rect class="rt-chip" x="${(cx - chipW / 2).toFixed(1)}" y="${y}" width="${chipW.toFixed(1)}" height="22" rx="2"/>`
        + (row.interfaces.length > 1
          ? `<rect class="rt-chip-in" x="${(cx - chipW / 2 + 3).toFixed(1)}" y="${y + 3}" width="${(chipW - 6).toFixed(1)}" height="16" rx="1"/>`
          : "")
        + figText("rt-sym", cx, y + 15, "middle", row.symbol);
    }).join("");
    deepest = Math.max(deepest, 320 + 28 * (rows.length - 1) + 22);

    return head
      + `<line class="rt-drop" x1="${cx}" y1="${cutBot}" x2="${cx}" y2="300"/>`
      + figText("rt-carries", cx, 312, "middle", copy.boundary.route.gapCarries)
      + chips;
  }).join("");

  /* One row can go dark two ways. Say so, rather than leave a chip drawn twice
     with no explanation; both the fact and the codes come from the ledger. */
  const dupNote = ledger.gaussian.filter((row) => row.interfaces.length > 1)
    .map((row) => (copy.dir === "zh"
      ? `${row.symbol} 同时挂在 ${row.interfaces.join(" 与 ")} 上，因此在图上出现两次。`
      : `${row.symbol} hangs on ${row.interfaces.join(" and ")} at once, so it is drawn twice.`)).join("  ");

  const H = deepest + 40;
  return `<svg class="rt rt-wide" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(figRouteLabel(copy))}">
${links}${bridge}${markers}
${bracket(nx[0] - 14, nx[flip - 1] + 14, "closed")}${bracket(nx[flip] - 14, nx[nodes.length - 1] + 14, "conditional")}
${bus}${figText("rt-buslabel", 8, busY + 4, "start", copy.boundary.route.busLabel)}
${columns}
${dupNote ? figText("rt-note", 8, H - 16, "start", dupNote) : ""}</svg>`;
};

/* Below 1024px the same drawing turns through ninety degrees: the rail runs
   down the left margin, the titles sit beside it on one line each, and the
   five holes stack under the chain instead of fanning out beside it. */
export const figRouteNarrow = (copy) => {
  const W = 360;
  const railX = 46;
  const nodes = copy.boundary.route.stations;
  const tiers = nodes.map(([, , tier]) => tier);
  const flip = tiers.indexOf("conditional");
  const tierLabel = Object.fromEntries(copy.explain.tagKey.map(([state, label]) => [state, label]));
  /* The open span opens exactly as far as its own label needs, and no further.
     Measured the way it is drawn: .rt-bridge is 14px --mono (site.css), and the
     label starts at railX + 20 inside a 360-unit box, so the room it actually
     has is W - (railX + 20) - 8. It used to be measured at 12px --sans against
     a typed 268, which is how the English plate printed the site's one verbatim
     open-bridge sentence as "finite K4 substrate → faithful phys / realization"
     on every phone and tablet. */
  const bridgeX = railX + 20;
  const bridgeRoom = W - bridgeX - 8;
  const bridgeLines = figWrap(copy.boundary.route.mainBridge, 14, bridgeRoom, ADV.mono);
  const openSpan = 46 + 15 * bridgeLines.length;
  const ny = nodes.map((_, index) => 34 + 56 * index + (index >= flip ? openSpan : 0));

  const links = ny.slice(0, -1).map((y, index) => {
    if (index === flip - 1) return "";
    const tier = tiers[index] === "closed" && tiers[index + 1] === "closed" ? "closed" : "conditional";
    const tip = ny[index + 1] - 11;
    return `<line class="rt-link rt-${tier}" x1="${railX}" y1="${(y + 11).toFixed(1)}" x2="${railX}" y2="${(tip - 6).toFixed(1)}"/>`
      + `<path class="rt-arrow rt-${tier}" d="M${railX - 4.6} ${(tip - 7).toFixed(1)} L${railX} ${tip.toFixed(1)} L${railX + 4.6} ${(tip - 7).toFixed(1)}"/>`;
  }).join("");

  const markers = ny.map((y, index) => `<rect class="rt-node rt-${tiers[index]}" x="${railX - 6.5}" y="${(y - 6.5).toFixed(1)}" width="13" height="13"/>`
    + figText("rt-idx", railX + 20, (y + 4).toFixed(1), "start", String(index + 1).padStart(2, "0"))
    + figText("rt-title", railX + 44, (y + 4).toFixed(1), "start", nodes[index][0])).join("");

  const cutA = ny[flip - 1] + 22;
  const cutB = ny[flip] - 22;
  const bridge = `<line class="rt-link rt-open" x1="${railX}" y1="${(ny[flip - 1] + 11).toFixed(1)}" x2="${railX}" y2="${cutA}"/>`
    + `<line class="rt-link rt-open" x1="${railX}" y1="${cutB}" x2="${railX}" y2="${(ny[flip] - 11).toFixed(1)}"/>`
    + `<line class="rt-cut" x1="${railX - 13}" y1="${cutA}" x2="${railX + 13}" y2="${cutA}"/>`
    + `<line class="rt-cut" x1="${railX - 13}" y1="${cutB}" x2="${railX + 13}" y2="${cutB}"/>`
    + figText("rt-brk", bridgeX, cutA + 18, "start", copy.boundary.route.mainBridgeLabel)
    + figLines("rt-bridge", bridgeX, cutA + 38, 15, "start", bridgeLines);

  const bracket = (from, to, tier) => {
    const mid = (from + to) / 2;
    return `<line class="rt-bracket" x1="22" y1="${from.toFixed(1)}" x2="22" y2="${to.toFixed(1)}"/>`
      + ny.filter((_, index) => tiers[index] === tier)
        .map((y) => `<line class="rt-bracket" x1="22" y1="${y.toFixed(1)}" x2="30" y2="${y.toFixed(1)}"/>`).join("")
      + `<text class="rt-tier rt-${tier}" x="13" y="${mid.toFixed(1)}" text-anchor="middle" transform="rotate(-90 13 ${mid.toFixed(1)})">${esc(tierLabel[tier])}</text>`;
  };

  const busY = ny[nodes.length - 1] + 34;
  const bus = `<line class="rt-bus" x1="22" y1="${(ny[nodes.length - 1] + 11).toFixed(1)}" x2="22" y2="${busY}"/>`
    + `<line class="rt-bus" x1="22" y1="${busY}" x2="${railX}" y2="${busY}"/>`
    + figText("rt-buslabel", railX + 12, busY + 4, "start", copy.boundary.route.busLabel);

  let y = busY;
  const columns = copy.boundary.route.gaps.map(([code, , carries]) => {
    const rows = carries.map((id) => ledger.gaussian.find((row) => row.id === id));
    const half = figHoleWidth(rows, 11, 26) / 2;
    const top = y + 28;
    const bottom = top + 34;
    let block = `<line class="rt-stub" x1="${railX}" y1="${y.toFixed(1)}" x2="${railX}" y2="${top.toFixed(1)}"/>`
      + `<line class="rt-cut" x1="${(railX - half).toFixed(1)}" y1="${top.toFixed(1)}" x2="${(railX + half).toFixed(1)}" y2="${top.toFixed(1)}"/>`
      + figText("rt-code", railX, (top + 22).toFixed(1), "middle", code)
      + `<line class="rt-cut" x1="${(railX - half).toFixed(1)}" y1="${bottom.toFixed(1)}" x2="${(railX + half).toFixed(1)}" y2="${bottom.toFixed(1)}"/>`;

    if (!rows.length) {
      const note = figWrap(copy.boundary.route.gapCarriesNothing, 11, W - (railX + 22) - 8);
      block += `<line class="rt-drop" x1="${railX}" y1="${bottom.toFixed(1)}" x2="${railX}" y2="${(bottom + 12).toFixed(1)}"/>`
        + `<line class="rt-dead" x1="${railX - 9}" y1="${(bottom + 12).toFixed(1)}" x2="${railX + 9}" y2="${(bottom + 12).toFixed(1)}"/>`
        + figLines("rt-note", railX + 22, bottom + 18, 14, "start", note);
      y = bottom + 18 + 14 * note.length;
      return block;
    }

    /* Chips flow into as many rows as they need; E8's four make two, and the
       block below it grows by exactly that much. */
    const placed = [];
    let cursorX = railX + 22;
    let cursorY = bottom + 24;
    for (const row of rows) {
      const w = Math.max(78, figWidth(row.symbol, 12.5, ADV.mono) + 20);
      if (cursorX + w > W - 8 && cursorX > railX + 22) { cursorX = railX + 22; cursorY += 27; }
      placed.push({ row, x: cursorX, y: cursorY, w });
      cursorX += w + 8;
    }
    const foot = cursorY + 21;
    block += `<line class="rt-drop" x1="${railX}" y1="${bottom.toFixed(1)}" x2="${railX}" y2="${foot.toFixed(1)}"/>`
      + figText("rt-carries", railX + 22, (bottom + 14).toFixed(1), "start", copy.boundary.route.gapCarries)
      + placed.map(({ row, x, y: cy, w }) => `<rect class="rt-chip" x="${x.toFixed(1)}" y="${cy.toFixed(1)}" width="${w.toFixed(1)}" height="21" rx="2"/>`
        + (row.interfaces.length > 1
          ? `<rect class="rt-chip-in" x="${(x + 3).toFixed(1)}" y="${(cy + 3).toFixed(1)}" width="${(w - 6).toFixed(1)}" height="15" rx="1"/>`
          : "")
        + figText("rt-sym", (x + w / 2).toFixed(1), (cy + 14.5).toFixed(1), "middle", row.symbol)).join("");
    y = foot + 12;
    return block;
  }).join("");

  const dupLines = ledger.gaussian.filter((row) => row.interfaces.length > 1)
    .flatMap((row) => figWrap(copy.dir === "zh"
      ? `${row.symbol} 同时挂在 ${row.interfaces.join(" 与 ")} 上，因此在图上出现两次。`
      : `${row.symbol} hangs on ${row.interfaces.join(" and ")} at once, so it is drawn twice.`, 11, W - 16));
  const H = Math.round(y + 16 + 14 * dupLines.length);

  return `<svg class="rt rt-narrow" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(figRouteLabel(copy))}">
${links}${bridge}${markers}
${bracket(ny[0] - 11, ny[flip - 1] + 11, "closed")}${bracket(ny[flip] - 11, ny[nodes.length - 1] + 11, "conditional")}
${bus}
${columns}
${figLines("rt-note", 8, y + 14, 14, "start", dupLines)}</svg>`;
};

export const renderRouteFigure = (copy) => {
  const isZh = copy.dir === "zh";
  const r = copy.boundary.route;
  const carried = new Set(r.gaps.flatMap(([, , carries]) => carries));
  const widest = r.gaps.reduce((best, gap) => (gap[2].length > best[2].length ? gap : best));
  /* Counted, never typed: how many holes, how many rows fall through them, and
     which single hole takes the most. The last clause is the figure's own
     honesty — the errata are not indexed by link, so nothing here claims one. */
  const note = isZh
    ? `${r.gaps.length} 个具名缺口共承载 ${carried.size} 行数值，${widest[0]} 一条承载 ${widest[2].length} 行；缺口画多宽，就是有多少行从这里掉下去。缺口按缺口画，不按链节定位——作者的勘误没有按链节编号。`
    : `The ${r.gaps.length} named gaps carry ${carried.size} numeric rows between them; ${widest[0]} alone carries ${widest[2].length}. A gap is drawn as wide as the number of rows that fall through it. The gaps are drawn as gaps, not placed link by link — the author’s errata are not indexed by link.`;

  return `<figure class="fig fig-route">
${figRouteWide(copy)}
${figRouteNarrow(copy)}
<figcaption class="fig-cap"><p><b>${esc(figNumeral(copy, Number(r.number)))}</b>${esc(r.figCaption)}</p>
<p class="fig-note">${esc(note)}</p></figcaption>
</figure>`;
};
