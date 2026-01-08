# Quick Deployment Commands

## Before Deploying - Remove Debug Logs

# Option 1: Keep logs for now (easier for debugging production issues)
# You can remove them later once everything is stable

# Option 2: Remove all console.logs manually from:
# - client/src/components/chat/ChatWindow.jsx (lines 90-98)
# - client/src/context/SocketContext.jsx (emoji prefixed logs)
# - client/src/store/chatStore.js (emoji prefixed logs)
# - server/src/socket/index.js (console.log statements)

## Test Build Locally First

### Test Frontend Build:
```bash
cd client
npm run build
npm run preview
# Visit http://localhost:4173 to test production build
```

### Test Backend:
```bash
cd server
npm start
# Check if it starts without errors
```

## Deploy to Git (Required for Render/Vercel)

```bash
# From root directory
cd C:\Users\HP\Desktop\chat-app

# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/friendchat.git
git branch -M main
git push -u origin main
```

## Deploy Backend (Render)
1. Visit: https://render.com
2. Sign in with GitHub
3. New+ → Web Service
4. Connect your repo
5. Root Directory: `server`
6. Build Command: `npm install`
7. Start Command: `npm start`
8. Add all environment variables (see DEPLOYMENT.md)
9. Create Web Service
10. **SAVE THE URL** (e.g., https://friendchat-xyz.onrender.com)

## Deploy Frontend (Vercel)
1. Update `client/.env.production` with backend URL
2. Visit: https://vercel.com
3. Import Project → GitHub repo
4. Root Directory: `client`
5. Framework: Vite
6. Add environment variables
7. Deploy
8. **SAVE THE URL** (e.g., https://friendchat.vercel.app)

## Update Backend CORS
1. Go to Render dashboard
2. Environment Variables
3. Update CLIENT_URL with your Vercel URL
4. Save & Redeploy

## Test!
Visit your Vercel URL and test the app!

---

Ready to deploy? Start with the Git commands above!
