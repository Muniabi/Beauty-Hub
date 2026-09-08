import { afterAll, describe, expect, it } from "vitest";

import { seedCatalogs } from "@/lib/catalogs";
import { createUserFromTelegram, findUserByTelegramId } from "@/lib/db/users";
import { closeMongo, isMongoConfigured } from "@/lib/db/mongo";
import { createListing, parseListingWrite, updateListing } from "@/lib/listings/commands";
import { getListingForViewer, searchPublicListings } from "@/lib/listings/queries";
import { listingsCollection, usersCollection } from "@/lib/db/mongo";

const mongo = isMongoConfigured();

describe.skipIf(!mongo)("mongo persistence", () => {
  const createdUserIds: string[] = [];
  const createdListingIds: string[] = [];

  afterAll(async () => {
    if (!mongo) {
      return;
    }
    if (createdListingIds.length) {
      await (await listingsCollection()).deleteMany({
        _id: { $in: createdListingIds },
      });
    }
    if (createdUserIds.length) {
      await (await usersCollection()).deleteMany({ _id: { $in: createdUserIds } });
    }
    await closeMongo();
  });

  it("creates a user, listing, and hides drafts from public catalog", async () => {
    await seedCatalogs();
    const telegramOwner = 8_000_000 + Math.floor(Math.random() * 1_000_000);
    const telegramStranger = telegramOwner + 1;
    const owner = await createUserFromTelegram({
      telegramUserId: telegramOwner,
      username: "e3_mongo_owner",
      lastAuthDate: 1_700_000_100,
      displayName: "Owner",
      contactTelegram: "e3_mongo_owner",
    });
    createdUserIds.push(owner._id);

    const stranger = await createUserFromTelegram({
      telegramUserId: telegramStranger,
      username: "e3_mongo_stranger",
      lastAuthDate: 1_700_000_100,
      displayName: "Stranger",
      contactTelegram: "e3_mongo_stranger",
    });
    createdUserIds.push(stranger._id);

    const found = await findUserByTelegramId(telegramOwner);
    expect(found?._id).toBe(owner._id);

    const parsed = parseListingWrite({
      type: "vacancy",
      title: "Ищу мастера на Кировский",
      description: "Нужен мастер бровей.",
      locationId: (await (await import("@/lib/catalogs")).listDistricts())[0]?.id,
      specializationIds: [
        (await (await import("@/lib/catalogs")).listSpecializations())[0]?.id,
      ],
      mediaKeys: [],
      direction: "looking_for_master",
    });
    expect(parsed.type).toBe("vacancy");

    const listing = await createListing(owner._id, {
      ...parsed,
      saveDraft: false,
    });
    createdListingIds.push(listing.id);
    expect(listing.status).toBe("pending");

    const publicList = await searchPublicListings({ type: "vacancy" });
    expect(publicList.items.some((item) => item.id === listing.id)).toBe(false);

    const ownerView = await getListingForViewer(listing.id, owner._id);
    expect(ownerView.kind).toBe("ok");

    const guestView = await getListingForViewer(listing.id, null);
    expect(guestView.kind).toBe("missing");

    await expect(
      updateListing(listing.id, stranger._id, {
        type: "vacancy",
        title: "Hacked",
        description: listing.description,
        locationId: listing.locationId,
        specializationIds: listing.specializationIds,
        mediaKeys: [],
        direction: "looking_for_master",
      }),
    ).rejects.toThrow("FORBIDDEN");
  });
});
