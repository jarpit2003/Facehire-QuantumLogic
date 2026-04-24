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

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Activate virtual environment**
   ```bash
   # Windows
   venv312\Scripts\activate
   
   # Mac/Linux
   source venv312/bin/activate
   ```
   You should see `(venv312)` in your terminal prompt.

3. **Install dependencies** (if not already installed)
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server**
   ```bash
   uvicorn main:app --reload --port 8001
   ```
   Backend will run on `http://127.0.0.1:8001`

### Frontend Setup

1. **Navigate to frontend folder** (in a new terminal)
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the frontend dev server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

### Access the Application
- Open browser: `http://localhost:3000`
- Backend API docs: `http://localhost:8001/docs`

### Infra
```bash
cd infra
terraform init
terraform plan
```
