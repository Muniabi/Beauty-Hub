import { z } from "zod";

const uuid = z.string().uuid();

export const listingTypeSchema = z.enum(["space", "event", "vacancy"]);
export const pricePeriodSchema = z.enum(["month", "shift", "hour"]);
export const workspaceKindSchema = z.enum([
  "cabinet",
  "chair",
  "coworking_slot",
  "other",
]);
export const vacancyDirectionSchema = z.enum([
  "looking_for_master",
  "looking_for_job",
]);
export const employmentFormatSchema = z.enum(["rent", "hire", "percent", "other"]);

const mediaSchema = z.array(z.string().min(1).max(200)).max(6);

export const listingWriteBaseSchema = z.object({
  title: z.string().max(80),
  description: z.string().max(4000),
  locationId: z.string().uuid().optional().nullable(),
  specializationIds: z.array(uuid).max(7).default([]),
  mediaKeys: mediaSchema.default([]),
  saveDraft: z.boolean().default(false),
});

export const spaceWriteSchema = listingWriteBaseSchema.extend({
  type: z.literal("space"),
  priceAmount: z.coerce.number().positive().optional().nullable(),
  pricePeriod: pricePeriodSchema.optional().nullable(),
  areaM2: z.coerce.number().positive().optional().nullable(),
  workspaceKind: workspaceKindSchema.optional().nullable(),
});

export const eventWriteSchema = listingWriteBaseSchema.extend({
  type: z.literal("event"),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
  addressText: z.string().max(200).optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  externalUrl: z.string().max(500).optional().nullable(),
  priceAmount: z.coerce.number().nonnegative().optional().nullable(),
  isFree: z.boolean().default(false),
});

export const vacancyWriteSchema = listingWriteBaseSchema.extend({
  type: z.literal("vacancy"),
  direction: vacancyDirectionSchema.optional().nullable(),
  employmentFormat: employmentFormatSchema.optional().nullable(),
  employmentNote: z.string().max(200).optional().nullable(),
});

export const listingWriteSchema = z.discriminatedUnion("type", [
  spaceWriteSchema,
  eventWriteSchema,
  vacancyWriteSchema,
]);

export type ListingWriteInput = z.infer<typeof listingWriteSchema>;

export function isValidForPending(input: ListingWriteInput): boolean {
  if (!input.title.trim() || !input.description.trim() || !input.locationId) {
    return false;
  }
  if (input.specializationIds.length < 1) {
    return false;
  }

  if (input.type === "space") {
    return Boolean(
      input.mediaKeys.length >= 1 &&
        input.priceAmount &&
        input.pricePeriod,
    );
  }

  if (input.type === "event") {
    return Boolean(input.startsAt);
  }

  return Boolean(input.direction);
}
