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
| Auth | Passport.js + Argon2id + iron-session |
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
│   │   └── login/page.tsx                 # Operator ID + Access Key form
│   ├── (dashboard)/
│   │   ├── layout.tsx                     # Sidebar + Topbar + ActivityMonitor shell
│   │   ├── dashboard/page.tsx             # KPI cards + Device List + Fluid Status
│   │   ├── nodes/page.tsx                 # Filter bar + Device cards + System Alert
│   │   ├── health/page.tsx                # Glass status bar + Diagnostics + History table
│   │   └── terminal/page.tsx              # SSH terminal + Metrics sidebar + Status bar
│   ├── motor/
│   │   └── [id]/page.tsx                  # Motor viz + Floating tiles + Recharts graphs
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts             # POST — Passport authenticate + iron-session
│       │   ├── logout/route.ts            # POST — destroy session
│       │   ├── session/route.ts           # GET — current user
│       │   └── touch/route.ts             # POST — refresh inactivity timestamp
│       └── devices/register/route.ts      # POST device registration endpoint
├── components/
│   ├── layout/       # Sidebar, Topbar, StatusBar, LoginHeader, LoginFooter
│   ├── ui/           # StatusChip, KpiCard, DataField, Button, GlassPanel, FluidStatus
│   ├── nodes/        # DeviceCard, FilterBar, RegisterDeviceDialog
│   ├── health/       # DiagnosticsGrid, HealthHistoryTable
│   ├── terminal/     # TerminalWindow, MetricsSidebar
│   ├── telemetry/    # MotorVisualization, TelemetryCharts (Recharts)
│   └── auth/         # ActivityMonitor (inactivity auto-logout)
├── lib/
│   ├── supabase/     # Browser + Server clients
│   ├── auth/         # password.ts (Argon2), passport.ts (strategy), session.ts (iron-session)
│   ├── iot-hub/      # Azure IoT Hub device identity registry
│   ├── hooks/        # useAuth, useSupabase (motor nodes, telemetry, diagnostics)
│   └── types/        # MotorNode, TelemetryPoint, DiagnosticsLog, etc.
├── middleware.ts      # Route protection (session cookie check)
├── instrumentation.ts # DB table verification at startup
└── app/globals.css    # Design tokens (exact Figma colors, animations, utilities)
```

## Routes

| Route | Screen |
|---|---|
| `/login` | Enhanced Login |
| `/dashboard` | Dynamic Status (Home) |
| `/nodes` | Nodes Inventory |
| `/health` | System Health Diagnostics |
| `/terminal` | System Terminal |
| `/motor/[id]` | Motor Detail — Floating Telemetry |
| `POST /api/devices/register` | Register New Device (Supabase + Azure IoT Hub) |
| `POST /api/auth/login` | Authenticate operator (Passport.js + Argon2id) |
| `POST /api/auth/logout` | Destroy session |
| `GET /api/auth/session` | Current user session |
| `POST /api/auth/touch` | Inactivity heartbeat |

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
pnpm approve-builds argon2
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
   - `supabase/schema.sql` — creates tables, RLS, enables Realtime
   - `supabase/rpc.sql` — creates `latest_telemetry_averages()` KPI function
   - `supabase/operators.sql` — creates `operators` table for Argon2-hashed passwords

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

### 5. Configure Session Secret

Generate a random 32+ character secret and add to `.env.local`:

```
SESSION_SECRET=your-random-secret-at-least-32-chars
```

### 6. Seed the Database

```bash
npx tsx supabase/seed.ts              # 8 motor nodes + 24h telemetry
npx tsx supabase/seed-operator.ts     # Test operators (operator@kinetic.local / access-key-123)
```

### 7. Start the Dev Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The instrumentation hook verifies database connectivity at startup and logs the status.

Log in with:
- **Operator ID**: `operator@kinetic.local`
- **Access Key**: `access-key-123`

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
| `SESSION_SECRET` | 32+ char secret for iron-session cookie encryption |

See `.env.local.example` for the template.

## Available Scripts

```bash
pnpm dev                           # Start development server (Turbopack)
pnpm build                         # Production build
pnpm start                         # Start production server
pnpm lint                          # Run ESLint
npx tsx supabase/seed.ts           # Seed motor nodes + telemetry
npx tsx supabase/seed-operator.ts  # Seed test operators
```

## Database Schema

| Table | Purpose |
|---|---|
| `motor_nodes` | Device inventory — name, type, location, specs, status |
| `telemetry_live` | Real-time sensor data (Realtime-enabled) — RPM, temp, vibration, current |
| `diagnostics_logs` | System health check history |
| `terminal_logs` | Command history per device |
| `operators` | Operator accounts — email, operator_id, Argon2id password hash |

## Authentication

### Password Hashing — Argon2id

Passwords are hashed with **Argon2id** (10 iterations, 64 MB memory, 32-byte output) with a random salt auto-generated per hash. Implemented in `src/lib/auth/password.ts`.

### Timing Attack Defense

- `argon2.verify()` uses internal constant-time comparison — never early-exits on mismatch.
- When login receives an email that doesn't exist in `operators`, a dummy hash is verified with identical Argon2 parameters — matching CPU cost. This prevents user enumeration via timing.
- `constantTimeEqual()` via `crypto.timingSafeEqual` is exported for external use.

### Session Management

- **Passport.js** with `passport-local` strategy handles credential verification.
- **iron-session** encrypts the session into a `kinetic_session` httpOnly cookie (8-hour max age, `lax` same-site).
- `POST /api/auth/login` — authenticates, creates session.
- `POST /api/auth/logout` — destroys session cookie.
- `GET /api/auth/session` — returns current user or `{ user: null }`.

### Inactivity Auto-Logout (30 min)

`src/components/auth/activity-monitor.tsx` watches user activity across all protected pages:

- Sends a heartbeat `POST /api/auth/touch` every 30 seconds to refresh server-side `lastActivity`.
- After **28 minutes** of inactivity: displays a modal with a live 2-minute countdown and "Stay logged in" / "Logout now" buttons.
- After **30 minutes** total: auto-destroys session, clears cookie, and redirects to `/login`.
- "Stay logged in" resets the inactivity timer immediately.

### Test Operators

| Email | Password | Operator ID |
|---|---|---|
| `operator@kinetic.local` | `access-key-123` | `KNS-000001` |
| `admin@kinetic.local` | `admin-key-456` | `KNS-ADMIN` |

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
