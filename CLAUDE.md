# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Engineering principles (*how* code is written) live in `AGENTS.md`. This file describes *what* the project is.

## Project Overview

Monorepo for a bakery/retail distribution management system with three apps:

1. **admin** (`apps/admin`) - Next.js 16 admin dashboard; Supabase auth, data visualization
2. **agent** (`apps/agent`) - Next.js 16 web app for store/agent management
3. **agent-app** (`apps/agent-app`) - Expo React Native mobile app for field agents

## Code Philosophy

From `.cursor/rules/simple-effective-output.mdc`:

- **Keep it simple**: Prefer obvious solutions over clever ones
- **Small diffs**: Touch as few files/lines as necessary
- **Reuse patterns**: Follow existing patterns; no new abstractions without 2+ real call sites
- **Logic proximity**: Keep logic close to where it's used unless clearly reused
- **Direct data flows**: Props and simple context/hooks over global state
- **TypeScript**: Practical and strict — avoid `any` but don't over-genericize
- **Comments**: Only for complex business logic, not to restate obvious code

## Development Commands

### Admin & Agent (Next.js)

```bash
cd apps/admin   # or apps/agent
npm run dev     # Dev server
npm run build   # Production build
npm run lint    # ESLint
```

> Use **pnpm** in the Next.js apps (pnpm-lock.yaml present).

### Agent Mobile App (Expo)

```bash
cd apps/agent-app
npm run start               # Start Metro bundler
npm run start --clear       # Clear cache and start
npm run android             # Android emulator
npm run ios                 # iOS simulator
npx expo lint               # Lint
npx expo install <package>  # Install Expo-compatible packages

# EAS
npm run development-builds  # Create dev build via EAS
npm run draft               # Publish preview update
npm run deploy              # Deploy to production
```

> Use **npm** in the Expo app (package-lock.json present).

## Admin App Architecture

- **Route groups**: `(auth)` and `(dashboard)` for layout separation
- **Feature modules**: `app/features/` — agents, auth, dashboard, products, records, intelligence
- **Server layer**: `app/server/` — db and service utilities (server components only)
- **Supabase utilities**: `utils/supabase/` — client, server, middleware, admin variants
- **Auth**: Middleware-based session validation (`middleware.ts`)
- **Charts**: Recharts + @visx

## Agent Mobile App Architecture

### Layering Rule

Three layers, strictly separated:

- **`services/` (data)** — all SQLite writes, outbox enqueues, and Supabase calls. Each mutation wraps `getDb().withTransactionSync(() => { dao.write(); enqueueOutbox(); })`.
- **`core/` (pure logic)** — plain JS business functions: data in, new data out. **No React, no I/O, no imports of either, no mutation of arguments.** This is what makes `core/` testable with zero mocks / zero async / zero React (see AGENTS.md → "Testing `core/`"). If a behavior can't be tested without mocking the DB or rendering a component, it belongs here, not in the hook.
- **`hooks/` (React glue)** — thin shell: `useState`/`useEffect`/`useCallback` only. Hold state, call a `core/` function for the next value, set state, hand off to a service to persist. **No `getDb`, no `enqueueOutbox`, no raw SQL, no `JSON.stringify` payloads, no business math in hooks.** (Read-only DAO calls from hooks are fine.)

### Feature-Based Structure

Dependencies flow **down only**: `app/ → src/features/ → src/shared/ → src/lib/` (lib is the bottom layer; shared may use lib). Features must not import each other except the few edges declared in `eslint.config.js` (`import/no-restricted-paths` enforces this): `routes→sessions`, `inventory→store`, `history→store`.

