import { MongoClient, type Collection, type Db } from "mongodb";

import type {
  ListingDoc,
  LocationDoc,
  SpecializationDoc,
  UserDoc,
} from "@/lib/db/documents";
import { ensureIndexes } from "@/lib/db/indexes";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoIndexes?: Promise<void>;
};

function mongoUri(): string | null {
  const uri = process.env.MONGODB_URI?.trim();
  return uri || null;
}

export function isMongoConfigured(): boolean {
  return Boolean(mongoUri());
}

export function isDatabaseUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const name = "name" in error ? String(error.name) : "";
  const message = "message" in error ? String(error.message) : "";
  return (
    name === "MongoServerSelectionError" ||
    name === "MongoNetworkError" ||
    name === "MongoTimeoutError" ||
    /ECONNREFUSED|Server selection timed out|connect ECONNREFUSED/i.test(
      message,
    )
  );
}

export async function getClient(): Promise<MongoClient> {
  const uri = mongoUri();
  if (!uri) {
    throw new Error("Missing environment variable MONGODB_URI");
  }

  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
      maxPoolSize: 10,
    });
  }

  const client = globalForMongo.mongoClient;
  await client.connect();
  return client;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  const db = client.db();
  if (!globalForMongo.mongoIndexes) {
    globalForMongo.mongoIndexes = ensureIndexes(db);
  }
  await globalForMongo.mongoIndexes;
  return db;
}

export async function usersCollection(): Promise<Collection<UserDoc>> {
  return (await getDb()).collection<UserDoc>("users");
}

export async function locationsCollection(): Promise<Collection<LocationDoc>> {
  return (await getDb()).collection<LocationDoc>("locations");
}

export async function specializationsCollection(): Promise<
  Collection<SpecializationDoc>
> {
  return (await getDb()).collection<SpecializationDoc>("specializations");
}

export async function listingsCollection(): Promise<Collection<ListingDoc>> {
  return (await getDb()).collection<ListingDoc>("listings");
}

export async function closeMongo(): Promise<void> {
  if (globalForMongo.mongoClient) {
    await globalForMongo.mongoClient.close();
    globalForMongo.mongoClient = undefined;
    globalForMongo.mongoIndexes = undefined;
  }
}
