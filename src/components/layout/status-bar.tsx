export default function StatusBar() {
  return (
    <footer className="h-8 bg-surface-container-highest border-t border-outline-variant flex items-center px-gutter gap-6 text-[10px] font-mono font-bold uppercase tracking-[0.05em] text-on-surface-variant">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-secondary" />
        <span>System Online</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px]">memory</span>
        <span>CPU: 12%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px]">lan</span>
        <span>Lat: 4ms</span>
      </div>
      <div className="ml-auto">Kinetic Industrial | Build 04.22.9</div>
    </footer>
  );
}
