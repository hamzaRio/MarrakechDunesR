# Environment Setup (Safe Example)

Create a `.env` locally (do not commit). Use your real connection string from MongoDB Atlas.

**IMPORTANT:** Never put a credentialed URI in `.env.example`.

Example pattern (intentionally broken so scanners won't match):


mongo + srv : // <USER> : <PASS> @ <CLUSTER-HOST> / <DB-NAME>


Set in your private `.env`:


MONGODB_URI=<your real URI>
SESSION_SECRET=<random long string>
JWT_SECRET=<random long string>
CLIENT_URL=http://localhost:5173,https://
<your-vercel-app>.vercel.app
PORT=5000

Frontend

VITE_API_URL=https://<your-render-backend>

Optional
VITE_ASSETS_BASE=https://<your-render-backend>/assets
VITE_ENABLE_PROMO_VIDEO=false
