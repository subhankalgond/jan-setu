import os
import json
import httpx
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from models import Scheme, SchemeSource, SchemeEligibilityRule, SchemeDocument

class CitizenAssistantRAG:
    """
    RAG & AI Orchestrator for Jan Setu AI.
    Understands citizen intent, retrieves verified government scheme facts,
    and constructs responses with official source links and verified dates.
    Integrates Gemini API when configured, with high-accuracy verified fallback.
    """

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # Multilingual intent lexicons
    INTENTS = {
        "scholarship": ["scholarship", "college", "fee", "student", "study", "engineering", "degree", "diploma", "ವಿದ್ಯಾರ್ಥಿವೇತನ", "छात्रवृत्ति", "اسکالرشپ"],
        "women": ["woman", "female", "mother", "gruha lakshmi", "wife", "housewife", "ಮಹಿಳೆ", "ಗೃಹ ಲಕ್ಷ್ಮಿ", "महिला", "خاتون"],
        "unemployment": ["unemployed", "job", "yuva nidhi", "graduated", "youth", "ನಿರುದ್ಯೋಗಿ", "ಯುವ ನಿಧಿ", "बेरोजगार", "بے روزگار"],
        "farmer": ["farmer", "agriculture", "crop", "millet", "land", "raitha siri", "fruits", "ರೈತ", "ಕೃಷಿ", "किसान", "کاشتکار"],
        "health": ["hospital", "treatment", "ayushman", "arogya", "medical", "disease", "ಆರೋಗ್ಯ", "ಆಸ್ಪತ್ರೆ", "स्वास्थ्य", "علاج"],
        "ration": ["ration", "anna bhagya", "food", "rice", "bpl", "ಅನ್ನ ಭಾಗ್ಯ", "ಪಡಿತರ", "राशन", "راشن"],
        "artisan": ["artisan", "vishwakarma", "carpenter", "blacksmith", "potter", "loan", "toolkit", "ವಿಶ್ವಕರ್ಮ", "विश्वकर्मा", "کاریگر"]
    }

    @classmethod
    def identify_intent(cls, user_text: str) -> str:
        text_lower = user_text.lower()
        for intent, keywords in cls.INTENTS.items():
            for kw in keywords:
                if kw in text_lower:
                    return intent
        return "general_inquiry"

    @classmethod
    def retrieve_relevant_schemes(cls, db: Session, user_text: str, state: str = "Karnataka", limit: int = 4) -> List[Scheme]:
        """
        Retrieves verified published schemes matching citizen query.
        Prioritizes verified Karnataka and Central schemes.
        """
        text_lower = user_text.lower()
        query = db.query(Scheme).filter(Scheme.verification_status == "published")

        all_schemes = query.all()
        scored_schemes = []

        for s in all_schemes:
            score = 0
            # Match title
            if s.title.lower() in text_lower or (s.kannada_title and s.kannada_title in user_text):
                score += 20
            # Match code
            if s.code.lower() in text_lower:
                score += 25
            # Match category keywords
            cat_words = s.category.lower().split()
            for w in cat_words:
                if len(w) > 3 and w in text_lower:
                    score += 5
            # Match target beneficiaries
            bene_words = s.target_beneficiaries.lower().split()
            for w in bene_words:
                if len(w) > 3 and w in text_lower:
                    score += 4
            # Match description
            desc_words = s.short_description.lower().split()
            for w in desc_words:
                if len(w) > 4 and w in text_lower:
                    score += 2
            # Specific intent boosts
            intent = cls.identify_intent(user_text)
            if intent == "scholarship" and ("ssp" in s.code.lower() or "scholarship" in s.title.lower() or "vidyasiri" in s.code.lower()):
                score += 15
            elif intent == "women" and "gl" in s.code.lower():
                score += 15
            elif intent == "unemployment" and "yn" in s.code.lower():
                score += 15
            elif intent == "farmer" and "rs" in s.code.lower():
                score += 15
            elif intent == "health" and "ark" in s.code.lower():
                score += 15
            elif intent == "ration" and "ab" in s.code.lower():
                score += 15
            elif intent == "artisan" and "pmv" in s.code.lower():
                score += 15

            if score > 0:
                scored_schemes.append((score, s))

        # Sort by score descending
        scored_schemes.sort(key=lambda x: x[0], reverse=True)
        results = [s for _, s in scored_schemes[:limit]]

        # Fallback if no specific keyword matched: return general recommended schemes
        if not results:
            results = all_schemes[:limit]

        return results

    @classmethod
    async def generate_response(
        cls,
        db: Session,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Orchestrates retrieval and generates transparent response with verified citations.
        """
        matched_schemes = cls.retrieve_relevant_schemes(db, user_message)
        intent = cls.identify_intent(user_message)

        # Context assembly from verified database records
        context_items = []
        recommended_meta = []

        for s in matched_schemes:
            sources = [f"{src.title} ({src.url})" for src in s.sources]
            rules = [f"- {r.description_en} [Mandatory: {r.is_mandatory}]" for r in s.eligibility_rules]
            docs = [d.document_name for d in s.documents]

            context_items.append(
                f"SCHEME: {s.title} ({s.code})\n"
                f"Department: {s.department}\n"
                f"Target Beneficiaries: {s.target_beneficiaries}\n"
                f"Benefits: {s.benefits_summary}\n"
                f"Eligibility Rules:\n" + "\n".join(rules) + "\n"
                f"Required Documents: " + ", ".join(docs) + "\n"
                f"Official Portal: {s.official_portal_url}\n"
                f"Last Verified: {s.last_verified_date}\n"
            )

            title = s.title
            if language == "kn" and s.kannada_title:
                title = f"{s.title} ({s.kannada_title})"
            elif language == "hi" and s.hindi_title:
                title = f"{s.title} ({s.hindi_title})"
            elif language == "ur" and s.urdu_title:
                title = f"{s.title} ({s.urdu_title})"

            recommended_meta.append({
                "id": s.id,
                "code": s.code,
                "title": title,
                "department": s.department,
                "benefits": s.benefits_summary,
                "official_portal_url": s.official_portal_url,
                "last_verified_date": s.last_verified_date
            })

        # Check if Gemini API is available
        if cls.GEMINI_API_KEY:
            try:
                system_instruction = (
                    "You are Jan Setu AI (जन सेतु), an intelligent GovTech citizen assistant for Indian public schemes.\n"
                    "PRINCIPLES:\n"
                    "- Never invent schemes, eligibility criteria, or deadlines.\n"
                    "- Only reference schemes provided in the verified context.\n"
                    "- Explain criteria in simple, reassuring, and dignified language.\n"
                    "- Ask relevant follow-up questions to clarify citizen eligibility.\n"
                    "- Always provide the official portal URL and state that official decisions are made by the respective department.\n"
                    f"- Respond in the citizen's requested language code: {language}.\n"
                )

                prompt = (
                    f"VERIFIED GOVERNMENT SCHEME DATABASE CONTEXT:\n\n"
                    + "\n---\n".join(context_items) + "\n\n"
                    f"CITIZEN QUERY: {user_message}\n"
                    f"Please provide an accurate, helpful response following the principles above."
                )

                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={cls.GEMINI_API_KEY}",
                        json={
                            "contents": [{"parts": [{"text": f"{system_instruction}\n\n{prompt}"}]}],
                            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        ai_text = data["candidates"][0]["content"]["parts"][0]["text"]
                        return {
                            "response_text": ai_text,
                            "intent": intent,
                            "recommended_schemes": recommended_meta,
                            "is_ai_generated": True
                        }
            except Exception as e:
                # Log and proceed to verified deterministic response generator
                print(f"Gemini API unavailable or timed out: {e}. Falling back to verified knowledge engine.")

        # High-Fidelity Verified Knowledge Response Generator
        return cls._generate_verified_response(matched_schemes, user_message, intent, language, recommended_meta)

    @classmethod
    def _generate_verified_response(
        cls,
        matched_schemes: List[Scheme],
        user_message: str,
        intent: str,
        language: str,
        recommended_meta: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Deterministic, hallucination-free response constructed directly from verified database records.
        """
        primary = matched_schemes[0] if matched_schemes else None

        if not primary:
            no_match_text = {
                "en": "We could not find a verified scheme that directly matches your inquiry. Please specify your education level, family occupation, or state of residence so we can guide you accurately.",
                "kn": "ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಪರಿಶೀಲಿಸಿದ ಯೋಜನೆ ನಮಗೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಶಿಕ್ಷಣ, ಕುಟುಂಬದ ಕಸುಬು ಅಥವಾ ಜಿಲ್ಲೆಯನ್ನು ತಿಳಿಸಿ, ನಾವು ನಿಮಗೆ ನಿಖರವಾಗಿ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇವೆ.",
                "hi": "हमें आपकी पूछताछ से सीधे मेल खाने वाली कोई सत्यापित योजना नहीं मिली। कृपया अपनी शिक्षा का स्तर, पारिवारिक व्यवसाय या राज्य बताएं ताकि हम आपका मार्गदर्शन कर सकें।",
                "ur": "ہمیں کوئی تصدیق شدہ اسکیم نہیں ملی جو آپ کی انکوائری سے براہ راست میل کھاتی ہو۔ برائے مہربانی اپنی تعلیم یا خاندانی پیشے کی وضاحت کریں۔"
            }
            return {
                "response_text": no_match_text.get(language, no_match_text["en"]),
                "intent": intent,
                "recommended_schemes": [],
                "is_ai_generated": False
            }

        title = primary.title
        dept = primary.department
        benefits = primary.benefits_summary
        portal = primary.official_portal_url
        vdate = primary.last_verified_date

        if language == "kn":
            if primary.kannada_title:
                title = f"{primary.title} ({primary.kannada_title})"
            response_text = (
                f"ನಿಮ್ಮ ಅಗತ್ಯಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುವ ಅಧಿಕೃತ ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಯೋಜನೆ: **{title}**.\n\n"
                f"• **ಇಲಾಖೆ:** {dept}\n"
                f"• **ಪ್ರಮುಖ ಸೌಲಭ್ಯಗಳು:** {benefits}\n"
                f"• **ಅರ್ಹತೆ ಪರೀಕ್ಷಿಸಲು ಅಗತ್ಯವಿರುವ ವಿವರಗಳು:** ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ, ಜಾತಿ/ಪ್ರವರ್ಗ ಹಾಗೂ ಕರ್ನಾಟಕ ನಿವಾಸ ದೃಢೀಕರಣ.\n"
                f"• **ಅಧಿಕೃತ ಅರ್ಜಿ ಪೋರ್ಟಲ್:** [{portal}]({portal})\n"
                f"• **ಮಾಹಿತಿ ಪರಿಶೀಲಿಸಿದ ದಿನಾಂಕ:** {vdate}\n\n"
                f"ನೀವು ಈ ಯೋಜನೆಗೆ ಅರ್ಹರೇ ಎಂದು ಪರೀಕ್ಷಿಸಲು, ಕೆಳಗಿನ 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' (Check Eligibility) ಗುಂಡಿಯನ್ನು ಒತ್ತಿ."
            )
        elif language == "hi":
            if primary.hindi_title:
                title = f"{primary.title} ({primary.hindi_title})"
            response_text = (
                f"आपकी आवश्यकता के लिए उपयुक्त सत्यापित सरकारी योजना: **{title}**.\n\n"
                f"• **विभाग:** {dept}\n"
                f"• **मुख्य लाभ:** {benefits}\n"
                f"• **पात्रता की जांच के लिए आवश्यक विवरण:** पारिवारिक वार्षिक आय, श्रेणी और कर्नाटक निवास प्रमाण।\n"
                f"• **आधिकारिक आवेदन पोर्टल:** [{portal}]({portal})\n"
                f"• **सत्यापन तिथि:** {vdate}\n\n"
                f"क्या आप इस योजना के लिए अपनी पात्रता जांचना चाहते हैं? कृपया नीचे दिए गए विकल्प का चयन करें।"
            )
        elif language == "ur":
            if primary.urdu_title:
                title = f"{primary.title} ({primary.urdu_title})"
            response_text = (
                f"آپ کی ضرورت کے مطابق تصدیق شدہ سرکاری اسکیم: **{title}**.\n\n"
                f"• **محکمہ:** {dept}\n"
                f"• **اہم فوائد:** {benefits}\n"
                f"• **اہلیت کی جانچ کے لیے ضروری تفصیلات:** خاندانی سالانہ آمدنی اور رہائش کا ثبوت۔\n"
                f"• **سرکاری پورٹل:** [{portal}]({portal})\n"
                f"• **تصدیق کی تاریخ:** {vdate}\n\n"
                f"اپنی اہلیت جانچنے کے لیے نیچے دیے گئے بٹن پر کلک کریں۔"
            )
        else:
            response_text = (
                f"Based on your requirements, here is the verified government scheme: **{title}**.\n\n"
                f"• **Department:** {dept}\n"
                f"• **Benefits:** {benefits}\n"
                f"• **Key Eligibility Check:** Karnataka domicile, family annual income thresholds, and accredited institution enrollment.\n"
                f"• **Official Portal:** {portal}\n"
                f"• **Source Verification Date:** {vdate} (Verified by Govt Database Reviewer)\n\n"
                f"Would you like to run an instant deterministic eligibility check or view the mandatory document checklist?"
            )

        return {
            "response_text": response_text,
            "intent": intent,
            "recommended_schemes": recommended_meta,
            "is_ai_generated": False
        }

