# 🎓 GCET Campus Social Platform

A campus-exclusive social platform for **GCET**, **GU**, and **GCOP** students featuring blind dating mechanics, friend-finding, and group communities.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io)

---

## ✨ Features

### 🎭 Blind Dating Mode
- **Swipe-based discovery** — Find potential matches anonymously
- **Progressive revelation** — Profile details unlock as conversations deepen (Levels 0–5)
- **Matching system** — Mutual swipes create matches with anonymous chat

### 🤝 Friend Mode
- Browse and connect with students sharing your interests
- Friend suggestions based on skills, clubs, and study interests
- Send/receive friend requests with notifications

### 💬 Real-time Chat
- 1-on-1 messaging with anonymous mode support
- Reveal system for blind dating conversations
- Socket.IO powered real-time messaging

### 👥 Groups
- Create and join study groups, event groups, and social communities
- Campus-specific or cross-campus group support
- Group chat functionality

### 🔐 Campus Verification
- Institutional email verification
- Phone OTP verification
- Photo verification (blue tick) for identity confirmation

### 🛡️ Safety & Moderation
- Report and block system
- Content moderation with bad-words filter
- Account suspension for policy violations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js (Credentials) |
| **Realtime** | Socket.IO |
| **State** | Zustand + TanStack Query |
| **Styling** | Tailwind CSS 4 |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted, e.g. Supabase)
- Gmail account with App Password (for email verification)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gcet-campus.git
cd gcet-campus

# Install dependencies  
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, NextAuth secret, and Gmail credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start the development server
npm run dev
```

### Running with Real-time Chat

```bash
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — Socket.IO server
npm run socket
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/          # API routes (auth, chat, dating, friends, groups, etc.)
│   ├── auth/         # Auth pages (login, signup, verification)
│   ├── chat/         # Chat interface
│   ├── dashboard/    # User dashboard
│   ├── dating/       # Dating mode (discover + matches)
│   ├── friends/      # Friend mode (browse + connections)
│   ├── groups/       # Group communities
│   └── profile/      # Profile view, edit, settings
├── components/       # Reusable UI components
├── lib/              # Utilities (auth, matching, moderation, etc.)
└── generated/        # Prisma generated client
prisma/
└── schema.prisma     # Database schema
server/
└── index.js          # Socket.IO server
```

---

## 🗄️ Database Schema

Key models: **User**, **Match**, **Chat**, **Message**, **Group**, **GroupMember**, **Report**

Supports 3 campuses (GCET, GU, GCOP), dual modes (Dating/Friend), and progressive reveal levels for blind dating.

---

## 📋 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL (http://localhost:3000) |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `GMAIL_USER` | Gmail address for sending verification emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password |
| `SOCKET_PORT` | Port for Socket.IO server (default: 3001) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for GCET, GU & GCOP students
</p>
