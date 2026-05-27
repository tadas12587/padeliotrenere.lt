import { BookingStatus, Role } from "@/generated/prisma/client";

export type { BookingStatus, Role };

export interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

export interface SlotWithBookings {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxClients: number;
  notes?: string | null;
  bookings: BookingWithUser[];
}

export interface BookingWithUser {
  id: string;
  userId: string;
  slotId: string;
  status: BookingStatus;
  clientNotes?: string | null;
  createdAt: Date;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  slot: {
    date: Date;
    startTime: string;
    endTime: string;
  };
  sessionNote?: {
    trainerNote?: string | null;
    clientNote?: string | null;
  } | null;
}

export interface BookingWithSlot {
  id: string;
  userId: string;
  slotId: string;
  status: BookingStatus;
  clientNotes?: string | null;
  createdAt: Date;
  slot: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
  };
  sessionNote?: {
    trainerNote?: string | null;
    clientNote?: string | null;
  } | null;
}

export interface ArticlePreview {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
  createdAt: Date;
}
