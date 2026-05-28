import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  user: null as unknown,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mocks.user }, error: null })),
    },
  })),
}));

function request(pathname: string) {
  return new NextRequest(`https://app.local${pathname}`);
}

describe("proxy route protection", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.user = null;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
  });

  it.each(["/dashboard", "/nodes", "/health", "/terminal", "/motor/MOT-1", "/preferences"])(
    "redirects unauthenticated protected route %s to login",
    async (path) => {
      const { proxy } = await import("@/proxy");

      const response = await proxy(request(path));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("https://app.local/login");
    },
  );

  it("redirects authenticated users away from login to dashboard", async () => {
    mocks.user = { id: "user-1", email_confirmed_at: "2026-05-28T00:00:00Z" };
    const { proxy } = await import("@/proxy");

    const response = await proxy(request("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.local/dashboard");
  });

  it("redirects the root path to dashboard", async () => {
    const { proxy } = await import("@/proxy");

    const response = await proxy(request("/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.local/dashboard");
  });

  it("redirects unconfirmed authenticated users on protected pages to login with an error", async () => {
    mocks.user = { id: "user-1", email_confirmed_at: null };
    const { proxy } = await import("@/proxy");

    const response = await proxy(request("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://app.local/login?error=email_unconfirmed");
  });
});
