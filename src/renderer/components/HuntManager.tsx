import React, { useState } from 'react';
import { Hunt, HuntData } from '../../shared/types';
import { PokemonAutocomplete } from './PokemonAutocomplete';

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

  const handleGameChange = (gameName: string) => {
    const selectedGame = pokemonGames.find(game => game.name === gameName);
    const newOdds = selectedGame ? selectedGame.odds : 4096;
    
    setFormData(prev => ({
      ...prev,
      game: gameName,
      baseOdds: { numerator: 1, denominator: newOdds }
    }));
  };

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

  const pokemonGames = [
    // Generation 9
    { name: 'Scarlet', odds: 4096 },
    { name: 'Violet', odds: 4096 },
    
    // Generation 8
    { name: 'Brilliant Diamond', odds: 4096 },
    { name: 'Shining Pearl', odds: 4096 },
    { name: 'Legends: Arceus', odds: 4096 },
    { name: 'Sword', odds: 4096 },
    { name: 'Shield', odds: 4096 },
    
    // Generation 7
    { name: "Let's Go, Pikachu!", odds: 4096 },
    { name: "Let's Go, Eevee!", odds: 4096 },
    { name: 'Ultra Sun', odds: 4096 },
    { name: 'Ultra Moon', odds: 4096 },
    { name: 'Sun', odds: 4096 },
    { name: 'Moon', odds: 4096 },
    
    // Generation 6
    { name: 'Omega Ruby', odds: 4096 },
    { name: 'Alpha Sapphire', odds: 4096 },
    { name: 'X', odds: 4096 },
    { name: 'Y', odds: 4096 },
    
    // Generation 5
    { name: 'Black 2', odds: 8192 },
    { name: 'White 2', odds: 8192 },
    { name: 'Black', odds: 8192 },
    { name: 'White', odds: 8192 },
    
    // Generation 4
    { name: 'HeartGold', odds: 8192 },
    { name: 'SoulSilver', odds: 8192 },
    { name: 'Platinum', odds: 8192 },
    { name: 'Diamond', odds: 8192 },
    { name: 'Pearl', odds: 8192 },
    
    // Generation 3
    { name: 'Emerald', odds: 8192 },
    { name: 'Fire Red', odds: 8192 },
    { name: 'Leaf Green', odds: 8192 },
    { name: 'Ruby', odds: 8192 },
    { name: 'Sapphire', odds: 8192 },
    
    // Generation 2
    { name: 'Crystal', odds: 8192 },
    { name: 'Gold', odds: 8192 },
    { name: 'Silver', odds: 8192 },
    
    // Generation 1 (no shinies originally, but for ROM hacks)
    { name: 'Yellow', odds: 8192 },
    { name: 'Blue', odds: 8192 },
    { name: 'Red', odds: 8192 }
  ];

  const huntingMethods = [
    'Random Encounters',
    'Masuda Method',
    'Soft Reset',
    'Chain Fishing',
    'DexNav',
    'SOS Chaining',
    'Dynamax Adventures',
    'Max Raid Battles',
    'Poke Radar',
    'Friend Safari',
    'Horde Encounters',
    'Breeding',
    'Fossil Reviving',
    'Gift Pokemon',
    'Static Encounters',
    'Legendary Hunting',
    'Outbreak Hunting',
    'Mass Outbreaks',
    'Sandwich Method'
  ];

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
            <PokemonAutocomplete
              value={formData.targetSpecies}
              onChange={(value) => setFormData(prev => ({ ...prev, targetSpecies: value }))}
              placeholder="e.g., Pikachu, Charizard, Rayquaza..."
              required
            />
          </div>

          <div className="u-row">
            <div style={{ flex: 1 }}>
              <label className="sc-label">Game</label>
              <select
                value={formData.game}
                onChange={(e) => handleGameChange(e.target.value)}
                className="sc-input"
                required
              >
                <option value="">Select Game</option>
                <optgroup label="Generation 9">
                  <option value="Scarlet">Scarlet</option>
                  <option value="Violet">Violet</option>
                </optgroup>
                <optgroup label="Generation 8">
                  <option value="Brilliant Diamond">Brilliant Diamond</option>
                  <option value="Shining Pearl">Shining Pearl</option>
                  <option value="Legends: Arceus">Legends: Arceus</option>
                  <option value="Sword">Sword</option>
                  <option value="Shield">Shield</option>
                </optgroup>
                <optgroup label="Generation 7">
                  <option value="Let's Go, Pikachu!">Let's Go, Pikachu!</option>
                  <option value="Let's Go, Eevee!">Let's Go, Eevee!</option>
                  <option value="Ultra Sun">Ultra Sun</option>
                  <option value="Ultra Moon">Ultra Moon</option>
                  <option value="Sun">Sun</option>
                  <option value="Moon">Moon</option>
                </optgroup>
                <optgroup label="Generation 6">
                  <option value="Omega Ruby">Omega Ruby</option>
                  <option value="Alpha Sapphire">Alpha Sapphire</option>
                  <option value="X">X</option>
                  <option value="Y">Y</option>
                </optgroup>
                <optgroup label="Generation 5">
                  <option value="Black 2">Black 2</option>
                  <option value="White 2">White 2</option>
                  <option value="Black">Black</option>
                  <option value="White">White</option>
                </optgroup>
                <optgroup label="Generation 4">
                  <option value="HeartGold">HeartGold</option>
                  <option value="SoulSilver">SoulSilver</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Pearl">Pearl</option>
                </optgroup>
                <optgroup label="Generation 3">
                  <option value="Emerald">Emerald</option>
                  <option value="Fire Red">Fire Red</option>
                  <option value="Leaf Green">Leaf Green</option>
                  <option value="Ruby">Ruby</option>
                  <option value="Sapphire">Sapphire</option>
                </optgroup>
                <optgroup label="Generation 2">
                  <option value="Crystal">Crystal</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                </optgroup>
                <optgroup label="Generation 1">
                  <option value="Yellow">Yellow</option>
                  <option value="Blue">Blue</option>
                  <option value="Red">Red</option>
                </optgroup>
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
                {huntingMethods.map(method => (
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
              placeholder={formData.game ? 
                pokemonGames.find(g => g.name === formData.game)?.odds.toString() || "4096" 
                : "4096"
              }
              min="1"
            />
            <p className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)', marginTop: 'var(--sc-space-1)' }}>
              {formData.game && (
                <>Auto-set to {pokemonGames.find(g => g.name === formData.game)?.odds || 4096} for {formData.game}</>
              )}
              {!formData.game && <>Select a game to auto-fill base odds</>}
            </p>
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