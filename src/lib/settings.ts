import { prisma } from "./prisma";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  logoSquare: string | null;
  logoUrlDark: string | null;
  logoSquareDark: string | null;
  faviconUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  maintenanceMode: boolean;
  maintenanceMsg: string | null;
};

const DEFAULTS: SiteSettings = {
  siteName: "ManoTreniruote.lt",
  tagline: "Rask geriausią sporto trenerį Lietuvoje",
  logoUrl: null,
  logoSquare: null,
  logoUrlDark: null,
  logoSquareDark: null,
  faviconUrl: null,
  phone: "+370 600 00000",
  email: "info@padeliotrenere.lt",
  address: "Vilnius, Lietuva",
  instagramUrl: null,
  facebookUrl: null,
  youtubeUrl: null,
  heroTitle: null,
  heroSubtitle: null,
  maintenanceMode: false,
  maintenanceMsg: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await (prisma as any).globalSeoSetting.findUnique({
      where: { id: "global" },
    });
    if (!row) return DEFAULTS;
    return {
      siteName: row.siteName ?? DEFAULTS.siteName,
      tagline: row.tagline ?? DEFAULTS.tagline,
      logoUrl: row.logoUrl ?? null,
      logoSquare: row.logoSquare ?? null,
      logoUrlDark: row.logoUrlDark ?? null,
      logoSquareDark: row.logoSquareDark ?? null,
      faviconUrl: row.faviconUrl ?? null,
      phone: row.phone ?? DEFAULTS.phone,
      email: row.email ?? DEFAULTS.email,
      address: row.address ?? DEFAULTS.address,
      instagramUrl: row.instagramUrl ?? null,
      facebookUrl: row.facebookUrl ?? null,
      youtubeUrl: row.youtubeUrl ?? null,
      heroTitle: row.heroTitle ?? null,
      heroSubtitle: row.heroSubtitle ?? null,
      maintenanceMode: row.maintenanceMode ?? false,
      maintenanceMsg: row.maintenanceMsg ?? null,
    };
  } catch {
    return DEFAULTS;
  }
}
