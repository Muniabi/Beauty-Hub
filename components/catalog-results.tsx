"use client";

import { useState, useTransition } from "react";

import { loadMorePublicListings } from "@/app/actions/listings";
import { ListingCardGrid } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import type { ListingCardModel } from "@/lib/listings/types";
import type { ListingType } from "@/lib/domain";

export function CatalogResults({
  type,
  q,
  initialItems,
  total,
}: {
  type: ListingType;
  q: string;
  initialItems: ListingCardModel[];
  total: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [pending, start] = useTransition();
  const hasMore = items.length < total;

  return (
    <>
      {items.length > 0 ? <ListingCardGrid items={items} /> : null}
      {hasMore ? (
        <div className="mt-6">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const next = await loadMorePublicListings({
                  type,
                  q,
                  offset: items.length,
                });
                setItems((current) => [...current, ...next.items]);
              })
            }
          >
            Показать ещё
          </Button>
        </div>
      ) : null}
    </>
  );
}
