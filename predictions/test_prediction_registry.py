import copy
import hashlib
import json
import unittest
from pathlib import Path

from validate_prediction_registry import validate_inventory, validate_registry


HERE = Path(__file__).resolve().parent
REGISTRY = HERE / "config" / "K4_PREDICTION_REGISTRY_v0.1.json"
SCHEMA = HERE / "schemas" / "k4_prediction_registry.schema.json"
INVENTORY = HERE / "config" / "K4_CLAIM_OBSERVABILITY_INVENTORY_v0.1.json"
INVENTORY_SCHEMA = HERE / "schemas" / "k4_claim_observability_inventory.schema.json"
SOURCE_LEDGER = HERE / "evidence" / "snapshots" / "K4CELL_LEDGER_5ac0ca2.json"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def candidate_entry(prediction_id="K4-PRED-0001", state="DRAFT"):
    registered = state != "DRAFT"
    return {
        "prediction_id": prediction_id,
        "title": "Synthetic registry acceptance probe",
        "state": state,
        "provenance_class": "PREDICTION_CANDIDATE",
        "theory": {
            "repository_url": "https://github.com/example/k4-theory",
            "commit_sha": "b" * 40,
            "artifact_path": "paper/prediction_source.pdf",
            "artifact_sha256": "a" * 64,
            "paper_doi": None,
            "paper_url": None,
        },
        "derivation": {
            "source_native": True,
            "status": "SUPPORTED",
            "dependencies": ["K4-SYNTHETIC-DEPENDENCY-1"],
            "open_bridges": ["synthetic physical-carrier bridge remains open"],
        },
        "observable": {
            "name": "Synthetic scalar observable",
            "symbol": "x_K4",
            "definition": "A synthetic scalar used only to test registry semantics.",
            "kind": "SCALAR",
            "unit": None,
            "domain": "synthetic test domain",
            "evaluation_time_or_scale": "at the frozen synthetic scale",
        },
        "target": {
            "experiment_or_survey": "Synthetic Future Experiment",
            "dataset_or_release": "SFE Release 1",
            "official_source_url": "https://example.org/experiment/release-1",
            "knowledge_cutoff_utc": "2026-08-30T00:00:00Z",
            "target_data_public_at_cutoff": False,
            "registration_before_target_analysis": True,
            "expected_availability_utc": "2027-01-01T00:00:00Z",
        },
        "prediction": {
            "representation": "SCALAR",
            "exact_text": "x_K4 = 0.1250000000",
            "value": "0.1250000000",
            "uncertainty_or_tolerance": "absolute tolerance 0.0010000000",
            "parameter_free": True,
            "model_parameters": [],
        },
        "nuisance_parameters": [],
        "analysis": {
            "recipe": "Read the official scalar and compare the absolute residual with 0.001.",
            "code_repository_url": "https://github.com/example/k4-prediction-analysis",
            "code_commit": "c" * 40,
            "code_sha256": "d" * 64,
            "covariance_or_likelihood_source": "Synthetic experiment scalar uncertainty release",
            "test_statistic": "absolute residual",
            "multiple_testing_policy": "single preregistered observable; no multiplicity correction",
        },
        "falsifier": {
            "statement": "The entry is falsified as stated when the absolute residual exceeds 0.001.",
            "rule_type": "THRESHOLD",
            "machine_rule": "abs(observed - 0.1250000000) > 0.0010000000",
            "decision_threshold": "0.0010000000",
        },
        "registration": {
            "payload_sha256": "e" * 64 if registered else None,
            "signature_sha256": "f" * 64 if registered else None,
            "signed_at_utc": "2026-08-30T01:00:00Z" if registered else None,
            "primary_fingerprint": (
                "C74953F60AD573F54A3FD06C72213914E4860F47" if registered else None
            ),
            "signing_subkey_fingerprint": (
                "0427411FA4820FDA5EBFB79B48D9A06D3C49431F" if registered else None
            ),
        },
        "comparison": {
            "state": "NOT_AVAILABLE",
            "dataset_url": None,
            "data_retrieved_at_utc": None,
            "analysis_commit": None,
            "result": None,
            "statistic": None,
            "report_path": None,
            "report_sha256": None,
        },
        "supersession": {
            "supersedes_prediction_id": None,
            "superseded_by_prediction_id": None,
            "change_reason": None,
        },
        "epistemic_boundary": {
            "scientific_scope": "Synthetic registry semantics only; no K4 claim is tested.",
            "public_attention_direct_weight": 0,
            "funding_signal_direct_weight": 0,
            "token_market_direct_weight": 0,
            "whole_theory_confirmed": False,
        },
    }


