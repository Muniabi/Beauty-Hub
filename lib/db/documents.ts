import type {
  EmploymentFormat,
  ListingStatus,
  ListingType,
  LocationLevel,
  PricePeriod,
  UserRole,
  UserStatus,
  VacancyDirection,
  WorkspaceKind,
} from "@/lib/domain";

export type ProfileDoc = {
  displayName: string;
  bio: string | null;
  districtLocationId: string | null;
  avatarObjectKey: string | null;
  contactTelegram: string;
  contactPhone: string | null;
  instagram: string | null;
  specializationId: string | null;
};

export type TelegramDoc = {
  telegramUserId: number;
  username: string | null;
  connectedAt: Date;
  botBlocked: boolean;
  lastAuthDate: number;
};

export type NotificationPreferenceDoc = {
  notifySpace: boolean;
  notifyEvent: boolean;
  notifyVacancy: boolean;
  updatedAt: Date;
};

export type UserDoc = {
  _id: string;
  role: UserRole | null;
  isAdmin: boolean;
  onboardingCompleted: boolean;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
  profile: ProfileDoc;
  telegram: TelegramDoc | null;
  notificationPreference: NotificationPreferenceDoc;
};

export type LocationDoc = {
  _id: string;
  parentId: string | null;
  level: LocationLevel;
  slug: string;
  name: string;
  isActive: boolean;
};

export type SpecializationDoc = {
  _id: string;
  slug: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type ListingMediaDoc = {
  objectKey: string;
  sortOrder: number;
  createdAt: Date;
};

export type SpaceDetailsDoc = {
  areaM2: number | null;
  workspaceKind: WorkspaceKind | null;
};

export type EventDetailsDoc = {
  startsAt: Date;
  endsAt: Date | null;
  addressText: string | null;
  capacity: number | null;
  externalUrl: string | null;
};

export type VacancyDetailsDoc = {
  direction: VacancyDirection;
  employmentFormat: EmploymentFormat | null;
  employmentNote: string | null;
};

export type ListingDoc = {
  _id: string;
  authorId: string;
  type: ListingType;
  status: ListingStatus;
  title: string;
  description: string;
  locationId: string | null;
  priceAmount: number | null;
  pricePeriod: PricePeriod | null;
  expiresAt: Date | null;
  publishedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  spaceDetails: SpaceDetailsDoc | null;
  eventDetails: EventDetailsDoc | null;
  vacancyDetails: VacancyDetailsDoc | null;
  media: ListingMediaDoc[];
  specializationIds: string[];
};
