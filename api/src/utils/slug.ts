/**
 * Generates a URL-friendly slug from vehicle make, model, year.
 * e.g. "2024-lamborghini-urus-s"
 */
export function generateVehicleSlug(make: string, model: string, year: number): string {
  const base = `${year}-${make}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return base
}

/** Append numeric suffix to make a slug unique */
export function makeSlugUnique(base: string, attempt: number): string {
  return attempt === 0 ? base : `${base}-${attempt}`
}
