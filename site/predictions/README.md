# K4 Prediction Registry v0.1

> State: `FOUNDATION PASS / REGISTRY EMPTY / ZERO PREREGISTERED PREDICTIONS`
>
> Scope: registry infrastructure and exactly eleven rows from the public K4 Cell
> comparison ledger. This is not a global inventory of K4 papers or claims.

## Current result

```text
Prediction Registry entries              0
Preregistered predictions                 0
Public-ledger inventory rows             11
RETROSPECTIVE                             11
PREDICTION_CANDIDATE                       0
NOT_YET_OBSERVABLE                         0
Registry eligible                          0
Global K4 coverage                     false
```

The empty registry is deliberate. Every numeric row currently displayed on the
public site is already juxtaposed with known measurements, diagnostics or
bounds. Those comparisons may be scientifically interesting, but they cannot be
repackaged as predictions registered before the target data.

## Files

- [`config/K4_PREDICTION_REGISTRY_v0.1.json`](config/K4_PREDICTION_REGISTRY_v0.1.json)
- [`schemas/k4_prediction_registry.schema.json`](schemas/k4_prediction_registry.schema.json)
- [`config/K4_CLAIM_OBSERVABILITY_INVENTORY_v0.1.json`](config/K4_CLAIM_OBSERVABILITY_INVENTORY_v0.1.json)
- [`schemas/k4_claim_observability_inventory.schema.json`](schemas/k4_claim_observability_inventory.schema.json)
- [`validate_prediction_registry.py`](validate_prediction_registry.py)
- [`test_prediction_registry.py`](test_prediction_registry.py)
- [`evidence/snapshots/K4CELL_LEDGER_5ac0ca2.json`](evidence/snapshots/K4CELL_LEDGER_5ac0ca2.json)
- [`PUBLICATION_RECEIPT_v0.1.json`](PUBLICATION_RECEIPT_v0.1.json)

## Verify

```bash
python3 validate_prediction_registry.py
python3 -m unittest discover -s . -p 'test_prediction_registry.py' -v
```

The validator must report `valid=true`, `registry_state=EMPTY`, eleven
`RETROSPECTIVE` rows and zero registry-eligible entries. The test suite contains
positive and negative gates for future-data cutoff, analysis-code freeze,
Founder fingerprints, comparison receipts, supersession and the scientific
firewall.

```bash
python3 validate_prediction_registry.py --require-preregistered
```

deliberately exits `2` while the registry is empty. That is the correct current
stop gate, not a validation failure.

## First real prediction

A future entry may move to `PREREGISTERED` only after it freezes a source-native
derivation, observable, future dataset/release, knowledge cutoff, exact
prediction, nuisance freedom, analysis code, covariance or likelihood,
statistic, multiplicity policy and falsifier. The canonical bytes must then be
signed by Founder signing subkey
`0427411FA4820FDA5EBFB79B48D9A06D3C49431F` and verify back to primary
`C74953F60AD573F54A3FD06C72213914E4860F47`.

Public attention, funding support and token interest always have zero direct
weight in the scientific verdict. Nothing in this directory authorizes a mint,
presale, payment, wallet, whitelist, TGE or mainnet transaction.
