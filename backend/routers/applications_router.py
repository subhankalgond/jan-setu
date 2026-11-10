from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import (
    User, Scheme, PreparedApplication, ApplicationReference,
    UploadedDocument, ExtractedDocumentField, Notification
)
from auth import get_current_user

router = APIRouter(prefix="/api/applications", tags=["Smart Application Preparation"])

class PrepareApplicationRequest(BaseModel):
    scheme_id: str
    custom_field_values: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class UpdateStatusRequest(BaseModel):
    status: str
    notes: Optional[str] = None

class RecordReferenceRequest(BaseModel):
    reference_number: str
    submission_date: str
    status_notes: Optional[str] = None

@router.post("/prepare")
def prepare_application(
    req: PrepareApplicationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(
        (Scheme.id == req.scheme_id) | (Scheme.code == req.scheme_id)
    ).first()

    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found for preparation."
        )

    # Gather user's approved document fields
    approved_docs = (
        db.query(UploadedDocument)
        .filter(
            UploadedDocument.user_id == current_user.id,
            UploadedDocument.status == "approved_by_user"
        )
        .all()
    )

    doc_data = {}
    for d in approved_docs:
        for f in d.extracted_fields:
            if f.is_user_approved or not f.is_uncertain:
                val = f.user_corrected_value or f.normalized_value or f.raw_value
                doc_data[f.field_name] = val

    profile = current_user.profile
    prof_dict = {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone or "Not Provided",
        "state": current_user.state,
        "age": profile.age if profile else None,
        "gender": profile.gender if profile else None,
        "occupation": profile.occupation if profile else None,
        "annual_income": profile.annual_income if profile else None,
        "caste_category": profile.caste_category if profile else None,
        "education_level": profile.education_level if profile else None,
        "ration_card_type": profile.ration_card_type if profile else None,
        "residence_district": profile.residence_district if profile else None
    }

    # Merge profile, document extracted fields, and custom overrides
    combined = {**prof_dict, **doc_data, **(req.custom_field_values or {})}

    # Inspect missing fields against scheme required rules & docs
    missing_fields = []
    for r in scheme.eligibility_rules:
        if r.is_mandatory:
            val = combined.get(r.field_name)
            if val is None or val == "":
                missing_fields.append({
                    "field_name": r.field_name,
                    "label": r.description_en,
                    "type": "profile_or_answer"
                })

    for d in scheme.documents:
        if d.is_mandatory:
            # Check if user has uploaded and approved this document type
            has_doc = any(ad.document_type == d.document_type_code for ad in approved_docs)
            if not has_doc:
                missing_fields.append({
                    "field_name": d.document_type_code,
                    "label": f"Mandatory Document: {d.document_name}",
                    "type": "document"
                })

    # Determine status
    if missing_fields:
        app_status = "documents_pending" if any(m["type"] == "document" for m in missing_fields) else "draft"
    else:
        app_status = "prepared"

    # Check if application already exists for this scheme and user
    app = db.query(PreparedApplication).filter(
        PreparedApplication.user_id == current_user.id,
        PreparedApplication.scheme_id == scheme.id
    ).first()

    if not app:
        app = PreparedApplication(
            user_id=current_user.id,
            scheme_id=scheme.id,
            status=app_status,
            prepared_data=combined,
            missing_fields=missing_fields,
            official_portal_url=scheme.official_portal_url,
            notes=req.notes
        )
        db.add(app)
    else:
        app.prepared_data = combined
        app.missing_fields = missing_fields
        app.status = app_status
        app.notes = req.notes or app.notes

    db.commit()

    return {
        "status": "success",
        "application_id": app.id,
        "scheme_title": scheme.title,
        "application_status": app.status,
        "prepared_fields": combined,
        "missing_fields": missing_fields,
        "official_portal_url": scheme.official_portal_url,
        "next_step": "Review prepared information and proceed to the official portal to submit." if not missing_fields else "Upload pending documents or fill missing information."
    }

