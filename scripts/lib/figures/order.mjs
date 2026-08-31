import assert from "node:assert/strict";

/* ------------------------------------------------------------------ *
 * FIGURE NUMBERS. One place, in reading order.                        *
 *                                                                     *
 * The page used to number its plates 1, 5, 3, 2, 4, 6 — the old       *
 * section order carried into the new one — while three decks carried  *
 * numerals of their own ("Fig. 6", "Fig. 8") that the templates       *
 * silently overrode. A reader who scans a figure number and finds it  *
 * out of order reads carelessness, and rightly.                       *
 *                                                                     *
 * So: the map below is the only place a figure numeral is decided.    *
 * Where a deck carries the numeral in its own words (the running head *
 * of Fig. 2 and Fig. 3, the numeral of Fig. 5, the route's number),   *
 * assertFigureNumbers refuses the build unless the deck agrees with   *
 * this map. Nothing is overridden at render time any more.            *
 * ------------------------------------------------------------------ */

export const FIG = Object.freeze({
  glyph: 1,        /* §A  the object itself, on the first screen        */
  imaginary: 2,    /* §E  after claim 05 — where i comes from           */
  hypercharge: 3,  /* §E  after claim 06 — seven fractions, times six   */
  ruler: 4,        /* §F  the digit ruler                               */
  sigma: 5,        /* §F  the sigma axis                                */
  route: 6,        /* §I  the route and its published holes             */
});

/* "Fig. 3" / "图 3" — built from the deck's own label word, never typed. */
export const figNumeral = (copy, n) => `${copy.figures.ruler.figWord} ${n}`;

export const assertFigureNumbers = (decks) => {
  const numbers = Object.values(FIG);
  assert.deepEqual([...numbers].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6],
    "the figure numbers must be a contiguous 1…6 in reading order");

  for (const copy of decks) {
    const pins = [
      ["imaginary.kicker", copy.imaginary.kicker, figNumeral(copy, FIG.imaginary)],
      ["hypercharge.kicker", copy.hypercharge.kicker, figNumeral(copy, FIG.hypercharge)],
      ["ledger.sigma.figNumber", copy.ledger.sigma.figNumber, figNumeral(copy, FIG.sigma)],
    ];
    for (const [key, printed, wanted] of pins) {
      assert.equal(printed, wanted,
        `${copy.dir}: ${key} prints "${printed}", but the figure order gives "${wanted}"`);
    }
    assert.equal(Number(copy.boundary.route.number), FIG.route,
      `${copy.dir}: boundary.route.number is ${copy.boundary.route.number}, the figure order gives ${FIG.route}`);
  }
};
