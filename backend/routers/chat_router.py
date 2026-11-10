from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
import uuid
from database import get_db
from models import Conversation, ConversationMessage, User
from auth import security_bearer, decode_access_token
from rag_engine import CitizenAssistantRAG

router = APIRouter(prefix="/api/chat", tags=["Citizen Assistant"])

class ChatMessageRequest(BaseModel):
    message: str
    session_token: Optional[str] = None
    language: str = "en"  # 'en', 'kn', 'hi', 'ur'

@router.post("/message")
async def send_chat_message(
    req: ChatMessageRequest,
    credentials = Depends(security_bearer),
    db: Session = Depends(get_db)
):
    if not req.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be blank."
        )

    user_id = None
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload:
            user_id = payload.get("sub")

    session_token = req.session_token or str(uuid.uuid4())

    # Find or create conversation
    conv = db.query(Conversation).filter(
        (Conversation.session_token == session_token) |
        (Conversation.user_id == user_id if user_id else False)
    ).order_by(Conversation.created_at.desc()).first()

    if not conv:
        conv = Conversation(
            user_id=user_id,
            session_token=session_token,
            preferred_language=req.language
        )
        db.add(conv)
        db.flush()

    # Save user message
    user_msg = ConversationMessage(
        conversation_id=conv.id,
        sender="user",
        message_text=req.message.strip()
    )
    db.add(user_msg)
    db.flush()

    # Fetch last 6 messages for context
    past_messages = (
        db.query(ConversationMessage)
        .filter(ConversationMessage.conversation_id == conv.id)
        .order_by(ConversationMessage.created_at.asc())
        .limit(6)
        .all()
    )
    history = [{"sender": m.sender, "text": m.message_text} for m in past_messages]

    # Call CitizenAssistantRAG
    rag_result = await CitizenAssistantRAG.generate_response(
        db=db,
        user_message=req.message,
        conversation_history=history,
        language=req.language
    )

    # Save assistant message
    asst_msg = ConversationMessage(
        conversation_id=conv.id,
        sender="assistant",
        message_text=rag_result["response_text"],
        intent=rag_result.get("intent"),
        recommended_scheme_ids=[s["id"] for s in rag_result.get("recommended_schemes", [])]
    )
    db.add(asst_msg)
    db.commit()

    return {
        "conversation_id": conv.id,
        "session_token": session_token,
        "response_text": rag_result["response_text"],
        "intent": rag_result.get("intent"),
        "recommended_schemes": rag_result.get("recommended_schemes", []),
        "is_ai_generated": rag_result.get("is_ai_generated", False)
    }

@router.get("/history")
def get_chat_history(
    session_token: Optional[str] = None,
    credentials = Depends(security_bearer),
    db: Session = Depends(get_db)
):
    user_id = None
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload:
            user_id = payload.get("sub")

    query = db.query(Conversation)
    if user_id:
        query = query.filter(Conversation.user_id == user_id)
    elif session_token:
        query = query.filter(Conversation.session_token == session_token)
    else:
        return {"messages": []}

    conv = query.order_by(Conversation.created_at.desc()).first()
    if not conv:
        return {"messages": []}

    messages = (
        db.query(ConversationMessage)
        .filter(ConversationMessage.conversation_id == conv.id)
        .order_by(ConversationMessage.created_at.asc())
        .all()
    )

    return {
        "conversation_id": conv.id,
        "messages": [
            {
                "id": m.id,
                "sender": m.sender,
                "message_text": m.message_text,
                "intent": m.intent,
                "created_at": m.created_at.isoformat()
            }
            for m in messages
        ]
    }

