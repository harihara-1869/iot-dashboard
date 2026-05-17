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
| Auth | Supabase Auth (email/password) |
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
│   │   ├── layout.tsx                     # Sidebar + Topbar shell
│   │   ├── dashboard/page.tsx             # KPI cards + Device List + Fluid Status
│   │   ├── nodes/page.tsx                 # Filter bar + Device cards + System Alert
│   │   ├── health/page.tsx                # Glass status bar + Diagnostics + History table
│   │   └── terminal/page.tsx              # SSH terminal + Metrics sidebar + Status bar
│   ├── motor/
│   │   └── [id]/page.tsx                  # Motor viz + Floating tiles + Recharts graphs
│   └── api/
│       └── devices/register/route.ts      # POST device registration endpoint
├── components/
│   ├── layout/       # Sidebar, Topbar, StatusBar, LoginHeader, LoginFooter
│   ├── ui/           # StatusChip, KpiCard, DataField, Button, GlassPanel, FluidStatus
│   ├── nodes/        # DeviceCard, FilterBar, RegisterDeviceDialog
│   ├── health/       # DiagnosticsGrid, HealthHistoryTable
│   ├── terminal/     # TerminalWindow, MetricsSidebar
│   └── telemetry/    # MotorVisualization, TelemetryCharts (Recharts)
├── lib/
│   ├── supabase/     # Browser + Server clients
│   ├── iot-hub/      # Azure IoT Hub device identity registry
│   ├── hooks/        # useAuth, useSupabase (motor nodes, telemetry, diagnostics)
│   └── types/        # MotorNode, TelemetryPoint, DiagnosticsLog, etc.
├── middleware.ts      # Route protection
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
9. Paste and run `supabase/schema.sql` — creates tables, RLS policies, and enables Realtime
10. Paste and run `supabase/rpc.sql` — creates the KPI aggregation function

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
npx tsx supabase/seed.ts
```

This inserts 8 motor nodes, 8 diagnostic logs, and ~2300 telemetry data points (24 hours at 5-minute intervals).

### 6. Start the Dev Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The instrumentation hook verifies database connectivity at startup and logs the status.

### 7. Register an IoT Device

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
pnpm dev        # Start development server (Turbopack)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
npx tsx supabase/seed.ts  # Seed database with test data
```

## Database Schema

| Table | Purpose |
|---|---|
| `motor_nodes` | Device inventory — name, type, location, specs, status |
| `telemetry_live` | Real-time sensor data (Realtime-enabled) — RPM, temp, vibration, current |
| `diagnostics_logs` | System health check history |
| `terminal_logs` | Command history per device |

## Authentication

Operator ID = Supabase email, Access Key = Supabase password. Auth state is managed via `@supabase/ssr` with a client-side auth hook. The middleware redirects unauthenticated users to `/login`. Logout clears the session and returns to the login screen.
