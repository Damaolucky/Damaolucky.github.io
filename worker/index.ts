/** Cloudflare Worker entry point for the homepage. */
import handler from "vinext/server/app-router-entry";

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: Fetcher;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    let response = await handler.fetch(request, env, ctx);
    const applyHeaders = (headers: Headers) => {
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    };
    try {
      // Preserve Vinext's response identity: its Node adapter attaches a static
      // file signal that is lost if every response is reconstructed.
      applyHeaders(response.headers);
    } catch {
      // Redirect responses may carry immutable headers.
      response = new Response(response.body, response);
      applyHeaders(response.headers);
    }
    return response;
  },
};

export default worker;
