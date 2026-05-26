import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:opacity-90",
  secondary:
    "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low border-b-2",
  danger: "bg-error text-on-error font-bold hover:bg-on-error-container border-b-2 border-on-error-container",
};

export default function Button({
  variant = "primary",
  children,
  onClick,
  className = "",
  type = "button",
  icon,
  disabled,
}: {
  variant?: ButtonVariant;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  icon?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 rounded font-sans text-[14px] leading-5 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${variantStyles[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
