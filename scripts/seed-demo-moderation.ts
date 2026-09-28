import { closeMongo, getDb, listingsCollection, reportsCollection, usersCollection } from "@/lib/db/mongo";
import { newId } from "@/lib/db/ids";
import { seedCatalogs, getCatalogs } from "@/lib/catalogs";

async function main() {
  await getDb();
  await seedCatalogs();
  const catalogs = await getCatalogs();
  const district =
    catalogs.locations.find((row) => row.slug === "voroshilovsky") ??
    catalogs.locations.find((row) => row.level === "district");
  const nail =
    catalogs.specializations.find((row) => row.slug === "nail") ??
    catalogs.specializations[0];

  if (!district || !nail) {
    throw new Error("Catalogs are empty");
  }
  const districtId = district._id;
  const nailId = nail._id;

  const users = await usersCollection();
  const listings = await listingsCollection();
  const reports = await reportsCollection();
  const now = new Date();

  async function upsertUser(input: {
    telegramUserId: number;
    username: string;
    displayName: string;
    role: "master" | "space_owner" | "organizer";
    isAdmin: boolean;
    phone?: string | null;
  }) {
    const existing = await users.findOne({
      "telegram.telegramUserId": input.telegramUserId,
    });
    if (existing) {
      await users.updateOne(
        { _id: existing._id },
        {
          $set: {
            isAdmin: input.isAdmin,
            role: input.role,
            onboardingCompleted: true,
            status: "active",
            "profile.displayName": input.displayName,
            "profile.contactTelegram": `@${input.username}`,
            "profile.contactPhone": input.phone ?? null,
            "telegram.username": input.username,
          },
        },
      );
      return existing._id;
    }
    const id = newId();
    await users.insertOne({
      _id: id,
      role: input.role,
      isAdmin: input.isAdmin,
      onboardingCompleted: true,
      status: "active",
      createdAt: now,
      lastLoginAt: now,
      profile: {
        displayName: input.displayName,
        bio: null,
        districtLocationId: districtId,
        avatarObjectKey: null,
        contactTelegram: `@${input.username}`,
        contactPhone: input.phone ?? null,
        instagram: null,
        specializationId: input.role === "master" ? nailId : null,
      },
      telegram: {
        telegramUserId: input.telegramUserId,
        username: input.username,
        connectedAt: now,
        botBlocked: false,
        lastAuthDate: Math.floor(Date.now() / 1000),
      },
      notificationPreference: {
        notifySpace: false,
        notifyEvent: false,
        notifyVacancy: false,
        updatedAt: now,
      },
    });
    return id;
  }

  const adminId = await upsertUser({
    telegramUserId: 900001,
    username: "dev_admin",
    displayName: "Модератор Dev",
    role: "space_owner",
    isAdmin: true,
  });
  const authorId = await upsertUser({
    telegramUserId: 900010,
    username: "anna_cabinet",
    displayName: "Анна К.",
    role: "space_owner",
    isAdmin: false,
    phone: "+79005554433",
  });
  const reporterId = await upsertUser({
    telegramUserId: 900011,
    username: "reporter_dev",
    displayName: "Ольга М.",
    role: "master",
    isAdmin: false,
  });

  await listings.deleteMany({
    title: {
      $in: [
        "Кабинет 14 м² у Садовой",
        "МК по бровям — суббота",
        "Ищем мастера маникюра",
      ],
    },
  });
  await reports.deleteMany({ reporterId });

  const pendingSpaceId = newId();
  const pendingEventId = newId();
  const publishedVacancyId = newId();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

  await listings.insertMany([
    {
      _id: pendingSpaceId,
      authorId,
      type: "space",
      status: "pending",
      title: "Кабинет 14 м² у Садовой",
      description: "Светлый кабинет для ногтей и бровей. Отдельный вход.",
      locationId: districtId,
      priceAmount: 18000,
      pricePeriod: "month",
      expiresAt: null,
      publishedAt: null,
      rejectionReason: null,
      createdAt: fourHoursAgo,
      updatedAt: fourHoursAgo,
      spaceDetails: { areaM2: 14, workspaceKind: "cabinet" },
      eventDetails: null,
      vacancyDetails: null,
      media: [],
      specializationIds: [nailId],
    },
    {
      _id: pendingEventId,
      authorId,
      type: "event",
      status: "pending",
      title: "МК по бровям — суббота",
      description: "Практика на моделях, материалы включены.",
      locationId: districtId,
      priceAmount: 3500,
      pricePeriod: "event_ticket",
      expiresAt: null,
      publishedAt: null,
      rejectionReason: null,
      createdAt: twoHoursAgo,
      updatedAt: twoHoursAgo,
      spaceDetails: null,
      eventDetails: {
        startsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endsAt: null,
        addressText: "пр. Соколова, 42",
        capacity: 12,
        externalUrl: null,
      },
      vacancyDetails: null,
      media: [],
      specializationIds: [nailId],
    },
    {
      _id: publishedVacancyId,
      authorId,
      type: "vacancy",
      status: "published",
      title: "Ищем мастера маникюра",
      description: "Частичная занятость, свой инструмент приветствуется.",
      locationId: districtId,
      priceAmount: null,
      pricePeriod: null,
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      publishedAt: twoHoursAgo,
      rejectionReason: null,
      createdAt: fourHoursAgo,
      updatedAt: twoHoursAgo,
      spaceDetails: null,
      eventDetails: null,
      vacancyDetails: {
        direction: "looking_for_master",
        employmentFormat: "percent",
        employmentNote: "40%",
      },
      media: [],
      specializationIds: [nailId],
    },
  ]);

  await reports.insertOne({
    _id: newId(),
    reporterId,
    listingId: publishedVacancyId,
    reason: "wrong_info",
    comment: "В описании другой район, чем в карточке.",
    status: "open",
    createdAt: new Date(now.getTime() - 60 * 60 * 1000),
    resolvedAt: null,
  });

  console.log("Demo moderation data ready.");
  console.log(`Admin user id: ${adminId}`);
  console.log("Open http://localhost:3000/dev/login?next=/admin/listings");
  console.log(`Pending space: /admin/listings/${pendingSpaceId}`);
  console.log(`Pending event: /admin/listings/${pendingEventId}`);
  console.log(`Published vacancy with report: /admin/listings/${publishedVacancyId}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongo();
  });
