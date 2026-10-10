/** Ad and search landing page URLs. Kept import-free so vite.config.ts can read it for the sitemap. */
export const landingSlugs = ['airport-car-rental', 'truck-rental', 'luxury-car-rental', 'weekly-car-rental'] as const
export type LandingSlug = (typeof landingSlugs)[number]
