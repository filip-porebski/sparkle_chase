import { Settings } from '../../shared/types';

export type NumberSeparator = 'comma' | 'dot' | 'thin';

export function formatNumber(n: number, settings?: Pick<Settings,'numberSeparator'>): string {
  const sep = settings?.numberSeparator || 'comma';
  const neg = n < 0;
  const abs = Math.abs(n);
  const raw = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, getSep(sep));
  return (neg ? '-' : '') + raw;
}

function getSep(sep: NumberSeparator): string {
  switch (sep) {
    case 'dot': return '.';
    case 'thin': return '\u2009';
    case 'comma':
    default: return ',';
  }
}