@router.get("")
def list_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = (
        db.query(PreparedApplication)
        .filter(PreparedApplication.user_id == current_user.id)
        .order_by(PreparedApplication.updated_at.desc())
        .all()
    )

    results = []
    for a in apps:
        s = a.scheme
        refs = [
            {
                "id": r.id,
                "reference_number": r.reference_number,
                "submission_date": r.submission_date,
                "portal_acknowledged": r.portal_acknowledged,
                "status_notes": r.status_notes
            }
            for r in a.references
        ]

        results.append({
            "id": a.id,
            "scheme_id": s.id,
            "scheme_code": s.code,
            "scheme_title": s.title,
            "kannada_title": s.kannada_title,
            "department": s.department,
            "status": a.status,
            "official_portal_url": a.official_portal_url,
            "official_reference_number": a.official_reference_number,
            "missing_fields_count": len(a.missing_fields or []),
            "created_at": a.created_at.isoformat(),
            "updated_at": a.updated_at.isoformat(),
            "references": refs
        })

    return results

@router.get("/{application_id}")
def get_application_detail(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(PreparedApplication).filter(
        PreparedApplication.id == application_id,
        PreparedApplication.user_id == current_user.id
    ).first()

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found or unauthorized access."
        )

    scheme = app.scheme
    refs = [
        {
            "id": r.id,
            "reference_number": r.reference_number,
            "submission_date": r.submission_date,
            "portal_acknowledged": r.portal_acknowledged,
            "status_notes": r.status_notes
        }
        for r in app.references
    ]

    return {
        "id": app.id,
        "scheme": {
            "id": scheme.id,
            "code": scheme.code,
            "title": scheme.title,
            "department": scheme.department,
            "benefits": scheme.benefits_summary,
            "official_portal_url": scheme.official_portal_url,
            "application_process": scheme.application_process,
            "last_verified_date": scheme.last_verified_date
        },
        "status": app.status,
        "prepared_data": app.prepared_data,
        "missing_fields": app.missing_fields,
        "official_reference_number": app.official_reference_number,
        "notes": app.notes,
        "created_at": app.created_at.isoformat(),
        "updated_at": app.updated_at.isoformat(),
        "references": refs
    }

@router.patch("/{application_id}/status")
def update_application_status(
    application_id: str,
    req: UpdateStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed_statuses = {
        "draft", "documents_pending", "ready_for_review", "prepared",
        "redirected_to_official_portal", "reference_recorded", "completed_by_citizen"
    }
    if req.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{req.status}'. Allowed: {', '.join(allowed_statuses)}"
        )

    app = db.query(PreparedApplication).filter(
        PreparedApplication.id == application_id,
        PreparedApplication.user_id == current_user.id
    ).first()

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found."
        )

    app.status = req.status
    if req.notes:
        app.notes = req.notes
    db.commit()

    return {"status": "success", "new_status": app.status}

@router.post("/{application_id}/reference")
def record_application_reference(
    application_id: str,
    req: RecordReferenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = db.query(PreparedApplication).filter(
        PreparedApplication.id == application_id,
        PreparedApplication.user_id == current_user.id
    ).first()

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found."
        )

    app.official_reference_number = req.reference_number
    app.status = "reference_recorded"

    ref_record = ApplicationReference(
        application_id=app.id,
        reference_number=req.reference_number,
        submission_date=req.submission_date,
        portal_acknowledged=True,
        status_notes=req.status_notes
    )
    db.add(ref_record)

    # Create confirmation notification
    notif = Notification(
        user_id=current_user.id,
        title=f"Reference Recorded: {app.scheme.title}",
        message=f"Official acknowledgment number {req.reference_number} has been safely saved in your organizer.",
        notification_type="reminder"
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "message": "Official reference number recorded. You can view it anytime in My Applications."
    }

