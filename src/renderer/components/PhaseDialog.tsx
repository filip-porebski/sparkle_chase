import React, { useState } from 'react';

interface PhaseDialogProps {
  onPhase: (phaseData: { species: string; isTarget: boolean; notes?: string }) => void;
  onClose: () => void;
}

export const PhaseDialog: React.FC<PhaseDialogProps> = ({ onPhase, onClose }) => {
  const [species, setSpecies] = useState('');
  const [isTarget, setIsTarget] = useState(false);
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
        <div className="sc-card__title" style={{ marginBottom: 'var(--sc-space-4)' }}>✨ Log Phase</div>
        
        <form onSubmit={handleSubmit} className="u-col">
          <div>
            <label className="sc-label">
              Species Found
            </label>
            <input
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="sc-input"
              placeholder="e.g., Pidgey"
              autoFocus
              required
            />
          </div>

          <div className="u-row" style={{ gap: 'var(--sc-space-2)' }}>
            <input
              type="checkbox"
              id="isTarget"
              checked={isTarget}
              onChange={(e) => setIsTarget(e.target.checked)}
              style={{ accentColor: 'var(--sc-shiny)' }}
            />
            <label htmlFor="isTarget" style={{ fontSize: 'var(--sc-fs-sm)' }}>
              This was my target species (hunt complete!)
            </label>
          </div>

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
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <div className="u-row" style={{ 
            gap: 'var(--sc-space-3)', 
            paddingTop: 'var(--sc-space-4)' 
          }}>
            <button
              type="submit"
              className="sc-btn"
              style={{ 
                flex: 1,
                background: 'var(--sc-warning)',
                borderColor: 'color-mix(in oklab, var(--sc-warning) 70%, black 30%)',
                color: '#fff'
              }}
            >
              ✨ Log Phase
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