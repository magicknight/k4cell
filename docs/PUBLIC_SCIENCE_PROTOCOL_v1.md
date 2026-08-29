# K4 Public Science Protocol v1

> Adopted as design: 2026-08-29 UTC
>
> Status: `FROZEN DESIGN / SEASON NOT STARTED`
>
> Start gate: `BLOCKED ON SIGNED IDENTITY + CANONICAL HTTPS + CONTENT HASH`

## Mission card

`TARGET`

Run a four-week, science-first public season that tests whether the K4 research
object itself can create durable attention, useful participation, and voluntary
support while keeping scientific truth, funding, and any future K4V market
strictly separate.

`TARGET_QUANTIFIER`

One preregistered season must produce all of the following from unrelated human
participants:

- `human_participant_count >= 25`;
- `returner_7d_count >= 10`, where two meaningful actions are separated by at
  least seven complete days;
- `accepted_non_science_contribution_count >= 5`;
- exactly `30` qualified, deduplicated demand responses in the primary cohort.

Views, impressions, likes, reposts, follower counts, press mentions, token
price, and trading volume are descriptive only. None closes the quantifier.

`ACCEPTANCE`

- `SUCCESS`: the public-science quantifier closes and the preregistered demand
  hypotheses can be judged on the frozen cohort;
- `VALIDATION`: identity, content bytes, sources, recruitment, exclusions,
  coding, privacy, and result calculations match the frozen record;
- one without the other is not completion.

`SHORTEST_CHAIN`

```text
signed NO OFFICIAL MINT
  -> canonical bilingual source graph
  -> twelve frozen cards + metrics dictionary + cohort order
  -> four-week public season
  -> public-science report + 30-response demand report
  -> token / no-token route decision
```

`CHAMPION`

`k4cell.com` is the one canonical public-science surface. The K4 cell is the
recurring protagonist; every public item combines beauty, exact epistemic
scope, and a concrete way to inspect or challenge the work.

`ALTERNATIVE`

If the season establishes durable scientific participation or voluntary
support but not credible token demand, continue through grants, tips, or
donations and do not launch K4V. If neither participation nor demand appears,
retain the public research surface and redesign the representation or channel
under a separately preregistered season.

`MAIN_OPEN_BRIDGE`

Compress an abstract, monograph-scale candidate framework into one recurring
public object that is beautiful enough to revisit, exact enough to criticize,
and honest enough not to overstate the evidence.

## Publication prerequisites

The clock must not start before:

1. a Founder-signed, hash-addressed `NO OFFICIAL MINT` statement is published;
2. the signed repository record and `k4cell.com` link to one another;
3. the public-review PDF is identified as a frozen historical artifact and its
   later confirmed errata are visible without rewriting the PDF bytes;
4. all twelve core cards and translations are frozen by commit;
5. the measurement schema and exclusion rules are frozen;
6. the 30-person primary cohort rule and 15/15 A-first/B-first order are frozen;
7. the site contains no wallet collection, purchase route, whitelist, TGE date,
   financial-return language, or paid-response incentive.

## Four-week programme

Every week publishes at the same announced UTC times. The default rhythm is
Monday (`Beauty`), Wednesday (`Research Reality`), and Friday
(`Participation`). Sunday publishes only a content index, never a live social
proof scoreboard.

### Week 1 — Meet the Cell

- Beauty: four sites, six edges, one complete relation;
- Reality: what K4 is and is not; public snapshot versus working research;
- Participation: explain the cell in one sentence and flag any overstatement.

### Week 2 — Map the Claims

- Beauty: a visual dependency route from cell to state geometry;
- Reality: `ESTABLISHED`, `SUPPORTED`, and `OPEN` are different states;
- Participation: verify the frozen PDF identity and checksum without treating
  artifact identity as scientific truth.

### Week 3 — Research in Public

