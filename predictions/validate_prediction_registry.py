#!/usr/bin/env python3
"""Validate the K4 signed-prediction registry without external dependencies."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


PRIMARY_FINGERPRINT = "C74953F60AD573F54A3FD06C72213914E4860F47"
SIGNING_SUBKEY_FINGERPRINT = "0427411FA4820FDA5EBFB79B48D9A06D3C49431F"
REGISTRY_SCHEMA = "K4-PREDICTION-REGISTRY-v1"
VALIDATION_SCHEMA = "K4-PREDICTION-REGISTRY-VALIDATION-v1"
INVENTORY_SCHEMA = "K4-CLAIM-OBSERVABILITY-INVENTORY-v1"
INVENTORY_VALIDATION_SCHEMA = "K4-CLAIM-OBSERVABILITY-INVENTORY-VALIDATION-v1"

TOP_LEVEL_FIELDS = {
    "schema",
    "artifact_status",
    "recorded_at_utc",
    "official_mint",
    "mainnet_authorized",
    "founder",
    "signing_policy",
    "entries",
    "next_acceptance",
}
FOUNDER_FIELDS = {
    "name",
    "email",
    "primary_fingerprint",
    "signing_subkey_fingerprint",
}
SIGNING_POLICY_FIELDS = {
    "signature_format",
    "required_payload_fields",
    "registration_rule",
    "retrospective_rule",
}
REQUIRED_PAYLOAD_FIELDS = [
    "prediction_id",
    "theory_artifact_sha256",
    "observable",
    "target_dataset_or_release",
    "knowledge_cutoff_utc",
    "prediction_exact_text",
    "nuisance_parameters",
    "analysis_recipe",
    "analysis_code_sha256",
    "falsifier",
]
ENTRY_FIELDS = {
    "prediction_id",
    "title",
    "state",
    "provenance_class",
    "theory",
    "derivation",
    "observable",
    "target",
    "prediction",
    "nuisance_parameters",
    "analysis",
    "falsifier",
    "registration",
    "comparison",
    "supersession",
    "epistemic_boundary",
}
NESTED_FIELDS = {
    "theory": {
        "repository_url",
        "commit_sha",
        "artifact_path",
        "artifact_sha256",
        "paper_doi",
        "paper_url",
    },
    "derivation": {"source_native", "status", "dependencies", "open_bridges"},
    "observable": {
        "name",
        "symbol",
        "definition",
        "kind",
        "unit",
        "domain",
        "evaluation_time_or_scale",
    },
    "target": {
        "experiment_or_survey",
        "dataset_or_release",
        "official_source_url",
        "knowledge_cutoff_utc",
        "target_data_public_at_cutoff",
        "registration_before_target_analysis",
        "expected_availability_utc",
    },
    "prediction": {
        "representation",
        "exact_text",
        "value",
        "uncertainty_or_tolerance",
        "parameter_free",
        "model_parameters",
    },
    "analysis": {
        "recipe",
        "code_repository_url",
        "code_commit",
        "code_sha256",
        "covariance_or_likelihood_source",
        "test_statistic",
        "multiple_testing_policy",
    },
    "falsifier": {"statement", "rule_type", "machine_rule", "decision_threshold"},
    "registration": {
        "payload_sha256",
        "signature_sha256",
        "signed_at_utc",
        "primary_fingerprint",
        "signing_subkey_fingerprint",
    },
    "comparison": {
        "state",
        "dataset_url",
        "data_retrieved_at_utc",
        "analysis_commit",
        "result",
        "statistic",
        "report_path",
        "report_sha256",
    },
    "supersession": {
        "supersedes_prediction_id",
        "superseded_by_prediction_id",
        "change_reason",
    },
    "epistemic_boundary": {
        "scientific_scope",
        "public_attention_direct_weight",
        "funding_signal_direct_weight",
        "token_market_direct_weight",
        "whole_theory_confirmed",
    },
}
NUISANCE_FIELDS = {"name", "allowed_values_or_range", "treatment", "source"}
INVENTORY_TOP_LEVEL_FIELDS = {
    "schema",
    "artifact_status",
    "recorded_at_utc",
    "source",
    "scope",
    "classification_policy",
    "claims",
    "summary",
    "next_acceptance",
}
INVENTORY_SOURCE_FIELDS = {"repository_url", "commit_sha", "path", "sha256"}
INVENTORY_SCOPE_FIELDS = {"description", "total_rows", "global_k4_coverage"}
INVENTORY_POLICY_FIELDS = {"classes", "rule"}
INVENTORY_CLAIM_FIELDS = {
    "claim_id",
    "source_row_id",
    "source_lane",
    "observable",
    "predicted_text",
    "observed_or_constraint_text",
    "uncertainty_text",
    "classification",
    "reason",
    "interfaces",
    "review_targets",
    "registry_eligible",
    "next_bridge",
}
INVENTORY_SUMMARY_FIELDS = {
    "retrospective",
    "prediction_candidate",
    "not_yet_observable",
    "registry_eligible",
}
PUBLIC_LEDGER_ROW_IDS = {
    "lambda",
    "mb_ms",
    "ckm_j",
    "lambda_c",
    "mu_e",
    "sin2w",
    "alpha_s",
    "bao_scale",
    "bao_shape",
    "sum_mnu",
    "m_bb",
}

STATES = {"DRAFT", "PREREGISTERED", "DATA_AVAILABLE", "COMPARED", "SUPERSEDED"}
PROVENANCE_CLASSES = {"RETROSPECTIVE", "PREDICTION_CANDIDATE", "NOT_YET_OBSERVABLE"}
DERIVATION_STATES = {"OPEN", "SUPPORTED", "ESTABLISHED"}
REPRESENTATIONS = {
    "SCALAR",
    "INTERVAL",
    "DISTRIBUTION",
    "SHAPE",
    "SIGN",
    "COUNT",
    "CORRELATION",
    "FUNCTION",
}
NUISANCE_TREATMENTS = {"FIXED", "PROFILED", "MARGINALIZED", "NONE"}
FALSIFIER_TYPES = {"THRESHOLD", "INTERVAL", "LIKELIHOOD", "SHAPE", "SIGN", "EXCLUSION", "CUSTOM"}
COMPARISON_STATES = {"NOT_AVAILABLE", "READY", "COMPARED", "SUPERSEDED"}
COMPARISON_RESULTS = {None, "SUPPORTED", "TENSION", "FALSIFIED_AS_STATED", "INCONCLUSIVE"}

SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
COMMIT_RE = re.compile(r"^[0-9a-f]{40}$")
FINGERPRINT_RE = re.compile(r"^[0-9A-F]{40}$")
PREDICTION_ID_RE = re.compile(r"^K4-PRED-[0-9]{4}$")
UTC_RE = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$")


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValueError(f"{path}: top level must be an object")
    return value


def _valid_utc(value: Any) -> bool:
    if not isinstance(value, str) or UTC_RE.fullmatch(value) is None:
        return False
    try:
        datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except ValueError:
        return False
    return True


def _parse_utc(value: str) -> datetime:
    return datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def _valid_uri(value: Any) -> bool:
    if not isinstance(value, str) or not value:
        return False
    parsed = urlparse(value)
    return parsed.scheme in {"https", "http"} and bool(parsed.netloc)


def _nonempty(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _check_fields(
    value: Any,
    expected: set[str],
    path: str,
    errors: list[str],
) -> dict[str, Any]:
    if not isinstance(value, dict):
        errors.append(f"{path} must be an object")
        return {}
    missing = sorted(expected - set(value))
    extra = sorted(set(value) - expected)
    if missing:
        errors.append(f"{path} missing fields: {missing}")
    if extra:
        errors.append(f"{path} unexpected fields: {extra}")
    return value


def _require_nullable_hash(value: Any, path: str, errors: list[str]) -> None:
    if value is not None and (not isinstance(value, str) or SHA256_RE.fullmatch(value) is None):
        errors.append(f"{path} must be null or lowercase SHA-256")


def _require_nullable_commit(value: Any, path: str, errors: list[str]) -> None:
    if value is not None and (not isinstance(value, str) or COMMIT_RE.fullmatch(value) is None):
        errors.append(f"{path} must be null or a 40-character lowercase Git commit")


def _require_nullable_timestamp(value: Any, path: str, errors: list[str]) -> None:
    if value is not None and not _valid_utc(value):
        errors.append(f"{path} must be null or an RFC 3339 UTC second timestamp")


def validate_registry(data: dict[str, Any], schema: dict[str, Any] | None = None) -> dict[str, Any]:
    errors: list[str] = []

    _check_fields(data, TOP_LEVEL_FIELDS, "registry", errors)
    if data.get("schema") != REGISTRY_SCHEMA:
        errors.append(f"schema must be {REGISTRY_SCHEMA}")
    if data.get("artifact_status") not in {"OPEN_EMPTY_REGISTRY", "ACTIVE_REGISTRY"}:
        errors.append("artifact_status must be OPEN_EMPTY_REGISTRY or ACTIVE_REGISTRY")
    if not _valid_utc(data.get("recorded_at_utc")):
        errors.append("recorded_at_utc must be an RFC 3339 UTC second timestamp")
    if data.get("official_mint") is not None:
        errors.append("official_mint must remain null")
    if data.get("mainnet_authorized") is not False:
        errors.append("mainnet_authorized must remain false")

    if schema is not None:
        if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
            errors.append("schema document must declare JSON Schema draft 2020-12")
        if schema.get("$id") != "https://k4cell.com/schemas/k4-prediction-registry-v1.json":
            errors.append("schema document has the wrong $id")
        if "prediction_entry" not in schema.get("$defs", {}):
            errors.append("schema document is missing $defs.prediction_entry")

    founder = _check_fields(data.get("founder"), FOUNDER_FIELDS, "founder", errors)
    if founder.get("name") != "Zhihua Liang" or founder.get("email") != "zhihua@k4cell.com":
        errors.append("founder identity must be Zhihua Liang <zhihua@k4cell.com>")
    if founder.get("primary_fingerprint") != PRIMARY_FINGERPRINT:
        errors.append("founder.primary_fingerprint does not match the anchored Founder key")
    if founder.get("signing_subkey_fingerprint") != SIGNING_SUBKEY_FINGERPRINT:
        errors.append("founder.signing_subkey_fingerprint does not match the anchored signing subkey")

    policy = _check_fields(data.get("signing_policy"), SIGNING_POLICY_FIELDS, "signing_policy", errors)
    if policy.get("signature_format") != "OPENPGP_ARMORED_DETACHED":
        errors.append("signing_policy.signature_format must be OPENPGP_ARMORED_DETACHED")
    if policy.get("required_payload_fields") != REQUIRED_PAYLOAD_FIELDS:
        errors.append("signing_policy.required_payload_fields changed order or content")
    if not _nonempty(policy.get("registration_rule")) or not _nonempty(policy.get("retrospective_rule")):
        errors.append("signing policy rules must be non-empty")

    entries = data.get("entries")
    if not isinstance(entries, list):
        errors.append("entries must be an array")
        entries = []
    if not entries and data.get("artifact_status") != "OPEN_EMPTY_REGISTRY":
        errors.append("an empty registry must have artifact_status OPEN_EMPTY_REGISTRY")
    if entries and data.get("artifact_status") != "ACTIVE_REGISTRY":
        errors.append("a non-empty registry must have artifact_status ACTIVE_REGISTRY")

    prediction_ids: list[str] = []
    state_counts: Counter[str] = Counter()
    for index, raw_entry in enumerate(entries):
        path = f"entries[{index}]"
        entry = _check_fields(raw_entry, ENTRY_FIELDS, path, errors)
        prediction_id = entry.get("prediction_id")
        if not isinstance(prediction_id, str) or PREDICTION_ID_RE.fullmatch(prediction_id) is None:
            errors.append(f"{path}.prediction_id must match K4-PRED-0000")
            prediction_id = f"INVALID-{index}"
        prediction_ids.append(prediction_id)
        if not _nonempty(entry.get("title")):
            errors.append(f"{path}.title must be non-empty")
        state = entry.get("state")
        if state not in STATES:
            errors.append(f"{path}.state is invalid: {state!r}")
        else:
            state_counts[state] += 1
        provenance_class = entry.get("provenance_class")
        if provenance_class not in PROVENANCE_CLASSES:
            errors.append(f"{path}.provenance_class is invalid: {provenance_class!r}")
        elif provenance_class != "PREDICTION_CANDIDATE":
            errors.append(
                f"{path}: {provenance_class} belongs in the observability inventory, not the prediction registry"
            )

        nested = {
            name: _check_fields(entry.get(name), expected, f"{path}.{name}", errors)
            for name, expected in NESTED_FIELDS.items()
        }
        theory = nested["theory"]
        if not _valid_uri(theory.get("repository_url")):
            errors.append(f"{path}.theory.repository_url must be an HTTP(S) URI")
        if not isinstance(theory.get("commit_sha"), str) or COMMIT_RE.fullmatch(theory["commit_sha"]) is None:
            errors.append(f"{path}.theory.commit_sha must be a 40-character lowercase Git commit")
        if not _nonempty(theory.get("artifact_path")):
            errors.append(f"{path}.theory.artifact_path must be non-empty")
        if not isinstance(theory.get("artifact_sha256"), str) or SHA256_RE.fullmatch(theory["artifact_sha256"]) is None:
            errors.append(f"{path}.theory.artifact_sha256 must be lowercase SHA-256")
        if theory.get("paper_url") is not None and not _valid_uri(theory.get("paper_url")):
            errors.append(f"{path}.theory.paper_url must be null or an HTTP(S) URI")

        derivation = nested["derivation"]
        if not isinstance(derivation.get("source_native"), bool):
            errors.append(f"{path}.derivation.source_native must be boolean")
        if derivation.get("status") not in DERIVATION_STATES:
            errors.append(f"{path}.derivation.status is invalid")
        dependencies = derivation.get("dependencies")
        if not isinstance(dependencies, list) or not dependencies or not all(_nonempty(item) for item in dependencies):
            errors.append(f"{path}.derivation.dependencies must be a non-empty string array")
        open_bridges = derivation.get("open_bridges")
        if not isinstance(open_bridges, list) or not all(_nonempty(item) for item in open_bridges):
            errors.append(f"{path}.derivation.open_bridges must be a string array")

        observable = nested["observable"]
        prediction = nested["prediction"]
        for key in ("name", "symbol", "definition", "domain", "evaluation_time_or_scale"):
            if not _nonempty(observable.get(key)):
                errors.append(f"{path}.observable.{key} must be non-empty")
        if observable.get("kind") not in REPRESENTATIONS:
            errors.append(f"{path}.observable.kind is invalid")
        if prediction.get("representation") not in REPRESENTATIONS:
            errors.append(f"{path}.prediction.representation is invalid")
        if observable.get("kind") in REPRESENTATIONS and prediction.get("representation") != observable.get("kind"):
            errors.append(f"{path}: observable.kind and prediction.representation must match")
        if not _nonempty(prediction.get("exact_text")):
            errors.append(f"{path}.prediction.exact_text must be non-empty")
        if not _nonempty(prediction.get("uncertainty_or_tolerance")):
            errors.append(f"{path}.prediction.uncertainty_or_tolerance must be non-empty")
        if not isinstance(prediction.get("parameter_free"), bool):
            errors.append(f"{path}.prediction.parameter_free must be boolean")
        if not isinstance(prediction.get("model_parameters"), list) or not all(
            _nonempty(item) for item in prediction.get("model_parameters", [])
        ):
            errors.append(f"{path}.prediction.model_parameters must be a string array")

        target = nested["target"]
        for key in ("experiment_or_survey", "dataset_or_release"):
            if not _nonempty(target.get(key)):
                errors.append(f"{path}.target.{key} must be non-empty")
        if not _valid_uri(target.get("official_source_url")):
            errors.append(f"{path}.target.official_source_url must be an HTTP(S) URI")
        if not _valid_utc(target.get("knowledge_cutoff_utc")):
            errors.append(f"{path}.target.knowledge_cutoff_utc must be a UTC timestamp")
        if not isinstance(target.get("target_data_public_at_cutoff"), bool):
            errors.append(f"{path}.target.target_data_public_at_cutoff must be boolean")
        if not isinstance(target.get("registration_before_target_analysis"), bool):
            errors.append(f"{path}.target.registration_before_target_analysis must be boolean")
        _require_nullable_timestamp(target.get("expected_availability_utc"), f"{path}.target.expected_availability_utc", errors)

        nuisance_parameters = entry.get("nuisance_parameters")
        if not isinstance(nuisance_parameters, list):
            errors.append(f"{path}.nuisance_parameters must be an array")
            nuisance_parameters = []
        nuisance_names: list[str] = []
        for nuisance_index, raw_nuisance in enumerate(nuisance_parameters):
            nuisance_path = f"{path}.nuisance_parameters[{nuisance_index}]"
            nuisance = _check_fields(raw_nuisance, NUISANCE_FIELDS, nuisance_path, errors)
            for key in ("name", "allowed_values_or_range", "source"):
                if not _nonempty(nuisance.get(key)):
                    errors.append(f"{nuisance_path}.{key} must be non-empty")
            if nuisance.get("treatment") not in NUISANCE_TREATMENTS:
                errors.append(f"{nuisance_path}.treatment is invalid")
            if isinstance(nuisance.get("name"), str):
                nuisance_names.append(nuisance["name"])
        if len(nuisance_names) != len(set(nuisance_names)):
            errors.append(f"{path}.nuisance_parameters contains duplicate names")

        analysis = nested["analysis"]
        for key in ("recipe", "covariance_or_likelihood_source", "test_statistic", "multiple_testing_policy"):
            if not _nonempty(analysis.get(key)):
                errors.append(f"{path}.analysis.{key} must be non-empty")
        if analysis.get("code_repository_url") is not None and not _valid_uri(analysis.get("code_repository_url")):
            errors.append(f"{path}.analysis.code_repository_url must be null or an HTTP(S) URI")
        _require_nullable_commit(analysis.get("code_commit"), f"{path}.analysis.code_commit", errors)
        _require_nullable_hash(analysis.get("code_sha256"), f"{path}.analysis.code_sha256", errors)
        code_values = [analysis.get("code_repository_url"), analysis.get("code_commit"), analysis.get("code_sha256")]
        if any(value is None for value in code_values) and any(value is not None for value in code_values):
            errors.append(f"{path}.analysis code repository, commit and SHA-256 must be all null or all present")

        falsifier = nested["falsifier"]
        for key in ("statement", "machine_rule", "decision_threshold"):
            if not _nonempty(falsifier.get(key)):
                errors.append(f"{path}.falsifier.{key} must be non-empty")
        if falsifier.get("rule_type") not in FALSIFIER_TYPES:
            errors.append(f"{path}.falsifier.rule_type is invalid")

        registration = nested["registration"]
        for key in ("payload_sha256", "signature_sha256"):
            _require_nullable_hash(registration.get(key), f"{path}.registration.{key}", errors)
        _require_nullable_timestamp(registration.get("signed_at_utc"), f"{path}.registration.signed_at_utc", errors)
        for key in ("primary_fingerprint", "signing_subkey_fingerprint"):
            value = registration.get(key)
            if value is not None and (not isinstance(value, str) or FINGERPRINT_RE.fullmatch(value) is None):
                errors.append(f"{path}.registration.{key} must be null or a full uppercase fingerprint")

        registration_values = [
            registration.get("payload_sha256"),
            registration.get("signature_sha256"),
            registration.get("signed_at_utc"),
            registration.get("primary_fingerprint"),
            registration.get("signing_subkey_fingerprint"),
        ]
        if state == "DRAFT":
            if any(value is not None for value in registration_values):
                errors.append(f"{path}: DRAFT registration fields must all be null")
        elif state in {"PREREGISTERED", "DATA_AVAILABLE", "COMPARED", "SUPERSEDED"}:
            if any(value is None for value in registration_values):
                errors.append(f"{path}: {state} requires complete registration hashes, time and fingerprints")
            if registration.get("primary_fingerprint") != PRIMARY_FINGERPRINT:
                errors.append(f"{path}: registered primary fingerprint is wrong")
            if registration.get("signing_subkey_fingerprint") != SIGNING_SUBKEY_FINGERPRINT:
                errors.append(f"{path}: registered signing-subkey fingerprint is wrong")
            if target.get("target_data_public_at_cutoff") is not False:
                errors.append(f"{path}: preregistration requires target data not public at knowledge cutoff")
            if target.get("registration_before_target_analysis") is not True:
                errors.append(f"{path}: registration must precede target-data analysis")
            if derivation.get("source_native") is not True:
                errors.append(f"{path}: preregistration requires a source-native derivation")
            if prediction.get("value") is None:
                errors.append(f"{path}: preregistration requires a frozen prediction value")
            if any(value is None for value in code_values):
                errors.append(f"{path}: preregistration requires frozen analysis code repository, commit and SHA-256")
            if _valid_utc(target.get("knowledge_cutoff_utc")) and _valid_utc(registration.get("signed_at_utc")):
                if _parse_utc(registration["signed_at_utc"]) < _parse_utc(target["knowledge_cutoff_utc"]):
                    errors.append(f"{path}: signed_at_utc cannot precede knowledge_cutoff_utc")

        comparison = nested["comparison"]
        if comparison.get("state") not in COMPARISON_STATES:
            errors.append(f"{path}.comparison.state is invalid")
        if comparison.get("result") not in COMPARISON_RESULTS:
            errors.append(f"{path}.comparison.result is invalid")
        _require_nullable_timestamp(comparison.get("data_retrieved_at_utc"), f"{path}.comparison.data_retrieved_at_utc", errors)
        _require_nullable_commit(comparison.get("analysis_commit"), f"{path}.comparison.analysis_commit", errors)
        _require_nullable_hash(comparison.get("report_sha256"), f"{path}.comparison.report_sha256", errors)
        if comparison.get("dataset_url") is not None and not _valid_uri(comparison.get("dataset_url")):
            errors.append(f"{path}.comparison.dataset_url must be null or an HTTP(S) URI")
        comparison_details = [
            comparison.get("dataset_url"),
            comparison.get("data_retrieved_at_utc"),
            comparison.get("analysis_commit"),
            comparison.get("result"),
            comparison.get("statistic"),
            comparison.get("report_path"),
            comparison.get("report_sha256"),
        ]
        if state in {"DRAFT", "PREREGISTERED"}:
            if comparison.get("state") != "NOT_AVAILABLE" or any(value is not None for value in comparison_details):
                errors.append(f"{path}: {state} must not carry comparison results")
        elif state == "DATA_AVAILABLE":
            if comparison.get("state") != "READY":
                errors.append(f"{path}: DATA_AVAILABLE requires comparison.state READY")
        elif state == "COMPARED":
            if comparison.get("state") != "COMPARED" or any(value is None for value in comparison_details):
                errors.append(f"{path}: COMPARED requires a complete comparison and report")
        elif state == "SUPERSEDED" and comparison.get("state") != "SUPERSEDED":
            errors.append(f"{path}: SUPERSEDED requires comparison.state SUPERSEDED")

        supersession = nested["supersession"]
        for key in ("supersedes_prediction_id", "superseded_by_prediction_id"):
            value = supersession.get(key)
            if value is not None and (not isinstance(value, str) or PREDICTION_ID_RE.fullmatch(value) is None):
                errors.append(f"{path}.supersession.{key} must be null or a prediction ID")
            if value == prediction_id:
                errors.append(f"{path}.supersession.{key} cannot reference itself")
        if state == "SUPERSEDED":
            if not supersession.get("superseded_by_prediction_id") or not _nonempty(supersession.get("change_reason")):
                errors.append(f"{path}: SUPERSEDED requires superseded_by_prediction_id and change_reason")

        boundary = nested["epistemic_boundary"]
        if not _nonempty(boundary.get("scientific_scope")):
            errors.append(f"{path}.epistemic_boundary.scientific_scope must be non-empty")
        for key in ("public_attention_direct_weight", "funding_signal_direct_weight", "token_market_direct_weight"):
            if boundary.get(key) != 0:
                errors.append(f"{path}.epistemic_boundary.{key} must be zero")
        if boundary.get("whole_theory_confirmed") is not False:
            errors.append(f"{path}.epistemic_boundary.whole_theory_confirmed must be false")

    duplicate_ids = sorted(prediction_id for prediction_id, count in Counter(prediction_ids).items() if count > 1)
    if duplicate_ids:
        errors.append(f"duplicate prediction IDs: {duplicate_ids}")

    next_acceptance = data.get("next_acceptance")
    if not isinstance(next_acceptance, list) or not next_acceptance or not all(
        _nonempty(item) for item in next_acceptance
    ):
        errors.append("next_acceptance must be a non-empty string array")

    return {
        "schema": VALIDATION_SCHEMA,
        "valid": not errors,
        "errors": errors,
        "registry_state": "EMPTY" if not entries else "ACTIVE",
        "entry_count": len(entries),
        "prediction_ids": prediction_ids,
        "state_counts": dict(sorted(state_counts.items())),
        "preregistered_or_later_count": sum(
            state_counts[state] for state in ("PREREGISTERED", "DATA_AVAILABLE", "COMPARED", "SUPERSEDED")
        ),
        "compared_count": state_counts["COMPARED"],
        "ready_for_first_preregistration": not errors and bool(entries),
        "official_mint": data.get("official_mint"),
        "mainnet_authorized": data.get("mainnet_authorized"),
        "epistemic_status": "REGISTRY_STRUCTURE_VALIDATED / NO SCIENTIFIC PREDICTION IMPLIED",
    }


def validate_inventory(data: dict[str, Any], schema: dict[str, Any] | None = None) -> dict[str, Any]:
    errors: list[str] = []
    _check_fields(data, INVENTORY_TOP_LEVEL_FIELDS, "inventory", errors)

    if data.get("schema") != INVENTORY_SCHEMA:
        errors.append(f"inventory.schema must be {INVENTORY_SCHEMA}")
    if data.get("artifact_status") != "INITIAL_PUBLIC_LEDGER_SCOPE":
        errors.append("inventory.artifact_status must be INITIAL_PUBLIC_LEDGER_SCOPE")
    if not _valid_utc(data.get("recorded_at_utc")):
        errors.append("inventory.recorded_at_utc must be an RFC 3339 UTC second timestamp")

    if schema is not None:
        if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
            errors.append("inventory schema document must declare JSON Schema draft 2020-12")
        if schema.get("$id") != "https://k4cell.com/schemas/k4-claim-observability-inventory-v1.json":
            errors.append("inventory schema document has the wrong $id")
        if "claim" not in schema.get("$defs", {}):
            errors.append("inventory schema document is missing $defs.claim")

    source = _check_fields(data.get("source"), INVENTORY_SOURCE_FIELDS, "inventory.source", errors)
    if source.get("repository_url") != "https://github.com/magicknight/k4cell":
        errors.append("inventory.source.repository_url must be the public K4 Cell repository")
    if not isinstance(source.get("commit_sha"), str) or COMMIT_RE.fullmatch(source["commit_sha"]) is None:
        errors.append("inventory.source.commit_sha must be a 40-character lowercase Git commit")
    if source.get("path") != "src/data/ledger.json":
        errors.append("inventory.source.path must be src/data/ledger.json")
    if not isinstance(source.get("sha256"), str) or SHA256_RE.fullmatch(source["sha256"]) is None:
        errors.append("inventory.source.sha256 must be lowercase SHA-256")

    scope = _check_fields(data.get("scope"), INVENTORY_SCOPE_FIELDS, "inventory.scope", errors)
    if not _nonempty(scope.get("description")):
        errors.append("inventory.scope.description must be non-empty")
    if scope.get("total_rows") != 11:
        errors.append("inventory.scope.total_rows must remain exactly 11 for v0.1")
    if scope.get("global_k4_coverage") is not False:
        errors.append("inventory.scope.global_k4_coverage must be false")

    policy = _check_fields(
        data.get("classification_policy"),
        INVENTORY_POLICY_FIELDS,
        "inventory.classification_policy",
        errors,
    )
    expected_classes = ["RETROSPECTIVE", "PREDICTION_CANDIDATE", "NOT_YET_OBSERVABLE"]
    if policy.get("classes") != expected_classes:
        errors.append("inventory.classification_policy.classes changed order or content")
    if not _nonempty(policy.get("rule")):
        errors.append("inventory.classification_policy.rule must be non-empty")

    claims = data.get("claims")
    if not isinstance(claims, list):
        errors.append("inventory.claims must be an array")
        claims = []
    if len(claims) != 11:
        errors.append(f"inventory.claims must contain exactly 11 public ledger rows, got {len(claims)}")

    claim_ids: list[str] = []
    source_row_ids: list[str] = []
    class_counts: Counter[str] = Counter()
    eligible_count = 0
    for index, raw_claim in enumerate(claims):
        path = f"inventory.claims[{index}]"
        claim = _check_fields(raw_claim, INVENTORY_CLAIM_FIELDS, path, errors)
        claim_id = claim.get("claim_id")
        if not isinstance(claim_id, str) or re.fullmatch(r"K4-OBS-[0-9]{4}", claim_id) is None:
            errors.append(f"{path}.claim_id must match K4-OBS-0000")
        else:
            claim_ids.append(claim_id)
        source_row_id = claim.get("source_row_id")
        if not _nonempty(source_row_id):
            errors.append(f"{path}.source_row_id must be non-empty")
        else:
            source_row_ids.append(source_row_id)
        if claim.get("source_lane") not in {"GAUSSIAN", "DIAGNOSTIC", "BOUND"}:
            errors.append(f"{path}.source_lane is invalid")
        for key in ("observable", "predicted_text", "reason", "next_bridge"):
            if not _nonempty(claim.get(key)):
                errors.append(f"{path}.{key} must be non-empty")
        for key in ("observed_or_constraint_text", "uncertainty_text"):
            value = claim.get(key)
            if value is not None and not _nonempty(value):
                errors.append(f"{path}.{key} must be null or non-empty")
        classification = claim.get("classification")
        if classification not in PROVENANCE_CLASSES:
            errors.append(f"{path}.classification is invalid")
        else:
            class_counts[classification] += 1
        for key in ("interfaces", "review_targets"):
            value = claim.get(key)
            if not isinstance(value, list) or not all(_nonempty(item) for item in value):
                errors.append(f"{path}.{key} must be a string array")
        if not isinstance(claim.get("registry_eligible"), bool):
            errors.append(f"{path}.registry_eligible must be boolean")
        elif claim["registry_eligible"]:
            eligible_count += 1
            if classification != "PREDICTION_CANDIDATE":
                errors.append(f"{path}: only PREDICTION_CANDIDATE may be registry eligible")
        if classification == "RETROSPECTIVE" and claim.get("registry_eligible") is not False:
            errors.append(f"{path}: RETROSPECTIVE must have registry_eligible=false")

    duplicate_claim_ids = sorted(item for item, count in Counter(claim_ids).items() if count > 1)
    duplicate_source_ids = sorted(item for item, count in Counter(source_row_ids).items() if count > 1)
    if duplicate_claim_ids:
        errors.append(f"duplicate inventory claim IDs: {duplicate_claim_ids}")
    if duplicate_source_ids:
        errors.append(f"duplicate inventory source row IDs: {duplicate_source_ids}")
    if set(source_row_ids) != PUBLIC_LEDGER_ROW_IDS:
        errors.append(
            f"inventory source rows drifted: missing={sorted(PUBLIC_LEDGER_ROW_IDS - set(source_row_ids))}, "
            f"extra={sorted(set(source_row_ids) - PUBLIC_LEDGER_ROW_IDS)}"
        )

    summary = _check_fields(data.get("summary"), INVENTORY_SUMMARY_FIELDS, "inventory.summary", errors)
    expected_summary = {
        "retrospective": class_counts["RETROSPECTIVE"],
        "prediction_candidate": class_counts["PREDICTION_CANDIDATE"],
        "not_yet_observable": class_counts["NOT_YET_OBSERVABLE"],
        "registry_eligible": eligible_count,
    }
    if summary != expected_summary:
        errors.append(f"inventory.summary must equal recomputed counts {expected_summary}")
    if data.get("artifact_status") == "INITIAL_PUBLIC_LEDGER_SCOPE":
        if expected_summary != {
            "retrospective": 11,
            "prediction_candidate": 0,
            "not_yet_observable": 0,
            "registry_eligible": 0,
        }:
            errors.append("initial public-ledger inventory must classify all 11 rows as non-eligible RETROSPECTIVE")

    next_acceptance = data.get("next_acceptance")
    if not isinstance(next_acceptance, list) or not next_acceptance or not all(
        _nonempty(item) for item in next_acceptance
    ):
        errors.append("inventory.next_acceptance must be a non-empty string array")

    return {
        "schema": INVENTORY_VALIDATION_SCHEMA,
        "valid": not errors,
        "errors": errors,
        "claim_count": len(claims),
        "classification_counts": {
            "RETROSPECTIVE": class_counts["RETROSPECTIVE"],
            "PREDICTION_CANDIDATE": class_counts["PREDICTION_CANDIDATE"],
            "NOT_YET_OBSERVABLE": class_counts["NOT_YET_OBSERVABLE"],
        },
        "registry_eligible_count": eligible_count,
        "global_k4_coverage": scope.get("global_k4_coverage"),
        "source_commit": source.get("commit_sha"),
        "source_sha256": source.get("sha256"),
        "epistemic_status": "PUBLIC_LEDGER SCOPE ONLY / NO PREREGISTERED PREDICTION",
    }


def main() -> int:
    here = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "registry",
        nargs="?",
        type=Path,
        default=here / "config" / "K4_PREDICTION_REGISTRY_v0.1.json",
    )
    parser.add_argument(
        "--schema",
        type=Path,
        default=here / "schemas" / "k4_prediction_registry.schema.json",
    )
    parser.add_argument(
        "--inventory",
        type=Path,
        default=here / "config" / "K4_CLAIM_OBSERVABILITY_INVENTORY_v0.1.json",
    )
    parser.add_argument(
        "--inventory-schema",
        type=Path,
        default=here / "schemas" / "k4_claim_observability_inventory.schema.json",
    )
    parser.add_argument("--require-preregistered", action="store_true")
    args = parser.parse_args()

    registry_report = validate_registry(load_json(args.registry), load_json(args.schema))
    inventory_report = validate_inventory(
        load_json(args.inventory),
        load_json(args.inventory_schema),
    )
    report = {
        "schema": "K4-PREDICTION-PROGRAM-VALIDATION-v1",
        "valid": registry_report["valid"] and inventory_report["valid"],
        "registry": registry_report,
        "inventory": inventory_report,
        "epistemic_status": "STRUCTURE AND INITIAL PUBLIC-LEDGER INVENTORY VALIDATED / ZERO PREREGISTERED PREDICTIONS",
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    if not report["valid"]:
        return 1
    if args.require_preregistered and registry_report["preregistered_or_later_count"] == 0:
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
