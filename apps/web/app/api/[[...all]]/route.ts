import { auth } from "@/utils/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { cacheMiddleware } from "@/utils/cache-middleware";
import { rateLimiter } from "hono-rate-limiter";
import { handle } from "hono/vercel";
import demo from "./demo";
import parser from "./parser";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>().basePath("/api");

app.use(logger());
app.use(
  "*",
  cors({
    origin: ["*"],
    credentials: true,
  })
);
app.use(
  rateLimiter({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    keyGenerator: (c) => {
      return c.req.header("x-forwarded-for") || "anonymous";
    },
  })
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

// app.use(
//     '*',
//     cacheMiddleware()
// )

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.get("/session", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);
  return c.json({
    session,
    user,
  });
});

app.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

const routes = app
  .route("/demo", demo)
  .route("/parser", parser)

export type AppType = typeof routes;

const handler = handle(app);

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as OPTIONS,
};
