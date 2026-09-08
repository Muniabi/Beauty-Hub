import { closeMongo, getDb } from "@/lib/db/mongo";
import { seedCatalogs } from "@/lib/catalogs";

async function main() {
  await getDb();
  await seedCatalogs();
  console.log("Seeded locations and specializations in MongoDB.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongo();
  });
