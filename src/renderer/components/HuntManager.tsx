import React, { useState, useEffect } from 'react';
import { Hunt, HuntData } from '../../shared/types';
import { PokemonAutocomplete } from './PokemonAutocomplete';
import { POKEMON_GAMES, isPokemonInGame, isMethodInGame, getGameInfo } from '../data/gameCompatibility';
import { pokeAPI } from '../services/pokeapi';

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
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const [formData, setFormData] = useState<HuntData>({
    name: '',
    game: '',
    method: '',
    targetSpecies: '',
    baseOdds: { numerator: 1, denominator: 4096 },
    notes: ''
  });

  const handlePokemonChange = async (pokemonName: string) => {
    setFormData(prev => ({ ...prev, targetSpecies: pokemonName }));
    
    if (pokemonName) {
      try {
        const pokemon = await pokeAPI.getPokemon(pokeAPI.formatNameForAPI(pokemonName));
        setSelectedPokemonId(pokemon?.id || null);
      } catch (error) {
        console.error('Failed to get Pokemon ID:', error);
        setSelectedPokemonId(null);
      }
    } else {
      setSelectedPokemonId(null);
    }
  };

  const handleGameChange = (gameName: string) => {
    const selectedGame = getGameInfo(gameName);
    const newOdds = selectedGame ? selectedGame.odds : 4096;
    
    setFormData(prev => ({
      ...prev,
      game: gameName,
      baseOdds: { numerator: 1, denominator: newOdds }
    }));
  };

  const isGameCompatible = (gameName: string): boolean => {
    if (!selectedPokemonId) return true;
    return isPokemonInGame(selectedPokemonId, gameName);
  };

  const isMethodCompatible = (method: string): boolean => {
    if (!formData.game) return true;
    return isMethodInGame(method, formData.game);
  };

  const generateHuntName = (): string => {
    const huntNumber = hunts.length + 1;
    if (formData.targetSpecies) {
      return `${formData.targetSpecies} Hunt`;
    }
    return `Hunt ${huntNumber}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.targetSpecies && formData.game && formData.method) {
      const huntData = {
        ...formData,
        name: formData.name.trim() || generateHuntName()
      };
      onCreateHunt(huntData);
      setFormData({
        name: '',
        game: '',
        method: '',
        targetSpecies: '',
        baseOdds: { numerator: 1, denominator: 4096 },
        notes: ''
      });
      setSelectedPokemonId(null);
      setShowCreateForm(false);
    }
  };

  const handleDelete = (huntId: string) => {
    if (window.confirm('Are you sure you want to delete this hunt? This action cannot be undone.')) {
      onDeleteHunt(huntId);
    }
  };


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
    <div className="u-col">
      <div className="u-row" style={{ justifyContent: 'flex-end', marginBottom: 'var(--sc-space-2)' }}>
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
            <label className="sc-label">Hunt Name (Optional)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="sc-input"
              placeholder={formData.targetSpecies ? `${formData.targetSpecies} Hunt` : "Auto-generated if empty"}
            />
            <p className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)', marginTop: 'var(--sc-space-1)' }}>
              Leave empty to auto-generate based on target species
            </p>
          </div>

          <div>
            <label className="sc-label">Target Species</label>
            <PokemonAutocomplete
              value={formData.targetSpecies}
              onChange={handlePokemonChange}
              placeholder="e.g., Pikachu, Charizard, Rayquaza..."
              required
            />
            {selectedPokemonId && (
              <p className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)', marginTop: 'var(--sc-space-1)' }}>
                Incompatible games and methods will be shown in gray
              </p>
            )}
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
                {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(gen => {
                  const gamesInGen = POKEMON_GAMES.filter(game => game.generation === gen);
                  if (gamesInGen.length === 0) return null;
                  
                  return (
                    <optgroup key={gen} label={`Generation ${gen}`}>
                      {gamesInGen.map(game => {
                        const isCompatible = isGameCompatible(game.name);
                        return (
                          <option 
                            key={game.name} 
                            value={game.name}
                            style={{
                              color: isCompatible ? 'inherit' : '#888',
                              fontStyle: isCompatible ? 'normal' : 'italic'
                            }}
                          >
                            {game.name}{!isCompatible ? ' (incompatible)' : ''}
                          </option>
                        );
                      })}
                    </optgroup>
                  );
                })}
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
                {huntingMethods.map(method => {
                  const isCompatible = isMethodCompatible(method);
                  return (
                    <option 
                      key={method} 
                      value={method}
                      style={{
                        color: isCompatible ? 'inherit' : '#888',
                        fontStyle: isCompatible ? 'normal' : 'italic'
                      }}
                    >
                      {method}{!isCompatible ? ' (not available in this game)' : ''}
                    </option>
                  );
                })}
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
                getGameInfo(formData.game)?.odds.toString() || "4096" 
                : "4096"
              }
              min="1"
            />
            <p className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)', marginTop: 'var(--sc-space-1)' }}>
              {formData.game && (
                <>Auto-set to {getGameInfo(formData.game)?.odds || 4096} for {formData.game}</>
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
              className="u-card"
              style={{
                padding: 'var(--sc-space-3)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                border: activeHunt?.id === hunt.id && !hunt.archived
                  ? '2px solid var(--sc-brand)'
                  : '1px solid var(--sc-border)',
                background: hunt.archived
                  ? 'linear-gradient(90deg, color-mix(in oklab, var(--sc-success) 10%, transparent) 0%, transparent 60%), var(--sc-bg-elev-1)'
                  : (activeHunt?.id === hunt.id
                      ? 'color-mix(in oklab, var(--sc-brand) 8%, var(--sc-bg-elev-1))'
                      : 'var(--sc-bg-elev-1)'),
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => onSelectHunt(hunt)}
              onMouseEnter={(e) => {
                if (hunt.archived) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, color-mix(in oklab, var(--sc-success) 16%, transparent) 0%, transparent 60%), var(--sc-bg-elev-2)';
                } else if (activeHunt?.id !== hunt.id) {
                  e.currentTarget.style.borderColor = 'var(--sc-border-strong)';
                  e.currentTarget.style.background = 'var(--sc-bg-elev-2)';
                }
              }}
              onMouseLeave={(e) => {
                if (hunt.archived) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, color-mix(in oklab, var(--sc-success) 10%, transparent) 0%, transparent 60%), var(--sc-bg-elev-1)';
                } else if (activeHunt?.id !== hunt.id) {
                  e.currentTarget.style.borderColor = 'var(--sc-border)';
                  e.currentTarget.style.background = 'var(--sc-bg-elev-1)';
                }
              }}
            >
              <HuntCardBg name={hunt.targetSpecies} />
              <div className="u-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
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
                <div className="u-col" style={{ alignItems: 'flex-end' }}>
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
              <div className="u-col" style={{ alignItems: 'flex-end', gap: '2px', marginTop: '6px' }}>
                <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>
                  Added: {formatRelativeTime(hunt.createdAt)}
                </div>
                <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>
                  Last: {formatRelativeTime(hunt.updatedAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const HuntCardBg: React.FC<{ name: string }> = ({ name }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const sprite = await pokeAPI.getShinySprite(pokeAPI.formatNameForAPI(name));
        if (active) setUrl(sprite);
      } catch {}
    };
    load();
    return () => { active = false; };
  }, [name]);

  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      aria-hidden
      style={{
        position: 'absolute',
        right: '-8px',
        top: '50%',
        transform: 'translateY(-50%)',
        height: '125%',
        opacity: 0.05,
        filter: 'saturate(115%) contrast(110%)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0
      }}
    />
  );
};

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '—';
  const now = new Date();
  const ms = now.getTime() - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(ms / day);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 14) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 8) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}
