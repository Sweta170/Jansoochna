const mongoose = require('mongoose');

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function getLandingPageHTML(req) {
  const dbState = mongoose.connection.readyState;
  let dbStatusText = 'Disconnected';
  
  if (dbState === 1) {
    dbStatusText = 'Connected';
  } else if (dbState === 2) {
    dbStatusText = 'Connecting';
  }
  
  const clientUrl = process.env.CLIENT_URL || 'https://jansoochna-website.vercel.app';
  const adminUrl = process.env.ADMIN_URL || 'https://jansoochna-admin.vercel.app';
  const nodeEnv = process.env.NODE_ENV || 'development';
  const uptimeText = formatUptime(process.uptime());

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JanSoochna API Portal</title>
  <!-- Google Fonts: Outfit & Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --bg-dark: #090d16;
      --bg-card: rgba(17, 24, 39, 0.7);
      --border-card: rgba(255, 255, 255, 0.06);
      --text-primary: #f3f4f6;
      --text-secondary: #9ca3af;
      --accent-blue: #3b82f6;
      --accent-purple: #8b5cf6;
      --glow-blue: rgba(59, 130, 246, 0.15);
      --glow-purple: rgba(139, 92, 246, 0.15);
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background-color: var(--bg-dark);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      overflow-x: hidden;
      position: relative;
    }
    
    /* Background Glowing Orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      z-index: 0;
      pointer-events: none;
    }
    .orb-1 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%);
      top: -100px;
      left: -100px;
      animation: float-slow 15s infinite alternate ease-in-out;
    }
    .orb-2 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0,0,0,0) 70%);
      bottom: -150px;
      right: -100px;
      animation: float-slow 20s infinite alternate-reverse ease-in-out;
    }
    
    @keyframes float-slow {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(50px, 40px) scale(1.1); }
    }
    
    /* Main Layout */
    .container {
      width: 100%;
      max-width: 900px;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    /* Glassmorphism Card */
    .card {
      background: var(--bg-card);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-card);
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
      position: relative;
      overflow: hidden;
    }
    
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
    }
    
    /* Typography */
    h1, h2, h3 {
      font-family: 'Outfit', sans-serif;
    }
    
    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 2.5rem;
    }
    
    .logo-container {
      position: relative;
      margin-bottom: 1.5rem;
    }
    
    .logo-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      border-radius: 50%;
      filter: blur(20px);
      opacity: 0.6;
      animation: pulse-glow 3s infinite alternate;
    }
    
    @keyframes pulse-glow {
      0% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.9); }
      100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
    }
    
    .logo {
      position: relative;
      width: 72px;
      height: 72px;
      background: rgba(15, 23, 42, 0.9);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 800;
      color: #fff;
      font-family: 'Outfit', sans-serif;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
    
    .logo span {
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .title {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 0.5rem;
      background: linear-gradient(to right, #ffffff, #d1d5db);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
      max-width: 500px;
      line-height: 1.6;
    }
    
    /* Stats & Status Badges */
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2.5rem;
    }
    
    .status-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    
    .status-item:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
    }
    
    .status-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }
    
    .status-value {
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    /* Glowing Indicator Dots */
    .indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      position: relative;
      display: inline-block;
    }
    
    .indicator-pulse {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      animation: pulse-ring 2s infinite;
    }
    
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    
    /* Colors for status indicators */
    .indicator-green { background-color: #10b981; }
    .indicator-green .indicator-pulse { background-color: #10b981; }
    
    .indicator-amber { background-color: #f59e0b; }
    .indicator-amber .indicator-pulse { background-color: #f59e0b; }
    
    .indicator-red { background-color: #ef4444; }
    .indicator-red .indicator-pulse { background-color: #ef4444; }
    
    /* Navigation / Quick Links */
    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    
    .section-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    
    .link-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.03) 100%);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 1.25rem;
      text-decoration: none;
      color: var(--text-primary);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .link-card:hover {
      border-color: rgba(96, 165, 250, 0.3);
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
      transform: translateY(-3px) scale(1.01);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
    }
    
    .link-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .link-name {
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .link-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    
    .link-icon {
      font-size: 1.2rem;
      color: var(--text-secondary);
      transition: transform 0.3s ease, color 0.3s ease;
    }
    
    .link-card:hover .link-icon {
      transform: translateX(4px);
      color: var(--accent-blue);
    }
    
    /* API Explorer Section */
    .routes-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .routes-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .route-row {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.015);
      border: 1px solid rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      padding: 0.85rem 1.25rem;
      gap: 1rem;
      transition: background 0.2s ease, border-color 0.2s ease;
      font-family: monospace;
      font-size: 0.9rem;
    }
    
    .route-row:hover {
      background: rgba(255, 255, 255, 0.025);
      border-color: rgba(255, 255, 255, 0.06);
    }
    
    .method {
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.75rem;
      width: 70px;
      text-align: center;
      letter-spacing: 0.05em;
    }
    
    .method-get {
      background-color: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    
    .method-post {
      background-color: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    
    .path {
      color: var(--text-primary);
      font-weight: 500;
      flex-grow: 1;
    }
    
    .desc {
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-family: 'Inter', sans-serif;
    }
    
    /* Interactive Ping Section */
    .ping-box {
      margin-top: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.015);
      border: 1px dashed rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.25rem;
    }
    
    .ping-btn {
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      color: white;
      border: none;
      border-radius: 10px;
      padding: 0.6rem 1.25rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: all 0.2s ease;
    }
    
    .ping-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }
    
    .ping-btn:active {
      transform: translateY(1px);
    }
    
    .ping-result {
      font-size: 0.9rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .ping-success {
      color: #10b981;
      font-weight: 600;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.2);
      margin-top: 1rem;
    }
    
    /* Responsive adaptations */
    @media (max-width: 768px) {
      .card {
        padding: 2rem 1.5rem;
      }
      .title {
        font-size: 2rem;
      }
      .route-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .method {
        width: auto;
      }
      .desc {
        margin-top: 0.25rem;
      }
      .ping-box {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo-container">
          <div class="logo-glow"></div>
          <div class="logo"><span>JS</span></div>
        </div>
        <h1 class="title">JanSoochna API Portal</h1>
        <p class="subtitle">Hyperlocal Civic Engagement Portal backend API server powering citizens and admins in tier-2/3 Indian cities.</p>
      </div>
      
      <!-- Status Grid -->
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">API Gateway</span>
          <div class="status-value">
            <span class="indicator indicator-green">
              <span class="indicator-pulse"></span>
            </span>
            Active
          </div>
        </div>
        
        <div class="status-item">
          <span class="status-label">Database (MongoDB)</span>
          <div class="status-value">
            <span class="indicator ${dbState === 1 ? 'indicator-green' : dbState === 2 ? 'indicator-amber' : 'indicator-red'}">
              <span class="indicator-pulse"></span>
            </span>
            ${dbStatusText}
          </div>
        </div>
        
        <div class="status-item">
          <span class="status-label">Environment</span>
          <div class="status-value" style="text-transform: capitalize;">
            ${nodeEnv}
          </div>
        </div>
        
        <div class="status-item">
          <span class="status-label">Server Uptime</span>
          <div class="status-value" style="font-family: monospace;">
            ${uptimeText}
          </div>
        </div>
      </div>
      
      <!-- Quick Navigation -->
      <div class="nav-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          System Interfaces
        </h2>
        <div class="links-grid">
          <a href="${clientUrl}" target="_blank" class="link-card">
            <div class="link-info">
              <span class="link-name">Citizen Web App</span>
              <span class="link-desc">Hyperlocal board, guides & issue map.</span>
            </div>
            <span class="link-icon">➔</span>
          </a>
          
          <a href="${adminUrl}" target="_blank" class="link-card">
            <div class="link-info">
              <span class="link-name">Admin Dashboard</span>
              <span class="link-desc">Manage issues, netas & view statistics.</span>
            </div>
            <span class="link-icon">➔</span>
          </a>
        </div>
      </div>
      
      <!-- API Reference -->
      <div class="routes-section">
        <h2 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-2"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
          Core Endpoints
        </h2>
        <div class="routes-list">
          <div class="route-row">
            <span class="method method-get">GET</span>
            <span class="path">/health</span>
            <span class="desc">System health checklist</span>
          </div>
          <div class="route-row">
            <span class="method method-get">GET</span>
            <span class="path">/api/csrf-token</span>
            <span class="desc">Generate session CSRF token</span>
          </div>
          <div class="route-row">
            <span class="method method-post">POST</span>
            <span class="path">/api/auth/register</span>
            <span class="desc">Register a new citizen account</span>
          </div>
          <div class="route-row">
            <span class="method method-post">POST</span>
            <span class="path">/api/auth/verify-otp</span>
            <span class="desc">Verify mobile OTP code</span>
          </div>
          <div class="route-row">
            <span class="method method-get">GET</span>
            <span class="path">/api/issues</span>
            <span class="desc">Fetch geolocated civic issues</span>
          </div>
          <div class="route-row">
            <span class="method method-post">POST</span>
            <span class="path">/api/janbot</span>
            <span class="desc">AI Agent assistant query stream</span>
          </div>
        </div>
      </div>
      
      <!-- Interactive Ping Box -->
      <div class="ping-box">
        <div style="display:flex; flex-direction:column; gap:0.25rem;">
          <span style="font-weight: 600; font-size: 0.95rem;">Test Connection</span>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">Ping the server API gateway to check network latency.</span>
        </div>
        <div style="display:flex; align-items:center; gap:1rem;">
          <div id="pingStatus" class="ping-result">Status: Ready</div>
          <button id="pingBtn" class="ping-btn" onclick="runPing()">Ping Server</button>
        </div>
      </div>
      
    </div>
    <div class="footer">
      JanSoochna v1.0.0 &copy; 2026. Made for Civic Engagement &amp; Social Accountability.
    </div>
  </div>
  
  <script>
    async function runPing() {
      const btn = document.getElementById('pingBtn');
      const statusText = document.getElementById('pingStatus');
      
      btn.disabled = true;
      btn.innerText = 'Pinging...';
      statusText.innerHTML = 'Status: Waiting...';
      
      const startTime = performance.now();
      try {
        const response = await fetch('/health');
        const duration = Math.round(performance.now() - startTime);
        
        if (response.ok) {
          statusText.innerHTML = 'Status: <span class="ping-success">Online (' + duration + 'ms)</span>';
        } else {
          statusText.innerHTML = 'Status: <span style="color: #ef4444;">Error (' + response.status + ')</span>';
        }
      } catch (err) {
        statusText.innerHTML = 'Status: <span style="color: #ef4444;">Offline / CORS err</span>';
      } finally {
        btn.disabled = false;
        btn.innerText = 'Ping Server';
      }
    }
  </script>
</body>
</html>
  `;
}

module.exports = { getLandingPageHTML };
