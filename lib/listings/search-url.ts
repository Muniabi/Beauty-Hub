import type { ListingType } from "@/lib/domain";

export function searchHref(input: {
  type: ListingType;
  q?: string;
  districtId?: string;
  specializationId?: string;
}): string {
  const params = new URLSearchParams();
  params.set("type", input.type);
  const query = input.q?.trim();
  if (query) {
    params.set("q", query);
  }
  if (input.districtId) {
    params.set("districtId", input.districtId);
  }
  if (input.specializationId) {
    params.set("specializationId", input.specializationId);
  }
  return `/search?${params.toString()}`;
}