- Beauty: a living dependency graph rather than a finished monument;
- Reality: one load-bearing failure, its smallest failed node, its survivors,
  and the repair route;
- Participation: identify the first exact failure point, missing hypothesis, or
  overstrong edge in a focused review target.

### Week 4 — Open Cell Week

- Beauty: what funding would make newly inspectable;
- Reality: distinguish scientific closure, engineering reproduction, public
  attention, and funding activation;
- Participation: complete one real artifact check or focused criticism, then
  answer the independently administered demand instrument if eligible.

## Card contract

Every scientific card carries six fields:

1. `ARTIFACT / VERSION`;
2. `EPISTEMIC STATE`;
3. `WHAT IT SAYS`;
4. `WHAT IT DOES NOT SAY`;
5. `HOW TO CHECK OR FALSIFY IT`;
6. `EXACT SOURCE + UPDATED UTC`.

Concept art must be labelled as concept art or a dependency map. Simulated or
model-generated data must never be presented as observation.

## Participation events

Meaningful public-science events are:

- completing a source/status route and submitting a comprehension response;
- returning after seven days and completing another meaningful route;
- verifying a published artifact identity;
- submitting an accepted clarification, translation, navigation correction,
  citation correction, or clean-room transcript;
- opening a focused issue that identifies an exact location and failure type.

Likes, emoji, follows, automated traffic, repeated actions by one person, paid
engagement, related accounts presented as strangers, and token-market actions
are excluded.

## Primary demand cohort

The primary cohort is the first exactly 30 qualified, deduplicated respondents
ordered by `recorded_at_utc`. Later qualified responses are exploratory and
must not be pooled into the primary verdict.

Before recruitment:

- generate a fixed 15/15 A-first/B-first order;
- add `season_id`, `cohort_id`, `recruitment_source`, `exposure_week`, and
  `voluntary_support_without_token` to the response schema;
- preregister qualification and exclusion rules;
- arrange unrelated review of at least 20% of qualification/coding decisions,
  or label the result `PROVISIONAL`.

The existing demand hypotheses retain their declared simultaneous gate:

- `H1`: pure-attention interest `>= 10/30`, with high-conviction or an active
  request for the official source `>= 5/30`;
- `H2`: structure-B preference `>= 18/30` and median dump-risk reduction
  `>= 2` from A to B;
- `H3`: all four critical boundaries understood by `>= 24/30`;
- no single critical misunderstanding may exceed `6/30`.

## Data and privacy

- Collect the minimum data required for deduplication and coding.
- Never collect a wallet address during this season.
- Do not publish raw personal responses or contact data.
- Preserve an append-only event ledger and an explicit correction column.
- Publish aggregate results, exclusions, missingness, interruptions, and null
  results.

## Stop rules

- Unsigned or unlinked no-mint identity: do not start the clock.
- Unfrozen content, metrics, exclusions, or cohort order: do not measure.
- Three critical misunderstandings among the first ten qualified respondents:
  pause recruitment, publish the wording correction, and keep cohorts separate.
- Wallet, whitelist, purchase, return, or paid-response language appears:
  stop immediately.
- A material scientific error appears: publish the correction and mark the
  affected season `INTERRUPTED`; never overwrite it silently.
- Fewer than 30 qualified responses at four weeks: `INSUFFICIENT SAMPLE`; do
  not extend the calendar and call it the same season.
- `H1` fails: do not invent utility; token demand is `NOT SUPPORTED`.
- `H2` fails: repair governance or its explanation before a new cohort.
- `H3` fails: the information-safety gate fails; stop token-demand outreach.
- Participation succeeds but `H1` fails: activate the no-token funding route.
- Participation and demand both fail: `NO MISSION-SCALE FRONTIER MOVEMENT`.

## Epistemic firewall

Public attention, donations, grants, creator fees, media coverage, token price,
and holder votes never establish K4. A public vote may choose the next topic to
explain; it may not decide whether a theorem, derivation, or physical claim is
true.
