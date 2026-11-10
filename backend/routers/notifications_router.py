from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from database import get_db
from models import User, Notification, Reminder
from auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications & Reminders"])

class CreateReminderRequest(BaseModel):
    title: str
    due_date: str

@router.get("")
def list_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )

    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "link": n.link,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat()
        }
        for n in notifs
    ]

@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if notif:
        notif.is_read = True
        db.commit()

    return {"status": "success"}

@router.get("/reminders")
def list_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rems = (
        db.query(Reminder)
        .filter(Reminder.user_id == current_user.id)
        .order_by(Reminder.due_date.asc())
        .all()
    )
    return [
        {
            "id": r.id,
            "title": r.title,
            "due_date": r.due_date,
            "is_completed": r.is_completed,
            "created_at": r.created_at.isoformat()
        }
        for r in rems
    ]

@router.post("/reminders")
def create_reminder(
    req: CreateReminderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rem = Reminder(
        user_id=current_user.id,
        title=req.title.strip(),
        due_date=req.due_date.strip(),
        is_completed=False
    )
    db.add(rem)
    db.commit()
    return {"status": "success", "id": rem.id, "title": rem.title, "due_date": rem.due_date}

@router.patch("/reminders/{reminder_id}/toggle")
def toggle_reminder(
    reminder_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rem = db.query(Reminder).filter(
        Reminder.id == reminder_id,
        Reminder.user_id == current_user.id
    ).first()

    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    rem.is_completed = not rem.is_completed
    db.commit()
    return {"status": "success", "is_completed": rem.is_completed}

