# Athlete Digital Ledger — Implementation Spec v2
**Aligned to existing architecture: Next.js (App Router) + CSS Modules · Express · PostgreSQL (raw `pg`) · JWT/bcryptjs · multer**

---

## 0. How to use this document

Save as `PROJECT_SPEC.md` in the repo root (or your AI IDE's persistent context file). Run the
phased prompts in Section 10 one at a time — do not run all phases unattended. Review and
commit after each phase.

---

## 1. Changes from your original architecture doc — and why

| # | Gap in original plan | Fix in this spec |
|---|---|---|
| 1 | No endpoint for an athlete to view their own mind map | Added `GET /api/athletes/me/mindmap` |
| 2 | No step-wise draft saving (form spec requires "Save as Draft" at every step) | Added `PATCH` endpoints per step, draft state persists across sessions |
| 3 | No document replace/remove before submission | Added `PUT` / `DELETE` on individual documents, locked once submitted |
| 4 | `qrId` could be enumerable if sequential | `qr_id` is a random opaque `UUID`, never derived from a serial key |
| 5 | No refresh token / logout / revocation | Added refresh-token rotation + a revocation table so logout is real |
| 6 | Minors' PII (parent info) collected with no consent step | Added `athlete_guardians` table with explicit consent capture fields |
| 7 | No pagination on list endpoints | All list endpoints now take `page`/`limit` |
| 8 | No audit trail | Added `audit_log` table, written on every verification/status transition |
| 9 | "Schema migrations" unnamed | Standardized on `node-pg-migrate`, numbered migration files |

Two verification flows exist in your system and must stay structurally separate — don't merge
their tables or queues:
- **Identity verification** — verifying a newly registered Athlete or Institute is who they say
  they are (their own onboarding).
- **Achievement verification** — verifying a specific submitted achievement is real.

Same admin role reviews both, but they are different queues, different tables, different
statuses. Conflating them will make the admin dashboard confusing and the schema fragile.

---

## 2. Tech Stack (as you specified — kept as-is)

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router), CSS Modules |
| Backend | Node.js + Express |
| DB access | Raw SQL via `pg`, no ORM |
| Migrations | **`node-pg-migrate`** — numbered, versioned, run in CI before deploy, never run manually against production |
| Auth | JWT + `bcryptjs`, custom RBAC middleware |
| Uploads | `multer` → local `/uploads` in dev, S3-compatible storage in production |
| Query structure | A **repository layer** (one file per domain: `athletes.repo.js`, `achievements.repo.js`, etc.) wrapping raw SQL — this is what makes raw SQL safe to keep at scale. Every query is parameterized (`$1, $2...`), never string-concatenated. No handler should contain inline SQL; it should call the repository. |

---

## 3. Roles & Auth (patched)

Roles unchanged: `System Administrator` (Federation Admin), `Institute`, `Athlete`, `Public`.

**Auth endpoints (patched):**
```
POST /api/auth/login          -- returns access token (short-lived, ~15 min) + refresh token
POST /api/auth/refresh        -- rotates refresh token, issues new access token
POST /api/auth/logout         -- revokes the refresh token (writes to token_revocations)
```
Refresh tokens are stored **hashed** in `refresh_tokens`, one row per issued token, so any single
token can be revoked without invalidating every session. Access tokens are never stored — their
short expiry is the only revocation mechanism for them, which is why they must stay short-lived.

**RBAC middleware pattern:**
```js
// authorize(...allowedRoles) — role check
// authorizeOwnership(resourceLoader) — e.g. an Institute can only touch athletes
//   where athlete.current_institute_id === req.user.instituteId
```
Every Institute/Athlete-scoped route needs *both* — a role check alone is not enough. An
Institute admin with a valid token must still be blocked from reading another institute's
athletes. Write an integration test for this specifically; it's the most common real-world RBAC
bug (correct role, wrong resource).

---

## 4. Database Schema (raw SQL, via `node-pg-migrate`)

Suggested migration file order (one migration per numbered block below):

```
001_extensions_and_enums.sql
002_users.sql
003_institutes.sql
004_athletes.sql
005_athlete_guardians.sql
006_achievements.sql
007_achievement_registration_and_issuance.sql
008_competition_and_result.sql
009_documents.sql
010_refresh_tokens.sql
011_audit_log.sql
```

