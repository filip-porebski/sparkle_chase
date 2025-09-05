import React, { useEffect, useState } from 'react';

interface AnimatedCountProps {
  value: number;
  durationMs?: number;
  separator?: 'comma' | 'dot' | 'thin';
}

// Formats number with grouping and returns string
function groupWithSpaces(n: number, sep: 'comma'|'dot'|'thin' = 'thin') {
  const neg = n < 0;
  const m = sep === 'comma' ? ',' : sep === 'dot' ? '.' : '\u2009';
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, m);
  return (neg ? '-' : '') + s;
}

export const AnimatedCount: React.FC<AnimatedCountProps> = ({ value, durationMs = 300, separator = 'thin' }) => {
  const str = groupWithSpaces(value, separator);
  const digits = str.split('');

  return (
    <span style={{ display: 'inline-flex', gap: 0, fontVariantNumeric: 'tabular-nums', lineHeight: '1em', letterSpacing: 0, fontSize: '1.12em' }}>
      {digits.map((ch, i) => {
        if (!/\d/.test(ch)) {
          // thin space separator or sign
          const w = ch.trim() === '' ? '0.28ch' : '0.7ch';
          return <span key={i} style={{ display: 'inline-block', width: w, textAlign: 'center' }}>{ch}</span>;
        }
        const d = parseInt(ch, 10);
        return (
          <DigitWheel key={i} digit={d} durationMs={durationMs} />
        );
      })}
    </span>
  );
};

const DigitWheel: React.FC<{ digit: number; durationMs: number; }> = ({ digit, durationMs }) => {
  const [offset, setOffset] = useState(digit);

  useEffect(() => {
    // Trigger transition to the target digit
    requestAnimationFrame(() => setOffset(digit));
  }, [digit]);

  return (
    <span style={{ display: 'inline-block', width: '0.9ch', height: '1em', overflow: 'hidden', textAlign: 'center' }}>
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          transform: `translateY(${-offset}em)`,
          transition: `transform ${durationMs}ms cubic-bezier(.2,.8,.2,1)`,
        }}
      >
        {Array.from({ length: 10 }).map((_, n) => (
          <span key={n} style={{ height: '1em', lineHeight: '1em' }}>{n}</span>
        ))}
      </span>
    </span>
  );
};
