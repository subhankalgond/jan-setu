from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import (
    User, Scheme, SchemeSource, SchemeEligibilityRule, SchemeDocument,
    SchemeVerificationHistory, UploadedDocument, PreparedApplication, AdminAuditLog
)
from auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

class RuleInput(BaseModel):
    rule_code: str
    field_name: str
    operator: str
    target_value: str
    description_en: str
    description_kn: Optional[str] = None
    description_hi: Optional[str] = None
    description_ur: Optional[str] = None
    is_mandatory: bool = True

class DocumentInput(BaseModel):
    document_type_code: str
    document_name: str
    document_name_kn: Optional[str] = None
    is_mandatory: bool = True
    guidelines: Optional[str] = None

class SourceInput(BaseModel):
    title: str
    url: str
    document_reference: Optional[str] = None

class CreateSchemeRequest(BaseModel):
    code: str
    title: str
    kannada_title: Optional[str] = None
    hindi_title: Optional[str] = None
    urdu_title: Optional[str] = None
    short_description: str
    detailed_description: str
    department: str
    government_level: str = "karnataka"
    state: str = "Karnataka"
    category: str
    target_beneficiaries: str
    benefits_summary: str
    application_process: str
    official_portal_url: str
    verification_status: str = "draft"
    sources: List[SourceInput]
    eligibility_rules: List[RuleInput]
    required_documents: List[DocumentInput]

class UpdateSchemeStatusRequest(BaseModel):
    status: str  # 'draft', 'under_review', 'verified', 'published', 'archived'
    notes: Optional[str] = None

