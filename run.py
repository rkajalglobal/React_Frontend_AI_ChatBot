import os
import sys
import time
import subprocess
import webbrowser
from pathlib import Path

# Main project directory
BASE_DIR = Path(__file__).resolve().parent


def main():

    backend_process = None
    frontend_process = None

    try:
        print("=" * 50)
        print("Starting BEPEC AI Assistant")
        print("=" * 50)

        # STEP 1: Start FastAPI backend
        print("\nStarting FastAPI backend...")

        backend_process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "server:app",
                "--host",
                "127.0.0.1",
                "--port",
                "8000"
            ],
            cwd=BASE_DIR
        )

        # STEP 2: Start React frontend
        print("\nStarting React frontend...")

        frontend_process = subprocess.Popen(
            [
                "npm.cmd" if os.name == "nt" else "npm",
                "start"
            ],
            cwd=BASE_DIR,
            env={**os.environ, "BROWSER": "none"}
        )

        # STEP 3: Wait for servers
        print("\nWaiting for servers to initialize...")

        time.sleep(8)

        # STEP 4: Open browser
        print("\nOpening BEPEC AI Assistant...")

        webbrowser.open("http://localhost:3000")

        print("\n" + "=" * 50)
        print("BEPEC AI Assistant is running!")
        print("Frontend: http://localhost:3000")
        print("Backend:  http://127.0.0.1:8000")
        print("Press Ctrl+C to stop the application.")
        print("=" * 50)

        # STEP 5: Keep application running
        while True:

            if backend_process.poll() is not None:
                raise RuntimeError(
                    "FastAPI backend stopped unexpectedly."
                )

            if frontend_process.poll() is not None:
                raise RuntimeError(
                    "React frontend stopped unexpectedly."
                )

            time.sleep(1)

    except KeyboardInterrupt:
        print("\nStopping BEPEC AI Assistant...")

    except Exception as e:
        print(f"\nApplication error: {e}")

    finally:
        for process in (frontend_process, backend_process):
            if process and process.poll() is None:
                process.terminate()

        print("\nApplication stopped.")


if __name__ == "__main__":
    main()