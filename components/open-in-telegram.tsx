import { Button } from "@/components/ui/button";
import { telegramMiniAppHref } from "@/lib/telegram/links";

export function OpenInTelegram({
  next,
  startParam,
  title = "Откройте Beauty Hub в Telegram",
  description = "В боте вход происходит автоматически. Каталог, объявления и профиль доступны внутри Mini App.",
  error,
}: {
  next?: string;
  startParam?: string;
  title?: string;
  description?: string;
  error?: string;
}) {
  const href = telegramMiniAppHref(next, startParam);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[20px] leading-[26px] font-semibold tracking-[-0.01em]">
        {title}
      </h1>
      <p className="text-[15px] leading-[22px] text-[var(--color-text-muted)]">
        {description}
      </p>
      {error ? (
        <p className="text-[15px] leading-[22px] text-[var(--color-danger)]">{error}</p>
      ) : null}
      {href ? (
        <Button asChild>
          <a href={href} rel="noopener noreferrer">
            Открыть в Telegram
          </a>
        </Button>
      ) : (
        <p className="text-[15px] leading-[22px] text-[var(--color-danger)]">
          Ссылка на бота пока не настроена.
        </p>
      )}
    </div>
  );
}
