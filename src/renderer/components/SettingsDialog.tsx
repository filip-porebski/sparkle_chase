import React, { useEffect, useMemo, useState } from 'react';
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
  const [captureTarget, setCaptureTarget] = useState<keyof Settings['hotkeys'] | null>(null);
  const capturing = useMemo(() => captureTarget !== null, [captureTarget]);

  // Keep local copy in sync if settings prop changes (e.g., theme toggle elsewhere)
  useEffect(() => setLocalSettings(settings), [settings]);

  useEffect(() => {
    if (!captureTarget) return;

    // Suppress app hotkeys while capturing
    window.electronAPI.setTypingActive(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push('CommandOrControl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');

      let key = e.key;
      if (key === ' ') key = 'Space';
      if (key.length === 1) key = key.toUpperCase();
      parts.push(key);

      const accelerator = parts.join('+');
      setLocalSettings(prev => ({
        ...prev,
        hotkeys: { ...prev.hotkeys, [captureTarget]: accelerator }
      }));

      setCaptureTarget(null);
      window.electronAPI.setTypingActive(false);
    };

    window.addEventListener('keydown', handleKeyDown, { once: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.electronAPI.setTypingActive(false);
    };
  }, [captureTarget]);

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
      <div className="sc-modal" style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="sc-card__title" style={{ marginBottom: 'var(--sc-space-4)' }}>Settings</div>
        
        <div className="u-col" style={{ overflowY: 'auto' }}>
          {/* Date & Time */}
          <div>
            <label className="sc-label">Date & Time</label>
            <div className="u-row" style={{ gap: 'var(--sc-space-3)' }}>
              <div style={{ flex: 1 }}>
                <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Date Format</label>
                <select
                  value={localSettings.dateFormat}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, dateFormat: e.target.value as any }))}
                  className="sc-input"
                >
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Time Format</label>
                <select
                  value={localSettings.timeFormat}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, timeFormat: e.target.value as any }))}
                  className="sc-input"
                >
                  <option value="24h">24-hour</option>
                  <option value="12h">12-hour (AM/PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Number Formatting */}
          <div>
            <label className="sc-label">Number Formatting</label>
            <div className="u-row" style={{ gap: 'var(--sc-space-3)' }}>
              <div style={{ flex: 1 }}>
                <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Thousands Separator</label>
                <select
                  value={localSettings.numberSeparator}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, numberSeparator: e.target.value as any }))}
                  className="sc-input"
                >
                  <option value="comma">1,234</option>
                  <option value="dot">1.234</option>
                  <option value="thin">1 234 (thin space)</option>
                </select>
              </div>
            </div>
          </div>
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
                  <div className="u-row" style={{ gap: 'var(--sc-space-1)' }}>
                    <input
                      type="text"
                      value={
                        captureTarget === 'increment'
                          ? 'Press shortcut...'
                          : localSettings.hotkeys.increment
                      }
                      readOnly
                      className="sc-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => setCaptureTarget('increment')}
                      className={`sc-btn ${capturing && captureTarget==='increment' ? 'sc-btn--primary' : 'sc-btn--ghost'}`}
                      title="Register hotkey"
                    >
                      {capturing && captureTarget==='increment' ? 'Listening…' : '⌨️'}
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Decrement</label>
                  <div className="u-row" style={{ gap: 'var(--sc-space-1)' }}>
                    <input
                      type="text"
                      value={
                        captureTarget === 'decrement'
                          ? 'Press shortcut...'
                          : localSettings.hotkeys.decrement
                      }
                      readOnly
                      className="sc-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => setCaptureTarget('decrement')}
                      className={`sc-btn ${capturing && captureTarget==='decrement' ? 'sc-btn--primary' : 'sc-btn--ghost'}`}
                      title="Register hotkey"
                    >
                      {capturing && captureTarget==='decrement' ? 'Listening…' : '⌨️'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="u-row">
                <div style={{ flex: 1 }}>
                  <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Phase</label>
                  <div className="u-row" style={{ gap: 'var(--sc-space-1)' }}>
                    <input
                      type="text"
                      value={
                        captureTarget === 'phase'
                          ? 'Press shortcut...'
                          : localSettings.hotkeys.phase
                      }
                      readOnly
                      className="sc-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => setCaptureTarget('phase')}
                      className={`sc-btn ${capturing && captureTarget==='phase' ? 'sc-btn--primary' : 'sc-btn--ghost'}`}
                      title="Register hotkey"
                    >
                      {capturing && captureTarget==='phase' ? 'Listening…' : '⌨️'}
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Toggle Global</label>
                  <div className="u-row" style={{ gap: 'var(--sc-space-1)' }}>
                    <input
                      type="text"
                      value={
                        captureTarget === 'toggleGlobal'
                          ? 'Press shortcut...'
                          : localSettings.hotkeys.toggleGlobal
                      }
                      readOnly
                      className="sc-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => setCaptureTarget('toggleGlobal')}
                      className={`sc-btn ${capturing && captureTarget==='toggleGlobal' ? 'sc-btn--primary' : 'sc-btn--ghost'}`}
                      title="Register hotkey"
                    >
                      {capturing && captureTarget==='toggleGlobal' ? 'Listening…' : '⌨️'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="u-row">
                <div style={{ flex: 1 }}>
                  <label className="sc-label" style={{ fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>Quick Switch</label>
                  <div className="u-row" style={{ gap: 'var(--sc-space-1)' }}>
                    <input
                      type="text"
                      value={
                        captureTarget === 'quickSwitch'
                          ? 'Press shortcut...'
                          : (localSettings.hotkeys.quickSwitch || 'CommandOrControl+K')
                      }
                      readOnly
                      className="sc-input"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => setCaptureTarget('quickSwitch' as any)}
                      className={`sc-btn ${capturing && captureTarget==='quickSwitch' ? 'sc-btn--primary' : 'sc-btn--ghost'}`}
                      title="Register hotkey"
                    >
                      {capturing && captureTarget==='quickSwitch' ? 'Listening…' : '⌨️'}
                    </button>
                  </div>
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
