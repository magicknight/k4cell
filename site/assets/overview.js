/* Preserve shared links to anchors in the original long research pages. */
(() => {
  const main = document.querySelector("[data-research-route]");
  if (!main) return;
  const anchors = new Set(main.dataset.legacyAnchors.split(" "));
  const resolveAnchor = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (!id || document.getElementById(id) || !anchors.has(id)) return;
    location.replace(main.dataset.researchRoute + location.hash);
  };
  window.addEventListener("hashchange", resolveAnchor);
  resolveAnchor();
})();
