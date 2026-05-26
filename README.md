# JanSoochna — Hyperlocal Civic Engagement Portal

JanSoochna is a hyperlocal civic-engagement web application designed for Indian citizens (primarily in tier-2/3 cities). It functions as a daily neighborhood utility and a civic accountability tool.

---

## Technical Stack
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Backend**: Node.js + Express.js v4 + Socket.io (real-time updates)
- **Frontend**: React 18 (Vite) + Tailwind CSS + Leaflet maps
- **PDF Engine**: PDFKit (bilingual legal petitions) + Cloudinary upload

---

## Project Structure
- `/server`: Express.js backend source code (Models, Controllers, Routes, Seeds).
- `/client`: Vite React application (Contexts, Checklists, Leaflet Map views, Scorecards).

---

## Environment Configuration

### 1. Server Configuration (`/server/.env`)
Create a `.env` file in the `server/` directory with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jansoochna
JWT_SECRET=supersecretjwtsecretkey
JWT_REFRESH_SECRET=supersecretrefreshjwtsecretkey

# Cloudinary credentials for hosting photos and petition PDFs
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Assistant Integration (Anthropic Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key

# SMS Gateway (MSG91)
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_TEMPLATE_ID=your_template_id
NODE_ENV=development
```

### 2. Client Configuration (`/client/.env`)
Create a `.env` file in the `client/` directory with:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Developer Fallbacks (For Local Testing)

1. **OTP Login**: Since actual SMS gateways charge fees, when running in `NODE_ENV=development`, the MSG91 API call will print the generated 6-digit OTP code directly to the **Server Console logs**. Simply copy this OTP from the server terminal and paste it on the client verification screen.
2. **AI JanBot Assistant**: If `ANTHROPIC_API_KEY` is not present, JanBot streams a helpful offline response instructing the user to try again later, rather than crashing the chat container.
3. **Cloudinary / PDFs**: Ensure valid Cloudinary credentials are set to enable uploading of petition PDFs. If missing, signature verification still counts, but PDF hosting will output a local log.

---

## Quick Start (Running Locally)

Follow these simple steps:

1. **Install all dependencies**:
   ```bash
   npm run install-all
   ```
2. **Seed Local Database**:
   Seed the database with official Ludhiana ward boundaries, form checklists, and politician report cards:
   ```bash
   npm run seed --prefix server
   ```
3. **Start Development Servers (Backend + Frontend)**:
   Run the project using a single command in the root folder:
   ```bash
   npm run dev
   ```
4. **Access Applications**:
   - Web Client: [http://localhost:5173](http://localhost:5173)
   - API Server: [http://localhost:5000](http://localhost:5000)

---

## Production Deployments

- **Citizen Web App (Vercel):** [https://jansoochna-website.vercel.app](https://jansoochna-website.vercel.app)
- **Admin Dashboard (Vercel):** [https://jansoochna-admin.vercel.app](https://jansoochna-admin.vercel.app)
- **Backend API Server (Render):** [https://jansoochna-api.onrender.com](https://jansoochna-api.onrender.com)

---

## Features Implemented
- **Phase 1 — Auth & Scaffold**: In-memory Access tokens, secure HTTPOnly refresh token rotation, Indian pincode onboarding.
- **Phase 2 — Form Guide Wizard**: 12 Punjab govt form guides, step-by-step document checkmark collection, Tehsil geolocator map, WhatsApp sharing engine.
- **Phase 3 — Mohalla Board**: Dynamic real-time board updates via Socket.io Rooms keyed by area pincode.
- **Phase 4 — Issues Maps**: Drag-and-drop location pins with Nominatim reverse-geocoding, thumbs-up vote system, auto-compiled PDF signature petitions at 50+ votes.
- **Phase 5 — JanBot**: Streaming AI responses using Anthropic Tool-use blocks to search government form indices.
- **Phase 6 — Engagement & Gamification**: Local Leaderboard list, civic rank level-up animations (Nagarik ➔ Sewak ➔ Jan Nayak ➔ Pratinidhi) via canvas-confetti, Politician vikas fund spent progress charts, html2canvas screenshot generator.
- **Phase 7 — Polish**: PWA manifest, service worker offline caching, React Error Boundaries.
