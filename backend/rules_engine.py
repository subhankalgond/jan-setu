from typing import Dict, Any, List, Optional
import json

class DeterministicEligibilityEngine:
    """
    Deterministic Rules Engine for Jan Setu AI.
    Does not allow LLMs to independently decide eligibility.
    Evaluates verified government criteria against citizen profile and answers.
    """

    @staticmethod
    def evaluate_condition(
        operator: str,
        target_value_raw: str,
        actual_value: Any
    ) -> tuple[bool, Optional[str]]:
        """
        Evaluates a single condition.
        Returns (is_satisfied, failure_reason)
        """
        if actual_value is None:
            return False, "Information not provided by citizen"

        op = operator.lower().strip()

        try:
            if op == "eq":
                # String or direct equality
                sat = str(actual_value).strip().lower() == str(target_value_raw).strip().lower()
                return sat, None if sat else f"Expected {target_value_raw}, but provided {actual_value}"

            elif op == "neq":
                sat = str(actual_value).strip().lower() != str(target_value_raw).strip().lower()
                return sat, None if sat else f"Cannot be {target_value_raw}"

            elif op == "bool_true":
                val = bool(actual_value) if not isinstance(actual_value, str) else actual_value.lower() in ("true", "1", "yes")
                return val, None if val else "Must be affirmative/true"

            elif op == "lte":
                val = float(actual_value)
                limit = float(target_value_raw)
                sat = val <= limit
                return sat, None if sat else f"Value ₹{val:,.0f} exceeds maximum threshold of ₹{limit:,.0f}"

            elif op == "gte":
                val = float(actual_value)
                limit = float(target_value_raw)
                sat = val >= limit
                return sat, None if sat else f"Value {val} is below minimum requirement of {limit}"

            elif op == "between":
                parts = [float(p.strip()) for p in target_value_raw.split(",")]
                if len(parts) != 2:
                    return False, "Invalid rule configuration"
                val = float(actual_value)
                sat = parts[0] <= val <= parts[1]
                return sat, None if sat else f"Value {val} outside allowed range [{parts[0]}, {parts[1]}]"

            elif op == "in":
                # Target value can be comma-separated or json list
                if target_value_raw.startswith("["):
                    allowed = [str(x).strip().lower() for x in json.loads(target_value_raw)]
                else:
                    allowed = [x.strip().lower() for x in target_value_raw.split(",")]
                sat = str(actual_value).strip().lower() in allowed
                allowed_str = ", ".join(allowed)
                return sat, None if sat else f"Provided '{actual_value}' is not among recognized categories ({allowed_str})"

            else:
                return False, f"Unsupported rule operator: {operator}"

        except (ValueError, TypeError) as e:
            return False, f"Could not parse data for comparison: {str(e)}"

    @classmethod
    def evaluate_scheme(
        cls,
        scheme_rules: List[Any],
        citizen_profile: Optional[Dict[str, Any]] = None,
        citizen_answers: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Evaluates a citizen against all rules of a scheme.
        Language options: 'en', 'kn', 'hi', 'ur'
        """
        profile = citizen_profile or {}
        answers = citizen_answers or {}

        # Merge profile and custom answers (answers take precedence for dynamic queries)
        combined_data = {**profile, **answers}

        breakdown = []
        satisfied_count = 0
        failed_count = 0
        missing_count = 0
        missing_fields = []

        for rule in scheme_rules:
            field_name = rule.field_name
            actual_val = combined_data.get(field_name)

            # Multilingual description
            if language == "kn" and getattr(rule, "description_kn", None):
                desc = rule.description_kn
            elif language == "hi" and getattr(rule, "description_hi", None):
                desc = rule.description_hi
            elif language == "ur" and getattr(rule, "description_ur", None):
                desc = rule.description_ur
            else:
                desc = rule.description_en

            if actual_val is None or actual_val == "":
                missing_count += 1
                missing_fields.append({
                    "field_name": field_name,
                    "description": desc,
                    "rule_code": rule.rule_code
                })
                breakdown.append({
                    "rule_code": rule.rule_code,
                    "field_name": field_name,
                    "description": desc,
                    "status": "missing_information",
                    "reason": "This information has not yet been provided in your profile or questionnaire.",
                    "is_mandatory": rule.is_mandatory,
                    "provided_value": None,
                    "required_value": rule.target_value
                })
            else:
                is_sat, failure_reason = cls.evaluate_condition(
                    rule.operator,
                    rule.target_value,
                    actual_val
                )

                if is_sat:
                    satisfied_count += 1
                    breakdown.append({
                        "rule_code": rule.rule_code,
                        "field_name": field_name,
                        "description": desc,
                        "status": "satisfied",
                        "reason": "Criteria verified and satisfied.",
                        "is_mandatory": rule.is_mandatory,
                        "provided_value": actual_val,
                        "required_value": rule.target_value
                    })
                else:
                    if rule.is_mandatory:
                        failed_count += 1
                    breakdown.append({
                        "rule_code": rule.rule_code,
                        "field_name": field_name,
                        "description": desc,
                        "status": "not_satisfied",
                        "reason": failure_reason or "Does not satisfy government criteria.",
                        "is_mandatory": rule.is_mandatory,
                        "provided_value": actual_val,
                        "required_value": rule.target_value
                    })

        # Final determination based strictly on rules
        if failed_count > 0:
            overall_status = "not_eligible"
            summary_en = "Based on the verified criteria, you do not currently meet all mandatory eligibility conditions for this scheme."
            summary_kn = "ಪರಿಶೀಲಿಸಿದ ನಿಯಮಗಳ ಪ್ರಕಾರ, ನೀವು ಪ್ರಸ್ತುತ ಈ ಯೋಜನೆಯ ಕಡ್ಡಾಯ ಅರ್ಹತಾ ಷರತ್ತುಗಳನ್ನು ಪೂರೈಸುತ್ತಿಲ್ಲ."
            summary_hi = "सत्यापित मानदंडों के अनुसार, आप वर्तमान में इस योजना की अनिवार्य पात्रता शर्तों को पूरा नहीं करते हैं।"
            summary_ur = "تصدیق شدہ معیار کے مطابق، آپ فی الحال اس اسکیم کی لازمی اہلیت کی شرائط پر پورا نہیں اترتے ہیں۔"
        elif missing_count > 0:
            overall_status = "more_information_required"
            summary_en = f"You satisfy {satisfied_count} verified condition(s), but {missing_count} required condition(s) need additional information."
            summary_kn = f"ನೀವು {satisfied_count} ಷರತ್ತುಗಳನ್ನು ಪೂರೈಸಿದ್ದೀರಿ, ಆದರೆ {missing_count} ಷರತ್ತುಗಳ ಪರಿಶೀಲನೆಗೆ ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯವಿದೆ."
            summary_hi = f"आप {satisfied_count} शर्तों को पूरा करते हैं, लेकिन {missing_count} शर्तों के लिए अतिरिक्त जानकारी आवश्यक है।"
            summary_ur = f"آپ نے {satisfied_count} شرائط پوری کی ہیں، لیکن {missing_count} شرائط کے لیے اضافی معلومات درکار ہیں۔"
        else:
            overall_status = "likely_eligible"
            summary_en = "You satisfy all evaluated eligibility criteria for this scheme based on the verified rules."
            summary_kn = "ಪರಿಶೀಲಿಸಿದ ನಿಯಮಗಳ ಆಧಾರದ ಮೇಲೆ ನೀವು ಈ ಯೋಜನೆಗೆ ಅರ್ಹರಾಗಿರುವ ಸಾಧ್ಯತೆಯಿದೆ."
            summary_hi = "सत्यापित नियमों के आधार पर आप इस योजना के सभी पात्रता मानदंडों को पूरा करते हैं।"
            summary_ur = "تصدیق شدہ قواعد کی بنیاد پر آپ اس اسکیم کے تمام اہلیتی معیار پر پورا اترتے ہیں۔"

        summaries = {
            "en": summary_en,
            "kn": summary_kn,
            "hi": summary_hi,
            "ur": summary_ur
        }

        return {
            "status": overall_status,
            "summary": summaries.get(language, summary_en),
            "satisfied_count": satisfied_count,
            "failed_count": failed_count,
            "missing_count": missing_count,
            "total_conditions": len(scheme_rules),
            "breakdown": breakdown,
            "missing_fields": missing_fields,
            "disclaimer": "This is a preliminary eligibility assessment conducted using verified rules. Official determination is made solely by the authorized government department."
        }

