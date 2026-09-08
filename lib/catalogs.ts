import type { LocationDoc, SpecializationDoc } from "@/lib/db/documents";
import { newId } from "@/lib/db/ids";
import {
  isDatabaseUnavailable,
  isMongoConfigured,
  locationsCollection,
  specializationsCollection,
} from "@/lib/db/mongo";

export const DISTRICT_SEED = [
  { slug: "centr", name: "Центр" },
  { slug: "voroshilovsky", name: "Ворошиловский" },
  { slug: "kirovsky", name: "Кировский" },
  { slug: "leninsky", name: "Ленинский" },
  { slug: "oktyabrsky", name: "Октябрьский" },
  { slug: "pervomaysky", name: "Первомайский" },
  { slug: "proletarsky", name: "Пролетарский" },
  { slug: "sovetsky", name: "Советский" },
  { slug: "zheleznodorozhny", name: "Железнодорожный" },
  { slug: "other", name: "Другой" },
] as const;

export const SPECIALIZATION_SEED = [
  { slug: "barber", name: "Барбер", sortOrder: 1 },
  { slug: "hair", name: "Парикмахер", sortOrder: 2 },
  { slug: "nail", name: "Маникюр / педикюр", sortOrder: 3 },
  { slug: "brow", name: "Брови", sortOrder: 4 },
  { slug: "lashes", name: "Ресницы", sortOrder: 5 },
  { slug: "makeup", name: "Визаж", sortOrder: 6 },
  { slug: "cosmetology", name: "Косметология", sortOrder: 7 },
] as const;

type CatalogCache = {
  locations: LocationDoc[];
  specializations: SpecializationDoc[];
};

let cache: CatalogCache | null = null;
let cachePromise: Promise<CatalogCache> | null = null;

export function clearCatalogCache() {
  cache = null;
  cachePromise = null;
}

async function loadCatalogs(): Promise<CatalogCache> {
  const [locations, specializations] = await Promise.all([
    (await locationsCollection()).find({ isActive: true }).toArray(),
    (await specializationsCollection())
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .toArray(),
  ]);
  return { locations, specializations };
}

export async function getCatalogs(): Promise<CatalogCache> {
  if (cache) {
    return cache;
  }
  if (!isMongoConfigured()) {
    return { locations: [], specializations: [] };
  }
  if (!cachePromise) {
    cachePromise = loadCatalogs()
      .then((value) => {
        cache = value;
        return value;
      })
      .catch((error) => {
        cachePromise = null;
        if (isDatabaseUnavailable(error)) {
          return { locations: [], specializations: [] };
        }
        throw error;
      });
  }
  return cachePromise;
}

export async function listDistricts(): Promise<{ id: string; name: string }[]> {
  const { locations } = await getCatalogs();
  return locations
    .filter((item) => item.level === "district")
    .sort((a, b) => a.name.localeCompare(b.name, "ru"))
    .map((item) => ({ id: item._id, name: item.name }));
}

export async function listSpecializations(): Promise<
  { id: string; name: string }[]
> {
  const { specializations } = await getCatalogs();
  return specializations.map((item) => ({ id: item._id, name: item.name }));
}

export async function locationName(id: string | null): Promise<string> {
  if (!id) {
    return "";
  }
  const { locations } = await getCatalogs();
  return locations.find((item) => item._id === id)?.name ?? "";
}

export async function specializationNames(ids: string[]): Promise<string[]> {
  if (ids.length === 0) {
    return [];
  }
  const { specializations } = await getCatalogs();
  const byId = new Map(specializations.map((item) => [item._id, item.name]));
  return ids.map((id) => byId.get(id)).filter((name): name is string => Boolean(name));
}

export async function seedCatalogs(): Promise<void> {
  const locations = await locationsCollection();
  const specializations = await specializationsCollection();

  async function upsertLocation(doc: Omit<LocationDoc, "_id"> & { _id?: string }) {
    const existing = await locations.findOne({
      level: doc.level,
      slug: doc.slug,
    });
    if (existing) {
      await locations.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: doc.name,
            parentId: doc.parentId,
            isActive: true,
          },
        },
      );
      return existing._id;
    }
    const id = newId();
    await locations.insertOne({
      _id: id,
      parentId: doc.parentId,
      level: doc.level,
      slug: doc.slug,
      name: doc.name,
      isActive: true,
    });
    return id;
  }

  const countryId = await upsertLocation({
    parentId: null,
    level: "country",
    slug: "ru",
    name: "Россия",
    isActive: true,
  });
  const regionId = await upsertLocation({
    parentId: countryId,
    level: "region",
    slug: "ufo",
    name: "ЮФО",
    isActive: true,
  });
  const cityId = await upsertLocation({
    parentId: regionId,
    level: "city",
    slug: "rostov-on-don",
    name: "Ростов-на-Дону",
    isActive: true,
  });

  for (const district of DISTRICT_SEED) {
    await upsertLocation({
      parentId: cityId,
      level: "district",
      slug: district.slug,
      name: district.name,
      isActive: true,
    });
  }

  for (const spec of SPECIALIZATION_SEED) {
    const existing = await specializations.findOne({ slug: spec.slug });
    if (existing) {
      await specializations.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: spec.name,
            sortOrder: spec.sortOrder,
            isActive: true,
          },
        },
      );
    } else {
      await specializations.insertOne({
        _id: newId(),
        slug: spec.slug,
        name: spec.name,
        sortOrder: spec.sortOrder,
        isActive: true,
      });
    }
  }

  clearCatalogCache();
}
