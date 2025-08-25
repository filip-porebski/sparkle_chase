import React, { useState } from 'react';
import { Settings } from '../../shared/types';

interface SettingsDialogProps {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  settings,
  onUpdate,
  onClose
}) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);

  const handleSave = () => {
    onUpdate(localSettings);
    onClose();
  };

  const handleSelectFolder = async () => {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
      setLocalSettings(prev => ({ ...prev, obsTextFolder: folder }));
    }
  };

  const toggleGlobalHotkeys = async () => {
    const enabled = await window.electronAPI.toggleGlobalHotkeys();
    setLocalSettings(prev => ({ ...prev, globalHotkeysEnabled: enabled }));
  };

  return (
    <div className="sc-modal-backdrop">
      <div className="sc-modal">
        <div className="sc-card__title" style={{ marginBottom: 'var(--sc-space-4)' }}>Settings</div>
        
        <div className="u-col">
          {/* Theme */}
          <div>
            <label className="sc-label">Theme</label>
            <select
              value={localSettings.theme}
              onChange={(e) => setLocalSettings(prev => ({ 
                ...prev, 
                theme: e.target.value as 'light' | 'dark' 
              }))}
              className="sc-input"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Global Hotkeys */}
          <div>
            <label className="sc-label">Global Hotkeys</label>
            <div className="u-row" style={{ gap: 'var(--sc-space-2)' }}>
              <button
                onClick={toggleGlobalHotkeys}
                className={`sc-btn ${
                  localSettings.globalHotkeysEnabled
                    ? 'sc-btn--primary'
                    : 'sc-btn--ghost'
                }`}
              >
                {localSettings.globalHotkeysEnabled ? 'Enabled' : 'Disabled'}
              </button>
              <span className="u-muted" style={{ fontSize: 'var(--sc-fs-sm)' }}>
                Allow hotkeys to work when app is not focused
              </span>
            </div>
          </div>

          {/* Hotkey Configuration */}
          <div>
            <label className="sc-label">Hotkey Bindings</label>
            <div className="u-col" style={{ gap: 'var(--sc-space-2)' }}>
              <div className="u-row">
                <div style={{ flex: 1 }}>
                  <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Increment</label>
                  <input
                    type="text"
                    value={localSettings.hotkeys.increment}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      hotkeys: { ...prev.hotkeys, increment: e.target.value }
                    }))}
                    className="sc-input"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Decrement</label>
                  <input
                    type="text"
                    value={localSettings.hotkeys.decrement}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      hotkeys: { ...prev.hotkeys, decrement: e.target.value }
                    }))}
                    className="sc-input"
                  />
                </div>
              </div>
              <div className="u-row">
                <div style={{ flex: 1 }}>
                  <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Phase</label>
                  <input
                    type="text"
                    value={localSettings.hotkeys.phase}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      hotkeys: { ...prev.hotkeys, phase: e.target.value }
                    }))}
                    className="sc-input"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Toggle Global</label>
                  <input
                    type="text"
                    value={localSettings.hotkeys.toggleGlobal}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      hotkeys: { ...prev.hotkeys, toggleGlobal: e.target.value }
                    }))}
                    className="sc-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* OBS Text Files */}
          <div>
            <label className="sc-label">OBS Text Files Output</label>
            <div className="u-row">
              <input
                type="text"
                value={localSettings.obsTextFolder}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  obsTextFolder: e.target.value 
                }))}
                className="sc-input"
                style={{ flex: 1 }}
                placeholder="Select folder for count.txt, target.txt, phase.txt"
              />
              <button
                onClick={handleSelectFolder}
                className="sc-btn sc-btn--primary"
              >
                Browse
              </button>
            </div>
            <p className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)', marginTop: 'var(--sc-space-1)' }}>
              Files will be created: count.txt, target.txt, phase.txt
            </p>
          </div>

          {/* Overlay Settings */}
          <div>
            <label className="sc-label">Overlay Settings</label>
            <div className="u-col" style={{ gap: 'var(--sc-space-2)' }}>
              <div className="u-row" style={{ gap: 'var(--sc-space-2)' }}>
                <input
                  type="checkbox"
                  checked={localSettings.overlay.alwaysOnTop}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    overlay: { ...prev.overlay, alwaysOnTop: e.target.checked }
                  }))}
                  style={{ accentColor: 'var(--sc-brand)' }}
                />
                <span style={{ fontSize: 'var(--sc-fs-sm)' }}>Always on top</span>
              </div>
              
              <div className="u-row" style={{ gap: 'var(--sc-space-2)' }}>
                <input
                  type="checkbox"
                  checked={localSettings.overlay.clickThrough}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    overlay: { ...prev.overlay, clickThrough: e.target.checked }
                  }))}
                  style={{ accentColor: 'var(--sc-brand)' }}
                />
                <span style={{ fontSize: 'var(--sc-fs-sm)' }}>Click through</span>
              </div>
              
              <div>
                <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Variant</label>
                <select
                  value={localSettings.overlay.variant}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    overlay: { ...prev.overlay, variant: e.target.value as any }
                  }))}
                  className="sc-input"
                >
                  <option value="badge">Badge</option>
                  <option value="compact">Compact</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>
          </div>

          {/* Safe Mode Apps */}
          <div>
            <label className="sc-label">Safe Mode Apps</label>
            <textarea
              value={localSettings.safeModeApps.join('\n')}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                safeModeApps: e.target.value.split('\n').filter(app => app.trim())
              }))}
              className="sc-input"
              placeholder="Photoshop.exe&#10;Premiere.exe"
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
            <p className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)', marginTop: 'var(--sc-space-1)' }}>
              Global hotkeys will be disabled when these apps are focused (one per line)
            </p>
          </div>
        </div>

        <div className="u-row" style={{ 
          gap: 'var(--sc-space-3)', 
          paddingTop: 'var(--sc-space-5)', 
          borderTop: '1px solid var(--sc-border)' 
        }}>
          <button
            onClick={handleSave}
            className="sc-btn sc-btn--primary"
            style={{ flex: 1 }}
          >
            Save Settings
          </button>
          <button
            onClick={onClose}
            className="sc-btn sc-btn--ghost"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};