```sql
-- 001_extensions_and_enums.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('athlete','institute','system_admin');
CREATE TYPE identity_status AS ENUM ('pending','verified','rejected');
CREATE TYPE submitter_role AS ENUM ('athlete','school','college_university','sports_academy','sports_institution','government_approved_facility');
CREATE TYPE achievement_category AS ENUM ('medal','ranking','certificate','personal_best','sports_record','competition_result','selection','participation','award_recognition','scholarship','team_achievement','other');
CREATE TYPE verification_status AS ENUM ('draft','submitted','under_review','verified','rejected','correction_requested');

-- 002_users.sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 003_institutes.sql
CREATE TABLE institutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(200) NOT NULL,
  registration_id VARCHAR(50) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  identity_status identity_status NOT NULL DEFAULT 'pending',
  identity_verified_by UUID REFERENCES users(id),
  identity_verified_at TIMESTAMPTZ,
  identity_rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_institutes_status ON institutes(identity_status);

-- 004_athletes.sql
CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  mai_id VARCHAR(30) UNIQUE,               -- assigned once identity is verified, not at signup
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE NOT NULL,
  is_minor BOOLEAN GENERATED ALWAYS AS (date_of_birth > (CURRENT_DATE - INTERVAL '18 years')) STORED,
  gender VARCHAR(20) NOT NULL,
  primary_sport VARCHAR(100) NOT NULL,
  playing_position VARCHAR(100),
  age_category VARCHAR(50),
  current_institute_id UUID REFERENCES institutes(id),
  profile_photo_url TEXT,
  identity_status identity_status NOT NULL DEFAULT 'pending',
  identity_verified_by UUID REFERENCES users(id),
  identity_verified_at TIMESTAMPTZ,
  identity_rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_athletes_institute ON athletes(current_institute_id);
CREATE INDEX idx_athletes_status ON athletes(identity_status);

-- 005_athlete_guardians.sql  — required whenever athletes.is_minor = true
CREATE TABLE athlete_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  guardian_name VARCHAR(200) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  consent_given_at TIMESTAMPTZ,
  consent_document_key TEXT,               -- storage key for a signed consent form, if collected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 006_achievements.sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  category achievement_category NOT NULL,
  subtype VARCHAR(100) NOT NULL,
  title VARCHAR(300) NOT NULL,
  level VARCHAR(50) NOT NULL,
  achievement_date DATE NOT NULL,
  is_team_achievement BOOLEAN NOT NULL DEFAULT false,
  short_description TEXT,
  reference_number VARCHAR(100),
  official_url TEXT,
  verification_status verification_status NOT NULL DEFAULT 'draft',
  current_step INT NOT NULL DEFAULT 1,      -- tracks which of the 7 form steps was last saved
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  qr_id UUID UNIQUE,                        -- generated ONLY on verify; random, never sequential
  locked BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT chk_no_future_achievement_date CHECK (achievement_date <= CURRENT_DATE)
);
CREATE INDEX idx_achievements_athlete ON achievements(athlete_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_achievements_status ON achievements(verification_status);
CREATE UNIQUE INDEX idx_achievements_qr ON achievements(qr_id) WHERE qr_id IS NOT NULL;

-- 007_achievement_registration_and_issuance.sql
CREATE TABLE achievement_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID NOT NULL UNIQUE REFERENCES achievements(id) ON DELETE CASCADE,
  submitted_by_role submitter_role NOT NULL,
  submitter_name VARCHAR(200) NOT NULL,
  submitted_under VARCHAR(200) NOT NULL,
  entry_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE achievement_issuances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL UNIQUE REFERENCES achievement_registrations(id) ON DELETE CASCADE,
  issued_by VARCHAR(200) NOT NULL,
  reference_number VARCHAR(100),
  issued_date DATE,
  status verification_status NOT NULL DEFAULT 'submitted'
);

-- 008_competition_and_result.sql
CREATE TABLE competition_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID NOT NULL UNIQUE REFERENCES achievements(id) ON DELETE CASCADE,
  name VARCHAR(300) NOT NULL,
  organized_by VARCHAR(200) NOT NULL,
  recognized_by VARCHAR(200),
  governing_federation VARCHAR(200),
  venue_name VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  format VARCHAR(50) NOT NULL,
  age_group VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  CONSTRAINT chk_event_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_district_state_if_india CHECK (
    country <> 'India' OR (district IS NOT NULL AND state IS NOT NULL)
  )
);

CREATE TABLE result_performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID NOT NULL UNIQUE REFERENCES achievements(id) ON DELETE CASCADE,
  result_type VARCHAR(100) NOT NULL,
  final_position INT,
  total_participants INT,
  performance_value NUMERIC(12,3),
  measurement_unit VARCHAR(30),
  is_personal_best BOOLEAN NOT NULL DEFAULT false,
  previous_best NUMERIC(12,3)
);

-- 009_documents.sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes INT NOT NULL,
  sha256_hash CHAR(64) NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_status verification_status NOT NULL DEFAULT 'submitted',
  replaced_at TIMESTAMPTZ,
  CONSTRAINT chk_max_file_size CHECK (file_size_bytes <= 10 * 1024 * 1024)
);

-- 010_refresh_tokens.sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id) WHERE revoked_at IS NULL;

-- 011_audit_log.sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,   -- 'athlete' | 'institute' | 'achievement' | 'document'
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,        -- 'identity_verified' | 'achievement_submitted' | etc.
  actor_id UUID REFERENCES users(id),
  diff JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
```

