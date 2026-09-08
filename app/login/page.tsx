import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginEntry } from "@/components/login-entry";
import { getSessionUser } from "@/lib/auth/current-user";
import { safeNext, withNext } from "@/lib/auth/safe-next";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const user = await getSessionUser();

  if (user?.profileCompleted) {
    redirect(next);
  }
  if (user && !user.profileCompleted) {
    redirect(withNext("/onboarding/role", next));
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[400px] flex-col justify-center px-4 py-10">
      <Link
        href={next}
        className="mb-8 text-[15px] text-[var(--color-text-muted)]"
      >
        ← Назад
      </Link>
      <LoginEntry next={next} initialError={params.error === "1"} />
    </main>
  );
}
