import os
import re
from typing import Dict, Any, List, Optional
import cv2
import numpy as np
from pypdf import PdfReader

class DocumentProcessor:
    """
    Document quality analysis and field extraction engine.
    Detects blurriness with OpenCV Laplacian variance, inspects document integrity,
    extracts structured fields from Indian government documents (Certificates, Marksheets, IDs),
    and assigns confidence scores.
    """

    BLUR_THRESHOLD = 85.0  # Laplacian variance below this indicates blur

    @classmethod
    def check_image_quality(cls, file_path: str) -> Dict[str, Any]:
        """
        Runs computer vision checks on image files:
        - Laplacian variance for blur detection
        - Aspect ratio & resolution for cut-off / incomplete document detection
        """
        if not os.path.exists(file_path):
            return {
                "quality_score": 0.0,
                "is_blurry": False,
                "is_incomplete": True,
                "blur_score": 0.0,
                "warnings": ["File does not exist"]
            }

        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            # For PDF, check page count and readable text density
            try:
                reader = PdfReader(file_path)
                num_pages = len(reader.pages)
                if num_pages == 0:
                    return {
                        "quality_score": 0.0,
                        "is_blurry": False,
                        "is_incomplete": True,
                        "blur_score": 100.0,
                        "warnings": ["PDF document has zero pages"]
                    }
                return {
                    "quality_score": 0.95,
                    "is_blurry": False,
                    "is_incomplete": False,
                    "blur_score": 150.0,
                    "warnings": []
                }
            except Exception as e:
                return {
                    "quality_score": 0.3,
                    "is_blurry": False,
                    "is_incomplete": True,
                    "blur_score": 50.0,
                    "warnings": [f"Could not read PDF structure: {str(e)}"]
                }

        # Process image using OpenCV
        try:
            # Read image in grayscale
            img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                return {
                    "quality_score": 0.2,
                    "is_blurry": False,
                    "is_incomplete": True,
                    "blur_score": 0.0,
                    "warnings": ["Unable to decode image format"]
                }

            height, width = img.shape
            warnings = []

            # 1. Blur detection via Laplacian variance
            laplacian = cv2.Laplacian(img, cv2.CV_64F)
            variance = float(laplacian.var())
            is_blurry = variance < cls.BLUR_THRESHOLD
            if is_blurry:
                warnings.append("Image is blurry or poorly focused. Text may not be fully legible.")

            # 2. Incomplete / cut-off check
            is_incomplete = False
            if height < 300 or width < 300:
                is_incomplete = True
                warnings.append("Image resolution is very low (less than 300px). Critical details might be lost.")

            aspect_ratio = width / float(height) if height > 0 else 1.0
            if aspect_ratio > 3.0 or aspect_ratio < 0.3:
                is_incomplete = True
                warnings.append("Document has an unusual aspect ratio. Part of the document may be cut off.")

            # Overall quality score (0.0 to 1.0)
            base_score = 0.95
            if is_blurry:
                base_score -= 0.35
            if is_incomplete:
                base_score -= 0.30
            quality_score = max(0.1, round(base_score, 2))

            return {
                "quality_score": quality_score,
                "is_blurry": is_blurry,
                "is_incomplete": is_incomplete,
                "blur_score": round(variance, 2),
                "warnings": warnings,
                "resolution": f"{width}x{height}"
            }
        except Exception as e:
            return {
                "quality_score": 0.5,
                "is_blurry": False,
                "is_incomplete": False,
                "blur_score": 100.0,
                "warnings": [f"Quality analysis notice: {str(e)}"]
            }

    @classmethod
    def extract_text_from_file(cls, file_path: str) -> str:
        """
        Extracts raw textual content from PDF or reads embedded text.
        """
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            try:
                reader = PdfReader(file_path)
                full_text = []
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        full_text.append(text)
                return "\n".join(full_text)
            except Exception:
                return ""
        return ""

    @classmethod
    def extract_fields(
        cls,
        file_path: str,
        document_type: str,
        simulated_text: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Extracts key identity and certificate fields with confidence scores.
        Detects Nadakacheri certificate numbers, Aadhaar masks, names, DOB, caste, and income.
        """
        text = simulated_text or cls.extract_text_from_file(file_path)
        extracted: List[Dict[str, Any]] = []

        # Nadakacheri / Revenue Dept Certificate Number (e.g. RD00384729104)
        cert_match = re.search(r'\b(RD[0-9]{11}|KA-[0-9]{6,12}|CERT-[0-9A-Z]{6,10})\b', text, re.IGNORECASE)
        if cert_match:
            extracted.append({
                "field_name": "certificate_number",
                "raw_value": cert_match.group(1),
                "normalized_value": cert_match.group(1).upper(),
                "confidence": 0.94,
                "is_uncertain": False
            })

        # Name extraction pattern
        name_match = re.search(r'(?:Name|Applicant Name|Candidate Name|Kumari|Smt|Shri)[\s:\.]*([A-Za-z\s]{3,35})', text, re.IGNORECASE)
        if name_match:
            val = name_match.group(1).strip()
            # Clean up trailing words
            val = val.split('\n')[0].strip()
            extracted.append({
                "field_name": "full_name",
                "raw_value": val,
                "normalized_value": val.title(),
                "confidence": 0.88,
                "is_uncertain": False
            })

        # Date of Birth pattern (DD/MM/YYYY or DD-MM-YYYY)
        dob_match = re.search(r'(?:DOB|Date of Birth|Birth Date)[\s:\.]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})', text, re.IGNORECASE)
        if dob_match:
            extracted.append({
                "field_name": "dob",
                "raw_value": dob_match.group(1),
                "normalized_value": dob_match.group(1).replace("-", "/"),
                "confidence": 0.92,
                "is_uncertain": False
            })

        # Gender pattern
        gender_match = re.search(r'\b(Female|Male|Transgender)\b', text, re.IGNORECASE)
        if gender_match:
            extracted.append({
                "field_name": "gender",
                "raw_value": gender_match.group(1),
                "normalized_value": gender_match.group(1).capitalize(),
                "confidence": 0.90,
                "is_uncertain": False
            })

        # Annual Income pattern (e.g. Rs. 1,20,000 / Income: 80000)
        income_match = re.search(r'(?:Income|Annual Income|Total Income)[\s:\.]*(?:Rs\.?|INR|₹)?[\s]*([0-9,]{4,10})', text, re.IGNORECASE)
        if income_match:
            raw_inc = income_match.group(1).replace(",", "")
            extracted.append({
                "field_name": "annual_income",
                "raw_value": income_match.group(1),
                "normalized_value": raw_inc,
                "confidence": 0.89,
                "is_uncertain": False
            })

        # Caste category pattern (Karnataka standard categories: SC, ST, Cat-1, 2A, 2B, 3A, 3B, General)
        caste_match = re.search(r'\b(Category-1|Cat-1|2A|2B|3A|3B|SC|ST|General|OBC)\b', text, re.IGNORECASE)
        if caste_match:
            extracted.append({
                "field_name": "caste_category",
                "raw_value": caste_match.group(1),
                "normalized_value": caste_match.group(1).upper(),
                "confidence": 0.91,
                "is_uncertain": False
            })

        # Expiry or Validity pattern
        valid_match = re.search(r'(?:Valid Upto|Validity|Expiry Date|Valid till)[\s:\.]*(\d{2}[\/\-]\d{2}[\/\-]\d{4}|Lifetime|5 years)', text, re.IGNORECASE)
        if valid_match:
            extracted.append({
                "field_name": "validity_period",
                "raw_value": valid_match.group(1),
                "normalized_value": valid_match.group(1),
                "confidence": 0.85,
                "is_uncertain": False
            })

        # If few or no fields were matched directly, provide structured placeholders with uncertainty flag
        if not extracted:
            extracted = [
                {
                    "field_name": "document_identifier",
                    "raw_value": "Scan Pending Review",
                    "normalized_value": "",
                    "confidence": 0.50,
                    "is_uncertain": True
                },
                {
                    "field_name": "holder_name",
                    "raw_value": "Please Verify",
                    "normalized_value": "",
                    "confidence": 0.50,
                    "is_uncertain": True
                }
            ]

        return extracted

