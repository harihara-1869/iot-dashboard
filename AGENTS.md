# AGENTS.md — Kinetic Industrial Dashboard

## Build & Run

```bash
pnpm dev          # Next.js 16 dev server (Turbopack)
pnpm test         # Vitest + React Testing Library test suite
pnpm build        # TypeScript check + production build (runs tsc internally)
pnpm lint         # ESLint only — no typecheck
```

Type checking happens inside `pnpm build`, not as a separate script.

## Testing

The project uses **Vitest** with **React Testing Library** and `jsdom`.

| File | Purpose |
|---|---|
| `vitest.config.ts` | Vitest config, React plugin, `@/*` path alias, `jsdom` environment |
| `vitest.setup.ts` | Testing Library cleanup, jest-dom matchers, default public env vars |
| `tests/helpers/supabase.ts` | Reusable Supabase query-chain mocks and JSON request helper |
| `tests/api-routes.test.ts` | API route tests — signup, device register/details, diagnostics, password change, telemetry sync |
| `tests/proxy.test.ts` | `src/proxy.ts` route protection — protected routes, login redirect, email confirmation gate |
| `tests/hooks.test.tsx` | `useAuth`, `useReauth`, `useSupabase` hooks — fleet health, KPIs, telemetry, diagnostics, terminal |
| `tests/components.test.tsx` | Key UI components — StatusChip, KpiCard, DeviceCard, DiagnosticsGrid, TerminalWindow, ReauthDialog |
| `tests/lib.test.ts` | `getNodeHealth` (all severity branches), rate-limit, images, Supabase clients, IoT Hub functions |

### Test conventions

- Use `pnpm test` for the full suite.
- Mock external services in tests: Supabase browser/server clients, `azure-iothub`, and `@azure/event-hubs`.
- For API route tests, import route modules after setting mocks/env vars; use `vi.resetModules()` when module-level state matters.
- The cron telemetry route waits 8 seconds in production code. Tests should use fake timers (`vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync(8000)`) instead of real sleeps.
- `useSupabase.ts` creates a Supabase client at module load. Hook tests must set the mocked client before importing the hook module.
- Do not hit live Supabase or Azure services from unit tests.

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

### Build says another build is already running

If `pnpm build` exits with `Another next build process is already running` but no `next build`/Node process exists, a previous build likely left a stale generated lock.

**Diagnosis:**
```bash
ps -ef | rg "next build|next/dist|pnpm build|node"
ls .next/lock
```

**Fix:**
```bash
rm -f .next/lock
pnpm build
```

If the build still wedges after clearing the lock, remove the generated `.next/` cache and retry. Do not delete empty source route directories unless the task explicitly allows application source cleanup.

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
| `src/lib/hooks/useAuth.ts` | Client hook — `signIn()`, `signOut()`, `resetPassword()`, `user`, `loading` via Supabase browser client |
| `src/lib/hooks/useReauth.ts` | In-memory 5-min TTL re-auth gate (`isReauthed()`, `reauth()`, `clearReauth()`) — cleared on signOut and password change |
| `src/components/auth/reauth-dialog.tsx` | Password re-entry modal — gates sensitive operations (register device, diagnostics run, preferences) |
| `src/app/api/auth/signup/route.ts` | `POST` — calls `signUp()` with email, password, `user_metadata.operator_id` |
| `src/app/api/auth/password/route.ts` | `PATCH` — re-auth with current password, updates password, signs out other sessions |
| `src/app/auth/confirm/route.ts` | `GET` — handles OTP `verifyOtp` and PKCE `exchangeCodeForSession` email confirmation flows |
| `src/app/(auth)/forgot-password/page.tsx` | Password reset request form — calls `resetPassword()` |
| `src/app/(auth)/update-password/page.tsx` | New password entry after email confirmation redirect |


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

## Supabase RLS — Per-Table Policy Design

| Table | Policy | Rationale |
|---|---|---|
| `profiles` | `auth.uid() = id` — user-scoped | Contains PII (email, operator_id). Each operator sees only their own row. |
| `motor_nodes` | `auth.role() = 'authenticated'` — shared fleet | All operators manage a shared device inventory. No per-user ownership column. |
| `telemetry_live` | `auth.role() = 'authenticated'` — shared operational | All operators see live sensor data from all devices. No per-user filtering needed. |
| `diagnostics_logs` | `auth.role() = 'authenticated'` — shared operational | Diagnostic runs are fleet-wide, visible to all operators. |
| `terminal_logs` | `auth.role() = 'authenticated'` — shared operational | Terminal commands and outputs are shared fleet data. |
| `telemetry_checkpoints` | `deny_authenticated` — service role only | Internal cron state. Never exposed to client. Service role key bypasses RLS. |

