import React, { useEffect, useState } from 'react';
import { Hunt, Settings } from '../../shared/types';
import { formatDate } from '../services/datetime';
import { formatNumber } from '../services/numbers';
import { ShinyPokemonImage } from './ShinyPokemonImage';
import { AnimatedCount } from './AnimatedCount';

interface CounterProps {
  hunt: Hunt;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetCount: (count: number) => void;
  onLogPhase: () => void;
  onLogShiny: () => void;
  onHuntUpdated: (hunt: Hunt) => void;
  settings?: Settings;
}

export const Counter: React.FC<CounterProps> = ({
  hunt,
  onIncrement,
  onDecrement,
  onSetCount,
  onLogPhase,
  onLogShiny,
  onHuntUpdated,
  settings
}) => {
  const [editingCount, setEditingCount] = useState(false);
  const [editValue, setEditValue] = useState(hunt.count.toString());
  const [flash, setFlash] = useState(false);
  const [shineLevel, setShineLevel] = useState<0 | 10 | 100 | 1000>(0);
  const [particles, setParticles] = useState<Array<{ id: string; x: number; y: number; size: number; hue: number; dx: number }>>([]);

  // Subtle attention pulse when the count changes
  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 450);
    return () => clearTimeout(t);
  }, [hunt.count]);

  // Milestone shine when divisible by 10/100/1000
  useEffect(() => {
    let level: 0 | 10 | 100 | 1000 = 0;
    if (hunt.count > 0) {
      if (hunt.count % 1000 === 0) level = 1000;
      else if (hunt.count % 100 === 0) level = 100;
      else if (hunt.count % 10 === 0) level = 10;
    }
    setShineLevel(level);
    if (level > 0) {
      const n = level === 1000 ? 18 : level === 100 ? 12 : 8;
      const created = Array.from({ length: n }).map((_, i) => ({
        id: `${Date.now()}_${i}`,
        x: Math.random() * 90 + 5,
        y: Math.random() * 25 + 35,
        size: Math.random() * 4 + (level === 1000 ? 5 : level === 100 ? 4 : 3),
        hue: 260 + Math.random() * 60,
        dx: (Math.random() - 0.5) * 60
      }));
      setParticles(created);
      const clear = setTimeout(() => setParticles([]), 1200);
      return () => clearTimeout(clear);
    }
  }, [hunt.count]);

  const handleEditSubmit = () => {
    const newCount = parseInt(editValue, 10);
    if (!isNaN(newCount) && newCount >= 0) {
      onSetCount(newCount);
    }
    setEditingCount(false);
  };

  const handleEditCancel = () => {
    setEditValue(hunt.count.toString());
    setEditingCount(false);
  };

  return (
    <div className="sc-card sc-card--hero" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
      {/* Hunt Header */}
      <div className="u-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sc-space-4)' }}>
        <div style={{ flex: 1 }}>
          <div className="sc-card__title">{hunt.targetSpecies}</div>
          <div className="sc-card__meta">{hunt.game} • {hunt.method}</div>
        </div>
        
        {/* Right-side: Phase label above image, image sticks to the right */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 'var(--sc-space-4)' }}>
          <ShinyPokemonImage 
            pokemonName={hunt.targetSpecies} 
            size="medium"
            showLabel={false}
          />
          {hunt.phases.length > 0 && (
            <div className="sc-tag" style={{ marginTop: 'var(--sc-space-1)' }}>
              Phase #{hunt.phases.length}
            </div>
          )}
        </div>
      </div>

      {/* Main Counter */}
      <div className="sc-counter" style={{ marginBottom: 'var(--sc-space-5)' }}>
        {editingCount ? (
          <div className="u-row" style={{ justifyContent: 'center', flex: 1 }}>
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="sc-input"
              style={{ 
                fontSize: 'var(--sc-fs-xl)', 
                fontWeight: 'var(--sc-fw-bold)',
                textAlign: 'center',
                width: '200px',
                fontVariantNumeric: 'tabular-nums'
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') handleEditCancel();
              }}
            />
            <div className="u-col" style={{ gap: 'var(--sc-space-1)' }}>
              <button
                onClick={handleEditSubmit}
                className="sc-btn"
                style={{ height: '32px', padding: '0 8px', fontSize: 'var(--sc-fs-xs)' }}
              >
                ✓
              </button>
              <button
                onClick={handleEditCancel}
                className="sc-btn sc-btn--danger"
                style={{ height: '32px', padding: '0 8px', fontSize: 'var(--sc-fs-xs)' }}
              >
                ✗
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`sc-count sc-count--halo ${flash ? 'is-flash' : ''}`}
            style={{ 
              cursor: 'pointer', 
              transition: 'color 0.15s ease',
              flex: 1,
              textAlign: 'center'
            }}
            onClick={() => {
              setEditingCount(true);
              setEditValue(hunt.count.toString());
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--sc-brand)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--sc-text)'}
          >
            <AnimatedCount value={hunt.count} separator={settings?.numberSeparator || 'comma'} />
          </div>
        )}
        
        {!editingCount && (
          <div className="u-col" style={{ gap: 'var(--sc-space-3)' }}>
            {/* Main +1 Button */}
            <button
              onClick={() => !hunt.archived && onIncrement()}
              className={`sc-btn sc-btn--giant ${hunt.archived ? '' : 'sc-btn--primary'}`}
              aria-disabled={hunt.archived}
              style={{ opacity: hunt.archived ? 0.5 : 1, pointerEvents: hunt.archived ? 'none' : 'auto' }}
            >
              +1
            </button>
            
            {/* Quick Actions Row */}
            <div className="u-row" style={{ gap: 'var(--sc-space-2)' }}>
              <button
                onClick={() => !hunt.archived && onDecrement()}
                className="sc-btn"
                aria-disabled={hunt.count === 0}
                style={{ 
                  opacity: hunt.count === 0 || hunt.archived ? 0.6 : 1,
                  flex: 1,
                  background: 'var(--sc-danger)',
                  borderColor: 'color-mix(in oklab, var(--sc-danger) 70%, black 30%)',
                  color: '#fff'
                }}
              >
                −1
              </button>
              <button
                onClick={() => {
                  if (hunt.archived) return;
                  onIncrement();
                  setTimeout(onIncrement, 50);
                }}
                className="sc-btn"
                style={{ 
                  flex: 1,
                  background: 'var(--sc-success)',
                  borderColor: 'color-mix(in oklab, var(--sc-success) 70%, black 30%)',
                  color: '#fff'
                }}
              >
                +2
              </button>
              <button
                onClick={() => {
                  if (hunt.archived) return;
                  for (let i = 0; i < 5; i++) setTimeout(onIncrement, i * 50);
                }}
                className="sc-btn"
                style={{ 
                  flex: 1,
                  background: 'var(--sc-accent)',
                  borderColor: 'color-mix(in oklab, var(--sc-accent) 70%, black 30%)',
                  color: '#fff'
                }}
              >
                +5
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Odds and Stats Row */}
      <div className="u-row" style={{ justifyContent: 'space-between', marginBottom: 'var(--sc-space-4)' }}>
        <div className="sc-odds">
          Base odds: 1 in {formatNumber(hunt.baseOdds.denominator, settings)}
        </div>
        <div className="sc-since">
          Since last shiny: {hunt.encountersSinceLastShiny}
        </div>
      </div>

      {/* Shiny / Phase Buttons */}
      <div className="u-row" style={{ gap: 'var(--sc-space-2)', marginBottom: 'var(--sc-space-4)' }}>
        <button
          onClick={() => !hunt.archived && onLogShiny()}
          className={`sc-btn ${hunt.archived ? '' : 'sc-btn--primary'}`}
          style={{ flex: 1, opacity: hunt.archived ? 0.5 : 1, pointerEvents: hunt.archived ? 'none' : 'auto' }}
          title="Log target shiny (hunt complete)"
        >
          ✨ Shiny
        </button>
        <button
          onClick={() => !hunt.archived && onLogPhase()}
          className="sc-btn"
          style={{ flex: 1, opacity: hunt.archived ? 0.5 : 1, pointerEvents: hunt.archived ? 'none' : 'auto' }}
          title="Log an off-target phase"
        >
          Phase
        </button>
      </div>

      {hunt.archived && (
        <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)', textAlign: 'center' }}>
          Hunt is locked. Unlock it from Hunts → Unlock
        </div>
      )}

      {/* Recent Phases */}
      {hunt.phases.length > 0 && (
        <div style={{ marginTop: 'var(--sc-space-4)' }}>
          <div className="sc-card__title" style={{ fontSize: 'var(--sc-fs-md)', marginBottom: 'var(--sc-space-2)' }}>
            Recent Phases
          </div>
          <div className="sc-phases">
            {hunt.phases.slice(-3).reverse().map((phase) => (
              <div
                key={phase.id}
                className={`sc-phase ${phase.isTarget ? 'sc-phase--target' : ''}`}
                style={{ position: 'relative' }}
              >
                <div>
                  <div className="sc-phase__title">
                    {phase.species} {phase.isTarget ? '(Target!)' : '(Off-target)'}
                  </div>
                  <div className="sc-phase__meta">
                    at {formatNumber(phase.atCount, settings)} • {settings ? formatDate(phase.createdAt, settings) : new Date(phase.createdAt).toLocaleDateString()}
                  </div>
                  {phase.notes && (
                    <div className="sc-phase__meta" style={{ marginTop: '2px' }}>
                      {phase.notes}
                    </div>
                  )}
                </div>
                {!hunt.archived && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this phase?')) return;
                      const updated = await window.electronAPI.deletePhase(hunt.id, phase.id);
                      if (updated) onHuntUpdated(updated);
                    }}
                    className="sc-btn sc-btn--ghost sc-btn--xs sc-btn--icon"
                    style={{ position: 'absolute', right: '6px', top: '6px' }}
                    title="Delete phase"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {hunt.notes && (
        <div style={{ marginTop: 'var(--sc-space-4)' }}>
          <div className="sc-card__title" style={{ fontSize: 'var(--sc-fs-md)', marginBottom: 'var(--sc-space-2)' }}>
            Notes
          </div>
          <div style={{ 
            background: 'var(--sc-bg-elev-2)', 
            border: '1px solid var(--sc-border)',
            borderRadius: 'var(--sc-radius-lg)',
            padding: 'var(--sc-space-3)',
            fontSize: 'var(--sc-fs-sm)',
            color: 'var(--sc-text-muted)'
          }}>
            {hunt.notes}
          </div>
        </div>
      )}
      {/* Shine overlay */}
      {shineLevel > 0 && (
        <div className={`sc-hero-shine sc-hero-shine--${shineLevel}`} aria-hidden />
      )}

      {/* Particles */}
      {particles.length > 0 && (
        <div className="sc-hero-particles" aria-hidden>
          {particles.map((p) => (
            <span
              key={p.id}
              className="sc-hero-particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: `oklch(65% 0.12 ${p.hue})`,
                boxShadow: `0 0 ${Math.max(4, p.size * 1.8)}px color-mix(in oklab, var(--sc-brand) 60%, transparent)`,
                // Custom CSS var for animation drift
                ['--dx' as any]: `${p.dx}px`
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  );
};
