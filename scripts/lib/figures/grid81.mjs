import { EDGES, VERTS, states } from "../data.mjs";
import { esc } from "../html.mjs";

/* The 81 basis states as a 9 x 9 plate. Each state is <g class="st"
   data-sig="a,b,c"> (the colour-count signature app.js filters on), drawn
   over a shared <use href="#tet"> skeleton with its same-colour edges as
   <line class="me"> and its four site dots as <circle class="q0|q1|q2">. */
export const renderGrid = (label) => {
  const cells = states.map((state, index) => {
    const dots = state.word
      .map((colour, site) => `<circle cx="${VERTS[site][0]}" cy="${VERTS[site][1]}" r="3.4" class="q${colour}"/>`)
      .join("");
    const monoLines = state.mono
      .map(([a, b]) => `<line x1="${VERTS[a][0]}" y1="${VERTS[a][1]}" x2="${VERTS[b][0]}" y2="${VERTS[b][1]}" class="me"/>`)
      .join("");
    const x = (index % 9) * 40;
    const y = Math.floor(index / 9) * 40;
    return `<g class="st" data-sig="${state.signature}" transform="translate(${x} ${y})"><use href="#tet"/>${monoLines}${dots}</g>`;
  }).join("");

  const skeleton = EDGES
    .map(([a, b]) => `<line x1="${VERTS[a][0]}" y1="${VERTS[a][1]}" x2="${VERTS[b][0]}" y2="${VERTS[b][1]}"/>`)
    .join("");

  return `<svg class="grid81" viewBox="-2 -2 364 364" role="img" aria-label="${esc(label)}">
<defs><g id="tet" class="te">${skeleton}</g></defs>${cells}</svg>`;
};
