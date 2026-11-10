from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from database import get_db
from models import Scheme, User
from auth import security_bearer, decode_access_token
from rules_engine import DeterministicEligibilityEngine

router = APIRouter(prefix="/api/eligibility", tags=["Eligibility Engine"])

class EvaluateRequest(BaseModel):
    scheme_id: str
    custom_answers: Optional[Dict[str, Any]] = None
    language: str = "en"

@router.post("/evaluate")
def evaluate_eligibility(
    req: EvaluateRequest,
    credentials = Depends(security_bearer),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(
        (Scheme.id == req.scheme_id) | (Scheme.code == req.scheme_id)
    ).first()

    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found for evaluation."
        )

    # Check if user is authenticated to grab their profile
    profile_data = {}
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload:
            user = db.query(User).filter(User.id == payload.get("sub")).first()
            if user and user.profile:
                p = user.profile
                profile_data = {
                    "age": p.age,
                    "gender": p.gender,
                    "occupation": p.occupation,
                    "annual_income": p.annual_income,
                    "caste_category": p.caste_category,
                    "is_student": p.is_student,
                    "education_level": p.education_level,
                    "disability_status": p.disability_status,
                    "land_holding_acres": p.land_holding_acres,
                    "ration_card_type": p.ration_card_type,
                    "residence_district": p.residence_district,
                    "domicile_state": p.domicile_state
                }

    # Deterministic evaluation
    result = DeterministicEligibilityEngine.evaluate_scheme(
        scheme_rules=scheme.eligibility_rules,
        citizen_profile=profile_data,
        citizen_answers=req.custom_answers,
        language=req.language
    )

    return {
        "scheme": {
            "id": scheme.id,
            "code": scheme.code,
            "title": scheme.title,
            "kannada_title": scheme.kannada_title,
            "official_portal_url": scheme.official_portal_url,
            "department": scheme.department
        },
        "evaluation": result
    }

