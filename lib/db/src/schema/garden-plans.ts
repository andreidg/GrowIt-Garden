import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gardenPlansTable = pgTable("garden_plans", {
  userId:    text("user_id").primaryKey(),
  planJson:  jsonb("plan_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertGardenPlanSchema = createInsertSchema(gardenPlansTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertGardenPlan = z.infer<typeof insertGardenPlanSchema>;
export type GardenPlanRow    = typeof gardenPlansTable.$inferSelect;
