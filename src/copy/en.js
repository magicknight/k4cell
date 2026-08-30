export default {
  htmlLang: "en",
  dir: "en",
  alternateDir: "zh",
  languageLabel: "中文",
  skip: "Skip to content",
  nav: [
    ["object", "The object"],
    ["ledger", "The numbers"],
    ["inputs", "What went in"],
    ["route", "The route"],
    ["kill", "How to kill it"],
    ["not-derived", "What is not derived"],
    ["attack", "Attack it"],
  ],
  navLabel: "Primary navigation",
  footerNavLabel: "Footer",
  fundingLinkLabel: "Inspect the funding-vault repository",

  title: "Nobody knows why the universe runs on these numbers — K4 Cell Framework",
  description:
    "A finite four-site quantum object with no continuous free parameters, and the measured constants it is claimed to reproduce. Every number carries its evidence state, its open interfaces, and a way to check it.",

  statusLine: [
    "K4 Cell Framework",
    "v2.0 public review, frozen 2026-07-08",
    "1003 pages",
    "Zhihua Liang, no institutional affiliation",
    "not peer reviewed",
    "errata open",
  ],
  statusNotReviewed: "not peer reviewed",

  hero: {
    h1: "Nobody knows why the universe runs on these numbers.",
    deck:
      "This work is an attempt to compute them instead — off one finite object, with no dial to turn.",
    lede:
      "There are about twenty of them. They set the size of an atom and the rate the universe is flying apart. Physics measures each one — the electron's mass, how strongly light grips charge, how much of the sky is dark matter — writes it into the equations by hand, and moves on.",
    fineprint:
      "19 in the minimal Standard Model; 26 to 28 once neutrino masses are included, depending on whether neutrinos are Dirac or Majorana. Cosmology adds its own.",
    body:
      "A calculation with no dial to turn cannot be rescued when it is wrong. So this page prints its worst row next to its best, numbers its own open gaps, and names the measurement that would end it. The freedom that remains here is discrete — which embedding, which channel — and those are the open questions listed further down.",
    caveat:
      "The row above is conditional. It depends on a map from the object's few ingredients into the full particle content of the Standard Model, and that map is not proved — the author lists it as open in his own published errata, entry E8. The cosmological-constant problem is not solved here, and nothing on this page claims it is. Not peer reviewed: two carved-out papers are under review (CQG-116665, JGP13432); the 1003-page monograph is not submitted and is not on arXiv.",
    chips: [
      ["continuous parameters fitted", "0"],
      ["best row · worst row", "0.002 σ · 3.28 σ_eq"],
      ["open interfaces, the author's own numbering", "5, plus one main bridge"],
    ],
    plateTag: "CONCEPT ART · NOT AN OBSERVATION · NOT THIS FRAMEWORK'S OUTPUT",
    plateAlt:
      "Concept art: a dark field of violet and mint filaments, nodes and voids, in the shape of cosmic large-scale structure. Generated from a fixed random seed; not an observation.",
    plateNoteA:
      "A picture of an idea, not a picture of the sky. It was generated on the author's machine from a fixed random seed by a Zel'dovich toy model — the textbook first-order approximation that produces filaments, nodes and voids. No telescope data is shown, nothing in it was fitted, and no quantity from this framework enters it. Between the smallest length physics can name and the farthest thing we can see is about 61 factors of ten; this framework's single cosmological comparison sits at the far end of that span, and it is ",
    plateNoteLink: "the worst row on this page",
    plateNoteB: ".",
    railTag: "CONDITIONAL on E8, an interface the author lists as open",
    railLead: "m_μ/m_e · the experiment resolves 8 of these digits",
    glyphLegendA: "four points · three colours · six links",
    glyphLegendB: "one pair must always collide",
    actions: [
      ["See every number, worst first", "#ledger"],
      ["First, what is the object?", "#object"],
    ],
    rulerCaption: "computed against measured, digit by digit",
    rulerComputed: "computed",
    rulerMeasured: "measured",
    rulerCut: "the experiment stops resolving after the first {n} significant digits",
    rulerGhost: "a standing commitment nobody can currently check",
  },

  object: {
    number: "01",
    kicker: "THE OBJECT",
    h2: "Four points that cannot agree.",
    intro:
      "Every number below is read off one finite object. Here it is, in three steps.",
    beats: [
      {
        n: "1",
        h3: "The object",
        state: "established",
        stateLabel: "ESTABLISHED",
        body:
          "Four points. Every pair joined — with four points that is six connections. On each point sits a small quantum degree of freedom with three settings. Every connection pushes its two ends to be unlike each other. Now the key fact: with three settings shared among four points, that is impossible. Some pair always collides. The object never settles. It is permanently strained, and the strain has structure.",
      },
      {
        n: "2",
        h3: "Why only the relations matter",
        state: "established",
        stateLabel: "ESTABLISHED",
        body:
          "Think of four singers holding a chord. What you hear is in no single voice; a held note alone is not a chord. Transpose all four together and nothing changes, because only the intervals are audible. Here it is the same and stronger: the absolute setting at any one point means nothing at all. Inside the object, everything there is to compute — every distance, every coupling — is carried by the six relations, and none of it by the four points. The points are only where the relations have to attach.",
      },
      {
        n: "3",
        h3: "The bet",
        state: "supported",
        stateLabel: "SUPPORTED",
        body:
          "The space of this object's quantum states carries one natural geometric quantity. Its real part is a distance — a Fisher metric. Its imaginary part is a curvature — a Berry curvature. Call the distance the metric leg and the curvature the gauge leg. Gravity lives on the first; Yang–Mills theory — the kind of field theory the other three forces are built from — lives on the second. That both come out of the same object is settled. The bet is everything after that: that gravity and Yang–Mills therefore arrive together rather than being glued together afterwards. What has been written down so far is a conditional Einstein–Yang–Mills response, and its conditions are the open interfaces drawn in the route below.",
      },
    ],
    tagKeyTitle: "What the three tags mean",
    tagKey: [
      ["established", "ESTABLISHED", "A statement about the finite object itself. You can check it without granting the framework anything."],
      ["supported", "SUPPORTED", "The framework's own construction, argued in the manuscript and not independently confirmed. Evidence, not proof."],
      ["open", "OPEN", "The author has published this as an unfinished interface. Everything downstream of it is conditional."],
    ],
    countsCaption:
      "Four sites, six edges, three local states per site: 3⁴ = 81 basis states before dynamics and constraints are applied.",
    gridTitle: "All 81 basis states",
    gridIntro:
      "81 is small enough to print. Below is every basis state of the starting space, drawn as a tetrahedron with one colour per site. Thick edges join two sites that share a colour.",
    gridFilterAll: "all 81",
    gridFilterLabel: "Filter by colour pattern",
    gridSweep: "Find a state with no repeated colour",
    gridSweepDone:
      "Swept all 81 basis states. None is free of a repeated colour; every state shows at least one thick same-colour edge.",
    gridSweepResult:
      "0 of 81. Four sites, three colours means two sites must share one; K4 has every edge, so that edge exists. The frustration is not an assumption — it is arithmetic.",
    gridMeanLabel: "Same-colour edges per state, averaged over all 81",
    gridMeanValue: "exactly 2",
    gridMeanNote: "= 6 edges × 1/3",
    gridCaveat:
      "These are product basis states before dynamics and constraints. The ground state is an entangled superposition, not one of these 81 cells. Nothing here derives physics — it fixes the size of the object and shows the frustration is structural.",
    classLabels: {
      "2,1,1": "one colour twice",
      "2,2,0": "two colours twice",
      "3,1,0": "one colour three times",
      "4,0,0": "all four the same",
    },
    classStates: "states",
    classMono: "same-colour edges each",
  },

  ledger: {
    number: "02",
    kicker: "THE NUMBERS",
    h2: "The eleven rows with a public comparison partner.",
    intro:
      "These eleven are the rows that already have something public to be checked against. The rest of the census is in the manuscript tables. The worst row is the BAO absolute distance scale: χ² = 34.40 for 13 degrees of freedom, 3.28 σ-equivalent. It is in the same list and on the same bar as the best one — one lane down, because a χ² over 13 degrees of freedom is a different kind of number from a single row's pull, not because it is being kept out of sight.",
    laneGaussian: "Comparable pulls",
    laneDiagnostic: "χ²-equivalent significance, not a Gaussian pull",
    laneDiagnosticNote:
      "These are shape and scale diagnostics. They do not average with the rows above.",
    laneBounds: "One-sided — no test exists yet",
    laneBoundsNote:
      "Emitted as point values that sit below every current bound. Below a bound means untested, not confirmed.",
    colComputed: "computed",
    colMeasured: "measured",
    colPull: "pull",
    colType: "type",
    colState: "state",
    legendTitle: "How to read a row",
    legend:
      "A pull is the gap between the computed number and the measured one, counted in units of the experiment's own error bar. Under 1 σ is ordinary agreement; around 3 σ is a disagreement that has to be explained. A comparison is only as sharp as the blunter of its two sides. The vertical rule marks where the experiment stops resolving. Digits left of it are testable. The violet tail right of it is a commitment, not an achievement.",
    exactNote: "exact rational — the digits never stop",
    noPullNote:
      "The framework commits no digits on this row. This is a scale-line comparison, and here the prediction is the blunter of the two sides.",
    censusNote:
      "The full census is 31 primary predictions, 20 companion and readout refinements, a set of rare-B_s protocol rows, and one structural cosmology profile, κ₄(r).",
    censusAuthority: "The manuscript tables are the authority on each row's status.",
    measuredNote:
      "Measured values and their uncertainties are transcribed from the comparison table in the public-review repository; they are not independently sourced here. That transcription is the step worth auditing.",
    noScore:
      "There is no single headline score here, and there will not be one. The three lanes are different kinds of number and averaging them would be a category error.",
    types: {
      lambda: "physical trace-arm gate readout",
      mb_ms: "mass tower / mechanism-F",
      ckm_j: "Casimir-flag readout",
      lambda_c: "CKM typed readout",
      mu_e: "charged-lepton protocol",
      sin2w: "closed typed electroweak readout",
      alpha_s: "Type-7 colour scale-line",
      bao_scale: "absolute-scale diagnostic",
      bao_shape: "shape-only diagnostic",
      sum_mnu: "selected normal-ordering branch",
      m_bb: "Majorana point emission",
    },
    conditionalOn: "conditional on",
    darkLabel: "carried by an open interface",
  },

  checkIt: {
    number: "03",
    kicker: "CHECK ONE YOURSELF",
    h2: "9 ÷ 40",
    body:
      "The Cabibbo parameter — how strongly the quark families mix — comes out of this framework not as a decimal but as an exact fraction: 9/40. Do the division. 9 ÷ 40 = 0.225, exactly, and it stays exactly 0.225 however far you carry it. The measured value is 0.22501 ± 0.00068. You have just checked one row of this ledger by hand.",
    counter:
      "What you have not checked is whether 9/40 is what the framework <em>must</em> produce. That step runs through the embedding of the seed content into the full Standard Model carrier, which the author lists as an open interface (E8) and which review Target 8 exists to attack. An exact rational landing on the measured value is striking. It is not yet a derivation.",
    stepButton: "Carry the division further",
    resetButton: "Start over",
    measuredLabel: "measured, with its error bar",
    containsLabel: "0.225 sits inside the bar",
  },

  inputs: {
    number: "04",
    kicker: "WHAT WENT IN",
    h2: "Nothing you can turn.",
    closedTitle: "Closed",
    closedBody:
      "Continuous fitted parameters: 0. There is no dial. A parameter is a dial, and the Standard Model has about twenty-five of them, each turned into place by measurement. Here there are none. The object is four points, three states per point, the complete graph, one uniform antiferromagnetic coupling on all six edges. Even the overall coupling strength cancels out of a dimensionless ratio, and in the two upper lanes above — the comparable pulls and the diagnostics — every row is one. The two one-sided rows are not: Σ m_ν and m_ββ are given in eV, so they carry an absolute mass scale that this cancellation argument does not cover. That is the first place to look for a hidden input.",
    closedBody2:
      "Physical postulates: one — the existence of the K4 cell lattice, taken as definitional data. Within its stated class, the cell's own shape (four sites, three colours, complete graph, uniform antiferromagnetic coupling, integral class-sum normalisation) is derived from internal consistency rather than assumed. The width of that stated class is itself a review target.",
    closedTag: "ESTABLISHED",
    openTitle: "Where a hidden choice could still be",
    openTag: "OPEN",
    openItems: [
      "Is the catalogue of allowed types complete?",
      "Is the sector structure genuinely a Tannakian category? Today the four displayed Schur–Weyl sectors are only a module realisation over the finite semisimple image algebra M1 ⊕ M3 ⊕ M2 ⊕ M3. They are not tensor-closed, and no finite-motive conclusion follows (E10).",
      "Does one single dictionary work consistently across every sector?",
      "The sharpest one, in the author's own words: the subleading channel scalar — the small second term riding on top of the leading value — is shared verbatim by the Λ row above, the m_b/m_s row above, and a third laboratory readout that is not in the table, Δ_W(α_em). Is that a forced application of the stated chart rules, or does the rule leave room to choose the channel? (Target B.)",
    ],
    invitation:
      "If you find a measured quantity entering on the left-hand side of any row, that is the disproof. Say which row and where.",
    invitationCta: "Open an issue",
  },

  route: {
    number: "05",
    kicker: "THE ROUTE",
    h2: "Pull a bridge out and watch the numbers go dark.",
    intro:
      "This is the route from the finite object to the comparison surfaces, drawn with its gaps as gaps. A solid link is exact or model-internal. A broken span is a named interface the author has published as open — the label in the gap is his own erratum code.",
    stations: [
      ["K₄ + SU(3)", "the finite substrate", "closed"],
      ["Schur–Weyl selection", "representation and topological structure", "closed"],
      ["Quantum geometric tensor", "on the state manifold", "closed"],
      ["Fisher / Berry split", "metric leg and gauge leg", "closed"],
      ["Emergent geometry", "spacetime and Yang–Mills curvature", "conditional"],
      ["Response-filtered EYM", "leading equations plus a higher moment tower", "conditional"],
      ["Multi-cell carriers", "gluing and continuum interfaces", "conditional"],
      ["Typed readouts", "Read_lab, Read_cosmo, Read_int", "conditional"],
    ],
    gaps: [
      ["E3", "electroweak lift — a named interface, not an implicit identification", ["sin2w"]],
      ["E5", "the non-abelian colour carrier is still a separate construction", ["alpha_s"]],
      ["E6", "the geometric response scalar Λ_geo is not the stationary physical scalar Λ_eff", ["lambda"]],
      ["E8", "generation extension, full normal embedding, real branch, 48-row current-symbol surjectivity", ["sin2w", "lambda_c", "mu_e", "ckm_j"]],
      ["E10", "relative lift and natural gluing (DC-G); underlying-class injectivity (DC-U)", []],
    ],
    gapCarries: "carries",
    gapCarriesNothing: "no numeric row — this one carries the type-catalogue and sector claims",
    mainBridge: "finite K4 substrate → faithful physical realization",
    mainBridgeLabel: "MAIN OPEN BRIDGE",
    killSwitch: "Assume every open interface fails",
    killSwitchReset: "Restore the author's actual claim",
    killSwitchCaption:
      "Now pull all of them at once. What is left is a theorem about a finite graph — true, machine-checked, and not a statement about nature. That is the honest floor of this project, and it is why the numbers above are offered as a target rather than as a result.",
  },

  kill: {
    number: "06",
    kicker: "HOW TO KILL IT",
    h2: "What would end this, and who could do it.",
    intro:
      "A theory with dials survives any experimental result, because you re-fit. This one has no dials, so after a miss there are exactly two moves: find a genuine mistake in the derivation and publish the correction, or say the framework is finished. There is no third move, because there is nothing to turn.",
    cards: [
      {
        h3: "Neutrino mass ordering",
        claim: "Normal ordering is derived. Inverted ordering is categorically excluded inside the model.",
        threshold: "A confirmed inverted ordering ends the framework.",
        where: "JUNO · DUNE · Hyper-K",
      },
      {
        h3: "The CP sign lock",
        claim: "sign(sin δ_CP) × sign(η_B) = −1, so with the observed baryon asymmetry the framework requires sin δ_CP < 0 in the standard matter convention.",
        threshold: "A measurement of sin δ_CP > 0 falsifies it.",
        where: "DUNE · Hyper-K",
        note: "The orientation itself is deliberately not derived — it is spontaneously selected vacuum data. That is exactly what makes the lock a test rather than a fit.",
      },
      {
        h3: "The θ₂₃ octant",
        claim: "Upper octant, 4/7.",
        threshold: "A settled lower octant contradicts it.",
        where: "DUNE · Hyper-K",
      },
      {
        h3: "Neutrinoless double beta decay",
        claim: "m_ββ = 3.69 meV, emitted as a point value rather than a range.",
        threshold: "Currently below every bound, which means untested, not confirmed.",
        where: "next-generation 0νββ",
      },
      {
        h3: "The cosmological constant",
        claim: "The two-term readout gives Λ_eff ℓ_*² = 2.93×10⁻¹²² against an observed 2.89×10⁻¹²² (±1.5%) — conditional on E6, where the frozen PDF conflates the geometric response scalar Λ_geo with the stationary physical scalar Λ_eff.",
        threshold: "A Λ determination at 0.5% precision or better separates the two-term readout from the leading-order value.",
        where: "next-generation cosmology",
      },
      {
        h3: "The weak mixing angle",
        claim: "sin²θ_W(M_Z) = 0.231219995 — conditional on the electroweak-lift and Standard-Model-carrier interfaces (E3, E8).",
        threshold: "If the measurement sharpens and moves, no repair is available.",
        where: "precision electroweak",
      },
    ],
    stamp: "transcribed from the frozen public-review release",
  },

  notDerived: {
    number: "07",
    kicker: "THE BOUNDARY",
    h2: "What is not derived.",
    updated: "updated",
    items: [
      "The <strong>sign</strong> of CP violation is not derived from the substrate. Orientation is spontaneously selected vacuum data.",
      "The <strong>non-abelian colour carrier</strong> remains a separate construction (E5), so every colour-sector number sits downstream of an open interface. α_s is a scale-line comparison, not a finished derivation.",
      "The <strong>electroweak lift</strong> is a named interface, not an implicit identification (E3).",
      "<strong>Generation extension, full normal embedding, real physical-branch preservation and the 48-row current-symbol surjectivity</strong> are named interfaces (E8).",
      "The frozen v2.0 PDF <strong>conflates</strong> the geometric response scalar Λ_geo with the stationary physical scalar Λ_eff. The author's own erratum E6 says so.",
      "The four displayed <strong>Schur–Weyl sectors</strong> are a module realisation over M1 ⊕ M3 ⊕ M2 ⊕ M3. They are not a tensor-closed finite Tannakian category, and no finite-motive conclusion follows (E10).",
      "<strong>Gravity arriving together with Yang–Mills is the bet, not a finished derivation.</strong> The geometric primitive is classified rather than reconstructed, and the substrate\'s own gapless spin-two excitation has not been built; the author keeps both as named interfaces in his errata (E7, E11).",
      "A <strong>Zenodo DOI is self-issued and free</strong>. It certifies a timestamp and nothing else. What should carry weight here is the frozen bytes, the published checksum and the errata policy — not the DOI.",
    ],
    submissionsTitle: "Journal status",
    submissionsIntro:
      "The monograph itself has not been submitted to a journal and is not peer reviewed. Two papers carved out of it are under review:",
    submissionsUnderReview: "under review",
    submissionsAwaiting: "awaiting referee reports",
    submissionsSubmitted: "submitted",
    submissionsPrior: "Previously submitted to",
    submissionsDeskReject: "desk-rejected at editorial screening, not sent to referees",
    submissionsNoArxiv: "The monograph is not on arXiv.",
  },

  machine: {
    number: "08",
    kicker: "THE MACHINE",
    h2: "What the machine checked — and what that does not mean.",
    figures:
      "Lean 4 is a proof assistant: you restate a theorem in a language a computer can check, and the file does not compile unless every step follows. At the 2026-07-08 release, a row-by-row sign-off ran over all <strong>771</strong> labelled theorem rows of the manuscript: <strong>727</strong> lean_certified, 19 proved_core_only, 4 needs_lean_node, 21 prose_empirical_open. The root corpus is <strong>313 modules</strong>. Every compiled statement rests on exactly the three standard logical axioms of the mathematical library — propext, Classical.choice, Quot.sound. The project contributes no axiom, no opaque declaration and no sorry of its own.",
    meaning:
      "Certified means the Lean statement carries the same logical force as the written one <em>at the granularity that statement declares</em>. Most of these certificates are carrier-capped: an analytic ingredient the mathematical library does not yet supply — a clustering bound, a continuum-limit input — enters as an explicitly named hypothesis rather than as a hidden assumption. Certification is a claim about logical structure. It is not an empirical claim about nature. A machine-checked proof of the wrong statement is still a proof of the wrong statement, and the honest reading of these 727 rows is that the bookkeeping is clean, not that the physics is right.",
    barAria: "{total} theorem rows: {certified} certified, {open} not certified",
    barLabels: {
      leanCertified: "lean_certified",
      provedCoreOnly: "proved_core_only",
      needsLeanNode: "needs_lean_node",
      proseEmpiricalOpen: "prose_empirical_open",
    },
    barNote: "44 rows are not certified, and are labelled as such.",
  },

  verify: {
    number: "09",
    kicker: "VERIFY",
    h2: "Verify this page yourself.",
    checksumIntro: "The public-review PDF, and its checksum:",
    checksumLabel: "sha256sum command and the published SHA-256 of the public-review PDF",
    frozen:
      "The PDF is deliberately frozen at 2026-07-08. Confirmed Chapter 3 corrections found by a later adversarial audit are published in the errata; the bytes were never silently replaced. That is the whole policy, and you can check it.",
    links: [
      ["Public-review PDF", "1003 pages, pinned to its public commit", "pdf"],
      ["Public errata", "confirmed corrections, appended not substituted", "errata"],
      ["Focused review targets", "precise questions for readers who cannot audit 1003 pages", "targets"],
      ["Concept DOI", "resolves to the current archived record", "conceptDoi"],
      ["Checksums", "SHA256 for every released file", "checksums"],
      ["status.json", "the same status, for machines", "statusJson"],
      ["This site's checksums", "SHA256 for every file served here", "siteSums"],
    ],
    buildNote:
      "Every number on this page is written into it at build time from one data file, ledger.json, and the build recomputes from that file what it can — every pull, every resolved-digit count, the Lean bucket totals — then checks that the stored figures actually appear in the page. If a recomputation disagrees, the build fails rather than publishing the disagreement. What the build cannot do is check that file against the manuscript: the ledger is transcribed by hand. That transcription is the step worth auditing, and the file is served at /ledger.json for exactly that.",
    artifactDefect:
      "Known defect in the frozen artifact: the v2.0 PDF's title page still carries the v1.0 version line and the v1.0 DOI. The document itself is the 1003-page v2.0 release, and its SHA256 is the one printed above. Reported 2026-08-29; it belongs in the errata rather than in a silent replacement.",
  },

  attack: {
    number: "10",
    kicker: "ATTACK IT",
    h2: "The cheapest way to break this.",
    intro:
      "The most useful review is not agreement. A short comment identifying the first clear failure point, missing assumption, incompatible convention, or overstrong claim is worth more than applause.",
    targets: [
      ["Target 8", "The full Standard-Model carrier — the embedding that λ_C and m_μ/m_e ride on."],
      ["Target B", "Whether the shared subleading channel scalar is forced by the chart rules or chosen."],
      ["Target C", "Whether the blindness arguments really close every route to fixing the CP orientation."],
      ["Target 5", "Multi-cell gluing: does an ambiguity there change a later readout?"],
      ["Target 6", "Typed readouts: is any row's status one tier too strong?"],
    ],
    depths: [
      ["2 minutes", "Check 9 ÷ 40 above."],
      ["15 minutes", "Open the frozen PDF with the errata beside it."],
      ["1 hour+", "Take one target and report the first exact failure."],
    ],
    issueCta: "Open an issue",
    discussCta: "Ask in discussions",
    personTitle: "Who wrote it",
    personName: "Zhihua Liang (梁植华)",
    personLines: [
      "Independent researcher, no current institutional affiliation.",
      "Formerly Researcher, INFN Sezione di Cagliari, February 2024 – February 2026.",
      "A 1003-page monograph and a 313-module Lean 4 corpus held at a machine-checked axiom-purity state.",
    ],
    personContact: "zhihua@k4cell.com",
    personOrcid: "0000-0001-6027-6883",
  },

  footer: {
    line: "K4 is an unfinished candidate framework under public review. Full physical realization and a full scientific reproduction package remain open.",
    funding:
      "Funding infrastructure is a separate layer: the open vault repository tests funding-vault engineering and reproduces none of the science.",
    noMint: "K4V has not launched · no official mint, presale, whitelist, or payment wallet exists",
    nav: [
      ["DOI", "conceptDoi"],
      ["GitHub", "repository"],
      ["Discussion", "discussions"],
      ["Notice", "notice"],
      ["status.json", "statusJson"],
      ["Contact", "contact"],
    ],
  },

  notice: {
    title: "Notice · K4 Cell",
    h1: "K4V has not launched.",
    body: [
      "No official mint, presale, whitelist, allocation, airdrop, payment wallet or token generation event exists for K4V. No date has been announced. No mainnet deployment has been authorized.",
      "This site never requests a wallet address, never offers token access or a whitelist place, and never promises a financial return. Any page, account, contract address or message claiming otherwise is not connected to this project.",
      "The machine-readable form of this statement is the k4v block of status.json, which carries launched: false, official_mint: null and mainnet_authorized: false.",
      "Scientific truth, funding, and any future token question are kept strictly separate. Public attention, donations, grants and media coverage establish nothing scientific.",
    ],
    contactLine: "Questions about this notice:",
    back: "Back to K4 Cell",
  },

  gate: {
    h1: "Inside the K4 Cell.",
    line: "One finite object. Zero continuous parameters. An open invitation to break it.",
    lineZh: "一个有限对象，零连续参数，一份公开的邀请：来打破它。",
  },

  notFound: {
    kicker: "404",
    h1: "This path is not part of the current cell.",
    back: "Return to K4 Cell",
  },
};
