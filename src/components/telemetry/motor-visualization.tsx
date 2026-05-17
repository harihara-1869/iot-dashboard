import type { MotorNode } from "@/lib/types";

export default function MotorVisualization({ node }: { node: MotorNode }) {
  return (
    <div className="relative w-full flex flex-col items-center justify-center min-h-[500px] overflow-hidden py-10">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(#c5c6ca 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <div className="relative z-10 w-full max-w-lg">
        {node.image_url ? (
          <img
            alt={node.name}
            className="w-full h-auto object-contain"
            src={node.image_url}
          />
        ) : (
          <div className="w-full h-64 border border-dashed border-outline-variant rounded flex items-center justify-center bg-surface">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">
              settings
            </span>
          </div>
        )}
        <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 backdrop-blur-[12px] bg-white/70 border border-white/50 px-6 py-2 rounded-full flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-secondary" />
          <span className="font-mono text-[14px] leading-5 font-medium text-on-surface">
            Status: {node.status}/Normal
          </span>
        </div>
      </div>

      <div className="absolute top-[20%] left-[20%] flex flex-col gap-1 z-20 floating-tile-1 border border-outline-variant p-2 rounded-lg bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
            Vibration
          </span>
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
            vibration
          </span>
        </div>
        <div className="font-mono text-[20px] leading-7 font-semibold text-primary">
          1.2 <span className="font-mono text-[14px] leading-5 font-medium text-on-surface-variant">mm/s</span>
        </div>
      </div>

      <div className="absolute top-[25%] right-[20%] flex flex-col gap-1 items-end z-20 floating-tile-2 border border-outline-variant p-2 rounded-lg bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
            Temperature
          </span>
          <span className="material-symbols-outlined text-secondary text-[16px]">
            thermostat
          </span>
        </div>
        <div className="font-mono text-[20px] leading-7 font-semibold text-primary">
          42.5 <span className="font-mono text-[14px] leading-5 font-medium text-on-surface-variant">°C</span>
        </div>
      </div>

      <div className="absolute bottom-[20%] left-[25%] flex flex-col gap-1 z-20 floating-tile-3 border border-outline-variant p-2 rounded-lg bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
            Current Draw
          </span>
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
            electric_bolt
          </span>
        </div>
        <div className="font-mono text-[20px] leading-7 font-semibold text-primary">
          1.5 <span className="font-mono text-[14px] leading-5 font-medium text-on-surface-variant">A</span>
        </div>
      </div>
    </div>
  );
}
