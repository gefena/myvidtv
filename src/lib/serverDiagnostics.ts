type DiagnosticRuntime = "vercel" | "local";

type DiagnosticContext = {
  requestId: string;
  route: string;
  startedAt: number;
  debug: boolean;
};

type DiagnosticDetail = {
  target?: string;
  upstreamUrl?: string;
  upstreamStatus?: number;
  upstreamStatusText?: string;
  upstreamHeaders?: Record<string, string>;
  bodySnippet?: string;
  errorName?: string;
  errorMessage?: string;
};

type DiagnosticErrorResponse = {
  error: string;
  code: string;
  requestId: string;
  upstreamStatus?: number;
  debug?: Record<string, unknown>;
};

const SAFE_HEADER_NAMES = ["content-type", "cache-control", "retry-after", "server", "date", "age"];
const MAX_SNIPPET_LENGTH = 500;

export function createDiagnosticContext(route: string, debugParam: string | null): DiagnosticContext {
  return {
    requestId: createRequestId(),
    route,
    startedAt: Date.now(),
    debug: debugParam === "1" && isLocalRuntime(),
  };
}

export function getSafeHeaders(headers: Headers): Record<string, string> {
  return SAFE_HEADER_NAMES.reduce<Record<string, string>>((result, name) => {
    const value = headers.get(name);
    if (value) result[name] = value;
    return result;
  }, {});
}

export function createBodySnippet(body: string): string {
  return body
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SNIPPET_LENGTH);
}

export function errorDetail(error: unknown): Pick<DiagnosticDetail, "errorName" | "errorMessage"> {
  if (error instanceof Error) {
    return { errorName: error.name, errorMessage: error.message };
  }
  return { errorName: "UnknownError", errorMessage: String(error) };
}

export function logDiagnosticFailure(ctx: DiagnosticContext, reason: string, detail: DiagnosticDetail): void {
  console.error(
    JSON.stringify({
      event: "channel_fetch_diagnostic",
      level: "error",
      reason,
      requestId: ctx.requestId,
      route: ctx.route,
      runtime: getRuntime(),
      vercelRegion: process.env.VERCEL_REGION,
      elapsedMs: elapsedMs(ctx),
      ...detail,
    })
  );
}

export function diagnosticJson(
  ctx: DiagnosticContext,
  code: string,
  error: string,
  status: number,
  detail: DiagnosticDetail = {}
): Response {
  const body: DiagnosticErrorResponse = {
    error,
    code,
    requestId: ctx.requestId,
  };

  if (typeof detail.upstreamStatus === "number") {
    body.upstreamStatus = detail.upstreamStatus;
  }

  if (ctx.debug) {
    body.debug = {
      route: ctx.route,
      runtime: getRuntime(),
      vercelRegion: process.env.VERCEL_REGION,
      elapsedMs: elapsedMs(ctx),
      target: detail.target,
      upstreamUrl: detail.upstreamUrl,
      upstreamStatus: detail.upstreamStatus,
      upstreamStatusText: detail.upstreamStatusText,
      upstreamHeaders: detail.upstreamHeaders,
      bodySnippet: detail.bodySnippet,
      errorName: detail.errorName,
      errorMessage: detail.errorMessage,
    };
  }

  return Response.json(body, { status, headers: { "x-request-id": ctx.requestId } });
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function elapsedMs(ctx: DiagnosticContext): number {
  return Date.now() - ctx.startedAt;
}

function isLocalRuntime(): boolean {
  return !process.env.VERCEL && process.env.NODE_ENV !== "production";
}

function getRuntime(): DiagnosticRuntime {
  return process.env.VERCEL ? "vercel" : "local";
}
