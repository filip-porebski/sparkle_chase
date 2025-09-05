import React, { useState } from 'react';
import { PokemonAutocomplete } from './PokemonAutocomplete';

interface PhaseDialogProps {
  mode: 'phase' | 'shiny';
  targetSpecies?: string;
  onPhase: (phaseData: { species: string; isTarget: boolean; notes?: string }) => void;
  onClose: () => void;
}

export const PhaseDialog: React.FC<PhaseDialogProps> = ({ mode, targetSpecies, onPhase, onClose }) => {
  const [species, setSpecies] = useState(() => mode === 'shiny' ? (targetSpecies || '') : '');
  const isTarget = mode === 'shiny';
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (species.trim()) {
      onPhase({
        species: species.trim(),
        isTarget,
        notes: notes.trim() || undefined
      });
    }
  };

  return (
    <div className="sc-modal-backdrop">
      <div className="sc-modal">
        <div className="sc-card__title" style={{ marginBottom: 'var(--sc-space-4)' }}>
          {mode === 'shiny' ? '✨ Log Shiny' : '✨ Log Phase'}
        </div>
        
        <form onSubmit={handleSubmit} className="u-col">
          <div>
            <label className="sc-label">Species Found</label>
            {mode === 'shiny' ? (
              <input
                type="text"
                value={species}
                className="sc-input"
                disabled
              />
            ) : (
              <PokemonAutocomplete
                value={species}
                onChange={setSpecies}
                placeholder="e.g., Pidgey"
                required
              />
            )}
          </div>

          {/* Hunt complete toggle removed: implied by mode */}

          <div>
            <label className="sc-label">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="sc-input"
              placeholder="Location, method details, etc..."
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px', padding: '12px' }}
            />
          </div>

          <div className="u-row" style={{ 
            gap: 'var(--sc-space-3)', 
            paddingTop: 'var(--sc-space-4)' 
          }}>
            <button
              type="submit"
              className={`sc-btn ${mode === 'shiny' ? 'sc-btn--primary' : ''}`}
              style={{ flex: 1 }}
            >
              {mode === 'shiny' ? '✨ Log Shiny' : 'Log Phase'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sc-btn sc-btn--ghost"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
