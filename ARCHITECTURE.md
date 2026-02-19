# Last Minutes - Architecture & Design

## 📐 System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser/Client                        │
│  (Web Speech API, shadcn/ui, Zustand, TanStack Query)      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                    Next.js App Router                        │
│              (API Routes, Server Components)                 │
├─────────────────────────────────────────────────────────────┤
│ Authentication      │ API Routes    │ Admin Panel           │
│ - BetterAuth        │ - Transcripts │ - Dashboard           │
│ - Role-based        │ - Translate   │ - User Management     │
│ - JWT/Sessions      │ - Upload      │ - System Settings     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Business Logic Layer                        │
│   (Features, Hooks, Stores, Utilities, Validations)         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Data Access Layer                         │
│            (Prisma ORM, PostgreSQL)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 External Services                            │
│  ├─ LibreTranslate (Translation)                            │
│  ├─ Faster-Whisper (Speech-to-Text)                        │
│  ├─ Upstash Redis (Rate Limiting)                          │
│  └─ PostgreSQL Database                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Folder Structure & Responsibilities

### `/src/app` - Next.js Routes
Routes organized by concern:

```
(marketing)/     - Public landing page & info
├── page.tsx     - Home/features/pricing
├── layout.tsx   - Marketing layout

(auth)/          - Authentication flows
├── signin/      - Sign in page
├── signup/      - Sign up page
├── layout.tsx   - Auth layout with styling

(app)/           - Protected application
├── page.tsx     - Main dictation workspace
├── dashboard/   - Transcripts dashboard
├── layout.tsx   - App wrapper with providers

admin/           - Admin panel (requires ADMIN role)
├── page.tsx     - Dashboard & stats
├── users/       - User management
├── settings/    - System configuration
├── layout.tsx   - Admin sidebar layout

api/             - API routes
├── auth/[...all]/       - BetterAuth handler
├── transcripts/         - CRUD operations
├── transcripts/[id]/    - Specific transcript routes
├── translate/           - Translation service
└── admin/               - Admin endpoints
```

### `/src/features` - Feature Modules
Feature-based organization with independent logic:

```
dictation/
├── utils.ts              - Speech utilities, segmentation
└── exports.ts            - Export/download logic

translation/
├── utils.ts              - Language models, detection, fallback logic
└── providers.ts          - LibreTranslate, Argos Translate

upload/
├── utils.ts              - File validation, storage
└── handlers.ts           - Upload processing

transcripts/
├── utils.ts              - Metadata, export formats
└── queries.ts            - Database queries

dashboard/
├── utils.ts              - Statistics, user profile
└── components.tsx        - Dashboard widgets

billing/
├── plans.ts              - Subscription tiers
└── limits.ts             - Usage limits

admin/
├── utils.ts              - Admin actions, audit
└── reports.ts            - Analytics reports
```

### `/src/components` - Reusable UI
```
ui/                       - shadcn/ui components
├── button.tsx
├── card.tsx
├── input.tsx
└── ... (other UI primitives)

providers.tsx             - React Query + providers
```

### `/src/hooks` - Custom React Hooks
```
useSpeechRecognition.ts  - Speech Recognition API wrapper
index.ts                 - React Query hooks (transcripts, translation)
```

### `/src/store` - State Management (Zustand)
```
dictation.ts             - Speech state (listening, transcript, language)
```

### `/src/lib` - Core Utilities
```
auth.ts                  - BetterAuth configuration
db.ts                    - Prisma client singleton
validations.ts           - Zod schemas for all inputs
utils.ts                 - General helpers (format, truncate, etc.)
ratelimit.ts             - Rate limiting with Upstash
errors.ts                - Error types and handling
```

### `/prisma` - Database
```
schema.prisma            - 9 models: User, Transcript, Usage, Subscription, etc.
seed.ts                  - Demo data generation
migrations/              - Database version history
```

## 🔄 Data Flow Examples

### 1. Live Dictation Flow
```
Browser Speech API
    ↓
useSpeechRecognition hook
    ↓ (updates Zustand store)
useDictationStore
    ↓ (renders in DictationWorkspace component)
UI display updates in real-time
```