**Validation rules to enforce in the application layer** (DB constraints above catch the hard
cases; return clean 400s from the API instead of raw Postgres errors):
- Achievement date falls within or immediately after the linked competition's date range
- No future-dated achievements (DB constraint backs this up)
- Team fields required only when `is_team_achievement = true`
- Achievement subtype validated against an allow-list keyed by category, server-side — never
  trust the category/subtype pairing sent by the client
- `athlete_guardians` record required before an athlete's achievement can be submitted, if
  `athletes.is_minor = true`

---

## 5. Endpoints (your structure, gaps patched — additions marked)

### Auth
```
POST /api/auth/login
POST /api/auth/refresh                     [ADDED]
POST /api/auth/logout                      [ADDED]
```

### Public registration & verification
```
POST /api/registration/submit              -- add CAPTCHA + rate limit
GET  /api/registration/sources
POST /api/institute/submit                 -- add CAPTCHA + rate limit
GET  /api/public/verify/:qrId               -- qrId is achievements.qr_id (UUID), never sequential
```
`GET /api/public/verify/:qrId` must return **only** achievement-level fields (title, category,
sport, date, issuing authority, verification status). Never include the athlete's DOB, address,
guardian info, or any document beyond what's explicitly meant to be public. Decide the exact
public field list before building this — it's a data-exposure decision, not a UI detail.

### Athlete (`/api/athletes`, role: athlete)
```
GET    /me
PUT    /me
GET    /me/achievements                     ?category=&status=&page=&limit=   [pagination ADDED]
POST   /me/achievements                     -- creates a draft, Step 1+2 fields only
PATCH  /me/achievements/:id/registration     [ADDED — Step 1 fields, draft only]
PATCH  /me/achievements/:id/competition      [ADDED — Step 3 fields, draft only]
PATCH  /me/achievements/:id/result           [ADDED — Step 4 fields, draft only]
POST   /me/achievements/:id/documents        -- multipart upload
PUT    /me/achievements/:id/documents/:docId [ADDED — replace, draft/correction_requested only]
DELETE /me/achievements/:id/documents/:docId [ADDED — draft/correction_requested only]
POST   /me/achievements/:id/submit           [ADDED — explicit draft -> submitted transition]
PUT    /me/achievements/:id/resubmit         -- after correction_requested
GET    /me/achievements/:id
GET    /me/mindmap                           [ADDED — the athlete's own ledger tree]
```
Every `PATCH`/`PUT` above must return `409 Conflict` once `verification_status` is anything
other than `draft` or `correction_requested`. This is the single most important rule in the
whole write path — enforce it in one shared middleware, not copy-pasted into every handler.

### Institute (`/api/institutes`, role: institute)
```
GET  /me
PUT  /me
GET  /me/athletes                            ?page=&limit=   [pagination ADDED]
GET  /me/athletes/:id
GET  /me/athletes/:id/ledger                 ?page=&limit=   [pagination ADDED]
POST /me/athletes/:id/achievements
GET  /me/athletes/:id/achievements/:achId
```
Same step-wise `PATCH` and document-management endpoints as the Athlete section apply here too,
scoped to `athlete.current_institute_id === req.user.instituteId`.

### Verification & System Admin (`/api/verification`, `/api/users`, role: system_admin)
```
GET  /verification/athletes                  ?status=&page=&limit=
GET  /verification/athletes/:id/details
PUT  /verification/athletes/:id              -- identity_status transition
GET  /verification/institutes
GET  /verification/institutes/:id/details
PUT  /verification/institutes/:id            -- identity_status transition
GET  /verification/achievements               ?status=&page=&limit=
GET  /verification/achievements/:id
PUT  /verification/achievements/:id/status    -- verified | rejected | correction_requested
                                               -- 'verified' generates qr_id, sets locked=true,
                                               --   writes audit_log — server-side only, never
                                               --   a client-supplied field
GET  /verification/athletes/:id/mindmap        -- admin's read-only view of the same tree

GET    /users
POST   /users
PUT    /users/:id/status
DELETE /users/:id                             -- soft delete only; never hard-delete a user
                                               --   who has authored audit_log entries
GET    /users/roles
```

