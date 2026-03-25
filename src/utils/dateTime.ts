/**
 * Shared datetime formatting utilities.
 * All display helpers explicitly use Asia/Bangkok timezone so the output
 * is consistent regardless of the browser's local timezone setting.
 * Storage format remains UTC (ISO 8601) — only display is affected here.
 */

const TZ = 'Asia/Bangkok';

/** "20 ก.พ. 2569" */
export function fmtDate(dt: string | Date | null | undefined): string {
  if (!dt) return '-';
  return new Date(dt).toLocaleDateString('th-TH', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "16:30 น." */
export function fmtTime(dt: string | Date | null | undefined): string {
  if (!dt) return '-';
  return (
    new Date(dt).toLocaleTimeString('th-TH', {
      timeZone: TZ,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' น.'
  );
}

/** "20 ก.พ. 2569 16:30 น." */
export function fmtDateTime(dt: string | Date | null | undefined): string {
  if (!dt) return '-';
  const d = new Date(dt);
  const date = d.toLocaleDateString('th-TH', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('th-TH', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${date} ${time} น.`;
}

/**
 * Extract the YYYY-MM-DD portion of a UTC datetime string
 * interpreted in Asia/Bangkok timezone.
 * Used for populating <input type="date"> fields in edit forms.
 */
export function toDateInput(dt: string | Date | null | undefined): string {
  if (!dt) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(dt));
}

/**
 * Extract the HH:mm portion of a UTC datetime string
 * interpreted in Asia/Bangkok timezone.
 * Used for populating time input fields in edit forms.
 */
export function toTimeInput(dt: string | Date | null | undefined): string {
  if (!dt) return '';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dt));
}
