"use client";

import { useState } from "react";

import {
  approveListingAction,
  rejectListingAction,
  unpublishListingAction,
} from "@/app/actions/moderation";
import { Button } from "@/components/ui/button";
import type { ListingStatus } from "@/lib/domain";

export function ModerationActions({
  listingId,
  status,
  rejectionReason,
  forceRejectOpen = false,
  reasonError = false,
}: {
  listingId: string;
  status: ListingStatus;
  rejectionReason: string | null;
  forceRejectOpen?: boolean;
  reasonError?: boolean;
}) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(forceRejectOpen);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [rejectConfirm, setRejectConfirm] = useState(false);

  if (status === "rejected") {
    return (
      <div className="space-y-3">
        <p className="rounded-[12px] bg-[var(--color-danger-bg)] px-3 py-3 text-[14px] text-[var(--color-danger)]">
          Уже отклонено.
          {rejectionReason ? ` Причина: ${rejectionReason}` : null}
        </p>
      </div>
    );
  }

  if (status === "archived") {
    return (
      <p className="rounded-[12px] bg-[var(--color-surface-muted)] px-3 py-3 text-[14px] text-[var(--color-text-muted)]">
        Снято с витрины.
      </p>
    );
  }

  if (status === "published") {
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-[var(--color-text-muted)]">
          Уже опубликовано. Повторное одобрение ничего не меняет.
        </p>
        {!unpublishOpen ? (
          <button
            type="button"
            className="text-[15px] font-semibold text-[var(--color-danger)] underline-offset-2 hover:underline"
            onClick={() => setUnpublishOpen(true)}
          >
            Снять с витрины
          </button>
        ) : (
          <div className="rounded-[12px] border border-border bg-[var(--color-surface)] p-4 shadow-sm">
            <p className="text-[16px] font-semibold">Снять с витрины?</p>
            <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
              Карточка исчезнет из поиска. Пост в канале не удаляем.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setUnpublishOpen(false)}
              >
                Отмена
              </Button>
              <form action={unpublishListingAction} className="flex-1">
                <input type="hidden" name="id" value={listingId} />
                <Button type="submit" variant="destructive" className="w-full">
                  Снять
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status !== "pending") {
    return null;
  }

  return (
    <div className="space-y-3">
      {!approveOpen ? (
        <Button type="button" className="w-full" onClick={() => setApproveOpen(true)}>
          Одобрить
        </Button>
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          className="rounded-[12px] border border-border bg-[var(--color-surface)] p-4 shadow-sm"
        >
          <p className="text-[18px] font-semibold">Опубликовать?</p>
          <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
            Карточка появится в поиске. В канал и в уведомления Telegram попадёт
            только после публикации, не из черновика.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setApproveOpen(false)}
            >
              Отмена
            </Button>
            <form action={approveListingAction} className="flex-1">
              <input type="hidden" name="id" value={listingId} />
              <Button type="submit" className="w-full">
                Одобрить
              </Button>
            </form>
          </div>
        </div>
      )}

      {!rejectOpen ? (
        <Button
          type="button"
          variant="outline"
          className="w-full border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
          onClick={() => setRejectOpen(true)}
        >
          Отклонить
        </Button>
      ) : (
        <div className="space-y-3 rounded-[12px] border border-border bg-[var(--color-surface)] p-4">
          <label className="block">
            <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
              Причина для автора *
            </span>
            <textarea
              name="reason-preview"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              aria-invalid={reasonError || undefined}
              placeholder="Например: фото не кабинета / цена не указана"
              className="mt-1 w-full rounded-[10px] border border-border bg-[var(--color-bg)] px-3 py-2 text-[15px] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 aria-invalid:border-[var(--color-danger)]"
            />
          </label>
          {reasonError || (rejectConfirm && !reason.trim()) ? (
            <p className="text-[13px] text-[var(--color-danger)]">
              Укажите причину для автора
            </p>
          ) : null}

          {!rejectConfirm ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setRejectOpen(false);
                  setReason("");
                }}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                disabled={!reason.trim()}
                onClick={() => setRejectConfirm(true)}
              >
                Отклонить
              </Button>
            </div>
          ) : (
            <div className="rounded-[10px] bg-[var(--color-danger-bg)] p-3">
              <p className="text-[14px] text-[var(--color-danger)]">
                Автор увидит эту причину в карточке.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setRejectConfirm(false)}
                >
                  Отмена
                </Button>
                <form action={rejectListingAction} className="flex-1">
                  <input type="hidden" name="id" value={listingId} />
                  <input type="hidden" name="reason" value={reason} />
                  <Button type="submit" variant="destructive" className="w-full">
                    Отклонить
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
