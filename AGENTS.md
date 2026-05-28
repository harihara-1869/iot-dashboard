# AGENTS.md — Kinetic Industrial Dashboard

## Build & Run

```bash
pnpm dev          # Next.js 16 dev server (Turbopack)
pnpm build        # TypeScript check + production build (runs tsc internally)
pnpm lint         # ESLint only — no typecheck
```

Type checking happens inside `pnpm build`, not as a separate script.

## Dev Server Troubleshooting

### High CPU / disk hammering when idle

If `pnpm dev` sits at high CPU (>100%) and heavy disk I/O beyond the initial compilation window, the most common cause is **stale `.next/` cache** from orphaned route directories. Turbopack detects compiled output with no corresponding source file and loops trying to reconcile them.

**Diagnosis:**
```bash
# Check for empty directory-based routes that have stale cache
find src/app -type d -empty | while read d; do ls ".next/dev/server/$d" 2>/dev/null && echo "STALE: $d"; done
```

**Fix:**
```bash
# Kill dev server, remove empty route dirs, nuke .next cache, restart
pkill -f "next dev"
find src/app -type d -empty -delete
rm -rf .next
pnpm dev
```

Also verify no empty `src/app/` subdirectories are committed — they can carry stale cache between builds.

## Tailwind v4 — No tailwind.config

All design tokens live in `src/app/globals.css` via `@theme` blocks. There is **no** `tailwind.config.ts` or `tailwind.config.js`. Do not add one.

## Authentication — Supabase Auth + @supabase/ssr

Auth uses Supabase Auth (email/password), not the custom Passport.js stack that was previously here.

| Concern | Details |
|---|---|
| Login | `supabase.auth.signInWithPassword({ email, password })` in `useAuth` hook |
| Logout | `supabase.auth.signOut()` — clears Supabase cookies |
| Session | `__Host-sb-auth-token` cookie managed by `@supabase/ssr` via middleware — uses `__Host-` prefix scoped to origin with `Secure`, `SameSite=Lax`, `Path=/` |
| User data | `operator_id` stored in `user_metadata.operator_id` during signup |
| Profiles | `public.profiles` table auto-created via `handle_new_user()` trigger on `auth.users` INSERT |
| Signup gate | Controlled by Supabase dashboard → Authentication → Settings → "Allow new users to sign up" toggle. Email confirmation enforced in proxy (check `email_confirmed_at`), `emailRedirectTo` set in signup route, and `handle_new_user()` gated on `NEW.email_confirmed_at IS NOT NULL`. |

### Key auth files

| File | Purpose |
|---|---|
| `src/proxy.ts` | Supabase SSR middleware — calls `getUser()`, protects routes, syncs cookies |
| `src/lib/hooks/useAuth.ts` | Client hook — `signIn()`, `signOut()`, `user`, `loading` via Supabase browser client |
| `src/app/api/auth/signup/route.ts` | `POST` — calls `signUp()` with email, password, `user_metadata.operator_id` |
| `src/app/auth/confirm/route.ts` | `GET` — handles email confirmation redirects (`verifyOtp`) |


## Proxy (Route Protection) — Next.js 16

The file is `src/proxy.ts` (Next.js 16 convention, was `middleware.ts`). Uses Supabase SSR pattern:
- Creates `createServerClient` with cookie `getAll`/`setAll` from the request
- Calls `supabase.auth.getUser()` immediately — **do not add code between client creation and `getUser()`**
- Protects `/dashboard`, `/nodes`, `/health`, `/terminal`, `/motor`, `/preferences` — redirects to `/login` if no user
- Redirects authenticated users from `/login` → `/dashboard`
- Redirects `/` → `/dashboard`
- Must return the `supabaseResponse` object with synced cookies — never return a fresh `NextResponse.next()` without copying cookies

## Supabase Env Var Name

The anon key is `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, **not** `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Client and server files both use this name.

## Client vs Server Components

Most pages are `"use client"` because they use React hooks. Dashboard and auth layout files have `export const dynamic = "force-dynamic"` — prevents static prerendering of pages that import `@supabase/ssr`.

## Supabase RLS — Authenticated Only

All RLS policies require `auth.role() = 'authenticated'`. The publishable key alone cannot read or write data — a valid user session JWT must be present. The `handle_new_user()` trigger runs as `SECURITY DEFINER` (bypasses RLS) to auto-create profiles on signup.

## Seed & Schema

- **Schema**: `supabase/schema.sql` — Creates `motor_nodes`, `telemetry_live`, `diagnostics_logs`, `terminal_logs`, `profiles` + RLS + Realtime publication + `handle_new_user()` trigger
- **RPC**: `supabase/rpc.sql` — Creates `latest_telemetry_averages()` function for dashboard KPI cards
- **Seed**: `supabase/seed.sql` (SQL) or `npx tsx supabase/seed.ts` (TypeScript) — 8 nodes + 8 diagnostics logs + 24h telemetry. Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (bypasses RLS via service role key).
- **Schema order**: `schema.sql` → `rpc.sql` → `seed.sql`
- `supabase/` is excluded from TypeScript compilation (`tsconfig.json`)
- `ALTER PUBLICATION supabase_realtime ADD TABLE telemetry_live` is wrapped in `DO $$ ... EXCEPTION WHEN duplicate_object` — running schema.sql twice is safe
- `telemetry_live` schema matches the ESP32 payload: `temperature`, `vibration`, `current`, `status`, `status_message` (no `temperature_c`/`vibration_mms`/`current_a`/`voltage_v` — renamed/removed 2026-05-28)
- **Schema changes require a fresh DB**: drop all tables before re-running schema.sql — see Dev Server Troubleshooting for stale cache concerns if old column references linger

