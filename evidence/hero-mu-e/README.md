# Muon-to-electron mass ratio: source and arithmetic check

State: `OBSERVED VALUE CROSS-CHECKED / K4 DERIVATION NOT INDEPENDENTLY REPRODUCED`

This record checks the inputs and arithmetic behind the site's headline comparison. It does not derive the K4 value, establish the framework, or turn a retrospective comparison into a preregistered prediction.

## Pinned inputs

| Quantity | Value | Source |
|---|---:|---|
| K4 readout | `206.768282688691` | [Frozen v2.0 public-review PDF](https://github.com/magicknight/k4-cell-framework-public-review/blob/36becf6d6941fc5e51fb7897a93a6b8443f100ba/K4_Cell_Framework_v2.0-public-review.pdf), PDF pages 265–266 and Appendix I, page 715. SHA-256 `727d7c1fd690655a7a487afd66ba39b12f5b0eae5a622e2a224005a02d27c479`. |
| CODATA adjusted value | `206.7682827` | [NIST/CODATA 2022 values](https://physics.nist.gov/cuu/pdf/wall_2022.pdf), entry “muon-electron mass ratio,” printed as `206.768 2827(46)`. |
| Standard uncertainty | `0.0000046` | Parenthetical `(46)` in the same NIST entry applies to the last two decimal places. |

The NIST/CODATA value is a recommended adjusted constant. It is not a single raw laboratory observation; the [CODATA adjustment paper](https://physics.nist.gov/cuu/pdf/RevModPhys.97.025002.pdf), Eq. 187 and its surrounding discussion, describes the muonium hyperfine-spectroscopy and theory inputs. The public-review PDF supplies the K4 number and its proposed endpoint protocol. This repository does not yet reproduce that protocol independently from its underlying mathematical inputs.

## Recompute the displayed comparison

From the repository root:

```bash
python3 -B evidence/hero-mu-e/verify.py
```

The script compares the independently sourced NIST value and the PDF value above with `src/data/ledger.json`, then computes `|K4 − CODATA| / uncertainty` using Python's decimal arithmetic. The difference is `0.000000011309`, or about `0.00246` standard uncertainties. The ratio of the observed value to its standard uncertainty supports eight resolved significant digits under the site's stated counting rule.

This check covers one of the site's eleven public comparison rows. Independent source audits of the other rows, a derivation-level reproduction package, and the first prospective prediction remain open.
