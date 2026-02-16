# Daily SET (MVP)

## Prereqs
- Python 3.10+
- Node 18+

## Backend setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # mac/linux
# .venv\Scripts\activate   # windows powershell
pip install -r requirements.txt
```

Run backend:
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

## Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173  
Backend runs at: http://localhost:8000

## Run both simultaneously (recommended)
From repo root:
```bash
npm install
npm run dev
```
This uses `concurrently` to run:
- FastAPI (uvicorn) on :8000
- Vite dev server on :5173
