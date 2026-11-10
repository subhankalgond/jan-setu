import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime,
    ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="citizen", nullable=False)  # 'citizen', 'admin'
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    state = Column(String(100), default="Karnataka", nullable=False)
    preferred_language = Column(String(10), default="en", nullable=False)  # 'en', 'kn', 'hi', 'ur'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    documents = relationship("UploadedDocument", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("PreparedApplication", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    answers = relationship("CitizenAnswer", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)  # 'Female', 'Male', 'Transgender', 'Other'
    occupation = Column(String(100), nullable=True)  # 'Student', 'Farmer', 'Unemployed', 'Daily Wage', etc.
    annual_income = Column(Float, nullable=True)
    caste_category = Column(String(50), nullable=True)  # 'SC', 'ST', 'OBC', 'General', 'Cat-1', '2A', '2B', '3A', '3B'
    is_student = Column(Boolean, default=False)
    education_level = Column(String(100), nullable=True)  # 'SSLC', 'PUC', 'Diploma', 'Undergraduate', 'Postgraduate'
    disability_status = Column(Boolean, default=False)
    land_holding_acres = Column(Float, default=0.0)
    ration_card_type = Column(String(50), nullable=True)  # 'BPL', 'AAY', 'APL', 'None'
    residence_district = Column(String(100), nullable=True)
    domicile_state = Column(String(100), default="Karnataka")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="profile")

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    sms_notifications = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    voice_guidance_enabled = Column(Boolean, default=False)
    data_sharing_consent = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="preferences")

class SchemeCategory(Base):
    __tablename__ = "scheme_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    kannada_title = Column(String(255), nullable=True)
    hindi_title = Column(String(255), nullable=True)
    urdu_title = Column(String(255), nullable=True)
    short_description = Column(Text, nullable=False)
    detailed_description = Column(Text, nullable=False)
    department = Column(String(255), nullable=False)
    government_level = Column(String(50), default="karnataka", nullable=False)  # 'karnataka', 'central'
    state = Column(String(100), default="Karnataka", nullable=False)
    category = Column(String(100), nullable=False)  # 'Education', 'Women & Child', 'Agriculture', etc.
    target_beneficiaries = Column(String(255), nullable=False)
    benefits_summary = Column(Text, nullable=False)
    application_process = Column(Text, nullable=False)
    official_portal_url = Column(String(500), nullable=False)
    verification_status = Column(String(50), default="published", nullable=False)  # 'draft', 'under_review', 'verified', 'published', 'archived'
    last_verified_date = Column(String(50), nullable=False)
    verified_by_admin = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    sources = relationship("SchemeSource", back_populates="scheme", cascade="all, delete-orphan")
    eligibility_rules = relationship("SchemeEligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    documents = relationship("SchemeDocument", back_populates="scheme", cascade="all, delete-orphan")
    verification_history = relationship("SchemeVerificationHistory", back_populates="scheme", cascade="all, delete-orphan")

class SchemeSource(Base):
    __tablename__ = "scheme_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_id = Column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    document_reference = Column(String(255), nullable=True)
    last_verified_at = Column(String(50), nullable=False)

    scheme = relationship("Scheme", back_populates="sources")

class SchemeEligibilityRule(Base):
    __tablename__ = "scheme_eligibility_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_id = Column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    rule_code = Column(String(100), nullable=False)
    field_name = Column(String(100), nullable=False)  # e.g., 'age', 'annual_income', 'is_student', 'gender'
    operator = Column(String(20), nullable=False)  # 'eq', 'neq', 'lte', 'gte', 'in', 'bool_true', 'between'
    target_value = Column(String(255), nullable=False)  # stringified value or json list
    description_en = Column(Text, nullable=False)
    description_kn = Column(Text, nullable=True)
    description_hi = Column(Text, nullable=True)
    description_ur = Column(Text, nullable=True)
    is_mandatory = Column(Boolean, default=True)

    scheme = relationship("Scheme", back_populates="eligibility_rules")

class SchemeDocument(Base):
    __tablename__ = "scheme_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_id = Column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    document_type_code = Column(String(100), nullable=False)  # e.g., 'income_certificate', 'marksheet'
    document_name = Column(String(255), nullable=False)
    document_name_kn = Column(String(255), nullable=True)
    document_name_hi = Column(String(255), nullable=True)
    document_name_ur = Column(String(255), nullable=True)
    is_mandatory = Column(Boolean, default=True)
    guidelines = Column(Text, nullable=True)

    scheme = relationship("Scheme", back_populates="documents")

class SchemeVerificationHistory(Base):
    __tablename__ = "scheme_verification_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_id = Column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    admin_id = Column(String(36), nullable=False)
    admin_name = Column(String(255), nullable=False)
    action = Column(String(50), nullable=False)  # 'created', 'reviewed', 'verified', 'published', 'archived'
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    scheme = relationship("Scheme", back_populates="verification_history")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    session_token = Column(String(100), index=True, nullable=False)
    preferred_language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    message_text = Column(Text, nullable=False)
    audio_url = Column(String(500), nullable=True)
    intent = Column(String(100), nullable=True)
    extracted_entities = Column(JSON, nullable=True)
    recommended_scheme_ids = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")

class CitizenAnswer(Base):
    __tablename__ = "citizen_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_key = Column(String(100), nullable=False)  # e.g., 'has_bpl_card', 'family_annual_income'
    answer_value = Column(String(255), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="answers")

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    document_type = Column(String(100), nullable=False)  # e.g., 'income_certificate', 'marksheet', 'aadhaar_card'
    status = Column(String(50), default="needs_review", nullable=False)  # 'uploaded', 'needs_review', 'approved_by_user', 'missing'
    quality_score = Column(Float, default=1.0)
    is_blurry = Column(Boolean, default=False)
    is_incomplete = Column(Boolean, default=False)
    blur_score = Column(Float, nullable=True)
    expiry_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="documents")
    extracted_fields = relationship("ExtractedDocumentField", back_populates="document", cascade="all, delete-orphan")
    reviews = relationship("DocumentReview", back_populates="document", cascade="all, delete-orphan")

