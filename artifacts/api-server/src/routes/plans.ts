import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod/v4";
import { db, gardenPlansTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "./require-auth";

const router: IRouter = Router();

// Plan JSON is opaque from the API's perspective — the client owns the shape.
// We do minimal structural validation (it must be an object with id/profile/grid)
// to reject obviously bad payloads while letting the client evolve its schema.
const planJsonSchema = z.object({
  id:      z.string().min(1),
  profile: z.unknown(),
  grid:    z.unknown(),
}).catchall(z.unknown());

const upsertBodySchema = z.object({
  plan: planJsonSchema,
});

// GET /api/plans — fetch the current user's saved plan (or null)
router.get("/plans", requireAuth, async (req: Request, res: Response) => {
  const userId = req.sessionUser!.id;
  try {
    const row = await db.query.gardenPlansTable.findFirst({
      where: eq(gardenPlansTable.userId, userId),
    });
    if (!row) { res.json({ plan: null }); return; }
    res.json({
      plan:      row.planJson,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  } catch (err) {
    req.log.error({ err, userId }, "plans: fetch failed");
    res.status(500).json({ error: "Failed to fetch saved plan" });
  }
});

// PUT /api/plans — upsert the current user's saved plan
router.put("/plans", requireAuth, async (req: Request, res: Response) => {
  const userId = req.sessionUser!.id;
  const parsed = upsertBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid plan payload" });
    return;
  }

  try {
    const [row] = await db
      .insert(gardenPlansTable)
      .values({
        userId,
        planJson: parsed.data.plan,
      })
      .onConflictDoUpdate({
        target: gardenPlansTable.userId,
        set: {
          planJson:  parsed.data.plan,
          updatedAt: sql`now()`,
        },
      })
      .returning();
    res.json({
      plan:      row.planJson,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  } catch (err) {
    req.log.error({ err, userId }, "plans: upsert failed");
    res.status(500).json({ error: "Failed to save plan" });
  }
});

// DELETE /api/plans — remove the current user's saved plan
router.delete("/plans", requireAuth, async (req: Request, res: Response) => {
  const userId = req.sessionUser!.id;
  try {
    await db.delete(gardenPlansTable).where(eq(gardenPlansTable.userId, userId));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err, userId }, "plans: delete failed");
    res.status(500).json({ error: "Failed to delete plan" });
  }
});

export default router;
