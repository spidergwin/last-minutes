# Last Minutes - Professional Speech-to-Text & Live Translation SaaS

A production-grade SaaS web application for speech-to-text transcription with real-time translation support, including Nigerian languages.

## 🚀 Features

- **Live Speech-to-Text Dictation** - Real-time voice-to-text transcription using Web Speech API
- **File Transcription** - Upload audio/video files for professional transcription
- **Real-Time Translation** - Instantly translate transcripts into multiple languages
- **Nigerian Language Support** - Native support for Hausa, Yoruba, Igbo, and Nigerian Pidgin
- **User Dashboard** - Manage all your transcripts in one place
- **Admin Panel** - Comprehensive admin controls with user management and analytics
- **Usage Tracking** - Real-time analytics and usage monitoring
- **Role-Based Access Control** - Secure authentication with role-based permissions
- **Fully Responsive** - Mobile-first design with complete responsive layout
- **WCAG Accessible** - Full accessibility compliance

## 📋 Tech Stack

### Core Framework
- **Next.js 16+** with App Router
- **TypeScript** for type safety
- **Turbopack** for faster builds

### Frontend
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **lucide-react** for icons
- **sonner** for toast notifications
- **Framer Motion** for animations

### State & Data Management
- **TanStack Query (React Query)** for server state
- **TanStack Table** for data tables
- **Zustand** for client state (speech, translation)
- **Zod** for validation

### Backend & Database
- **PostgreSQL** database
- **Prisma ORM** for database access
- **BetterAuth** for authentication

### AI & Translation
- **Web Speech API** for live dictation
- **Faster-Whisper** for file transcription (self-hosted)
- **LibreTranslate** for translation (self-hosted)
- **Argos Translate** as fallback

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional, for Faster-Whisper and LibreTranslate)

### 1. Clone & Install

```bash
git clone <repository>
cd last-minutes
npm install
```

### 2. Environment Setup

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lastminutes"

# BetterAuth
BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
BETTER_AUTH_TRUST_HOST="true"
BETTER_AUTH_URL="http://localhost:3000"

# Translation Services
LIBRETRANSLATE_API_URL="http://localhost:5000"
LIBRETRANSLATE_API_KEY="free"

# Speech Services  
FASTER_WHISPER_API_URL="http://localhost:8000"

# Rate Limiting (Upstash Redis - optional)
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"
```

### 3. Database Setup

```bash
# Create database
createdb lastminutes

# Apply prisma migrations
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Start External Services (Optional)

#### LibreTranslate (Docker)
```bash
docker run -d -p 5000:5000 libretranslate/libretranslate
```

#### Faster-Whisper (Docker)
```bash
docker run -d -p 8000:8000 ghcr.io/faster-whisper-webui/faster-whisper-webui:latest
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (marketing)/       # Landing page
│   ├── (auth)/            # Auth pages (signin, signup)
│   ├── (app)/             # Protected app routes
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── features/              # Feature modules
│   ├── dictation/         # Speech-to-text logic
│   ├── translation/       # Translation utilities
│   ├── upload/            # File upload handling
│   ├── transcripts/       # Transcript management
│   ├── dashboard/         # User dashboard
│   ├── billing/           # Billing & subscriptions
│   └── admin/             # Admin features
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── store/                # Zustand stores
├── lib/                  # Utilities & helpers
│   ├── auth.ts          # BetterAuth setup
│   ├── db.ts            # Prisma client
│   ├── validations.ts   # Zod schemas
│   ├── utils.ts         # Helper functions
│   └── ratelimit.ts     # Rate limiting
└── prisma/              # Database schema
    ├── schema.prisma    # Database models
    └── seed.ts          # Seed script
```

## 🗄️ Database Models

- **User** - User accounts with roles (USER, ADMIN, SUPER_ADMIN)
- **Transcript** - Stored transcriptions with translations
- **Usage** - Track user usage metrics
- **Subscription** - Billing and plan information
- **TranslationStat** - Analytics on translation usage
- **SystemLog** - System-wide logging
- **AuditLog** - Security audit trail

## 🔐 Security Features

- ✅ Zod validation on all API routes
- ✅ Role-based middleware for protected routes
- ✅ Rate limiting on API endpoints
- ✅ Secure headers configuration
- ✅ File validation and virus scanning ready
- ✅ No sensitive data in logs
- ✅ Strict TypeScript typing
- ✅ Error boundaries and fallbacks

## 📊 Admin Panel

Access at `/admin` (requires admin role):

- **Dashboard** - Real-time analytics and metrics
- **Users** - User management, search, filter, suspend
- **Settings** - System configuration and feature toggles
- **Logs** - Audit trail with filtering by level and date

## 🎯 API Endpoints

### Transcripts
- `POST /api/transcripts` - Create new transcript
- `GET /api/transcripts` - List user's transcripts
- `GET /api/transcripts/[id]` - Get specific transcript
- `PUT /api/transcripts/[id]` - Update transcript
- `DELETE /api/transcripts/[id]` - Delete transcript

### Translation
- `POST /api/translate` - Translate text

### Authentication (BetterAuth)
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management

## 🚀 Performance Optimizations

- Server-side pagination
- Query result caching
- Translation result caching
- Lazy-loaded components
- Optimized database queries
- No N+1 queries
- Debounced translation requests

## 📈 Scalability Ready

The architecture supports:
- ✅ Moving AI services to separate servers
- ✅ Background job processing
- ✅ Stripe integration for billing
- ✅ Team accounts and collaboration
- ✅ Multi-tenant support
- ✅ International language expansion

## 🧪 Testing

```bash
# Run linter
npm run lint

# Run type checking
npx tsc --noEmit
```

## 📝 Environment Variables Reference

See `.env.local` template for all available options.

## 🤝 Contributing

Contributions welcome! Please follow:
1. Feature-based folder structure
2. TypeScript strict mode
3. Zod validation for inputs
4. Component composition over large components

## 📄 License

All rights reserved. Last Minutes © 2026

## 🆘 Support

For issues and questions, please open a GitHub issue.

---

**Production-Ready SaaS Application** - Built with enterprise standards and best practices.
