import React from 'react';
import { Hunt } from '../../shared/types';

interface StatsPanelProps {
  hunt: Hunt;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ hunt }) => {
  // Calculate odds statistics
  const calculateOdds = () => {
    const baseProb = hunt.baseOdds.numerator / hunt.baseOdds.denominator;
    
    // Apply modifiers (simplified for MVP)
    let effectiveProb = baseProb;
    if (hunt.modifiers.shinyCharm) {
      effectiveProb *= 3; // Rough approximation
    }
    if (hunt.modifiers.masuda) {
      effectiveProb *= 6; // Masuda method multiplier
    }
    
    const noShinyAfterN = Math.pow(1 - effectiveProb, hunt.encountersSinceLastShiny);
    const pastOddsMultiple = hunt.encountersSinceLastShiny / (1 / effectiveProb);
    
    return {
      effectiveOdds: `1 in ${Math.round(1 / effectiveProb).toLocaleString()}`,
      noShinyChance: `${(noShinyAfterN * 100).toFixed(2)}%`,
      pastOddsMultiple: `${pastOddsMultiple.toFixed(2)}x`,
      encountersToOdds: Math.round(1 / effectiveProb) - hunt.encountersSinceLastShiny
    };
  };

  const stats = calculateOdds();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Statistics</h2>
      
      <div className="space-y-4">
        {/* Basic Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-3">
            <div className="text-2xl font-bold">{hunt.count.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Encounters</div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-3">
            <div className="text-2xl font-bold">{hunt.phases.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Phases</div>
          </div>
        </div>

        {/* Odds Information */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Odds Analysis</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Effective Odds:</span>
              <span className="font-mono">{stats.effectiveOdds}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Chance of no shiny:</span>
              <span className="font-mono">{stats.noShinyChance}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Past odds multiple:</span>
              <span className="font-mono">{stats.pastOddsMultiple}</span>
            </div>
            
            {stats.encountersToOdds > 0 && (
              <div className="flex justify-between">
                <span>Encounters to 1× odds:</span>
                <span className="font-mono">{stats.encountersToOdds.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modifiers */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Active Modifiers</h3>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={hunt.modifiers.shinyCharm} 
                readOnly 
                className="rounded"
              />
              <span>Shiny Charm</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={hunt.modifiers.masuda} 
                readOnly 
                className="rounded"
              />
              <span>Masuda Method</span>
            </div>
            
            {hunt.modifiers.chainTier > 0 && (
              <div className="flex justify-between">
                <span>Chain Tier:</span>
                <span className="font-mono">{hunt.modifiers.chainTier}</span>
              </div>
            )}
          </div>
        </div>

        {/* Phase History */}
        {hunt.phases.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Phase History</h3>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {hunt.phases.slice().reverse().map((phase, index) => (
                <div 
                  key={phase.id}
                  className="flex justify-between items-center text-sm bg-gray-100 dark:bg-gray-700 rounded p-2"
                >
                  <div>
                    <span className="font-medium">{phase.species}</span>
                    {phase.isTarget && (
                      <span className="ml-2 text-green-600 dark:text-green-400">★ Target</span>
                    )}
                  </div>
                  <span className="text-gray-500">#{phase.atCount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hunt Info */}
        <div className="border-t pt-4 text-xs text-gray-600 dark:text-gray-400">
          <div>Created: {new Date(hunt.createdAt).toLocaleDateString()}</div>
          <div>Last Updated: {new Date(hunt.updatedAt).toLocaleString()}</div>
          <div>Base Odds: 1 in {hunt.baseOdds.denominator.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};