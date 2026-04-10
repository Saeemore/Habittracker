import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.all("/api/*", async (c) => {
  const url = new URL(c.req.url);
  const backendUrl = `http://127.0.0.1:4000${url.pathname}${url.search}`;

  const response = await fetch(backendUrl, {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: ["GET", "HEAD"].includes(c.req.method) ? undefined : c.req.raw.body,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
});

export default app;