## Design System — Material Design 3 Light Theme

All tokens in `src/app/globals.css` under `@theme`. Never hardcode hex values or arbitrary sizes.

### Component Conventions

- **Cards**: `bg-surface border border-outline-variant rounded-lg p-6` (or `p-8` for large cards)
- **Inputs**: `w-full h-12 bg-surface border border-outline px-4 font-mono text-[14px] leading-5 font-medium focus:border-primary focus:ring-0 rounded-none transition-all`
- **Primary Buttons**: `h-12 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2`
- **Secondary Buttons**: `h-12 bg-surface border border-outline text-on-surface font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:bg-surface-container-high active:scale-95`

### Typography

| Class | Usage | Font |
|---|---|---|
| `font-sans text-[48px]/[56px] tracking-[-0.02em] font-bold` | Hero headings | Inter |
| `font-sans text-[24px] leading-8 font-semibold` | Page titles | Inter |
| `font-sans text-[16px] leading-6` | Body, nav items | Inter |
| `font-mono text-[14px] leading-5 font-medium` | Input values, data fields | JetBrains Mono |
| `font-mono text-[12px] leading-4 tracking-[0.05em] font-bold uppercase` | Labels, buttons | JetBrains Mono |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `p-margin-desktop` | `32px` (2rem) | Main content padding |
| `p-margin-mobile` | `16px` | Mobile content padding |
| `p-gutter` | `16px` | Sidebar internal padding |

## Azure IoT Hub

- `azure-iothub` SDK is server-only. Do not import in client components.
- Library: `src/lib/iot-hub/index.ts` — `registerDeviceInIotHub()`, `getDeviceStatus()`, `listDevices()`, `deleteDeviceFromIotHub()`
- API route: `POST /api/devices/register` — requires auth (calls `getUser()`). Creates device in Azure IoT Hub + inserts into Supabase with defaults. Azure IoT Hub failures fail the entire request.
- API route: `PATCH /api/devices/[id]/details` — requires auth. Updates `type`, `voltage`, `torque`, `max_rpm`, `ip_rating` on an existing node.
- API route: `POST /api/diagnostics/run` — requires auth. Pings Azure IoT Hub per-node, checks Supabase DB, measures latencies, inserts results into `diagnostics_logs`

### Device Registration Flow

1. User clicks "Register New Node" on `/nodes` → opens `RegisterDeviceDialog`
2. **Step 1**: Enter `device_name` + `location` → POST to `/api/devices/register`
3. Server generates a slug-based device ID, creates symmetric-key identity in Azure IoT Hub, inserts row into `motor_nodes` with defaults (`type: "Stepper"`, `"---"` for specs)
4. **Step 2**: `DeviceDetailsForm` — motor type, rated voltage, max RPM, torque, IP rating → PATCH to `/api/devices/[id]/details`. Skippable.
5. After step 2 (or skip): Azure credentials displayed once — user copies them to flash onto the ESP32/MCU

### Calibrate (Update Device Details)

- Button on `DeviceCard` (nodes page) and motor detail page (`/motor/[id]`)
- Opens `CalibrateDialog` which reuses `DeviceDetailsForm` pre-filled with existing values
- PATCH to `/api/devices/[id]/details` — requires auth

### Diagnostics Run

1. User clicks "Run System Diagnostics" on `/health` → POSTs to `/api/diagnostics/run`
2. Server iterates all `motor_nodes` with `iot_device_id`, calls Azure `Registry.get()` per device
3. Each device check measures round-trip latency, records `connectionState` (connected/disconnected)
4. Server runs a lightweight Supabase query to confirm DB is reachable, measures query latency
5. All checks inserted into `diagnostics_logs` with `check_type`, `result`, `performance` (latency in ms), `operator`, `node_id`
6. `DiagnosticsGrid` on `/health` reads latest logs and displays 3 cards: Server (hardcoded), Database (latency from log), Edge Pings (average latency + slow nodes >500ms)

## Telemetry Ingestion

- **Cron route**: `GET /api/cron/telemetry-sync` — runs every minute via Vercel Cron (`vercel.json`)
- **`@azure/event-hubs`** is server-only (same restriction as `azure-iothub`). Do not import in client components.
- **`vercel.json`** controls the cron schedule (`* * * * *`).
- **Schedule**: 1-minute polling interval, events received in 8-second windows, ~10s max message delay.
- The route uses `SUPABASE_SERVICE_ROLE_KEY` (service role) to bypass RLS — no user session required.

