# Site review — 2026-11-02

> Review object: `main` at 2a28b32, built locally (`npm run build`, `npm run check` passing) and compared with live https://k4cell.com (identical).
> Method: six independent review lenses (visitor UX, Chinese copy, accessibility, performance/SEO, science communication, freshness/correctness), each finding re-checked by a separate adversarial verifier instructed to refute it.
> Status: **findings only — no changes made.** Every item below awaits a human decision.

Totals: 48 findings — 3 high, 12 medium, 33 low (severity after verification). Verifier verdicts: 27 confirmed, 21 partly (overstated or partly a documented choice; severity lowered), 0 refuted.

## Decisions that need the author

These touch scientific framing, not mechanics, and should not be changed without an author decision:

- **Lean / code availability disclosure** (science-comm, high) — the site cites Lean certification counts while the corpus is not public.
- **μ/e headline two-stage construction** (science-comm, high) — bare algebraic ratio vs. endpoint protocol factors.
- **Monograph / DOI title** (science-comm, medium) — 'Zero-Parameter Derivation…' vs. the site's conditional framing.
- **m_b/m_s interface tag, Λ 2.6σ vs ≈2.8σ** (science-comm, low).
- **K4V material placement and zh token-allocation wording** (science-comm low, zh-copy medium).

Mechanical fixes with no scientific content (mobile overflow, contrast, hreflang/canonical, research-page links, CMB-S4 replacement, terminology, form limits) can be done independently.

## Index

