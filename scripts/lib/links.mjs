import { ledger } from "./data.mjs";
import { esc } from "./html.mjs";

/* Commit pins into the public-review repository. Both are historical: the
   review PDF is frozen at publicReviewCommit, and the status documents
   (targets, checksums, errata) at publicStatusCommit. status.json prints
   the second as PASS@<commit>; check/integrity.mjs pins its prefix. */
export const publicReviewCommit = "36becf6d6941fc5e51fb7897a93a6b8443f100ba";
export const publicStatusCommit = "f7393338360c0bb972a5c662f744175f9ecdf9e7";
export const repo = "https://github.com/magicknight/k4-cell-framework-public-review";

export const links = {
  repository: repo,
  pdf: `${repo}/blob/${publicReviewCommit}/K4_Cell_Framework_v2.0-public-review.pdf`,
  conceptDoi: `https://doi.org/${ledger.artifact.conceptDoi}`,
  targets: `${repo}/blob/${publicStatusCommit}/REVIEW_TARGETS.md`,
  checksums: `${repo}/blob/${publicStatusCommit}/CHECKSUMS.txt`,
  errata: `${repo}/blob/${publicStatusCommit}/ERRATA.md`,
  discussions: `${repo}/discussions`,
  issues: `${repo}/issues/new/choose`,
  vaults: "https://github.com/magicknight/k4v-research-funding-vaults/tree/e1afead138fbf56956b298ebae7a97a8ae9ad956",
  contact: "mailto:zhihua@k4cell.com",
  orcid: "https://orcid.org/0000-0001-6027-6883",
};

/* Interface codes and target names link to the author's own published errata
   and review targets, so a reader can go straight to the objection. */
export const linkCodes = (text) => esc(text)
  .replace(/\bE(1[01]|[1-9])\b/g, `<a href="${links.errata}">E$1</a>`)
  /* Two branches: \b cannot fire before a Han character, so the Chinese
     review targets never linked at all under the single combined pattern. */
  .replace(/\b(Targets?)\s?([A-D0-9]+(?:\s?and\s?[A-D0-9]+)*)/g,
    `<a href="${links.targets}">$1 $2</a>`)
  .replace(/(靶点)\s?([A-D0-9]+(?:\s?[与、]\s?[A-D0-9]+)*)/g,
    `<a href="${links.targets}">$1 $2</a>`);
