from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from models import Scheme, SchemeCategory, SchemeSource, SchemeEligibilityRule, SchemeDocument

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(SchemeCategory).all()
    return [{"id": c.id, "slug": c.slug, "name": c.name, "description": c.description} for c in cats]

@router.get("")
def list_schemes(
    q: Optional[str] = Query(None, description="Search keyword in scheme name or description"),
    category: Optional[str] = Query(None, description="Category filter"),
    level: Optional[str] = Query(None, description="'karnataka' or 'central'"),
    beneficiary: Optional[str] = Query(None, description="Beneficiary type filter"),
    db: Session = Depends(get_db)
):
    query = db.query(Scheme).filter(Scheme.verification_status == "published")

    if level:
        query = query.filter(Scheme.government_level == level.lower())

    if category:
        query = query.filter(Scheme.category.ilike(f"%{category}%"))

    if beneficiary:
        query = query.filter(Scheme.target_beneficiaries.ilike(f"%{beneficiary}%"))

    schemes = query.all()

    if q:
        q_lower = q.lower().strip()
        filtered = []
        for s in schemes:
            matches_title = q_lower in s.title.lower()
            matches_kn = s.kannada_title and q_lower in s.kannada_title.lower()
            matches_hi = s.hindi_title and q_lower in s.hindi_title.lower()
            matches_ur = s.urdu_title and q_lower in s.urdu_title.lower()
            matches_dept = q_lower in s.department.lower()
            matches_code = q_lower in s.code.lower()
            matches_desc = q_lower in s.short_description.lower() or q_lower in s.benefits_summary.lower()

            if matches_title or matches_kn or matches_hi or matches_ur or matches_dept or matches_code or matches_desc:
                filtered.append(s)
        schemes = filtered

    results = []
    for s in schemes:
        results.append({
            "id": s.id,
            "code": s.code,
            "title": s.title,
            "kannada_title": s.kannada_title,
            "hindi_title": s.hindi_title,
            "urdu_title": s.urdu_title,
            "short_description": s.short_description,
            "department": s.department,
            "government_level": s.government_level,
            "state": s.state,
            "category": s.category,
            "target_beneficiaries": s.target_beneficiaries,
            "benefits_summary": s.benefits_summary,
            "official_portal_url": s.official_portal_url,
            "verification_status": s.verification_status,
            "last_verified_date": s.last_verified_date,
            "rules_count": len(s.eligibility_rules),
            "documents_count": len(s.documents)
        })

    return results

@router.get("/{id_or_code}")
def get_scheme_detail(id_or_code: str, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(
        (Scheme.id == id_or_code) | (Scheme.code == id_or_code)
    ).first()

    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found or record has been archived."
        )

    sources = [
        {
            "id": src.id,
            "title": src.title,
            "url": src.url,
            "document_reference": src.document_reference,
            "last_verified_at": src.last_verified_at
        }
        for src in scheme.sources
    ]

    rules = [
        {
            "id": r.id,
            "rule_code": r.rule_code,
            "field_name": r.field_name,
            "operator": r.operator,
            "target_value": r.target_value,
            "description_en": r.description_en,
            "description_kn": r.description_kn,
            "description_hi": r.description_hi,
            "description_ur": r.description_ur,
            "is_mandatory": r.is_mandatory
        }
        for r in scheme.eligibility_rules
    ]

    documents = [
        {
            "id": d.id,
            "document_type_code": d.document_type_code,
            "document_name": d.document_name,
            "document_name_kn": d.document_name_kn,
            "document_name_hi": d.document_name_hi,
            "document_name_ur": d.document_name_ur,
            "is_mandatory": d.is_mandatory,
            "guidelines": d.guidelines
        }
        for d in scheme.documents
    ]

    return {
        "id": scheme.id,
        "code": scheme.code,
        "title": scheme.title,
        "kannada_title": scheme.kannada_title,
        "hindi_title": scheme.hindi_title,
        "urdu_title": scheme.urdu_title,
        "short_description": scheme.short_description,
        "detailed_description": scheme.detailed_description,
        "department": scheme.department,
        "government_level": scheme.government_level,
        "state": scheme.state,
        "category": scheme.category,
        "target_beneficiaries": scheme.target_beneficiaries,
        "benefits_summary": scheme.benefits_summary,
        "application_process": scheme.application_process,
        "official_portal_url": scheme.official_portal_url,
        "verification_status": scheme.verification_status,
        "last_verified_date": scheme.last_verified_date,
        "verified_by_admin": scheme.verified_by_admin,
        "sources": sources,
        "eligibility_rules": rules,
        "required_documents": documents
    }

