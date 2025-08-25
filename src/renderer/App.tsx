import React, { useState, useEffect } from 'react';
import { Hunt, Settings } from '../shared/types';
import { HuntManager } from './components/HuntManager';
import { Counter } from './components/Counter';
import { PhaseDialog } from './components/PhaseDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { StatsPanel } from './components/StatsPanel';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import './App.css';

function App() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [activeHunt, setActiveHunt] = useState<Hunt | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [globalHotkeysEnabled, setGlobalHotkeysEnabled] = useState(false);

  useEffect(() => {
    loadInitialData();
    setupHotkeys();
  }, []);

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
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading Shiny Counter...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${settings?.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Shiny Counter</h1>
          <div className="flex gap-2 items-center">
            {/* Global Hotkeys Status */}
            <div className={`px-3 py-1 rounded text-sm ${
              globalHotkeysEnabled 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              Global Hotkeys: {globalHotkeysEnabled ? 'ON' : 'OFF'}
            </div>
            
            <button
              onClick={async () => {
                const enabled = await window.electronAPI.toggleGlobalHotkeys();
                setGlobalHotkeysEnabled(enabled);
              }}
              className={`px-4 py-2 text-white rounded transition-colors ${
                globalHotkeysEnabled 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {globalHotkeysEnabled ? 'Disable' : 'Enable'} Global Hotkeys
            </button>
            
            <button
              onClick={() => window.electronAPI.toggleOverlay()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Toggle Overlay
            </button>
            
            <button
              onClick={() => setShowSettingsDialog(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Settings
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hunt Management */}
          <div className="lg:col-span-1">
            <HuntManager
              hunts={hunts}
              activeHunt={activeHunt}
              onCreateHunt={handleCreateHunt}
              onSelectHunt={handleSelectHunt}
              onDeleteHunt={handleDeleteHunt}
            />
          </div>

          {/* Main Counter */}
          <div className="lg:col-span-1">
            {activeHunt ? (
              <Counter
                hunt={activeHunt}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onSetCount={handleSetCount}
                onPhase={() => setShowPhaseDialog(true)}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">No active hunt selected</p>
                <p className="text-sm text-gray-400 mt-2">Create a new hunt to get started</p>
              </div>
            )}
          </div>

          {/* Stats Panel */}
          <div className="lg:col-span-1">
            {activeHunt && <StatsPanel hunt={activeHunt} />}
          </div>
        </div>
      </div>

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