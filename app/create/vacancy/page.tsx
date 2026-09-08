import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ListingCreateForm } from "@/components/listing-create-form";
import { getSessionUser } from "@/lib/auth/current-user";
import { listDistricts, listSpecializations } from "@/lib/catalogs";

export default async function CreateVacancyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/create");
  if (!user.profileCompleted) redirect("/onboarding/role?next=/create");
  const [districts, specializations] = await Promise.all([
    listDistricts(),
    listSpecializations(),
  ]);
  return (
    <AppShell current="/create">
      <h1 className="text-[20px] font-semibold">Вакансия</h1>
      <ListingCreateForm
        type="vacancy"
        districts={districts}
        specializations={specializations}
      />
    </AppShell>
  );
}