### 2. Translation Flow
```
User enters target language + clicks translate
    ↓
POST /api/translate
    ↓ (validates with Zod)
Calls LibreTranslate API
    ↓ (logs stats to DB)
Stores TranslationStat record
    ↓
Returns translated text to client
    ↓
Display in translation panel
```

### 3. Create Transcript Flow
```
POST /api/transcripts
    ↓
Validates with createTranscriptSchema
    ↓
Checks user authenticated + usage limits
    ↓
Creates Transcript record with metadata
    ↓
Updates User's Usage record
    ↓
Creates AuditLog entry
    ↓
Returns transcript with ID
```

### 4. Admin Analytics Flow
```
GET /api/admin/stats
    ↓
Queries aggregated data from Prisma
    ├─ Total users count
    ├─ Active users (sessions not expired)
    ├─ Transcript count
    ├─ Language distribution
    └─ Usage trends
    ↓
Returns formatted stats JSON
    ↓
Renders charts in admin dashboard
```

## 🔐 Security Architecture

### Authentication Flow
```
User signs up
    ↓
BetterAuth creates User + Account + Session
    ↓
Session token stored in HTTP-only cookie
    ↓
Each request validates session
    ↓
Role checked for protected routes/actions
    ↓
AuditLog created for sensitive actions
```

### API Security
```
Request → RateLimit check
    ↓
→ Zod validation
    ↓
→ Auth check
    ↓
→ Role check
    ↓
→ Business logic
    ↓
→ Response with errors hidden from client
```

## 📊 Database Design

### Entity Relationships
```
User (1) ──→ (0..1) Subscription
      (1) ──→ (0..1) Usage
      (1) ──→ (N) Transcript
      (1) ──→ (N) TranslationStat
      (1) ──→ (N) AuditLog

Transcript references User + Language codes
TranslationStat references User + Language pairs
AuditLog references User + action/resource
```

### Query Optimization
- Indexed on: `userId`, `createdAt`, `email`, `role`
- eager loading via Prisma select
- Aggregations at DB level (count, sum)
- Pagination with `take`/`skip`

## 🚀 Scalability Considerations

### Current
- ✅ Single Next.js server
- ✅ PostgreSQL database
- ✅ External translation/transcription services
- ✅ Rate limiting via Upstash Redis

### Future Ready
- 🔄 Move to Vercel Edge Functions for API routes
- 🔄 Add Bull/Redis for background jobs
- 🔄 Implement WebSocket for real-time collaboration
- 🔄 Multi-tenant support with organization table
- 🔄 Team accounts and revenue sharing
- 🔄 API rate limiting per plan tier
- 🔄 Cache translations with TTL
- 🔄 CDN for static assets

## 🧪 Testing Strategy

### API Tests
- Zod validation errors
- Auth required checks
- Rate limit behavior
- Database transaction integrity

### Component Tests
- Speech recognition mock
- Translation UI state
- Download/export functionality

### E2E Tests
- Full signup → dictation → transcript flow
- Admin user management
- File upload and transcription

## 📈 Performance Metrics

### Current Targets
- Page load: < 2s
- API response: < 500ms
- Translation: < 2s (batched in 2s chunks)
- Database query: < 100ms (indexed)

### Monitoring
- Frontend: Web Vitals
- Backend: API response times via logs
- Database: Query slow logs
- Services: External API status

## 🔑 Key Design Decisions

1. **Feature-Based Organization** - Each feature is independent, easier to scale individually
2. **Zod Validation** - Type-safe, composable schema validation before DB
3. **Zustand for Local State** - Lightweight, no boilerplate, works well with React 19
4. **Prisma ORM** - Type-safe, migrations, good for rapid development
5. **BetterAuth** - Minimal setup, good defaults, extensible
6. **Server Components by Default** - Only use "use client" when needed
7. **Error Isolation** - Features fail gracefully with fallbacks

These architectural decisions prioritize:
- ✅ Developer experience
- ✅ Type safety
- ✅ Scalability
- ✅ Security
- ✅ Performance
