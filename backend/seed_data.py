from datetime import datetime
from database import SessionLocal, engine, Base
from models import (
    Scheme, SchemeSource, SchemeEligibilityRule, SchemeDocument,
    SchemeCategory, User, UserProfile, UserPreferences, AdminAuditLog
)
from auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Scheme).first():
            print("Database already contains schemes. Skipping seed.")
            return

        print("Seeding initial authentic Karnataka and Central government schemes...")

        # 1. Create Default Admin and Citizen Accounts
        admin_user = User(
            email="admin@jansetu.gov.in",
            password_hash=hash_password("JanSetuAdmin@2026"),
            role="admin",
            full_name="Dr. Raghavendra Rao",
            phone="+91 80 2203 2000",
            state="Karnataka",
            preferred_language="en",
            is_active=True
        )
        db.add(admin_user)
        db.flush()

        # Seed initial audit log
        audit = AdminAuditLog(
            admin_id=admin_user.id,
            admin_email=admin_user.email,
            action="system_seed",
            resource_type="system",
            resource_id="init",
            details={"message": "Initial government scheme catalogue seeded with verified Karnataka & Central schemes."}
        )
        db.add(audit)

        demo_citizen = User(
            email="citizen@jansetu.in",
            password_hash=hash_password("CitizenPass@2026"),
            role="citizen",
            full_name="Pooja Ramesh Patil",
            phone="+91 98450 12345",
            state="Karnataka",
            preferred_language="en",
            is_active=True
        )
        db.add(demo_citizen)
        db.flush()

        demo_profile = UserProfile(
            user_id=demo_citizen.id,
            age=21,
            gender="Female",
            occupation="Student",
            annual_income=120000.0,
            caste_category="OBC",
            is_student=True,
            education_level="Undergraduate",
            disability_status=False,
            land_holding_acres=0.0,
            ration_card_type="BPL",
            residence_district="Dharwad",
            domicile_state="Karnataka"
        )
        db.add(demo_profile)

        demo_prefs = UserPreferences(
            user_id=demo_citizen.id,
            sms_notifications=True,
            email_notifications=True,
            voice_guidance_enabled=False,
            data_sharing_consent=True
        )
        db.add(demo_prefs)

        # 2. Scheme Categories
        categories = [
            SchemeCategory(slug="education", name="Education & Scholarships", description="Financial assistance, fee reimbursement, and hostel support for students"),
            SchemeCategory(slug="women-child", name="Women & Child Welfare", description="Empowerment, financial support, nutrition and safety initiatives"),
            SchemeCategory(slug="employment-skills", name="Employment & Livelihood", description="Unemployment assistance, skill training and placement support"),
            SchemeCategory(slug="agriculture", name="Agriculture & Farmers", description="Input subsidies, crop incentives and irrigation support"),
            SchemeCategory(slug="healthcare", name="Health & Medical Care", description="Health insurance coverage and cashless medical treatments"),
            SchemeCategory(slug="food-security", name="Food Security & Civil Supplies", description="Ration cards, subsidized food grains, and nutrition DBT"),
            SchemeCategory(slug="artisans-msme", name="Artisans & Small Business", description="Collateral-free credit, toolkit incentives, and skill upgrades")
        ]
        db.add_all(categories)
        db.flush()

        # 3. Verified Government Schemes
        schemes_data = [
            {
                "code": "KA-SSP-01",
                "title": "SSP Post-Matric Scholarship",
                "kannada_title": "ಎಸ್.ಎಸ್.ಪಿ ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನ",
                "hindi_title": "एसएसपी पोस्ट-मैट्रिक छात्रवृत्ति",
                "urdu_title": "ایس ایس پی پوسٹ میٹرک اسکالرشپ",
                "short_description": "Comprehensive fee reimbursement and maintenance allowance for post-matric students across Karnataka.",
                "detailed_description": "The State Scholarship Portal (SSP) provides seamless, transparent financial assistance directly into bank accounts of eligible Karnataka students pursuing post-matric courses (PUC, Diploma, Degree, Engineering, Medical, and Post-Graduation) across Social Welfare, Tribal Welfare, Minorities, and Backward Classes departments.",
                "department": "Social Welfare & Backward Classes Welfare Dept, Govt of Karnataka",
                "government_level": "karnataka",
                "state": "Karnataka",
                "category": "Education & Scholarships",
                "target_beneficiaries": "Post-Matric Students (SC / ST / OBC / Minorities / General EWS)",
                "benefits_summary": "100% course fee reimbursement, tuition fees, examination fees, and monthly maintenance allowance credited via Aadhaar DBT directly to the student's bank account.",
                "application_process": "1. Student registers on SSP portal using Aadhaar number and Student E-Attestation (SATS ID).\n2. Uploads caste and income certificates verified by Nadakacheri RD numbers.\n3. Enters college admission and fee details.\n4. Institute verifies documents online.\n5. Department sanctions scholarship directly via DBT.",
                "official_portal_url": "https://ssp.postmatric.karnataka.gov.in/",
                "verification_status": "published",
                "last_verified_date": "2026-10-15",
                "verified_by_admin": "Dr. Raghavendra Rao",
                "sources": [
                    {
                        "title": "Official Karnataka SSP Portal Guidelines",
                        "url": "https://ssp.postmatric.karnataka.gov.in/",
                        "document_reference": "SSP-GOV-KA-CIRCULAR-2025-26",
                        "last_verified_at": "2026-10-15"
                    }
                ],
                "rules": [
                    {"code": "SSP-R1", "field": "domicile_state", "op": "eq", "target": "Karnataka", "desc_en": "Applicant must be a permanent resident of Karnataka.", "desc_kn": "ಅರ್ಜಿದಾರರು ಕರ್ನಾಟಕದ ಕಾಯಂ ನಿವಾಸಿಯಾಗಿರಬೇಕು.", "desc_hi": "आवेदक कर्नाटक का स्थायी निवासी होना चाहिए।", "desc_ur": "درخواست دہندہ کا کرناٹک کا مستقل رہائشی ہونا ضروری ہے۔", "mandatory": True},
                    {"code": "SSP-R2", "field": "is_student", "op": "bool_true", "target": "true", "desc_en": "Must be currently enrolled in an accredited post-matric institution.", "desc_kn": "ಅರ್ಜಿದಾರರು ಮಾನ್ಯತೆ ಪಡೆದ ಪೋಸ್ಟ್-ಮೆಟ್ರಿಕ್ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಯಲ್ಲಿ ವ್ಯಾಸಂಗ ಮಾಡುತ್ತಿರಬೇಕು.", "desc_hi": "मान्यता प्राप्त पोस्ट-मैट्रिक संस्थान में नामांकित होना चाहिए।", "desc_ur": "لازمی طور پر منظور شدہ تعلیمی ادارے میں زیر تعلیم ہوں۔", "mandatory": True},
                    {"code": "SSP-R3", "field": "annual_income", "op": "lte", "target": "250000", "desc_en": "Family annual income must not exceed ₹2,50,000 (relaxed for specific categories).", "desc_kn": "ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ ₹2,50,000 ಮೀರಿರಬಾರದು.", "desc_hi": "पारिवारिक वार्षिक आय ₹2,50,000 से अधिक नहीं होनी चाहिए।", "desc_ur": "خاندانی سالانہ آمدنی ڈھائی لاکھ روپے سے زیادہ نہیں ہونی چاہیے۔", "mandatory": True}
                ],
                "documents": [
                    {"code": "caste_income_cert", "name": "Caste & Income Certificate (Nadakacheri RD Number)", "name_kn": "ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ", "mandatory": True, "guidelines": "Must have valid 11-digit Nadakacheri RD number."},
                    {"code": "sslc_marksheet", "name": "SSLC / 10th Marks Card", "name_kn": "ಎಸ್ಸೆಸ್ಸೆಲ್ಸಿ ಅಂಕಪಟ್ಟಿ", "mandatory": True, "guidelines": "Clear scan showing student registration number."},
                    {"code": "college_receipt", "name": "Current Academic Year College Fee Receipt", "name_kn": "ಕಾಲೇಜು ಶುಲ್ಕ ಪಾವತಿ ರಶೀದಿ", "mandatory": True, "guidelines": "Showing paid tuition fees with official seal."},
                    {"code": "bank_passbook", "name": "Aadhaar Seeded Bank Passbook", "name_kn": "ಆಧಾರ್ ಲಿಂಕ್ ಆದ ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್", "mandatory": True, "guidelines": "Account must be active and NPCI mapped."}
                ]
            },
            {
                "code": "KA-GL-02",
                "title": "Gruha Lakshmi Scheme",
                "kannada_title": "ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ",
                "hindi_title": "गृह लक्ष्मी योजना",
                "urdu_title": "گرہ لکشمی اسکیم",
                "short_description": "Guaranteed ₹2,000 monthly direct financial assistance to the woman head of household in Karnataka.",
                "detailed_description": "Gruha Lakshmi is one of Karnataka's flagship guarantee schemes empowering women. It delivers ₹2,000 every month directly to the verified bank account of the woman designated as the head of the family on Antyodaya (AAY), BPL, or APL ration cards.",
                "department": "Department of Women and Child Development, Govt of Karnataka",
                "government_level": "karnataka",
                "state": "Karnataka",
                "category": "Women & Child Welfare",
                "target_beneficiaries": "Female heads of family residing in Karnataka",
                "benefits_summary": "Direct benefit transfer (DBT) of ₹2,000 per month deposited directly into the beneficiary's bank account every month.",
                "application_process": "1. Verify name on family Ration Card as the designated woman head.\n2. Submit application online at Seva Sindhu or visit Karnataka One / Grama One centers.\n3. Provide Aadhaar number and OTP authentication.\n4. Automatic DBT activation to Aadhaar-seeded bank account.",
                "official_portal_url": "https://sevasindhuservices.karnataka.gov.in/",
                "verification_status": "published",
                "last_verified_date": "2026-10-20",
                "verified_by_admin": "Dr. Raghavendra Rao",
                "sources": [
                    {
                        "title": "Seva Sindhu Guarantee Portal",
                        "url": "https://sevasindhuservices.karnataka.gov.in/",
                        "document_reference": "KA-WCD-GL-RULES-2023",
                        "last_verified_at": "2026-10-20"
                    }
                ],
                "rules": [
                    {"code": "GL-R1", "field": "gender", "op": "eq", "target": "Female", "desc_en": "Beneficiary must be female (designated woman head of family).", "desc_kn": "ಫಲಾನುಭವಿಯು ಮಹಿಳೆಯಾಗಿರಬೇಕು (ಕುಟುಂಬದ ಯಜಮಾನಿ).", "desc_hi": "लाभार्थी महिला होनी चाहिए (परिवार की मुखिया)।", "desc_ur": "فائدہ اٹھانے والی خاتون ہونی چاہیے (خاندان کی خاتون سربراہ)۔", "mandatory": True},
                    {"code": "GL-R2", "field": "domicile_state", "op": "eq", "target": "Karnataka", "desc_en": "Must be a resident of Karnataka.", "desc_kn": "ಕರ್ನಾಟಕದ ನಿವಾಸಿಯಾಗಿರಬೇಕು.", "desc_hi": "कर्नाटक का निवासी होना चाहिए।", "desc_ur": "کرناٹک کا رہائشی ہونا ضروری ہے۔", "mandatory": True},
                    {"code": "GL-R3", "field": "ration_card_type", "op": "in", "target": "BPL,AAY,APL", "desc_en": "Must possess a valid BPL, AAY, or APL Ration Card issued by Food & Civil Supplies Dept.", "desc_kn": "ಆಹಾರ ಇಲಾಖೆ ನೀಡಿರುವ ಬಿಪಿಎಲ್, ಎಎವೈ ಅಥವಾ ಎಪಿಎಲ್ ಪಡಿತರ ಚೀಟಿ ಹೊಂದಿರಬೇಕು.", "desc_hi": "वैध बीपीएल, एएवाई या एपीएल राशन कार्ड होना चाहिए।", "desc_ur": "بی پی ایل، اے اے وائی یا اے پی ایل راشن کارڈ ہونا ضروری ہے۔", "mandatory": True}
                ],
                "documents": [
                    {"code": "ration_card", "name": "Karnataka Ration Card (BPL/AAY/APL)", "name_kn": "ಪಡಿತರ ಚೀಟಿ", "mandatory": True, "guidelines": "Name must be listed as woman head of family."},
                    {"code": "aadhaar_card", "name": "Aadhaar Card of Woman Head", "name_kn": "ಆಧಾರ್ ಕಾರ್ಡ್", "mandatory": True, "guidelines": "Linked with active mobile number for OTP verification."},
                    {"code": "bank_passbook", "name": "Aadhaar Linked Bank Passbook", "name_kn": "ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್", "mandatory": True, "guidelines": "Direct Benefit Transfer (DBT) enabled account."}
                ]
            },
            {
                "code": "KA-YN-03",
                "title": "Yuva Nidhi Scheme",
                "kannada_title": "ಯುವ ನಿಧಿ ಯೋಜನೆ",
                "hindi_title": "युवा निधि योजना",
                "urdu_title": "یوا ندھی اسکیم",
                "short_description": "Monthly allowance of ₹3,000 for unemployed graduates and ₹1,500 for diploma holders for up to 2 years.",
                "detailed_description": "Yuva Nidhi provides temporary financial security and skill development support to educated youth of Karnataka who have graduated or passed diploma courses and remain unemployed after 180 days of graduation.",
                "department": "Department of Skill Development, Entrepreneurship and Livelihood, Govt of Karnataka",
                "government_level": "karnataka",
                "state": "Karnataka",
                "category": "Employment & Livelihood",
                "target_beneficiaries": "Unemployed Graduates and Diploma Holders in Karnataka",
                "benefits_summary": "₹3,000 monthly allowance for degree holders; ₹1,500 monthly allowance for diploma holders for up to 24 months or until securing employment/higher studies.",
                "application_process": "1. Ensure minimum 180 days have passed since degree/diploma completion.\n2. Apply online through Seva Sindhu or Grama One / Karnataka One center.\n3. Submit graduation credentials, Aadhaar and self-declaration of unemployment.\n4. Complete monthly self-declaration to continue receiving DBT.",
                "official_portal_url": "https://sevasindhuservices.karnataka.gov.in/",
                "verification_status": "published",
                "last_verified_date": "2026-10-22",
                "verified_by_admin": "Dr. Raghavendra Rao",
                "sources": [
                    {
                        "title": "Yuva Nidhi Seva Sindhu Portal",
                        "url": "https://sevasindhuservices.karnataka.gov.in/",
                        "document_reference": "KA-SDEL-YN-GUIDELINES-2024",
                        "last_verified_at": "2026-10-22"
                    }
                ],
                "rules": [
                    {"code": "YN-R1", "field": "domicile_state", "op": "eq", "target": "Karnataka", "desc_en": "Must be a resident of Karnataka with at least 6 years of education in Karnataka.", "desc_kn": "ಕರ್ನಾಟಕದ ನಿವಾಸಿಯಾಗಿದ್ದು ಕನಿಷ್ಠ 6 ವರ್ಷ ಕರ್ನಾಟಕದಲ್ಲಿ ವ್ಯಾಸಂಗ ಮಾಡಿರಬೇಕು.", "desc_hi": "कर्नाटक का निवासी होना चाहिए (कम से कम 6 साल की शिक्षा कर्नाटक में)।", "desc_ur": "کرناٹک میں کم از کم 6 سال کی تعلیم کے ساتھ رہائشی ہونا ضروری ہے۔", "mandatory": True},
                    {"code": "YN-R2", "field": "occupation", "op": "eq", "target": "Unemployed", "desc_en": "Must be actively unemployed and not pursuing higher education.", "desc_kn": "ನಿರುದ್ಯೋಗಿಯಾಗಿರಬೇಕು ಮತ್ತು ಉನ್ನತ ಶಿಕ್ಷಣ ಮುಂದುವರಿಸುತ್ತಿರಬಾರದು.", "desc_hi": "बेरोजगार होना चाहिए और उच्च शिक्षा जारी नहीं रख रहा हो।", "desc_ur": "بے روزگار ہونا چاہیے اور اعلیٰ تعلیم جاری نہ رکھی ہو۔", "mandatory": True},
                    {"code": "YN-R3", "field": "education_level", "op": "in", "target": "Diploma,Undergraduate,Postgraduate", "desc_en": "Must hold a recognized Degree or Diploma qualification.", "desc_kn": "ಮಾನ್ಯತೆ ಪಡೆದ ಪದವಿ ಅಥವಾ ಡಿಪ್ಲೊಮಾ ಪಡೆದಿರಬೇಕು.", "desc_hi": "मान्यता प्राप्त डिग्री या डिप्लोमा होना चाहिए।", "desc_ur": "تسلیم شدہ ڈگری یا ڈپلومہ ہونا لازمی ہے۔", "mandatory": True}
                ],
                "documents": [
                    {"code": "degree_diploma_marksheet", "name": "Degree / Diploma Completion Certificate or Final Marksheet", "name_kn": "ಪದವಿ / ಡಿಪ್ಲೊಮಾ ಪ್ರಮಾಣಪತ್ರ", "mandatory": True, "guidelines": "Showing month and year of passing."},
                    {"code": "study_certificate", "name": "Domicile / 6-Year Study Certificate in Karnataka", "name_kn": "ಕರ್ನಾಟಕದಲ್ಲಿ 6 ವರ್ಷ ವ್ಯಾಸಂಗ ಪ್ರಮಾಣಪತ್ರ", "mandatory": True, "guidelines": "Issued by recognized school/college or BEO."},
                    {"code": "unemployment_declaration", "name": "Self-Declaration of Unemployment", "name_kn": "ನಿರುದ್ಯೋಗ ಸ್ವಯಂ ಘೋಷಣೆ", "mandatory": True, "guidelines": "Submitted digitally during application."}
                ]
            },
            {
                "code": "KA-RS-04",
                "title": "Raitha Siri & PM-KISAN (Karnataka Component)",
                "kannada_title": "ರೈತ ಸಿರಿ ಮತ್ತು ಪಿಎಂ-ಕಿಸಾನ್ ಯೋಜನೆ",
                "hindi_title": "रैथा सिरी एवं पीएम-किसान",
                "urdu_title": "رائتھا سری اور پی ایم کسان",
                "short_description": "Financial input assistance of ₹10,000 per hectare for millet and food grain farmers across Karnataka.",
                "detailed_description": "Raitha Siri promotes sustainable agriculture by granting financial assistance of ₹10,000 per hectare directly into the farmer's bank account for cultivating minor millets (Siri Dhanya). Integrates seamlessly with the FRUITS database and PM-KISAN.",
                "department": "Department of Agriculture, Govt of Karnataka",
                "government_level": "karnataka",
                "state": "Karnataka",
                "category": "Agriculture & Farmers",
                "target_beneficiaries": "Small and Marginal Farmers in Karnataka",
                "benefits_summary": "Direct transfer of ₹10,000 per hectare for minor millet cultivation up to a maximum of 2 hectares.",
                "application_process": "1. Register land and crop details on the Karnataka FRUITS portal (fruits.karnataka.gov.in).\n2. Obtain Farmer Registration Identification (FID).\n3. Field verification by the Village Agriculture Officer / Raitha Samparka Kendra.\n4. Direct DBT payment to the registered bank account.",
                "official_portal_url": "https://fruits.karnataka.gov.in/",
                "verification_status": "published",
                "last_verified_date": "2026-10-18",
                "verified_by_admin": "Dr. Raghavendra Rao",
                "sources": [
                    {
                        "title": "Karnataka FRUITS Agricultural Portal",
                        "url": "https://fruits.karnataka.gov.in/",
                        "document_reference": "KA-AGRI-RS-2024-25",
                        "last_verified_at": "2026-10-18"
                    }
                ],
                "rules": [
                    {"code": "RS-R1", "field": "occupation", "op": "eq", "target": "Farmer", "desc_en": "Must be an active cultivator/farmer in Karnataka.", "desc_kn": "ಕರ್ನಾಟಕದ ರೈತ ಅಥವಾ ಕೃಷಿಕರಾಗಿರಬೇಕು.", "desc_hi": "कर्नाटक में किसान होना चाहिए।", "desc_ur": "کرناٹک میں کاشتکار یا کسان ہونا چاہیے۔", "mandatory": True},
                    {"code": "RS-R2", "field": "land_holding_acres", "op": "gte", "target": "0.1", "desc_en": "Must possess cultivable agricultural land registered in RTC/Pahani.", "desc_kn": "ಆರ್‌ಟಿಸಿ/ಪಹಣಿ ದಾಖಲೆಯಲ್ಲಿ ಕೃಷಿ ಭೂಮಿ ಹೊಂದಿರಬೇಕು.", "desc_hi": "आरटीसी में पंजीकृत कृषि योग्य भूमि होनी चाहिए।", "desc_ur": "زرعی زمین کی ملکیت ہونی چاہیے۔", "mandatory": True},
                    {"code": "RS-R3", "field": "domicile_state", "op": "eq", "target": "Karnataka", "desc_en": "Land and residence must be within Karnataka.", "desc_kn": "ಜಮೀನು ಮತ್ತು ವಾಸಸ್ಥಳ ಕರ್ನಾಟಕದಲ್ಲಿರಬೇಕು.", "desc_hi": "भूमि और निवास कर्नाटक में होना चाहिए।", "desc_ur": "زمین اور رہائش کرناٹک میں ہونی چاہیے۔", "mandatory": True}
                ],
                "documents": [
                    {"code": "rtc_pahani", "name": "Current Year Land Record / RTC Pahani", "name_kn": "ಜಮೀನಿನ ಪಹಣಿ / ಆರ್‌ಟಿಸಿ", "mandatory": True, "guidelines": "Must reflect current owner name and crop survey."},
                    {"code": "fruits_fid", "name": "FRUITS Identification Number (FID)", "name_kn": "ಫ್ರೂಟ್ಸ್ ಐಡಿ (FID)", "mandatory": True, "guidelines": "Issued by Agriculture Dept Raitha Samparka Kendra."},
                    {"code": "bank_passbook", "name": "Aadhaar Seeded Bank Account", "name_kn": "ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ", "mandatory": True, "guidelines": "Linked to Aadhaar for DBT."}
                ]
            },
            {
                "code": "KA-ABAK-05",
                "title": "Ayushman Bharat - Arogya Karnataka",
                "kannada_title": "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ - ಆರೋಗ್ಯ ಕರ್ನಾಟಕ",
                "hindi_title": "आयुष्मान भारत - आरोग्य कर्नाटक",
                "urdu_title": "آیوشمان بھارت - آروگیہ کرناٹک",
                "short_description": "Cashless hospitalization coverage up to ₹5,00,000 per family per year for secondary and tertiary care.",
                "detailed_description": "A co-branded health assurance scheme providing universal health coverage. Eligible BPL families receive cashless treatment up to ₹5 Lakh annually for specified secondary and tertiary complex medical conditions across empaneled public and private hospitals.",
                "department": "Department of Health and Family Welfare, Govt of Karnataka",
                "government_level": "karnataka",
                "state": "Karnataka",
                "category": "Health & Medical Care",
                "target_beneficiaries": "BPL, AAY, and APL families in Karnataka",
                "benefits_summary": "100% cashless hospitalization up to ₹5,00,000 per family per year for BPL/AAY cardholders across 1,650+ surgical and medical procedures.",
                "application_process": "1. Visit the nearest Public Health Center, Taluk Hospital, or District Hospital.\n2. Present Ration Card and Aadhaar card at the Arogya Karnataka helpdesk.\n3. Helpdesk issues the Ayushman Golden Card / Patient ID.\n4. Avail direct cashless treatment or get referral to empanelled super-specialty hospital.",
                "official_portal_url": "https://arogya.karnataka.gov.in/",
                "verification_status": "published",
                "last_verified_date": "2026-10-25",
                "verified_by_admin": "Dr. Raghavendra Rao",
                "sources": [
                    {
                        "title": "Suvarna Arogya Suraksha Trust Official Portal",
                        "url": "https://arogya.karnataka.gov.in/",
                        "document_reference": "SAST-AB-ARK-2025",
                        "last_verified_at": "2026-10-25"
                    }
                ],
                "rules": [
                    {"code": "ARK-R1", "field": "domicile_state", "op": "eq", "target": "Karnataka", "desc_en": "Must be a permanent resident of Karnataka.", "desc_kn": "ಕರ್ನಾಟಕದ ಕಾಯಂ ನಿವಾಸಿಯಾಗಿರಬೇಕು.", "desc_hi": "कर्नाटक का स्थायी निवासी होना चाहिए।", "desc_ur": "کرناٹک کا مستقل رہائشی ہونا ضروری ہے۔", "mandatory": True},
                    {"code": "ARK-R2", "field": "ration_card_type", "op": "in", "target": "BPL,AAY,APL", "desc_en": "Must have an eligible Ration card (BPL/AAY gets 100% free treatment).", "desc_kn": "ಅರ್ಹ ಪಡಿತರ ಚೀಟಿ ಹೊಂದಿರಬೇಕು (ಬಿಪಿಎಲ್/ಎಎವೈ ಕಾರ್ಡ್‌ದಾರರಿಗೆ ಶೇ 100ರಷ್ಟು ಉಚಿತ ಚಿಕಿತ್ಸೆ).", "desc_hi": "बीपीएल/एएवाई/एपीएल राशन कार्ड होना चाहिए।", "desc_ur": "بی پی ایل یا اے اے وائی یا اے پی ایل راشن کارڈ ہونا ضروری ہے۔", "mandatory": True}
                ],
                "documents": [
                    {"code": "ration_card", "name": "Valid Karnataka Ration Card (BPL/AAY/APL)", "name_kn": "ಪಡಿತರ ಚೀಟಿ", "mandatory": True, "guidelines": "Original card required for biometric verification."},
                    {"code": "aadhaar_card", "name": "Aadhaar Card of the Patient", "name_kn": "ರೋಗಿಯ ಆಧಾರ್ ಕಾರ್ಡ್", "mandatory": True, "guidelines": "Used to generate Ayushman Bharat Health Account (ABHA)."}
                ]
            },
            {
                "code": "KA-VS-06",
                "title": "Vidyasiri - Food & Accommodation Scheme",
                "kannada_title": "ವಿದ್ಯಾಸಿರಿ - ಊಟ ಮತ್ತು ವಸತಿ ಯೋಜನೆ",
                "hindi_title": "विद्यासिरी - भोजन एवं आवास सहायता",
                "urdu_title": "ودیاسری - خوراک اور رہائش اسکیم",
                "short_description": "₹1,500 monthly stipend for 10 months for backward classes students unable to get hostel accommodation.",
                "detailed_description": "Vidyasiri provides financial support for food and accommodation to post-matric students belonging to Backward Classes (Cat-1, 2A, 2B, 3A, 3B) who reside more than 5km away from their educational institution and could not secure department hostel accommodation.",
                "department": "Backward Classes Welfare Department, Govt of Karnataka",
                "government_level": "karnataka",
                "state": "Karnataka",
                "category": "Education & Scholarships",
                "target_beneficiaries": "OBC Post-Matric Students without hostel admission",
                "benefits_summary": "Monthly stipend of ₹1,500 deposited directly into student's bank account for 10 academic months (Total ₹15,000 per academic year).",
                "application_process": "1. Apply online on BCWD / SSP portal during announced scholarship cycle.\n2. Submit RD number of Caste & Income Certificate.\n3. Enter college admission details and declare non-admission in departmental hostels.\n4. Principal verification followed by Taluk Officer sanction.",
                "official_portal_url": "https://bcwd.karnataka.gov.in/",
                "verification_status": "published",
                "last_verified_date": "2026-10-12",
                "verified_by_admin": "Dr. Raghavendra Rao",
                "sources": [
                    {
                        "title": "BCWD Karnataka Official Portal",
                        "url": "https://bcwd.karnataka.gov.in/",
                        "document_reference": "BCWD-VS-SCHEME-2025",
                        "last_verified_at": "2026-10-12"
                    }
                ],
                "rules": [
                    {"code": "VS-R1", "field": "domicile_state", "op": "eq", "target": "Karnataka", "desc_en": "Must be a permanent resident of Karnataka.", "desc_kn": "ಕರ್ನಾಟಕದ ಕಾಯಂ ನಿವಾಸಿಯಾಗಿರಬೇಕು.", "desc_hi": "कर्नाटक का स्थायी निवासी होना चाहिए।", "desc_ur": "کرناٹک کا مستقل رہائشی ہونا ضروری ہے۔", "mandatory": True},
                    {"code": "VS-R2", "field": "is_student", "op": "bool_true", "target": "true", "desc_en": "Must be studying in post-matric courses.", "desc_kn": "ಪೋಸ್ಟ್ ಮೆಟ್ರಿಕ್ ಕೋರ್ಸ್‌ನಲ್ಲಿ ವ್ಯಾಸಂಗ ಮಾಡುತ್ತಿರಬೇಕು.", "desc_hi": "पोस्ट-मैट्रिक अध्ययनरत होना चाहिए।", "desc_ur": "پوسٹ میٹرک کا طالب علم ہونا چاہیے۔", "mandatory": True},
                    {"code": "VS-R3", "field": "caste_category", "op": "in", "target": "Cat-1,2A,2B,3A,3B,OBC", "desc_en": "Must belong to Backward Classes (Cat-1, 2A, 2B, 3A, 3B).", "desc_kn": "ಹಿಂದುಳಿದ ವರ್ಗಗಳ ಪ್ರವರ್ಗ-1, 2ಎ, 2ಬಿ, 3ಎ, 3ಬಿ ಗೆ ಸೇರಿರಬೇಕು.", "desc_hi": "अन्य पिछड़ा वर्ग (OBC / Cat-1/2A/2B/3A/3B) का होना चाहिए।", "desc_ur": "پسماندہ طبقات سے تعلق رکھتا ہو۔", "mandatory": True},
                    {"code": "VS-R4", "field": "annual_income", "op": "lte", "target": "250000", "desc_en": "Annual family income must not exceed ₹2,50,000 for Cat-1, or ₹1,00,000 for other categories.", "desc_kn": "ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ ಮಿತಿಯೊಳಗಿರಬೇಕು.", "desc_hi": "वार्षिक पारिवारिक आय निर्धारित सीमा के भीतर होनी चाहिए।", "desc_ur": "سالانہ خاندانی آمدنی مقررہ حد کے اندر ہونی چاہیے۔", "mandatory": True}
                ],
                "documents": [
                    {"code": "caste_income_cert", "name": "Nadakacheri Caste & Income Certificate", "name_kn": "ಜಾತಿ ಮತ್ತು ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ", "mandatory": True, "guidelines": "Valid RD number."},
                    {"code": "college_receipt", "name": "College Admission and Study Certificate", "name_kn": "ಕಾಲೇಜು ಪ್ರವೇಶ ರಶೀದಿ", "mandatory": True, "guidelines": "Attested by college principal."},
                    {"code": "bank_passbook", "name": "Aadhaar Seeded Bank Passbook", "name_kn": "ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್", "mandatory": True, "guidelines": "Active account in student's name."}
                ]
            },
            {
                "code": "KA-AB-07",
                "title": "Anna Bhagya Scheme",
                "kannada_title": "ಅನ್ನ ಭಾಗ್ಯ ಯೋಜನೆ",
                "hindi_title": "अन्न भाग्य योजना",
                "urdu_title": "انّ بھاگیہ اسکیم",
                "short_description": "Food security scheme providing 5 kg free grains plus direct DBT cash transfer of ₹170 per person monthly.",
                "detailed_description": "Anna Bhagya ensures nutritional food security for vulnerable households. Eligible BPL and Antyodaya family members receive 5 kg free food grains plus a direct bank transfer of ₹170 per beneficiary each month in lieu of an additional 5 kg rice, deposited into the bank account of the head of household.",
                "department": "Food, Civil Supplies and Consumer Affairs Dept, Govt of Karnataka",
                "government_level": "karnataka",
                "state": "Karnataka",
                "category": "Food Security & Civil Supplies",
                "target_beneficiaries": "Antyodaya Anna Yojana (AAY) and BPL (PHH) cardholders in Karnataka",
                "benefits_summary": "5 kg free rice per beneficiary monthly + ₹170 per person direct cash DBT per month for the additional 5 kg food grains.",
                "application_process": "1. Must hold an approved and verified BPL or Antyodaya Ration card.\n2. Ensure all family member Aadhaar numbers are seeded on the ration card.\n3. The designated head of the family must have an active, NPCI-mapped bank account.\n4. Cash DBT is credited automatically every month.",
                "official_portal_url": "https://ahara.kar.nic.in/",
                "verification_status": "published",
                "last_verified_date": "2026-10-28",
                "verified_by_admin": "Dr. Raghavendra Rao",
                "sources": [
                    {
                        "title": "Ahara Karnataka Department Portal",
                        "url": "https://ahara.kar.nic.in/",
                        "document_reference": "KA-FOOD-AB-DIRECTIVE-2024",
                        "last_verified_at": "2026-10-28"
                    }
                ],
                "rules": [
                    {"code": "AB-R1", "field": "domicile_state", "op": "eq", "target": "Karnataka", "desc_en": "Must be a resident of Karnataka.", "desc_kn": "ಕರ್ನಾಟಕದ ನಿವಾಸಿಯಾಗಿರಬೇಕು.", "desc_hi": "कर्नाटक का निवासी होना चाहिए।", "desc_ur": "کرناٹک کا رہائشی ہونا ضروری ہے۔", "mandatory": True},
                    {"code": "AB-R2", "field": "ration_card_type", "op": "in", "target": "BPL,AAY", "desc_en": "Must possess a valid Priority Household (BPL) or Antyodaya (AAY) card.", "desc_kn": "ಮಾನ್ಯತೆ ಪಡೆದ ಬಿಪಿಎಲ್ ಅಥವಾ ಎಎವೈ ಪಡಿತರ ಚೀಟಿ ಹೊಂದಿರಬೇಕು.", "desc_hi": "बीपीएल या अंत्योदय (एएवाई) राशन कार्ड होना चाहिए।", "desc_ur": "بی پی ایل یا انتودیا راشن کارڈ ہونا ضروری ہے۔", "mandatory": True}
                ],
                "documents": [
                    {"code": "ration_card", "name": "BPL / Antyodaya (AAY) Ration Card", "name_kn": "ಬಿಪಿಎಲ್ ಅಥವಾ ಎಎವೈ ಪಡಿತರ ಚೀಟಿ", "mandatory": True, "guidelines": "Issued by Food & Civil Supplies Dept."},
                    {"code": "bank_passbook", "name": "Aadhaar Seeded Bank Account of Family Head", "name_kn": "ಕುಟುಂಬದ ಮುಖ್ಯಸ್ಥರ ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್", "mandatory": True, "guidelines": "NPCI linked account for monthly DBT."}
                ]
            },
            {
                "code": "IN-PMV-08",
                "title": "PM Vishwakarma Scheme",
                "kannada_title": "ಪಿಎಂ ವಿಶ್ವಕರ್ಮ ಯೋಜನೆ",
                "hindi_title": "पीएम विश्वकर्मा योजना",
                "urdu_title": "پی ایم وشوکرما اسکیم",
                "short_description": "End-to-end support for traditional artisans: ₹15,000 toolkit incentive, skill training, and 5% interest loans up to ₹3 Lakh.",
                "detailed_description": "PM Vishwakarma provides comprehensive support to artisans and craftspeople across 18 traditional trades (Carpenters, Blacksmiths, Potters, Sculptors, Cobblers, Masons, Weavers, Barbers, Tailors, etc.). Offers official Vishwakarma Certificate & ID, basic & advanced training with ₹500/day stipend, modern toolkit incentive of ₹15,000, and collateral-free enterprise loans up to ₹3,00,000 at a concessional interest rate of 5%.",
                "department": "Ministry of Micro, Small and Medium Enterprises, Govt of India",
                "government_level": "central",
                "state": "All India",
                "category": "Artisans & Small Business",
                "target_beneficiaries": "Traditional Artisans and Craftspeople in 18 identified trades",
                "benefits_summary": "PM Vishwakarma ID, 5-7 days basic training with ₹500/day stipend, ₹15,000 e-voucher for modern toolkits, and collateral-free loans (Tranche 1: ₹1,00,000, Tranche 2: ₹2,00,000) at 5% interest.",
                "application_process": "1. Register at Common Service Center (CSC) with Aadhaar biometric authentication.\n2. Three-tier verification: Gram Panchayat / Urban Local Body, District Implementation Committee, and Screening Committee.\n3. Digital Vishwakarma Certificate and ID card issued.\n4. Undergo training and claim toolkit voucher and enterprise loan.",
                "official_portal_url": "https://pmvishwakarma.gov.in/",
                "verification_status": "published",
                "last_verified_date": "2026-10-10",
                "verified_by_admin": "Dr. Raghavendra Rao",
                "sources": [
                    {
                        "title": "Ministry of MSME PM Vishwakarma Portal",
                        "url": "https://pmvishwakarma.gov.in/",
                        "document_reference": "MSME-PMV-GUIDELINES-V2",
                        "last_verified_at": "2026-10-10"
                    }
                ],
                "rules": [
                    {"code": "PMV-R1", "field": "age", "op": "gte", "target": "18", "desc_en": "Must be at least 18 years of age.", "desc_kn": "ಕನಿಷ್ಠ 18 ವರ್ಷ ವಯಸ್ಸಾಗಿರಬೇಕು.", "desc_hi": "न्यूनतम आयु 18 वर्ष होनी चाहिए।", "desc_ur": "کم از کم عمر 18 سال ہونی چاہیے۔", "mandatory": True},
                    {"code": "PMV-R2", "field": "occupation", "op": "in", "target": "Artisan,Carpenter,Blacksmith,Potter,Sculptor,Cobbler,Mason,Weaver,Barber,Tailor,Craftsperson", "desc_en": "Must be engaged in one of the 18 traditional family craft trades using hands and tools.", "desc_kn": "18 ಸಾಂಪ್ರದಾಯಿಕ ಕರಕುಶಲ ಕಸುಬುಗಳಲ್ಲಿ ನಿರತರಾಗಿರಬೇಕು.", "desc_hi": "18 पारंपरिक व्यवसायों में से एक में संलग्न होना चाहिए।", "desc_ur": "18 روایتی پیشوں میں سے کسی ایک میں مصروف عمل ہوں۔", "mandatory": True}
                ],
                "documents": [
                    {"code": "aadhaar_card", "name": "Aadhaar Card", "name_kn": "ಆಧಾರ್ ಕಾರ್ಡ್", "mandatory": True, "guidelines": "Biometric verification required at CSC center."},
                    {"code": "bank_passbook", "name": "Active Bank Account Details", "name_kn": "ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ", "mandatory": True, "guidelines": "For receiving training stipend and toolkit voucher."},
                    {"code": "trade_declaration", "name": "Trade Self-Declaration", "name_kn": "ಕಸುಬಿನ ಸ್ವಯಂ ಘೋಷಣೆ", "mandatory": True, "guidelines": "Verified by Gram Panchayat or ULB."}
                ]
            }
        ]

        for s_data in schemes_data:
            scheme = Scheme(
                code=s_data["code"],
                title=s_data["title"],
                kannada_title=s_data["kannada_title"],
                hindi_title=s_data["hindi_title"],
                urdu_title=s_data["urdu_title"],
                short_description=s_data["short_description"],
                detailed_description=s_data["detailed_description"],
                department=s_data["department"],
                government_level=s_data["government_level"],
                state=s_data["state"],
                category=s_data["category"],
                target_beneficiaries=s_data["target_beneficiaries"],
                benefits_summary=s_data["benefits_summary"],
                application_process=s_data["application_process"],
                official_portal_url=s_data["official_portal_url"],
                verification_status=s_data["verification_status"],
                last_verified_date=s_data["last_verified_date"],
                verified_by_admin=s_data["verified_by_admin"]
            )
            db.add(scheme)
            db.flush()

            for src in s_data["sources"]:
                s_source = SchemeSource(
                    scheme_id=scheme.id,
                    title=src["title"],
                    url=src["url"],
                    document_reference=src.get("document_reference"),
                    last_verified_at=src["last_verified_at"]
                )
                db.add(s_source)

            for rule in s_data["rules"]:
                s_rule = SchemeEligibilityRule(
                    scheme_id=scheme.id,
                    rule_code=rule["code"],
                    field_name=rule["field"],
                    operator=rule["op"],
                    target_value=rule["target"],
                    description_en=rule["desc_en"],
                    description_kn=rule.get("desc_kn"),
                    description_hi=rule.get("desc_hi"),
                    description_ur=rule.get("desc_ur"),
                    is_mandatory=rule.get("mandatory", True)
                )
                db.add(s_rule)

            for doc in s_data["documents"]:
                s_doc = SchemeDocument(
                    scheme_id=scheme.id,
                    document_type_code=doc["code"],
                    document_name=doc["name"],
                    document_name_kn=doc.get("name_kn"),
                    is_mandatory=doc.get("mandatory", True),
                    guidelines=doc.get("guidelines")
                )
                db.add(s_doc)

        db.commit()
        print("Successfully seeded database with authentic government schemes and demo accounts.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

