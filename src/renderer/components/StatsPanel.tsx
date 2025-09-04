import React, { useMemo } from 'react';
import { Hunt } from '../../shared/types';

interface StatsPanelProps {
  hunt: Hunt;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ hunt }) => {
  // Effective probability per encounter
  const effectiveProb = useMemo(() => {
    let p = hunt.baseOdds.numerator / hunt.baseOdds.denominator;
    if (hunt.modifiers.shinyCharm) p *= 3;
    if (hunt.modifiers.masuda) p *= 6;
    // Clamp to sensible range
    p = Math.max(1e-9, Math.min(p, 0.5));
    return p;
  }, [hunt.baseOdds, hunt.modifiers]);

  const oddsText = useMemo(() => `1 in ${Math.round(1 / effectiveProb).toLocaleString()}`, [effectiveProb]);

  // Probabilities and quantiles
  const probAtLeastOne = useMemo(() => 1 - Math.pow(1 - effectiveProb, hunt.count), [effectiveProb, hunt.count]);
  const unluckyPercentile = useMemo(() => (1 - probAtLeastOne) * 100, [probAtLeastOne]);
  const qN = (q: number) => Math.ceil(Math.log(1 - q) / Math.log(1 - effectiveProb));
  const q50 = useMemo(() => qN(0.5), [effectiveProb]);
  const q90 = useMemo(() => qN(0.9), [effectiveProb]);
  const q99 = useMemo(() => qN(0.99), [effectiveProb]);

  // Monte Carlo: distribution of encounters to first shiny
  const sim = useMemo(() => {
    const trials = 2000;
    const expected = 1 / effectiveProb;
    const maxBin = Math.round(3 * expected); // up to 3x odds
    const binSize = Math.max(1, Math.round(expected / 10));
    const bins: { start: number; end: number; count: number }[] = [];
    for (let s = 1; s <= maxBin; s += binSize) {
      bins.push({ start: s, end: Math.min(s + binSize - 1, maxBin), count: 0 });
    }
    let over = 0;
    let sum = 0;
    const invLog = Math.log(1 - effectiveProb);
    for (let i = 0; i < trials; i++) {
      const u = Math.random();
      const k = Math.max(1, Math.ceil(Math.log(1 - u) / invLog)); // geometric via inverse CDF
      sum += k;
      const bIndex = bins.findIndex(b => k >= b.start && k <= b.end);
      if (bIndex >= 0) bins[bIndex].count++;
      else over++;
    }
    const mean = sum / trials;
    return { bins, over, trials, mean };
  }, [effectiveProb]);

  return (
    <div className="u-col" style={{ gap: 'var(--sc-space-4)' }}>
      {/* Odds Summary */}
      <div className="u-col" style={{ gap: 'var(--sc-space-2)' }}>
        <div className="u-row" style={{ justifyContent: 'space-between' }}>
          <span className="u-subtle" style={{ fontSize: 'var(--sc-fs-sm)' }}>Effective odds</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--sc-accent)' }}>{oddsText}</span>
        </div>
        <div className="u-row" style={{ justifyContent: 'space-between' }}>
          <span className="u-subtle" style={{ fontSize: 'var(--sc-fs-sm)' }}>Chance seen ≥1 shiny so far</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{(probAtLeastOne * 100).toFixed(2)}%</span>
        </div>
        <div className="u-row" style={{ justifyContent: 'space-between' }}>
          <span className="u-subtle" style={{ fontSize: 'var(--sc-fs-sm)' }}>Unlucky percentile at current count</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: unluckyPercentile > 50 ? 'var(--sc-warning)' : 'var(--sc-success)' }}>
            {unluckyPercentile.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Milestones */}
      <div style={{ borderTop: '1px solid var(--sc-border)', paddingTop: 'var(--sc-space-4)' }}>
        <div style={{ fontSize: 'var(--sc-fs-md)', fontWeight: 'var(--sc-fw-semibold)', marginBottom: 'var(--sc-space-2)' }}>
          Odds Milestones
        </div>
        <div className="u-col" style={{ gap: 'var(--sc-space-2)' }}>
          <div className="u-row" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--sc-fs-sm)' }}>50% chance by</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{q50.toLocaleString()} encounters</span>
          </div>
          <div className="u-row" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--sc-fs-sm)' }}>90% chance by</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{q90.toLocaleString()} encounters</span>
          </div>
          <div className="u-row" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--sc-fs-sm)' }}>99% chance by</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{q99.toLocaleString()} encounters</span>
          </div>
        </div>
      </div>

      {/* Compact Distribution Strip */}
      <div style={{ borderTop: '1px solid var(--sc-border)', paddingTop: 'var(--sc-space-4)' }}>
        <div style={{ fontSize: 'var(--sc-fs-md)', fontWeight: 'var(--sc-fw-semibold)', marginBottom: 'var(--sc-space-2)' }}>
          First‑Shiny Timeline
        </div>
        {q99 > 0 && (
          <div className="u-col" style={{ gap: '8px' }}>
            <div style={{ position: 'relative', height: '12px', background: 'var(--sc-bg-elev-2)', border: '1px solid var(--sc-border)', borderRadius: '999px' }}>
              {/* subtle left-to-right density hint */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, color-mix(in oklab, var(--sc-brand) 28%, transparent) 0%, transparent 70%)', borderRadius: '999px', opacity: .5 }} />
              {/* q50/q90/q99 ticks */}
              <div style={{ position: 'absolute', left: `${(q50 / q99) * 100}%`, top: 0, bottom: 0, width: '2px', background: 'var(--sc-border-strong)' }} />
              <div style={{ position: 'absolute', left: `${(q90 / q99) * 100}%`, top: 0, bottom: 0, width: '2px', background: 'var(--sc-border-strong)' }} />
              <div style={{ position: 'absolute', left: '100%', top: 0, bottom: 0, width: '2px', background: 'var(--sc-border-strong)' }} />
              {/* current count marker */}
              <div title={`Current: ${hunt.count.toLocaleString()}`} style={{ position: 'absolute', left: `${Math.min(100, (hunt.count / q99) * 100)}%`, top: '-2px', width: '2px', height: '16px', background: 'var(--sc-accent)' }} />
            </div>
            <div className="u-row" style={{ justifyContent: 'space-between', fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>
              <span>0</span>
              <span>50% ({q50.toLocaleString()})</span>
              <span>90% ({q90.toLocaleString()})</span>
              <span>99% ({q99.toLocaleString()})</span>
            </div>
            <div className="u-row" style={{ justifyContent: 'space-between' }}>
              <span className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>Sim mean (n={sim.trials.toLocaleString()})</span>
              <span style={{ fontSize: 'var(--sc-fs-xs)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(sim.mean).toLocaleString()} encounters</span>
            </div>
          </div>
        )}
      </div>

      {/* Hunt Info */}
      <div style={{ borderTop: '1px solid var(--sc-border)', paddingTop: 'var(--sc-space-4)' }}>
        <div className="u-col" style={{ gap: '2px' }}>
          <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>
            Created: {new Date(hunt.createdAt).toLocaleDateString()}
          </div>
          <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>
            Last Updated: {new Date(hunt.updatedAt).toLocaleString()}
          </div>
          <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>
            Base Odds: 1 in {hunt.baseOdds.denominator.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
