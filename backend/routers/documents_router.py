import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from database import get_db
from models import User, UploadedDocument, ExtractedDocumentField, DocumentReview
from auth import get_current_user
from document_processor import DocumentProcessor

router = APIRouter(prefix="/api/documents", tags=["Document Intelligence & Management"])

UPLOAD_DIR = os.path.abspath("./secure_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

class FieldCorrection(BaseModel):
    field_id: str
    corrected_value: str
    is_approved: bool

class DocumentReviewRequest(BaseModel):
    action: str  # 'approve', 'reject'
    corrections: Optional[List[FieldCorrection]] = None
    notes: Optional[str] = None

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    simulated_text: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Only PDF, JPG, JPEG, and PNG are allowed."
        )

    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{file.content_type}'."
        )

    # Generate isolated, safe filename
    safe_filename = f"{current_user.id}_{uuid.uuid4().hex[:10]}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, safe_filename)

    file_size = 0
    try:
        with open(dest_path, "wb") as buffer:
            while chunk := await file.read(1024 * 64):
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    os.remove(dest_path)
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="File exceeds maximum allowed limit of 10 MB."
                    )
                buffer.write(chunk)
    except Exception as e:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(status_code=500, detail=f"Failed to store file: {str(e)}")

    # 1. Quality inspection
    quality_result = DocumentProcessor.check_image_quality(dest_path)

    # 2. Field extraction
    extracted_fields = DocumentProcessor.extract_fields(
        dest_path,
        document_type=document_type,
        simulated_text=simulated_text
    )

    # Determine expiry if present
    expiry_date = None
    for f in extracted_fields:
        if f["field_name"] == "validity_period":
            expiry_date = f["normalized_value"]

    # 3. Create document record
    doc_record = UploadedDocument(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=dest_path,
        file_size_bytes=file_size,
        mime_type=file.content_type,
        document_type=document_type,
        status="needs_review",  # Requires user review & approval before being usable
        quality_score=quality_result["quality_score"],
        is_blurry=quality_result["is_blurry"],
        is_incomplete=quality_result["is_incomplete"],
        blur_score=quality_result.get("blur_score"),
        expiry_date=expiry_date
    )
    db.add(doc_record)
    db.flush()

    # 4. Save extracted fields
    fields_saved = []
    for f in extracted_fields:
        ef = ExtractedDocumentField(
            document_id=doc_record.id,
            field_name=f["field_name"],
            raw_value=f["raw_value"],
            normalized_value=f["normalized_value"],
            confidence=f["confidence"],
            is_uncertain=f["is_uncertain"],
            is_user_approved=False
        )
        db.add(ef)
        db.flush()
        fields_saved.append({
            "id": ef.id,
            "field_name": ef.field_name,
            "raw_value": ef.raw_value,
            "normalized_value": ef.normalized_value,
            "confidence": ef.confidence,
            "is_uncertain": ef.is_uncertain,
            "is_user_approved": ef.is_user_approved
        })

    db.commit()

    return {
        "status": "success",
        "document_id": doc_record.id,
        "file_name": doc_record.file_name,
        "document_type": doc_record.document_type,
        "quality": quality_result,
        "extracted_fields": fields_saved,
        "message": "Document uploaded successfully. Please review and verify the extracted data before submitting."
    }

@router.get("")
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    docs = (
        db.query(UploadedDocument)
        .filter(UploadedDocument.user_id == current_user.id)
        .order_by(UploadedDocument.created_at.desc())
        .all()
    )

    results = []
    for d in docs:
        fields = [
            {
                "id": f.id,
                "field_name": f.field_name,
                "raw_value": f.raw_value,
                "normalized_value": f.normalized_value,
                "confidence": f.confidence,
                "is_uncertain": f.is_uncertain,
                "user_corrected_value": f.user_corrected_value,
                "is_user_approved": f.is_user_approved
            }
            for f in d.extracted_fields
        ]

        results.append({
            "id": d.id,
            "file_name": d.file_name,
            "document_type": d.document_type,
            "status": d.status,
            "file_size_bytes": d.file_size_bytes,
            "mime_type": d.mime_type,
            "quality_score": d.quality_score,
            "is_blurry": d.is_blurry,
            "is_incomplete": d.is_incomplete,
            "expiry_date": d.expiry_date,
            "created_at": d.created_at.isoformat(),
            "extracted_fields": fields
        })

    return results

@router.post("/{document_id}/review")
def review_document(
    document_id: str,
    req: DocumentReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(UploadedDocument).filter(
        UploadedDocument.id == document_id,
        UploadedDocument.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or unauthorized access."
        )

    if req.action == "reject":
        doc.status = "needs_review"
        db.commit()
        return {"status": "success", "message": "Document marked as rejected by citizen."}

    # Apply any user corrections to fields
    if req.corrections:
        for c in req.corrections:
            f = db.query(ExtractedDocumentField).filter(
                ExtractedDocumentField.id == c.field_id,
                ExtractedDocumentField.document_id == doc.id
            ).first()
            if f:
                f.user_corrected_value = c.corrected_value
                f.normalized_value = c.corrected_value
                f.is_user_approved = c.is_approved
                f.is_uncertain = False

    # Mark document as approved by user
    doc.status = "approved_by_user"

    # Create review record
    review = DocumentReview(
        document_id=doc.id,
        user_id=current_user.id,
        action="approved",
        notes=req.notes
    )
    db.add(review)
    db.commit()

    return {
        "status": "success",
        "message": "Extracted document data approved. It can now be used for scheme application preparation."
    }

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(UploadedDocument).filter(
        UploadedDocument.id == document_id,
        UploadedDocument.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or unauthorized access."
        )

    # Safely remove physical file
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()

    return {"status": "success", "message": "Document deleted securely."}

