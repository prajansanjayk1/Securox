import json
import random
import re
from datetime import datetime
import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from sqlalchemy.orm import Session
import pytesseract
import cv2
import numpy as np
import imutils

import models
from database import engine, get_db

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FASTag Dual-Factor Authentication API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_STATE_CODES = {
    "AN", "AP", "AR", "AS", "BR", "CG", "CH", "DD", "DL", "DN", "GA", "GJ",
    "HP", "HR", "JH", "JK", "KA", "KL", "LA", "LD", "MH", "ML", "MN", "MP",
    "MZ", "NL", "OD", "PB", "PY", "RJ", "SK", "TN", "TR", "TS", "UK", "UP",
    "WB",
}

LETTER_TO_DIGIT = str.maketrans({
    "O": "0", "Q": "0", "D": "0",
    "I": "1", "L": "1", "T": "1",
    "Z": "2", "S": "5", "B": "8", "G": "6",
})
DIGIT_TO_LETTER = str.maketrans({
    "0": "O", "1": "I", "2": "Z", "5": "S", "6": "G", "8": "B",
})
PLATE_PATTERN = re.compile(r"^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$")
DELHI_PLATE_PATTERN = re.compile(r"^DL[0-9][A-Z][A-Z]{1,3}[0-9]{4}$")
LOOSE_PLATE_PATTERN = re.compile(r"^[A-Z0-9]{2}[A-Z0-9]{2}[A-Z0-9]{1,3}[A-Z0-9]{4}$")


