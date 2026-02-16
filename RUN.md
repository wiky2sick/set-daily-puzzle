# Run the app locally

## One-time setup

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # mac/linux: .venv\Scripts\activate on Windows
pip install -r requirements.txt
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Root (for concurrently):**
```bash
npm install
```

## Run the app

From repo root:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
