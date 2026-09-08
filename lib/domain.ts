export type UserRole = "master" | "space_owner" | "organizer";
export type UserStatus = "active" | "blocked" | "deleted";
export type LocationLevel = "country" | "region" | "city" | "district";
export type ListingType = "space" | "event" | "vacancy";
export type ListingStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "expired"
  | "archived";
export type PricePeriod = "month" | "shift" | "hour" | "event_ticket" | "other";
export type WorkspaceKind = "cabinet" | "chair" | "coworking_slot" | "other";
export type VacancyDirection = "looking_for_master" | "looking_for_job";
export type EmploymentFormat = "rent" | "hire" | "percent" | "other";
