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
  const [phaseDialogMode, setPhaseDialogMode] = useState<'phase' | 'shiny' | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [globalHotkeysEnabled, setGlobalHotkeysEnabled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showCreateHunt, setShowCreateHunt] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<'left' | 'right' | null>(null);
  const [dragInsertIndex, setDragInsertIndex] = useState<number | null>(null);
  
  // Card layout management
  const { 
    moveCard, 
    moveCardToPosition,
    toggleCardCollapse, 
    getCardsByPosition, 
    getCard 
  } = useCardLayout();

  useEffect(() => {
    loadInitialData();
    
    // Set theme on document
    document.documentElement.setAttribute('data-theme', theme);

    // Typing focus detection: disable local hotkeys while typing in inputs/textareas/contentEditable
    const isTypingElement = (el: Element | null) => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      return (el as HTMLElement).isContentEditable === true;
    };
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as Element | null;
      window.electronAPI.setTypingActive(isTypingElement(target));
    };
    const handleFocusOut = () => {
      const el = document.activeElement as Element | null;
      window.electronAPI.setTypingActive(isTypingElement(el));
    };
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
    // Initialize header state once refs exist
    requestAnimationFrame(() => updateNavScrolled());
    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
    };
  }, []);

  useEffect(() => {
    const cleanup = setupHotkeys();
    return cleanup;
  }, [activeHunt]); // Re-setup hotkeys when activeHunt changes

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Update header style on scroll inside content or sidebar
  const updateNavScrolled = () => {
    const c = contentRef.current?.scrollTop || 0;
    const s = sidebarRef.current?.scrollTop || 0;
    setNavScrolled((c + s) > 0);
  };

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
        setPhaseDialogMode('phase');
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
    if (!activeHunt || activeHunt.archived) return;
    
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
    if (!activeHunt || activeHunt.archived) return;
    
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
    if (!activeHunt || activeHunt.archived) return;
    
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
    if (!activeHunt || activeHunt.archived) return;
    
    try {
      const updatedHunt = await window.electronAPI.addPhase(activeHunt.id, phaseData);
      if (updatedHunt) {
        setActiveHunt(updatedHunt);
        updateHuntInList(updatedHunt);
        // If logging target shiny, auto-archive the hunt
        if (phaseDialogMode === 'shiny') {
          const archived = await window.electronAPI.updateHunt(updatedHunt.id, { archived: true });
          if (archived) {
            updateHuntInList(archived);
            // Select next non-archived hunt if available
            const next = hunts.find(h => h.id !== archived.id && !h.archived) || null;
            setActiveHunt(next);
          }
        }
      }
      setPhaseDialogMode(null);
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
    setHunts(prev => [
      updatedHunt,
      ...prev.filter(h => h.id !== updatedHunt.id)
    ]);
  };

  const handleUnlockHunt = async (huntId: string) => {
    try {
      const updated = await window.electronAPI.updateHunt(huntId, { archived: false });
      if (updated) {
        updateHuntInList(updated);
        if (activeHunt && activeHunt.id === huntId) setActiveHunt(updated);
      }
    } catch (e) {
      console.error('Failed to unlock hunt', e);
    }
  };

  const handleLockHunt = async (huntId: string) => {
    try {
      const updated = await window.electronAPI.updateHunt(huntId, { archived: true });
      if (updated) {
        updateHuntInList(updated);
        if (activeHunt && activeHunt.id === huntId) setActiveHunt(updated);
      }
    } catch (e) {
      console.error('Failed to lock hunt', e);
    }
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
            showCreateForm={showCreateHunt}
            onToggleCreate={() => setShowCreateHunt(prev => !prev)}
            onUnlockHunt={handleUnlockHunt}
            onLockHunt={handleLockHunt}
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
    const items: React.ReactNode[] = [];

    cards.forEach((cardConfig, index) => {
      const card = getCard(cardConfig.id);
      if (!card) return;

      const showBefore = draggingCardId && dragTarget === side && dragInsertIndex === index;
      if (showBefore) {
        items.push(<div key={`ph-${index}`} className="sc-insert-placeholder" />);
      }

      items.push(
        <div
          key={cardConfig.id}
          className="sc-card-dropwrap"
          onDragOver={(e) => {
            if (!draggingCardId) return;
            e.preventDefault();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const mid = rect.top + rect.height / 2;
            const idx = e.clientY < mid ? index : index + 1;
            if (dragTarget !== side) setDragTarget(side);
            if (dragInsertIndex !== idx) setDragInsertIndex(idx);
          }}
        >
          <MovableCard
            id={cardConfig.id}
            title={cardConfig.title}
            currentSide={side}
            isCollapsed={card.isCollapsed}
            onMove={moveCard}
            onToggleCollapse={toggleCardCollapse}
            onDragStartCard={(id) => setDraggingCardId(id)}
            onDragEndCard={() => { setDraggingCardId(null); setDragTarget(null); setDragInsertIndex(null); }}
          >
            {renderCardContent(cardConfig.id)}
          </MovableCard>
        </div>
      );
    });

    if (draggingCardId && dragTarget === side && dragInsertIndex === getCardsByPosition(side).length) {
      items.push(<div key={`ph-end`} className="sc-insert-placeholder" />);
    }

    return items;
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
      <header className={`sc-header ${navScrolled ? 'sc-header--solid' : 'sc-header--clear'}`}>
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

      <main
        className="sc-main"
        onClick={() => {
          if (!phaseDialogMode) {
            setActiveHunt(null);
          }
        }}
      >
        {/* Left Side - Movable Cards */}
        <div className="sc-content" ref={contentRef} onScroll={updateNavScrolled}>
          {/* Counter - Always in center/main area */}
          {activeHunt ? (
            <Counter
              hunt={activeHunt}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onSetCount={handleSetCount}
              onLogPhase={() => setPhaseDialogMode('phase')}
              onLogShiny={() => setPhaseDialogMode('shiny')}
            />
          ) : (
            <div className="sc-card" style={{ textAlign: 'center', padding: 'var(--sc-space-8)' }}>
              <div className="sc-card__title">No Active Hunt</div>
              <p className="u-muted">Create a new hunt to get started</p>
            </div>
          )}
          
          {/* Left Side Cards */}
          <div
            className="sc-cards-container sc-dropzone"
            style={{ marginTop: 'var(--sc-space-4)', position: 'relative' }}
            onDragOver={(e) => {
              if (!draggingCardId) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragTarget !== 'left') setDragTarget('left');
              if (dragInsertIndex == null) setDragInsertIndex(getCardsByPosition('left').length);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggingCardId) {
                const index = dragInsertIndex ?? getCardsByPosition('left').length;
                moveCardToPosition(draggingCardId, 'left', index);
              }
              setDraggingCardId(null);
              setDragTarget(null);
              setDragInsertIndex(null);
            }}
            onDragLeave={(e) => {
              const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const { clientX: x, clientY: y } = e as unknown as MouseEvent;
              if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) {
                if (dragTarget === 'left') { setDragTarget(null); setDragInsertIndex(null); }
              }
            }}
          >
            {renderCards('left')}
          </div>
        </div>

        {/* Right Side - Movable Cards */}
        <aside className="sc-sidebar" ref={sidebarRef} onScroll={updateNavScrolled}>
          <div
            className="sc-cards-container sc-dropzone"
            style={{ position: 'relative' }}
            onDragOver={(e) => {
              if (!draggingCardId) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragTarget !== 'right') setDragTarget('right');
              if (dragInsertIndex == null) setDragInsertIndex(getCardsByPosition('right').length);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggingCardId) {
                const index = dragInsertIndex ?? getCardsByPosition('right').length;
                moveCardToPosition(draggingCardId, 'right', index);
              }
              setDraggingCardId(null);
              setDragTarget(null);
              setDragInsertIndex(null);
            }}
            onDragLeave={(e) => {
              const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const { clientX: x, clientY: y } = e as unknown as MouseEvent;
              if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) {
                if (dragTarget === 'right') { setDragTarget(null); setDragInsertIndex(null); }
              }
            }}
          >
            {renderCards('right')}
          </div>
        </aside>
      </main>

      {/* Dialogs */}
      {phaseDialogMode && activeHunt && (
        <PhaseDialog
          mode={phaseDialogMode}
          targetSpecies={activeHunt.targetSpecies}
          onPhase={handlePhase}
          onClose={() => setPhaseDialogMode(null)}
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
