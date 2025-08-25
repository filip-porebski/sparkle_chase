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
    <div className="sc-card">
      <div className="sc-card__title">Statistics</div>
      
      <div className="u-col">
        {/* Basic Stats */}
        <div className="u-row">
          <div style={{ 
            background: 'var(--sc-bg-elev-2)', 
            border: '1px solid var(--sc-border)',
            borderRadius: 'var(--sc-radius-lg)',
            padding: 'var(--sc-space-3)',
            flex: 1,
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: 'var(--sc-fs-xl)', 
              fontWeight: 'var(--sc-fw-bold)',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {hunt.count.toLocaleString()}
            </div>
            <div className="u-muted" style={{ fontSize: 'var(--sc-fs-sm)' }}>
              Total Encounters
            </div>
          </div>
          
          <div style={{ 
            background: 'var(--sc-bg-elev-2)', 
            border: '1px solid var(--sc-border)',
            borderRadius: 'var(--sc-radius-lg)',
            padding: 'var(--sc-space-3)',
            flex: 1,
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: 'var(--sc-fs-xl)', 
              fontWeight: 'var(--sc-fw-bold)',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {hunt.phases.length}
            </div>
            <div className="u-muted" style={{ fontSize: 'var(--sc-fs-sm)' }}>
              Phases
            </div>
          </div>
        </div>

        {/* Odds Information */}
        <div style={{ borderTop: '1px solid var(--sc-border)', paddingTop: 'var(--sc-space-4)' }}>
          <div style={{ 
            fontSize: 'var(--sc-fs-md)', 
            fontWeight: 'var(--sc-fw-semibold)', 
            marginBottom: 'var(--sc-space-2)' 
          }}>
            Odds Analysis
          </div>
          
          <div className="u-col" style={{ gap: 'var(--sc-space-2)' }}>
            <div className="u-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--sc-fs-sm)' }}>Effective Odds:</span>
              <span style={{ 
                fontSize: 'var(--sc-fs-sm)', 
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--sc-accent)'
              }}>
                {stats.effectiveOdds}
              </span>
            </div>
            
            <div className="u-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--sc-fs-sm)' }}>Chance of no shiny:</span>
              <span style={{ 
                fontSize: 'var(--sc-fs-sm)', 
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--sc-warning)'
              }}>
                {stats.noShinyChance}
              </span>
            </div>
            
            <div className="u-row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--sc-fs-sm)' }}>Past odds multiple:</span>
              <span style={{ 
                fontSize: 'var(--sc-fs-sm)', 
                fontVariantNumeric: 'tabular-nums',
                color: stats.pastOddsMultiple.includes('1.') ? 'var(--sc-success)' : 'var(--sc-text)'
              }}>
                {stats.pastOddsMultiple}
              </span>
            </div>
            
            {stats.encountersToOdds > 0 && (
              <div className="u-row" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--sc-fs-sm)' }}>Encounters to 1× odds:</span>
                <span style={{ 
                  fontSize: 'var(--sc-fs-sm)', 
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {stats.encountersToOdds.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modifiers */}
        <div style={{ borderTop: '1px solid var(--sc-border)', paddingTop: 'var(--sc-space-4)' }}>
          <div style={{ 
            fontSize: 'var(--sc-fs-md)', 
            fontWeight: 'var(--sc-fw-semibold)', 
            marginBottom: 'var(--sc-space-2)' 
          }}>
            Active Modifiers
          </div>
          
          <div className="u-col" style={{ gap: 'var(--sc-space-1)' }}>
            <div className="u-row" style={{ gap: 'var(--sc-space-2)' }}>
              <input 
                type="checkbox" 
                checked={hunt.modifiers.shinyCharm} 
                readOnly 
                style={{ accentColor: 'var(--sc-brand)' }}
              />
              <span style={{ fontSize: 'var(--sc-fs-sm)' }}>Shiny Charm</span>
            </div>
            
            <div className="u-row" style={{ gap: 'var(--sc-space-2)' }}>
              <input 
                type="checkbox" 
                checked={hunt.modifiers.masuda} 
                readOnly 
                style={{ accentColor: 'var(--sc-brand)' }}
              />
              <span style={{ fontSize: 'var(--sc-fs-sm)' }}>Masuda Method</span>
            </div>
            
            {hunt.modifiers.chainTier > 0 && (
              <div className="u-row" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--sc-fs-sm)' }}>Chain Tier:</span>
                <span style={{ 
                  fontSize: 'var(--sc-fs-sm)', 
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {hunt.modifiers.chainTier}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Phase History */}
        {hunt.phases.length > 0 && (
          <div style={{ borderTop: '1px solid var(--sc-border)', paddingTop: 'var(--sc-space-4)' }}>
            <div style={{ 
              fontSize: 'var(--sc-fs-md)', 
              fontWeight: 'var(--sc-fw-semibold)', 
              marginBottom: 'var(--sc-space-2)' 
            }}>
              Phase History
            </div>
            
            <div className="u-col" style={{ 
              gap: 'var(--sc-space-2)', 
              maxHeight: '128px', 
              overflowY: 'auto' 
            }}>
              {hunt.phases.slice().reverse().map((phase, index) => (
                <div 
                  key={phase.id}
                  className="u-row"
                  style={{ 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--sc-bg-elev-2)',
                    border: '1px solid var(--sc-border)',
                    borderRadius: 'var(--sc-radius-md)',
                    padding: 'var(--sc-space-2)'
                  }}
                >
                  <div>
                    <span style={{ 
                      fontSize: 'var(--sc-fs-sm)', 
                      fontWeight: 'var(--sc-fw-medium)' 
                    }}>
                      {phase.species}
                    </span>
                    {phase.isTarget && (
                      <span style={{ 
                        marginLeft: 'var(--sc-space-2)',
                        color: 'var(--sc-shiny)',
                        fontSize: 'var(--sc-fs-sm)'
                      }}>
                        ★ Target
                      </span>
                    )}
                  </div>
                  <span className="u-subtle" style={{ 
                    fontSize: 'var(--sc-fs-sm)',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    #{phase.atCount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hunt Info */}
        <div style={{ 
          borderTop: '1px solid var(--sc-border)', 
          paddingTop: 'var(--sc-space-4)' 
        }}>
          <div className="u-col" style={{ gap: '2px' }}>
            <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>
              Created: {new Date(hunt.createdAt).toLocaleDateString()}
            </div>
            <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>
              Last Updated: {new Date(hunt.updatedAt).toLocaleString()}
            </div>
            <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>
              Base Odds: 1 in {hunt.baseOdds.denominator.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};