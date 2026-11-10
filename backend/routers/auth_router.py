from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
from models import User, UserProfile, UserPreferences, AdminAuditLog
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

class RegisterRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=150)
    phone: Optional[str] = None
    state: str = "Karnataka"
    preferred_language: str = "en"

class LoginRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str

class ProfileUpdateRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    caste_category: Optional[str] = None
    is_student: Optional[bool] = None
    education_level: Optional[str] = None
    disability_status: Optional[bool] = None
    land_holding_acres: Optional[float] = None
    ration_card_type: Optional[str] = None
    residence_district: Optional[str] = None

class PreferencesUpdateRequest(BaseModel):
    sms_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None
    voice_guidance_enabled: Optional[bool] = None
    data_sharing_consent: Optional[bool] = None

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account is already registered with this email address."
        )

    user = User(
        email=req.email.lower().strip(),
        password_hash=hash_password(req.password),
        full_name=req.full_name.strip(),
        phone=req.phone.strip() if req.phone else None,
        state=req.state,
        preferred_language=req.preferred_language,
        role="citizen",
        is_active=True
    )
    db.add(user)
    db.flush()

    # Create associated empty profile and preferences
    profile = UserProfile(
        user_id=user.id,
        domicile_state=req.state
    )
    prefs = UserPreferences(
        user_id=user.id,
        sms_notifications=True,
        email_notifications=True,
        voice_guidance_enabled=False,
        data_sharing_consent=True
    )
    db.add(profile)
    db.add(prefs)
    db.commit()

    token = create_access_token(user.id, user.email, user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "state": user.state,
            "preferred_language": user.preferred_language
        }
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your email and password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact Jan Setu support."
        )

    token = create_access_token(user.id, user.email, user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "state": user.state,
            "preferred_language": user.preferred_language
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    prefs = current_user.preferences

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role,
        "state": current_user.state,
        "preferred_language": current_user.preferred_language,
        "created_at": current_user.created_at.isoformat(),
        "profile": {
            "age": profile.age if profile else None,
            "gender": profile.gender if profile else None,
            "occupation": profile.occupation if profile else None,
            "annual_income": profile.annual_income if profile else None,
            "caste_category": profile.caste_category if profile else None,
            "is_student": profile.is_student if profile else False,
            "education_level": profile.education_level if profile else None,
            "disability_status": profile.disability_status if profile else False,
            "land_holding_acres": profile.land_holding_acres if profile else 0.0,
            "ration_card_type": profile.ration_card_type if profile else None,
            "residence_district": profile.residence_district if profile else None,
            "domicile_state": profile.domicile_state if profile else "Karnataka"
        } if profile else None,
        "preferences": {
            "sms_notifications": prefs.sms_notifications if prefs else True,
            "email_notifications": prefs.email_notifications if prefs else True,
            "voice_guidance_enabled": prefs.voice_guidance_enabled if prefs else False,
            "data_sharing_consent": prefs.data_sharing_consent if prefs else False
        } if prefs else None
    }

@router.put("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    update_data = req.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    return {"status": "success", "message": "Profile successfully updated."}

@router.put("/preferences")
def update_preferences(
    req: PreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prefs = current_user.preferences
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)

    update_data = req.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(prefs, key, value)

    db.commit()
    return {"status": "success", "message": "Preferences updated."}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    # To protect user privacy, return generic confirmation without revealing if email exists
    return {
        "status": "success",
        "message": "If an active account is associated with this email, instructions have been dispatched."
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"status": "success", "message": "Logged out successfully."}

