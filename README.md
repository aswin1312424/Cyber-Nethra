# Cyber Nethra

**Project Overview**
- **Description**: Cyber Nethra is a full-stack web application for reporting, tracking, and analyzing cyber incidents using AI-powered media analysis and a modular backend.
- **Purpose**: Provide citizens, police, and forensic teams tools to report crimes, manage cases, and analyze media (images/videos/URLs) with AI assistance.

**Tech Stack**
- **Frontend**: React (Vite) — code in [src](src)
- **Backend**: Node.js / Express — code in [backend](backend)
- **AI Server**: Python (Keras/TensorFlow) for media/deepfake analysis — code in [ai_server](ai_server)

**Prerequisites**
- **Node.js**: v16+ for frontend and backend
- **Python**: 3.8+ for the AI server (if using AI features)

**Setup & Run (Local)**

- **Backend**:

```bash
cd backend
npm install
npm run dev   # or `node server.js`
```

- **Frontend**:

```bash
cd .
npm install
npm run dev   # starts Vite dev server
```

- **AI Server (optional)**:

```bash
cd ai_server
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
python main.py   # or run the specific notebooks for experiments
```

**Environment Variables**
- **Backend**: create a `.env` inside [backend](backend) with keys like `PORT`, `MONGODB_URI`, `JWT_SECRET`.
- **AI Server**: configure model paths (e.g., `DeepfakeWeights.h5`) or any API keys the analysis needs.

**Project Structure (high level)**
- **Frontend**: [src](src)
  - **Pages**: [src/pages](src/pages) — dashboards and role-specific views
  - **Components**: [src/components](src/components)
- **Backend**: [backend](backend)
  - **Controllers**: [backend/controllers](backend/controllers)
  - **Routers**: [backend/routers](backend/routers)
  - **Models**: [backend/models](backend/models)
- **AI Server**: [ai_server](ai_server)
  - `main.py`, `DeepfakeWeights.h5`, and notebooks for testing

**Build & Deploy**
- **Frontend**: `npm run build` in project root (Vite build). Serve `dist/` with your preferred static host.
- **Backend**: containerize or deploy to Node-friendly host. See [backend/Dockerfile](backend/Dockerfile) if present.
- **AI Server**: containerize (see [ai_server/Dockerfile](ai_server/Dockerfile)). Ensure GPU requirements if using heavy models.

**Contributing**
- **How to contribute**: Fork, create a branch, open PR with concise description and tests or screenshots when applicable.

**Useful Files**
- Frontend entry: [src/main.jsx](src/main.jsx)
- Backend entry: [backend/server.js](backend/server.js)
- AI entrypoints & weights: [ai_server/main.py](ai_server/main.py), [ai_server/DeepfakeWeights.h5](ai_server/DeepfakeWeights.h5)

**License & Contact**
- **License**: Add a license file if you want to open-source the project.
- **Contact**: For questions, reach the project maintainer in the repo or local team.

---

If you want, I can also:
- add example `.env` templates for backend and AI server
- create a minimal `docker-compose.yml` to run all services locally
