export default function AuthLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
        <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
}