### Env vars

| Variable | Source |
|---|---|
| `IOT_HUB_EVENTHUB_CONNECTION` | Azure IoT Hub → Built-in endpoints → Event Hub-compatible endpoint connection string |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → `service_role` key |
| `CRON_SECRET` | Any random string — set in Vercel dashboard environment variables and used by the cron route for `Authorization: Bearer <secret>` auth |

### Data flow

1. ESP32 publishes telemetry JSON to Azure IoT Hub over MQTT (every 5s):
```json
{
  "device_id": "conveyor-motor-b3-abc123",
  "timestamp": "2026-05-26T12:00:00Z",
  "rpm": 3450.0,
  "temperature": 42.5,
  "vibration": 1.2,
  "current": 12.1,
  "status": "Active",
  "status_message": "Normal operation"
}
```
2. Vercel Cron hits `GET /api/cron/telemetry-sync` every minute
3. Route creates an `EventHubConsumerClient` (`$Default` consumer group, eventHubName omitted — `EntityPath` in the connection string handles it)
4. Gets partition IDs, loads last offset from `telemetry_checkpoints` table per partition
5. Subscribes to each partition with its checkpointed offset (`isInclusive: false` — never re-reads)
6. Receives events for 8 seconds via per-partition `subscribe(partitionId, ...)` (max 150 events)
7. For each event: parses JSON → looks up `motor_nodes.id` by `iot_device_id = device_id` → builds insert row with `partition_id` + `event_hub_offset`
8. Single `supabase.from("telemetry_live").upsert(rows, { onConflict: "partition_id, event_hub_offset", ignoreDuplicates: true })` — duplicate-safe
9. Updates `telemetry_checkpoints` with highest offset per partition
10. Returns `{ processed, skipped, errors }`

### Duplicate safety

`telemetry_live` has a `UNIQUE(partition_id, event_hub_offset)` constraint. The route inserts with `.upsert({ ignoreDuplicates: true })` (ON CONFLICT DO NOTHING). If the server crashes after insert but before checkpoint update, the next cron run re-reads the same events but they're silently skipped by the constraint.

### Connection string format

The `IOT_HUB_EVENTHUB_CONNECTION` **must** start with `Endpoint=`. If the connection string already contains `EntityPath=...`, omit the `eventHubName` argument from `EventHubConsumerClient` — the SDK reads it from the connection string. Passing a mismatched value causes a runtime error.

## Charts

Recharts `ResponsiveContainer` needs a parent with explicit height. If charts render blank, check that the parent has `h-64` or similar. `min-h-0` on a flex child collapses the container to zero.

## Hydration Mismatches

Async Supabase data in client components causes server/client renders to differ on initial load. When rendering tables with conditional `disabled` props from async state, use `suppressHydrationWarning` on the root element to suppress the warning. See `src/components/health/history-table.tsx` for the pattern.

## Icons

Material Symbols via `material-symbols` npm package, imported in `src/app/layout.tsx`. Use `<span className="material-symbols-outlined">icon_name</span>`. Filled variant: `style={{ fontVariationSettings: "'FILL' 1" }}`.

## Fonts

Inter (sans) and JetBrains Mono (mono) via `next/font/google`. CSS variables `--font-inter` / `--font-jetbrains-mono`, mapped to `--font-sans` / `--font-mono` in `@theme`.

## Images

Centralized in `src/lib/images.ts`. Import `IMAGES` for static paths, `getNodeImage(nodeId)` for per-node images. Add node images via `NODE_IMAGE_MAP` — never store paths in the DB.

## Route Structure

| Route | Layout | Auth |
|---|------|-------|
| `/login`, `/signup` | `(auth)` — LoginHeader + LoginFooter | No |
| `/dashboard`, `/nodes`, `/health`, `/terminal`, `/preferences` | `(dashboard)` — Sidebar + Topbar | Yes |
| `/motor/[id]` | Standalone (not in any group) — own header with back button | Yes |
| `/help`, `/contact`, `/privacy` | Standalone — minimal header with Dashboard/Login button | No |

`/motor/[id]` is deliberately outside `(dashboard)` — it does not render the sidebar or topbar. Standalone public pages (`/help`, `/contact`, `/privacy`) use `useAuth()` to conditionally link to `/dashboard` or `/login`.

## Navigation Conventions

- Sidebar links use `<Link replace>` — no browser history push for tab switching
- Motor detail back button uses `router.back()`
- Login → dashboard uses `router.push()`
- Logout calls `supabase.auth.signOut()` and pushes to `/login`

## Future TODOs

| # | Task | Notes |
|---|------|-------|
| 1 | Password reset | Supabase `resetPasswordForEmail` flow — needs reset page + email template |
| 2 | Account preferences | Password change, linked devices view, session activity (currently placeholder UI) |
| 3 | Reduce session TTL | Supabase dashboard → Authentication → Settings → access token to 15 min, refresh token to 7 days |
| 4 | Password change endpoint | Invalidate all existing refresh tokens on password change. API route + preferences UI |
| 5 | Re-auth gating | Require password re-entry before device registration and diagnostics runs |
