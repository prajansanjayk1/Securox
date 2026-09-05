import React, { useState, useEffect, useRef } from 'react';
import { TollScanRecord, VehicleVerificationRecord, RFIDReader } from '../../../types/traffic';
import { trafficService } from '../../../services/trafficService';
import {
  CreditCard,
  ShieldAlert,
  RefreshCw,
  Lock,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Camera,
  Video,
  VideoOff,
  Scan,
  Maximize2,
  Sliders,
  Check,
  X,
  Upload,
  Sparkles,
  FileCode,
  Copy,
  KeyRound,
  CheckSquare,
  History,
} from 'lucide-react';

interface Props {
  scans: TollScanRecord[];
  onRefresh: () => void;
}

// Intelligent plate number isolator: extracts ONLY the vehicle plate sequence
export const extractPlateNumberAlone = (raw: string): string => {
  if (!raw) return '';
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // 1. Standard Indian Registration: e.g. KA05MK9821, MH12DE1433, DL01AB1234, TN70DY8744
  const indianMatch = cleaned.match(/([A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4})/);
  if (indianMatch) return indianMatch[1];

  // 2. Bharat Series (BH): e.g. 22BH1234AA
  const bhMatch = cleaned.match(/([0-9]{2}BH[0-9]{4}[A-Z]{1,2})/);
  if (bhMatch) return bhMatch[1];

  // 3. General pattern: 2-4 letters + 2-6 digits
  const generalMatch = cleaned.match(/([A-Z]{1,4}[0-9]{2,6}[A-Z]{0,4})/);
  if (generalMatch) return generalMatch[1];

  return cleaned.slice(0, 10);
};