The publishable key alone cannot read or write data — a valid user session JWT must be present. The `handle_new_user()` trigger runs as `SECURITY DEFINER` (bypasses RLS) to auto-create profiles on signup.

## Seed & Schema

- **Schema**: `supabase/schema.sql` — Creates `motor_nodes`, `telemetry_live`, `diagnostics_logs`, `terminal_logs`, `profiles`, `telemetry_checkpoints` + RLS + Realtime publication + `handle_new_user()` trigger
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
- API route: `PATCH /api/devices/[id]/details` — requires auth. Updates `type`, `voltage`, `torque`, `max_rpm`, `rated_current` on an existing node.
- API route: `POST /api/diagnostics/run` — requires auth. Pings Azure IoT Hub per-node, checks Supabase DB, measures latencies, inserts results into `diagnostics_logs`

### SAS Policy Scoping

The `iothubowner` key has full Hub-level permissions. For production, create scoped shared access policies in the Azure Portal:

| Policy | Permissions | Used by |
|---|---|---|
| `device-registration` | RegistryWrite | `POST /api/devices/register` |
| `device-readonly` | RegistryRead, ServiceConnect | `POST /api/diagnostics/run` |

- **Never log connection strings** — use `console.error` only for structured error types, not raw env vars
- **Rotate keys quarterly** via the Azure Portal → IoT Hub → Security settings → Shared access policies
- The cron telemetry endpoint uses a separate Event Hub-compatible connection string (`IOT_HUB_EVENTHUB_CONNECTION`) with Event Hub data-plane permissions, not the IoT Hub registry key

## Security

### Rate Limiting

In-memory rate limiter (`src/lib/rate-limit.ts`) applied to:

| Endpoint | Limit | Keyed by |
|---|---|---|
| `POST /api/auth/signup` | 5 attempts/hour | IP address |
| `POST /api/devices/register` | 10 attempts/hour | user ID |
| `POST /api/diagnostics/run` | 1 attempt/30 seconds | user ID |

For production, replace with Vercel KV or Upstash Redis to share state across serverless instances.

### Security Headers

All responses include via `next.config.ts`:
- `Content-Security-Policy` — script/style/img/font/connect-src restricted
- `Strict-Transport-Security` — 2-year max-age with preload
- `X-Frame-Options: DENY` — no clickjacking
- `X-Content-Type-Options: nosniff` — no MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera/microphone/geolocation disabled

### IoT Hub Key Scoping

See SAS Policy Scoping above. The `iothubowner` key should never be committed to env files — use `.env.local` with restricted policies in production.

### Authentication

- Supabase Auth rate limiting is configured in the Supabase dashboard (Authentication → Rate Limits), not in application code
- Profiles table is user-scoped (`auth.uid() = id`) — contains PII
- Fleet tables (motor_nodes, telemetry_live, diagnostics_logs, terminal_logs) are intentionally shared across authenticated operators
- `telemetry_checkpoints` is service-role only (deny for authenticated users, bypassed by service role key)

### Diagnostics

- Device pings run in parallel via `Promise.all` with a 25-second hard timeout
- Results inserted in a single bulk `insert()` call, not per-check
- Rate limited to 1 run per 30 seconds per user

### Device Registration Flow

1. User clicks "Register New Node" on `/nodes` → opens `RegisterDeviceDialog`
2. **Step 1**: Enter `device_name` + `location` → POST to `/api/devices/register`
3. Server generates a slug-based device ID, creates symmetric-key identity in Azure IoT Hub, inserts row into `motor_nodes` with defaults (`type: "Stepper"`, `"---"` for specs)
4. **Step 2**: `DeviceDetailsForm` — motor type, rated voltage, max RPM, torque, rated current → PATCH to `/api/devices/[id]/details`. Skippable.
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

