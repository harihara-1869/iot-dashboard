export default function LoginHeader() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <img
          alt="Logo"
          className="h-10 w-10"
          src="https://lh3.googleusercontent.com/aida/ADBb0uiFv7TbhgH4y8zQFFqdvelNyr6zi9VUJ48h5-A9nqLhVS0l4f50Jmgf6XOIsprEVZc4G1050b4kTcaIYJHQKHbWMjOYWUjH0PU1_crmRQiW20fbOBg65kx9lUr74o5EowrnogRTc19K79v0n6ErezZSDXp4WEvcNavMi1mWAM12e4ULt_VYrclMGo1Z0fdg5tACBV9mWDt-JkGwg2KzSrLBjcpwNZ1OToTWK-X_6JBr6Klwv3tvLh57eIc"
        />
        <h1 className="font-sans text-[24px] leading-8 font-semibold font-bold text-primary">
          KINETIC INDUSTRIAL
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-lg border border-outline-variant">
          <span className="w-3 h-3 bg-secondary rounded-full fluid-status-glow" />
          <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-secondary uppercase">
            ONLINE
          </span>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high transition-colors p-2 rounded cursor-pointer">
            help
          </span>
          <span className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high transition-colors p-2 rounded cursor-pointer">
            settings
          </span>
        </div>
      </div>
    </header>
  );
}