### Utilities
```
POST /api/upload   -- multer; validate real MIME type, not extension; enforce 10MB; compute
                       SHA-256 server-side; reserve an antivirus-scan hook before marking a
                       file "available" for review
```

---

## 6. Mind Map Endpoint — Response Shape

Both `GET /me/mindmap` (athlete) and `GET /verification/athletes/:id/mindmap` (admin) return
the same shape; only the authorization check differs.

```json
{
  "athlete": { "id": "...", "name": "...", "maiId": "...", "sport": "...", "institute": "..." },
  "achievements": [
    {
      "id": "...", "category": "medal", "title": "...", "sport": "...", "date": "...",
      "verificationStatus": "verified",
      "registration": { "role": "...", "submitter": "...", "under": "...", "entryDate": "..." },
      "issuance": { "issuedBy": "...", "referenceNumber": "...", "issuedDate": "...", "status": "..." },
      "competition": { "name": "...", "organizer": "...", "venue": "...", "level": "...", "dates": "..." },
      "result": { "type": "...", "position": "...", "performanceValue": "...", "unit": "...", "isPersonalBest": true },
      "documents": [ { "type": "...", "filename": "...", "verificationStatus": "..." } ]
    }
  ]
}
```
Fetch the whole tree in one call — do not build a lazy per-node API. Frontend rule: the tree-view
icon in the ledger list only appears once at least one achievement has `verificationStatus =
"verified"`; that's a frontend display rule, the endpoint itself returns every status so drafts
still show elsewhere in the UI.

---

## 7. Non-Functional Requirements

**Security**
- `helmet`, strict CORS allowlist, no `*` origin in production
- `bcryptjs` for password hashing (already chosen) — use cost factor ≥ 12
- Every SQL query parameterized (`$1, $2, ...`) through the repository layer — no template
  string ever touches a query
- `multer`: validate actual file content type (a library like `file-type`, not the extension or
  client-supplied `Content-Type`), enforce 10MB limit server-side, compute SHA-256, reserve the
  antivirus-scan hook
- CAPTCHA + rate limiting on both public registration endpoints and `/api/auth/login`
- Rate limiting on `/api/public/verify/:qrId` too — it's unauthenticated and a target for scraping

**Reliability**
- Multi-table writes (achievement + registration, or verify + audit_log) wrapped in a single
  `BEGIN...COMMIT` transaction via the `pg` client — write a small `withTransaction(fn)` helper
  once, reuse everywhere
- Soft deletes only on athletes/institutes/achievements/users
- Every identity/achievement status transition writes to `audit_log`

**Observability**
- Structured JSON logs (e.g. `pino`), request-ID correlation
- `/healthz` (process up), `/readyz` (DB reachable)
- Consistent error shape: `{ "error": { "code", "message", "details?" } }`

**Testing**
- Integration tests against a real Postgres instance (Testcontainers or a Docker Compose test DB)
- Explicit test: Institute A's token cannot read Institute B's athletes (wrong-resource, correct-role)
- Explicit test: a `verified` achievement rejects all further `PATCH`/`PUT` attempts with `409`
- Explicit test: `qr_id` is never sequential/predictable across multiple verified achievements

**Environment & deployment**
- All config via env vars, validated at boot (fail fast on a missing var)
- `node-pg-migrate` runs automatically in the deploy pipeline, never manually against production
- Docker Compose for local dev (app + Postgres + MinIO if S3-compatible storage is used locally)

---

## 8. Frontend — Next.js App Router + CSS Modules, "Apple polish" as concrete tokens

Create one `theme.module.css` (or a `:root` CSS-variables file imported globally) — every
component pulls from these tokens, nothing hardcodes a color or radius inline.

```css
:root {
  --font-display: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;

  --ease-out-apple: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-fast: 200ms;
  --duration-base: 300ms;

  --radius-card: 16px;
  --radius-control: 10px;

  --color-bg: #F5F5F7;
  --color-surface: #FFFFFF;
  --color-text-primary: #1D1D1F;
  --color-text-secondary: #6E6E73;
  --color-accent: #0A84FF;
  --color-divider: rgba(60,60,67,0.12);

  --shadow-card: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06);
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```
Real SF Pro can't be embedded on the web without a license — the system-font stack above gets
the authentic look on Apple devices for free, with Inter as the cross-platform fallback.