```
src/lib/                       # bottom layer: data/infra (mirrors FlexApp), imports nothing above it
  db.ts                        # lazy getDb() + async initDb() (PRAGMAs, schema, indexes)
  uuid.ts                      # generateUUID()
  network.ts                   # isWifiConnected()
  supabase.ts                  # Supabase client (expo-sqlite/localStorage for session)
  dao/                         # pure data access (routes-dao, sales-dao, ...); owns row types (LoggedItem, InventoryItem)
  sync/
    outbox.ts                  # enqueueOutbox() + runOutboxSync()
    download.ts                # runDownloadSync(userId): Supabase -> local pull
src/shared/                    # cross-feature UI + utils (may import src/lib, never features)
  components/ (ThemedText, ThemedView, ui/header)  hooks/  helpers/ (getPhTime)  constants/ (Colors)  styles/ (modalStyles)
src/features/                  # one feature = one subdomain; screens/ components/ hooks/ (React-only) services/ types/
  auth/                        # useLogin hook, sign-in screen
  routes/                      # route + province + store CRUD, route list/select
  sessions/                    # running a session (SessionRoute, EndRoute, plan/session hooks)
  inventory/                   # morning + ending inventory screens
  history/                     # session history screens
  store/                       # distribution log + inventory (salesLocalService, inventoryLocalService, visitLocalService)
  settings/
```

### SQLite Database Layer

Database: `routeledger-v4.db` opened lazily via `getDb()` (`src/lib/db.ts`). `initDb()` is async, runs `PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;`, creates tables `IF NOT EXISTS` plus hot-path indexes, and is awaited in `useAuthGuard` before the session check.

**Tables:** `routes`, `provinces`, `stores`, `route_sessions`, `session_stores`, `products`, `sales`, `session_inventory`, `ending_inventory`, `outbox` (see `src/lib/db.ts` for full schema).

**Patterns:**

- DAOs are **pure** sync data access (`getDb().runSync()`, `getDb().getAllSync()`); no business defaults or outbox calls inside DAOs.
- IDs are UUIDs via `generateUUID()` (`src/lib/uuid.ts`).
- Multi-table writes wrap `getDb().withTransactionSync()` in a service.
- No versioned migrations — tables created `IF NOT EXISTS`; bump the DB filename to reset.

### Offline Sync (outbox + pull)

- **Outbox** (`src/lib/sync/outbox.ts`): generic queue `(entity_type, entity_id, operation, payload, synced_at)`. Services call `enqueueOutbox()` in the same transaction as the local write.
- **Push** `runOutboxSync()`: drains `synced_at IS NULL` rows to Supabase (`create`→upsert, `update`→update.eq(id), `delete`→delete.eq(id)). Payloads are remote-shaped. Wired in `app/_layout.tsx` on launch + AppState foreground + 30s interval (gated on `!checkingSession`).
- **Pull** `runDownloadSync(userId)`: hydrates server-owned tables (currently `products`); triggered once per signed-in user in `useAuthGuard`.

### Navigation (Expo Router)

File-based routing under `app/`. Key routes:

- `app/index.tsx` → re-exports `/main/routes/index` (home)
- `app/auth/sign-in.tsx` → sign-in screen
- `app/main/routes/index.tsx` → RoutesScreen
- `app/main/routes/detail.tsx` → RouteDetailScreen
- `app/main/routes/store/[storeId].tsx` → dynamic store detail
- `app/main/settings/index.tsx` → settings

**Navigation patterns:**

```typescript
// Typed params
const params = useLocalSearchParams<{ routeId?: string; routeName?: string }>();

// Navigate with params
router.push({ pathname: "/main/routes/detail", params: { routeId, routeName } });

// Auth redirect (prevent back nav)
router.replace("/auth/sign-in");
```

**Auth guard** in `app/_layout.tsx`: checks `supabase.auth.getSession()` on mount, redirects unauthenticated users to `/auth/sign-in`, redirects authenticated users away from auth routes.

### Styling Conventions

- All styles via `StyleSheet.create()` (React Native)
- Flexbox for layout; `SafeAreaView` wraps screens
- Theme colors from `src/shared/constants/Colors.ts` (light/dark variants)
- Reusable header: `src/shared/components/ui/header.tsx` (back button, title, right element slot)
- FABs: absolutely positioned with `expo-linear-gradient` backgrounds
- Cards: `borderRadius: 8`, `borderColor: "#E5E7EB"`

## Environment Variables

- **Admin app**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- **Agent mobile app**: Supabase credentials in `.env.local`

## Key Reference Files

- `apps/agent-app/AGENTS.md` — detailed Expo/React Native guidance, MCP debug commands
- `apps/agent-app/eas.json` — build profiles (development, preview, production)
- `apps/agent-app/app.json` — Expo config (SDK 54, new arch enabled, typedRoutes)
- `.cursor/rules/simple-effective-output.mdc` — code philosophy
