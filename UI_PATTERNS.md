# UI Patterns & Design System

## Spalvų sistema
| Vardas | Hex | Naudojimas |
|--------|-----|------------|
| Teal (primary) | `#0B5C71` | Antraštės, mygtukų fonas, akcentai |
| Orange (action) | `#FF5733` | CTA mygtukai, aktyvios datos, klaidos indikatoriai |
| Background | `#F4F4F4` | Puslapio fonas |
| White | `#FFFFFF` | Kortelių fonas |

## CSS klasės (globalios)
```css
.card          /* balta kortelė su šešėliu ir kampų apvalinimu */
.btn-primary   /* oranžinis veiksmų mygtukas */
.btn-secondary /* antrinis mygtukas (pilkos spalvos) */
.badge         /* mažas ženklelis/etiketė */
```
Visos apibrėžtos `src/app/globals.css`.

---

## Modal / Popup komponentas

**Failas:** `src/components/booking/MultiTrainerBooking.tsx` → `Modal` komponentas

### Elgsena
| Ekranas | UI tipas | Animacija |
|---------|----------|-----------|
| Mobile (`< sm`) | Bottom sheet (iš apačios) | `translate-y-full → translate-y-0` |
| Desktop (`sm:` ir daugiau) | Centruotas popup | `opacity` fade (be vertikalaus slinkimo) |

### Kodas (kopijuoti kitoms vietoms)
```tsx
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center transition-opacity duration-300",
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Fonas */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panelė */}
      <div
        className={cn(
          "relative bg-white flex flex-col shadow-2xl max-h-[88vh]",
          "rounded-t-3xl sm:rounded-3xl sm:w-full sm:max-w-lg sm:max-h-[85vh]",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full sm:translate-y-0"
        )}
      >
        {/* Drag handle — tik mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="overflow-y-auto flex-1 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### Naudojimas
```tsx
const [open, setOpen] = useState(false);

<Modal open={open} onClose={() => setOpen(false)}>
  <div className="px-4 pt-2">
    {/* Turinys */}
  </div>
</Modal>
```

### Reikalingi importai
```tsx
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
```

---

## Laiko tarpų kortelių tinklelis

**Failas:** `src/components/booking/MultiTrainerBooking.tsx`

```tsx
// Kortelių tinklelis
<div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
  {/* Mobile: horizontali kortelė (flex row) */}
  <div className="flex items-center gap-3 px-4 py-3 sm:hidden">
    {/* laikas | avatarai + kiekis | rodyklė */}
  </div>
  {/* Desktop: vertikali kortelė */}
  <div className="hidden sm:block p-4">
    {/* laikas (didelis) | avatarai | kiekis */}
  </div>
</div>
```

---

## Trenerio avataro komponentas

```tsx
function TrainerAvatar({ slot, size = "md" }: { slot: AvailabilitySlot; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  if (slot.trainer.photoUrl) {
    return (
      <img src={slot.trainer.photoUrl} alt={slot.trainer.displayName}
        className={cn(sz, "rounded-full object-cover border-2 border-white")} />
    );
  }
  return (
    <div className={cn(sz, "rounded-full bg-[#0B5C71] flex items-center justify-center font-800 text-white border-2 border-white")}>
      {slot.trainer.displayName[0]}
    </div>
  );
}
```

Sulipę avatarai: `<div className="flex -space-x-2">` + `border-2 border-white` ant kiekvieno avataro.

---

## Sisteminiai pakeitimai (chronologiškai)

### 1. Rezervacijų sistema
- **`src/app/api/bookings/route.ts`** — Zod `.cuid()` → `.min(1)` (Prisma 7 generuoja cuid2, kurie neprasideda `c`)
- **`src/app/api/bookings/[id]/route.ts`** — PATCH atšaukia: GROUP slotui decrement, INDIVIDUAL slotui `status=AVAILABLE, bookingId=null`
- **`src/app/api/availability/route.ts`** — `?own=1` parametras: treneris/admin gauna visus statusus, `currentBookings` laukas, `take: 500`
- **`src/app/api/availability/[id]/bookings/route.ts`** — GET/DELETE: dalyvių sąrašas ir atšaukimas slotui

### 2. Prisma schema
- `Booking.availabilitySlot` — tikras FK ryšys `@relation("BookingToSlot")`
- `AvailabilitySlot.bookings Booking[]` — `@relation("BookingToSlot")`
- `AvailabilitySlot.booking Booking?` — `@relation("SlotOwnsBooking")` (individualus)
- `AvailabilitySlot.maxParticipants Int?` — grupinėms treniruotėms

### 3. Migracijos
- `prisma/migrations/20250609400000_group_slot/` — `maxParticipants` stulpelis
- `prisma/migrations/20250610000000_booking_slot_fk/` — FK indeksas ir constraint

### 4. Puslapiai
| Failas | Pakeitimas |
|--------|------------|
| `src/app/client/bookings/page.tsx` | Palaiko abu: `slot` (legacy) ir `availabilitySlot` (naujas) |
| `src/app/trainer/dashboard/page.tsx` | OR filtras, grupinės treniruotės ženklelis |
| `src/app/trainer/calendar/page.tsx` | `own=1`, spalvų kodavimas, dalyvių mygtukas, `maxParticipants` auto-fill |
| `src/app/admin/bookings/page.tsx` | `availabilitySlot` info, `formatServicePrice`, trenerio filtras |

### 5. Utils
- **`src/lib/utils.ts`** — `formatServicePrice(price, type, priceType): string`
  - `type=GROUP + priceType=PER_PERSON` → `"X €/asm."`
  - `type=GROUP` → `"X € (visa grupė)"`
  - kiti → `"X €"` arba `"Susitarti"`

### 6. `/booking` puslapis
- **`src/components/booking/MultiTrainerBooking.tsx`** — pilnas perdirbimas:
  - `TimeGroup` grupavimas pagal laiką
  - `Modal` komponentas (bottom sheet / popup)
  - `TrainerAvatar` komponentas
  - Sheet 1: trenerių pasirinkimas
  - Sheet 2: paslaugos pasirinkimas + rezervacija
  - Paslauga visada privaloma (pašalinta „Be paslaugos" opcija)
