import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "@/utils/auth";
import { db } from "@/db";
import { demo } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono()

.get(
  "/",
  zValidator(
    "query",
    z.object({
      page: z.coerce.number().optional().default(1),
      limit: z.coerce.number().optional().default(10),
    })
  ),
  async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ message: "Unauthorized" }, 401);

    // Get pagination parameters
    const { page, limit } = c.req.valid("query");
    const offset = (page - 1) * limit;
    
    const demos = await db.query.demo.findMany({
      where: eq(demo.userId, session.user.id),
      offset,
      limit,
    })

    return c.json({
      data: {
        demos,
        pagination: {
          page,
          limit,
          hasMore: false,
        },
      },
      success: true,
      message: "Data fetched successfully",
    });
  }
)

.post(
  "/",
  zValidator(
    "json",
    z.object({
      title: z.string(),
    })),
  async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ message: "Unauthorized" }, 401);

    const { title } = c.req.valid("json");

    await db.insert(demo).values({
      userId: session.user.id,
      title,
    });

    return c.json({ success: true, message: "Demo created successfully" });
  }
);

export default app;
