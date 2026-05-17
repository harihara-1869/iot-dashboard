export default function DataField({
  label,
  value,
  size = "md",
}: {
  label: string;
  value: string;
  size?: "sm" | "md";
}) {
  if (size === "sm") {
    return (
      <div>
        <p className="font-mono text-[10px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase">
          {label}
        </p>
        <p className="font-mono text-[14px] leading-5 font-medium">
          {value}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-on-surface-variant uppercase mb-1">
        {label}
      </p>
      <p className="font-mono text-[20px] leading-7 font-semibold text-primary mt-1">
        {value}
      </p>
    </div>
  );
}
