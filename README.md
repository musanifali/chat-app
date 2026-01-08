# FriendChat

A lightweight real-time chat application for friends, built with React, Node.js, Socket.io, and MongoDB. Features text messaging, image sharing, and voice messages.

## 🎯 Features

- ✅ **Authentication**
  - Email/password signup with Firebase
  - Email verification
  - Password reset
  - JWT session management

- ✅ **User Profile**
  - Profile picture upload
  - Custom display name and bio
  - Online/offline status
  - Last seen timestamp

- ✅ **Friend System**
  - Search users by username/email
  - Send/accept/decline friend requests
  - Block/unblock users
  - Friends list with online status

- ✅ **Real-time Chat**
  - Instant messaging via WebSocket
  - Message status (sent/delivered/read)
  - Typing indicators
  - Online/offline notifications
  - Message history with pagination

- ✅ **Media Sharing**
  - Image upload and sharing
  - **Voice messages** (up to 2 minutes)
  - Audio playback with speed controls (1x, 1.5x, 2x)
  - Visual waveform during recording

- ✅ **Message Features**
  - Edit messages (within 15 minutes)
  - Delete messages (for me/everyone)
  - Reply to messages
  - Emoji support

- ✅ **Notifications**
  - In-app notifications
  - Push notifications (Firebase FCM)
  - Mute conversations

## 🚀 Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Socket.io Client
- Zustand (State Management)
- React Router
- Firebase Auth
- Audio Recorder Polyfill

### Backend
- Node.js
- Express
- Socket.io
- MongoDB (Mongoose)
- Firebase Admin
- Cloudinary (Image & Audio Storage)
- JWT Authentication

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Firebase project (free tier)
- Cloudinary account (free tier)

## 🛠️ Installation

### 1. Clone the repository
```bash
cd chat-app
```

### 2. Set up Backend

```bash
cd server
npm install
```

Create `.env` file in server directory:
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Firebase Admin
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### 3. Set up Frontend

```bash
cd ../client
npm install
```

Create `.env` file in client directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Firebase Client
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Running the Application

**Start Backend** (from server directory):
```bash
npm run dev
```
Server will run on `http://localhost:5000`

**Start Frontend** (from client directory):
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📱 Voice Messages

Voice messages are a core feature allowing users to record and send audio clips:

### Recording
- Click the microphone icon to start recording
- Maximum duration: 2 minutes (auto-stops)
- Visual waveform shows during recording
- Pause/resume functionality
- Preview before sending

### Playback
- Play/pause controls
- Seek through progress bar
- Playback speed: 1x, 1.5x, 2x
- Duration display

### Technical Details
- Format: WebM (Opus codec) or MP3
- Bitrate: 64kbps
- Mono audio
- Compressed for bandwidth efficiency
- Stored in Cloudinary

## 🏗️ Project Structure

```
chat-app/
├── server/
│   ├── src/
│   │   ├── config/          # Database, Firebase, Cloudinary
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, upload, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── socket/          # Socket.io handlers
│   │   └── app.js           # Express app
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── friends/
│   │   │   ├── profile/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── pages/           # Page components
│   │   ├── context/         # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand stores
│   │   ├── utils/           # Helper functions
│   │   └── main.jsx         # Entry point
│   └── package.json
│
└── README.md
```

## 🔐 Security Features

- Passwords hashed by Firebase (never stored)
- JWT token authentication
- HTTPS only in production
- Rate limiting (100 req/min/user)
- Input validation and sanitization
- XSS and injection prevention
- CORS protection
- File upload validation

## 📊 Database Schema

### Users
- Firebase UID, email, username
- Display name, avatar, bio
- Online status, last seen
- Friends array, blocked users
- FCM tokens, muted conversations

### Messages
- Conversation ID, sender
- Type (text/image/audio)
- Content (text or media URL)
- Audio duration (for voice messages)
- Reply-to reference
- Status (sent/delivered/read)
- Deleted flags

### Conversations
- Participants (2 users)
- Last message preview
- Muted by users
- Timestamps

### Friend Requests
- From/to users
- Status (pending/accepted/declined)
- Timestamps

## 🚀 Deployment

### Backend (Render)
1. Create Render account and new Web Service
2. Connect GitHub repository
3. Configure build: `npm install`
4. Configure start: `npm start`
5. Add environment variables
6. Deploy

### Frontend (Vercel)
1. Create Vercel account
2. Import project from GitHub
3. Framework preset: Vite
4. Add environment variables
5. Deploy

### Keep Server Awake
Use cron-job.org to ping `/health` endpoint every 14 minutes (free tier sleeps after 15min idle)

## 💰 Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| Render (Backend) | $0 (free tier) |
| Vercel (Frontend) | $0 (free tier) |
| MongoDB Atlas | $0 (512MB) |
| Firebase Auth + FCM | $0 (50K users) |
| Cloudinary | $0 (25GB/month) |
| **Total** | **$0/month** ✅ |

## 🧪 Testing

The application includes comprehensive testing for:
- Authentication flows
- Friend system
- Real-time messaging
- Voice message recording/playback
- Image uploads
- Offline message handling
- Message status updates

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 📝 License

MIT

---

Built with ❤️ for friends to stay connected

**Total Features: 32** | **Development Time: 12 weeks** | **Cost: $0/month**
