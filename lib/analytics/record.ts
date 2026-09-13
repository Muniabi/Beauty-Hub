import type { ListingType } from "@/lib/domain";
import { newId } from "@/lib/db/ids";
import { isDatabaseUnavailable, isMongoConfigured, analyticsEventsCollection } from "@/lib/db/mongo";

export async function recordAnalyticsEvent(input: {
  name: string;
  userId: string | null;
  listingId?: string | null;
  listingType?: ListingType | null;
  target?: string | null;
}): Promise<void> {
  if (!isMongoConfigured()) {
    return;
  }

  try {
    await (
      await analyticsEventsCollection()
    ).insertOne({
      _id: newId(),
      name: input.name,
      userId: input.userId,
      listingId: input.listingId ?? null,
      listingType: input.listingType ?? null,
      target: input.target ?? null,
      createdAt: new Date(),
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return;
    }
    throw error;
  }
}
