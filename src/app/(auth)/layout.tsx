import LoginHeader from "@/components/layout/login-header";
import LoginFooter from "@/components/layout/login-footer";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoginHeader />
      <main className="flex-1 flex flex-col min-h-screen">{children}</main>
      <LoginFooter />
    </>
  );
}
