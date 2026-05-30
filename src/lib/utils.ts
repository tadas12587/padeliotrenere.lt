import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { lt } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = "yyyy-MM-dd") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: lt });
}

export function formatDateLT(date: string | Date) {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy", { locale: lt });
}

export function formatTime(time: string) {
  return time.slice(0, 5);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (char) => {
      const map: Record<string, string> = {
        ą: "a",
        č: "c",
        ę: "e",
        ė: "e",
        į: "i",
        š: "s",
        ų: "u",
        ū: "u",
        ž: "z",
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function bookingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Laukiama",
    CONFIRMED: "Patvirtinta",
    CANCELLED: "Atšaukta",
    COMPLETED: "Įvykdyta",
  };
  return labels[status] || status;
}

export function formatServicePrice(
  price: string | number | null | undefined,
  type?: string | null,
  priceType?: string | null
): string {
  if (price == null || price === "" || price === 0) return "Susitarti";
  const n = typeof price === "number" ? price : parseFloat(String(price));
  if (isNaN(n)) return "Susitarti";
  if (type === "GROUP") {
    if (priceType === "PER_PERSON") return `${n} €/asm.`;
    return `${n} € (visa grupė)`;
  }
  return `${n} €`;
}

export function bookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "text-yellow-600 bg-yellow-50 border-yellow-200",
    CONFIRMED: "text-green-600 bg-green-50 border-green-200",
    CANCELLED: "text-red-600 bg-red-50 border-red-200",
    COMPLETED: "text-blue-600 bg-blue-50 border-blue-200",
  };
  return colors[status] || "text-gray-600 bg-gray-50 border-gray-200";
}
