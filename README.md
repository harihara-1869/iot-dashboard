# Kinetic Industrial — Motor Control Dashboard

A precision industrial motor monitoring and control dashboard for IoT-enabled motor systems. Provides real-time telemetry visualization, device inventory management, system health diagnostics, terminal command access, and automated device provisioning via Azure IoT Hub.

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
| IoT | [Azure IoT Hub](https://azure.microsoft.com/products/iot-hub) (Device Identity Registry + MQTT) |
| Package Manager | pnpm |

## File Structure

```
src/
├── app/
│   ├── layout.tsx                         # Root layout (fonts, globals)
│   ├── page.tsx                           # Redirect / → /dashboard
│   ├── (auth)/
│   │   ├── layout.tsx                     # Login shell (header + footer)
│   │   ├── login/page.tsx                 # Email + Password login form
│   │   └── signup/page.tsx                # New operator registration
│   ├── (dashboard)/
│   │   ├── layout.tsx                     # Sidebar + Topbar + ActivityMonitor shell
│   │   ├── dashboard/page.tsx             # KPI cards + Device List + Fluid Status
│   │   ├── nodes/page.tsx                 # Filter bar + Device cards + System Alert
│   │   ├── health/page.tsx                # Status bar + Diagnostics Grid + History table
│   │   ├── terminal/page.tsx              # Terminal + Metrics sidebar + Status bar
│   │   └── preferences/page.tsx           # Account profile + display settings
│   ├── motor/
│   │   └── [id]/page.tsx                  # Motor viz + Telemetry charts (Recharts)
│   ├── help/page.tsx                      # Project overview + research background (public)
│   ├── contact/page.tsx                   # RVCE contact info (public)
│   ├── privacy/page.tsx                   # Privacy policy (public)
│   └── api/
│       ├── auth/
│       │   └── signup/route.ts            # POST — create user via Supabase Auth
│       ├── devices/register/route.ts      # POST — authenticated device registration
│       └── diagnostics/run/route.ts       # POST — system-wide health check (Azure + DB)
├── components/
│   ├── layout/       # Sidebar, Topbar, StatusBar, LoginHeader, LoginFooter
│   ├── ui/           # StatusChip, KpiCard, DataField, Button, GlassPanel, FluidStatus
│   ├── nodes/        # DeviceCard, FilterBar, RegisterDeviceDialog
│   ├── health/       # DiagnosticsGrid, HistoryTable
│   ├── terminal/     # TerminalWindow, MetricsSidebar
│   ├── telemetry/    # MotorVisualization, TelemetryCharts (Recharts)
│   └── auth/         # ActivityMonitor (client-only inactivity auto-logout)
├── lib/
│   ├── supabase/     # Browser client (createBrowserClient) + Server client (createServerClient)
│   ├── iot-hub/      # Azure IoT Hub device identity registry
│   ├── hooks/        # useAuth, useSupabase (motor nodes, telemetry, diagnostics)
│   └── types/        # MotorNode, TelemetryPoint, DiagnosticsLog, etc.
├── proxy.ts           # Route protection (Supabase SSR, was middleware.ts)
├── instrumentation.ts # DB table verification at startup
└── app/globals.css    # Design tokens (exact Figma colors, animations, utilities)
```

## Routes

| Route | Screen | Auth |
|---|---|---|
| `/login` | Email + Password login | No |
| `/signup` | New operator registration | No |
| `/dashboard` | KPI Overview (Home) | Yes |
| `/nodes` | Nodes Inventory + Fleet Status | Yes |
| `/health` | System Health Diagnostics + History | Yes |
| `/terminal` | System Terminal | Yes |
| `/preferences` | Account Preferences | Yes |
| `/motor/[id]` | Motor Detail — Telemetry + Charts | Yes |
| `/help` | Project help + architecture overview | No |
| `/contact` | RVCE contact information | No |
| `/privacy` | Privacy policy | No |
| `POST /api/auth/signup` | Create user via Supabase Auth | No |
| `POST /api/devices/register` | Register New Device (Supabase + Azure IoT Hub) | Yes |
| `POST /api/diagnostics/run` | Run system diagnostics (Azure + DB + server) | Yes |

## Quick Start

### 1. Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io) (`npm install -g pnpm`)
- A [GitHub](https://github.com) account (for Supabase auth)

### 2. Clone and Install

```bash
git clone <repo-url> dashboard
cd dashboard
pnpm install
```

### 3. Supabase Setup (Free Tier)

1. Go to [supabase.com](https://supabase.com) and sign in with GitHub
2. Click **New project** → choose an organization or create one
3. Set project name (e.g. `kinetic-industrial`), a secure database password, and region closest to you
4. Wait for the database to provision (~2 minutes)
5. Go to **Project Settings → API**
6. Copy the **Project URL** and **anon/public key**
7. Paste them into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
   ```
8. Go to **SQL Editor** in the Supabase dashboard
9. Run scripts in order:
   - `supabase/schema.sql` — creates tables, RLS, profiles, `handle_new_user()` trigger, enables Realtime
   - `supabase/rpc.sql` — creates `latest_telemetry_averages()` KPI function
10. Go to **Authentication → Settings**:
    - Toggle **"Allow new users to sign up"** ON (for initial onboarding, toggle OFF after team is registered)
    - Optionally disable **"Confirm email"** for development
11. Add `http://localhost:3000/auth/confirm` to **Redirect URLs**

### 4. Azure IoT Hub Setup (Free Tier)

1. Go to [portal.azure.com](https://portal.azure.com) and sign in
2. Click **Create a resource** → search "IoT Hub" → **Create**
3. Subscription: choose **Free Trial** or existing
4. Resource group: create new (e.g. `kinetic-industrial-rg`)
5. IoT hub name: e.g. `motor-predictor-hub`
6. Region: choose closest to you
7. Tier: select **Free** (8,000 messages/day, 500 device identities)
8. Click **Review + create** → **Create**
9. Once deployed, go to the IoT Hub resource → **Shared access policies** (under Security settings)
10. Click **iothubowner** → copy the **Connection string—primary key**
11. Add to `.env.local`:
    ```
    AZURE_IOT_HUB_HOST=motor-predictor-hub.azure-devices.net
    AZURE_IOT_HUB_CONNECTION_STRING=HostName=motor-predictor-hub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=...
    ```

### 5. Seed the Database

```bash
npx tsx supabase/seed.ts              # 8 motor nodes + 24h telemetry
```

### 6. Start the Dev Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The instrumentation hook verifies database connectivity at startup and logs the status.

### 7. Create Your Account

Navigate to `/signup` and register with:
- **Email**: your email
- **Operator ID**: e.g. `KNS-000001`
- **Password**: min 8 characters

If email confirmation is enabled, check your inbox. Otherwise log in directly at `/login`.

### 8. Register an IoT Device

1. Navigate to **Nodes** via the sidebar
2. Click **Register New Node**
3. Fill in **Device Name** and **Location**
4. Leave **Custom Device ID** empty for auto-generation
5. Click **Register Device**
6. Save the displayed credentials (Device ID, IoT Hub Host, Primary Key)
7. Flash these credentials to your ESP32/MCU for MQTT-based telemetry

## Required Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `AZURE_IOT_HUB_HOST` | Azure IoT Hub hostname |
| `AZURE_IOT_HUB_CONNECTION_STRING` | IoT Hub owner connection string |

See `.env.local.example` for the template.

## Available Scripts

```bash
pnpm dev                           # Start development server (Turbopack)
pnpm build                         # Production build
pnpm start                         # Start production server
pnpm lint                          # Run ESLint
```

## Seeding

```bash
npx tsx supabase/seed.ts           # Seed motor nodes + telemetry (8 nodes, 24h data)
```

## Database Schema

| Table | Purpose |
|---|---|
| `motor_nodes` | Device inventory — name, type, location, specs, status |
| `telemetry_live` | Real-time sensor data (Realtime-enabled) — RPM, temp, vibration, current |
| `diagnostics_logs` | System health check history |
| `terminal_logs` | Command history per device |
| `profiles` | Extended user data — operator_id, email, linked to `auth.users` via FK |

## Authentication

Authentication uses **Supabase Auth** (email + password) with `@supabase/ssr` for route protection and cookie management.

### Key Details

- **Login**: `supabase.auth.signInWithPassword({ email, password })` in the `useAuth` hook
- **Logout**: `supabase.auth.signOut()` — clears Supabase session cookies
- **Session cookie**: `sb-{project-ref}-auth-token` managed by `@supabase/ssr`
- **User data**: `operator_id` stored in `user_metadata.operator_id` during signup; auto-populated to `public.profiles` via `handle_new_user()` trigger
- **Signup gate**: Controlled by Supabase dashboard → Authentication → Settings → "Allow new users to sign up" toggle
- **Email confirmation**: Configurable in Supabase dashboard; `/auth/confirm` route handles OTP redirects

### Route Protection

`src/proxy.ts` (Next.js 16 convention) protects `/dashboard`, `/nodes`, `/health`, `/terminal`, `/motor`, `/preferences` — redirects to `/login` if unauthenticated. Authenticated users on `/login` are redirected to `/dashboard`.

### RLS (Row Level Security)

All tables require `auth.role() = 'authenticated'`. The anon/publishable key alone cannot read or write data — a valid user session JWT must be present. The `handle_new_user()` trigger runs as `SECURITY DEFINER` (bypasses RLS) to auto-create profiles on signup.

### Inactivity Auto-Logout (30 min)

`src/components/auth/activity-monitor.tsx` watches `mousemove`, `keydown`, `click`, `scroll`, `touchstart` across all protected pages:

- After **28 minutes** of inactivity: displays a modal with a live 2-minute countdown and "Stay logged in" / "Logout now" buttons.
- After **30 minutes** total: calls `supabase.auth.signOut()` and redirects to `/login`.
- Purely client-side — no server heartbeat. The Supabase session cookie TTL (~1h by default) determines how long the session remains valid if the browser tab is closed without logging out.

## Firmware Design (ESP32 / MCU)

The system uses **edge-native analysis** — each motor node runs self-diagnostics locally on the MCU and reports status + telemetry to the cloud. The dashboard receives and displays the results; it does not perform the analysis.

### Architecture

```
┌─────────────────────────────┐     MQTT (SAS Token)     ┌──────────────────────┐
│  ESP32 / MCU (Node)         │ ◄────────────────────── ► │  Azure IoT Hub       │
│                             │                           │                      │
│  ┌───────────────────────┐  │                           │  ┌────────────────┐  │
│  │ Sensor Read Loop      │  │                           │  │ Device Registry │  │
│  │  - RPM (hall sensor)  │  │                           │  └────────────────┘  │
│  │  - Temperature (RTD)  │  │                           │  ┌────────────────┐  │
│  │  - Vibration (IMU)    │  │                           │  │ MQTT Broker    │──► Supabase
│  │  - Current (ACS712)   │  │                           │  └────────────────┘  │  (Realtime)
│  │  - Voltage divider    │  │                           └──────────────────────┘
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Local Analysis Engine │  │
│  │  - Threshold checks   │  │
│  │  - Anomaly detection  │  │
│  │  - Status evaluation  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### MQTT Telemetry Topic

Each device publishes a JSON payload every **5 seconds** to:

```
devices/{deviceId}/messages/events/
```

### Telemetry Payload Schema

```json
{
  "device_id": "esp32-production-motor-44qcpd",
  "timestamp": "2025-05-17T14:30:00Z",
  "rpm": 3450.0,
  "temperature_c": 42.5,
  "vibration_mms": 1.2,
  "current_a": 12.1,
  "voltage_v": 220.4,
  "status": "ok",
  "status_message": "All parameters within nominal range"
}
```

### Status Codes

The node performs on-device analysis and sends one of:

| Status | Meaning | Dashboard Badge |
|---|---|---|
| `ok` | All sensors nominal, no anomalies | Active (green) |
| `warning` | Parameter approaching threshold (e.g. temp ±5°C from normal) | Maintenance Required (amber) |
| `critical` | Threshold exceeded or sensor failure | Maintenance Required (red) |
| `idle` | Motor stopped but healthy | Idle (orange) |

### On-Device Analysis Logic (Pseudocode)

```cpp
// Runs every 5-second loop on the ESP32
void analyze_and_report() {
  float rpm     = read_hall_sensor();
  float temp    = read_rtd();
  float vib     = read_imu_rms();
  float current = read_acs712();
  float voltage = read_voltage_divider();

  String status = "ok";
  String message = "All parameters within nominal range";

  // Threshold checks (configurable per motor type)
  if (temp > TEMP_CRITICAL_THRESHOLD || vib > VIB_CRITICAL_THRESHOLD) {
    status = "critical";
    message = "Critical threshold exceeded";
  } else if (temp > TEMP_WARN_THRESHOLD || vib > VIB_WARN_THRESHOLD) {
    status = "warning";
    message = "Parameter approaching warning threshold";
  } else if (rpm == 0) {
    status = "idle";
    message = "Motor stopped";
  }

  // Build and publish JSON payload over MQTT
  publish_telemetry(rpm, temp, vib, current, voltage, status, message);
}
```

### MQTT Authentication (SAS Token)

The device authenticates to Azure IoT Hub using a **Shared Access Signature (SAS) token** derived from the primary key. The SAS token is generated once on the MCU from the credentials received during device registration:

```
Host:       motor-predictor-hub.azure-devices.net
Device ID:  esp32-production-motor-44qcpd
Username:   {host}/{deviceId}/?api-version=2021-04-12
Password:   SharedAccessSignature sr={host}%2Fdevices%2F{deviceId}&sig={hashedKey}&se={expiry}
```

Use the [Azure IoT Hub MQTT](https://learn.microsoft.com/en-us/azure/iot-hub/iot-hub-mqtt-support) protocol directly — no Azure SDK required on the MCU. A lightweight implementation using `PubSubClient` (Arduino) or `esp-mqtt` (ESP-IDF) is sufficient.

### Data Flow

1. ESP32 reads sensors → runs local analysis → determines status
2. Publishes telemetry JSON over MQTT to Azure IoT Hub every 5 seconds
3. IoT Hub routes messages to a consumer that writes to `telemetry_live` table
4. Supabase Realtime pushes new rows to the dashboard UI
5. Dashboard KPI cards, charts, and device status badges update live

## License

GNU General Public License v3.0 — see [LICENSE](./LICENSE).
