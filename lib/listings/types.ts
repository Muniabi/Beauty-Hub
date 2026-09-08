import type { UserRole } from "@/lib/domain";
import type {
  EmploymentFormat,
  ListingStatus,
  ListingType,
  PricePeriod,
  VacancyDirection,
  WorkspaceKind,
} from "@/lib/domain";

export type {
  EmploymentFormat,
  ListingStatus,
  ListingType,
  PricePeriod,
  VacancyDirection,
  WorkspaceKind,
};

export type ListingCardModel = {
  id: string;
  type: ListingType;
  title: string;
  districtName: string;
  imageKey: string | null;
  specializationNames: string[];
  extraCount: number;
  status: ListingStatus;
  accent: string;
};

export type SpaceFields = {
  type: "space";
  priceAmount: number | null;
  pricePeriod: PricePeriod | null;
  areaM2: number | null;
  workspaceKind: WorkspaceKind | null;
};

export type EventFields = {
  type: "event";
  startsAt: Date | null;
  endsAt: Date | null;
  addressText: string | null;
  capacity: number | null;
  externalUrl: string | null;
  priceAmount: number | null;
};

export type VacancyFields = {
  type: "vacancy";
  direction: VacancyDirection | null;
  employmentFormat: EmploymentFormat | null;
  employmentNote: string | null;
};

export type ListingDetails = SpaceFields | EventFields | VacancyFields;

export type ListingAuthorPublic = {
  displayName: string;
  roleLabel: string;
};

export type ListingView = {
  id: string;
  type: ListingType;
  status: ListingStatus;
  title: string;
  description: string;
  districtName: string;
  imageKeys: string[];
  specializationNames: string[];
  details: ListingDetails;
  author: ListingAuthorPublic;
  rejectionReason: string | null;
  isExpired: boolean;
  isOwner: boolean;
};

export type ListingRecord = {
  id: string;
  authorId: string;
  type: ListingType;
  status: ListingStatus;
  title: string;
  description: string;
  locationId: string | null;
  districtName: string;
  priceAmount: number | null;
  pricePeriod: PricePeriod | null;
  expiresAt: Date | null;
  publishedAt: Date | null;
  rejectionReason: string | null;
  media: { objectKey: string; sortOrder: number }[];
  specializationIds: string[];
  specializationNames: string[];
  spaceDetails: {
    areaM2: number | null;
    workspaceKind: WorkspaceKind | null;
  } | null;
  eventDetails: {
    startsAt: Date | null;
    endsAt: Date | null;
    addressText: string | null;
    capacity: number | null;
    externalUrl: string | null;
  } | null;
  vacancyDetails: {
    direction: VacancyDirection | null;
    employmentFormat: EmploymentFormat | null;
    employmentNote: string | null;
  } | null;
  author: {
    role: UserRole | null;
    displayName: string;
  };
};
