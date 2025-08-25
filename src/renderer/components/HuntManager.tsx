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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Hunts</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          {showCreateForm ? 'Cancel' : 'New Hunt'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 border-b pb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hunt Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g., Shiny Ralts Hunt"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target Species</label>
            <input
              type="text"
              value={formData.targetSpecies}
              onChange={(e) => setFormData(prev => ({ ...prev, targetSpecies: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g., Ralts"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Game</label>
              <select
                value={formData.game}
                onChange={(e) => setFormData(prev => ({ ...prev, game: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="">Select Game</option>
                {commonGames.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Method</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
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
            <label className="block text-sm font-medium mb-1">Base Odds (1 in X)</label>
            <input
              type="number"
              value={formData.baseOdds.denominator}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                baseOdds: { numerator: 1, denominator: parseInt(e.target.value) || 4096 }
              }))}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="4096"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
          >
            Create Hunt
          </button>
        </form>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {hunts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hunts yet. Create your first hunt!</p>
        ) : (
          hunts.map((hunt) => (
            <div
              key={hunt.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                activeHunt?.id === hunt.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectHunt(hunt)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{hunt.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {hunt.targetSpecies} • {hunt.game} • {hunt.method}
                  </p>
                  <p className="text-sm font-mono">
                    Count: {hunt.count.toLocaleString()}
                  </p>
                  {hunt.phases.length > 0 && (
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {hunt.phases.length} phase{hunt.phases.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(hunt.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm ml-2"
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