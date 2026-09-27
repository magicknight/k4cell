"""Independent-source input and arithmetic check for the headline comparison.

The K4 number is transcribed from the frozen v2.0 public-review PDF, pages
265–266 and 715. The comparison value and uncertainty are from the official
NIST/CODATA 2022 values: https://physics.nist.gov/cuu/pdf/wall_2022.pdf
This script does not derive the K4 number from the framework.
"""

from decimal import Decimal, localcontext
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
K4_FROM_FROZEN_PDF = Decimal("206.768282688691")
CODATA_2022_VALUE = Decimal("206.7682827")
CODATA_2022_STANDARD_UNCERTAINTY = Decimal("0.0000046")


def main():
    ledger = json.loads(
        (ROOT / "src" / "data" / "ledger.json").read_text(encoding="utf-8"),
        parse_float=Decimal,
    )
    row = next(row for row in ledger["gaussian"] if row["id"] == "mu_e")
    assert Decimal(row["predicted"]) == K4_FROM_FROZEN_PDF
    assert Decimal(row["measured"]) == CODATA_2022_VALUE
    assert row["sigma"] == CODATA_2022_STANDARD_UNCERTAINTY

    with localcontext() as context:
        context.prec = 40
        difference = abs(K4_FROM_FROZEN_PDF - CODATA_2022_VALUE)
        pull = difference / CODATA_2022_STANDARD_UNCERTAINTY
        resolved_digits = (CODATA_2022_VALUE / CODATA_2022_STANDARD_UNCERTAINTY).adjusted() + 1

    assert difference == Decimal("0.000000011309")
    assert abs(pull - row["pull"]) < Decimal("0.00001")
    assert resolved_digits == row["resolvedDigits"] == 8

    print(json.dumps({
        "result": "PASS",
        "comparison": "RETROSPECTIVE",
        "observed_source": "NIST/CODATA 2022",
        "difference": str(difference),
        "pull": str(pull),
        "resolved_digits": resolved_digits,
        "k4_derivation_reproduced": False,
    }, indent=2))


if __name__ == "__main__":
    main()