- **Cron route**: `GET /api/cron/telemetry-sync` — runs daily at midnight on Hobby (`vercel.json`: `0 0 * * *`); switch to `* * * * *` on Vercel Pro for 1-min polling.
- **`@azure/event-hubs`** is server-only (same restriction as `azure-iothub`). Do not import in client components.
- **Schedule**: daily on Hobby (once every 24h); 1-min on Pro (events received in 8s windows, ~10s max message delay).
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
2. Vercel Cron hits `GET /api/cron/telemetry-sync` per schedule (`0 0 * * *` on Hobby, `* * * * *` on Pro)
3. Route creates an `EventHubConsumerClient` (`$Default` consumer group, eventHubName omitted — `EntityPath` in the connection string handles it)
4. Gets partition IDs, loads last offset from `telemetry_checkpoints` table per partition. Checkpoints older than 24h are discarded (IoT Hub free tier retention is 1 day — stale offsets cause SDK errors).
5. Subscribes to each partition with its checkpointed offset (`isInclusive: false` — never re-reads). Falls back to `earliestEventPosition` if no checkpoint exists.
6. Receives events for 8 seconds via per-partition `subscribe(partitionId, ...)` (max 150 events)
7. For each event: parses JSON → looks up `motor_nodes.id` by `iot_device_id = device_id` → builds insert row with `partition_id` + `event_hub_offset`. Unknown devices are silently skipped.
8. All events advance the checkpoint offset (even skipped ones) — burns through stale messages without re-processing them.
9. Single `supabase.from("telemetry_live").upsert(rows, { onConflict: "partition_id, event_hub_offset", ignoreDuplicates: true })` — duplicate-safe
10. Updates `motor_nodes.status` per motor based on telemetry payload status (`ok`/`Active` → Active, `warning`/`critical` → Maintenance, `idle` → Idle)
11. Reaps stale nodes: Active → Idle if no telemetry in 1h; Active/Idle → Offline if no telemetry in 1d
12. Returns `{ processed, skipped, errors }`

### Duplicate safety

`telemetry_live` has a `UNIQUE(partition_id, event_hub_offset)` constraint. The route inserts with `.upsert({ ignoreDuplicates: true })` (ON CONFLICT DO NOTHING). If the server crashes after insert but before checkpoint update, the next cron run re-reads the same events but they're silently skipped by the constraint.

### Connection string format

The `IOT_HUB_EVENTHUB_CONNECTION` **must** start with `Endpoint=`. If the connection string already contains `EntityPath=...`, omit the `eventHubName` argument from `EventHubConsumerClient` — the SDK reads it from the connection string. Passing a mismatched value causes a runtime error.

## Node Health

Motor health status is computed by a centralized pure function in `src/lib/node-health.ts` — `getNodeHealth(node: MotorNode, telemetry?: TelemetryFields)` returns `{ status, message, severity }` where severity is `good | warning | degraded | critical`.

| Priority | Condition | Severity |
|---|---|---|
| 1 | `node.status === "Offline"` | degraded |
| 2 | `telemetry.status === "critical"` | critical |
| 3 | `temp > 80°C` or `vib > 4.0 mm/s` | critical |
| 4 | `telemetry.status === "warning"` or `node.status === "Maintenance"` | warning |
| 5 | `temp > 50°C` or `vib > 2.5 mm/s` or `cur > 15A` | degraded |
| 6 | `max_rpm > 0 && rpm > max_rpm * 1.1` | degraded |
| 7 | `rated_current > 0 && cur > rated_current` | degraded |
| 8 | `node.status === "Idle"` | good |
| 9 | Default (Active + no issues) | good |

The same function drives both the dashboard FleetHealth card and the single-node status pill on `/motor/[id]`.

`useFleetHealth()` in `useSupabase.ts` queries all nodes with `select("id, name, type, status, max_rpm, rated_current")` plus latest telemetry, calls `getNodeHealth()` per node, sorts issues by severity, and reports the worst finding. If all nodes are healthy, displays "All N devices operational."

Motor page (`/motor/[id]/page.tsx`) imports `getNodeHealth` directly and passes the full node + latest telemetry — status pill uses `health.severity` with color-coded dot (green=good, amber=warning, orange=degraded, red=critical).

## Loading States

- `src/app/loading.tsx` — spinner shown during navigation to standalone pages that use the root layout (`/motor/[id]`, `/help`, `/contact`, `/privacy`).
- `src/app/(dashboard)/loading.tsx` — spinner shown during navigation between dashboard-group pages (`/dashboard` ↔ `/nodes` ↔ `/health` ↔ `/terminal` ↔ `/preferences`). Sidebar and topbar remain visible during the transition.

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
| `/login`, `/signup`, `/forgot-password`, `/update-password` | `(auth)` — LoginHeader + LoginFooter | No |
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
| 1 | Account preferences | Linked devices view, session activity (currently placeholder UI, password change is implemented) |
| 2 | Reduce session TTL | Supabase dashboard → Authentication → Settings → access token to 15 min, refresh token to 7 days |
| 3 | Remove legacy telemetry field support | `temperature_c`, `vibration_mms`, `current_a`, `voltage_v` still accepted in the ingestion route. Remove backward-compat once all devices send current schema. |
