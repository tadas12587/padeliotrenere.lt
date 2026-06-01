# Naujo puslapio kūrimo taisyklės

## 1. SEO — generateMetadata

Kiekvienas viešas puslapis **privalo** turėti `generateMetadata`.

```tsx
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  // ... fetch data ...

  const title = `${name} – Aprašymas`;
  const description = `...`; // 55–200 simbolių — visada!

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website" as const, // arba "profile" trenerio puslapiui
      // ❌ NIEKADA nerašyk openGraph.images čia — tai sugadina og:image
      // ✅ og:image generuoja opengraph-image.tsx failas automatiškai
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description, // visada pridėti
    },
  };
}
```

**Taisyklės:**
- `description` — **55–200 simbolių** (ne per trumpas, ne per ilgas)
- `openGraph.images` **nerašyti** — Next.js automatiškai paima iš `opengraph-image.tsx`
- `twitter.description` — visada pridėti

---

## 2. OG nuotrauka — opengraph-image.tsx

Kiekvienam viešam dinamiškam puslapiui (`/trainers/[id]`, `/arenas/[id]`, `/blog/[slug]`) **reikia** savo `opengraph-image.tsx`.

```tsx
// src/app/(public)/[puslapis]/[id]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 }; // privalomos dimensijos
export const contentType = "image/png";
export const dynamic = "force-dynamic"; // ← BŪTINA (ne force-static)

function toHttps(url: string | null | undefined): string | null {
  if (!url) return null;
  const secure = url.replace(/^http:\/\//i, "https://");
  return secure.startsWith("https://") ? secure : null;
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  // fetch data, render, return ImageResponse({ width: 1200, height: 630 })
}
```

**Taisyklės:**
- Dydis visada `1200×630` (1.91:1 — reikalauja Facebook/WhatsApp/Viber)
- Nuotraukų URL visada per `toHttps()` — socialiniai tinklai atmeta HTTP
- `export const dynamic = "force-dynamic"` — kitaip Next.js bandys pre-renderinti build metu ir neturės DB

---

## 3. JSON-LD struktūriniai duomenys

Kiekvienas viešas puslapis su konkrečiu objektu turi `<script type="application/ld+json">`.

| Puslapio tipas | Schema tipas |
|---------------|-------------|
| Treneris | `Person` |
| Arena | `SportsActivityLocation` |
| Blog straipsnis | `BlogPosting` |
| Pagrindinis | `Organization` (jau yra layout) |

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: trainer.displayName,
      // ...
    }),
  }}
/>
```

---

## 4. export const dynamic

| Situacija | Reikšmė |
|-----------|---------|
| Puslapis skaito DB (visi viešieji) | `"force-dynamic"` |
| Sitemap, robots | `"force-dynamic"` |
| OG image failai | `"force-dynamic"` |
| Visiškai statinis (pvz. `/about`) | nieko nerašyti |

---

## 5. Autentikacija ir rolės

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const session = await getServerSession(authOptions);
if (!session) redirect("/auth/signin");
if (session.user.role !== "TRAINER") redirect("/");
```

Rolių hierarchija: `USER` → `TRAINER` → `ADMIN`

Trenerio puslapiai (`/trainer/*`) — reikia `TRAINER` rolės + `trainerStatus === "APPROVED"`.

---

## 6. Dizainas — privalomi elementai

Naudoti CSS klases iš `src/app/globals.css`:

```tsx
.card         // balta kortelė su šešėliu
.btn-primary  // oranžinis mygtukas (#FF5733)
.btn-secondary // pilkas mygtukas
.container-tight // centruotas turinys su padding
```

Spalvos:
- Teal: `#0B5C71` — antraštės, fonas
- Orange: `#FF5733` — CTA, akcentai
- BG: `#F4F4F4` — puslapio fonas
- White: `#FFFFFF` — kortelės

**Šablono struktūra viešam puslapiui:**
```tsx
<div className="min-h-screen bg-[#F4F4F4]">
  {/* JSON-LD */}
  <section className="bg-[#0B5C71] text-white py-12">
    <div className="container-tight">
      {/* Hero / Header */}
    </div>
  </section>
  <div className="container-tight py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 flex flex-col gap-8">
      {/* Pagrindinis turinys */}
    </div>
    <div className="flex flex-col gap-6">
      {/* Šoninis skydelis */}
    </div>
  </div>
</div>
```

---

## 7. Filtrai

Naudoti `FilterBar` komponentą iš `src/components/FilterBar.tsx` — ne custom mygtukus.

```tsx
import FilterBar from "@/components/FilterBar";

<FilterBar
  filters={[
    {
      label: "Miestas",
      value: city,
      options: cities.map((c) => ({ label: c, value: c })),
      onChange: setCity,
    },
  ]}
/>
```

---

## 8. Modalai / Popup

Naudoti `Modal` komponentą iš `UI_PATTERNS.md` — bottom sheet mobile, centruotas popup desktop.

---

## 9. Prisma užklausos

```typescript
// Prisma klientas
import { prisma } from "@/lib/prisma";

// Viešiems puslapiams — visada filtruoti pagal statusą
const trainers = await prisma.trainerProfile.findMany({
  where: { status: "APPROVED" },
});

// Generuoti metadata — naudoti select (ne include), tik reikiami laukai
const trainer = await prisma.trainerProfile.findUnique({
  where: { id },
  select: { displayName: true, city: true, bio: true },
});
```

---

## 10. Checklistas prieš push

- [ ] `generateMetadata` su title + description (55–200 simbolių)
- [ ] `openGraph` be `images` (jei yra `opengraph-image.tsx`)
- [ ] `twitter.description` pridėtas
- [ ] JSON-LD struktūriniai duomenys (dinaminiai puslapiai)
- [ ] `export const dynamic = "force-dynamic"` (jei DB užklausa)
- [ ] `opengraph-image.tsx` sukurtas (jei dinamiškas puslapis)
- [ ] `toHttps()` ant visų nuotraukų URL OG image faile
- [ ] Dizainas atitinka spalvų sistemą ir `.card` / `.btn-primary` klases
- [ ] Mobilusis vaizdas patikrintas
