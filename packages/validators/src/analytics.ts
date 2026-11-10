import { z } from "zod";
import { uuidSchema } from "./primitives";

export const ANALYTICS_EVENT_TYPES = ["profile.view", "link.click", "block.view"] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

const utmValue = z.string().trim().max(200).optional();

/** Payload accepted by the public analytics collection endpoint. */
export const analyticsEventInputSchema = z
  .object({
    type: z.enum(ANALYTICS_EVENT_TYPES),
    profileId: uuidSchema,
    linkId: uuidSchema.optional(),
    blockId: uuidSchema.optional(),
    referrer: z.string().trim().max(2048).optional(),
    utm: z
      .object({
        source: utmValue,
        medium: utmValue,
        campaign: utmValue,
        term: utmValue,
        content: utmValue,
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((event) => event.type !== "link.click" || Boolean(event.linkId), {
    message: "link.click events require linkId",
    path: ["linkId"],
  })
  .refine((event) => event.type !== "block.view" || Boolean(event.blockId), {
    message: "block.view events require blockId",
    path: ["blockId"],
  });
export type AnalyticsEventInput = z.infer<typeof analyticsEventInputSchema>;

export const analyticsRangeInputSchema = z.object({
  profileId: uuidSchema,
  from: z.iso.date(),
  to: z.iso.date(),
});
