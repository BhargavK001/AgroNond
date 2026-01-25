# AgroNond Deployment Guide

This guide covers deploying AgroNond to various platforms. The codebase is configured to work on any platform with minimal changes.

---

## Quick Reference

| Component | Platforms Supported | Required Env Vars |
|-----------|---------------------|-------------------|
| **Frontend** | Vercel, Render, AWS S3+CloudFront, Netlify | `VITE_API_URL` |
| **Backend** | Render, AWS EC2, Railway, Heroku | `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` |

---

## Environment Variables

### Backend (`apps/server`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for JWT signing (64+ chars recommended) |
| `FRONTEND_URL` | ✅ | Frontend URL(s), comma-separated for multiple |
| `PORT` | ❌ | Server port (default: 5000) |
| `NODE_ENV` | ❌ | `development` or `production` |
| `BREVO_API_KEY` | ❌ | Email service API key |

### Frontend (`apps/web`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API URL (e.g., `https://api.example.com`) |

> **Note:** Frontend env vars must be prefixed with `VITE_` and are embedded at build time.

---

## Deployment: Render (Recommended)

### Backend

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `apps/server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. Add environment variables in Render dashboard
5. Deploy!

### Frontend

1. Create a new **Static Site** on Render
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add `VITE_API_URL` pointing to your backend
5. Deploy!

---

## Deployment: Vercel (Frontend Only)

1. Import project from GitHub
2. Configure:
   - **Root Directory:** `apps/web`
   - **Framework Preset:** Vite
3. Add environment variable:
   - `VITE_API_URL` = Your backend URL
4. Deploy!

> The included `vercel.json` handles SPA routing automatically.

---

## Deployment: AWS

### Frontend (S3 + CloudFront)

1. **Build the frontend:**
   ```bash
   cd apps/web
   npm install
   VITE_API_URL=https://your-api.com npm run build
   ```

2. **Create S3 bucket:**
   - Enable static website hosting
   - Set index document: `index.html`
   - Set error document: `index.html` (for SPA routing)

3. **Upload build:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

4. **Create CloudFront distribution:**
   - Origin: S3 bucket
   - Default root object: `index.html`
   - Error pages: 404 → `/index.html` (200 response)

### Backend (EC2)

1. **Launch EC2 instance** (Ubuntu recommended)

2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and setup:**
   ```bash
   git clone https://github.com/your-repo/AgroNond.git
   cd AgroNond/apps/server
   npm install
   ```

4. **Create environment file:**
   ```bash
   cp .env.production.example .env
   # Edit .env with your production values
   nano .env
   ```

5. **Install PM2 for process management:**
   ```bash
   sudo npm install -g pm2
   pm2 start src/index.js --name agronond-api
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Setup SSL with Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## Troubleshooting

### CORS Errors

**Symptom:** API calls fail with "blocked by CORS policy"

**Solution:** Ensure `FRONTEND_URL` in backend includes your frontend domain:
```bash
# Single origin
FRONTEND_URL=https://app.example.com

# Multiple origins
FRONTEND_URL=https://app.example.com,https://staging.example.com
```

### 404 on Page Refresh

**Symptom:** Refreshing any page except `/` shows 404

**Solution:** Ensure your hosting platform is configured for SPA routing:
- **Vercel:** Included `vercel.json` handles this
- **Render:** Included `render.yaml` handles this
- **S3/CloudFront:** Set error page to `index.html` with 200 response
- **Nginx:** Use `try_files $uri $uri/ /index.html;`

### API Connection Failed

**Symptom:** Frontend can't reach backend

**Solutions:**
1. Verify `VITE_API_URL` is set correctly (no trailing slash)
2. Ensure backend `FRONTEND_URL` includes frontend origin
3. Check backend is running and accessible

---

## Local Development

No changes needed from the deployment configuration:

```bash
# Terminal 1 - Backend
cd apps/server
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

Frontend dev server automatically proxies `/api` to `localhost:5000`.
