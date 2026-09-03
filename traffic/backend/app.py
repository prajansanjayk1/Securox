import json
import random
import re
from datetime import datetime
import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from sqlalchemy.orm import Session
import pytesseract
from PIL import Image
import io

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
    Extracts text from an uploaded image using Tesseract OCR.
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Pre-processing to improve OCR accuracy
        # Convert to Grayscale
        image = image.convert('L')
        # Binary Thresholding
        threshold = 150
        image = image.point(lambda p: p > threshold and 255)
        
        text = pytesseract.image_to_string(image)
        
        # Clean up text (remove non-alphanumeric)
        clean_text = re.sub(r'[^A-Z0-9]', '', text.upper())
        
        # Strict Regex for standard Indian Number Plates: e.g. MH12AB3456
        # Format: 2 Letters, 1-2 Digits, 0-3 Letters, 4 Digits
        match = re.search(r'([A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4})', clean_text)
        
        if match:
            plate = match.group(1)
        else:
            # Fallback: if no valid pattern is found, return a truncated clean string
            # to avoid returning a massive block of product text if a user scans a monitor.
            plate = clean_text[:12] if clean_text else "UNKNOWN"
            
        return {"extracted_plate": plate}
    except Exception as e:
        return {"extracted_plate": "ERROR", "details": str(e)}

@app.post("/process-toll")
def process_toll(request: ProcessTollRequest, db: Session = Depends(get_db)):
    """
    Dual-Factor check: Checks RFID payload against OCR camera feed.
    """
    epc_id = request.rfid.epc_id
    ocr_plate = request.ocr_plate
    tollgate_id = request.rfid.toll_plaza_id
    
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.tag_id == epc_id).first()
    
    current_time = datetime.utcnow()
    anomaly = None

    # Check 1: Plate Mismatch (Cloning Detection)
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
    
    # Check 2: Travel Time constraints (if Check 1 passed)
    if not anomaly:
        # Find last scan by this exact tag
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
                        reason=f"Tag scanned at same gate {tollgate_id} only {time_diff_min:.1f} mins after previous scan. Possible physical duplication or technical error.",
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
        
    # Proceed successfully
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
