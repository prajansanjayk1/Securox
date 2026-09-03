import { useState, useEffect, useRef } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000'

const MOCK_RFID = {
  "epc_id": "E20034120123456789ABCDEF",
  "tag_read_status": "SUCCESS",
  "read_timestamp": new Date().toISOString(),
  "reader_id": "RFID-TOLL06-LANE03",
  "toll_plaza_id": "TG-06",
  "lane_id": "LANE-03"
};

function App() {
  const [direction, setDirection] = useState('IN');
  
  // RFID State
  const [rfidInput, setRfidInput] = useState(JSON.stringify(MOCK_RFID, null, 2));
  
  // Camera State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [currentResult, setCurrentResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');

  const fetchRecentScans = () => {
    let tgId = "TG-01";
    try {
      const parsed = JSON.parse(rfidInput);
      if (parsed.toll_plaza_id) tgId = parsed.toll_plaza_id;
    } catch(e) {}

    fetch(`${API_URL}/scans?tollgate_id=${tgId}&limit=10`)
      .then(r => r.json())
      .then(data => setRecentScans(data))
      .catch(e => console.error("Error fetching scans", e));
  }

  // Initialize webcam
  useEffect(() => {
    fetchRecentScans();
    
    // Start camera
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      })
      .catch(err => {
        console.error("Error accessing camera:", err);
        setOcrStatus("Camera access denied or unavailable.");
      });
      
    // Cleanup on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Capture frame as blob
  const captureFrame = () => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        reject("Camera not initialized");
        return;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject("Failed to capture image blob");
        }
      }, 'image/png');
    });
  };

  const handleProcessToll = async (e) => {
    e.preventDefault();
    if (!cameraActive) {
      alert("Camera is not active. Please allow camera permissions.");
      return;
    }
    
    let parsedRfid;
    try {
      parsedRfid = JSON.parse(rfidInput);
      // Update the mock JSON with the live timestamp
      parsedRfid.read_timestamp = new Date().toISOString();
      setRfidInput(JSON.stringify(parsedRfid, null, 2));
    } catch(e) {
      alert("Invalid JSON in RFID input.");
      return;
    }

    setLoading(true);
    setCurrentResult(null);
    setOcrStatus('Capturing live frame for ANPR...');

    try {
      // 1. Capture Frame
      const imageBlob = await captureFrame();
      
      setOcrStatus('Extracting plate via OCR...');

      // 2. Run OCR
      const formData = new FormData();
      formData.append("file", imageBlob, "live_capture.jpg");

      const ocrRes = await fetch(`${API_URL}/extract-plate`, {
        method: 'POST',
        body: formData
      });
      const ocrData = await ocrRes.json();
      
      const extractedPlate = ocrData.extracted_plate;
      const rawText = ocrData.raw_text ? ` (${ocrData.raw_text})` : '';
      setOcrStatus(`OCR Extraction Complete: ${extractedPlate}${rawText}`);

      if (extractedPlate === 'UNKNOWN' || extractedPlate === 'ERROR') {
        setCurrentResult({
          status: 'ERROR',
          message: ocrData.details || 'Could not read a valid Indian vehicle plate. Please recapture with the plate centered and well lit.'
        });
        return;
      }

      // 3. Process Toll (Dual Factor)
      const tollRes = await fetch(`${API_URL}/process-toll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfid: parsedRfid,
          ocr_plate: extractedPlate,
          direction: direction
        })
      });
      
      const tollData = await tollRes.json();
      if (!tollRes.ok) {
        setCurrentResult({
          status: 'ERROR',
          message: tollData.detail || 'Could not process toll scan.'
        });
        return;
      }

      setCurrentResult(tollData);
      
      if (tollData.status === 'APPROVED') {
        fetchRecentScans();
      }
    } catch (e) {
      console.error("Error processing toll", e);
      setOcrStatus('Error during processing.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = () => {
    if (!currentResult || !currentResult.anomaly) return;
    
    fetch(`${API_URL}/resolve-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anomaly_id: currentResult.anomaly.id })
    })
    .then(r => r.json())
    .then(data => {
      if (data.status === 'SUCCESS') {
        setCurrentResult(null);
        fetchRecentScans();
      }
    })
    .catch(e => console.error("Error resolving", e));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>
          <span className="status-indicator"></span>
          FASTag Lane Operations <span style={{color: 'var(--text-muted)', fontWeight: 400}}>| Dual-Factor Auth Mode</span>
        </h1>
        <div className="booth-controls">
          <select value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="IN">INBOUND</option>
            <option value="OUT">OUTBOUND</option>
          </select>
        </div>
      </header>

      {/* Dual Factor Inputs */}
      <div className="dual-grid">
        
        {/* Left: RFID Terminal */}
        <div className="card scanner-card">
          <h2 className="card-title">1. RFID Terminal Input</h2>
          <p style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Simulate the incoming JSON payload from the overhead RFID reader.</p>
          <textarea 
            className="mono rfid-textarea"
            value={rfidInput}
            onChange={(e) => setRfidInput(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Right: Live ANPR Camera */}
        <div className="card scanner-card">
          <h2 className="card-title">2. Live ANPR Camera Feed</h2>
          <p style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Point your camera at a number plate. Frame will be captured automatically on execution.</p>
          
          <div className="camera-upload-area" style={{ padding: 0, backgroundColor: '#000' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Hidden canvas for capturing frames */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          {ocrStatus && <div className="ocr-status mono">{ocrStatus}</div>}
        </div>

      </div>

      <button 
        className="btn btn-primary process-btn" 
        onClick={handleProcessToll}
        disabled={loading || (currentResult && currentResult.status === 'BLOCKED') || !cameraActive}
      >
        {loading ? 'Processing...' : 'Capture Frame & Run Dual-Factor Auth'}
      </button>


      {/* Active Vehicle Status */}
      {currentResult && (
        <div className={`status-panel ${currentResult.status !== 'APPROVED' ? 'panel-blocked' : 'panel-approved'}`}>
          <div className="panel-header">
            <h3>
              {currentResult.status === 'APPROVED' && 'PAYMENT APPROVED'}
              {currentResult.status === 'BLOCKED' && 'PAYMENT HALTED - ANOMALY DETECTED'}
              {currentResult.status === 'ERROR' && 'PLATE READ FAILED'}
            </h3>
            <span className={`badge badge-${currentResult.status !== 'APPROVED' ? 'high' : 'normal'}`}>
              {currentResult.status}
            </span>
          </div>
          
          <div className="panel-body">
            <p className="message">{currentResult.message}</p>
            {currentResult.anomaly && (
              <div className="anomaly-details">
                <p><strong>Reason:</strong> {currentResult.anomaly.reason}</p>
                <button className="btn btn-danger override-btn" onClick={handleResolve}>
                  Verify Vehicle Plate Matches Tag & Force Accept Payment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="table-container" style={{marginTop: '24px'}}>
        <div className="table-header">Recent Lane Activity</div>
        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>RFID Tag (EPC)</th>
                <th>OCR Plate</th>
                <th>Direction</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No recent activity</td></tr>
              ) : (
                recentScans.map((scan, i) => (
                  <tr key={i}>
                    <td className="mono" style={{color: 'var(--text-muted)'}}>
                      {new Date(scan.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </td>
                    <td className="mono">{scan.tag_id}</td>
                    <td className="mono" style={{fontWeight: 600}}>{scan.vehicle_plate}</td>
                    <td>{scan.direction}</td>
                    <td>
                      <span className="badge badge-normal">PROCESSED</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default App
