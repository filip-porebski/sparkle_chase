import React, { useState, useEffect } from 'react';
import { Hunt, Settings } from '../shared/types';
import { HuntManager } from './components/HuntManager';
import { Counter } from './components/Counter';
import { PhaseDialog } from './components/PhaseDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { StatsPanel } from './components/StatsPanel';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { MovableCard } from './components/MovableCard';
import { useCardLayout } from './hooks/useCardLayout';
import './styles/sparklechase.css';

function App() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [activeHunt, setActiveHunt] = useState<Hunt | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [globalHotkeysEnabled, setGlobalHotkeysEnabled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  // Card layout management
  const { 
    moveCard, 
    toggleCardCollapse, 
    getCardsByPosition, 
    getCard 
  } = useCardLayout();

  useEffect(() => {
    loadInitialData();
    
    // Set theme on document
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    const cleanup = setupHotkeys();
    return cleanup;
  }, [activeHunt]); // Re-setup hotkeys when activeHunt changes

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const loadInitialData = async () => {
    try {
      const [huntsList, settingsData] = await Promise.all([
        window.electronAPI.listHunts(),
        window.electronAPI.getSettings()
      ]);
      
      setHunts(huntsList);
      setSettings(settingsData);
      
      // Set the first hunt as active if available
      if (huntsList.length > 0) {
        setActiveHunt(huntsList[0]);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupHotkeys = () => {
    const unsubscribeIncrement = window.electronAPI.onHotkeyIncrement(() => {
      if (activeHunt) {
        handleIncrement();
      }
    });

    const unsubscribeDecrement = window.electronAPI.onHotkeyDecrement(() => {
      if (activeHunt) {
        handleDecrement();
      }
    });

    const unsubscribePhase = window.electronAPI.onHotkeyPhase(() => {
      if (activeHunt) {
        setShowPhaseDialog(true);
      }
    });

    const unsubscribeGlobalToggle = window.electronAPI.onGlobalHotkeyToggled((enabled) => {
      setGlobalHotkeysEnabled(enabled);
    });

    return () => {
      unsubscribeIncrement();
      unsubscribeDecrement();
      unsubscribePhase();
      unsubscribeGlobalToggle();
    };
  };

  const handleIncrement = async () => {
    if (!activeHunt) return;
    
    try {
      const updatedHunt = await window.electronAPI.incrementCounter(activeHunt.id);
      if (updatedHunt) {
        setActiveHunt(updatedHunt);
        updateHuntInList(updatedHunt);
      }
    } catch (error) {
      console.error('Failed to increment counter:', error);
    }
  };

  const handleDecrement = async () => {
    if (!activeHunt) return;
    
    try {
      const updatedHunt = await window.electronAPI.decrementCounter(activeHunt.id);
      if (updatedHunt) {
        setActiveHunt(updatedHunt);
        updateHuntInList(updatedHunt);
      }
    } catch (error) {
      console.error('Failed to decrement counter:', error);
    }
  };

  const handleSetCount = async (count: number) => {
    if (!activeHunt) return;
    
    try {
      const updatedHunt = await window.electronAPI.setCounter(activeHunt.id, count);
      if (updatedHunt) {
        setActiveHunt(updatedHunt);
        updateHuntInList(updatedHunt);
      }
    } catch (error) {
      console.error('Failed to set counter:', error);
    }
  };

  const handlePhase = async (phaseData: { species: string; isTarget: boolean; notes?: string }) => {
    if (!activeHunt) return;
    
    try {
      const updatedHunt = await window.electronAPI.addPhase(activeHunt.id, phaseData);
      if (updatedHunt) {
        setActiveHunt(updatedHunt);
        updateHuntInList(updatedHunt);
      }
      setShowPhaseDialog(false);
    } catch (error) {
      console.error('Failed to add phase:', error);
    }
  };

  const handleCreateHunt = async (huntData: any) => {
    try {
      const newHunt = await window.electronAPI.createHunt(huntData);
      setHunts(prev => [newHunt, ...prev]);
      setActiveHunt(newHunt);
    } catch (error) {
      console.error('Failed to create hunt:', error);
    }
  };

  const handleSelectHunt = (hunt: Hunt) => {
    setActiveHunt(hunt);
  };

  const handleDeleteHunt = async (huntId: string) => {
    try {
      const success = await window.electronAPI.deleteHunt(huntId);
      if (success) {
        setHunts(prev => prev.filter(h => h.id !== huntId));
        if (activeHunt?.id === huntId) {
          const remainingHunts = hunts.filter(h => h.id !== huntId);
          setActiveHunt(remainingHunts.length > 0 ? remainingHunts[0] : null);
        }
      }
    } catch (error) {
      console.error('Failed to delete hunt:', error);
    }
  };

  const updateHuntInList = (updatedHunt: Hunt) => {
    setHunts(prev => prev.map(h => h.id === updatedHunt.id ? updatedHunt : h));
  };

  const handleUpdateSettings = async (updates: Partial<Settings>) => {
    try {
      const updatedSettings = await window.electronAPI.updateSettings(updates);
      setSettings(updatedSettings);
      
      // Update theme if it changed
      if (updates.theme) {
        setTheme(updates.theme);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    handleUpdateSettings({ theme: newTheme });
  };

  // Render card content based on card type
  const renderCardContent = (cardId: string) => {
    switch (cardId) {
      case 'hunts':
        return (
          <HuntManager
            hunts={hunts}
            activeHunt={activeHunt}
            onCreateHunt={handleCreateHunt}
            onSelectHunt={handleSelectHunt}
            onDeleteHunt={handleDeleteHunt}
          />
        );
      case 'statistics':
        return activeHunt ? <StatsPanel hunt={activeHunt} /> : (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--sc-space-4)',
            color: 'var(--sc-text-muted)'
          }}>
            No active hunt selected
          </div>
        );
      default:
        return null;
    }
  };

  // Render cards for a specific side
  const renderCards = (side: 'left' | 'right') => {
    const cards = getCardsByPosition(side);
    
    return cards.map(cardConfig => {
      const card = getCard(cardConfig.id);
      if (!card) return null;

      return (
        <MovableCard
          key={cardConfig.id}
          id={cardConfig.id}
          title={cardConfig.title}
          currentSide={side}
          isCollapsed={card.isCollapsed}
          onMove={moveCard}
          onToggleCollapse={toggleCardCollapse}
        >
          {renderCardContent(cardConfig.id)}
        </MovableCard>
      );
    });
  };

  if (loading) {
    return (
      <div className="sc-app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 'var(--sc-fs-lg)', color: 'var(--sc-text-muted)' }}>
          Loading SparkleChase...
        </div>
      </div>
    );
  }

  return (
    <div className="sc-app">
      {/* Header */}
      <header className="sc-header">
        <div className="sc-title">
          <span className="sparkle">✦</span>SparkleChase
        </div>
        <div className="actions">
          {/* Global Hotkeys Status */}
          <div className={`sc-status ${globalHotkeysEnabled ? 'sc-status--active' : 'sc-status--inactive'}`}>
            <span>Global Hotkeys: {globalHotkeysEnabled ? 'ON' : 'OFF'}</span>
          </div>
          
          <button
            onClick={async () => {
              const enabled = await window.electronAPI.toggleGlobalHotkeys();
              setGlobalHotkeysEnabled(enabled);
            }}
            className={`sc-btn ${globalHotkeysEnabled ? 'sc-btn--primary' : 'sc-btn--ghost'}`}
          >
            {globalHotkeysEnabled ? 'Disable' : 'Enable'} Global
          </button>
          
          <button
            onClick={() => window.electronAPI.toggleOverlay()}
            className="sc-btn"
          >
            Overlay
          </button>
          
          <button
            onClick={toggleTheme}
            className="sc-btn sc-btn--ghost"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <button
            onClick={() => setShowSettingsDialog(true)}
            className="sc-btn"
          >
            Settings
          </button>
        </div>
      </header>

      <main className="sc-main">
        {/* Left Side - Movable Cards */}
        <div className="sc-content">
          {/* Counter - Always in center/main area */}
          {activeHunt ? (
            <Counter
              hunt={activeHunt}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onSetCount={handleSetCount}
              onPhase={() => setShowPhaseDialog(true)}
            />
          ) : (
            <div className="sc-card" style={{ textAlign: 'center', padding: 'var(--sc-space-8)' }}>
              <div className="sc-card__title">No Active Hunt</div>
              <p className="u-muted">Create a new hunt to get started</p>
            </div>
          )}
          
          {/* Left Side Cards */}
          <div className="sc-cards-container" style={{ marginTop: 'var(--sc-space-4)' }}>
            {renderCards('left')}
          </div>
        </div>

        {/* Right Side - Movable Cards */}
        <aside className="sc-sidebar">
          <div className="sc-cards-container">
            {renderCards('right')}
          </div>
        </aside>
      </main>

      {/* Dialogs */}
      {showPhaseDialog && activeHunt && (
        <PhaseDialog
          onPhase={handlePhase}
          onClose={() => setShowPhaseDialog(false)}
        />
      )}

      {showSettingsDialog && settings && (
        <SettingsDialog
          settings={settings}
          onUpdate={handleUpdateSettings}
          onClose={() => setShowSettingsDialog(false)}
        />
      )}

      {/* Diagnostics Panel */}
      <DiagnosticsPanel />
    </div>
  );
}

export default App;