def _clean_ocr_text(text: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", text.upper())


def _coerce_plate_candidate(candidate: str) -> str | None:
    candidate = _clean_ocr_text(candidate)
    for length in range(9, 12):
        if len(candidate) != length:
            continue

        state = candidate[:2].translate(DIGIT_TO_LETTER)
        rto = candidate[2:4].translate(LETTER_TO_DIGIT)
        series = candidate[4:-4].translate(DIGIT_TO_LETTER)
        number = candidate[-4:].translate(LETTER_TO_DIGIT)
        plate = f"{state}{rto}{series}{number}"

        if state in VALID_STATE_CODES and PLATE_PATTERN.match(plate) and 1 <= len(series) <= 3:
            return plate

        if length >= 9:
            state = candidate[:2].translate(DIGIT_TO_LETTER)
            rto_digit = candidate[2].translate(LETTER_TO_DIGIT)
            category = candidate[3].translate(DIGIT_TO_LETTER)
            series = candidate[4:-4].translate(DIGIT_TO_LETTER)
            number = candidate[-4:].translate(LETTER_TO_DIGIT)
            plate = f"{state}{rto_digit}{category}{series}{number}"
            if DELHI_PLATE_PATTERN.match(plate):
                return plate
    return None


def normalize_indian_plate(text: str) -> str:
    """
    Extracts a valid Indian registration plate from noisy OCR text.
    Tesseract often confuses O/0, I/1, S/5, B/8, etc.; corrections are
    applied by plate position so random EPC/tag strings are not accepted.
    """
    clean_text = _clean_ocr_text(text)
    if not clean_text:
        return "UNKNOWN"

    for length in (10, 9, 11):
        for start in range(0, len(clean_text) - length + 1):
            plate = _coerce_plate_candidate(clean_text[start:start + length])
            if plate:
                return plate

    return "UNKNOWN"


def _prepare_plate_images(gray):
    h, w = gray.shape[:2]
    scale = max(1, int(1200 / max(w, 1)))
    if scale > 1:
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

    denoised = cv2.bilateralFilter(gray, 11, 17, 17)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(denoised)
    _, otsu = cv2.threshold(clahe, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    thresh = cv2.adaptiveThreshold(
        clahe, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 31, 11
    )
    inverted = cv2.bitwise_not(thresh)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    return [clahe, otsu, cv2.bitwise_not(otsu), thresh, inverted, opened]


def _plate_like_score(text: str) -> int:
    clean_text = _clean_ocr_text(text)
    score = 0
    for length in (10, 9, 11):
        for start in range(0, len(clean_text) - length + 1):
            candidate = clean_text[start:start + length]
            if LOOSE_PLATE_PATTERN.match(candidate):
                score = max(score, sum(ch.isdigit() for ch in candidate))
    return score


def _ocr_plate_image(image) -> tuple[str, list[str]]:
    configs = [
        "--oem 3 --psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        "--oem 3 --psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        "--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        "--oem 3 --psm 13 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    ]
    attempts = []
    for prepared in _prepare_plate_images(image):
        for config in configs:
            raw_text = pytesseract.image_to_string(prepared, config=config)
            attempts.append(raw_text)
            plate = normalize_indian_plate(raw_text)
            if plate != "UNKNOWN":
                return plate, attempts
    return "UNKNOWN", attempts


def _crop_with_padding(gray, x, y, w, h, padding=0.12):
    img_h, img_w = gray.shape[:2]
    pad_x = int(w * padding)
    pad_y = int(h * padding)
    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(img_w, x + w + pad_x)
    y2 = min(img_h, y + h + pad_y)
    return gray[y1:y2, x1:x2]


def _candidate_plate_regions(gray):
    img_h, img_w = gray.shape[:2]
    regions = []

    # Whole frame plus common camera positions. These make live webcam scans
    # much less dependent on perfect rectangle detection.
    regions.append(gray)
    regions.append(gray[img_h // 4: img_h * 3 // 4, :])
    regions.append(gray[img_h // 3: img_h * 5 // 6, img_w // 8: img_w * 7 // 8])

    bfilter = cv2.bilateralFilter(gray, 11, 17, 17)
    edged = cv2.Canny(bfilter, 30, 200)
    keypoints = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours = imutils.grab_contours(keypoints)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:30]

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = w * h
        aspect_ratio = w / float(h or 1)
        if area < img_w * img_h * 0.005 or area > img_w * img_h * 0.65:
            continue
        if 1.6 <= aspect_ratio <= 7.5:
            regions.append(_crop_with_padding(gray, x, y, w, h))

    return regions[:12]


def seed_database(db: Session):
    if db.query(models.TollgateDistance).first():
        return
    print("Seeding database from CSVs...")
    try:
        df_dist = pd.read_csv("tollgate_distances.csv")
        for _, row in df_dist.iterrows():
            dist = models.TollgateDistance(
                from_gate=row["from_gate"],
                to_gate=row["to_gate"],
                distance_km=row["distance_km"],
                min_travel_time_min=row["min_travel_time_min"]
            )
            db.add(dist)
    except Exception as e:
        print(f"Error loading distances: {e}")

    try:
        df_scans = pd.read_csv("toll_scans.csv")
        for _, row in df_scans.iterrows():
            scan = models.Scan(
                tag_id=row["tag_id"],
                vehicle_plate=row["vehicle_plate"],
                tollgate_id=row["tollgate_id"],
                direction=random.choice(["IN", "OUT"]),
                timestamp=datetime.strptime(row["timestamp"], "%Y-%m-%d %H:%M:%S"),
                route_id=row["route_id"]
            )
            db.add(scan)
            if not db.query(models.Vehicle).filter(models.Vehicle.vehicle_plate == row["vehicle_plate"]).first():
                v = models.Vehicle(tag_id=row["tag_id"], vehicle_plate=row["vehicle_plate"])
                db.add(v)
                db.flush()
    except Exception as e:
        print(f"Error loading scans: {e}")
    db.commit()

with next(get_db()) as db:
    seed_database(db)

class RFIDPayload(BaseModel):
    epc_id: str
    tag_read_status: str
    read_timestamp: str
    reader_id: str
    toll_plaza_id: str
    lane_id: str

class ProcessTollRequest(BaseModel):
    rfid: RFIDPayload
    ocr_plate: str
    direction: str

class ResolveRequest(BaseModel):
    anomaly_id: int

@app.post("/extract-plate")
async def extract_plate(file: UploadFile = File(...)):
    """
    Extracts text using OpenCV for Plate detection (Contour approach) and Tesseract for OCR.
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"extracted_plate": "ERROR", "details": "Could not decode image"}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
        ocr_attempts = []
        best_raw_text = ""
        plate = "UNKNOWN"

        regions = _candidate_plate_regions(gray)
        for region in regions:
            region_plate, region_attempts = _ocr_plate_image(region)
            ocr_attempts.extend(region_attempts)
            best_raw_text = max(
                [best_raw_text, *region_attempts],
                key=_plate_like_score
            )
            if region_plate != "UNKNOWN":
                plate = region_plate
                break

        print(
            "ANPR Camera -> "
            f"Regions Tried: {len(regions)}, "
            f"OCR Attempts: {[a.strip() for a in ocr_attempts]}, "
            f"Plate: {plate}"
        )

        return {
            "extracted_plate": plate,
            "raw_text": _clean_ocr_text(best_raw_text),
            "regions_tried": len(regions),
        }
    except Exception as e:
        print(f"Extraction Error: {e}")
        return {"extracted_plate": "ERROR", "details": str(e)}


@app.post("/process-toll")
def process_toll(request: ProcessTollRequest, db: Session = Depends(get_db)):
    """
    Dual-Factor check: Checks RFID payload against OCR camera feed.
    """
    epc_id = request.rfid.epc_id
    ocr_plate = normalize_indian_plate(request.ocr_plate)
    tollgate_id = request.rfid.toll_plaza_id

    if ocr_plate == "UNKNOWN":
        raise HTTPException(
            status_code=422,
            detail="Could not read a valid Indian vehicle plate from OCR image."
        )
    
    # Parse the exact time from the RFID scanner payload!
    try:
        current_time = datetime.fromisoformat(request.rfid.read_timestamp.replace("Z", "+00:00"))
        # Strip timezone info for basic math since models use default UTC naive
        current_time = current_time.replace(tzinfo=None)
    except:
        current_time = datetime.utcnow()
        
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.tag_id == epc_id).first()
    
    anomaly = None

    if vehicle and vehicle.vehicle_plate != ocr_plate and ocr_plate != "UNKNOWN":
        anomaly = models.Anomaly(
            tag_id=epc_id,
            vehicle_plate=ocr_plate,
            from_gate=tollgate_id,
            to_gate=tollgate_id,
            actual_time_min=0.0,
            min_travel_time_min=0.0,
            reason=f"PLATE MISMATCH: RFID tag {epc_id} belongs to {vehicle.vehicle_plate}, but ANPR camera detected {ocr_plate}. Possible cloned tag.",
            severity="HIGH"
        )
    
    if not anomaly:
        last_scan = db.query(models.Scan).filter(models.Scan.tag_id == epc_id).order_by(models.Scan.timestamp.desc()).first()
        
        if last_scan:
            time_diff_min = (current_time - last_scan.timestamp).total_seconds() / 60.0
            
            if last_scan.tollgate_id == tollgate_id:
                if time_diff_min < 2.0:
                    anomaly = models.Anomaly(
                        tag_id=epc_id,
                        vehicle_plate=ocr_plate,
                        from_gate=last_scan.tollgate_id,
                        to_gate=tollgate_id,
                        actual_time_min=time_diff_min,
                        min_travel_time_min=2.0,
                        reason=f"Tag scanned at same gate {tollgate_id} only {time_diff_min:.1f} mins after previous scan.",
                        severity="HIGH"
                    )
            else:
                dist_record = db.query(models.TollgateDistance).filter(
                    models.TollgateDistance.from_gate == last_scan.tollgate_id,
                    models.TollgateDistance.to_gate == tollgate_id
                ).first()
                
                if dist_record and time_diff_min < dist_record.min_travel_time_min:
                    sev = "HIGH" if time_diff_min < (dist_record.min_travel_time_min / 2) else "MEDIUM"
                    anomaly = models.Anomaly(
                        tag_id=epc_id,
                        vehicle_plate=ocr_plate,
                        from_gate=last_scan.tollgate_id,
                        to_gate=tollgate_id,
                        actual_time_min=time_diff_min,
                        min_travel_time_min=dist_record.min_travel_time_min,
                        reason=f"Impossible travel time: {last_scan.tollgate_id} to {tollgate_id} in {time_diff_min:.1f} min (minimum is {dist_record.min_travel_time_min:.1f} min).",
                        severity=sev
                    )

    if anomaly:
        db.add(anomaly)
        db.commit()
        db.refresh(anomaly)
        return {
            "status": "BLOCKED",
            "message": "Payment halted due to anomaly.",
            "anomaly": {
                "id": anomaly.id,
                "reason": anomaly.reason,
                "severity": anomaly.severity
            }
        }
        
    new_scan = models.Scan(
        tag_id=epc_id,
        vehicle_plate=ocr_plate,
        tollgate_id=tollgate_id,
        direction=request.direction,
        timestamp=current_time,
        route_id="NH44"
    )
    db.add(new_scan)
    
    if not vehicle:
        new_veh = models.Vehicle(tag_id=epc_id, vehicle_plate=ocr_plate)
        db.add(new_veh)
        
    db.commit()
    
    return {
        "status": "APPROVED",
        "message": "Dual-factor authentication successful.",
        "vehicle_plate": ocr_plate
    }

@app.post("/resolve-anomaly")
def resolve_anomaly(req: ResolveRequest, db: Session = Depends(get_db)):
    anomaly = db.query(models.Anomaly).filter(models.Anomaly.id == req.anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
        
    anomaly.is_resolved = True
    
    new_scan = models.Scan(
        tag_id=anomaly.tag_id,
        vehicle_plate=anomaly.vehicle_plate,
        tollgate_id=anomaly.to_gate,
        direction="IN", 
        timestamp=datetime.utcnow(),
        route_id="NH44"
    )
    db.add(new_scan)
    db.commit()
    
    return {"status": "SUCCESS", "message": "Anomaly manually resolved."}

@app.get("/scans")
def get_recent_scans(tollgate_id: str = None, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(models.Scan)
    if tollgate_id:
        query = query.filter(models.Scan.tollgate_id == tollgate_id)
        
    scans = query.order_by(models.Scan.timestamp.desc()).limit(limit).all()
    return [{"timestamp": s.timestamp.isoformat(), "vehicle_plate": s.vehicle_plate, "tag_id": s.tag_id, "direction": s.direction, "status": "APPROVED"} for s in scans]

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
