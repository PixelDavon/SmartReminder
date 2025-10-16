// src/utils/dateHelpers.ts
export function formatDisplayDate(isoDate?: string | null) {
  if (!isoDate) return '';
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('id', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  } catch {
    return isoDate;
  }
}

export function formatDisplayDateTime(iso?: string | null) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

/** return ISO string for date + optional time (HH:MM) */
export function buildISOFromDateAndTime(dateStr: string | undefined, timeStr?: string | undefined) {
  if (!dateStr) return undefined;
  const time = timeStr && timeStr.length === 5 ? timeStr : '00:00';
  // dateStr assumed YYYY-MM-DD
  const iso = `${dateStr}T${time}:00`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}
