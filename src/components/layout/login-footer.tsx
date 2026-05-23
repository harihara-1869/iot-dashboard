import Link from "next/link";

export default function LoginFooter() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 bg-surface-container-lowest border-t border-outline-variant">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <span className="font-mono text-[12px] leading-4 tracking-[0.05em] font-bold text-primary">
          KINETIC MOTOR SYSTEMS
        </span>
        <span className="font-sans text-[14px] leading-5 text-on-surface-variant uppercase">
          © 2024 KINETIC MOTOR SYSTEMS. ALL RIGHTS RESERVED.
        </span>
      </div>
      <nav className="flex gap-8">
        <Link
          className="font-sans text-[14px] leading-5 text-on-surface-variant hover:text-primary transition-colors"
          href="/privacy"
        >
          Privacy Policy
        </Link>
        <Link
          className="font-sans text-[14px] leading-5 text-on-surface-variant hover:text-primary transition-colors"
          href="/contact"
        >
          Contact
        </Link>
      </nav>
    </footer>
  );
}
