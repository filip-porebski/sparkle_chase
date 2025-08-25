import React, { useState } from 'react';
import { Hunt } from '../../shared/types';

interface CounterProps {
  hunt: Hunt;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetCount: (count: number) => void;
  onPhase: () => void;
}

export const Counter: React.FC<CounterProps> = ({
  hunt,
  onIncrement,
  onDecrement,
  onSetCount,
  onPhase
}) => {
  const [editingCount, setEditingCount] = useState(false);
  const [editValue, setEditValue] = useState(hunt.count.toString());

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">{hunt.name}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {hunt.targetSpecies} in {hunt.game} ({hunt.method})
        </p>
      </div>

      {/* Main Counter */}
      <div className="text-center mb-8">
        {editingCount ? (
          <div className="flex items-center justify-center gap-2">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-6xl font-bold text-center bg-transparent border-b-2 border-blue-500 focus:outline-none w-48"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') handleEditCancel();
              }}
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={handleEditSubmit}
                className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                ✓
              </button>
              <button
                onClick={handleEditCancel}
                className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                ✗
              </button>
            </div>
          </div>
        ) : (
          <div
            className="text-8xl font-bold cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => {
              setEditingCount(true);
              setEditValue(hunt.count.toString());
            }}
          >
            {hunt.count.toLocaleString()}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={onIncrement}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
        >
          +1
        </button>
        <button
          onClick={onDecrement}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
          disabled={hunt.count === 0}
        >
          -1
        </button>
      </div>

      {/* Phase Button */}
      <button
        onClick={onPhase}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        Phase (Off-target Shiny)
      </button>

      {/* Encounters Since Last Shiny */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Encounters since last shiny: <span className="font-bold">{hunt.encountersSinceLastShiny}</span>
        </p>
      </div>

      {/* Recent Phases */}
      {hunt.phases.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Recent Phases</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {hunt.phases.slice(-3).reverse().map((phase) => (
              <div
                key={phase.id}
                className="bg-gray-100 dark:bg-gray-700 rounded p-2 text-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{phase.species}</span>
                  <span className="text-gray-500">#{phase.atCount}</span>
                </div>
                {phase.notes && (
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    {phase.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {hunt.notes && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm bg-gray-100 dark:bg-gray-700 rounded p-3">
            {hunt.notes}
          </p>
        </div>
      )}
    </div>
  );
};