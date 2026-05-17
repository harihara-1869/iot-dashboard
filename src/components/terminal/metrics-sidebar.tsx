export default function MetricsSidebar() {
  return (
    <div className="flex flex-col gap-gutter overflow-y-auto pr-1">
      <div className="bg-surface border border-outline p-6 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="fluid-indicator w-full h-full" />
        </div>
        <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
          Motor Pulse
        </span>
        <div className="flex items-center justify-between">
          <div className="font-sans text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-primary">
            3450{" "}
            <span className="font-sans text-[14px] leading-5 text-on-surface-variant font-normal">
              RPM
            </span>
          </div>
          <span className="material-symbols-outlined text-secondary text-4xl">
            slow_motion_video
          </span>
        </div>
        <div className="flex gap-2">
          <span className="bg-secondary/10 text-secondary px-2 py-1 font-mono text-[10px] font-bold rounded">
            NOMINAL
          </span>
          <span className="bg-primary/5 text-on-surface-variant px-2 py-1 font-mono text-[10px] font-bold rounded">
            LOCKED
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter">
        <div className="bg-surface border border-outline p-4">
          <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
            Current Load
          </span>
          <div className="font-mono text-[20px] leading-7 font-semibold text-primary mt-1">
            12.1 <span className="font-sans text-[14px] leading-5 font-normal">Amps</span>
          </div>
          <div className="w-full bg-surface-container h-1 mt-4">
            <div className="bg-secondary h-full w-[65%]" />
          </div>
        </div>
        <div className="bg-surface border border-outline p-4">
          <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
            Core Temp
          </span>
          <div className="font-mono text-[20px] leading-7 font-semibold text-primary mt-1">
            42.5 <span className="font-sans text-[14px] leading-5 font-normal">°C</span>
          </div>
          <div className="w-full bg-surface-container h-1 mt-4">
            <div className="bg-error h-full w-[42%]" />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-outline flex-1 relative min-h-[200px] group">
        <img
          alt="Industrial Motor Internals"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_2WxD7_ckvlaimVhWFuB1ET5cSj4u4RkxTMEurypVh1Q8bV6y_dtHTtkr-b0CAo8rR_xciBsBt--kJRGUEqiwUONNJUjrtG-ZojhdHTVSAVg6Pw2lz9X_SWzUhqFn1_Fa8fN62BcUPJ8pl3Lti8OT8FudxI_TGcSvZAy0Xw1QqYBAGUYpEMkBkBMv9575p3f9kfCsvqmZBTr1EkLPNCyr6bQ1BDtjVgVqHw_jp4KI--TWspnyG_FDxFIIglU1ngyqkovA1DNPVeSO"
        />
        <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 font-mono text-[10px] font-bold uppercase">
          Node Location: Bay 04
        </div>
      </div>
    </div>
  );
}
