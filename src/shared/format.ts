import { Settings } from './types';

export type NumberSeparator = 'comma' | 'dot' | 'thin';

export function formatNumber(n: number, settings?: Pick<Settings, 'numberSeparator'>): string {
  const sep = settings?.numberSeparator || 'comma';
  const neg = n < 0;
  const abs = Math.abs(n);
  const groupChar = sep === 'dot' ? '.' : sep === 'thin' ? '\u2009' : ',';
  const raw = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, groupChar);
  return (neg ? '-' : '') + raw;
}

export function formatDate(dateIso: string, settings: Pick<Settings, 'dateFormat'>): string {
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const monthShort = d.toLocaleString(undefined, { month: 'short' });
  switch (settings.dateFormat) {
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD-MMM-YYYY':
      return `${day}-${monthShort}-${year}`;
    default:
      return d.toLocaleDateString();
  }
}

export function formatTime(dateIso: string, settings: Pick<Settings, 'timeFormat'>): string {
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return '';
  if (settings.timeFormat === '12h') {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateTime(dateIso: string, settings: Settings): string {
  const date = formatDate(dateIso, settings);
  const time = formatTime(dateIso, settings);
  return time ? `${date} ${time}` : date;
}

