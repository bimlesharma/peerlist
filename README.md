# PeerList - Privacy-First Academic Analytics Platform

PeerList is a privacy-first, consent-driven academic analytics platform built with Next.js 16, TypeScript, Tailwind CSS, and Supabase. It lets students view and analyze their academic performance while maintaining strict control over what is shared with peers.

## Table of Contents

- [Core Principles](#core-principles)
- [Recent Updates](#recent-updates)
- [Key Features](#key-features)
- [Privacy and Consent Model](#privacy-and-consent-model)
- [How It Works](#how-it-works)
- [Data Flow](#data-flow)
- [Architecture Overview](#architecture-overview)
- [Privacy Safeguards](#privacy-safeguards)
- [Data Control and User Rights](#data-control-and-user-rights)
- [Additional Measures](#additional-measures)
- [Database and Security](#database-and-security)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Supabase Setup](#supabase-setup)
- [Deploying](#deploying)
- [Contributing](#contributing)
- [FAQ](#faq)
- [Disclaimer](#disclaimer)

## Core Principles

- **Consent first**: Analytics and peer visibility are gated by explicit user consent.
- **Privacy by default**: Identity and marks are not shared unless the user opts in.
- **Data minimization**: Only required data is collected and stored.
- **Transparent control**: Users can view and change all privacy settings at any time.

## Recent Updates

- **GDPR-aligned deletion logging**: Account deletion now records a compliance event before data removal.
- **Deletion interstitial**: Users with prior deletions see a gated interstitial after OAuth sign-in.
- **Hardened Supabase policies**: Expanded RLS/RPC safeguards and internal views for compliance workflows.
- **Consent gating polish**: Rankboard and analytics gates refined for clearer opt-in UX.
- **Tailwind v4 syntax migration**: Class utilities updated to new variable syntax (e.g. `text-(--text-muted)`).

## Key Features

- **Academic analytics dashboard**: SGPA/CGPA trends, grade distributions, subject-wise breakdowns
- **Consent-based visibility**: Analytics and charts hide when analytics consent is disabled
- **Peer comparisons**: Optional and strictly opt-in
- **Granular identity controls**: Anonymous, pseudonymous, or fully visible display modes
- **Raw-only mode**: When analytics consent is disabled, only raw marks tables are shown
- **Deletion compliance**: Logged deletion events for auditability
- **Modern UI**: Responsive design, dark/light themes, modern charts and cards

## Who Can Use It

PeerList is for students who want a private, consent-based way to analyze and compare academic performance. The platform is designed to be used by students within the same institution/college, with peer visibility limited to users who opt in and match college scope.

## How to Use the Platform

1. **Sign in** using GitHub OAuth
2. **Complete onboarding** with your student profile and consent preferences
3. **Submit marks** semester-wise and subject-wise
4. **View dashboard** (analytics visible only if `consent_analytics` is enabled)
5. **Manage privacy** in Settings (analytics, peer visibility, identity mode)
6. **Peers & rankboard** are only available if you opt in to sharing

## Privacy and Consent Model

### Consent Flags

- **`consent_analytics`**: Controls access to analytics (charts, SGPA/CGPA, aggregates)
- **`consent_rankboard`**: Controls access to the rankboard feature
- **`marks_visibility`**: Controls whether a student’s marks are shared with peers
- **`display_mode`**: Controls identity visibility on peer views

### Display Modes

- **`anonymous`**: No real name, no real avatar
- **`pseudonymous`**: Deterministic pseudonym, no real avatar
- **`visible`**: Real name and avatar allowed

### Raw-Only Mode

When `consent_analytics` is false:

- All charts and aggregated stats are hidden
- Only raw marks tables are shown
- No SGPA, CGPA, total credits, or derived totals

## How It Works

1. **Sign in** with GitHub OAuth via Supabase Auth
2. **Complete onboarding** to set your student profile and consent settings
3. **Submit marks** (self-submitted) which are stored per semester and per subject
4. **View analytics** only if `consent_analytics` is enabled
5. **Share with peers** only if `marks_visibility` is enabled
6. **Control identity** via `display_mode` (anonymous, pseudonymous, visible)
7. **Audit trail** logs any consent changes in `consent_log`

## Data Flow

1. **Auth**: Users sign in via GitHub OAuth (Supabase Auth)
2. **Profile**: Student data is stored with consent fields
3. **Results**: Academic records and subjects are stored in normalized tables
4. **Dashboard**: Analytics are computed client-side and gated by consent
5. **Peers**: Peer visibility is gated by mutual consent and marks sharing

## Architecture Overview

- **Frontend**: Next.js App Router with server components + client components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Security**: Row Level Security policies, secure RPC functions
- **Charts**: Recharts-based visualizations

## Privacy Safeguards

- **Explicit consent gates** for analytics and rankboard features
- **Mutual opt-in** for peer visibility (both sides must share)
- **Identity masking** based on `display_mode`
- **Raw-only analytics mode** when `consent_analytics` is disabled
- **No background data scraping**; all data is user-submitted

## Data Control and User Rights

- **Change consent any time** in Settings (effective immediately)
- **Opt out of sharing** to remove your peer visibility
- **Switch identity mode** without changing your data
- **No analytics without consent**; you still retain access to raw tables

## Additional Measures

- **RLS policies** ensure data isolation and college-scoped peer access
- **Secure RPCs** for peer data with consent checks
- **Audit logging** for consent changes with timestamps
- **Defensive defaults**: no visibility without explicit opt-in

## Database and Security

### Tables

- `students`: identity + consent settings
- `academic_records`: per-semester records
- `subjects`: per-subject marks
- `consent_log`: immutable audit trail of consent changes

### Security Features

- **Row Level Security (RLS)** enforced across all data
- **Audit logging** for consent updates
- **Scoped peer access** by college and mutual opt-in
- **No analytics without consent** (front-end gate + safe data flow)

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── deletion-interstitial/   # Post-deletion re-registration gate
│   ├── onboarding/              # First-time user setup
│   ├── auth/callback/           # OAuth callback handler
│   └── (authenticated)/         # Protected routes
│       ├── dashboard/           # Analytics dashboard
│       ├── peers/               # Peer directory and profiles
│       ├── rankboard/           # Rankboard (optional)
│       └── settings/            # Consent management
├── components/
│   ├── Charts/                  # Recharts components
│   ├── Navbar.tsx               # Navigation
│   ├── PublicNavbar.tsx         # Landing page navigation
│   ├── PublicFooter.tsx         # Landing page footer
│   ├── ThemeProvider.tsx        # Dark/light mode
│   └── ResultTable.tsx          # Raw and full data tables
├── lib/
│   ├── supabase/                # Supabase clients
│   ├── grading.ts               # SGPA/CGPA calculations
│   ├── privacy.ts               # Identity masking utilities
│   └── utils.ts                 # Utility functions
└── types/
    └── index.ts                 # TypeScript interfaces

public/
└── favicon.svg

supabase/
├── migrations/                  # SQL migrations
└── schema.sql                   # Base schema
```

## Getting Started

### 1. Install dependencies

```bash
cd peerlist
npm install
```

### 2. Configure environment

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Update `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key

## Supabase Setup

1. Create a new Supabase project
2. Enable GitHub provider in **Auth > Providers**
3. Create GitHub OAuth App:
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
4. Run SQL schema from [supabase/schema.sql](supabase/schema.sql)
5. Apply migrations from [supabase/migrations](supabase/migrations)

## Local Development

Common commands:

```bash
npm run dev
npm run build
npm run lint
```

## Deploying

### Production Checklist

1. **Supabase project**
    - Create a production Supabase project.
    - Apply [supabase/schema.sql](supabase/schema.sql) and all migrations in [supabase/migrations](supabase/migrations).
    - Enable GitHub OAuth provider.
    - Configure **Redirect URLs** in Supabase Auth:
      - `https://YOUR-DOMAIN/auth/callback`
      - (Optional) `https://YOUR-PREVIEW-DOMAIN/auth/callback`

2. **GitHub OAuth App**
    - Update GitHub OAuth App settings:
      - **Homepage URL**: `https://YOUR-DOMAIN`
      - **Callback URL**: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`

3. **Environment variables**
    Set the same variables in your hosting provider:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Build & deploy**
    - Ensure a successful local build:
      - `npm run build`
    - Deploy the Next.js app (Vercel recommended).

### Vercel (Recommended)

1. Import the repository in Vercel.
2. Set environment variables in **Project Settings → Environment Variables**.
3. Deploy the project.
4. Add the Vercel domain(s) to Supabase Auth Redirect URLs.

### Netlify (Alternative)

1. Create a new site from your repo.
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in **Site settings → Environment**.
5. Add the Netlify domain(s) to Supabase Auth Redirect URLs.

### Custom Hosting (Node)

1. Build the app:
    - `npm run build`
2. Start the server:
    - `npm start`
3. Ensure environment variables are set in your runtime.
4. Add your domain to Supabase Auth Redirect URLs.

## Contributing

Contributions are welcome. If you want to improve privacy controls, analytics, UI, or documentation, feel free to open a PR.

Suggested ways to contribute:

- Improve privacy controls and consent flows
- Add accessibility enhancements
- Improve data validation and error handling
- Expand documentation and FAQs

Before submitting a PR:

1. Run tests/lint locally
2. Keep changes focused and well-documented
3. Update README if behavior changes

## FAQ

**Q: Is PeerList affiliated with my university?**
No. PeerList is an independent, student-run platform.

**Q: Do you fetch marks automatically?**
No. All data is manually submitted by students.

**Q: Who can see my identity?**
Only peers if you allow it via `display_mode` and opt into sharing.

**Q: What happens when I disable analytics consent?**
Only raw marks tables are shown; all charts and aggregates are hidden.

## Disclaimer

PeerList is not affiliated with or endorsed by any university. All data is voluntarily submitted by students. Rankboards are generated solely from self-submitted data and do not represent official academic rankings.
