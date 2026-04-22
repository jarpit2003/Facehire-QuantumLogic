# fairhire-ai

Production-ready monorepo for FairHire AI — an enterprise ATS-compliant hiring platform.

## Structure

```
fairhire-ai/
├── backend/        # FastAPI — REST API, embeddings, DB layer
├── frontend/       # React + Vite — Candidate & recruiter UI
└── infra/          # Terraform — AWS VPC, ECS, RDS
```

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Infra
```bash
cd infra
terraform init
terraform plan
```
