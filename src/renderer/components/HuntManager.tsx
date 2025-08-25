import React, { useState } from 'react';
import { Hunt, HuntData } from '../../shared/types';

interface HuntManagerProps {
  hunts: Hunt[];
  activeHunt: Hunt | null;
  onCreateHunt: (huntData: HuntData) => void;
  onSelectHunt: (hunt: Hunt) => void;
  onDeleteHunt: (huntId: string) => void;
}

export const HuntManager: React.FC<HuntManagerProps> = ({
  hunts,
  activeHunt,
  onCreateHunt,
  onSelectHunt,
  onDeleteHunt
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<HuntData>({
    name: '',
    game: '',
    method: '',
    targetSpecies: '',
    baseOdds: { numerator: 1, denominator: 4096 },
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.targetSpecies && formData.game && formData.method) {
      onCreateHunt(formData);
      setFormData({
        name: '',
        game: '',
        method: '',
        targetSpecies: '',
        baseOdds: { numerator: 1, denominator: 4096 },
        notes: ''
      });
      setShowCreateForm(false);
    }
  };

  const handleDelete = (huntId: string) => {
    if (window.confirm('Are you sure you want to delete this hunt? This action cannot be undone.')) {
      onDeleteHunt(huntId);
    }
  };

  const commonGames = ['SV', 'BDSP', 'SwSh', 'LGPE', 'USUM', 'SM', 'ORAS', 'XY'];
  const commonMethods = ['Random Encounters', 'Masuda Method', 'Soft Reset', 'Chain Fishing', 'DexNav', 'SOS Chaining', 'Dynamax Adventures'];

  return (
    <div className="sc-card">
      <div className="u-row" style={{ justifyContent: 'space-between', marginBottom: 'var(--sc-space-4)' }}>
        <div className="sc-card__title">Hunts</div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`sc-btn ${showCreateForm ? 'sc-btn--ghost' : 'sc-btn--primary'}`}
        >
          {showCreateForm ? 'Cancel' : 'New Hunt'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleSubmit} className="u-col" style={{ 
          marginBottom: 'var(--sc-space-5)', 
          paddingBottom: 'var(--sc-space-4)',
          borderBottom: '1px solid var(--sc-border)'
        }}>
          <div>
            <label className="sc-label">Hunt Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="sc-input"
              placeholder="e.g., Shiny Ralts Hunt"
              required
            />
          </div>

          <div>
            <label className="sc-label">Target Species</label>
            <input
              type="text"
              value={formData.targetSpecies}
              onChange={(e) => setFormData(prev => ({ ...prev, targetSpecies: e.target.value }))}
              className="sc-input"
              placeholder="e.g., Ralts"
              required
            />
          </div>

          <div className="u-row">
            <div style={{ flex: 1 }}>
              <label className="sc-label">Game</label>
              <select
                value={formData.game}
                onChange={(e) => setFormData(prev => ({ ...prev, game: e.target.value }))}
                className="sc-input"
                required
              >
                <option value="">Select Game</option>
                {commonGames.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label className="sc-label">Method</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                className="sc-input"
                required
              >
                <option value="">Select Method</option>
                {commonMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="sc-label">Base Odds (1 in X)</label>
            <input
              type="number"
              value={formData.baseOdds.denominator}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                baseOdds: { numerator: 1, denominator: parseInt(e.target.value) || 4096 }
              }))}
              className="sc-input"
              placeholder="4096"
              min="1"
            />
          </div>

          <div>
            <label className="sc-label">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="sc-input"
              placeholder="Any additional notes..."
              rows={2}
              style={{ resize: 'vertical', minHeight: '60px' }}
            />
          </div>

          <button
            type="submit"
            className="sc-btn sc-btn--primary"
            style={{ width: '100%' }}
          >
            Create Hunt
          </button>
        </form>
      )}

      <div className="u-col" style={{ gap: 'var(--sc-space-2)', maxHeight: '400px', overflowY: 'auto' }}>
        {hunts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--sc-space-5)',
            color: 'var(--sc-text-muted)'
          }}>
            No hunts yet. Create your first hunt!
          </div>
        ) : (
          hunts.map((hunt) => (
            <div
              key={hunt.id}
              className="sc-card"
              style={{
                padding: 'var(--sc-space-3)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: activeHunt?.id === hunt.id 
                  ? '2px solid var(--sc-brand)' 
                  : '1px solid var(--sc-border)',
                background: activeHunt?.id === hunt.id 
                  ? 'color-mix(in oklab, var(--sc-brand) 8%, var(--sc-bg-elev-1))' 
                  : 'var(--sc-bg-elev-1)'
              }}
              onClick={() => onSelectHunt(hunt)}
              onMouseEnter={(e) => {
                if (activeHunt?.id !== hunt.id) {
                  e.currentTarget.style.borderColor = 'var(--sc-border-strong)';
                  e.currentTarget.style.background = 'var(--sc-bg-elev-2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeHunt?.id !== hunt.id) {
                  e.currentTarget.style.borderColor = 'var(--sc-border)';
                  e.currentTarget.style.background = 'var(--sc-bg-elev-1)';
                }
              }}
            >
              <div className="u-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'var(--sc-fw-medium)',
                    marginBottom: '2px'
                  }}>
                    {hunt.name}
                  </div>
                  <div className="sc-card__meta">
                    {hunt.targetSpecies} • {hunt.game} • {hunt.method}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--sc-fs-sm)',
                    fontVariantNumeric: 'tabular-nums',
                    marginTop: '4px'
                  }}>
                    Count: {hunt.count.toLocaleString()}
                  </div>
                  {hunt.phases.length > 0 && (
                    <div className="sc-tag" style={{ 
                      marginTop: '4px',
                      background: 'var(--sc-bg-warn)',
                      color: 'var(--sc-warning)',
                      border: '1px solid color-mix(in oklab, var(--sc-warning) 30%, transparent)'
                    }}>
                      {hunt.phases.length} phase{hunt.phases.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(hunt.id);
                  }}
                  className="sc-btn sc-btn--ghost"
                  style={{ 
                    height: '32px',
                    padding: '0 8px',
                    fontSize: 'var(--sc-fs-xs)',
                    color: 'var(--sc-danger)'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};