class PredictionRegistryTest(unittest.TestCase):
    def setUp(self):
        self.registry = load(REGISTRY)
        self.schema = load(SCHEMA)
        self.inventory = load(INVENTORY)
        self.inventory_schema = load(INVENTORY_SCHEMA)

    def report(self, registry=None):
        return validate_registry(registry or self.registry, self.schema)

    def active_registry(self, entry):
        registry = copy.deepcopy(self.registry)
        registry["artifact_status"] = "ACTIVE_REGISTRY"
        registry["entries"] = [entry]
        return registry

    def inventory_report(self, inventory=None):
        return validate_inventory(inventory or self.inventory, self.inventory_schema)

    def test_empty_registry_is_valid_and_claims_no_prediction(self):
        report = self.report()
        self.assertTrue(report["valid"], report["errors"])
        self.assertEqual(report["registry_state"], "EMPTY")
        self.assertEqual(report["entry_count"], 0)
        self.assertEqual(report["preregistered_or_later_count"], 0)
        self.assertFalse(report["ready_for_first_preregistration"])
        self.assertIsNone(report["official_mint"])
        self.assertFalse(report["mainnet_authorized"])

    def test_valid_draft_candidate_is_accepted(self):
        report = self.report(self.active_registry(candidate_entry()))
        self.assertTrue(report["valid"], report["errors"])
        self.assertEqual(report["state_counts"], {"DRAFT": 1})
        self.assertTrue(report["ready_for_first_preregistration"])

    def test_valid_preregistered_candidate_is_accepted(self):
        report = self.report(self.active_registry(candidate_entry(state="PREREGISTERED")))
        self.assertTrue(report["valid"], report["errors"])
        self.assertEqual(report["preregistered_or_later_count"], 1)

    def test_nonempty_registry_must_be_active(self):
        broken = copy.deepcopy(self.registry)
        broken["entries"] = [candidate_entry()]
        report = self.report(broken)
        self.assertFalse(report["valid"])
        self.assertTrue(any("non-empty registry" in error for error in report["errors"]))

    def test_unknown_top_level_field_is_rejected(self):
        broken = copy.deepcopy(self.registry)
        broken["silent_default"] = 1
        report = self.report(broken)
        self.assertFalse(report["valid"])
        self.assertTrue(any("registry unexpected fields" in error for error in report["errors"]))

    def test_retrospective_entry_cannot_enter_prediction_registry(self):
        entry = candidate_entry()
        entry["provenance_class"] = "RETROSPECTIVE"
        report = self.report(self.active_registry(entry))
        self.assertFalse(report["valid"])
        self.assertTrue(any("observability inventory" in error for error in report["errors"]))

    def test_draft_cannot_hide_signature_fields(self):
        entry = candidate_entry()
        entry["registration"]["payload_sha256"] = "e" * 64
        report = self.report(self.active_registry(entry))
        self.assertFalse(report["valid"])
        self.assertTrue(any("DRAFT registration" in error for error in report["errors"]))

    def test_preregistration_rejects_already_public_target_data(self):
        entry = candidate_entry(state="PREREGISTERED")
        entry["target"]["target_data_public_at_cutoff"] = True
        report = self.report(self.active_registry(entry))
        self.assertFalse(report["valid"])
        self.assertTrue(any("target data not public" in error for error in report["errors"]))

    def test_preregistration_requires_frozen_analysis_code(self):
        entry = candidate_entry(state="PREREGISTERED")
        entry["analysis"]["code_repository_url"] = None
        entry["analysis"]["code_commit"] = None
        entry["analysis"]["code_sha256"] = None
        report = self.report(self.active_registry(entry))
        self.assertFalse(report["valid"])
        self.assertTrue(any("requires frozen analysis code" in error for error in report["errors"]))

    def test_preregistration_requires_exact_founder_fingerprints(self):
        entry = candidate_entry(state="PREREGISTERED")
        entry["registration"]["signing_subkey_fingerprint"] = "0" * 40
        report = self.report(self.active_registry(entry))
        self.assertFalse(report["valid"])
        self.assertTrue(any("signing-subkey fingerprint is wrong" in error for error in report["errors"]))

    def test_public_funding_and_token_weights_must_be_zero(self):
        entry = candidate_entry()
        entry["epistemic_boundary"]["funding_signal_direct_weight"] = 1
        report = self.report(self.active_registry(entry))
        self.assertFalse(report["valid"])
        self.assertTrue(any("funding_signal_direct_weight must be zero" in error for error in report["errors"]))

    def test_duplicate_prediction_ids_are_rejected(self):
        registry = copy.deepcopy(self.registry)
        registry["artifact_status"] = "ACTIVE_REGISTRY"
        registry["entries"] = [candidate_entry(), candidate_entry()]
        report = self.report(registry)
        self.assertFalse(report["valid"])
        self.assertTrue(any("duplicate prediction IDs" in error for error in report["errors"]))

    def test_compared_state_requires_complete_report(self):
        entry = candidate_entry(state="COMPARED")
        report = self.report(self.active_registry(entry))
        self.assertFalse(report["valid"])
        self.assertTrue(any("COMPARED requires a complete comparison" in error for error in report["errors"]))

    def test_superseded_state_requires_replacement_and_reason(self):
        entry = candidate_entry(state="SUPERSEDED")
        entry["comparison"]["state"] = "SUPERSEDED"
        report = self.report(self.active_registry(entry))
        self.assertFalse(report["valid"])
        self.assertTrue(any("SUPERSEDED requires superseded_by" in error for error in report["errors"]))

    def test_initial_public_ledger_inventory_is_valid_and_fully_retrospective(self):
        report = self.inventory_report()
        self.assertTrue(report["valid"], report["errors"])
        self.assertEqual(report["claim_count"], 11)
        self.assertEqual(report["classification_counts"]["RETROSPECTIVE"], 11)
        self.assertEqual(report["registry_eligible_count"], 0)
        self.assertFalse(report["global_k4_coverage"])

    def test_inventory_summary_must_recompute(self):
        broken = copy.deepcopy(self.inventory)
        broken["summary"]["retrospective"] = 10
        report = self.inventory_report(broken)
        self.assertFalse(report["valid"])
        self.assertTrue(any("summary must equal" in error for error in report["errors"]))

    def test_retrospective_inventory_row_cannot_be_registry_eligible(self):
        broken = copy.deepcopy(self.inventory)
        broken["claims"][0]["registry_eligible"] = True
        report = self.inventory_report(broken)
        self.assertFalse(report["valid"])
        self.assertTrue(any("RETROSPECTIVE must have" in error for error in report["errors"]))

    def test_inventory_requires_all_eleven_public_rows(self):
        broken = copy.deepcopy(self.inventory)
        broken["claims"].pop()
        broken["scope"]["total_rows"] = 10
        report = self.inventory_report(broken)
        self.assertFalse(report["valid"])
        self.assertTrue(any("exactly 11" in error for error in report["errors"]))
        self.assertTrue(any("source rows drifted" in error for error in report["errors"]))

    def test_inventory_duplicate_source_row_is_rejected(self):
        broken = copy.deepcopy(self.inventory)
        broken["claims"][1]["source_row_id"] = broken["claims"][0]["source_row_id"]
        report = self.inventory_report(broken)
        self.assertFalse(report["valid"])
        self.assertTrue(any("duplicate inventory source" in error for error in report["errors"]))

    def test_initial_inventory_cannot_claim_global_k4_coverage(self):
        broken = copy.deepcopy(self.inventory)
        broken["scope"]["global_k4_coverage"] = True
        report = self.inventory_report(broken)
        self.assertFalse(report["valid"])
        self.assertTrue(any("global_k4_coverage must be false" in error for error in report["errors"]))

    def test_inventory_replays_the_frozen_public_ledger_rows(self):
        source_bytes = SOURCE_LEDGER.read_bytes()
        self.assertEqual(hashlib.sha256(source_bytes).hexdigest(), self.inventory["source"]["sha256"])
        source = json.loads(source_bytes)
        rows = {
            row["id"]: row
            for row in [*source["gaussian"], *source["diagnostics"], *source["bounds"]]
        }
        inventory_rows = {row["source_row_id"]: row for row in self.inventory["claims"]}
        self.assertEqual(set(rows), set(inventory_rows))
        for row_id, row in rows.items():
            inventory_row = inventory_rows[row_id]
            self.assertEqual(inventory_row["observable"], row["symbol"])
            self.assertIn(str(row["predicted"]), inventory_row["predicted_text"])
            if "measured" in row:
                self.assertIn(str(row["measured"]), inventory_row["observed_or_constraint_text"])
            self.assertEqual(inventory_row["interfaces"], row.get("interfaces", []))
            self.assertEqual(inventory_row["review_targets"], row.get("targets", []))


if __name__ == "__main__":
    unittest.main()
