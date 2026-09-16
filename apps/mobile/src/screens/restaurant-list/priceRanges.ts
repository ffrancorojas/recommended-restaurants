export const PRICE_RANGES = [
  { value: '', label: 'Todos los precios' },
  { value: 'under20', label: 'Menos de 20 €' },
  { value: '20to40', label: '20–40 €' },
  { value: '40to60', label: '40–60 €' },
  { value: '60to80', label: '60–80 €' },
  { value: '80to100', label: '80–100 €' },
  { value: 'over100', label: 'Más de 100 €' },
] as const;

export type PriceRange = (typeof PRICE_RANGES)[number]['value'];

export function matchesPriceRange(price: string, range: PriceRange): boolean {
  if (!range) return true;
  // Existing estimates can be amounts (25 €) or intervals (20–30 € por persona).
  const match = price.match(/(\d+(?:[.,]\d+)?)\s*€?\s*(?:[-–—]|a)\s*(\d+(?:[.,]\d+)?)/i)
    ?? price.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return false;
  const first = Number(match[1].replace(',', '.'));
  const second = match[2] ? Number(match[2].replace(',', '.')) : first;
  const min = Math.min(first, second);
  const max = Math.max(first, second);
  // An estimate matches every band it overlaps; individual boundary amounts
  // belong to the next band, except 100 €, which belongs to 80–100 €.
  switch (range) {
    case 'under20': return min < 20;
    case '20to40': return max >= 20 && min < 40;
    case '40to60': return max >= 40 && min < 60;
    case '60to80': return max >= 60 && min < 80;
    case '80to100': return max >= 80 && min <= 100;
    case 'over100': return max > 100;
  }
}