export const TollFastagSubsystem: React.FC<Props> = ({ scans, onRefresh }) => {
  // Legacy / existing state
  const [overrideScanId, setOverrideScanId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Verifications & Readers telemetry
  const [verifications, setVerifications] = useState<VehicleVerificationRecord[]>([]);
  const [readers, setReaders] = useState<RFIDReader[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<VehicleVerificationRecord | null>(null);

  // Manual verify simulation modal (tag + ocr)
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [simPlate, setSimPlate] = useState('MH-12-DE-1433');
  const [simTag, setSimTag] = useState('TAG-98231');
  const [simOcrConf, setSimOcrConf] = useState(0.92);
  const [simVerifying, setSimVerifying] = useState(false);

  // ── Camera ANPR & RFID Hardware Simulator State ──
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [rawPlateInput, setRawPlateInput] = useState('KA 05 MK 9821');
  const [extractedPlate, setExtractedPlate] = useState<string | null>(null);

  // Boom barrier state - initially raised for verified default vehicle
  const [barrierState, setBarrierState] = useState<'CLOSED' | 'OPEN'>('OPEN');

  const [approvalBanner, setApprovalBanner] = useState<{
    type: 'APPROVED' | 'REJECTED';
    message: string;
  } | null>({
    type: 'APPROVED',
    message: 'CLEARANCE APPROVED: Vehicle [KA05MK9821] verified against JSON FASTag [TAG-IND-8821901]. Boom barrier raised (70°).',
  });

  // ── JSON-based FASTag Digital Credential Verifier State ──
  // Replaces physical RFID hardware scanner reliance with cryptographic JSON FASTag records
  const jsonCredentialPresets = [
    {
      id: 'KA05MK9821_VALID',
      label: 'KA 05 MK 9821 (Matching & Active)',
      type: 'MATCH',
      json: JSON.stringify(
        {
          fastag_id: 'TAG-IND-8821901',
          vehicle_registration: 'KA05MK9821',
          owner_name: 'Aditya Sharma',
          vehicle_class: 'VC4_PASSENGER_CAR',
          issuer_bank: 'HDFC_NETC_GATEWAY',
          wallet_balance_inr: 850.0,
          tag_status: 'ACTIVE',
          security_algorithm: 'EPC_GEN2_AES128',
          digital_signature: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
          toll_rate_inr: 95.0,
        },
        null,
        2
      ),
    },
    {
      id: 'MH12DE1433_VALID',
      label: 'MH 12 DE 1433 (Matching & Active)',
      type: 'MATCH',
      json: JSON.stringify(
        {
          fastag_id: 'TAG-98231',
          vehicle_registration: 'MH12DE1433',
          owner_name: 'Pooja Kulkarni',
          vehicle_class: 'VC4_PASSENGER_CAR',
          issuer_bank: 'ICICI_NETC_HUB',
          wallet_balance_inr: 1240.5,
          tag_status: 'ACTIVE',
          security_algorithm: 'EPC_GEN2_AES128',
          digital_signature: 'sha256:3d28f89e1a8a3c9e6bb07e4d8ef92d3c50989f6d149021bf907335ce50811776',
          toll_rate_inr: 95.0,
        },
        null,
        2
      ),
    },
    {
      id: 'MISMATCH_CLONED',
      label: 'CLONED TAG / MISMATCH (Fraud Alert)',
      type: 'FRAUD_MISMATCH',
      json: JSON.stringify(
        {
          fastag_id: 'TAG-CLONED-9988',
          vehicle_registration: 'DL04C9988',
          owner_name: 'Suspicious Fleet Operator',
          vehicle_class: 'VC4_PASSENGER_CAR',
          issuer_bank: 'PAYTM_PAYMENTS_BANK',
          wallet_balance_inr: 320.0,
          tag_status: 'SUSPICIOUS_DUPLICATE',
          security_algorithm: 'EMULATED_KEY_DETECTED',
          digital_signature: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
          toll_rate_inr: 95.0,
        },
        null,
        2
      ),
    },
    {
      id: 'BLACKLISTED_STOLEN',
      label: 'BLACKLISTED / STOLEN (Barred Tag)',
      type: 'BLACKLISTED',
      json: JSON.stringify(
        {
          fastag_id: 'TAG-IND-3341829',
          vehicle_registration: 'KA05NB9901',
          owner_name: 'Flagged Watchlist Record',
          vehicle_class: 'VC4_PASSENGER_CAR',
          issuer_bank: 'SBI_FASTAG_DIRECT',
          wallet_balance_inr: 0.0,
          tag_status: 'BLACKLISTED',
          security_algorithm: 'REVOKED_CERTIFICATE',
          digital_signature: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          toll_rate_inr: 95.0,
        },
        null,
        2
      ),
    },
    {
      id: 'LOW_BALANCE',
      label: 'INSUFFICIENT BALANCE (₹12 Remaining)',
      type: 'LOW_BALANCE',
      json: JSON.stringify(
        {
          fastag_id: 'TAG-1036',
          vehicle_registration: 'TN70DY8744',
          owner_name: 'Ramesh Sundaram',
          vehicle_class: 'VC4_PASSENGER_CAR',
          issuer_bank: 'AXIS_NETC_SWITCH',
          wallet_balance_inr: 12.0,
          tag_status: 'LOW_BALANCE',
          security_algorithm: 'EPC_GEN2_AES128',
          digital_signature: 'sha256:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
          toll_rate_inr: 95.0,
        },
        null,
        2
      ),
    },
  ];

  const [jsonCredentialInput, setJsonCredentialInput] = useState(jsonCredentialPresets[0].json);
  const [selectedJsonPreset, setSelectedJsonPreset] = useState(jsonCredentialPresets[0].id);
  const [isVerifyingJson, setIsVerifyingJson] = useState(false);

  // Track vehicle plates that have already cleared the toll plaza
  // If the same vehicle is scanned again, flag duplicate scan anomaly
  const [scannedVehiclesHistory, setScannedVehiclesHistory] = useState<
    Array<{ plate: string; timestamp: string; tag_id: string }>
  >([
    {
      plate: 'KA05MK9821',
      timestamp: '09:12:00',
      tag_id: 'TAG-IND-8821901',
    },
  ]);

  const [jsonVerifyResult, setJsonVerifyResult] = useState<{
    status: 'VERIFIED' | 'MISMATCH' | 'REJECTED' | 'LOW_BALANCE' | 'ANOMALY_DETECTED';
    message: string;
    details?: any;
  } | null>({
    status: 'VERIFIED',
    message: 'IDENTITY CONFIRMED: JSON FASTag [TAG-IND-8821901] matches ANPR Optical Plate [KA05MK9821]. Toll of ₹95 deducted.',
    details: {
      fastag_id: 'TAG-IND-8821901',
      vehicle_registration: 'KA05MK9821',
      tag_status: 'ACTIVE',
      wallet_balance_inr: 850.0,
      toll_rate_inr: 95.0,
    },
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const loadVerificationData = async () => {
    try {
      const [verRes, readRes] = await Promise.allSettled([
        trafficService.getVehicleVerifications({ limit: 15 }),
        trafficService.getRfidReaders(),
      ]);
      if (verRes.status === 'fulfilled') {
        const list = Array.isArray(verRes.value) ? verRes.value : [];
        setVerifications(list);
        if (list.length > 0 && !selectedVerification) {
          setSelectedVerification(list[0]);
        }
      }
      if (readRes.status === 'fulfilled') {
        setReaders(Array.isArray(readRes.value) ? readRes.value : []);
      }
    } catch (e) {
      console.warn('Verification telemetry fetch warning', e);
    }
  };

  useEffect(() => {
    loadVerificationData();
  }, []);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // ── Start / Stop Live Gantry Camera ──
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } else {
        throw new Error('Webcam device API not supported in this browser.');
      }
    } catch (err: any) {
      console.warn('Physical camera unavailable, engaging high-fidelity simulated optical feed:', err);
      setCameraError('Webcam device not detected or access denied. High-definition Gantry Camera simulation active.');
      setIsCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // ── Capture Frame & Extract Plate Number Alone ──
  // ── Unified JSON FASTag Verification Engine ──
  // Cross-verifies vehicle plate with structured JSON FASTag credentials
  const handleVerifyWithJson = async (plateOverride?: string, customJson?: string) => {
    setIsVerifyingJson(true);

    const jsonStringToParse = customJson || jsonCredentialInput;
    let parsedCredential: any;
    try {
      parsedCredential = JSON.parse(jsonStringToParse);
    } catch (parseErr: any) {
      setIsVerifyingJson(false);
      setBarrierState('CLOSED');
      setJsonVerifyResult({
        status: 'REJECTED',
        message: 'Invalid JSON format: Please ensure valid syntax with quotation marks and proper commas.',
      });
      return;
    }

    const jsonPlate = extractPlateNumberAlone(parsedCredential.vehicle_registration || '');
    const opticalPlate = extractPlateNumberAlone(plateOverride || extractedPlate || rawPlateInput);
    const tagId = parsedCredential.fastag_id || 'UNKNOWN_JSON_TAG';
    const tagStatus = parsedCredential.tag_status || 'ACTIVE';
    const walletBalance = Number(parsedCredential.wallet_balance_inr ?? 0);
    const tollRate = Number(parsedCredential.toll_rate_inr ?? 95.0);

    try {
      // Check 1: Blacklisted or Revoked Tag in JSON payload
      if (tagStatus === 'BLACKLISTED' || tagStatus === 'REVOKED' || tagStatus === 'STOLEN') {
        setBarrierState('CLOSED');
        setJsonVerifyResult({
          status: 'REJECTED',
          message: `SECURITY ALERT: FASTag [${tagId}] is flagged as ${tagStatus} in NETC Registry. Vehicle barred.`,
          details: parsedCredential,
        });
        setApprovalBanner({
          type: 'REJECTED',
          message: `FASTag [${tagId}] is BLACKLISTED / STOLEN. Boom barrier locked. Security notified.`,
        });
        return;
      }

      // Check 2: Low Wallet Balance in JSON payload
      if (walletBalance < tollRate) {
        setBarrierState('CLOSED');
        setJsonVerifyResult({
          status: 'LOW_BALANCE',
          message: `TRANSACTION DECLINED: FASTag wallet balance (₹${walletBalance.toFixed(2)}) is lower than toll fare (₹${tollRate.toFixed(2)}).`,
          details: parsedCredential,
        });
        setApprovalBanner({
          type: 'REJECTED',
          message: `Insufficient FASTag Balance (₹${walletBalance.toFixed(2)}). Toll barrier closed. Please recharge wallet.`,
        });
        return;
      }

      // Check 3: Duplicate Scan / Re-scan Anomaly Check
      // If the same vehicle has already been scanned/cleared, flag it as an ANOMALY DETECTED
      const existingScan = scannedVehiclesHistory.find(
        (s) => s.plate.toUpperCase() === opticalPlate.toUpperCase()
      );
      if (existingScan) {
        setBarrierState('CLOSED');
        setJsonVerifyResult({
          status: 'ANOMALY_DETECTED',
          message: `ANOMALY DETECTED (DUPLICATE SCAN): Vehicle [${opticalPlate}] was already scanned at ${existingScan.timestamp}. Toll clearance denied. Potential tailgating or tag clone re-use!`,
          details: {
            ...parsedCredential,
            scanned_timestamp: existingScan.timestamp,
            duplicate_flag: true,
          },
        });
        setApprovalBanner({
          type: 'REJECTED',
          message: `ANOMALY DETECTED: Vehicle [${opticalPlate}] already processed at ${existingScan.timestamp}. Barrier locked.`,
        });
        return;
      }

      // Check 4: Cross-verification against optical ANPR plate
      const isPlateMatch = Boolean(jsonPlate && opticalPlate && jsonPlate === opticalPlate);

      // Send to backend vehicle verification engine
      const res = await trafficService.verifyVehicleIdentity({
        camera_id: 'CAM-101',
        tag_id: tagId,
        ocr_plate: opticalPlate,
        ocr_confidence: 0.96,
        rfid_confidence: isPlateMatch ? 0.99 : 0.40,
        lane: 'LANE-01',
        location: 'Toll Plaza Gantry Alpha - Lane 1',
      });

      if (isPlateMatch && tagStatus === 'ACTIVE') {
        // MATCH: Open Boom Barrier!
        setBarrierState('OPEN');
        setJsonVerifyResult({
          status: 'VERIFIED',
          message: `IDENTITY CONFIRMED: JSON FASTag [${tagId}] matches ANPR Optical Plate [${opticalPlate}]. Toll of ₹${tollRate} deducted.`,
          details: { ...parsedCredential, backend_status: res.status },
        });
        setApprovalBanner({
          type: 'APPROVED',
          message: `CLEARANCE APPROVED: Vehicle [${opticalPlate}] verified against JSON FASTag [${tagId}]. Boom barrier raised (70°).`,
        });

        // Add to scanned history to protect against repeated scans
        setScannedVehiclesHistory((prev) => [
          {
            plate: opticalPlate,
            timestamp: new Date().toLocaleTimeString(),
            tag_id: tagId,
          },
          ...prev.filter((p) => p.plate.toUpperCase() !== opticalPlate.toUpperCase()),
        ]);

        // Record toll transaction
        try {
          await trafficService.processTollScan({
            tollgate_id: 'TOLL-01',
            tollgate_name: 'Airport Express Plaza Gantry 1',
            vehicle_number: opticalPlate,
            fastag_id: tagId,
            amount: tollRate,
            vehicle_class: parsedCredential.vehicle_class || 'CAR / LMV',
          });
        } catch (e) {
          console.warn('Toll processing record note:', e);
        }
      } else {
        // ANOMALY / IDENTITY MISMATCH DETECTED: Keep Barrier Locked!
        setBarrierState('CLOSED');
        setJsonVerifyResult({
          status: 'ANOMALY_DETECTED',
          message: `ANOMALY DETECTED: Optical Camera Plate [${opticalPlate}] does NOT match JSON FASTag registration [${jsonPlate || 'N/A'}]. Potential impersonation or tag-swapping detected.`,
          details: { ...parsedCredential, backend_status: res.status },
        });
        setApprovalBanner({
          type: 'REJECTED',
          message: `ANOMALY DETECTED: Camera Plate [${opticalPlate}] does not match JSON FASTag [${jsonPlate}]. Barrier remains locked.`,
        });
      }

      setSelectedVerification(res);
      await loadVerificationData();
      onRefresh();
    } catch (err: any) {
      console.error('JSON verification error:', err);
      // Fallback local verification if backend unreachable
      const existingScan = scannedVehiclesHistory.find(
        (s) => s.plate.toUpperCase() === opticalPlate.toUpperCase()
      );
      if (existingScan) {
        setBarrierState('CLOSED');
        setJsonVerifyResult({
          status: 'ANOMALY_DETECTED',
          message: `ANOMALY DETECTED (DUPLICATE SCAN): Vehicle [${opticalPlate}] was already scanned at ${existingScan.timestamp}. Barrier locked.`,
          details: parsedCredential,
        });
        setApprovalBanner({
          type: 'REJECTED',
          message: `ANOMALY DETECTED: Vehicle [${opticalPlate}] already scanned. Barrier locked.`,
        });
        return;
      }

      const isPlateMatch = Boolean(jsonPlate && opticalPlate && jsonPlate === opticalPlate);
      if (isPlateMatch && tagStatus === 'ACTIVE') {
        setBarrierState('OPEN');
        setJsonVerifyResult({
          status: 'VERIFIED',
          message: `IDENTITY CONFIRMED: FASTag [${tagId}] verified with Optical Plate [${opticalPlate}]. Toll deducted. Barrier open.`,
          details: parsedCredential,
        });
        setApprovalBanner({
          type: 'APPROVED',
          message: `CLEARANCE APPROVED: Vehicle [${opticalPlate}] verified via JSON credential.`,
        });

        // Add to scanned history
        setScannedVehiclesHistory((prev) => [
          {
            plate: opticalPlate,
            timestamp: new Date().toLocaleTimeString(),
            tag_id: tagId,
          },
          ...prev.filter((p) => p.plate.toUpperCase() !== opticalPlate.toUpperCase()),
        ]);
      } else {
        setBarrierState('CLOSED');
        setJsonVerifyResult({
          status: 'ANOMALY_DETECTED',
          message: `ANOMALY DETECTED: Optical Plate [${opticalPlate}] ≠ JSON FASTag [${jsonPlate}]. Barrier remains locked.`,
          details: parsedCredential,
        });
        setApprovalBanner({
          type: 'REJECTED',
          message: `ANOMALY DETECTED: Plate mismatch between vehicle [${opticalPlate}] and JSON record [${jsonPlate}].`,
        });
      }
    } finally {
      setIsVerifyingJson(false);
    }
  };

  // ── Capture Frame & Extract Plate Number Alone ──
  const handleCaptureAndExtract = async (plateOverride?: string) => {
    setIsAnalyzing(true);

    // 1. Capture snapshot from video if stream is active
    if (videoRef.current && canvasRef.current && mediaStreamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedFrame(canvas.toDataURL('image/jpeg'));
      }
    }

    // 2. Optical character isolation: Extract only the registration string
    const input = plateOverride || rawPlateInput;
    const isolated = extractPlateNumberAlone(input);
    setExtractedPlate(isolated);

    // Simulate quick OCR processing latency
    await new Promise((r) => setTimeout(r, 400));

    try {
      // 3. Directly verify with JSON credential (automatic verification & anomaly detection)
      await handleVerifyWithJson(isolated);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimVerifying(true);
    try {
      const res = await trafficService.verifyVehicleIdentity({
        ocr_plate: simPlate,
        rfid_tag_id: simTag,
        ocr_confidence: Number(simOcrConf),
        rfid_rssi: -58.0,
        camera_id: 'CAM-101',
        rfid_reader_id: 'RFID-READER-01',
        location: 'Toll Plaza Gantry Alpha - Lane 1',
      });
      setShowVerifyModal(false);
      await loadVerificationData();
      setSelectedVerification(res);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setSimVerifying(false);
    }
  };



  const handleOverride = async () => {
    if (!overrideScanId || !overrideReason.trim()) return;
    setSubmitting(true);
    try {
      await trafficService.overrideTollScan(overrideScanId, overrideReason);
      setOverrideScanId(null);
      setOverrideReason('');
      onRefresh();
      loadVerificationData();
    } catch (e: any) {
      alert(e.message || 'Toll override error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> VERIFIED
          </span>
        );
      case 'MANUALLY_APPROVED_NO_RFID':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
            <Check className="w-3 h-3 text-cyan-400" /> OPERATOR APPROVED (NO RFID)
          </span>
        );
      case 'NO_RFID_DETECTED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 text-amber-400 border border-amber-800 animate-pulse flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> NO RFID DETECTED
          </span>
        );
      case 'REJECTED_NO_RFID':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> REJECTED (NO RFID)
          </span>
        );
      case 'ANOMALY_DETECTED':
      case 'MISMATCH':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-950 text-rose-400 border border-rose-800 animate-pulse flex items-center gap-1">
            <XCircle className="w-3 h-3" /> ANOMALY DETECTED
          </span>
        );
      case 'LOW_CONFIDENCE':
      case 'OCR_UNCERTAIN':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> LOW CONFIDENCE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const sampleVehicles = [
    { plate: 'KA 05 MK 9821', city: 'Bangalore South', vehicle: 'Hyundai Creta' },
    { plate: 'MH 12 DE 1433', city: 'Pune Central', vehicle: 'Tata Nexon' },
    { plate: 'DL 01 AB 1234', city: 'Delhi North', vehicle: 'Toyota Innova' },
    { plate: 'TN 70 DY 8744', city: 'Hosur Corridor', vehicle: 'Mahindra XUV700' },
    { plate: 'KA 01 AB 1234', city: 'Bangalore Central', vehicle: 'Maruti Suzuki Swift' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Subsystem Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            FASTag RFID + ANPR Optical Cross-Verification Gantry
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Webcam / RTSP Optical Plate Recognition, Number Isolation, RFID Disparity Interrogation & Operator Approval Flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVerifyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-xs font-mono text-emerald-300 hover:bg-emerald-900 transition"
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            Simulate Tag + OCR
          </button>
          <button
            onClick={() => {
              onRefresh();
              loadVerificationData();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-400 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Approval Feedback Banner */}
      {approvalBanner && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 animate-fadeIn ${
            approvalBanner.type === 'APPROVED'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {approvalBanner.type === 'APPROVED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400" />
            )}
            <div>
              <strong className="block font-bold">{approvalBanner.type === 'APPROVED' ? 'BOOM BARRIER OPENED' : 'CLEARANCE REJECTED'}</strong>
              <span>{approvalBanner.message}</span>
            </div>
          </div>
          <button
            onClick={() => setApprovalBanner(null)}
            className="text-slate-400 hover:text-slate-200 text-xs"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* ── LIVE TOLL GANTRY ANPR CAMERA & BOOM BARRIER STATION ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm font-mono flex items-center gap-2">
                Toll Gantry ANPR Optical Camera & Plate Reader
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                  LANE-01 GANTRY ALPHA
                </span>
              </h4>
              <p className="text-[11px] font-mono text-slate-400">
                Live optical camera feed with real-time license plate sequence isolation & hardware RFID check
              </p>
            </div>
          </div>

          {/* Camera On/Off & Barrier Controls */}
          <div className="flex items-center gap-2">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs shadow-lg shadow-emerald-950/50 transition"
              >
                <Video className="w-4 h-4" /> Open Gantry ANPR Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 font-mono text-xs hover:bg-rose-900 transition"
              >
                <VideoOff className="w-4 h-4" /> Close Camera
              </button>
            )}

            {/* Barrier Reset Toggle */}
            <button
              onClick={() => setBarrierState((prev) => (prev === 'CLOSED' ? 'OPEN' : 'CLOSED'))}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs border transition ${
                barrierState === 'OPEN'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {barrierState === 'OPEN' ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
              Barrier: {barrierState}
            </button>
          </div>
        </div>

        {/* Camera Viewport + Gantry Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5 font-mono">
          {/* Left Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="relative aspect-video rounded-xl bg-slate-950 border-2 border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {/* If camera is inactive, show standby illustration */}
              {!isCameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="text-slate-300 font-bold text-xs uppercase tracking-wider">
                    Gantry ANPR Camera Standby
                  </div>
                  <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                    Click "Open Gantry ANPR Camera" or select a vehicle plate below to initiate optical number plate isolation.
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition inline-flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" /> Start Camera Stream
                  </button>
                </div>
              )}

              {/* Camera Active HUD Overlays */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  {/* Top HUD */}
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-slate-950/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-900/50">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      REC • ANPR OPTICAL SENSING (1080p 30fps)
                    </span>
                    <span className="text-slate-400">CAM-101 • TOLL-01</span>
                  </div>

                  {/* Center Targeting Reticle / Number Plate Zone */}
                  <div className="relative mx-auto w-3/4 max-w-sm h-28 border-2 border-dashed border-emerald-400/70 rounded-lg flex flex-col items-center justify-center bg-emerald-950/10 backdrop-blur-[1px]">
                    <div className="absolute top-1 left-1.5 text-[9px] text-emerald-400 tracking-wider">
                      [ SCAN ZONE: ALIGN VEHICLE REGISTRATION NUMBER ]
                    </div>
                    {/* Corner targeting marks */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                    {/* Animated Laser Scanning Line */}
                    {isAnalyzing && (
                      <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />
                    )}

                    <div className="text-[11px] text-slate-300 font-bold bg-slate-950/80 px-3 py-1 rounded border border-slate-800">
                      {rawPlateInput || 'KA 05 MK 9821'}
                    </div>
                  </div>

                  {/* Bottom HUD */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <FileCode className="w-3 h-3" /> NETC JSON FASTAG: SYNCHRONIZED
                    </span>
                    <span className="text-emerald-400 font-bold">LANE 1 READY</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick-action Capture Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCaptureAndExtract()}
                disabled={isAnalyzing}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition"
              >
                <Scan className="w-4 h-4" />
                {isAnalyzing ? 'Extracting Plate Sequence...' : 'Capture & Extract Plate Number Alone'}
              </button>
            </div>
          </div>

          {/* Right Gantry Diagnostics & Isolated Plate Panel (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Visual Boom Barrier Indicator Graphic */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Gantry Boom Barrier Gate
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    barrierState === 'OPEN'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {barrierState === 'OPEN' ? 'OPEN (CLEAR TO PASS)' : 'CLOSED (LOCKED)'}
                </span>
              </div>

              {/* Boom Barrier Graphic */}
              <div className="relative h-24 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center overflow-hidden px-6">
                {/* Pillar */}
                <div className="w-6 h-14 bg-slate-700 rounded-t border-t-2 border-slate-500 relative flex flex-col items-center justify-between py-1">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      barrierState === 'OPEN' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    }`}
                  />
                  <div className="text-[7px] text-slate-300 font-bold">L1</div>
                </div>

                {/* Boom Arm */}
                <div
                  className={`h-2.5 origin-left rounded-r border transition-transform duration-700 ease-out ${
                    barrierState === 'OPEN'
                      ? 'w-48 bg-gradient-to-r from-emerald-500 via-white to-emerald-500 border-emerald-400 -rotate-45'
                      : 'w-48 bg-gradient-to-r from-rose-600 via-white to-rose-600 border-rose-500 rotate-0'
                  }`}
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 10px, #ffffff 10px, #ffffff 20px)',
                  }}
                />

                <div className="absolute right-4 text-right">
                  <div className="text-[10px] text-slate-400">Barrier Status:</div>
                  <div className={`text-xs font-bold ${barrierState === 'OPEN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {barrierState === 'OPEN' ? '🟢 RAISED (70°)' : '🔴 LOWERED (0°)'}
                  </div>
                </div>
              </div>

              {/* Digital FASTag Mode Status */}
              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-[11px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Digital Credential Mode: <strong>JSON FASTag Active</strong></span>
                </div>
                <span className="text-[10px] text-cyan-400/80">NETC Cryptographic Match</span>
              </div>
            </div>

            {/* Extracted License Plate Display (HSRP Standard) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Extracted Number Plate (Isolated):</span>
                {extractedPlate && (
                  <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Sequence Isolated
                  </span>
                )}
              </div>

              {/* Indian High-Security Registration Plate (HSRP) styled badge */}
              <div className="h-14 rounded-lg bg-white border-2 border-slate-300 shadow-md flex items-center overflow-hidden px-3">
                {/* Left Blue IND Strip */}
                <div className="w-7 h-full bg-blue-700 text-white flex flex-col items-center justify-center text-[9px] font-bold shrink-0 -ml-3 mr-3 px-1 border-r border-blue-900">
                  <div className="w-2.5 h-2.5 rounded-full border border-yellow-400 flex items-center justify-center text-[6px]">
                    ☸
                  </div>
                  <span className="tracking-tighter font-mono">IND</span>
                </div>

                {/* Isolated Number sequence */}
                <div className="flex-1 text-center font-mono font-black text-slate-950 tracking-wider text-lg sm:text-xl selection:bg-cyan-200">
                  {extractedPlate || extractPlateNumberAlone(rawPlateInput) || 'KA05MK9821'}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center">
                Optical character isolator strips ambient text, country prefixes, and symbols.
              </div>
            </div>
          </div>
        </div>

        {/* ── Test Vehicle Quick-Selector ── */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Quick Select Test Vehicles (ANPR Plate Feeds):
            </span>
            <span className="text-[10px]">Click any vehicle to load & trigger plate isolation</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {sampleVehicles.map((v) => {
              const isCurrent = rawPlateInput === v.plate;
              return (
                <button
                  key={v.plate}
                  onClick={() => {
                    setRawPlateInput(v.plate);
                    handleCaptureAndExtract(v.plate);
                  }}
                  className={`p-2 rounded-lg border text-left transition ${
                    isCurrent
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-100">{v.plate}</div>
                  <div className="text-[10px] text-slate-400 truncate">{v.city}</div>
                  <div className="text-[9px] text-slate-500 truncate">{v.vehicle}</div>
                </button>
              );
            })}
          </div>

          {/* Custom Plate Input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={rawPlateInput}
              onChange={(e) => setRawPlateInput(e.target.value)}
              placeholder="Or enter any custom license plate (e.g. KA01AB1234 or DL-04-C-9988)..."
              className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleCaptureAndExtract()}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition"
            >
              Process Plate
            </button>
          </div>
        </div>

        {/* ── JSON-BASED FASTAG DIGITAL CREDENTIAL CONFIRMATION & VERIFICATION ── */}
        <div className="mt-6 pt-5 border-t-2 border-slate-800/80 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <FileCode className="w-4 h-4" />
                </span>
                <h5 className="font-bold text-slate-100 text-xs tracking-wider uppercase flex items-center gap-2">
                  JSON FASTag Digital Credential Verifier
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 font-normal">
                    RFID Hardware Substitute
                  </span>
                </h5>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Instead of physical RFID reader hardware, confirm vehicle identity directly against structured JSON NETC records. Cross-verifies plate against camera OCR & operates boom barrier.
              </p>
            </div>

            {/* Quick Preset Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold">Select JSON Preset:</span>
              {jsonCredentialPresets.map((preset) => {
                const isSelected = selectedJsonPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedJsonPreset(preset.id);
                      setJsonCredentialInput(preset.json);
                      handleVerifyWithJson(undefined, preset.json);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {preset.id.startsWith('KA05')
                      ? 'KA 05 (Valid)'
                      : preset.id.startsWith('MH12')
                      ? 'MH 12 (Valid)'
                      : preset.id.startsWith('MISMATCH')
                      ? '⚠️ Cloned / Mismatch'
                      : preset.id.startsWith('BLACKLISTED')
                      ? '🚫 Blacklisted'
                      : '₹ Low Balance'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* JSON Editor + Live Evaluation Console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* JSON Payload Editor (7 cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  FASTag NETC Registry JSON Payload (Editable):
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(jsonCredentialInput);
                  }}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300 transition"
                  title="Copy JSON to clipboard"
                >
                  <Copy className="w-3 h-3" /> Copy JSON
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={jsonCredentialInput}
                  onChange={(e) => {
                    setJsonCredentialInput(e.target.value);
                    setJsonVerifyResult(null);
                  }}
                  rows={9}
                  spellCheck={false}
                  className="w-full font-mono text-[11px] p-3 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-inner resize-y leading-relaxed selection:bg-cyan-950"
                  placeholder="Paste or format your FASTag JSON payload here..."
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Fields evaluated: <code className="text-slate-400 font-bold">fastag_id</code>, <code className="text-slate-400 font-bold">vehicle_registration</code>, <code className="text-slate-400 font-bold">wallet_balance_inr</code>, <code className="text-slate-400 font-bold">tag_status</code></span>
                <span>Standard NETC Gen2 Schema</span>
              </div>
            </div>

            {/* Verification Action & Status Output (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold pb-2 border-b border-slate-800">
                  <span>Target Cross-Verification:</span>
                  <span className="text-emerald-400 font-mono font-black text-xs">
                    {extractedPlate || extractPlateNumberAlone(rawPlateInput) || 'KA05MK9821'}
                  </span>
                </div>

                {/* Status Indicator Result */}
                {jsonVerifyResult ? (
                  <div
                    className={`p-3 rounded-lg border text-xs space-y-1.5 animate-fadeIn ${
                      jsonVerifyResult.status === 'VERIFIED'
                        ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                        : jsonVerifyResult.status === 'LOW_BALANCE'
                        ? 'bg-amber-950/70 border-amber-700 text-amber-300'
                        : 'bg-rose-950/70 border-rose-700 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      {jsonVerifyResult.status === 'VERIFIED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : jsonVerifyResult.status === 'LOW_BALANCE' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>
                        {jsonVerifyResult.status === 'VERIFIED'
                          ? 'VERIFIED (JSON CONFIRMED)'
                          : jsonVerifyResult.status === 'LOW_BALANCE'
                          ? 'LOW WALLET BALANCE'
                          : jsonVerifyResult.details?.duplicate_flag
                          ? 'ANOMALY DETECTED (DUPLICATE SCAN)'
                          : jsonVerifyResult.status === 'ANOMALY_DETECTED' || jsonVerifyResult.status === 'MISMATCH'
                          ? 'ANOMALY DETECTED (PLATE MISMATCH)'
                          : 'CLEARANCE REJECTED'}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-95">
                      {jsonVerifyResult.message}
                    </p>
                    <div className="text-[10px] pt-1 opacity-80 flex items-center justify-between border-t border-current/20">
                      <span>Barrier Action:</span>
                      <strong className="font-bold">
                        {jsonVerifyResult.status === 'VERIFIED' ? '🟢 RAISE BOOM GATE (70°)' : '🔴 LOCK BOOM GATE (0°)'}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-900 border border-dashed border-slate-800 text-slate-400 text-center space-y-1">
                    <CheckSquare className="w-5 h-5 mx-auto text-slate-500" />
                    <div className="text-[11px] font-bold text-slate-300">Ready to Verify JSON Credential</div>
                    <p className="text-[10px] text-slate-500">
                      Click below to parse the JSON and cross-verify with optical license plate <strong className="text-cyan-400">{extractedPlate || extractPlateNumberAlone(rawPlateInput) || 'KA05MK9821'}</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleVerifyWithJson()}
                disabled={isVerifyingJson}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition"
              >
                {isVerifyingJson ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Cross-Verifying JSON with ANPR Camera...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Verify with JSON FASTag Credential</span>
                  </>
                )}
              </button>

              {/* Scanned Vehicles Log & Duplicate Prevention Status */}
              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Cleared Vehicles Log:{' '}
                    <strong className="text-slate-200">
                      {scannedVehiclesHistory.length > 0
                        ? scannedVehiclesHistory.map((s) => s.plate).join(', ')
                        : 'None'}
                    </strong>
                  </span>
                </div>
                {scannedVehiclesHistory.length > 0 && (
                  <button
                    onClick={() => {
                      setScannedVehiclesHistory([]);
                      setApprovalBanner(null);
                      setJsonVerifyResult(null);
                    }}
                    className="text-amber-400/80 hover:text-amber-300 underline font-mono text-[9px] transition"
                    title="Clear history to re-test clearance without duplicate scan anomaly"
                  >
                    Clear History
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Critical Fraud & Mismatch Escalation Banner */}
      {verifications.some((v) => v.escalation_status === 'ESCALATED_TO_SOC') && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-3 animate-fadeIn">
          <ShieldAlert className="w-6 h-6 shrink-0 text-rose-400 animate-pulse" />
          <div>
            <div className="font-bold text-sm">HIGH SEVERITY ALERT: Repeated Vehicle Identity Mismatch Escalated to SOC</div>
            <div className="text-rose-400/90 mt-0.5">
              Plate vs FASTag RFID cryptographic discrepancy confirmed across multiple cameras. Multi-camera journey tracking engaged.
            </div>
          </div>
        </div>
      )}

      {/* Active RFID Readers Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 text-xs font-mono">
          <span className="font-bold text-slate-200 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Active UHF RFID Readers ({readers.length})
          </span>
          <span className="text-slate-400">865–867 MHz Protocol (EPC Gen2)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          {readers.map((r) => (
            <div key={r.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <strong className="text-slate-200">{r.id}</strong>
                <span className="text-emerald-400 text-[9px] font-bold">ONLINE</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">{r.location}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{r.frequency_mhz} MHz • Nominal</div>
            </div>
          ))}
        </div>
      </div>

      {/* Split View: Real-Time Cross-Verification Records & Detail Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* Verification Stream Table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Real-Time RFID ↔ ANPR Identity Verifications ({verifications.length})
            </h4>
            <span className="text-[11px] text-slate-400">Multi-Camera Correlated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/40 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">ID / Time</th>
                  <th className="p-3">ANPR OCR Plate</th>
                  <th className="p-3">RFID Tag ID</th>
                  <th className="p-3">Registered Plate</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {verifications.map((v) => {
                  const isSelected = selectedVerification?.id === v.id;
                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVerification(v)}
                      className={`cursor-pointer transition ${
                        isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-cyan-400">{v.id}</div>
                        <div className="text-[10px] text-slate-500">{v.timestamp?.split('T')[1]?.slice(0, 8) || 'Just now'}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-100">
                        {v.ocr_plate}
                        <div className="text-[10px] text-slate-400">Conf: {Math.round((v.ocr_confidence || 0.9) * 100)}%</div>
                      </td>
                      <td className="p-3 text-slate-300">{v.rfid_tag_id || 'NO_TAG'}</td>
                      <td className="p-3 font-bold text-slate-200">{v.rfid_registered_plate || 'N/A'}</td>
                      <td className="p-3">{getStatusBadge(v.verification_status)}</td>
                      <td className="p-3">
                        <span
                          className={`font-bold ${
                            v.risk_score >= 80 ? 'text-rose-400' : v.risk_score >= 40 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {v.risk_score}
                        </span>
                        {v.escalation_status === 'ESCALATED_TO_SOC' && (
                          <div className="text-[9px] text-rose-400 font-bold">SOC ESCALATED</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Detail & Gauge Inspector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Verification Analysis</span>
              {selectedVerification && getStatusBadge(selectedVerification.verification_status)}
            </h4>

            {selectedVerification ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="text-[11px] text-slate-400">Gantry Location</div>
                  <div className="text-slate-100 font-bold">{selectedVerification.location}</div>
                  <div className="text-[10px] text-slate-500">
                    Camera: {selectedVerification.camera_id || 'CAM-101'} • Reader: {selectedVerification.rfid_reader_id || 'RFID-01'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Optical OCR Plate</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{selectedVerification.ocr_plate}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Confidence: {Math.round((selectedVerification.ocr_confidence || 0.9) * 100)}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">RFID Registered Plate</div>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">{selectedVerification.rfid_registered_plate}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      RSSI: {selectedVerification.rfid_rssi || 0} dBm
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Repeated Mismatches:</span>
                    <strong className="text-rose-400">{selectedVerification.repeated_mismatch_count || 0}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Computed Risk Score:</span>
                    <strong className="text-slate-100">{selectedVerification.risk_score} / 100</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Escalation Status:</span>
                    <span className="font-bold text-cyan-400">{selectedVerification.escalation_status}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    Action: <span className="text-slate-200">{selectedVerification.action_taken}</span>
                  </div>
                </div>

                {selectedVerification.journey_cameras && selectedVerification.journey_cameras.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 mb-1.5">Multi-Camera Journey Trail:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedVerification.journey_cameras.map((camId) => (
                        <span key={camId} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] border border-slate-700">
                          {camId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 text-center py-10">Select a verification record to view breakdown</div>
            )}
          </div>
        </div>
      </div>

      {/* Legacy Scans Table with Supervisor Clearance */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg font-mono text-xs">
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider">
            Toll Gantry Clearance History ({scans.length})
          </h4>
          <span className="text-slate-400 text-[11px]">Financial & Gantry Barrier Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/40 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Scan ID</th>
                <th className="p-3">Toll Plaza Gantry</th>
                <th className="p-3">Vehicle Plate</th>
                <th className="p-3">FASTag ID</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Flag Rationale</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scans.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3 font-bold text-cyan-400">{scan.id}</td>
                  <td className="p-3 text-slate-200">{scan.tollgate_name}</td>
                  <td className="p-3 font-bold text-slate-100">{scan.vehicle_number}</td>
                  <td className="p-3 text-slate-400">{scan.fastag_id}</td>
                  <td className="p-3 font-bold text-emerald-400">₹{scan.amount}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        scan.status === 'CLEARED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : scan.status === 'CLONED'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                          : scan.status === 'OVERRIDDEN_CLEARED'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {scan.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] max-w-xs">{scan.flag_reason || 'Verified legitimate'}</td>
                  <td className="p-3 text-right">
                    {scan.status === 'CLONED' || scan.status === 'SUSPECT' ? (
                      <button
                        onClick={() => {
                          setOverrideScanId(scan.id);
                          setOverrideReason('');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-bold transition"
                      >
                        Supervisor Override
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[10px]">None Required</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Verification Simulator Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono text-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              Simulate ANPR Plate ↔ RFID Tag Cross-Check
            </h4>
            <p className="text-slate-400">
              Trigger instant real-time verification across OCR and RFID registries to test mismatch detection and SOC alerting.
            </p>
            <form onSubmit={handleManualVerify} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">OCR Detected Plate *</label>
                <input
                  type="text"
                  value={simPlate}
                  onChange={(e) => setSimPlate(e.target.value)}
                  required
                  placeholder="e.g. MH-12-DE-1433"
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">RFID FASTag ID *</label>
                <input
                  type="text"
                  value={simTag}
                  onChange={(e) => setSimTag(e.target.value)}
                  required
                  placeholder="e.g. TAG-98231 or TAG-CLONED-9988"
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">OCR Confidence ({Math.round(simOcrConf * 100)}%)</label>
                <input
                  type="range"
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  value={simOcrConf}
                  onChange={(e) => setSimOcrConf(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simVerifying}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold"
                >
                  {simVerifying ? 'Verifying...' : 'Execute Cross-Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supervisor Override Modal */}
      {overrideScanId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono text-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-3 shadow-2xl">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              Supervisor Override for Flagged Scan {overrideScanId}
            </h4>
            <p className="text-slate-400">
              Mandatory supervisory justification required to clear cryptographic fraud alert. This action will be permanently recorded in audit logs.
            </p>
            <div>
              <label className="block text-slate-400 mb-1">Supervisor Justification *</label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Verified fleet duplicate tag. Physical RFID tag confirmed present on vehicle."
                className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideScanId(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleOverride}
                disabled={submitting}
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
              >
                {submitting ? 'Committing...' : 'Commit Clearance Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