| # | Severity | Verdict | Lens | Finding |
|---|---|---|---|---|
| 1 | high | confirmed | Accessibility | The signed K4V statement page is cut off on phones: text runs to 480px and the overflow is hidden (WCAG 1.4.10 Reflow) |
| 2 | high | confirmed | Science communication | The site presents Lean certification and 'check it yourself' claims, but the Lean corpus and numerical code are not public, and the site never says so |
| 3 | high | confirmed | Science communication | The 15-digit μ/e headline hides that the bare algebraic ratio misses by about 4,300σ and that the match comes from added 'protocol' factors |
| 4 | medium | confirmed | Accessibility | The Prediction Registry note in section 06 ('How to kill it') has 1.53:1 text contrast |
| 5 | medium | confirmed | Accessibility | Chinese headings and paragraphs on the bilingual K4V and Prediction Registry pages have no lang attribute (WCAG 3.1.2) |
| 6 | medium | confirmed | Accessibility | Inline links on the newer routes are told apart from the text around them only by colour (WCAG 1.4.1) |
| 7 | medium | confirmed | Freshness / correctness | Research page still lists CMB-S4 as a 2030s falsification experiment, but the US cancelled CMB-S4 in July 2025 |
| 8 | medium | confirmed | Freshness / correctness | K4V feedback mailto link goes past common URL limits with ordinary Chinese answers, so drafts can be cut off without warning |
| 9 | medium | confirmed | Performance / SEO | / and /en/ serve the same page, both canonical to themselves, and neither names an x-default |
| 10 | medium | confirmed | Performance / SEO | The en/zh full research pages (the site's main content) have no hreflang pairing |
| 11 | medium | confirmed | Science communication | The monograph and DOI title, 'Zero-Parameter Derivation of the Standard Model…', contradicts the site's careful 'conditional / open interface' framing |
| 12 | medium | partly | Visitor UX | The full research page, which the homepage's main button opens, has no site navigation, and its 'Support' links skip the new localized support page and go to the old bilingual /support/ page |
| 13 | medium | confirmed | Chinese copy | The Chinese brand name appears in three different forms, and none matches the term used in the body text |
| 14 | medium | confirmed | Chinese copy | The zh K4V proposal uses "个人" for the founder allocation, and its privacy line is ambiguous |
| 15 | medium | confirmed | Chinese copy | About 4,300 Chinese characters on /zh/research.html are set at 11px, with no zh size adjustment |
| 16 | low | confirmed | Accessibility | The keyboard focus ring is about 2:1 on the dark section-06 plate (WCAG 1.4.11 / 2.4.7) |
| 17 | low | confirmed | Accessibility | Two figures on the research pages loop forever with no pause control unless the OS reduced-motion setting is on (WCAG 2.2.2) |
| 18 | low | confirmed | Accessibility | The route's 'pull this bridge' buttons are labelled only 'E3', 'E5'…, and the live announcement runs words together |
| 19 | low | partly | Accessibility | An answer made only of spaces passes the browser check but then gets a generic error that does not say which question (WCAG 3.3.1) |
| 20 | low | confirmed | Freshness / correctness | Legacy /support/ page says "2 papers currently under review" in the present tense, hardcoded and not tied to status.json |
| 21 | low | partly | Freshness / correctness | Journal-status record (2026-08-29) and progress date (2026-09-09) are 2-3 months old in the section titled "The dates when this page will have to change" |
| 22 | low | confirmed | Freshness / correctness | With scripts off, 7 research-page buttons and the "Prepare email draft" button do nothing, and the interest form's noscript note only appears after the form |
| 23 | low | partly | Freshness / correctness | CI never re-checks external links or content freshness after a deploy, and the two workflows have drifted apart |
| 24 | low | partly | Performance / SEO | No scholarly or structured metadata, though the work has a Zenodo DOI |
| 25 | low | partly | Performance / SEO | One 102 KB render-blocking stylesheet on every page; the short homepages use about 12% of it |
| 26 | low | partly | Performance / SEO | The K4V no-mint, prediction registry and notice pages have no Open Graph/Twitter tags |
| 27 | low | partly | Performance / SEO | OG block lacks image dimensions/alt, site_name and locale |
| 28 | low | partly | Performance / SEO | site/_headers is served as a public file and a source comment still says it protects production |
| 29 | low | partly | Science communication | Crypto-token material on the science homepage and research page is the strongest crank signal for a physicist |
| 30 | low | partly | Science communication | Narrative sentences state physical identifications as fact while the tags say conditional, and some phrases read like numerology |
| 31 | low | partly | Science communication | m_b/m_s and the bound rows show no conditional tag, though by the page's own definitions they depend on open steps |
| 32 | low | partly | Science communication | Two numbers a reader can recompute from the page do not match (m_b/m_s pull; Λ '2.6σ at 0.5%') |
| 33 | low | partly | Visitor UX | The old /support/ and /predictions/ pages are still indexed and still linked from new pages, but have no site header, mix both languages, and repeat or contradict the localized pages |
| 34 | low | partly | Visitor UX | The homepage hero never says concretely what K4 claims or why it matters. The concrete hook exists only on the research page. |
| 35 | low | confirmed | Visitor UX | The K4V feedback questions silently stop accepting text at 160 characters, with no counter or hint |
| 36 | low | partly | Visitor UX | The email draft the visitor reviews shows internal codes instead of their own answers, and a second email link that drops all their answers sits right below it |
| 37 | low | confirmed | Visitor UX | On the support and progress pages, the main buttons touch the text around them, and footnote paragraphs run full width and blend into the cards above |
| 38 | low | confirmed | Visitor UX | The main nav never shows which page you are on, and the support page has self-referencing links |
| 39 | low | partly | Visitor UX | / and /en/ serve the same homepage and each claims to be the canonical URL; /languages.html is orphaned but still indexable |
| 40 | low | confirmed | Chinese copy | English data strings and role words left untranslated on /zh/research.html |
| 41 | low | confirmed | Chinese copy | The /zh/support/ eyebrow is hard-coded English "CONTACT ONLY" |
| 42 | low | partly | Chinese copy | The short pages and the research page use different Chinese terms for review, review targets and the prediction registry |
| 43 | low | partly | Chinese copy | The short zh pages contain stiff, literal phrasings |
| 44 | low | confirmed | Chinese copy | The Fig. 5 σ-scale aria-label runs its sections together with no separator (both languages, worst in zh) |
| 45 | low | partly | Chinese copy | Names and punctuation for the same thing differ within /zh/research.html |
| 46 | low | confirmed | Chinese copy | The Fig. 3 aria-label opens with "第 06 行", which clashes with the figure's own rows 01–07 |
| 47 | low | partly | Chinese copy | The zh interest-form email draft shows the user English codes instead of the answers they chose |
| 48 | low | confirmed | Chinese copy | The legacy bilingual /support/ (still in the sitemap) has unidiomatic Chinese and stale facts, and the zh research and notice pages have no hreflang alternates |

## High severity

### 1. The signed K4V statement page is cut off on phones: text runs to 480px and the overflow is hidden (WCAG 1.4.10 Reflow)

- **Lens:** Accessibility · **Verdict:** confirmed · **id:** `official-k4v-mobile-reflow-clip`
- **Where:** https://k4cell.com/official-k4v/ (live matches the repo byte for byte); official-k4v/index.html:29-35; src/assets/site-body.css:728-729 (.notice-page / .notice-inner), :14 (body overflow-x:hidden)

**Evidence.** In Playwright at 390px and at 320px, document.scrollWidth is 480. ARTICLE.notice-inner, the eyebrow, the h1, every <p> and the Chinese h2 all extend from x=24 to x=480. Because body has overflow-x:hidden, the extra width cannot be scrolled to, so it is simply clipped. In the screenshot (/tmp/claude-2002/-home-zhihua-work-k4cell/8385c5de-1736-4cec-b70c-4d823c33077e/scratchpad/k4v_mobile.png) lines end mid-word: 'There is no official mint address, token contract, pre…' and 'K4V 名称或符号的代币均非官方 K4V' is cut. The cause is .notice-page{display:grid;place-items:center}: the grid item .notice-inner sizes to fit its content, and its widest content is the unbreakable 40-character fingerprint <code>C74953F6…</code> (right edge 411px) plus <pre class="sha"> holding the SHA-256 lines (right edge 480px). No other page fails at 320px.

**Verifier.** Reproduced on the local build (and the live page is identical to site/official-k4v/index.html, checked with diff). At 390px and at 320px, document.scrollWidth is 480 and .notice-inner runs from x=24 to x=480.5. The .sha pre is 454px wide with scrollWidth equal to clientWidth, so it does not scroll; it has grown to fit its content. The screenshot shows the English and Chinese paragraphs, the h2s and the eyebrow all cut at the right edge with no way to scroll, because body has overflow-x:hidden (site-body.css:15). /predictions/ and /support/ use the same .notice-page/.notice-inner layout but fit, at 390 and 320 respectively, because they have no long unbreakable strings. Cause as described: .notice-page is display:grid with place-items:center (site-body.css:728), and .notice-inner (:729) has only max-width:42rem. Nothing in README/docs freezes official-k4v/index.html (it is not hashed in PUBLICATION_RECEIPT), and browser_check.py has no mobile check for this page. This is the page whose job is to say 'no official mint', and on phones that sentence is cut off.

**Recommendation.** Add min-width:0 (and width:100%) to .notice-inner in src/assets/site-body.css:729, so the grid item is limited to the track and the existing overflow-x:auto on .sha can work. Add overflow-wrap:anywhere to .notice-inner p code for the 40-hex fingerprints. Add a 320px scrollWidth<=innerWidth check for /official-k4v/ and /predictions/ to tests/browser_check.py.

<details><summary>Original reviewer recommendation</summary>

In src/assets/site-body.css add width:100%;min-width:0 to .notice-inner, so the grid item cannot grow past the viewport and the .sha pre (which already has overflow-x:auto) scrolls instead. Also add overflow-wrap:anywhere to .notice-inner p code so the 40-hex-digit fingerprints wrap. Add a 320px check for /official-k4v/ to tests/browser_check.py.

</details>

### 2. The site presents Lean certification and 'check it yourself' claims, but the Lean corpus and numerical code are not public, and the site never says so

- **Lens:** Science communication · **Verdict:** confirmed · **id:** `lean-code-not-public-undisclosed`
- **Where:** http://127.0.0.1:4173/en/research.html#machine ; src/copy/fragments/kill-machine.json:278,279,295 ; src/copy/fragments/whys-a.json:72,87,125 ; src/copy/fragments/front.json:339 ; src/copy/fragments/verify-next.json:219-264 (verify link list)

**Evidence.** The research page says: "727/771 certified … Zero sorry", "The Lean corpus runs to 313 modules", "Machine side: five Lean modules, zero sorry … (CellBootstrapSignNormalisation)", "the core clauses are checked in Lean … here there are none", and "Rows 01 and 04 … you can check them yourself without taking the framework on trust." None of the 11 links in section 09 points to Lean source or code. The linked public-review repo contains only the PDFs plus a few metadata and review files (GitHub API listing). Its README says: "This release intentionally does not include LaTeX manuscript source, software source code, numerical scripts … or a full reproduction package." status.json has "full_scientific_reproduction_package": "OPEN", but the page never shows this. The 'certified' bucket is defined as "The Lean statement and the manuscript statement are logically equivalent". That match between Lean and prose is a human judgement; Lean does not check it. A skeptical physicist who goes looking for the 313 modules will find nothing, and every Lean claim then reads as unverifiable. (The arithmetic is consistent: 727+19+4+21=771 matches ledger.json.)

**Verifier.** Reproduced. kill-machine.json:278-280 gives '727 of them certified in Lean 4', 'Zero sorry' and 'The Lean corpus runs to 313 modules'. whys-a.json names specific modules (CellBootstrapSignNormalisation, CellBootstrapFixedPoint, CellBootstrapClockUniqueness). The GitHub API listing of k4-cell-framework-public-review shows only PDFs, CHECKSUMS, ERRATA, README, REVIEW_TARGETS, CITATION, LICENSE and review/. Its README (lines ~188-191) says the release 'intentionally does not include ... software source code, numerical scripts ... or a full reproduction package'. /status.json has full_scientific_reproduction_package: OPEN. Grepping the research copy finds no sentence saying the Lean source is unreleased. The nearest statements are numbers.json:179 ('The theoretical calculation still awaits independent reproduction') and a support work package for 'Reproducibility materials', and neither says this. One caveat: the 'check them yourself without taking the framework on trust' line (whys-a.json:72) is about rows 01 and 04, which can partly be checked on paper (n=4 from 2×360°/n=180°; the agree/differ sign test). That sub-point is weaker than claimed. The main point stands: the machine-certification claims cannot currently be checked, and the page does not disclose that.

**Recommendation.** Add an explicit disclosure to the section 07 lead in both languages (kill-machine.json:278 en, :127 zh), e.g. 'The Lean corpus has not been publicly released; these counts are the author's report.' Add a matching line to the section 09 link list. Better still, publish at least the CellBootstrap* modules with a toolchain pin and link them. Soften rather than delete the whys-a.json:72 sentence: say that the arithmetic of rows 01/04 can be checked by hand, while the Lean certificates are not yet public.

<details><summary>Original reviewer recommendation</summary>

Best fix: publish the Lean corpus, or at least the CellBootstrap* modules plus a lakefile and toolchain pin. Also publish a short script that diagonalises the 81×81 Hamiltonian (I checked by hand that 15/45/12/9 and E0=−2 are correct, so this is cheap). Link both from verify-next.json's list. Until then, add one sentence to the section 07 lead (kill-machine.json:278, and the zh string at :127): "The Lean source has not been released yet; these counts are the author's report and cannot yet be checked independently." Remove "without taking the framework on trust" (whys-a.json:72). Reword leanCertified (kill-machine.json:295) to "the author matched the Lean statement to the manuscript statement…".

</details>

### 3. The 15-digit μ/e headline hides that the bare algebraic ratio misses by about 4,300σ and that the match comes from added 'protocol' factors

- **Lens:** Science communication · **Verdict:** confirmed · **id:** `hero-mu-e-construction-hidden`
- **Where:** http://127.0.0.1:4173/en/research.html (hero, #l-mu_e, Fig. 4) ; src/copy/fragments/front.json:238-240 ; src/copy/fragments/numbers.json:188 ; v2.0 PDF p.243 (Remark 4.155/4.156) and p.693 (Eq. I.36)

**Evidence.** The hero reads "A four-point object yields a 15-digit value for the muon-to-electron mass ratio … All 8 agree." The row label explains the method only as "run through the same protocol the lab uses to extract it". In the frozen PDF (sha256 727d7c1f… verified), the algebraic carrier is R0 = 8192000/39623 = 206.74861, which is 0.0095% (≈4,300σ) from CODATA 206.7682827(46). The 15-digit value 206.768282688691 comes only after three further factors: (1+3689/25350·(αP/π·log Z)^4), B=1−(2569/4225)x², and exp((2√2)^-1(αP/π)²). Remark 4.156 calls the earlier offsets "protocol truncations, not tunable residuals". Fig. 4 says "The computation on all three rows is a closed theorem in the manuscript", but evidence/hero-mu-e/README.md is headed "K4 DERIVATION NOT INDEPENDENTLY REPRODUCED". Screenshots at 1366×860 and 390×844 show the eyebrow "under public review" above the fold, while "not peer reviewed" appears only in the small author line further down. A physicist who opens p.243 will see a post-hoc dressing pattern that the page did not mention.

**Verifier.** I verified the local frozen PDF's SHA-256 (727d7c1f...). Searching its decompressed content streams finds 'R_0=8192000/39623' next to MuHFS/endpoint terms, plus the coefficients 3689/25350 and 2569/4225. 8192000/39623 = 206.748606, which is 0.0095% (≈4,278σ) below CODATA 206.7682827(46). The only method wording on the site is numbers.json:188, 'run through the same protocol the lab uses to extract it'. A grep for 8192000, 39623 or any protocol-factor description in src/copy finds nothing. evidence/hero-mu-e/README.md is headed 'K4 DERIVATION NOT INDEPENDENTLY REPRODUCED' and says the repo 'does not yet reproduce that protocol'. The page never mentions the bare-to-dressed construction behind the 15 digits. Two mitigations: the hero above the fold (1366x860) already shows 'Conditional' and 'retrospective comparison' chips, and the Fig. 4 caption (numbers.json:129) says 'closed theorem in the manuscript', which is attribution rather than endorsement. The eyebrow change is therefore lower priority than disclosing the construction.

**Recommendation.** In the mu_e row note and the hero ruler caption, state the two stages: the bare algebraic ratio 8192000/39623 = 206.7486 (0.0095% off), then endpoint factors with coefficients 3689/25350, 2569/4225 and 1/(2√2), with the PDF page references. Link the evidence README's 'not independently reproduced' status from Fig. 4. Changing the eyebrow wording is optional.

<details><summary>Original reviewer recommendation</summary>

In the mu_e row (numbers.json:188) and the hero caption, print the two-stage construction openly: "bare algebraic ratio 8192000/39623 = 206.7486 (0.0095% off); the 15-digit value adds three endpoint factors with coefficients 3689/25350, 2569/4225, 1/(2√2), PDF p.243/Eq. I.36 — independent check of those coefficients is Target 5/6." Make the Fig. 4 caption match the evidence README ('stated as closed by the author; not independently reproduced'). Change the eyebrow (front.json:238) to "Candidate framework · not peer reviewed". Consider leading the hero with the exact 9/40 or the 81-state frustration theorem, which a reader can actually check.

</details>

## Medium severity

### 4. The Prediction Registry note in section 06 ('How to kill it') has 1.53:1 text contrast

- **Lens:** Accessibility · **Verdict:** confirmed · **id:** `kill-registry-contrast`
- **Where:** /en/research.html#kill and /zh/research.html#kill; scripts/lib/sections/page.mjs:400; src/assets/site-body.css:494-496; src/assets/themes/paper.overrides.css:37-47

**Evidence.** axe reports color-contrast on .kill-registry with foreground #c4bfb1 on background #edeae1 at 13px, giving 1.52:1; my own compositing check gives 1.53. Screenshot: /tmp/claude-2002/-home-zhihua-work-k4cell/8385c5de-1736-4cec-b70c-4d823c33077e/scratchpad/kill.png, where the sentence is barely visible. .kill-registry paints a light --bg-1 box, but it sits inside .sec-kill, where paper.overrides.css remaps --fg-2 to the plate's light ink (--rule-2). The note's own colour is therefore pale-on-pale. This is the only body-text contrast failure on the site.

**Verifier.** Computed style on /en/research.html: .kill-registry has color rgb(196,191,177) on background rgb(237,234,225) at 13px, which is about 1.5:1. The element screenshot shows the sentence as barely legible grey on cream. The cause is as stated: paper.overrides.css:43 remaps --fg-2 to --rule-2 inside .sec-kill, while site-body.css:496 gives the note a light --bg-1 box. The markup is page.mjs:400. The link inside renders at about 8:1 and is fine, but the status sentence ('currently contains 0 preregistered predictions') is the part that fails.

**Recommendation.** Simplest fix: inside the light box, restore paper inks with .sec-kill .kill-registry{--fg-1:<paper fg-1>;--fg-2:<paper fg-2>} (or reference the base theme tokens directly). This keeps the existing --link legible. Dropping the background instead would need a plate-safe --link, because overrides.css:58-61 notes --link is 2.1:1 on the plate.

<details><summary>Original reviewer recommendation</summary>

In src/assets/site-body.css either drop background:var(--bg-1) from .kill-registry (it then sits on the dark plate, where --fg-2 measures about 9:1), or restore paper ink inside the box with .kill-registry{--fg-2:var(--text-3)}. If the box goes dark, the registry link also needs a plate-safe --link (paper.overrides.css already warns that --link is 2.1:1 there).

</details>

### 5. Chinese headings and paragraphs on the bilingual K4V and Prediction Registry pages have no lang attribute (WCAG 3.1.2)

- **Lens:** Accessibility · **Verdict:** confirmed · **id:** `chinese-without-lang`
- **Where:** official-k4v/index.html:23-25, 27, 32 and later bilingual headings; predictions/index.html:24-26, 42 (copied to site/official-k4v/ and site/predictions/)

**Evidence.** Both pages declare <html lang="en"> and contain whole Chinese blocks, for example <h2>K4V 尚未发行</h2>, <p>目前不存在官方 mint 地址…</p>, <h2>预测注册基础：通过。预注册预测：零。</h2> and 'What the signature establishes · 签名建立了什么'. `grep -c 'lang="zh'` returns 0 for both files. By contrast, support/index.html (31 lang marks) and languages.html already mark their Chinese parts, so an English screen-reader voice will mispronounce or skip the Chinese half of the official statement.

**Verifier.** grep -c 'lang="zh' returns 0 for official-k4v/index.html and predictions/index.html, against 31 for support/index.html. Both pages are <html lang="en"> and contain whole Chinese h2/p blocks: official-k4v lines 23-25, 34-35 and 56-57, plus mixed 'English · 中文' headings and list items; predictions lines 24-26 and 64-65. The live official page is byte-identical. Medium is fair. Some screen readers detect CJK script automatically, but many English voice configurations (for example NVDA with eSpeak) will spell out or skip the Chinese, and this is the official bilingual statement.

**Recommendation.** Add lang="zh-Hans" to the Chinese <h2>/<p> elements, and wrap the Chinese half of mixed headings and list items in <span lang="zh-Hans">, following support/index.html.

<details><summary>Original reviewer recommendation</summary>

In official-k4v/index.html and predictions/index.html, wrap each Chinese block in lang="zh-Hans" (on the <h2>/<p> itself, or a <span lang="zh-Hans"> for the Chinese half of a mixed 'English · 中文' heading), following the pattern support/index.html already uses. Add a check in scripts/check/ that flags CJK text without a zh lang ancestor on lang=en pages.

</details>

### 6. Inline links on the newer routes are told apart from the text around them only by colour (WCAG 1.4.1)

- **Lens:** Accessibility · **Verdict:** confirmed · **id:** `prose-links-colour-only`
- **Where:** src/assets/site-body.css:41-52 (the list of prose-link selectors); scripts/lib/sections/page.mjs:571 (.overview-archive-note), :531 (.what), :400 (.registry-note); scripts/lib/sections/overview.mjs:73 (progress journal note 'GitHub →'), :102 (interest 'You can also write directly'), :34 (footer 'Verify the signed official statement')

**Evidence.** axe reports link-in-text-block on /en/research.html (6), /zh/research.html (3), /en/progress/ and /zh/progress/, /zh/interest/ (2), /zh/support/ and /zh/ (footer link). For each it gives 'link text #1a4f7a, surrounding text #332f28 = 1.54:1, no underline'. My scan found these un-underlined inline links next to running text: '.overview-archive-note > See current progress / Back to the short homepage', '.what > JUNO began taking data…' (and Hyper-K, DUNE, BabyIAXO), '.kill-registry > See the Prediction Registry', the progress page's 'GitHub →' and the interest page's 'You can also write directly'. The comment at site-body.css:28-40 says every prose link must be underlined, but the selector list was never extended to the overview, progress and interest renderers.

**Verifier.** Computed text-decoration is 'none' for these inline links that sit inside running sentences. On /en/research.html: .overview-archive-note ('See current progress', 'Back to the short homepage'), .kill-registry ('See the Prediction Registry') and five .what links (JUNO, Hyper-K, DUNE, its beam, BabyIAXO), each a link clause at the start of a paragraph that carries on as plain text. Also the progress-page 'GitHub →' at the end of a prose paragraph, the interest-page 'You can also write directly', and the footer 'Verify the signed official statement' next to bold text. The underline list at site-body.css:41-50 does not include these selectors, even though the comment at :28-40 says every prose link must be underlined. The footer row links ('Back to the homepage · status.json · GitHub') are a dot-separated link row rather than prose, so they matter less, but the in-sentence links are real WCAG 1.4.1 failures by the site's own stated rule.

**Recommendation.** Add .overview-archive-note a, .what a, .registry-note a, .overview-section p a, .overview-footer p a to the underline selector list at src/assets/site-body.css:41-50. Or switch to a default-underline rule for `main p a:not(.button)` with block controls opted out. Add a check to browser_check.py that inline p > a links have an underline.

<details><summary>Original reviewer recommendation</summary>

Add these selectors to the underline list in src/assets/site-body.css:41-50: .overview-archive-note a, .what a, .registry-note a, .overview-footer p a, .overview-section > p a, #interest-form ~ p a. Alternatively, invert the rule: underline every `main p a` / `footer p a` by default and opt out the block-level controls (.button, nav, card links). Add axe's link-in-text-block rule to tests/browser_check.py so a new route cannot regress.

</details>

### 7. Research page still lists CMB-S4 as a 2030s falsification experiment, but the US cancelled CMB-S4 in July 2025

- **Lens:** Freshness / correctness · **Verdict:** confirmed (reported as high) · **id:** `cmb-s4-cancelled`
- **Where:** https://k4cell.com/en/research.html#kill and /zh/research.html#kill ("Primordial gravitational waves" row). Source: src/copy/en.js:543, src/copy/zh.js:514, src/copy/fragments/kill-machine.json:115 and :266

**Evidence.** The visible text reads "Primordial gravitational waves … A detection at r ≳ 10⁻³ … puts the selected inflation branch out. CMB-S4 · LiteBIRD · 2030s", and the zh page reads "CMB-S4 · LiteBIRD … 2030 年代". On 10 July 2025 DOE and NSF told the project they "can no longer support the CMB-S4 project", and the project went into an orderly shutdown (cmb-s4.org statement; Scientific American, "U.S. Ends Support for CMB-S4 Project to Study Cosmic Inflation"). The other experiments in this section (JUNO, Hyper-K, DUNE, BabyIAXO) were refreshed with sources on 2026-09-27, but this row was not. A page whose selling point is naming who will test each claim, and when, now names an experiment that will not run.

**Verifier.** Reproduced. src/copy/en.js:543, src/copy/zh.js:514 and src/copy/fragments/kill-machine.json:115/266 contain "CMB-S4 · LiteBIRD" with "2030s" / "2030 年代". The live https://k4cell.com/en/research.html serves "CMB-S4 · LiteBIRD · 2030s", and local /zh/research.html has it too. DOE and NSF did announce in July 2025 that they would no longer support CMB-S4, which is in my own knowledge. The site has no caveat about it anywhere (grep of docs/README finds none). I lowered severity from high to medium: the row still names LiteBIRD, a live mission, and it is one row of six. Still, a page whose whole pitch is who tests each claim and when should not name a cancelled experiment.

**Recommendation.** Replace CMB-S4 in all four places with experiments that are still running or funded (e.g. Simons Observatory, BICEP/Keck, South Pole Observatory), keeping LiteBIRD. Re-check LiteBIRD's current launch target, since its schedule has slipped, and adjust the "2030s" window if needed. Add a source link in the same style as the 2026-09-27 refresh rows, then rebuild.

<details><summary>Original reviewer recommendation</summary>

Replace "CMB-S4" in src/copy/en.js:543, src/copy/zh.js:514 and both entries in src/copy/fragments/kill-machine.json with experiments that are still funded (for example Simons Observatory / BICEP-Keck / LiteBIRD). Check LiteBIRD's current launch target and add a source link the same way the other experiment rows have one. Then rebuild.

</details>

### 8. K4V feedback mailto link goes past common URL limits with ordinary Chinese answers, so drafts can be cut off without warning

- **Lens:** Freshness / correctness · **Verdict:** confirmed · **id:** `mailto-length-chinese`
- **Where:** https://k4cell.com/zh/interest/ (and /en/interest/). Source: src/assets/interest.js:253-268 (prepareDraft builds bilingual labels and percent-encodes the whole body into the href)

**Evidence.** Measured with Playwright on the local preview: zh with 40 Chinese characters in each of q1/q2/q4/q5 gives an href of 2461 chars. zh with every field at maxlength (160×4 + 100 + 80) gives 8389 chars. en at maxlength gives 1829 chars. Each CJK character becomes 9 bytes after percent-encoding, and every line label is bilingual (e.g. "1. Motivation / 关注原因:"), so even the fixed labels cost hundreds of bytes on the zh page. Many mailto handlers fail or truncate above about 2,000 characters (Outlook desktop / Windows shell). The page does not detect this, the only fallback is the sentence "If your email app does not open, copy the draft", and there is no copy button. Other behaviour tested fine: invalidation on input, select and checkbox changes; whitespace-only rejection; newline/maxlength consistency; mailto encoding of Chinese (correct UTF-8 percent-encoding).

**Verifier.** Reproduced by calling prepareDraft from src/assets/interest.js in node. A zh draft with 1-character answers is already a 1026-char href, because the labels are bilingual and percent-encoded (lines 18-26). With 20 CJK chars per textarea it is 1742, with 40 it is 2462, with 80 it is 3902, and at maxlength 160 it is 6782. So ordinary Chinese answers go past the roughly 2,000-char mailto limit of some Windows/Outlook handlers. One correction: the cited lines 253-268 are wrong. The file has 62 lines; the draft is built at src/assets/interest.js:7-30, and the href is set at :43. There is a mitigation the reviewer understated: the full draft is shown in a readonly #draft-body textarea (overview.mjs:100), so a user can copy it by hand. Even so, there is no copy button and no warning when the link is too long, so silent truncation can happen.

**Recommendation.** In src/assets/interest.js, use labels in the page language only (this cuts the fixed overhead). When draft.href.length is over about 1800, link the button to subject only and tell the user to copy the draft. Add a Copy button for #draft-body (navigator.clipboard), and add a zh long-answer test to tests/browser_check.py.

<details><summary>Original reviewer recommendation</summary>

In src/assets/interest.js: (1) use labels in the page's language only, not both, to cut fixed overhead; (2) if draft.href.length is over about 1800, set the href to subject only and show a clear message ("Your answers are too long for a mailto link; copy the draft below and paste it into the email"); (3) add a "Copy draft" button using navigator.clipboard.writeText next to #open-email (renderer: scripts/lib/sections/overview.mjs around line 98-101). Add a zh long-answer case to tests/browser_check.py.

</details>

### 9. / and /en/ serve the same page, both canonical to themselves, and neither names an x-default

- **Lens:** Performance / SEO · **Verdict:** confirmed · **id:** `root-duplicates-en-no-x-default`
- **Where:** https://k4cell.com/ vs https://k4cell.com/en/; scripts/lib/sections/overview.mjs:13-21 (canonical = root ? "" : ...; hreflang appended via .replace without x-default); scripts/build.mjs:50; scripts/lib/emit.mjs:17 (SITEMAP_PATHS lists both "" and "en/")

**Evidence.** site/index.html (8620 B) and site/en/index.html (8628 B) differ only in canonical/og:url and 2 relative hrefs (diff output). / has <link rel=canonical href="https://k4cell.com/"> plus hreflang en=/en/ and zh-Hans=/zh/, so / points to alternates that do not list it back. No x-default appears on /, /en/, /zh/ or any progress/support/interest page. Only the unlisted legacy languages.html carries x-default. sitemap.xml submits both https://k4cell.com/ and https://k4cell.com/en/. Search engines get two indexable copies of the English homepage and an hreflang cluster that leaves out the URL most people link to.

**Verifier.** Confirmed. diff site/index.html site/en/index.html shows only canonical, og:url and two relative hrefs differ. / is canonical to itself (overview.mjs:14 `canonical = root ? "" : ...`) and declares hreflang en=/en/ and zh-Hans=/zh/ through the .replace at overview.mjs:21. No x-default appears on any page except legacy languages.html. sitemap.xml lists both https://k4cell.com/ and https://k4cell.com/en/. The fix is already partly in the code: html.mjs:32 defines ALTERNATES with an x-default="" entry, but overview.mjs bypasses it and hand-writes a two-entry pair. The docs only say the root shows English content (SITE_DISCOVERY v2 line 9). They say nothing about canonical/x-default handling, so this is not a documented choice.

**Recommendation.** In overview.mjs shell(), drop the hand-written .replace() and use the existing ALTERNATES helper (renderHead's alternates option) on the home pages, so /, /en/ and /zh/ all list en, zh-Hans and x-default=/. Add a check that every member of the cluster lists the same set.

<details><summary>Original reviewer recommendation</summary>

In overview.mjs shell(), add <link rel="alternate" hreflang="x-default" href="https://k4cell.com/"> on the home pages (/, /en/, /zh/), and x-default to the en route on the inner pages. The root keeps showing English content (deliberate per docs/SITE_DISCOVERY_AND_INTEREST_v2.md) but becomes the declared x-default. The other option is to canonicalize / to https://k4cell.com/en/ and drop "" from SITEMAP_PATHS. Pick one of these and add a check in scripts/check/ for it.

</details>

### 10. The en/zh full research pages (the site's main content) have no hreflang pairing

- **Lens:** Performance / SEO · **Verdict:** confirmed · **id:** `research-no-hreflang`
- **Where:** https://k4cell.com/en/research.html, https://k4cell.com/zh/research.html; scripts/lib/sections/page.mjs:557-561 (renderHead called without alternates)

**Evidence.** The head dump for site/en/research.html and site/zh/research.html has no <link rel="alternate" hreflang>. The only cross-link is a visible <a class="lang" hreflang=...> anchor (page.mjs:568), which search engines don't treat as an hreflang annotation. Every overview page (progress/support/interest) does declare the en/zh pair. The 226 KB / 215 KB research pages, which hold nearly all of the site's substantive text, are left out.

**Verifier.** Confirmed. site/en/research.html and site/zh/research.html emit a canonical and OG tags but no <link rel=alternate hreflang>. renderPage (page.mjs:557-561) calls renderHead without alternates. The only pairing is the visible <a class="lang" hreflang> at page.mjs:568, which is not an hreflang annotation. The overview pages do declare their pairs, so the largest pages are the inconsistent ones.

**Recommendation.** Make ALTERNATES/renderHead take a path (e.g. alternates: "research.html") and emit en, zh-Hans and x-default for the research pair. The same helper would then serve the overview and notice pages.

<details><summary>Original reviewer recommendation</summary>

In renderPage (page.mjs:558), emit hreflang en -> https://k4cell.com/en/research.html, zh-Hans -> https://k4cell.com/zh/research.html (plus x-default -> the en URL). The ALTERNATES helper in scripts/lib/html.mjs:32 only handles home-level paths, so generalize it to take a path.

</details>

### 11. The monograph and DOI title, 'Zero-Parameter Derivation of the Standard Model…', contradicts the site's careful 'conditional / open interface' framing

- **Lens:** Science communication · **Verdict:** confirmed (reported as high) · **id:** `monograph-title-overclaims`
- **Where:** https://doi.org/10.5281/zenodo.18892076 → zenodo.org/records/21264479 ; v2.0 PDF title page ; links from src/copy/fragments/verify-next.json:219,244 and the homepage 'Read the public monograph' (src/copy/overview.js)

**Evidence.** The Zenodo record that the concept DOI resolves to is titled "Microscopic Algebraic Theory of Holographic Emergence: Zero-Parameter Derivation of the Standard Model, Cosmology, and Emergent Gravity from a Four-Site SU(3) Substrate". The PDF title page reads "Zero-Parameter Standard-Model Derivations, Typed Cosmological Readouts, and Emergent Gravity". The site itself says the Standard-Model embedding is open (E8), the electroweak lift is open (E3), "The cosmological-constant problem is not solved here", and the spin-two graviton is "not yet constructed" (E11). The site never shows the title (grep finds no 'Zero-Parameter' in src/copy), so the first thing a physicist sees after clicking 'Read the public monograph' or 'Concept DOI' is a claim the site has just disclaimed. ERRATA.md has no entry about the title.

**Verifier.** The concept DOI resolves to zenodo.org/records/21264479. Its API title, and the CITATION.cff title in the public-review repo, is 'Microscopic Algebraic Theory of Holographic Emergence: Zero-Parameter Derivation of the Standard Model, Cosmology, and Emergent Gravity from a Four-Site SU(3) Substrate'. A grep for 'Zero-Parameter' in src/copy finds nothing, so the site never shows or contextualises this title, while its own copy marks E3, E7, E8 and E11 as open. I could not render the PDF title page, so that wording is unverified. I lowered severity to medium because the title lives in external, frozen records. The main lever on the site is a contextual note, and the real fix (retitling) belongs to v3.0 and the Zenodo or CITATION metadata.

**Recommendation.** In section 09 / 'Where the papers stand', quote the archived title with a one-line note that the 'derivation' steps it names are listed as open interfaces (E3/E7/E8/E11). Retitle in v3.0, the next Zenodo version and CITATION.cff.

<details><summary>Original reviewer recommendation</summary>

Show the full monograph title in section 09 / 'Where the papers stand' (boundary.json:382-387) with a note: "the frozen title says 'derivation'; per E3, E7, E8 and E11 these steps are open". Add a numbered erratum saying so. Give v3.0 and its Zenodo record a title that matches the site, e.g. 'A candidate programme…'.

</details>

### 12. The full research page, which the homepage's main button opens, has no site navigation, and its 'Support' links skip the new localized support page and go to the old bilingual /support/ page

- **Lens:** Visitor UX · **Verdict:** partly (reported as high) · **id:** `research-page-routes-to-legacy-support`
- **Where:** http://127.0.0.1:4173/en/research.html (also /zh/research.html); src/copy/en.js:56, src/copy/zh.js:56, scripts/lib/links.mjs:23, src/copy/fragments/front.json:60 and :259, scripts/lib/sections/page.mjs:566

**Evidence.** I listed every link on site/en/research.html. It has 0 links to /en/support/, /en/progress/ (absolute), /en/interest/ or /en/, and 3 links to ../support/ (the old page). The hero's 'Support the work' button goes to ../support/ (en.js:56, zh.js:56). The brand logo links to #hero, not the homepage (page.mjs:566). The sticky header holds only in-page anchors (The object, Eleven whys, The numbers, How to kill it, Deeper, 中文). The only ways back to the new pages are 'See current progress' and 'Back to the short homepage' in a banner that scrolls away. The page is 40,404 px tall on desktop and 65,868 px on mobile. So a visitor who clicks 'Read the research' on the homepage and then 'Support the work' leaves the new design and lands on an English-first, bilingual page with no site header (screenshot support_d_full.png). That page also says different things from /en/support/: it has 'Strategic investment conversation', 'Future K4V interest … speculative interest may be registered only by email', '2 papers currently under review' and 'Contact state recorded 2026-08-31'. Chinese readers on /zh/research.html get the same English-first page.

**Verifier.** Confirmed: site/en/research.html and site/zh/research.html each have 3 links to ../support/, from src/copy/en.js:56, zh.js:56, front.json:60 and :259, and links.mjs:23. The brand link is href="#hero" (page.mjs:566). In Playwright the header holds only in-page anchors plus 中文. The page is 40,404 px tall on desktop and 65,888 px on mobile. The live site matches. Overstated: the research page does link back to the new design, through the archive note at the top ("See current progress" → progress/, "Back to the short homepage" → ./). The legacy /support/ page also opens with two prominent buttons, "English support page" and "中文版支持页面" (site/support/index.html:24), so a visitor is one click from the localized page, not stranded. The docs say the full account is "published separately" and keep /support/ as a legacy surface that links to both localized pages. So this is an extra hop and an inconsistent message, not a dead end. Note that tests/browser_check.py:93 pins `.hero-actions a[href="../support/"]`, so that test has to change with the fix.

**Recommendation.** Point the research page's support links (the en.js/zh.js actions, both front.json entries, and links.support) at /en/support/ and /zh/support/, and update tests/browser_check.py:93. Make the brand link in page.mjs:566 go to ./ (the localized homepage), or add a 'Home' link to the research topbar. That is enough to keep the new pages reachable once the archive note scrolls away.

<details><summary>Original reviewer recommendation</summary>

Point the research page's support links to the localized pages: set the actions entry in src/copy/en.js:56 / zh.js:56 and the front.json entries to /en/support/ and /zh/support/, and give links.mjs a per-language support URL. In scripts/lib/sections/page.mjs:566, make the brand link go to /{lang}/. Add the same three site links (Research · Progress · Support) or a compact 'Home' link to the research header so it stays reachable after the banner scrolls away.

</details>

### 13. The Chinese brand name appears in three different forms, and none matches the term used in the body text

- **Lens:** Chinese copy · **Verdict:** confirmed (reported as high) · **id:** `zh-brand-name-three-ways`
- **Where:** https://k4cell.com/zh/ , /zh/progress/, /zh/support/, /zh/interest/ (header, <title>, og:title, eyebrow) vs /zh/research.html, /zh/notice/, /404.html; sources: scripts/lib/sections/overview.mjs:14 and :25 (hard-coded "K4 Cell Framework"), src/copy/overview.js:4-5, src/copy/fragments/front.json:10,35,39, src/copy/fragments/verify-next.json:187,196,206, src/copy/fragments/kill-machine.json:93

**Evidence.** A Chinese visitor sees three names for one project. (1) The short home and the progress/support/interest pages show the untranslated header "K4 Cell Framework", titles such as "公开版本与正在做的事 · K4 Cell Framework", and the eyebrow "梁植华 · K4 Cell Framework". (2) The research page header, notice, and 404 use "K4 单元", "K4 单元框架" and "返回 K4 单元". (3) The body of the research page calls the object "元胞" (87× in zh.js, 70× rendered), as in "一个元胞", "K4 元胞一章" and "多元胞一章". The same chapter is also cited as "多单元一章" (kill-machine.json:93), and front.json:111 has "许多个这样的四点单元". The overview pages are hard-coded in the renderer (overview.mjs:25 `<span>K4 Cell Framework</span>`), so they cannot be localized from copy. Confirmed on the live site: /zh/support/ contains "K4 Cell Framework" 3×.

**Verifier.** Counted in the built pages. site/zh/index.html has 'K4 Cell Framework' 4 times and site/zh/support/index.html has it 3 times. That string is hard-coded in scripts/lib/sections/overview.mjs:14 (the title suffix) and :25 (the header span). site/zh/research.html uses 'K4 单元' 4 times but '元胞' 70 times. notice/ and 404 use 'K4 单元' (front.json:10,35,39; verify-next.json:187,196,206). kill-machine.json:93 says '多单元一章' while the body says '多元胞'. One correction: '四点单元' in front.json:140 is a generic description, not a brand use. Keeping an English brand in a Chinese header is a common choice, so I lowered this from high, but 单元 and 元胞 naming the same object is a real inconsistency.

**Recommendation.** Pick one Chinese term (K4 元胞 / K4 元胞框架) for front.json brand.name/title/eyebrow, the verify-next notice titles and back links, and kill-machine.json:93. Make the overview header and title suffix come from copy (e.g. overview.zh.brandName) instead of the literal in overview.mjs:14/25, even if the English brand is kept next to it.

<details><summary>Original reviewer recommendation</summary>

Pick one Chinese name and use it everywhere. Suggested: "K4 元胞框架" for the full name and "K4 元胞" for the short form, matching the 70+ body uses of 元胞. Add a `brandName` field to the zh block in src/copy/overview.js and use it in scripts/lib/sections/overview.mjs:14/25 instead of the literal. Change brand.name/title in front.json and notice titles/back in verify-next.json from "K4 单元" to "K4 元胞", and "多单元一章" to "多元胞一章" in kill-machine.json:93. If the English brand is meant to stay, write it as "K4 元胞框架（K4 Cell Framework）" once in the header and use one form consistently.

</details>

### 14. The zh K4V proposal uses "个人" for the founder allocation, and its privacy line is ambiguous

- **Lens:** Chinese copy · **Verdict:** confirmed · **id:** `zh-interest-founder-vs-personal`
- **Where:** https://k4cell.com/zh/interest/ ; src/copy/overview.js:61-63,71

**Evidence.** The allocation line says "创始人 30%", but the next card is titled "个人释放" and the treasury card says "没有个人锁定期". The en version says "Founder release" and "no founder cliff". A reader cannot tell that "个人" means the founder's 30%, and in token terms "个人" suggests retail holders. Privacy text: "来信地址会随邮件提供" (en: "Your sender address accompanies the email"). "来信地址" reads as the project's address, not the respondent's. Both strings are on the live site.

**Verifier.** overview.js:61-63 says '创始人 30%', then titles the next card '个人释放' and writes '没有个人锁定期' in the treasury card. The en text (lines 136-137) says 'Founder release' and 'no founder cliff'. In a token allocation disclosure, '个人' is ambiguous and could be read as retail holders. The privacy text '来信地址会随邮件提供' (line 71) is also ambiguous about whose address is meant. Clear disclosure matters on this page.

**Recommendation.** Use '创始人份额释放' and '不设创始人锁定期', and rewrite the privacy sentence as '你的发件邮箱地址会随邮件一并发出'.

<details><summary>Original reviewer recommendation</summary>

In src/copy/overview.js:62 change "个人释放" → "创始人份额释放" and "锁定 180 天" → "创始人份额自官方发行起锁定 180 天". In :63 change "没有个人锁定期" → "不设创始人锁定期". In :71 change it to "你的发件邮箱地址会随邮件一并发出；填写联系方式不代表同意后续联系。"

</details>

### 15. About 4,300 Chinese characters on /zh/research.html are set at 11px, with no zh size adjustment

- **Lens:** Chinese copy · **Verdict:** confirmed · **id:** `zh-11px-han-text`
- **Where:** http://127.0.0.1:4173/zh/research.html (measured with Playwright, 1280px, all <details> open); src/assets/site-body.css:484 (.wcheck p), :588 (.kcheck p), :576 (.kmeta, mono), :509 (.ltype), :522 (.lnote), :638 (.gap p), :630 (.st-sub); the only zh-specific rule is :1374

**Evidence.** Computed styles show 94 elements holding 4,272 Han characters at 11px (font-size var(--t-nano)=.6875rem, PingFang/Noto Sans CJK stack). Another ~480 characters are 11px monospace with letter-spacing .06–.16em (.sec-k, .klab, .lane, .wscale). By element: every "去查" paragraph (details.wcheck p) is 1,109 characters, kill-card metadata dd.knote 495, ledger notes .lstate/.lnote/.ltype ~700, .kcheck p 143, gap cards 118. Some paragraphs run 300–400 characters of dense citations, e.g. why 03's "K4 元胞一章‘四维时空是拓扑必然’一节…". Han glyphs at 11px are well below the usual ≥12px minimum for Chinese body text. The CSS never adjusts size for zh except one h1 rule: `.overview-page:lang(zh-Hans) h1{max-width:13em}`.

**Verifier.** Measured with Playwright at 1280px on the local /zh/research.html with all details elements open. .wcheck p: 11 elements, 1,109 Han characters, computed 11px in PingFang/Source Han. .lnote: 305 characters at 11px. .ltype: 247. .gap p: 147. .kcheck p: 143. .st-sub: 117. All are 11px. --t-nano is .6875rem in all three theme files. The only zh-specific rule is site-body.css:1374 (overview h1), plus some html[lang=en] font rules. Paragraphs of dense Chinese prose are set at 11px.

**Recommendation.** Under html[lang=zh-Hans], raise the size for the prose classes (.wcheck p, .kcheck p, .lnote, .ltype, .lstate, .gap p, .st-sub) to about .8125rem (var(--t-micro)), or override --t-nano for zh.

<details><summary>Original reviewer recommendation</summary>

Add a zh override in src/assets/site-body.css, e.g. `html[lang=zh-Hans]{--t-nano:.78rem}`, or target prose classes: `:lang(zh-Hans) :is(.wcheck p,.kcheck p,.lnote,.ltype,.lstate,.gap p,.st-sub,.kmeta){font-size:.8125rem}`. Also set `letter-spacing:0` for Han text inside the mono label classes (.sec-k, .klab, .lane, .wlab, .eyebrow) under :lang(zh-Hans).

</details>

## Low severity

### 16. The keyboard focus ring is about 2:1 on the dark section-06 plate (WCAG 1.4.11 / 2.4.7)

- **Lens:** Accessibility · **Verdict:** confirmed · **id:** `focus-ring-on-kill-plate`
- **Where:** src/assets/site-body.css:54-55 (:focus-visible / summary:focus-visible use var(--link)); src/assets/themes/paper.overrides.css:37-63 (--link deliberately not remapped); /en/research.html#kill, the six 'Where to check' <summary> controls

**Evidence.** Tabbing reaches six <summary> elements inside #kill. Their outline is solid 2px rgb(26,79,122). Measured contrast of #1a4f7a against the plate grounds: 2.08:1 on #191712 and 1.92:1 inside a card (#211f19), below the 3:1 non-text bar. Screenshot: /tmp/claude-2002/-home-zhihua-work-k4cell/8385c5de-1736-4cec-b70c-4d823c33077e/scratchpad/killfocus.png, where the ring is faint navy on near-black. The overrides file says '§06 carries no anchor', but it does carry focusable summaries.

**Verifier.** Keyboard focus on the first of the six #kill summaries gives a computed outline of 2px solid rgb(26,79,122) (var(--link), site-body.css:54-55), shown over the dark §06 plate. paper.overrides.css:58-61 itself says this theme's --link 'reads 2.1:1 on the plate' and claims '§06 carries no anchor', but §06 contains six focusable <summary> controls and also the .kill-registry link. The ring is below 3:1 but not invisible, so low severity.

**Recommendation.** In paper.overrides.css, inside .sec-kill, set the outline colour for :focus-visible/summary:focus-visible to var(--fg-0), or add a --focus token used by site-body.css:54-55 and remap it. Correct the comment that says §06 has no anchor.

<details><summary>Original reviewer recommendation</summary>

In src/assets/themes/paper.overrides.css, inside .sec-kill, add a focus-ring token, e.g. set the outline colour to var(--fg-0) (17.6:1 on the plate). Or introduce a --focus custom property used by site-body.css:54-55 and remap it in .sec-kill. Then update the overrides comment to say that §06 contains focusable controls.

</details>

### 17. Two figures on the research pages loop forever with no pause control unless the OS reduced-motion setting is on (WCAG 2.2.2)

- **Lens:** Accessibility · **Verdict:** confirmed · **id:** `infinite-animation-no-pause`
- **Where:** scripts/lib/figures/deal.mjs:61, 97 (SMIL repeatCount="indefinite", 24 animates, dur=12s, hero 'Fig. 1'); src/assets/site-body.css:872-886 (.iwalk / .imk 8s infinite in #whys); /en/research.html, /zh/research.html

**Evidence.** site/en/research.html contains 24 <animate … dur="12s" repeatCount="indefinite"> elements and one .iwalk figure with `animation: iwalk 8s steps(4,end) infinite`. Under prefers-reduced-motion both are correctly swapped for still frames (site-body.css:760-767). Without that OS setting, though, motion that lasts more than 5 seconds plays next to the reading text and the page offers no pause, stop or hide control.

**Verifier.** site/en/research.html has 24 <animate repeatCount="indefinite"> elements and 2 .iwalk elements with an 8s infinite CSS animation (site-body.css:875, :882). No pause control exists (no pause-labelled element on the page). Reduced-motion and forced-colors fallbacks exist (site-body.css:760-767, 940-948), so the impact is limited to users who have not set the OS preference. Technically a WCAG 2.2.2 gap, but the figures are small and the motion is slow, so low severity.

**Recommendation.** Add a pause/play toggle per figure (svg.pauseAnimations() for the SMIL glyph and animation-play-state:paused for .iwalk/.imk), or stop the loops after a few cycles.

<details><summary>Original reviewer recommendation</summary>

Give each figure a small 'Pause animation' toggle button, added in src/assets/app.js the same way the gap toggles are. It would call svg.pauseAnimations() for the SMIL glyph and toggle an .is-paused class that sets animation-play-state:paused for .iwalk/.imk (or swaps to the existing .k4-still twin). Alternatively, stop the loop after a few cycles.

</details>

### 18. The route's 'pull this bridge' buttons are labelled only 'E3', 'E5'…, and the live announcement runs words together

- **Lens:** Accessibility · **Verdict:** confirmed · **id:** `gap-toggle-name-and-announcement`
- **Where:** src/assets/app.js:207-222 (gap toggle creation and announce), :234 (kill switch announce); /en/research.html#deeper

**Evidence.** Each gap renders <button class="gap-toggle" aria-pressed="false">E3</button> right after a visible 'E3' heading (screenshot: /tmp/claude-2002/-home-zhihua-work-k4cell/8385c5de-1736-4cec-b70c-4d823c33077e/scratchpad/route.png). Neither sighted nor screen-reader users are told what the button does: its name is 'E3, toggle button'. The rows it darkens are in #numbers, about 10,000px higher up the page. When pressed, the status region reads 'E3the step up to the weak and electromagnetic forces still has to be proved, not assumedcarries: sin²θW(MZ)E3', because textContent joins sibling elements with no whitespace. The qfilter code at app.js:107-109 already fixes this exact problem with a children-join helper.

**Verifier.** The button is <button class="gap-toggle" aria-pressed="false">E3</button>, appended after <span class="gap-code">E3</span>, with no aria-label or aria-describedby. After a click, the status region text is exactly 'E3the step up to the weak and electromagnetic forces still has to be proved, not assumedcarries: sin²θW(MZ)E3' (app.js:220 uses gap.textContent). The section does have an instruction above it ('Pull out a bridge and watch which numbers go dark.'), which slightly softens the naming problem. I also found that the kill switch announcement at app.js:234 is worse than reported: killswitch.textContent includes the hidden [data-kill-off] span, so it announces both states run together ('Pull every open interface at oncePut them back: …').

**Recommendation.** Give the toggle an accessible name that describes the action (e.g. aria-label 'Pull bridge E3' / localized), and build announcements from the visible parts with the existing say() join (app.js:110-112). For the kill switch, announce only the span that is not hidden, and say which ledger rows went dark, since they are far up the page.

<details><summary>Original reviewer recommendation</summary>

In src/assets/app.js, give the toggle a visible and accessible label that describes the action, e.g. textContent = `${copy.pull} ${code}` from a data attribute supplied by scripts/lib/sections/page.mjs, or aria-describedby pointing at the gap's paragraph. Build the announcement with the existing say()-style join over children (gap-code, description, carries) instead of gap.textContent, and do the same for the kill switch at :234.

</details>

### 19. An answer made only of spaces passes the browser check but then gets a generic error that does not say which question (WCAG 3.3.1)

- **Lens:** Accessibility · **Verdict:** partly · **id:** `interest-form-generic-error`
- **Where:** src/assets/interest.js:36-52 (prepare(), catch block at :48); /en/interest/, /zh/interest/

**Evidence.** Playwright test: fill q1, q4 and q5, set q2 to '   ', pick q3 and q6, then press 'Prepare email draft'. reportValidity() passes, because `required` accepts whitespace. prepareDraft() then throws 'Invalid q2', and the status shows only 'Please answer all six questions and check the answer lengths.' Focus stays on the button and no aria-invalid is set (checked: document.querySelectorAll('[aria-invalid]') is empty), so the user is not told that question 2 is the problem. An empty field, by contrast, is handled well: focus moves to q1 with a native message.

**Verifier.** Reproduced. With q2='   ', reportValidity() passes, prepareDraft throws (interest.js:10-11 trims, then rejects), #draft-status (role=status, aria-live=polite) shows the generic 'Please answer all six questions and check the answer lengths.', focus stays on #prepare-email, and no aria-invalid is set. The trigger, though, is an answer made only of whitespace, which is almost always deliberate. The message is announced and does tell the user what is wrong in general terms. A real but minor edge case.

**Recommendation.** Before reportValidity(), call setCustomValidity on required textareas whose trimmed value is empty, with a localized message, and clear it on input. The native flow then focuses and names the exact field.

<details><summary>Original reviewer recommendation</summary>

In src/assets/interest.js, before reportValidity(), run setCustomValidity() on each required textarea whose value.trim() is empty, with a localized message (clear it on input). The native flow will then focus and name the exact field. Or, in the catch block, parse the field name from the error, set aria-invalid="true" on that field, focus it, and name the question number in #draft-status.

</details>

### 20. Legacy /support/ page says "2 papers currently under review" in the present tense, hardcoded and not tied to status.json

- **Lens:** Freshness / correctness · **Verdict:** confirmed (reported as medium) · **id:** `support-currently-under-review`
- **Where:** https://k4cell.com/support/ (hero stat). Source: support/index.html:36 (a hand-written page copied byte for byte by scripts/lib/emit.mjs:83)

**Evidence.** support/index.html:36: `<strong>2</strong><span>papers currently under review<br><i lang="zh-Hans">当前在审论文</i>`. The only basis is status.json `recorded_at_utc: "2026-08-29"`, with CQG-116665 at AWAITING_REFEREE_REPORTS and JGP13432 at UNDER_REVIEW, both submitted in July 2026. Everywhere else the claim is carefully dated: research.html says "as recorded 2026-08-29 … then awaiting referee reports". Today (2026-11-02) is about 65 days after that record, and this page still asserts "currently" with no date. Because this page sits outside the generator, nothing will update it when status.json changes. It is also in sitemap.xml (scripts/lib/emit.mjs:17).

**Verifier.** support/index.html:36 does read "<strong>2</strong> papers currently under review / 当前在审论文" with no date. The page is copied as-is (emit.mjs:83), listed in SITEMAP_PATHS (emit.mjs:17) and served live. Elsewhere on the same page a date is given ("Contact state recorded 2026-08-31", line 129), and research.html dates its paper status. So this line is the odd one out. But nothing shows it is false today: both papers plausibly are still under review. The real risk is that it goes stale silently when a decision arrives, so low rather than medium.

**Recommendation.** Date the stat ("2 papers under review as recorded 2026-08-29 / 截至 2026-08-29 在审") in support/index.html:36, or generate it from status.json at build time.

<details><summary>Original reviewer recommendation</summary>

In support/index.html:36, either date-qualify the stat ("2 papers under review as recorded 2026-08-29 / 截至 2026-08-29 在审") or generate the number from status.json carved_submissions. A copy check in scripts/check/copy.mjs could reject "currently" or "当前" next to a journal-status count.

</details>

### 21. Journal-status record (2026-08-29) and progress date (2026-09-09) are 2-3 months old in the section titled "The dates when this page will have to change"

- **Lens:** Freshness / correctness · **Verdict:** partly (reported as medium) · **id:** `journal-status-record-aging`
- **Where:** https://k4cell.com/en/research.html#next, /en/progress/, /en/ and /zh/ hero, /status.json. Source: src/copy/en.js:730,850 (zh equivalents), src/copy/fragments/verify-next.json:330, src/copy/fragments/boundary.json:383, src/copy/overview.js:8,37,41,82, status.json fields recorded_at_utc and carved_submissions (scripts/lib/status.mjs)

**Evidence.** #next reads: "In the submission-portal record dated 2026-08-29, two papers … submitted in July 2026: one to Classical and Quantum Gravity, then awaiting referee reports; one to the Journal of Geometry and Physics, then under review. Neither had an outcome in that record." The homepage hero and progress page say "Progress updated · 2026-09-09" / "Last updated: 2026-09-09". status.json still has "recorded_at_utc": "2026-08-29" with CQG "AWAITING_REFEREE_REPORTS". Both papers have now been at their journals for 3.5 months, so referee reports or decisions are plausible. The wording is honestly dated, but the section promises dated change points and gives no newer record. The site's other fixed-date claims checked out: the 180-day K4V cliff is anchored to official_t0 = null, season-01 is relative to a start that has not happened (NOT_STARTED), and Hyper-K 2028 / DUNE 2029/2031 / BabyIAXO ~2029 were sourced on 2026-09-27.

**Verifier.** The facts check out: en.js:850 has the 2026-08-29 portal record, overview.js:82/111 says "Progress updated · 2026-09-09", and status.json has recorded_at_utc 2026-08-29 and site_updated_on 2026-09-27. But the copy is carefully and honestly dated ("then awaiting referee reports", "Neither had an outcome in that record"), so nothing on the page is wrong. A 2-month-old progress date is normal for a research site. Underneath, this is a reminder to re-check the journal portals, not a defect visitors would hit. It is only worth acting on if a decision has actually arrived, which the reviewer did not show.

**Recommendation.** When the author next checks the CQG/JGP portals, update status.json, the en/zh submission copy and the overview.js date together. An optional build-time warning (not a hard fail) for a recorded_at_utc older than about 90 days would help.

<details><summary>Original reviewer recommendation</summary>

Re-check both submission portals and update status.json (recorded_at_utc, carved_submissions[].status), en.js:730/850 and the zh equivalents, and the overview.js progress date in one commit, even if nothing changed ("no outcome as of 2026-11-xx"). Consider a check in scripts/check/ that warns when recorded_at_utc is more than 60 days older than the build date.

</details>

### 22. With scripts off, 7 research-page buttons and the "Prepare email draft" button do nothing, and the interest form's noscript note only appears after the form

- **Lens:** Freshness / correctness · **Verdict:** confirmed · **id:** `nojs-dead-controls`
- **Where:** https://k4cell.com/en/research.html#object and #deeper, /zh/research.html; https://k4cell.com/en/interest/ and /zh/interest/. Source: scripts/lib/sections/page.mjs:152,167,170,479; scripts/lib/sections/overview.mjs:98,102

**Evidence.** Playwright with java_script_enabled=False shows 5 `.qfilter` buttons, the `.qsweep` button ("Find a picture with no repeated colour") and the `[data-killswitch]` button ("Pull every open interface at once") all visible and inert (screenshot taken of the grid). app.js:209-210 states the project's own rule: "without JavaScript a control that does nothing would be worse than no control at all". The gap toggles follow it, but these 7 buttons are emitted in static HTML. On /en/interest/, a no-JS visitor can fill in all six textareas, then click a type=button "Prepare email draft" that does nothing. The `<noscript>` explanation is rendered after `</form>` (overview.mjs:102), so they only see it after typing their answers, which are then lost. Otherwise no-JS works: there were no console errors or 4xx on any of the 18 pages with or without JS, digits stay lit, steps show fully, and legacy anchors such as /en/#numbers correctly redirect to /en/research.html#numbers.

**Verifier.** Confirmed in source. The .qfilter buttons (page.mjs:152,167), the .qsweep button (page.mjs:170) and the [data-killswitch] button (page.mjs:479) are emitted in static HTML. No CSS hides them without JS: no scripting media query and no js-class gate in site-body.css. That contradicts the project's own rule at app.js:209-210, which is why the gap toggles are created at runtime. #prepare-email is a type=button (overview.mjs:98), and the <noscript> note comes after </form> (overview.mjs:102), so a no-JS visitor reads it only after typing. Severity stays low because no-JS visitors are rare, and the direct mailto fallback link does exist below the form.

**Recommendation.** Create the qfilter/qsweep/killswitch/prepare buttons from app.js and interest.js, or hide them with @media (scripting: none). Move the <noscript> note and the fallback mailto link above the form in overview.mjs.

<details><summary>Original reviewer recommendation</summary>

Either create these buttons from app.js the way the gap toggles are created, or hide them with CSS `@media (scripting: none){.qfilters,.qsweep,[data-killswitch],#prepare-email{display:none}}` in src/assets/site-body.css. In scripts/lib/sections/overview.mjs:102, move the `<noscript>` note (and the direct mailto link) above the form so no-JS visitors see it before they start typing.

</details>

### 23. CI never re-checks external links or content freshness after a deploy, and the two workflows have drifted apart

- **Lens:** Freshness / correctness · **Verdict:** partly · **id:** `ci-no-scheduled-link-freshness`
- **Where:** .github/workflows/check.yml, .github/workflows/pages.yml

**Evidence.** Both workflows only run on pull_request or push to main. They already run npm test, the output diff and the Playwright suite, so the browser suite is covered. Today's crawl of all 42 local and live URLs found 0 broken internal links and 0 missing #anchors, and live site/ matches the repo exactly (diff of status.json and progress page are identical). But the site has about 18 external citations (doi.org, indico.cern.ch, news.fnal.gov, juno.ihep.cas.cn, www-sk.icrr.u-tokyo.ac.jp, nu-fit.org …) and dated claims that age without any commit. The CMB-S4 cancellation and the 65-day-old journal record above are examples that no gate caught. www.nu-fit.org (v61.tbl-parameters.pdf) timed out after 60 s from this environment. That may be a local network issue, but nothing in CI would notice if it really went away. Smaller drift: pages.yml sets env FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true but check.yml does not, so PR and deploy run actions under different runtimes; and node scripts/verify-determinism.mjs runs only in check.yml, not before deploy in pages.yml.

**Verifier.** Confirmed: neither workflow has a schedule trigger. pages.yml runs on push/workflow_dispatch and check.yml on pull_request. FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 is set only in pages.yml, and verify-determinism.mjs runs only in check.yml. The drift matters little: every change to main goes through a PR where check.yml runs determinism, and the env var only affects which runtime the actions use. A scheduled external-link and staleness job is a reasonable process improvement, but it is not a visitor-facing defect. The nu-fit timeout was not shown to be a real outage.

**Recommendation.** Optional: add a weekly report-only workflow that checks external links and status.json age. Align the env var and add the determinism step to pages.yml for consistency.

<details><summary>Original reviewer recommendation</summary>

Add a scheduled workflow (e.g. weekly `on: schedule`) that serves site/, crawls internal and external links (with retries; report only, don't fail the build on third-party flakiness) and fails if status.json recorded_at_utc / site_updated_on is older than N days. Add the FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 env to check.yml and the verify-determinism step to pages.yml so the two workflows match.

</details>

### 24. No scholarly or structured metadata, though the work has a Zenodo DOI

- **Lens:** Performance / SEO · **Verdict:** partly (reported as medium) · **id:** `no-scholarly-metadata`
- **Where:** site/en/research.html, site/zh/research.html; scripts/lib/html.mjs:78-85 (og:type hard-coded to website); scripts/check/integrity.mjs:260

**Evidence.** research.html links https://doi.org/10.5281/zenodo.18892076, but no page has citation_* meta (grep count 0) or application/ld+json (none on any page). og:type is "website" on the research pages. integrity.mjs:260 asserts /<script(?![^>]*\bsrc=)/i, which also rules out a JSON-LD data block, even though CSP does not block non-executed data blocks.

**Verifier.** The facts hold: grep finds no citation_* meta and no ld+json, og:type is hard-coded to "website" (html.mjs:79), and integrity.mjs:260 forbids any non-src <script>. The value is overstated, though. research.html is a public summary that links out to the Zenodo record ("Concept DOI ... always resolves to the latest archive"). It is not the 1003-page monograph itself. Zenodo already serves citation_* meta for the work. Google Scholar's inclusion rules expect citation_* on the page that hosts the article's full text or abstract. Putting citation_doi on a secondary summary page risks duplicate or misattributed Scholar entries rather than helping.

**Recommendation.** Optionally set og:type=article on the research pages. Skip Highwire citation_* on the summary page, or limit it to a clearly separate abstract page. If structured data is wanted, a minimal JSON-LD ScholarlyArticle with sameAs pointing to the DOI is safer than citation_doi, and would need integrity.mjs:260 relaxed only for type=application/ld+json.

<details><summary>Original reviewer recommendation</summary>

Add Highwire citation_* meta to the research pages from page.mjs: citation_title, citation_author, citation_publication_date, citation_doi=10.5281/zenodo.18892076, citation_pdf_url if public. Google Scholar indexes these, and they need no script tag. Set og:type=article there. If schema.org ScholarlyArticle/Dataset (for ledger.json) is wanted, relax integrity.mjs:260 to allow <script type="application/ld+json"> only.

</details>

### 25. One 102 KB render-blocking stylesheet on every page; the short homepages use about 12% of it

- **Lens:** Performance / SEO · **Verdict:** partly · **id:** `monolithic-css`
- **Where:** https://k4cell.com/assets/site.css (102176 B raw / 29405 B gzip live); src/assets/site-body.css (overview rules start at line 1365); scripts/lib/theme.mjs (assembly)

**Evidence.** Measured with Chromium CSS rule-usage tracking on the local preview: / and /en/ use 12640 B of 102176 B (12.4%), /zh/progress/ 11.2%, /en/support/ 11.4%, /support/ 12.7%, /en/research.html 57.8%. The CSS is shared and cached, not inlined, but the live cache is only Cache-Control: max-age=600 (GitHub Pages), so first and repeat visits after 10 minutes download or revalidate the full sheet before first paint. The homepage HTML itself is 3 KB gzip.

**Verifier.** The sizes check out: site.css is 102176 B and about 28.8 KB gzip locally, and the overview block starts at site-body.css:1365. Live cache-control is max-age=600. The repeat-visit cost is overstated. A conditional request with the live ETag returns 304, so after expiry it is a small revalidation round-trip, not a re-download. 29 KB gzip in a single cached, shared request is a modest first-visit cost for a small static site. Splitting the sheet adds complexity and needs check-gate changes. A valid optimisation, but low priority.

**Recommendation.** Have theme.mjs emit a small overview.css (head + theme tokens + the .overview-* block from site-body.css:1365 onward) for overview/notice/404 pages, and keep the full sheet for research.html. Alternatively, split research-only figure rules into research.css. Add a check that each page's sheet set covers its classes.

### 26. The K4V no-mint, prediction registry and notice pages have no Open Graph/Twitter tags

- **Lens:** Performance / SEO · **Verdict:** partly · **id:** `missing-og-on-trust-pages`
- **Where:** https://k4cell.com/official-k4v/ (official-k4v/index.html), https://k4cell.com/predictions/ (predictions/index.html), /en/notice/ and /zh/notice/ (scripts/lib/sections/page.mjs:593-597 renderNotice passes no og)

**Evidence.** The head dump shows og:title present: False for official-k4v, predictions, en/zh notice and languages.html. All of these are in sitemap.xml and indexable. /official-k4v/ ("K4V has not launched · Founder-signed status") is the page most likely to be pasted into chats or social posts to counter scams, and it unfurls with no image or curated title. The notice descriptions are also very thin ("K4V has not launched." = 21 chars; zh 9 chars).

**Verifier.** Confirmed that official-k4v/, predictions/ and en/zh notice/ have no og:* or twitter:* tags, and renderNotice (page.mjs:593-597) passes no og. The claim that they unfurl "with no curated title" is wrong. Their <title> values are specific ("K4V has not launched · Founder-signed status", "K4 Prediction Registry · zero preregistered predictions") and meta descriptions exist, and unfurlers fall back to these. What is actually missing is the large image card. The notice descriptions really are thin ("K4V has not launched." and "K4V 尚未发行。").

**Recommendation.** Add og/twitter tags with the existing og-k4cell-{lang}.jpg to renderNotice and the official-k4v/predictions pages. Lengthen the notice meta descriptions to say what the notice covers.

<details><summary>Original reviewer recommendation</summary>

Pass og: ogFor(copy) (with the page URL) in renderNotice, and add the same og/twitter block to the hand-written official-k4v/index.html and predictions/index.html. A dedicated card image for the no-mint attestation would make the status clear in the preview itself.

</details>

### 27. OG block lacks image dimensions/alt, site_name and locale

- **Lens:** Performance / SEO · **Verdict:** partly · **id:** `og-tag-completeness`
- **Where:** scripts/lib/html.mjs:78-85

**Evidence.** The images are correct (file: 1200x630 progressive JPEG, 76 KB / 68 KB), but the pages emit only og:type/title/description/url/image + twitter:card. There is no og:image:width/height (Facebook/LinkedIn may skip the image on first share until it is fetched asynchronously), no og:image:alt or twitter:image:alt (accessibility on X/Mastodon), no og:site_name, and no og:locale / og:locale:alternate (en_US / zh_CN) for the bilingual pairs.

**Verifier.** Correct that html.mjs:78-85 emits only type/title/description/url/image plus twitter:card, with no og:image:width/height/alt, og:site_name or og:locale. The images are 76 KB / 68 KB, and a fixed 1200x630 image shared across all pages is fetched and cached once by each scraper, so the first-share risk is small. The fix is cheap but the impact is minor polish.

**Recommendation.** Add og:image:width=1200, og:image:height=630, og:image:alt (localized), og:site_name=K4 Cell Framework, og:locale + og:locale:alternate to the social array in headGroups.

### 28. site/_headers is served as a public file and a source comment still says it protects production

- **Lens:** Performance / SEO · **Verdict:** partly · **id:** `headers-file-stale-assumption`
- **Where:** https://k4cell.com/_headers (HTTP 200); scripts/lib/sections/page.mjs:631; scripts/lib/emit.mjs:28-39

**Evidence.** README.md:90 and emit.mjs:28 correctly say GitHub Pages ignores _headers. page.mjs:631 still says "in production site/_headers covers every path either way". Live curl -sI shows none of its policies: cache-control is max-age=600 (not the intended public, max-age=3600 for /assets/*), with no X-Frame-Options, X-Content-Type-Options, Referrer-Policy or Permissions-Policy. frame-ancestors cannot be set from a <meta> CSP, so the site can currently be framed. The 404 page's meta CSP (CSP.static) is weaker than the intended one.

**Verifier.** README.md:88-91 and emit.mjs:28 already document that GitHub Pages ignores _headers and keep it deliberately as a statement of intent. Serving it publicly (HTTP 200, application/octet-stream) is harmless. The one concrete defect is the stale comment at page.mjs:631 ("in production site/_headers covers every path either way"), which is a source-comment issue that visitors never see. Live has no X-Frame-Options or Referrer-Policy, and frame-ancestors can't be set via meta. That is a GitHub Pages limitation, and the site has no forms or authenticated actions, so clickjacking impact is minimal.

**Recommendation.** Correct the comment at page.mjs:631. Whether to publish _headers and whether to put a header-capable CDN in front is optional and should stay as documented.

<details><summary>Original reviewer recommendation</summary>

Fix the page.mjs:631 comment. Leave _headers out of the deployed site/ (or rename it to make clear it is documentation) so it is not published. If anti-framing or real cache control matters, put Cloudflare or a similar header-capable proxy in front of Pages. Otherwise accept and document the GitHub Pages defaults.

</details>

### 29. Crypto-token material on the science homepage and research page is the strongest crank signal for a physicist

- **Lens:** Science communication · **Verdict:** partly (reported as medium) · **id:** `k4v-token-on-science-pages`
- **Where:** http://127.0.0.1:4173/en/ ('Choose how to take part', footer) ; http://127.0.0.1:4173/en/research.html footer and section 09 link list ; src/copy/overview.js:106,108,135 ; scripts/lib/sections/page.mjs:586 ; src/copy/fragments/verify-next.json ("Founder-signed K4V status", "strategic investment conversations")

**Evidence.** The homepage's three participation cards include "Learn about K4V — Read the unlaunched token proposal". The homepage footer reads "Funding, attention, and token prices cannot establish whether its scientific claims are true." The research page shows K4V four times: a footer line "K4V has not launched · no official mint, presale, whitelist or payment wallet exists", a "Founder-signed K4V status" link in the verification list, and support copy about "strategic investment conversations". The proposal itself allocates "founder 30%" of one billion tokens (overview.js:135). Attaching a token (with a founder allocation) to a theory-of-everything claim is what makes a professional close the tab, and the repeated no-mint disclaimers draw attention to it.

**Verifier.** The facts check out. The /en/ homepage has a 'Learn about K4V' participation card and the footer line 'Funding, attention, and token prices cannot establish...'. The research footer has the no-mint line (page.mjs:586). Section 09 lists 'Founder-signed K4V status' and 'strategic investment conversations' (verify-next.json). However, README.md:22-23 and :155 and docs/SITE_DISCOVERY_AND_INTEREST_v2.md document K4V routes and the site-wide 'K4V has not launched' notice as deliberate: the palette was even chosen so the notice 'reads as a notice', which supports the anti-impersonation purpose. Moving it is an audience-strategy preference, not a defect. The defensible narrow point is that a token-status link and investment wording sit inside the scientific verification list on research.html.

**Recommendation.** Keep the site-wide no-mint notice, which is documented anti-scam policy. At most, move the 'Founder-signed K4V status' item and the 'strategic investment' wording out of the section 09 scientific verification list into a separate 'Project/support' sublist.

<details><summary>Original reviewer recommendation</summary>

Keep the K4V route, but take it off the science surfaces. Remove the K4V card and the 'token prices' sentence from the /en/ and /zh/ homepages (overview.js:106,108 and zh counterparts). Remove the no-mint footer line (page.mjs:586) and the 'Founder-signed K4V status' link from research.html. Link K4V only from /support/ and /notice/. If an anti-scam notice must be site-wide, put it on /notice/ and keep science pages free of token vocabulary.

</details>

### 30. Narrative sentences state physical identifications as fact while the tags say conditional, and some phrases read like numerology

- **Lens:** Science communication · **Verdict:** partly (reported as medium) · **id:** `narrative-overclaims-vs-tags`
- **Where:** src/copy/fragments/front.json:276,380 ; src/copy/fragments/whys-a.json:72,94 ; src/copy/fragments/numbers.json:182 ; src/copy/fragments/verify-next.json:353 ; /en/research.html#whys, #numbers

**Evidence.** "The Standard Model has about twenty dials … Here there are none." This sits beside the page's own admission of discrete branch, readout and channel choices, and of a six-neighbour honeycomb choice that "move[s] the scale across 10¹²–10¹⁷ GeV". Other examples: "Eleven things that, inside this framework, could not have been otherwise"; in row 02, "Those three columns are the three generations of matter. … 'Who ordered that?' Nobody did: the ground floor was always three columns wide", stated as fact although the same row lists E8 as open; "The same 92,633 turns up in three places in this theory"; and the closing line "Scientific truth, if found, belongs to humanity". The tier legend says "Every claim carries one small tag, in three tiers", but rows 02, 03, 05, 06, 07, 08 show two tags (Closed + Conditional, or Closed + Bound·test), and the double tag is never explained.

**Verifier.** Several quotes are already hedged in context. 'Here there are none' (front.json:276) is followed at :278 by noKnob, which defines the dial as continuous and lists the discrete branch, readout and channel freedoms; boundary.json:377 repeats this. The 92,633 sentence (numbers.json:182) is followed by 'The author calls this a structural agreement, not a derivation of one from the other.' Row 02 states 'Those three columns are the three generations of matter' plus the Rabi line, but the same paragraph ends 'carrying those three columns onto spacetime ... is a set of named interfaces the author himself lists as open', and the row carries a Conditional tag. Two points remain. First, the row 02 sentence states the identification as fact before hedging. Second, the tier legend 'Every claim carries one small tag' (front.json:380) conflicts with rows that show two tags. Both are minor wording issues.

**Recommendation.** Reword row 02's sentence to 'the framework identifies these three columns with the three generations (open: E8)'. Change the legend to 'Each claim carries a tag; a row may carry two — one for the mathematics, one for the physical identification.' Leave the other lines alone; they are already qualified in context.

<details><summary>Original reviewer recommendation</summary>

Rewrite these sentences in the voice the tags already use, e.g. "the framework identifies these three columns with the three generations (open interface E8)". Replace "Here there are none" with "No continuous dials; the discrete choices are listed in §08" and give a count. Drop the Rabi punchline and the 'humanity' closing line. Reword the 92,633 sentence as an open question (Target B) rather than a coincidence to admire. Change the legend (front.json:380) to say a row may carry two tags: the mathematical half and the physical half.

</details>

### 31. m_b/m_s and the bound rows show no conditional tag, though by the page's own definitions they depend on open steps

- **Lens:** Science communication · **Verdict:** partly (reported as medium) · **id:** `tier-tags-inconsistent-rows`
- **Where:** src/data/ledger.json:23-31 (mb_ms "interfaces": []) ; /en/research.html#l-mb_ms, #l-sum_mnu, #l-m_bb, #l-bao_scale

**Evidence.** λ_C and CKM J, both quark-sector rows, are tagged "Conditional · conditional on E8". m_b/m_s, a bottom/strange quark identification, has interfaces [] and shows no Conditional chip, which makes it look like the only unconditional quark row. The Λ note says m_b/m_s shares 92,633 with Λ, and §08 calls whether that sharing is "forced … or chosen" an open review target (Target B). Σm_ν is described as "on the selected branch", and the Λ falsifier card treats "stands on a selected branch" as the reason the line is conditional. Yet the Σm_ν, m_ββ and BAO rows carry no tier tag. Fig. 6 says the 5 gaps carry 6 rows, so a reader concludes the other 5 rows rest on nothing open, which the page itself contradicts.

**Verifier.** Confirmed for m_b/m_s. In ledger.json, mb_ms has interfaces [], while ckm_j and lambda_c (also quark-sector identifications) have ['E8']. The rendered #l-mb_ms row shows no Conditional chip, while #l-ckm_j shows 'Conditional · conditional on E8'. That inconsistency is visible to readers. The rest is weaker. sum_mnu, m_bb and bao_* sit in the ledger's separate 'bounds'/'diagnostics' lanes and render in their own lanes with ↓/σ_eq markers, which is a structural choice. The Fig. 6 text ('The 5 named gaps carry 6 numeric rows') counts the rows that hang on gaps; it does not claim the other rows are unconditional. Also, the ledger says it is copied verbatim from the public-review repo, so the empty interfaces may reflect the author's own errata rather than a site error.

**Recommendation.** Ask the author whether E8, the quark identification, applies to m_b/m_s. If it does, set interfaces ['E8'] in ledger.json; if not, add a note explaining why m_b/m_s carries no interface while λ_C and J do.

<details><summary>Original reviewer recommendation</summary>

In src/data/ledger.json, give mb_ms interfaces ["E8"] and note Target B. Give the bound and BAO rows an explicit tier chip (Conditional · selected branch, or Bound · test). Update the Fig. 6 note ('5 named gaps carry 6 rows') so it no longer suggests the remaining rows are unconditional.

</details>

### 32. Two numbers a reader can recompute from the page do not match (m_b/m_s pull; Λ '2.6σ at 0.5%')

- **Lens:** Science communication · **Verdict:** partly · **id:** `recomputable-arithmetic-mismatch`
- **Where:** src/copy/fragments/numbers.json:185 ; src/copy/fragments/kill-machine.json:229 (en), :78 (zh) ; /en/research.html#l-mb_ms and the 'cosmological constant' falsifier card

**Evidence.** m_b/m_s is "read out as 5,000,000/92,633", which is 53.9764 and gives a pull of 0.30σ against 53.94±0.12. The page prints 53.97 and 0.25σ, using the truncated value. For Λ, the page says the gap is 0.92σ at ±1.5% (gap 1.38%). At 0.5% that becomes 1.38/0.5 = 2.77σ, but the page says "turns that gap into 2.6 σ — and this comparison is then excluded on precision alone". A 2.6–2.8σ gap is not an exclusion by the page's own scale ("around 3 σ has to be explained").

**Verifier.** m_b/m_s: 5,000,000/92,633 = 53.9764, which gives a 0.304σ pull, while the page shows 0.25σ from the printed 53.97. The row label already says 'the frozen release prints 53.97', and the ledger note says pulls follow the published values. So this is a transparent, deliberate use of the frozen print, not an error, though showing both values would help. Λ: the gap is (2.93−2.89)/2.89 = 1.384%, which is 2.77σ at 0.5% (2.73σ if normalised to 2.93). The page says 2.6σ (kill-machine.json:229 en, :78 zh), and calling 2.6σ 'excluded on precision alone' conflicts with the page's own '~3σ has to be explained' scale. This is a small but real inconsistency.

**Recommendation.** Correct 2.6σ to ≈2.8σ in both languages, or state the basis used. Replace 'excluded on precision alone' with 'in clear tension'. Optionally show the exact-fraction pull (0.30σ) for m_b/m_s next to the frozen-print value.

<details><summary>Original reviewer recommendation</summary>

Compute the m_b/m_s pull from the exact fraction, or show both values (53.976 → 0.30σ; frozen print 53.97 → 0.25σ). Change 2.6σ to ≈2.8σ in both languages and replace "excluded on precision alone" with "would be in clear tension (≈2.8σ)".

</details>

### 33. The old /support/ and /predictions/ pages are still indexed and still linked from new pages, but have no site header, mix both languages, and repeat or contradict the localized pages

- **Lens:** Visitor UX · **Verdict:** partly (reported as medium) · **id:** `legacy-support-predictions-as-dead-ends`
- **Where:** http://127.0.0.1:4173/support/, http://127.0.0.1:4173/predictions/; support/index.html:36,61,69,129; predictions/index.html:62; scripts/lib/emit.mjs:17 (SITEMAP_PATHS); scripts/lib/sections/overview.mjs:50,70

**Evidence.** Both pages are in sitemap.xml with robots index,follow and a self canonical. Neither has the shared header or nav (screenshots predictions_d_full.png, support_d_full.png). Their only ways out are buttons at the very bottom. /predictions/ links its main button 'Support the research · 支持研究' to ../support/ (the old page), not the localized one (predictions/index.html:62). The homepage card 'Check the registry →' and the progress page both send visitors from /zh/ and /en/ to /predictions/, which is English-first: each section is in English, then repeated in Chinese, under English-only headings such as 'What must exist before K4-PRED-0001'. /support/ still invites K4V interest 'registered only by email' (support/index.html:69). That is a second K4V channel competing with the structured /en/interest/ questionnaire. Its stat '2 papers currently under review' and the 2026-08-31 contact date are older than the 2026-09-09 progress date.

**Verifier.** Confirmed: /support/ and /predictions/ are in sitemap.xml (SITEMAP_PATHS, emit.mjs:17), have robots index,follow and a self canonical, and have no shared header. /predictions/ links its support button to ../support/. /support/ still lists 'Strategic investment conversation', 'Speculative interest may be registered only by email', '2 papers currently under review' and 'Contact state recorded 2026-08-31'. Refuted or overstated: docs/SITE_DISCOVERY_AND_INTEREST_v2.md:14 calls /support/ a deliberately 'Retained legacy contact' surface whose job is to link to both localized pages, and it does so at the top, not only at the bottom. emit.mjs and the integrity checks treat support/ and predictions/ as hand-written frozen evidence pages, and the bilingual shell is deliberately tested (integrity.mjs:239). /predictions/ is a very short (3.6 KB) signed-registry page, so 'ways out only at the bottom' doesn't matter there. Saying the K4V email 'competes' with the questionnaire is a stretch: the questionnaire also produces an email to the same address. What remains is a real but minor content mismatch between the legacy and localized support pages.

**Recommendation.** Keep the legacy pages, which is documented, but remove or reword the stale and diverging lines on /support/ (strategic investment, K4V email interest, '2 papers under review'), or point K4V interest to /en/interest/ and /zh/interest/. Optionally drop support/ from SITEMAP_PATHS, or give it a canonical to /en/support/, so searchers land on the localized page.

<details><summary>Original reviewer recommendation</summary>

Treat /support/ as an old page. Either redirect it to /en/support/ (a meta refresh plus a language chooser, as /languages.html does), or reduce it to a short 'This page has moved' with links to /en/support/ and /zh/support/, and drop it from SITEMAP_PATHS in scripts/lib/emit.mjs:17. For /predictions/, add the shared header and point its support button to the localized support pages. If localizing it costs too much, at least label the link from /zh/ as English-first.

</details>

### 34. The homepage hero never says concretely what K4 claims or why it matters. The concrete hook exists only on the research page.

- **Lens:** Visitor UX · **Verdict:** partly (reported as medium) · **id:** `homepage-five-second-test`
- **Where:** http://127.0.0.1:4173/ and /zh/; src/copy/overview.js:80-81 (en), :6-7 (zh)

**Evidence.** Homepage hero: 'Asking about nature. Starting with four points.' plus 'K4 explores whether a finite quantum structure can lead to the structures and parameters of nature. Monograph v3.0 is in progress…'. A newcomer is not told what 'parameters of nature' means or why four points matter. Half the lead is spent on version status. The research page hero states the stakes plainly: 'The Standard Model takes these numbers as inputs. K4 aims to make them consequences of geometry.' The orphaned /languages.html says 'One finite object. Zero continuous fitted parameters.' Both are clearer than the homepage. I accept the documented choice to keep numerical comparisons off the homepage, but a plain statement of the question breaks no number rule.

**Verifier.** The quoted copy is correct (overview.js:81). But the lead does state the research question: 'whether a finite quantum structure can lead to the structures and parameters of nature'. The design doc says 'The new copy leads with the research question and puts numerical comparisons on the full research page', which is a deliberate choice. Saying the hero is unclear is a copywriting judgment, not a defect. The one concrete point that holds is that the version-status sentence repeats the 'v3.0 in progress' status chip directly below.

**Recommendation.** Optional copy tweak: remove the 'Monograph v3.0 is in progress.' sentence from the lead, since the status chip already says it, and use the space for one plain sentence on why the question matters (measured constants taken as inputs vs derived).

<details><summary>Original reviewer recommendation</summary>

In src/copy/overview.js (en lead at :81, zh at :7), replace the version-status sentence with a plain statement of the problem, for example: 'The Standard Model needs about twenty measured constants as inputs. K4 asks whether they can instead follow from one finite four-point object.' Keep 'v3.0 in progress' in the status chip that is already below the buttons.

</details>

### 35. The K4V feedback questions silently stop accepting text at 160 characters, with no counter or hint

- **Lens:** Visitor UX · **Verdict:** confirmed (reported as medium) · **id:** `interest-form-silent-160-char-cap`
- **Where:** http://127.0.0.1:4173/en/interest/; scripts/lib/sections/overview.mjs:93 (maxlength="160" rows="2"); src/assets/interest.js:20-23 (text(...,160))

**Evidence.** In Playwright I typed 400 characters into Q4 ('Which conditions matter most to your decision?'). The field kept exactly 160, with no message. The label shows no limit and there is no counter. The textareas are 2 rows high. 160 characters is about one sentence of English, which is short for questions that ask for conditions and reasons to decline, the main signal the questionnaire is meant to collect (docs/SITE_DISCOVERY_AND_INTEREST_v2.md, 'What the questionnaire does').

**Verifier.** Reproduced: overview.mjs:93 renders the open-question textareas with rows="2" maxlength="160", and interest.js:19-23 enforces 160. In Playwright, typing 400 characters into q4 left 160. No label gives a limit and there is no counter. The live site has the same 4 maxlength="160" fields. The impact is milder than claimed: with typing, the keys visibly stop working (pasted text is cut silently), and the draft opens in the visitor's own email app, where they can add more before sending. In Chinese, 160 characters holds much more content than in English.

**Recommendation.** Raise the limit to around 500-800 in both overview.mjs:93 and interest.js:19-23, show a '(up to N characters)' hint or a live counter, and use rows="4".

<details><summary>Original reviewer recommendation</summary>

Raise the limit for the open questions (for example 600 to 1000; the mailto URL with all answers was only 1269 characters). Show a visible counter or a '(up to N characters)' hint in each label, and use rows="4" in scripts/lib/sections/overview.mjs:93. Update the matching limit in src/assets/interest.js:20-23.

</details>

### 36. The email draft the visitor reviews shows internal codes instead of their own answers, and a second email link that drops all their answers sits right below it

- **Lens:** Visitor UX · **Verdict:** partly (reported as medium) · **id:** `interest-draft-review-confusing`
- **Where:** http://127.0.0.1:4173/en/interest/ (after 'Prepare email draft'); src/assets/interest.js:15-27 and :55-60; scripts/lib/sections/overview.mjs:100-102

**Evidence.** I filled the form in Playwright. The preview showed '3. Interest / 条件兴趣: LEARN', '6. Willing to look again / 愿意再看: UNSURE', 'Purpose: K4V_EARLY_FEEDBACK' and 'Source … UNKNOWN'. The visitor had picked 'Would like to learn' and 'Unsure', so the draft they are asked to check does not show their wording. An English visitor also sees Chinese labels, and a Chinese visitor sees English codes. Right below the primary 'Open in your email app' button, the link 'You can also write directly' stays visible (overview.mjs:102). It opens a blank template, so a visitor who clicks it loses everything they typed. Also, editing any field hides the whole preview and clears the status to '' (interest.js:55-58). The visitor gets no message saying the draft must be prepared again. The documented design only says the old draft must be invalidated.

**Verifier.** Reproduced: the preview shows '3. Interest / 条件兴趣: LEARN', '6. Willing to look again / 愿意再看: UNSURE', 'Purpose: K4V_EARLY_FEEDBACK' and 'Source … UNKNOWN', with bilingual labels for every language (interest.js:15-27). The fallback link stays visible after a draft is prepared. Editing a field hides the preview and sets the status to '' (interest.js:55-60). Refuted: 'loses everything they typed' is wrong. The fallback is a plain mailto link, so clicking it opens a blank template while the filled form stays on the page. The direct-email alternative is a documented requirement (doc 'What the questionnaire does' item 5), and invalidating the draft on edit is also documented. The codes are probably deliberate, so the author can parse replies. The real gap is cosmetic: the visitor reviews codes, not the words they picked, and gets no 'prepare again' message.

**Recommendation.** Show the localized option label next to each code (for example 'Would like to learn (LEARN)') and set #draft-status to an 'Answers changed; prepare the draft again' message on input. Keep the fallback link; at most relabel it 'Write without the form'.

<details><summary>Original reviewer recommendation</summary>

In src/assets/interest.js, write each option's localized label next to its code (for example 'Would like to learn (LEARN)'), and use labels in the visitor's language. When a draft has been prepared, hide or relabel the fallback link ('Write without these answers'). It could live inside a noscript or a hidden-when-JS state in overview.mjs:102. On input, set #draft-status to 'Answers changed. Prepare the draft again.' instead of an empty string.

</details>

### 37. On the support and progress pages, the main buttons touch the text around them, and footnote paragraphs run full width and blend into the cards above

- **Lens:** Visitor UX · **Verdict:** confirmed · **id:** `overview-cta-spacing-and-measure`
- **Where:** http://127.0.0.1:4173/en/support/, /en/progress/#updates; scripts/lib/sections/overview.mjs:75,81-82; src/assets/site-body.css:1400

**Evidence.** The screenshots en_support_d_full.png, en_support_m_full.png and en_progress_d_full.png show three problems. The black 'Open a collaboration email draft' and 'Open a research updates email draft' buttons have no space above or below, so they sit flush against the lead and the note. The workNote 'Costs and milestones follow an agreed scope… Contact grants no equity…' runs the full roughly 1150 px width at 1440 px. On mobile it sits right under 'Independent review' with no gap or divider, so it reads as part of that card. The cause: the buttons are bare <a> elements outside any <p>, and only `.overview-intro > p` gets a max-width (css:1400). That breaks the README's own rule that --col-read caps every prose element.

**Verifier.** Measured in Playwright on /en/support/: the lead paragraph's bottom equals the button's top (406.48 px) and the button's bottom equals the note's top (452.88 px), so there is zero gap above and below, on desktop and on mobile. The workNote paragraph is 1152 px wide at 1440 px, and its top equals the grid's bottom (960.84 px) with no spacing. The screenshot shows it sitting directly under the 'Independent review' card. Cause confirmed: the bare <a class=button> elements (overview.mjs:75,81-82), and only `.overview-intro > p` gets max-width (site-body.css:1400). The progress #updates CTA is built the same way.

**Recommendation.** Wrap the CTAs in <p class="hero-actions">, which already sets the margin (site-body.css:197). Give `.overview-section > p` max-width:65ch, and add a top margin to the paragraph that follows .overview-grid.

<details><summary>Original reviewer recommendation</summary>

Wrap these buttons in <p class="hero-actions"> as the homepage does (overview.mjs:56), or add margin-block to `.overview-section > .button`. Give `.overview-section > p` the same max-width as `.overview-intro > p`, and add a top margin or a hair rule before the note paragraph after .overview-grid in site-body.css.

</details>

### 38. The main nav never shows which page you are on, and the support page has self-referencing links

- **Lens:** Visitor UX · **Verdict:** confirmed · **id:** `nav-no-current-state-and-self-links`
- **Where:** scripts/lib/sections/overview.mjs:27-29, :36, :83; src/assets/site-body.css:1370

**Evidence.** No overview page has aria-current on a nav link (grep count 0 for en/index, en/support, en/progress). No CSS styles a current item, so Research, Progress and Support look the same everywhere. On /en/support/, the 'Choose how to take part' block repeats the homepage's: its 'Funding / collaboration — Discuss support →' card points to #roadmap on the same page. The homepage footer shows 'Back to the homepage' on the homepage itself.

**Verifier.** Playwright found 0 [aria-current] on /en/. The overview shell's nav (overview.mjs:27-29) never sets it, and site-body.css styles aria-current only for the research page's .site-nav (lines 148-149), not for .overview-bar nav. On the support page the 'Funding / collaboration' card links to #roadmap on the same page (overview.mjs:83). The homepage footer always shows 'Back to the homepage' (overview.mjs:36). These are minor polish issues.

**Recommendation.** Add aria-current="page" to the matching nav link in the shell and reuse the existing .site-nav a[aria-current] styling for .overview-bar nav. Leave the footer home link out when kind === 'home', and drop or change the self-referencing card on the support page.

<details><summary>Original reviewer recommendation</summary>

In the overview shell (overview.mjs:27-29), add aria-current="page" to the matching nav link and style it in site-body.css. On the support page, drop the repeated participation block or its self card (overview.mjs:83). Leave 'Back to the homepage' out of the footer when kind === 'home' (overview.mjs:36).

</details>

### 39. / and /en/ serve the same homepage and each claims to be the canonical URL; /languages.html is orphaned but still indexable

- **Lens:** Visitor UX · **Verdict:** partly · **id:** `duplicate-root-and-orphan-languages`
- **Where:** https://k4cell.com/, https://k4cell.com/en/, https://k4cell.com/languages.html; scripts/lib/sections/overview.mjs:15 (canonical computed per root flag)

**Evidence.** site/index.html has canonical https://k4cell.com/ and site/en/index.html has canonical https://k4cell.com/en/, with the same English content (both 2576 px tall, same title). Both are in sitemap.xml. /languages.html has robots index,follow and canonical '/'. No page links to it (I checked the link dumps of all main pages) and it is not in the sitemap, yet it shows a different headline ('Four points. Six lines. Three colours.' / 'Zero continuous fitted parameters'). This splits search signals and gives visitors arriving from search engines different first impressions.

**Verifier.** Confirmed: site/index.html has canonical https://k4cell.com/ and site/en/index.html has canonical https://k4cell.com/en/, with the same content, and both are in the sitemap. The root also declares hreflang en → /en/ and has no x-default, which is inconsistent. However, the design doc says the root deliberately 'shows English content immediately'. /languages.html is a documented 'retained legacy … language surface'. Its canonical already points to '/', which tells search engines to fold it into the root, so it does not split signals much. Unlinked and not in the sitemap, it is unlikely to draw search traffic. This is a small SEO cleanup issue.

**Recommendation.** Keep root as English content but give it canonical /en/ (or drop /en/ from the sitemap), and add hreflang x-default → / on root and /en/. Optionally add noindex to /languages.html.

<details><summary>Original reviewer recommendation</summary>

Either have / declare canonical /en/ (and keep it as the x-default hreflang target), or keep / as canonical and stop listing /en/ separately. Give /languages.html noindex, or remove it if it is no longer used.

</details>

### 40. English data strings and role words left untranslated on /zh/research.html

- **Lens:** Chinese copy · **Verdict:** confirmed (reported as medium) · **id:** `zh-untranslated-english-research`
- **Where:** https://k4cell.com/zh/research.html#numbers (BAO row), Verify and Timeline sections; sources: scripts/lib/sections/page.mjs:339-340 rendering src/data/ledger.json:111-113; src/copy/fragments/numbers.json:77; src/copy/fragments/kill-machine.json:8; src/copy/fragments/verify-next.json:42,119

**Evidence.** In the BAO diagnostic card the zh page renders `<p class="ldiag"><span>算出</span><code>frozen K4 CPL curve</code></p>` and `<span>实测</span><code>shape-only comparison</code>`. The ledger strings are printed raw in both languages, and the row symbol "BAO shape" also appears in Fig. 5 and its aria-label. Other English left in the zh prose: "公开 Registry 当前有 0 项预注册预测" and "公开 Registry 已为未来预测就绪" (the link next to them already says "预测注册"); "Founder 签名的 K4V 状态"; "研究支持将用于 Founder 研究时间". Everywhere else the zh page says "作者" (e.g. "作者自己列为开放"). All of these are confirmed on the live site.

**Verifier.** page.mjs:339-340 prints row.predicted and row.measured from ledger.json:111-113 as-is, and the built zh page contains 'frozen K4 CPL curve', 'shape-only comparison' and 'BAO shape' (5 times). It also has '公开 Registry 当前有 0 项预注册预测', '公开 Registry 已为未来预测就绪', 'Founder 签名的 K4V 状态' and 'Founder 研究时间…'. 'pull' appears 28 times. All of this is real, but it is confined to data cells and a few phrases, so it is not a medium issue.

**Recommendation.** Add zh display fields for the non-numeric diagnostic strings and the BAO symbol. Replace 'Registry' with '预测注册表' and 'Founder' with '作者' in numbers.json, kill-machine.json and verify-next.json.

<details><summary>Original reviewer recommendation</summary>

Add zh display strings for the ledger's non-numeric diagnostics, e.g. `predicted_zh: "冻结的 K4 CPL 曲线"`, `measured_zh: "只比形状，不比绝对长度"`, `symbol_zh: "BAO 形状"`, or a lookup in copy.ledger used by page.mjs:339-340 and the sigma figure. In numbers.json:77 and kill-machine.json:8, change "公开 Registry" to "公开的预测注册表". In verify-next.json:42 change it to "作者签名的 K4V 状态声明", and in :119 to "研究支持将用于作者的研究时间、计算、开放发表与专业评阅". "pull" is used as a column label about 20 times; consider glossing it once as "偏离量（pull）".

</details>

### 41. The /zh/support/ eyebrow is hard-coded English "CONTACT ONLY"

- **Lens:** Chinese copy · **Verdict:** confirmed (reported as medium) · **id:** `zh-support-contact-only-hardcoded`
- **Where:** https://k4cell.com/zh/support/ ; scripts/lib/sections/overview.mjs:80

**Evidence.** overview.mjs:80 emits `<p class="eyebrow">CONTACT ONLY</p>` for both languages, so the first line of the Chinese support page is English. The legacy /support/ page already has a Chinese wording: "CONTACT ONLY · 目前只开放联系".

**Verifier.** overview.mjs:80 emits a literal `<p class="eyebrow">CONTACT ONLY</p>` for both languages. Other zh eyebrows are localized (e.g. '01 / 已公开'), so this looks like an oversight. It is a single short label, so the severity is low.

**Recommendation.** Move it to src/copy/overview.js as supportEyebrow (zh: '目前只开放联系') and render it with esc().

<details><summary>Original reviewer recommendation</summary>

Move the string into src/copy/overview.js (e.g. `supportEyebrow: "目前只开放联系"` for zh, "CONTACT ONLY" for en) and render `${esc(c.supportEyebrow)}` in overview.mjs:80.

</details>

### 42. The short pages and the research page use different Chinese terms for review, review targets and the prediction registry

- **Lens:** Chinese copy · **Verdict:** partly (reported as medium) · **id:** `zh-terminology-split-overview-vs-research`
- **Where:** src/copy/overview.js:17,24,40 (公开审阅版 / 审阅靶点 / 预测登记 / 登记表 / 查看登记状态) vs src/copy/fragments/front.json:39,50, numbers.json:78, kill-machine.json:9, verify-next.json:7,12,149 (公开评阅 / 评阅靶点 / 预测注册)

**Evidence.** Counts on the rendered zh pages: "公开评阅" 9 vs "公开审阅" 3; "评阅靶点" 21 vs "审阅靶点" 3; "预测注册" 4 vs "预测登记"/"登记表" 3. A reader who clicks "查看登记状态 →" on /zh/ lands on research.html, where the hero says "预测注册 · 0 项预注册" and the PDF is called "公开评阅版 PDF", while the home card called it "v2.0 公开审阅版". The home also says "未完成的桥接", but the research page calls the same thing "开放接口" or "主开放桥".

**Verifier.** The counts reproduce. The overview pages use 公开审阅 (3), 审阅靶点 (3), 预测登记 / 登记表 and 桥接. research.html uses 公开评阅 (9), 评阅靶点 (21), 预测注册 (4) and 开放接口 (19). One claim is wrong: '查看登记状态' does not go to research.html. progressLinks[2] in overview.mjs is '/predictions/', the registry page. The underlying point about inconsistent terms still holds.

**Recommendation.** Align src/copy/overview.js with the research page terms: 公开评阅, 评阅靶点, 预测注册表, 开放接口.

<details><summary>Original reviewer recommendation</summary>

Standardize on the research page's terms, which are used far more often: "公开评阅（版）", "评阅靶点", "预测注册表", "开放接口". In src/copy/overview.js: "v2.0 公开审阅版" → "v2.0 公开评阅版"; "勘误与审阅靶点" → "勘误与评阅靶点"; "预测登记基础已公开" → "预测注册表已公开"; "登记表目前为空" → "注册表目前为空"; "查看登记状态" → "查看预测注册"; "比较、假设和未完成的桥接" → "比较、假设和尚未接上的接口".

</details>

### 43. The short zh pages contain stiff, literal phrasings

- **Lens:** Chinese copy · **Verdict:** partly (reported as medium) · **id:** `zh-overview-translationese`
- **Where:** src/copy/overview.js:23,34,37,43,49 → https://k4cell.com/zh/ , /zh/progress/ (also its meta description), /zh/support/

**Evidence.** "本页区分已公开工件与作者报告的在建进展" (also the meta/og description of /zh/progress/): "工件" is a calque of "artifact" and is not normal Chinese for a published PDF. "整理为可复核工件" has the same problem. "拆出论文的期刊状态见公开审阅记录" calques "carved-paper". "PDF 与版本身份" calques "version identity". The site-wide footer "K4 是尚未获得独立确立的候选理论。支持研究、市场关注和代币价格都不能证明理论正确。" is unidiomatic ("独立确立"), calls K4 a "理论" where the research page says "候选框架", and drops the en nuance "scientific claims".

**Verifier.** Confirmed: '工件' (a calque of 'artifact') appears 3 times on /zh/progress/ and once on /zh/support/, including the meta description '本页区分已公开工件…'. The footer calls K4 '候选理论', while the en footer and research.html say '候选框架', which is a real inconsistency. The other rewrites ('拆出论文', '版本身份') are matters of style and taste, not errors.

**Recommendation.** Replace '工件' with '材料', and change the footer to '候选框架' so it matches the en text and the research page. Treat the other rewrites as optional polish.

<details><summary>Original reviewer recommendation</summary>

Suggested rewrites in src/copy/overview.js: progressNote → "本页把已公开的材料与作者自述的在建进展分开列出。最后更新：2026-09-09。"; work[1] → "把选定结论所需的代码、输入和验证说明整理成可供他人复核的材料。"; journalNote → "从专著中拆分出的论文，其期刊状态见公开评阅记录；记录日期与专著版本分开标注。专著本身尚未通过期刊审稿。"; papers[0][2] → "PDF 与版本校验信息"; footer → "K4 是一个尚未经独立验证的候选框架。资助、关注和代币价格都不能证明其科学主张成立。"

</details>

### 44. The Fig. 5 σ-scale aria-label runs its sections together with no separator (both languages, worst in zh)

- **Lens:** Chinese copy · **Verdict:** confirmed · **id:** `zh-sigma-aria-runon`
- **Where:** https://k4cell.com/zh/research.html (Fig. 5 svg aria-label); scripts/lib/figures/sigma.mjs:135-137

**Evidence.** sigmaAria joins the lead and three lane sentences with `join(zhLike ? "" : " ")`, and no lane ends with a terminator. A screen reader therefore hears "α_s(M_Z) — 不在刻度上，这一行不承诺位数由 χ² 换算的等效 σ · 和 A 道的 pull 不是一种数：…；BAO shape 0.44 σ_eq单边：目前只有上限…", which runs one lane into the next mid-sentence. The en version has the same flaw ("commits no digits σ-equivalents converted…"). The zh string also uses a single em dash "—" where Chinese uses "——".

**Verifier.** sigma.mjs:135-136 joins the lead and lanes with `zhLike ? "" : " "`. The rendered aria-label reads '…这一行不承诺位数由 χ² 换算的等效 σ…' and '…BAO shape 0.44 σ_eq单边：目前只有上限…'. The lanes run together with no separator. Line 131 also uses a single ' — ' for zh.

**Recommendation.** Join with '。' for zh and '. ' for en, and use '——' in the zh off-scale string.

<details><summary>Original reviewer recommendation</summary>

In sigma.mjs:137 join with `zhLike ? "。" : ". "`, and use `${row.symbol}——${sx.ariaOff}` for zh at line 131.

</details>

### 45. Names and punctuation for the same thing differ within /zh/research.html

- **Lens:** Chinese copy · **Verdict:** partly · **id:** `zh-naming-inconsistency-within-research`
- **Where:** src/copy/fragments/front.json:11,40,51; kill-machine.json:53; whys-c.json:26; whys-b.json:56

**Evidence.** (a) The H1 and meta description read "μ 子—电子质量比": a single U+2014 em dash used as a connector, which is not standard Chinese punctuation. Elsewhere the page says "μ 子与电子的质量比" (4×). (b) One theorem is named two ways: "重子—狄拉克符号锁定定理" (kill card) and "重子–Dirac 符号锁定理" (why 10 check, with an en dash, the English name, and "锁定理" missing "定"). (c) The why 08 check says "Einstein–Yang–Mills 基底方程", but the body says "爱因斯坦–杨–米尔斯场方程". (d) The hero says "正序主张", while kill cards and why 10 say "正常序".

**Verifier.** (b) is confirmed: the rendered page has both '重子–Dirac 符号锁定理' (with 定 missing) and '重子—狄拉克符号锁定定理'. (c) is confirmed: 'Einstein–Yang–Mills 基底方程' vs '爱因斯坦–杨–米尔斯场方程'. (d) is confirmed: '正序' once vs '正常序' 7 times. (a) is refuted: GB/T 15834-2011 lists the 一字线 '—' as a valid connector between related items, so 'μ 子—电子质量比' is acceptable Chinese punctuation.

**Recommendation.** Fix whys-c.json:26 (the missing 定 and the Dirac/狄拉克 split), whys-b.json:56 and front.json:51. Leave the μ 子—电子 dash as it is.

<details><summary>Original reviewer recommendation</summary>

front.json:11/40: "μ 子—电子质量比" → "μ 子与电子的质量比" (or "μ 子–电子质量比" with an en dash). whys-c.json:26: "重子–Dirac 符号锁定理" → "重子—狄拉克符号锁定定理". whys-b.json:56: "Einstein–Yang–Mills 基底方程" → "爱因斯坦–杨–米尔斯基底方程". front.json:51: "正序主张" → "正常序主张".

</details>

### 46. The Fig. 3 aria-label opens with "第 06 行", which clashes with the figure's own rows 01–07

- **Lens:** Chinese copy · **Verdict:** confirmed · **id:** `zh-hypercharge-aria-row06`
- **Where:** src/copy/fragments/whys-b.json:105 (zh ariaA), :215 (en)

**Evidence.** zh ariaA is "第 06 行：标准模型的七个超荷 …". Here "06" means why 06, which the zh copy calls "条" ("第 01 条和第 04 条只讲…"). But the same figure numbers its anonymous rows 01–07 ("01–07 是环上七个匿名行"), so a screen-reader user hears "第 06 行" and takes it to mean row 06 (右手中微子). The en "Row 06:" has the same ambiguity.

**Verifier.** whys-b.json:105 ariaA is '第 06 行：…'. The rendered Fig. 3 aria-label starts that way, the same figure's idxNote (line 104) numbers anonymous rows 01–07, and the zh prose refers to whys as '第 01 条'. A screen-reader user is likely to take it as the figure's row 06. The en 'Row 06:' has the same ambiguity.

**Recommendation.** '第 06 条：…' for zh, 'Why 06: …' for en.

<details><summary>Original reviewer recommendation</summary>

whys-b.json:105 → "第 06 条（电荷分数）：标准模型的七个超荷 …"; en :215 → "Why 06: the Standard Model’s seven hypercharges …".

</details>

### 47. The zh interest-form email draft shows the user English codes instead of the answers they chose

- **Lens:** Chinese copy · **Verdict:** partly · **id:** `zh-interest-draft-english-codes`
- **Where:** https://k4cell.com/zh/interest/ (generated draft); src/assets/interest.js:15-27

**Evidence.** Filling the zh form and clicking "生成邮件草稿" gives a draft the user is asked to review, including "Purpose: K4V_EARLY_FEEDBACK (not an order or funding commitment)", "3. Interest / 条件兴趣: NO", "6. Willing to look again / 愿意再看: YES", "联系方式: NOT_PROVIDED" and "来源: UNKNOWN". The answer chosen in Chinese (e.g. "满足条件后可能少量购买") never appears, only the machine value (CONDITIONAL_SMALL). "条件兴趣" is also not natural Chinese.

**Verifier.** interest.js:15-27 builds the same bilingual-label, machine-code body for both languages ('3. Interest / 条件兴趣: CONDITIONAL_SMALL', NOT_PROVIDED, UNKNOWN). That looks like a deliberate structured format for parsing incoming mail, and docs only require a 'reviewable email draft with version and purpose'. Still, a zh user reviewing the draft cannot see the option they picked in words they know, and '条件兴趣' is awkward. A real but minor usability point.

**Recommendation.** Keep the codes and append the localized option label for zh (e.g. 'CONDITIONAL_SMALL（满足条件后可能少量购买）'). Rename '条件兴趣' to '购买意向'.

<details><summary>Original reviewer recommendation</summary>

In interest.js, keep the machine code but append the localized option label for zh, e.g. `3. Interest / 购买意向: CONDITIONAL_SMALL（满足条件后可能少量购买）`. Rename "条件兴趣" to "购买意向". Localize the sentinel values for zh as "未填写" / "未说明" next to NOT_PROVIDED / UNKNOWN, and give the Purpose line a Chinese gloss: "（非订单，亦非出资承诺）".

</details>

### 48. The legacy bilingual /support/ (still in the sitemap) has unidiomatic Chinese and stale facts, and the zh research and notice pages have no hreflang alternates

- **Lens:** Chinese copy · **Verdict:** confirmed · **id:** `zh-legacy-support-and-hreflang`
- **Where:** https://k4cell.com/support/ (source support/index.html; listed in site/sitemap.xml:18); https://k4cell.com/zh/research.html and /zh/notice/ heads (scripts/lib/html.mjs:73-75, alternates only enabled for some pages)

**Evidence.** In /support/ the Chinese text includes "核验 Founder 签名状态", "联系 Founder", "不附带 token 权利", "形成源头原生的预测候选", and "Founder 用于开放物理实现桥梁的研究时间". The last is close to unreadable in Chinese. The page also says "2 papers currently under review / 当前在审论文" with no date, while the research page dates this "截至 2026-08-29". Separately, the head of /zh/research.html has no `<link rel="alternate" hreflang>` (count 0, also for en/research.html and both notice pages), while /zh/, /zh/progress/, /zh/support/ and /zh/interest/ have them.

**Verifier.** /support/ is documented as a 'Retained legacy contact' surface (docs/SITE_DISCOVERY_AND_INTEREST_v2.md:14, README.md:24), so keeping it is deliberate. Its zh copy does contain 'Founder 签名状态', '源头原生的预测候选' and 'Founder 用于开放物理实现桥梁的研究时间', plus an undated '2 papers currently under review / 当前在审论文' (support/index.html:36). It is in sitemap.xml:18. Separately, site/zh/research.html and site/zh/notice/index.html have no <link rel=alternate hreflang>; the only hreflang is on the language-switch <a>. The overview pages add alternates in overview.mjs:21. Both points are real and minor.

**Recommendation.** Add hreflang alternates for research.html and notice/ en/zh pairs. Either date and clean up the zh copy of /support/, or drop it from the sitemap, since it is documented as legacy.

<details><summary>Original reviewer recommendation</summary>

Either drop /support/ from the sitemap (the localized /zh/support/ supersedes it) or fix its zh copy in support/index.html: "Founder" → "作者"/"创始人", "token 权利" → "代币权利", "源头原生的预测候选" → "可事先登记的预测", and date the in-review count ("截至 2026-08-29，2 篇论文在审"). Pass per-page alternates (en/research.html ↔ zh/research.html, en/notice/ ↔ zh/notice/) to headGroups in scripts/lib/sections/page.mjs.

</details>

