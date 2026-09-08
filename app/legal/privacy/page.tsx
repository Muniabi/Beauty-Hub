import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <Link href="/" className="text-[15px] text-primary">
        ← На главную
      </Link>
      <h1 className="mt-6 text-[20px] font-semibold">Конфиденциальность</h1>
      <p className="mt-4 text-[15px] leading-[22px] text-[var(--color-text-muted)]">
        Текст политики появится до публичной регистрации. Сейчас это заглушка для
        экрана входа.
      </p>
    </main>
  );
}
