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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={localSettings.theme}
              onChange={(e) => setLocalSettings(prev => ({ 
                ...prev, 
                theme: e.target.value as 'light' | 'dark' 
              }))}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Global Hotkeys */}
          <div>
            <label className="block text-sm font-medium mb-2">Global Hotkeys</label>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleGlobalHotkeys}
                className={`px-4 py-2 rounded transition-colors ${
                  localSettings.globalHotkeysEnabled
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {localSettings.globalHotkeysEnabled ? 'Enabled' : 'Disabled'}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Allow hotkeys to work when app is not focused
              </span>
            </div>
          </div>

          {/* Hotkey Configuration */}
          <div>
            <label className="block text-sm font-medium mb-2">Hotkey Bindings</label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400">Increment</label>
                  <input
                    type="text"
                    value={localSettings.hotkeys.increment}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      hotkeys: { ...prev.hotkeys, increment: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400">Decrement</label>
                  <input
                    type="text"
                    value={localSettings.hotkeys.decrement}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      hotkeys: { ...prev.hotkeys, decrement: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400">Phase</label>
                  <input
                    type="text"
                    value={localSettings.hotkeys.phase}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      hotkeys: { ...prev.hotkeys, phase: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400">Toggle Global</label>
                  <input
                    type="text"
                    value={localSettings.hotkeys.toggleGlobal}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      hotkeys: { ...prev.hotkeys, toggleGlobal: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* OBS Text Files */}
          <div>
            <label className="block text-sm font-medium mb-2">OBS Text Files Output</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localSettings.obsTextFolder}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  obsTextFolder: e.target.value 
                }))}
                className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="Select folder for count.txt, target.txt, phase.txt"
              />
              <button
                onClick={handleSelectFolder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Browse
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Files will be created: count.txt, target.txt, phase.txt
            </p>
          </div>

          {/* Overlay Settings */}
          <div>
            <label className="block text-sm font-medium mb-2">Overlay Settings</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localSettings.overlay.alwaysOnTop}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    overlay: { ...prev.overlay, alwaysOnTop: e.target.checked }
                  }))}
                />
                <span className="text-sm">Always on top</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localSettings.overlay.clickThrough}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    overlay: { ...prev.overlay, clickThrough: e.target.checked }
                  }))}
                />
                <span className="text-sm">Click through</span>
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400">Variant</label>
                <select
                  value={localSettings.overlay.variant}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    overlay: { ...prev.overlay, variant: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
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
            <label className="block text-sm font-medium mb-2">Safe Mode Apps</label>
            <textarea
              value={localSettings.safeModeApps.join('\n')}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                safeModeApps: e.target.value.split('\n').filter(app => app.trim())
              }))}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Photoshop.exe&#10;Premiere.exe"
              rows={3}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Global hotkeys will be disabled when these apps are focused (one per line)
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            Save Settings
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};