class UserStatusUpdateRequest(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None

@router.get("/overview")
def get_admin_overview(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_citizens = db.query(User).filter(User.role == "citizen").count()
    total_admins = db.query(User).filter(User.role == "admin").count()

    total_schemes = db.query(Scheme).count()
    published_schemes = db.query(Scheme).filter(Scheme.verification_status == "published").count()
    pending_schemes = db.query(Scheme).filter(Scheme.verification_status == "under_review").count()
    draft_schemes = db.query(Scheme).filter(Scheme.verification_status == "draft").count()
    archived_schemes = db.query(Scheme).filter(Scheme.verification_status == "archived").count()

    total_docs = db.query(UploadedDocument).count()
    approved_docs = db.query(UploadedDocument).filter(UploadedDocument.status == "approved_by_user").count()
    blurry_docs = db.query(UploadedDocument).filter(UploadedDocument.is_blurry == True).count()

    total_apps = db.query(PreparedApplication).count()
    ready_apps = db.query(PreparedApplication).filter(PreparedApplication.status.in_(["prepared", "reference_recorded"])).count()

    recent_logs = (
        db.query(AdminAuditLog)
        .order_by(AdminAuditLog.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "users": {
            "total": total_users,
            "citizens": total_citizens,
            "admins": total_admins
        },
        "schemes": {
            "total": total_schemes,
            "published": published_schemes,
            "under_review": pending_schemes,
            "draft": draft_schemes,
            "archived": archived_schemes
        },
        "document_intelligence": {
            "total_processed": total_docs,
            "user_approved": approved_docs,
            "blur_detected": blurry_docs,
            "health_rate": round((total_docs - blurry_docs) / total_docs * 100, 1) if total_docs > 0 else 100.0
        },
        "applications": {
            "total_prepared": total_apps,
            "ready_or_submitted": ready_apps
        },
        "recent_audit_logs": [
            {
                "id": l.id,
                "admin_email": l.admin_email,
                "action": l.action,
                "resource_type": l.resource_type,
                "resource_id": l.resource_id,
                "created_at": l.created_at.isoformat()
            }
            for l in recent_logs
        ]
    }

@router.get("/schemes")
def list_admin_schemes(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    schemes = db.query(Scheme).order_by(Scheme.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "code": s.code,
            "title": s.title,
            "department": s.department,
            "government_level": s.government_level,
            "category": s.category,
            "verification_status": s.verification_status,
            "last_verified_date": s.last_verified_date,
            "verified_by_admin": s.verified_by_admin,
            "rules_count": len(s.eligibility_rules),
            "documents_count": len(s.documents),
            "created_at": s.created_at.isoformat()
        }
        for s in schemes
    ]

@router.post("/schemes", status_code=status.HTTP_201_CREATED)
def create_scheme(
    req: CreateSchemeRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Scheme).filter(Scheme.code == req.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Scheme with code '{req.code}' already exists.")

    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    scheme = Scheme(
        code=req.code,
        title=req.title,
        kannada_title=req.kannada_title,
        hindi_title=req.hindi_title,
        urdu_title=req.urdu_title,
        short_description=req.short_description,
        detailed_description=req.detailed_description,
        department=req.department,
        government_level=req.government_level,
        state=req.state,
        category=req.category,
        target_beneficiaries=req.target_beneficiaries,
        benefits_summary=req.benefits_summary,
        application_process=req.application_process,
        official_portal_url=req.official_portal_url,
        verification_status=req.verification_status,
        last_verified_date=today_str,
        verified_by_admin=admin.full_name
    )
    db.add(scheme)
    db.flush()

    for s in req.sources:
        src = SchemeSource(
            scheme_id=scheme.id,
            title=s.title,
            url=s.url,
            document_reference=s.document_reference,
            last_verified_at=today_str
        )
        db.add(src)

    for r in req.eligibility_rules:
        rule = SchemeEligibilityRule(
            scheme_id=scheme.id,
            rule_code=r.rule_code,
            field_name=r.field_name,
            operator=r.operator,
            target_value=r.target_value,
            description_en=r.description_en,
            description_kn=r.description_kn,
            description_hi=r.description_hi,
            description_ur=r.description_ur,
            is_mandatory=r.is_mandatory
        )
        db.add(rule)

    for d in req.required_documents:
        doc = SchemeDocument(
            scheme_id=scheme.id,
            document_type_code=d.document_type_code,
            document_name=d.document_name,
            document_name_kn=d.document_name_kn,
            is_mandatory=d.is_mandatory,
            guidelines=d.guidelines
        )
        db.add(doc)

    # Log action
    log = AdminAuditLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="create_scheme",
        resource_type="scheme",
        resource_id=scheme.id,
        details={"code": scheme.code, "title": scheme.title, "status": scheme.verification_status}
    )
    db.add(log)
    db.commit()

    return {"status": "success", "scheme_id": scheme.id, "message": "Scheme registered successfully."}

@router.patch("/schemes/{scheme_id}/status")
def update_scheme_status(
    scheme_id: str,
    req: UpdateSchemeStatusRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    valid_statuses = {"draft", "under_review", "verified", "published", "archived"}
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status '{req.status}'. Must be one of {valid_statuses}")

    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found.")

    old_status = scheme.verification_status
    scheme.verification_status = req.status
    scheme.last_verified_date = datetime.utcnow().strftime("%Y-%m-%d")
    scheme.verified_by_admin = admin.full_name

    # Record verification history
    history = SchemeVerificationHistory(
        scheme_id=scheme.id,
        admin_id=admin.id,
        admin_name=admin.full_name,
        action=req.status,
        notes=req.notes
    )
    db.add(history)

    # Audit log
    log = AdminAuditLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="update_scheme_status",
        resource_type="scheme",
        resource_id=scheme.id,
        details={"old_status": old_status, "new_status": req.status, "notes": req.notes}
    )
    db.add(log)
    db.commit()

    return {"status": "success", "new_status": scheme.verification_status}

@router.get("/users")
def list_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).limit(100).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "state": u.state,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
            "documents_count": len(u.documents),
            "applications_count": len(u.applications)
        }
        for u in users
    ]

@router.patch("/users/{user_id}")
def update_user_status(
    user_id: str,
    req: UserStatusUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if user_id == admin.id and req.role and req.role != "admin":
        raise HTTPException(status_code=400, detail="Cannot demote your own administrator account.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    changes = {}
    if req.is_active is not None:
        changes["is_active"] = {"old": user.is_active, "new": req.is_active}
        user.is_active = req.is_active

    if req.role and req.role in {"citizen", "admin"}:
        changes["role"] = {"old": user.role, "new": req.role}
        user.role = req.role

    log = AdminAuditLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="update_user",
        resource_type="user",
        resource_id=user.id,
        details=changes
    )
    db.add(log)
    db.commit()

    return {"status": "success", "user_id": user.id, "changes": changes}

@router.get("/audit-logs")
def get_audit_logs(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).limit(100).all()
    return [
        {
            "id": l.id,
            "admin_id": l.admin_id,
            "admin_email": l.admin_email,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": l.details,
            "ip_address": l.ip_address,
            "created_at": l.created_at.isoformat()
        }
        for l in logs
    ]

