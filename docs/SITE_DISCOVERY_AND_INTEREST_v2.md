# Discovery, progress, and contact-only feedback

Implemented from the founder’s 2026-09-09 instruction to synchronize the plan and proceed.

## Routes and sources

| Route | Role | Source |
|---|---|---|
| `/`, `/en/`, `/zh/` | Five-section discovery homepage; root shows English content immediately | `src/copy/overview.js`, `scripts/lib/sections/overview.mjs` |
| `/{en,zh}/research.html` | Existing complete account, figures, numerical comparisons and checking tools | Original copy fragments, `scripts/lib/sections/page.mjs` |
| `/{en,zh}/progress/` | Frozen v2.0 versus author-confirmed v3.0 work in progress | New overview copy; `status.json` working-monograph field |
| `/{en,zh}/support/` | Research updates, funding/collaboration, and separate K4V information | Localized copy and purpose-specific email drafts |
| `/{en,zh}/interest/` | Versioned K4V explanation and six-question feedback draft | `src/assets/interest.js` |
| `/support/`, `/languages.html` | Retained legacy contact and language surfaces | Original sources; support links to both localized pages |

The paper palette and static generator remain in use. No new dependency, hosted form service, payment processing, or wallet connection was introduced. Existing long-page anchor links resolve to the full account through `overview.js`; with scripts off, the explicit research link remains available. Legacy anchors already represented on the short homepage stay there.

The new copy leads with the research question and puts numerical comparisons on the full research page. The falsification sentence now names the normal-ordering claim and dependent conclusions rather than declaring the entire page void.

## Current facts and candidate status

- v3.0 is **in progress**, confirmed by the author on 2026-09-09. No public v3.0 PDF is asserted or linked.
- Public v2.0 remains the frozen review artifact. The full account labels its source/version date; this change does not assert newly verified journal status.
- Candidate `K4V-180D-2026-09-09` adopts a fixed 180-day founder cliff from official T0, followed by capped 30-day windows without catch-up or carryover. Supply and allocation remain 1 billion and 30/50/12/8.
- Existing public vault programs still use 730 days. The new program has not passed acceptance; exact T0, price, valuation, liquidity and other production inputs remain open.
- All signed provenance, no-mint statements, registry objects and frozen numerical evidence retain their bytes. Only the nonsigned site-status date pin and public-key-only GPG invocation change in the existing integrity gate; complete fingerprint and signature checks remain required. The gate dearmors the pinned public key and verifies with `gpgv`, avoiding a secret-key agent and its socket.

## What the questionnaire does

1. Require explicit answers to motivation, understanding of rights, conditional interest, deciding conditions, dealbreakers and willingness to look again. “No interest” is a first-class answer.
2. Accept optional preferred contact and self-reported source. Keep follow-up consent separate and unchecked. Merely entering a contact address or saying “look again” does not supply consent.
3. Generate a reviewable email draft with version and purpose. Editing an answer invalidates the old draft, so changed consent is not sent from a stale link.
4. Let the visitor open their own email app or copy the draft. No data is transmitted, persisted or counted by the page. A draft is not a submission, buyer, order or financing commitment.
5. Provide a direct email alternative when scripts or the email application are unavailable.

The recipient handles actual received mail privately. Personal contact information and raw answers must not enter this public repository. Initial exploratory interviews are intended to identify conditions and confusion; website clicks cannot be extrapolated into market demand or funds raised.

## Validation and release

`npm test` runs the original scientific, signature, registry, copy, figure, theme and integrity checks against the full account, plus the new discovery/feedback checks. `node scripts/verify-determinism.mjs` verifies reproducible output. PR checks do not deploy. The existing Pages workflow deploys only after main changes; a proposed branch is not a live-site receipt.

New program engineering, actual interview responses, external outreach and grant outcomes require their own evidence. No outreach message or on-chain transaction is executed by this change.
