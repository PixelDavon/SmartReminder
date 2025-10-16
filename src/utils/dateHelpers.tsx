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

/** Return ISO-like string for date + optional time (HH:MM), stays in local time */
export function buildISOFromDateAndTime(dateStr?: string, timeStr?: string) {
  if (!dateStr) return undefined;

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = (timeStr ? timeStr.split(':') : ['00', '00']).map(Number);

  // Build date explicitly in local time
  const d = new Date(year, month - 1, day, hours, minutes, 0);
  if (isNaN(d.getTime())) return undefined;

  // Return local ISO-like format (no UTC shift)
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${dateStr}T${hh}:${mm}:00`;
}

/** Extract date (YYYY-MM-DD) from ISO-like string */
export function extractDate(iso?: string) {
  if (!iso) return '';
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

/** Extract time (HH:MM) from ISO-like string */
export function extractTime(iso?: string) {
  if (!iso) return '';
  const match = iso.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : '';
}