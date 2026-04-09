import os
import sys
from fastapi import FastAPI
import uvicorn

print("DEBUG: Minimal main.py loaded")
sys.stdout.flush()

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "minimal_ok", "message": "Infrastructure check successful"}

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"DEBUG: Starting minimal server on port {port}")
    sys.stdout.flush()
    # Passing the app object directly to avoid re-import issues
    uvicorn.run(app, host="0.0.0.0", port=port)
