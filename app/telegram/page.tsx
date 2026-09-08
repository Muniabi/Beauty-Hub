import { TelegramWebAppAuth } from "@/components/telegram-webapp-auth";
import { safeNext } from "@/lib/auth/safe-next";

export default async function TelegramMiniAppPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; tgWebAppStartParam?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const startParam = params.tgWebAppStartParam?.trim() || undefined;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-[400px] flex-col justify-center px-4 py-10">
      <TelegramWebAppAuth next={next} startParam={startParam} />
    </main>
  );
}
