"use client";

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-[24px] max-w-3xl">
      <div>
        <h2 className="font-sans text-[24px] leading-8 font-semibold text-primary">
          Help
        </h2>
        <p className="font-sans text-[16px] leading-6 text-on-surface-variant mt-1">
          About this project
        </p>
      </div>

      <section className="bg-surface border border-outline-variant rounded-lg p-6">
        <h3 className="font-sans text-[16px] leading-6 font-semibold text-on-surface mb-4">
          Next-Generation Edge-Intelligent Smart Metering
        </h3>
        <div className="space-y-4 font-sans text-[14px] leading-5 text-on-surface-variant">
          <p>
            This dashboard is the frontend for an embedded IoT research project that
            reimagines a passive energy meter as an <strong className="text-on-surface">intelligent edge processing node</strong>.
            The system is based on the research paper <em>Next-Generation Edge-Intelligent
            Smart Metering</em>, covering Non-Intrusive Load Monitoring (NILM), power
            quality analytics, and active load protection using low-cost microcontrollers
            (ESP32, STM32, Raspberry Pi).
          </p>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-6">
            Core Capabilities
          </h4>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Runs NILM / load fingerprinting locally on the microcontroller via TinyML and Edge Impulse</li>
            <li>Computes power quality metrics (THD, Power Factor, voltage sags, RoCoF) in real time</li>
            <li>Executes active load protection via PWM soft-start with no cloud dependency for actuation</li>
            <li>Sends compressed semantic telemetry to cloud (Azure IoT Hub or ThingSpeak)</li>
          </ul>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-6">
            Key References
          </h4>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Ref [1]</strong> &mdash; Non-Intrusive Load Monitoring via Edge-Based TinyML on ESP32
              (ESP32 + Edge Impulse + TinyML with real-world disaggregation to F1-score ~0.90)
            </li>
            <li>
              <strong>Ref [4]</strong> &mdash; YoMoPie (AAU) &mdash; Raspberry Pi NILM with 10 Hz
              continuous sliding-window feedforward neural network disaggregation
            </li>
          </ul>

          <h4 className="font-sans text-[14px] leading-5 font-semibold text-on-surface mt-6">
            Dashboard Features
          </h4>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Home</strong> &mdash; KPI overview: active devices, vibration, temperature, current draw</li>
            <li><strong>Nodes</strong> &mdash; Browse and manage registered motor nodes with diagnostics</li>
            <li><strong>Health</strong> &mdash; System-wide telemetry and power quality trend charts</li>
            <li><strong>Terminal</strong> &mdash; Send commands to individual nodes via text-based interface</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
