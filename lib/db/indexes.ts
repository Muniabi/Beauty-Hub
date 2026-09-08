import type { Db } from "mongodb";

export async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("users").createIndexes([
      {
        key: { "telegram.telegramUserId": 1 },
        unique: true,
        sparse: true,
        name: "users_telegramUserId_unique",
      },
    ]),
    db.collection("locations").createIndexes([
      {
        key: { level: 1, slug: 1 },
        unique: true,
        name: "locations_level_slug_unique",
      },
      {
        key: { level: 1, isActive: 1, name: 1 },
        name: "locations_district_list",
      },
    ]),
    db.collection("specializations").createIndexes([
      {
        key: { slug: 1 },
        unique: true,
        name: "specializations_slug_unique",
      },
      {
        key: { isActive: 1, sortOrder: 1 },
        name: "specializations_active_sort",
      },
    ]),
    db.collection("listings").createIndexes([
      {
        key: { status: 1, type: 1, publishedAt: -1 },
        name: "listings_public_catalog",
      },
      {
        key: { authorId: 1, updatedAt: -1 },
        name: "listings_owner_updated",
      },
      {
        key: { locationId: 1, status: 1, type: 1 },
        name: "listings_district_catalog",
      },
      {
        key: { specializationIds: 1, status: 1, type: 1 },
        name: "listings_specialization_catalog",
      },
      {
        key: { "eventDetails.startsAt": 1 },
        name: "listings_event_startsAt",
        partialFilterExpression: { type: "event" },
      },
    ]),
  ]);
}
