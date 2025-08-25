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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Log Phase</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Species Found
            </label>
            <input
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g., Pidgey"
              autoFocus
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isTarget"
              checked={isTarget}
              onChange={(e) => setIsTarget(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isTarget" className="text-sm">
              This was my target species (hunt complete!)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Location, method details, etc..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
            >
              Log Phase
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};