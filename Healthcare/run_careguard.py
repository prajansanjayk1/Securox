"""
CAREGUARD — Single-Command Healthcare Security Platform Launcher
Starts FastAPI backend and Vite frontend concurrently.
Zero Synthetic Data Policy.
"""

import os
import sys
import time
import subprocess

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")
    datasets_dir = os.path.join(root_dir, "datasets")

    cyber_dir = os.path.join(root_dir, "cyberdatasets")

    print("=" * 75)
    print(" 🛡️  CAREGUARD — CYBER-TO-CARE HEALTHCARE SECURITY INTELLIGENCE")
    print("=" * 75)
    print(f"[*] Workspace Root:       {root_dir}")
    print(f"[*] Clinical Datasets:    {datasets_dir}")
    print(f"[*] Cyberdatasets Folder: {cyber_dir}")
    print(f"[*] Backend Directory:    {backend_dir}")
    print(f"[*] Frontend Directory:   {frontend_dir}")
    print("=" * 75)

    if os.path.exists(cyber_dir):
        print(f"[*] Ingestion Ready: cyberdatasets directory verified.")

    if not os.path.exists(datasets_dir):
        print(f"[!] Warning: Datasets folder not found at {datasets_dir}!")
    else:
        ds_count = len(os.listdir(datasets_dir))
        print(f"[*] Verified {ds_count} files present in clinical datasets folder.")

    print("\n[1/2] Starting CAREGUARD FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=backend_dir
    )

    time.sleep(2)

    print("\n[2/2] Starting CAREGUARD Vite Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir
    )

    print("\n" + "=" * 75)
    print("  🚀 CAREGUARD SERVICES OPERATIONAL")
    print("  ➜ Frontend UI:         http://localhost:5173")
    print("  ➜ Backend Swagger API: http://127.0.0.1:8000/docs")
    print("  ➜ Cyber Overview API:  http://127.0.0.1:8000/api/cyber/overview")
    print("  ➜ IoMT Devices API:    http://127.0.0.1:8000/api/cyber/devices")
    print("  ➜ Systemic Risk API:   http://127.0.0.1:8000/api/risk")
    print("  ➜ Cartography API:     http://127.0.0.1:8000/api/dependencies")
    print("=" * 75)
    print("\nPress Ctrl+C to stop all services.")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping CAREGUARD services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Services stopped.")

if __name__ == "__main__":
    main()

