# JAN SETU AI (जन सेतु)
### Intelligent Citizen-Assistance Platform for Indian Government Schemes

> **Core Principle:** We do not replace government portals. We make them easier for ordinary citizens to understand and use.

---

## 1. Project Overview

**Jan Setu AI (जन सेतु)** is a production-grade GovTech platform engineered to bridge the accessibility gap between Indian citizens and public welfare services. Built initially with deep coverage for **Karnataka** and Central Government schemes, Jan Setu empowers citizens to describe their situation in natural everyday language, discover verified schemes, assess eligibility with a deterministic rules engine, scan and verify documents with computer vision, and prepare structured checklists before proceeding to official government portals.

---

## 2. Key Architecture & Features

### A. Multilingual AI Citizen Assistant (Ask Jan Setu)
- **Natural Language Understanding:** Speak or type requirements without government terminology.
- **Languages Supported:** Kannada (ಕನ್ನಡ), Hindi (हिंदी), English (English), and Urdu (اردو).
- **Voice Speech Input:** Integrated browser Web Speech API (`SpeechRecognition`) with visual audio wave and one-click speech-to-text.
- **RAG & Knowledge Retrieval:** Retrieves only verified records from the government repository.
- **Zero Hallucination Guarantee:** Never fabricates schemes, deadlines, or eligibility criteria.

### B. Deterministic Rules Engine
- Decisions are computed by transparent code conditions (operators: `eq`, `lte`, `gte`, `in`, `bool_true`, `between`).
- **No LLM Decision Making:** AI explains terms, but the rules engine evaluates eligibility.
- **Transparent Output:** Condition-by-condition breakdown with transparent explanations in Kannada, Hindi, English, and Urdu.

### C. Personal Document Center & AI Scanner
- **Formats:** PDF, JPG, JPEG, PNG.
- **OpenCV Blur Detection:** Laplacian variance analysis flags out-of-focus camera captures.
- **Document Integrity Checks:** Detects low resolution, cut-off margins, and unusual aspect ratios.
- **Structured Field Extraction:** Detects Karnataka Nadakacheri certificate numbers (`RD...`), applicant names, DOB, caste categories, income amounts, and validity periods.
- **Citizen Consent Requirement:** Extracted data is never used silently. The citizen reviews, corrects, and approves data before application preparation.

### D. Verified Government Schemes (Karnataka & National)
1. **SSP Post-Matric Scholarship** (Social Welfare Dept, Karnataka - `ssp.postmatric.karnataka.gov.in`)
2. **Gruha Lakshmi Scheme** (Women & Child Dev, Karnataka - `sevasindhuservices.karnataka.gov.in`)
3. **Yuva Nidhi Scheme** (Skill Dev & Livelihood, Karnataka - `sevasindhuservices.karnataka.gov.in`)
4. **Raitha Siri / PM-KISAN Component** (Agriculture Dept, Karnataka - `fruits.karnataka.gov.in`)
5. **Ayushman Bharat - Arogya Karnataka** (Health & Family Welfare, Karnataka - `arogya.karnataka.gov.in`)
6. **Vidyasiri Hostel & Food Stipend** (Backward Classes Welfare Dept, Karnataka - `bcwd.karnataka.gov.in`)
7. **Anna Bhagya Scheme** (Food & Civil Supplies, Karnataka - `ahara.kar.nic.in`)
8. **PM Vishwakarma Scheme** (Ministry of MSME, Govt of India - `pmvishwakarma.gov.in`)

### E. Smart Application Preparation & Organizer
- Maps approved citizen data into required portal form fields.
- Highlights missing mandatory documents and certificates.
- Handoff directly to the authorized government portal link.
- Manual recording and tracking of official government submission reference numbers.

### F. Protected Administrator Operations Console
- **Platform Overview:** Real metrics calculated from live database records.
- **Publishing Governance:** `Draft` &rarr; `Under Review` &rarr; `Verified` &rarr; `Published` &rarr; `Archived`.
- **User Management:** Citizen and administrator account status controls.
- **Audit Trail:** Immutable audit logs tracking administrative actions.

---

## 3. UI/UX Design System

- **Color Palette:**
  - Deep Navy (`#0F1E36`): Primary headers and navigation
  - Teal (`#0D9488` / `#0F766E`): Primary actions and interactive elements
  - Warm Ivory (`#FDFBF7` / `#FAF6F0`): Clean primary background
  - Soft Sand (`#F3EFE6` / `#E2DCCE`): Card surfaces and restrained borders
  - Muted Green (`#15803D`): Verified states and satisfied conditions
  - Amber (`#B45309`): Attention and pending reviews
  - Restrained Red (`#DC2626`): Urgent alerts and failed conditions
- **Typography:** DM Sans across all headings, body, and forms.
- **GovTech Iconography:** Bespoke custom SVG icon system (`GovIcon`) with clean line weights (no emojis, no Lucide icons, no sparkles).
- **Layout:** Rectangular and moderately rounded cards (no pill buttons, no glassmorphism, no fake reviews, no purple gradients).

---

## 4. Technology Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Backend:** Python 3.14, FastAPI, SQLAlchemy, Pydantic v2.
- **Authentication:** Argon2id secure password hashing, signed cryptographic session tokens.
- **Computer Vision:** OpenCV (cv2) Laplacian blur analysis, PyPDF document stream processing.
- **Database:** SQLite (local zero-setup) / PostgreSQL compatible relational schema with UUID primary keys and indexes.

---

## 5. Quick Start Instructions

### Prerequisites
- Node.js v18+ (Node v24 supported)
- Python 3.10+ (Python 3.14 supported)

### Step 1: Start Backend (FastAPI)
```bash
# In project root:
python backend/main.py
```
*The database (`jan_setu.db`) will automatically initialize and seed authentic schemes on startup.*
*Backend API will be running at `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/api/docs`).*

### Step 2: Start Frontend (Next.js)
```bash
# In a new terminal window:
cd frontend
npm run dev
```
*Frontend will be running at `http://localhost:3000`.*

---

## 6. Pre-Seeded Demonstration Accounts

| Role | Email Address | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Demo Citizen** | `citizen@jansetu.in` | `CitizenPass@2026` | Personalized dashboard, document scanner, eligibility checks, applications |
| **Gov Administrator** | `admin@jansetu.gov.in` | `JanSetuAdmin@2026` | Full administrative console, scheme publishing, audit logs, user management |

---

## 7. Testing & Quality Assurance

### Run Backend Test Suite:
```bash
python -m pytest backend/tests/test_all.py -v
```
*(Tests Argon2 password security, token verification, deterministic rule operators, Laplacian blur detection, and Nadakacheri regex field extraction.)*

### Run Frontend Production Build:
```bash
cd frontend
npm run build
```
*(Verifies TypeScript typings, static page prerendering, and bundling across all 19 application routes.)*

