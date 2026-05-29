import { vi } from "vitest";

type TableResult = {
  data?: unknown;
  error?: unknown;
  count?: number | null;
};

type TableHandlers = Partial<Record<
  "select" | "insert" | "update" | "upsert" | "maybeSingle" | "single",
  unknown
>>;

function resolveValue(value: unknown) {
  return typeof value === "function" ? (value as () => unknown)() : value;
}

export function createQueryBuilder(handlers: TableHandlers = {}) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;

  builder.select = vi.fn(() => chain());
  builder.insert = vi.fn(() => Promise.resolve(resolveValue(handlers.insert ?? { error: null })));
  builder.update = vi.fn(() => chain());
  builder.upsert = vi.fn(() => Promise.resolve(resolveValue(handlers.upsert ?? { error: null })));
  builder.eq = vi.fn(() => chain());
  builder.not = vi.fn(() => chain());
  builder.in = vi.fn(() => chain());
  builder.gte = vi.fn(() => chain());
  builder.order = vi.fn(() => chain());
  builder.limit = vi.fn(() => chain());
  builder.range = vi.fn(() => chain());
  builder.maybeSingle = vi.fn(() => Promise.resolve(resolveValue(handlers.maybeSingle ?? { data: null, error: null })));
  builder.single = vi.fn(() => Promise.resolve(resolveValue(handlers.single ?? { data: null, error: null })));
  builder.then = vi.fn((resolve, reject) =>
    Promise.resolve(resolveValue(handlers.select ?? { data: null, error: null })).then(resolve, reject),
  );

  return builder as ReturnType<typeof vi.fn> & Record<string, ReturnType<typeof vi.fn>>;
}

export function createSupabaseMock(
  tables: Record<string, TableHandlers | ReturnType<typeof createQueryBuilder>> = {},
  authUser: unknown = { id: "user-1", email: "operator@example.com", user_metadata: { operator_id: "OP-1" } },
) {
  const builders: Record<string, ReturnType<typeof createQueryBuilder>> = {};
  const from = vi.fn((table: string) => {
    const tableConfig = tables[table];
    if (tableConfig && "select" in tableConfig && typeof tableConfig.select === "function") {
      return tableConfig;
    }
    const builder = createQueryBuilder((tableConfig as TableHandlers | undefined) ?? {});
    builders[table] = builder;
    return builder;
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: authUser }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "new@example.com" } }, error: null }),
    },
    from,
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    channel: vi.fn(),
    removeChannel: vi.fn(),
    builders,
  };
}

export function jsonRequest(url: string, body: unknown, init: RequestInit = {}) {
  return new Request(url, {
    method: init.method ?? "POST",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    body: JSON.stringify(body),
  });
}

export type { TableResult };
