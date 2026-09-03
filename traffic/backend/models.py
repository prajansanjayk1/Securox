from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(Integer, primary_key=True, index=True)
    tag_id = Column(String, unique=True, index=True) # EPC ID
    vehicle_plate = Column(String, unique=True, index=True)

class Tollgate(Base):
    __tablename__ = "tollgates"
    id = Column(Integer, primary_key=True, index=True)
    gate_id = Column(String, unique=True, index=True)
    route = Column(String)

class TollgateDistance(Base):
    __tablename__ = "tollgate_distances"
    id = Column(Integer, primary_key=True, index=True)
    from_gate = Column(String, index=True)
    to_gate = Column(String, index=True)
    distance_km = Column(Float)
    min_travel_time_min = Column(Float)

class Scan(Base):
    __tablename__ = "scans"
    id = Column(Integer, primary_key=True, index=True)
    tag_id = Column(String, index=True) # EPC ID
    vehicle_plate = Column(String, index=True) # OCR Plate
    tollgate_id = Column(String, index=True)
    direction = Column(String) # 'IN' or 'OUT'
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    route_id = Column(String)

class Anomaly(Base):
    __tablename__ = "anomalies"
    id = Column(Integer, primary_key=True, index=True)
    tag_id = Column(String, index=True)
    vehicle_plate = Column(String)
    from_gate = Column(String)
    to_gate = Column(String)
    actual_time_min = Column(Float)
    min_travel_time_min = Column(Float)
    reason = Column(String)
    severity = Column(String)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_resolved = Column(Boolean, default=False)