class ExtractedDocumentField(Base):
    __tablename__ = "extracted_document_fields"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("uploaded_documents.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String(100), nullable=False)  # 'name', 'dob', 'gender', 'certificate_number', 'income_amount'
    raw_value = Column(Text, nullable=True)
    normalized_value = Column(String(255), nullable=True)
    confidence = Column(Float, default=0.0)
    is_uncertain = Column(Boolean, default=False)
    user_corrected_value = Column(String(255), nullable=True)
    is_user_approved = Column(Boolean, default=False)

    document = relationship("UploadedDocument", back_populates="extracted_fields")

class DocumentReview(Base):
    __tablename__ = "document_reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("uploaded_documents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(50), nullable=False)  # 'approved', 'rejected', 'corrected'
    notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    document = relationship("UploadedDocument", back_populates="reviews")

class PreparedApplication(Base):
    __tablename__ = "prepared_applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = Column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="draft", nullable=False)
    # Statuses: 'draft', 'documents_pending', 'ready_for_review', 'prepared', 'redirected_to_official_portal', 'reference_recorded', 'completed_by_citizen'
    prepared_data = Column(JSON, nullable=True)  # Mapped verified fields
    missing_fields = Column(JSON, nullable=True)  # Fields still missing
    official_portal_url = Column(String(500), nullable=False)
    official_reference_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="applications")
    scheme = relationship("Scheme")
    references = relationship("ApplicationReference", back_populates="application", cascade="all, delete-orphan")

class ApplicationFieldMapping(Base):
    __tablename__ = "application_field_mappings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scheme_id = Column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    portal_field_label = Column(String(255), nullable=False)
    profile_field_name = Column(String(100), nullable=True)
    document_field_name = Column(String(100), nullable=True)
    field_type = Column(String(50), default="text")
    is_required = Column(Boolean, default=True)

class ApplicationReference(Base):
    __tablename__ = "application_references"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("prepared_applications.id", ondelete="CASCADE"), nullable=False)
    reference_number = Column(String(100), nullable=False)
    submission_date = Column(String(50), nullable=False)
    portal_acknowledged = Column(Boolean, default=False)
    status_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    application = relationship("PreparedApplication", back_populates="references")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="reminder")  # 'missing_doc', 'incomplete_prep', 'scheme_update', 'reminder'
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    due_date = Column(String(50), nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="reminders")

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    admin_id = Column(String(36), nullable=False)
    admin_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)  # 'create_scheme', 'publish_scheme', 'update_role', etc.
    resource_type = Column(String(100), nullable=False)  # 'scheme', 'user', 'document'
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

