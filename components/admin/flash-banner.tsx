const TOASTS: Record<string, string> = {
  published: "Опубликовано",
  already_published: "Уже опубликовано",
  rejected: "Отклонено",
  unpublished: "Снято с витрины",
  resolved: "Жалоба закрыта",
};

const ERRORS: Record<string, string> = {
  not_found: "Не найдено",
  conflict: "Действие недоступно для текущего статуса",
  reason_required: "Укажите причину для автора",
  forbidden: "Нет доступа",
};

export function FlashBanner({
  toast,
  error,
}: {
  toast?: string;
  error?: string;
}) {
  if (toast && TOASTS[toast]) {
    return (
      <div className="mb-4 rounded-[12px] border border-border bg-[var(--color-surface)] px-4 py-3 text-[15px]">
        {TOASTS[toast]}
      </div>
    );
  }
  if (error && ERRORS[error]) {
    return (
      <div className="mb-4 rounded-[12px] bg-[var(--color-danger-bg)] px-4 py-3 text-[15px] text-[var(--color-danger)]">
        {ERRORS[error]}
      </div>
    );
  }
  return null;
}
