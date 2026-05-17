import TerminalWindow from "@/components/terminal/terminal-window";
import MetricsSidebar from "@/components/terminal/metrics-sidebar";
import StatusBar from "@/components/layout/status-bar";

export default function TerminalPage() {
  return (
    <div className="flex flex-col gap-gutter h-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-sans text-[24px] leading-8 font-semibold text-primary">
            System Terminal
          </h2>
          <p className="font-sans text-[14px] leading-5 text-on-surface-variant">
            Direct command access to Kinetic Industrial nodes
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
              Target Node
            </label>
            <select className="bg-surface border border-outline px-4 py-2 text-[14px] leading-5 font-sans focus:border-primary focus:ring-0 outline-none transition-all">
              <option>Induction Motor [MOT-01-A]</option>
              <option>Stepper Motor [STP-MR-02]</option>
              <option>Stepper Motor [STP-CP-03]</option>
            </select>
          </div>
          <button className="bg-primary text-on-primary px-6 py-2 flex items-center gap-2 transition-all active:opacity-80">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold uppercase">
              Export Logs
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter flex-1 min-h-0">
        <div className="col-span-12 lg:col-span-9 flex flex-col min-h-0">
          <TerminalWindow />
        </div>
        <div className="col-span-12 lg:col-span-3 flex flex-col min-h-0">
          <MetricsSidebar />
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
