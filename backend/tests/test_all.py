import pytest
import os
import sys
import numpy as np
import cv2

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from rules_engine import DeterministicEligibilityEngine
from auth import hash_password, verify_password, create_access_token, decode_access_token
from document_processor import DocumentProcessor
from rag_engine import CitizenAssistantRAG

def test_password_hashing_argon2():
    password = "CitizenSecurePassword@2026"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_access_token_creation_and_validation():
    user_id = "test-user-uuid-1234"
    email = "citizen@test.gov.in"
    role = "citizen"

    token = create_access_token(user_id, email, role)
    assert token is not None
    assert len(token.split(".")) == 3

    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["email"] == email
    assert payload["role"] == role

    # Tampered token check
    tampered = token[:-4] + "abcd"
    assert decode_access_token(tampered) is None

def test_deterministic_rules_engine_operators():
    # 1. 'lte' operator (income limit)
    sat, reason = DeterministicEligibilityEngine.evaluate_condition("lte", "250000", 180000)
    assert sat is True
    assert reason is None

    sat, reason = DeterministicEligibilityEngine.evaluate_condition("lte", "250000", 300000)
    assert sat is False
    assert "exceeds maximum threshold" in reason

    # 2. 'eq' operator (state domicile)
    sat, reason = DeterministicEligibilityEngine.evaluate_condition("eq", "Karnataka", "Karnataka")
    assert sat is True

    sat, reason = DeterministicEligibilityEngine.evaluate_condition("eq", "Karnataka", "Maharashtra")
    assert sat is False

    # 3. 'in' operator (ration card / caste)
    sat, reason = DeterministicEligibilityEngine.evaluate_condition("in", "BPL,AAY,APL", "BPL")
    assert sat is True

    sat, reason = DeterministicEligibilityEngine.evaluate_condition("in", "BPL,AAY,APL", "None")
    assert sat is False

    # 4. 'bool_true' operator
    sat, reason = DeterministicEligibilityEngine.evaluate_condition("bool_true", "true", True)
    assert sat is True

    sat, reason = DeterministicEligibilityEngine.evaluate_condition("bool_true", "true", False)
    assert sat is False

def test_deterministic_rules_engine_full_evaluation():
    class MockRule:
        def __init__(self, code, field, op, target, desc, mandatory=True):
            self.rule_code = code
            self.field_name = field
            self.operator = op
            self.target_value = target
            self.description_en = desc
            self.description_kn = desc
            self.description_hi = desc
            self.description_ur = desc
            self.is_mandatory = mandatory

    rules = [
        MockRule("R1", "domicile_state", "eq", "Karnataka", "Must be Karnataka resident"),
        MockRule("R2", "annual_income", "lte", "250000", "Annual income <= 2.5 Lakh"),
        MockRule("R3", "is_student", "bool_true", "true", "Must be enrolled student")
    ]

    # Scenario A: Eligible citizen
    profile_eligible = {
        "domicile_state": "Karnataka",
        "annual_income": 150000,
        "is_student": True
    }
    result_a = DeterministicEligibilityEngine.evaluate_scheme(rules, profile_eligible)
    assert result_a["status"] == "likely_eligible"
    assert result_a["satisfied_count"] == 3
    assert result_a["failed_count"] == 0

    # Scenario B: Missing field
    profile_missing = {
        "domicile_state": "Karnataka",
        "annual_income": 150000
        # is_student missing
    }
    result_b = DeterministicEligibilityEngine.evaluate_scheme(rules, profile_missing)
    assert result_b["status"] == "more_information_required"
    assert result_b["missing_count"] == 1
    assert result_b["missing_fields"][0]["field_name"] == "is_student"

    # Scenario C: Ineligible (income exceeds)
    profile_ineligible = {
        "domicile_state": "Karnataka",
        "annual_income": 400000,
        "is_student": True
    }
    result_c = DeterministicEligibilityEngine.evaluate_scheme(rules, profile_ineligible)
    assert result_c["status"] == "not_eligible"
    assert result_c["failed_count"] == 1

def test_document_processor_blur_detection(tmp_path):
    # Create sharp synthetic image (black and white checkerboard)
    sharp_img = np.zeros((400, 400), dtype=np.uint8)
    sharp_img[::20, :] = 255
    sharp_img[:, ::20] = 255
    sharp_path = str(tmp_path / "sharp_test.png")
    cv2.imwrite(sharp_path, sharp_img)

    sharp_res = DocumentProcessor.check_image_quality(sharp_path)
    assert sharp_res["is_blurry"] is False
    assert sharp_res["quality_score"] > 0.8

    # Create blurry synthetic image (heavily blurred)
    blurry_img = cv2.GaussianBlur(sharp_img, (51, 51), 0)
    blurry_path = str(tmp_path / "blurry_test.png")
    cv2.imwrite(blurry_path, blurry_img)

    blurry_res = DocumentProcessor.check_image_quality(blurry_path)
    assert blurry_res["is_blurry"] is True
    assert "blurry or poorly focused" in blurry_res["warnings"][0]

def test_document_processor_field_extraction():
    synthetic_certificate_text = (
        "GOVERNMENT OF KARNATAKA\n"
        "REVENUE DEPARTMENT - NADAKACHERI\n"
        "Certificate Number: RD00384729104\n"
        "Applicant Name: Kumari Pooja Ramesh Patil\n"
        "Date of Birth: 14/05/2003\n"
        "Gender: Female\n"
        "Total Annual Income: Rs. 1,20,000\n"
        "Caste Category: Cat-1\n"
        "Valid Upto: 31/03/2029\n"
    )

    fields = DocumentProcessor.extract_fields(
        file_path="dummy.pdf",
        document_type="caste_income_certificate",
        simulated_text=synthetic_certificate_text
    )

    field_map = {f["field_name"]: f["normalized_value"] for f in fields}
    assert field_map.get("certificate_number") == "RD00384729104"
    assert field_map.get("full_name") == "Kumari Pooja Ramesh Patil"
    assert field_map.get("dob") == "14/05/2003"
    assert field_map.get("gender") == "Female"
    assert field_map.get("annual_income") == "120000"
    assert field_map.get("caste_category") == "CAT-1"
    assert field_map.get("validity_period") == "31/03/2029"

def test_intent_identification():
    assert CitizenAssistantRAG.identify_intent("Are there any scholarships for engineering students?") == "scholarship"
    assert CitizenAssistantRAG.identify_intent("ನಾನು ಮಹಿಳೆಯರಿಗೆ ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ ಬಗ್ಗೆ ತಿಳಿಯಬೇಕಿದೆ") == "women"
    assert CitizenAssistantRAG.identify_intent("I am a farmer with 2 acres land") == "farmer"
    assert CitizenAssistantRAG.identify_intent("Unemployed youth stipend Yuva Nidhi") == "unemployment"