**Route structure** (as you specified, unchanged):
```
/                          -- landing, login portal
/registration              -- multi-step athlete signup wizard
/institute-registration
/verify/[qrId]             -- public verified-record view
/admin                     -- system admin dashboard
/institute                 -- institute dashboard
/athlete                   -- athlete dashboard, features the mind map
```

**Component patterns for the polish you asked for:**
- Multi-step wizards (`/registration`, achievement submission): each step persists via the
  step-wise `PATCH` endpoints in Section 5 — the wizard must survive a closed tab and resume
  from `achievements.current_step`.
- Bottom sheets (mobile) / slide-over panels (desktop) for achievement detail views, not full
  page navigation.
- Skeleton loaders shaped like the final content, not spinners.
- `transform: scale(0.97)` on button/card press states, using `--ease-out-apple`.
- Visible focus rings on every interactive element; color never the sole status signal.

---

## 9. Open decisions before Phase 0

1. **Public field list for `GET /api/public/verify/:qrId`** — decide exactly which fields are
   safe to expose before writing the query. This is a privacy decision.
2. **Consent flow for minors** — does `athlete_guardians.consent_given_at` get set via a signed
   document upload, a checkbox + timestamp, or an external e-signature flow? Affects Phase 1.
3. **MAI-ID assignment timing** — assigned at signup, or only after identity verification (as
   modeled in the schema above)? The schema currently assumes the latter; confirm before Phase 1.
4. **Local `/uploads` vs. S3 in production** — decide now; the `multer` storage engine and the
   `documents.storage_key` semantics differ between the two.

---

## 10. Phased Execution Prompts

**Phase 0 — Scaffolding**
> Set up the Node.js + Express backend per Section 2 of PROJECT_SPEC.md. Add `node-pg-migrate`,
> `pg`, `bcryptjs`, `jsonwebtoken`, `multer`, `pino`, `helmet`, a rate-limiting middleware, and a
> `.env.example` with boot-time validation. Set up the Next.js App Router frontend with the
> route structure in Section 8. Don't implement business logic yet.

**Phase 1 — Migrations**
> Implement all eleven migrations in Section 4 in order, exactly as specified, using
> `node-pg-migrate`. Add a seed script creating one verified institute, one verified athlete
> (with an `athlete_guardians` record since the seed athlete is a minor), and four sample
> achievements matching the mind-map example in Section 6, in different verification states
> (one draft, one submitted, two verified).

**Phase 2 — Auth & RBAC**
> Implement `/api/auth/login`, `/refresh`, `/logout` per Section 3, with refresh tokens hashed
> in `refresh_tokens` and real revocation on logout. Implement the RBAC middleware pattern in
> Section 3 — both `authorize(role)` and `authorizeOwnership(...)`. Write integration tests
> proving an Institute cannot read another Institute's athletes.

**Phase 3 — Identity registration & verification**
> Implement `POST /api/registration/submit`, `POST /api/institute/submit` with CAPTCHA and rate
> limiting, and the admin identity-verification endpoints in Section 5. Enforce the
> `athlete_guardians` requirement when `athletes.is_minor = true`.

**Phase 4 — Achievement draft workflow**
> Implement the full Athlete/Institute achievement endpoints in Section 5, including the
> step-wise `PATCH` endpoints and the `409 Conflict` rule once an achievement leaves `draft`/
> `correction_requested`. Wrap multi-table writes in transactions using a shared
> `withTransaction` helper.

**Phase 5 — Documents**
> Implement document upload, replace, and delete per Section 5, with real MIME validation,
> SHA-256 hashing, and the antivirus-scan hook stubbed if no scanner is available yet.

**Phase 6 — Achievement verification & QR**
> Implement `PUT /verification/achievements/:id/status`, generating a random `qr_id` and setting
> `locked = true` only on `verified`, writing to `audit_log` on every transition.

**Phase 7 — Mind map endpoints**
> Implement `GET /me/mindmap` and `GET /verification/athletes/:id/mindmap` per Section 6,
> sharing one query function with two different authorization checks.

**Phase 8 — Public verification page**
> Implement `GET /api/public/verify/:qrId` returning only the field list decided in Section 9.1,
> and the `/verify/[qrId]` Next.js page consuming it.

**Phase 9 — Design tokens & mind map UI**
> Create the CSS Modules theme file in Section 8. Build the `/athlete` mind map view consuming
> Phase 7's endpoint. [Attach the existing React/D3 mind-map component as a starting reference
> if refining rather than building from scratch.]

**Phase 10 — Tests & CI**
> Add the integration tests specified throughout (RBAC ownership, `409` on locked achievements,
> `qr_id` non-predictability) and a CI pipeline running migrations against a fresh Postgres
> instance before the test suite.
