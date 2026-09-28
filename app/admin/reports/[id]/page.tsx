import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { ResolveReportButton } from "@/components/admin/resolve-report-button";
import { StatusBadge } from "@/components/admin/status-badge";
import { TypeBadge } from "@/components/admin/type-badge";
import { Button } from "@/components/ui/button";
import { requireAdminPage } from "@/lib/auth/admin-gate";
import { mediaSrc } from "@/lib/listings/format";
import {
  formatAbsoluteRu,
  formatRelativeRu,
} from "@/lib/moderation/format";
import { getAdminReportDetail } from "@/lib/moderation/queries";

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = await requireAdminPage(`/admin/reports/${id}`);
  const report = await getAdminReportDetail(id);
  if (!report) {
    notFound();
  }

  const suggestUnpublish =
    report.listingStatus === "published" &&
    (report.reason === "fraud" || report.reason === "prohibited");

  return (
    <AdminShell current="reports" displayName={admin.displayName}>
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-2 text-[15px] text-[var(--color-text-muted)] hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        К жалобам
      </Link>

      <div className="mx-auto mt-6 max-w-2xl space-y-4">
        <section className="rounded-[20px] border border-border bg-[var(--color-surface)] p-5">
          <p className="text-[13px] font-medium tracking-[0.1em] text-[var(--color-text-muted)] uppercase">
            Жалоба
          </p>
          <h1 className="mt-2 text-[24px] font-semibold">{report.reasonLabel}</h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            {report.reporterName} · {formatAbsoluteRu(report.createdAt)} ·{" "}
            {formatRelativeRu(report.createdAt)}
          </p>
          {report.comment ? (
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[22px]">
              {report.comment}
            </p>
          ) : (
            <p className="mt-4 text-[14px] text-[var(--color-text-muted)]">
              Без комментария
            </p>
          )}
          <p className="mt-4 text-[13px]">
            Статус:{" "}
            <span className="font-semibold">
              {report.status === "open" ? "Открыта" : "Разобрано"}
            </span>
          </p>
        </section>

        <section className="rounded-[20px] border border-border bg-[var(--color-surface)] p-5">
          <p className="text-[13px] font-medium tracking-[0.1em] text-[var(--color-text-muted)] uppercase">
            Объявление
          </p>
          <div className="mt-3 flex gap-3">
            <div className="size-[72px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-muted)]">
              {report.imageKey ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaSrc(report.imageKey)}
                  alt=""
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={report.listingType} />
                <StatusBadge status={report.listingStatus} />
              </div>
              <p className="mt-1 truncate text-[16px] font-semibold">
                {report.listingTitle}
              </p>
              <p className="text-[13px] text-[var(--color-text-muted)]">
                {report.districtName || "Район не указан"}
              </p>
            </div>
          </div>
          <Button asChild variant="secondary" className="mt-4 w-full">
            <Link href={`/admin/listings/${report.listingId}`}>
              Открыть объявление
            </Link>
          </Button>
          {suggestUnpublish ? (
            <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
              Чтобы снять с витрины —{" "}
              <Link
                href={`/admin/listings/${report.listingId}`}
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                объявление → Снять с витрины
              </Link>
              .
            </p>
          ) : null}
        </section>

        {report.status === "open" ? (
          <ResolveReportButton reportId={report.id} />
        ) : (
          <p className="rounded-[12px] bg-[var(--color-surface-muted)] px-4 py-3 text-[14px] text-[var(--color-text-muted)]">
            Жалоба уже разобрана.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
