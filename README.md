# Kinetic Industrial — Motor Control Dashboard

Precision industrial motor monitoring and control dashboard for IoT-enabled motor systems. Real-time telemetry visualization, device inventory management, system health diagnostics, terminal command access, and automated device provisioning via Azure IoT Hub.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Runtime | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Charts | [Recharts](https://recharts.org) |
| Icons | [Material Symbols](https://fonts.google.com/icons) |
| Database | [Supabase](https://supabase.com) (PostgreSQL + Realtime) |
| Auth | Supabase Auth + @supabase/ssr |
| IoT | [Azure IoT Hub](https://azure.microsoft.com/products/iot-hub) (Device Registry + MQTT + Event Hubs) |
| Testing | Vitest + React Testing Library + jsdom |
| Package Manager | pnpm |

## File Structure

```
src/
├── proxy.ts                              # Route protection middleware (Supabase SSR)
├── instrumentation.ts                    # DB table verification at server startup
├── app/
│   ├── layout.tsx                        # Root layout (fonts, Metadata, Vercel Analytics)
│   ├── loading.tsx                       # Root loading spinner (standalone pages)
│   ├── page.tsx                          # Root page (redirects to /dashboard)
│   ├── globals.css                       # Design tokens (@theme), animations, utilities
│   ├── (auth)/
│   │   ├── layout.tsx                    # Auth shell (LoginHeader + LoginFooter)
│   │   ├── loading.tsx                   # Auth page loading spinner
│   │   ├── login/page.tsx                # Email + Password login form
│   │   ├── signup/page.tsx               # New operator registration
│   │   ├── forgot-password/page.tsx      # Password reset request form
│   │   └── update-password/page.tsx      # New password entry after reset
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Sidebar + Topbar shell
│   │   ├── loading.tsx                   # Dashboard page loading spinner
│   │   ├── dashboard/page.tsx            # KPI cards + Fleet Health + Device list
│   │   ├── nodes/page.tsx                # Device cards + Filter bar + Register dialog
│   │   ├── health/page.tsx               # Diagnostics Grid + History table
│   │   ├── terminal/page.tsx             # Terminal window + Metrics sidebar
│   │   └── preferences/page.tsx          # Account profile + Change password
│   ├── motor/[id]/page.tsx               # Motor viz + Telemetry charts (Recharts)
│   ├── help/page.tsx                     # Project overview (public)
│   ├── contact/page.tsx                  # Contact info (public)
│   ├── privacy/page.tsx                  # Privacy policy (public)
│   ├── auth/confirm/route.ts             # GET — OTP verification + PKCE code exchange
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts           # POST — create user via Supabase Auth
│       │   └── password/route.ts         # PATCH — change password + re-auth
│       ├── devices/
│       │   ├── register/route.ts         # POST — register device (Azure IoT Hub + Supabase)
│       │   └── [id]/details/route.ts     # PATCH — update motor specs
│       ├── diagnostics/run/route.ts      # POST — system-wide health check (Azure + DB)
│       └── cron/telemetry-sync/route.ts  # GET — Vercel Cron telemetry ingestion
├── components/
│   ├── layout/       # Sidebar, Topbar, StatusBar, LoginHeader, LoginFooter
│   ├── ui/           # Button, GlassPanel, KpiCard, DataField, StatusChip, FluidStatus
│   ├── nodes/        # DeviceCard, FilterBar, RegisterDeviceDialog, DeviceDetailsForm, CalibrateDialog
│   ├── health/       # DiagnosticsGrid, HistoryTable
│   ├── terminal/     # TerminalWindow, MetricsSidebar
│   ├── telemetry/    # MotorVisualization, TelemetryCharts (Recharts)
│   └── auth/         # ReauthDialog (password re-entry gate for sensitive operations)
└── lib/
    ├── supabase/     # Browser client + Server client
    ├── iot-hub/      # Azure IoT Hub device identity registry wrapper
    ├── hooks/        # useAuth, useReauth, useSupabase (nodes, telemetry, diagnostics, terminal)
    ├── types/        # MotorNode, TelemetryPoint, DiagnosticsLog, etc.
    ├── node-health.ts # getNodeHealth() — centralized health status computation
    ├── rate-limit.ts # In-memory rate limiter
    └── images.ts     # Static image paths + per-node image mapping
```

## Routes

| Route | Screen | Auth |
|---|---|---|
| `/login` | Email + Password login | No |
| `/signup` | New operator registration | No |
| `/forgot-password` | Password reset request | No |
| `/update-password` | Set new password after reset link | No |
| `/dashboard` | KPI Overview (Home) | Yes |
| `/nodes` | Nodes Inventory + Fleet Status | Yes |
| `/health` | System Health Diagnostics + History | Yes |
| `/terminal` | System Terminal | Yes |
| `/preferences` | Account Preferences + Change Password | Yes |
| `/motor/[id]` | Motor Detail — Telemetry + Charts | Yes |
| `/help` | Project overview | No |
| `/contact` | Contact information | No |
| `/privacy` | Privacy policy | No |
| `GET /auth/confirm` | OTP verification (signup) + PKCE code exchange (reset) | No |
| `POST /api/auth/signup` | Create user via Supabase Auth | No |
| `PATCH /api/auth/password` | Change password (invalidates other sessions) | Yes |
| `POST /api/devices/register` | Register New Device (Supabase + Azure IoT Hub) | Yes |
| `PATCH /api/devices/[id]/details` | Update device specs (type, voltage, torque, RPM, current) | Yes |
| `POST /api/diagnostics/run` | Run system diagnostics (Azure + DB + server) | Yes |
| `GET /api/cron/telemetry-sync` | Vercel Cron — ingest telemetry from Event Hubs | No (CRON_SECRET) |

## Quick Start

### 1. Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io) (`npm install -g pnpm`)

### 2. Clone and Install

```bash
git clone <repo-url> dashboard
cd dashboard
pnpm install
```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for seed + telemetry cron) |
| `AZURE_IOT_HUB_CONNECTION_STRING` | IoT Hub shared access connection string |
| `IOT_HUB_EVENTHUB_CONNECTION` | IoT Hub Built-in endpoints → Event Hub-compatible connection string |
| `CRON_SECRET` | Random string — authenticates Vercel Cron calls |

### 4. Supabase Setup

1. Go to [supabase.com](https://supabase.com), create a project
2. In **SQL Editor**, run scripts in order:
   - `supabase/schema.sql` — creates tables, RLS policies, profiles trigger, Realtime
   - `supabase/rpc.sql` — creates `latest_telemetry_averages()` for dashboard KPIs
3. In **Project Settings → API**, copy the Project URL and anon key to `.env.local`
4. In **Project Settings → API**, copy the `service_role` key as `SUPABASE_SERVICE_ROLE_KEY`
5. In **Authentication → Settings**:
   - Toggle "Allow new users to sign up" ON
   - Add `http://localhost:3000/auth/confirm` to **Redirect URLs**
6. Optionally disable "Confirm email" for local development

### 5. Azure IoT Hub Setup

1. In [Azure Portal](https://portal.azure.com), create an IoT Hub (Free tier: 8,000 msg/day, 500 device identities)
2. Go to **Shared access policies** → **iothubowner** → copy primary connection string
3. Go to **Built-in endpoints** → copy the **Event Hub-compatible endpoint** connection string
4. Add both to `.env.local`

### 6. Seed the Database

```bash
npx tsx supabase/seed.ts              # 8 motor nodes + diagnostics logs
```

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (bypasses RLS).

### 7. Start the Dev Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The `instrumentation.ts` hook verifies database connectivity at startup.

### 8. Create Your Account

Navigate to `/signup` and register with:
- **Email**: your email
- **Operator ID**: e.g. `KNS-000001`
- **Password**: min 8 characters

### 9. Register an IoT Device

1. Navigate to **Nodes** → click **Register New Node**
2. Fill in **Device Name** and **Location**
3. Click **Register Device** (auto-generates device ID)
4. Optionally fill in motor specs (type, voltage, RPM, torque, current) — skippable
5. Save the displayed credentials (Device ID, Host, Primary Key)
6. Flash these to your ESP32/MCU for MQTT-based telemetry

## Available Scripts

```bash
pnpm dev        # Start dev server (Turbopack)
pnpm test       # Run Vitest test suite
pnpm build      # TypeScript check + production build
pnpm lint       # Run ESLint
```

## Authentication

Uses **Supabase Auth** (email/password) with `@supabase/ssr` for route protection and cookie management.

- **Session cookie**: `__Host-sb-auth-token` managed by `@supabase/ssr` — `Secure`, `SameSite=Lax`, `Path=/`
- **Login**: `supabase.auth.signInWithPassword()` via `useAuth` hook
- **Logout**: `supabase.auth.signOut()` — clears cookies
- **Password reset**: `resetPasswordForEmail()` → email link with PKCE code → `/auth/confirm` exchanges via `exchangeCodeForSession()` → `/update-password` sets new password via `updateUser()`
- **Signup gate**: Supabase dashboard toggle + `email_confirmed_at` check in proxy middleware
- **Re-auth**: `useReauth` hook maintains a 5-min in-memory TTL gate. Sensitive operations (device register, diagnostics run, preferences) require password re-entry via `ReauthDialog` modal.

### Route Protection

`src/proxy.ts` (Next.js 16 middleware convention) protects `/dashboard`, `/nodes`, `/health`, `/terminal`, `/motor`, `/preferences`. Unauthenticated users are redirected to `/login`. Authenticated users on `/login` are redirected to `/dashboard`. Root `/` redirects to `/dashboard`. Users with unconfirmed email are also redirected to `/login`.

### Rate Limiting

In-memory rate limiter applied to:

| Endpoint | Limit | Keyed by |
|---|---|---|
| `POST /api/auth/signup` | 5 attempts/hour | IP |
| `POST /api/devices/register` | 10 attempts/hour | User ID |
| `POST /api/diagnostics/run` | 1 attempt/30 seconds | User ID |

### Security Headers

All responses include via `next.config.ts`:

- **Content-Security-Policy** — restricted script/style/img/font/connect-src
- **Strict-Transport-Security** — 2-year max-age with preload
- **X-Frame-Options: DENY**
- **X-Content-Type-Options: nosniff**
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** — camera/microphone/geolocation disabled

## Database Schema

| Table | Purpose | RLS |
|---|---|---|
| `motor_nodes` | Device inventory — name, type, location, specs, status | Authenticated |
| `telemetry_live` | Real-time sensor data (Realtime-enabled) — RPM, temp, vibration, current, status | Authenticated |
| `diagnostics_logs` | System health check history | Authenticated |
| `terminal_logs` | Command history per device | Authenticated |
| `profiles` | Extended user data — operator_id, email, linked to `auth.users` | User-scoped (`auth.uid() = id`) |
| `telemetry_checkpoints` | Cron checkpoint offsets per Event Hub partition | Service role only |

Fleet tables (`motor_nodes`, `telemetry_live`, `diagnostics_logs`, `terminal_logs`) are intentionally shared across all authenticated operators. `profiles` is user-scoped (contains PII). `telemetry_checkpoints` is service-role only.

The `handle_new_user()` trigger auto-creates a profile row when a user confirms their email. It runs as `SECURITY DEFINER` to bypass RLS.

## Node Health

Health status is computed by `getNodeHealth()` in `src/lib/node-health.ts` — a pure function that takes a `MotorNode` and optional telemetry snapshot and returns `{ status, message, severity }` where severity is `good | warning | degraded | critical`.

Checks (in priority order):

| Condition | Severity |
|---|---|
| Node Offline | degraded |
| Telemetry status "critical" | critical |
| Temp > 80°C or Vibration > 4.0 mm/s | critical |
| Telemetry status "warning" or node Maintenance | warning |
| Temp > 50°C, Vibration > 2.5 mm/s, Current > 15A, RPM > max, Current > rated | degraded |
| Node Idle | good |
| Active + no issues | good |

`useFleetHealth()` applies `getNodeHealth()` across all nodes and reports the worst finding. The same function drives the dashboard FleetHealth card and single-node status pill on `/motor/[id]`.

## Device Registration Flow

1. User clicks "Register New Node" on `/nodes` → opens `RegisterDeviceDialog`
2. Enter `device_name` + `location` → POST to `/api/devices/register`
3. Server generates a slug-based device ID, creates symmetric-key identity in Azure IoT Hub, inserts row into `motor_nodes` with defaults
4. `DeviceDetailsForm` — motor type, voltage, RPM, torque, current → PATCH to `/api/devices/[id]/details` (skippable)
5. Azure credentials displayed once — user copies them to flash onto the ESP32/MCU

Existing devices can be recalibrated via `CalibrateDialog` (reuses `DeviceDetailsForm` pre-filled with current values).

## Diagnostics

1. User clicks "Run System Diagnostics" on `/health` → POSTs to `/api/diagnostics/run`
2. Server iterates all `motor_nodes` with IoT device IDs, calls Azure `Registry.get()` per device
3. Each check measures round-trip latency, records connection state
4. Runs a lightweight Supabase query to confirm DB reachability
5. All results inserted into `diagnostics_logs` with `check_type`, `result`, `performance` (latency in ms), `operator`, `node_id`
6. `DiagnosticsGrid` displays: Server (hardcoded), Database (latency from log), Edge Pings (average latency + slow nodes >500ms)
7. Rate limited to 1 run per 30 seconds per user

## Telemetry Ingestion

1. ESP32 publishes telemetry JSON over MQTT to Azure IoT Hub every 5 seconds
2. Vercel Cron hits `GET /api/cron/telemetry-sync` — daily at midnight on Hobby (Pro supports 1-min polling)
3. Route creates an `EventHubConsumerClient` (`$Default` consumer group), gets partition IDs, loads last offsets from `telemetry_checkpoints`
4. Subscribes to each partition, receives events for 8 seconds (max 150 events)
5. Parses JSON, looks up `motor_nodes` by `iot_device_id`, builds insert rows with `partition_id` + `event_hub_offset`
6. Bulk upserts into `telemetry_live` with `UNIQUE(partition_id, event_hub_offset)` — duplicate-safe
7. Updates `motor_nodes.status` per motor from telemetry payload
8. Reaps stale nodes: Active → Idle (no telemetry in 1h), Idle → Offline (no telemetry in 1d)
9. Updates checkpoints for next run

**Duplicate safety**: If the server crashes after insert but before checkpoint update, the next run re-reads the same events but they're silently skipped by the unique constraint.

### Telemetry Payload Schema

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

Legacy field names `temperature_c`, `vibration_mms`, `current_a`, `voltage_v` are still accepted with lower priority. New deployments should use the schema above.

### Connection String Format

`IOT_HUB_EVENTHUB_CONNECTION` must start with `Endpoint=`. If it already contains `EntityPath=...`, omit `eventHubName` from the `EventHubConsumerClient` constructor — the SDK reads it from the connection string.

## Testing

Uses **Vitest** with **React Testing Library** and `jsdom`. 76 tests across 5 files:

| File | Coverage |
|---|---|
| `tests/api-routes.test.ts` | API routes — signup, device register/details, diagnostics, password, telemetry sync |
| `tests/proxy.test.ts` | Route protection — redirects, auth checks, email confirmation gate |
| `tests/hooks.test.tsx` | `useAuth`, `useReauth`, `useSupabase` (nodes, KPIs, fleet health, telemetry, diagnostics, terminal) |
| `tests/components.test.tsx` | `StatusChip`, `KpiCard`, `DeviceCard`, `DiagnosticsGrid`, `TerminalWindow`, `ReauthDialog` |
| `tests/lib.test.ts` | `getNodeHealth`, rate-limit, images, Supabase clients, IoT Hub (register, status, delete, list, generate ID) |

Mock external services (Supabase, Azure IoT Hub, Event Hubs) — do not hit live services from unit tests. `tests/helpers/supabase.ts` provides reusable Supabase query-chain mocks.

```bash
pnpm test                              # Run all tests
pnpm vitest run tests/hooks.test.tsx   # Run a specific file
```

## Design System

Material Design 3 Light theme. All tokens in `src/app/globals.css` via `@theme` — no `tailwind.config` file.

- **Typography**: Inter (sans) + JetBrains Mono (mono) via `next/font/google`
- **Spacing tokens**: `p-margin-desktop` (32px), `p-margin-mobile` (16px), `p-gutter` (16px)
- **Icons**: Material Symbols via `material-symbols` npm package — `<span className="material-symbols-outlined">icon</span>`
- **Charts**: Recharts `ResponsiveContainer` — parent needs explicit height

## License

GNU General Public License v3.0 — see [LICENSE](./LICENSE).
