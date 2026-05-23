"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function HelpPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex justify-between items-center h-16 px-margin-desktop bg-surface border-b border-outline-variant">
        <Link href="/" className="font-sans text-[24px] leading-8 font-semibold font-bold text-primary">
          Kinetic Motor Systems
        </Link>
        {!loading && (
          <Link
            href={user ? "/dashboard" : "/login"}
            className="h-10 bg-primary text-on-primary font-mono text-[12px] leading-4 tracking-[0.05em] font-bold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 px-6"
          >
            {user ? "Dashboard" : "Login"}
          </Link>
        )}
      </header>

      <main className="flex-1 p-margin-desktop max-w-3xl mx-auto w-full flex flex-col gap-[24px]">
        <div>
          <h2 className="font-sans text-[24px] leading-8 font-semibold text-primary">
            Help
          </h2>
          <p className="font-sans text-[16px] leading-6 text-on-surface-variant mt-1">
            About this project
          </p>
        </div>

        <section className="bg-surface border border-outline-variant rounded-lg p-6 space-y-4 font-sans text-[14px] leading-5 text-on-surface-variant">
          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface">
            Next-Generation Edge-Intelligent Smart Metering
          </h3>
          <p>
            Welcome to the dashboard for the <strong>IoT Smart Metering on Stepper Motor
            Testbed</strong> — an embedded edge-intelligent energy monitoring and device
            management platform built using ESP32, STM32, Raspberry Pi, TinyML, and
            Microsoft Azure IoT services.
          </p>
          <p>
            This system reimagines a traditional passive energy meter as an{" "}
            <strong>intelligent edge processing node</strong> capable of local analytics,
            device protection, and cloud-connected telemetry.
          </p>
          <p>The platform is designed for embedded systems research, edge AI experimentation, IoT telemetry visualization, smart motor and power monitoring, and remote device orchestration.</p>

          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mt-6">
            System Architecture
          </h3>
          <p>The platform combines edge computing on microcontrollers, real-time telemetry processing, cloud synchronization through Azure IoT services, intelligent monitoring dashboards, and remote command and diagnostics interfaces.</p>
          <p>Core technologies include ESP32 / STM32 microcontrollers, Raspberry Pi edge gateway nodes, TinyML and Edge Impulse inference, Azure IoT Hub and cloud telemetry, and real-time analytics and monitoring.</p>

          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mt-6">
            Core Capabilities
          </h3>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-4">
            Edge Intelligence (TinyML / NILM)
          </h4>
          <p>The system performs Non-Intrusive Load Monitoring (NILM), load fingerprinting, device behavior analysis, and edge-based inference using TinyML. Inference is executed locally on embedded hardware to reduce cloud dependency and improve response latency.</p>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-4">
            Power Quality Analytics
          </h4>
          <p>The platform continuously computes voltage and current measurements, power factor, Total Harmonic Distortion (THD), voltage sags and anomalies, and Rate of Change of Frequency (RoCoF). These metrics help evaluate electrical stability and motor performance in real time.</p>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-4">
            Active Load Protection
          </h4>
          <p>The system supports PWM soft-start control, current limiting, device protection logic, and automated fault response. Critical protection actions are executed locally at the edge without requiring cloud connectivity.</p>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-4">
            Cloud Telemetry
          </h4>
          <p>Compressed semantic telemetry is transmitted securely to cloud infrastructure using Microsoft Azure IoT Hub, Azure Storage and monitoring services, and optional ThingSpeak integration. The cloud layer provides device synchronization, historical telemetry storage, dashboard visualization, and remote management capabilities.</p>

          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mt-6">
            Dashboard Modules
          </h3>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-4">
            Home
          </h4>
          <p>The Home dashboard provides a high-level operational overview of the platform. Key metrics include active registered devices, device online/offline status, motor vibration readings, temperature monitoring, current draw and power consumption, and system alerts and warnings. This page acts as the central monitoring overview for all connected edge nodes.</p>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-4">
            Device Registration
          </h4>
          <p>The Device Registration module allows administrators to onboard and configure new IoT nodes. Supported capabilities include registering ESP32 / STM32 / Raspberry Pi nodes, assigning unique device identifiers, configuring authentication credentials, associating devices with Azure IoT Hub, enabling telemetry publishing, and initializing edge configuration parameters. Only registered devices are permitted to communicate with the platform.</p>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-4">
            Device Monitoring
          </h4>
          <p>The Device Monitoring section provides real-time operational telemetry from connected nodes. Available telemetry includes voltage and current readings, device uptime, temperature and vibration metrics, edge inference outputs, power quality measurements, connectivity health, and firmware and runtime diagnostics. Monitoring is performed in near real time through Azure cloud synchronization.</p>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-4">
            Terminal
          </h4>
          <p>The Terminal module provides a command-line interface for interacting with connected devices. Administrators can send text-based commands to devices, trigger remote diagnostics, restart or reset nodes, modify runtime parameters, execute test operations, and control PWM and motor behavior. Commands are routed through cloud messaging infrastructure and processed by authorized devices only. The interface also supports debugging and diagnostics, command execution logs, device response visualization, and development and testing workflows. This module is intended primarily for research, development, and engineering operations.</p>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-4">
            Health Dashboard
          </h4>
          <p>The Health Dashboard visualizes overall system health and infrastructure stability. Features include telemetry trend charts, device health indicators, sensor anomaly tracking, power quality analysis graphs, connectivity and uptime statistics, and resource utilization monitoring. This module assists in identifying instability, hardware faults, and abnormal electrical behavior.</p>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-4">
            Account &amp; Profile
          </h4>
          <p>The Account section allows users to manage their dashboard profile and account settings. Available features may include profile information management, authentication settings, password and credential updates, linked device overview, session and login activity, and access permissions. Administrative privileges may be required for advanced system operations.</p>

          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mt-6">
            Security &amp; Privacy
          </h3>
          <p>The platform incorporates several security mechanisms including Azure IoT device authentication, TLS-secured communication, access-controlled APIs, edge-local processing, and restricted command execution. However, this platform is a research and prototype system. Users should avoid uploading confidential information, deploying in mission-critical environments, or using production-sensitive credentials.</p>

          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mt-6">
            Research References
          </h3>
          <p>This project is inspired by research in edge-based TinyML, smart metering, NILM disaggregation, embedded AI systems, and power quality analytics.</p>

          <div className="space-y-3 mt-2">
            <div>
              <strong>Ref [1]</strong> — <em>Non-Intrusive Load Monitoring via Edge-Based TinyML on ESP32</em>
              <br />
              Demonstrates ESP32-based NILM using TinyML and Edge Impulse with real-world appliance disaggregation.
            </div>
            <div>
              <strong>Ref [4]</strong> — <em>YoMoPie (AAU)</em>
              <br />
              Raspberry Pi-based NILM system using continuous sliding-window neural network disaggregation at 10 Hz sampling.
            </div>
          </div>

          <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mt-6">
            Disclaimer
          </h3>
          <div className="flex items-start gap-3 p-4 bg-error/5 border border-error/20 rounded-lg">
            <span className="material-symbols-outlined text-error text-[24px] mt-0.5 flex-shrink-0">
              warning
            </span>
            <p className="text-error">
              This platform is a research and educational prototype. The dashboard and
              connected devices are intended for academic demonstration, embedded systems
              experimentation, and IoT research and development. The system is{" "}
              <strong>not certified</strong> for commercial utility metering, industrial
              safety deployment, or production-grade electrical infrastructure. Features,
              telemetry, and device behavior may change during development and testing.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
