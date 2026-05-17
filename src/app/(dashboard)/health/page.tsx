import DiagnosticsGrid from "@/components/health/diagnostics-grid";
import HealthHistoryTable from "@/components/health/history-table";

export default function HealthPage() {
  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="flex gap-2 mb-2">
            <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant">
              SYSTEM
            </span>
            <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-outline">
              /
            </span>
            <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-primary">
              DIAGNOSTICS
            </span>
          </nav>
          <h2 className="font-sans text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-primary">
            System Health Diagnostics
          </h2>
        </div>
        <button className="bg-primary text-on-primary px-8 py-3 rounded-lg flex items-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-sm border-b-2 border-primary-container">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            play_arrow
          </span>
          <span className="font-sans text-[16px] leading-6 font-bold">Run System Diagnostics</span>
        </button>
      </div>

      <div className="mb-8 rounded-xl border border-outline-variant overflow-hidden relative">
        <div className="lava-flow absolute inset-0 opacity-20" />
        <div className="relative glass-effect p-gutter flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-secondary shadow-[0_0_12px_#82f5c1] status-pulse" />
            <span className="font-mono text-[20px] leading-7 font-semibold text-secondary">
              SYSTEM OPERATIONAL: NOMINAL LOAD
            </span>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant">
                UPTIME
              </p>
              <p className="font-mono text-[14px] leading-5 font-medium">142:12:04:19</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant">
                LOAD FACTOR
              </p>
              <p className="font-mono text-[14px] leading-5 font-medium text-secondary">34.2%</p>
            </div>
          </div>
        </div>
      </div>

      <DiagnosticsGrid />
      <HealthHistoryTable />

      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform z-50">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          add
        </span>
      </button>
    </div>
  );
}
