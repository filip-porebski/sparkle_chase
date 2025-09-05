import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Hunt } from '../../shared/types';

interface QuickSwitchProps {
  hunts: Hunt[];
  onSelect: (hunt: Hunt) => void;
  onClose: () => void;
}

function fuzzyScore(query: string, target: string): number {
  // Simple subsequence-based fuzzy scoring
  if (!query) return 0;
  let qi = 0, score = 0, streak = 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      qi++;
      streak++;
      score += 5 + streak; // reward streaks
    } else {
      streak = 0;
    }
  }
  if (qi < q.length) return 0; // not all chars matched in order
  // Bonus for closer length and earlier start
  score += Math.max(0, 20 - Math.abs(t.length - q.length));
  score += Math.max(0, 10 - t.indexOf(q[0]));
  return score;
}

export const QuickSwitch: React.FC<QuickSwitchProps> = ({ hunts, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const list = useMemo(() => {
    const q = query.trim();
    if (!q) return hunts;
    const scored = hunts.map(h => ({
      hunt: h,
      score: fuzzyScore(q, `${h.name} ${h.targetSpecies} ${h.game} ${h.method}`)
    })).filter(x => x.score > 0)
      .sort((a,b) => b.score - a.score)
      .map(x => x.hunt);
    return scored;
  }, [query, hunts]);

  return (
    <div className="sc-modal-backdrop" onClick={onClose}>
      <div className="sc-modal" style={{ width: 'min(720px, 96vw)' }} onClick={(e) => e.stopPropagation()}>
        <div className="u-col" style={{ gap: 'var(--sc-space-3)' }}>
          <input
            ref={inputRef}
            className="sc-input"
            placeholder="Search hunts by name, species, game, method…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setHighlight(0); }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h+1, Math.max(0, list.length-1))); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(0, h-1)); }
              if (e.key === 'Enter' && list[highlight]) { onSelect(list[highlight]); onClose(); }
            }}
          />
          <div className="u-col" style={{ gap: 'var(--sc-space-2)', maxHeight: '420px', overflowY: 'auto' }}>
            {list.map((h, idx) => (
              <div
                key={h.id}
                className="u-card"
                style={{
                  cursor: 'pointer',
                  padding: 'var(--sc-space-3)',
                  border: 'none',
                  boxShadow: 'none',
                  background: idx === highlight ? 'var(--sc-bg-elev-2)' : 'var(--sc-bg-elev-1)',
                  transition: 'background .15s ease'
                }}
                   onClick={() => { onSelect(h); onClose(); }}
                   onMouseEnter={() => { setHighlight(idx); }}
                   onMouseOver={(e) => { e.currentTarget.style.background = 'var(--sc-bg-elev-2)'; }}
                   onMouseOut={(e) => { if (idx !== highlight) e.currentTarget.style.background = 'var(--sc-bg-elev-1)'; }}>
                <div className="u-row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div className="sc-card__title" style={{ marginBottom: '4px' }}>{h.name}</div>
                    <div className="sc-card__meta">{h.targetSpecies} • {h.game} • {h.method}</div>
                  </div>
                  <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-sm)' }}>#{h.count.toLocaleString()}</div>
                </div>
              </div>
            ))}
            {list.length === 0 && (
              <div className="u-muted" style={{ textAlign: 'center', padding: 'var(--sc-space-4)' }}>No matches</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
