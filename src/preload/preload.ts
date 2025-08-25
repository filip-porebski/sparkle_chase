import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Hunt management
  createHunt: (huntData: any) => ipcRenderer.invoke('hunt:create', huntData),
  getHunt: (huntId: string) => ipcRenderer.invoke('hunt:get', huntId),
  updateHunt: (huntId: string, updates: any) => ipcRenderer.invoke('hunt:update', huntId, updates),
  deleteHunt: (huntId: string) => ipcRenderer.invoke('hunt:delete', huntId),
  listHunts: () => ipcRenderer.invoke('hunt:list'),

  // Counter operations
  incrementCounter: (huntId: string) => ipcRenderer.invoke('counter:increment', huntId),
  decrementCounter: (huntId: string) => ipcRenderer.invoke('counter:decrement', huntId),
  setCounter: (huntId: string, count: number) => ipcRenderer.invoke('counter:setCount', huntId, count),

  // Phase operations
  addPhase: (huntId: string, phaseData: any) => ipcRenderer.invoke('phase:add', huntId, phaseData),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (updates: any) => ipcRenderer.invoke('settings:update', updates),

  // File operations
  selectFolder: () => ipcRenderer.invoke('file:selectFolder'),
  exportData: (data: any) => ipcRenderer.invoke('file:export', data),
  importData: () => ipcRenderer.invoke('file:import'),

  // Overlay management
  toggleOverlay: () => ipcRenderer.invoke('overlay:toggle'),
  showOverlay: () => ipcRenderer.invoke('overlay:show'),
  hideOverlay: () => ipcRenderer.invoke('overlay:hide'),

  // Hotkey management
  toggleGlobalHotkeys: () => ipcRenderer.invoke('hotkey:toggleGlobal'),

  // Diagnostic and testing
  testDataIntegrity: () => ipcRenderer.invoke('diagnostic:testDataIntegrity'),
  createEmergencyBackup: () => ipcRenderer.invoke('diagnostic:createBackup'),
  getDataDirectory: () => ipcRenderer.invoke('diagnostic:getDataDirectory'),
  validateOBSFolder: (folderPath: string) => ipcRenderer.invoke('diagnostic:validateOBSFolder', folderPath),

  // Event listeners
  onHotkeyIncrement: (callback: () => void) => {
    ipcRenderer.on('hotkey:increment', callback);
    return () => ipcRenderer.removeListener('hotkey:increment', callback);
  },
  onHotkeyDecrement: (callback: () => void) => {
    ipcRenderer.on('hotkey:decrement', callback);
    return () => ipcRenderer.removeListener('hotkey:decrement', callback);
  },
  onHotkeyPhase: (callback: () => void) => {
    ipcRenderer.on('hotkey:phase', callback);
    return () => ipcRenderer.removeListener('hotkey:phase', callback);
  },
  onGlobalHotkeyToggled: (callback: (enabled: boolean) => void) => {
    ipcRenderer.on('hotkey:globalToggled', (_, enabled) => callback(enabled));
    return () => ipcRenderer.removeListener('hotkey:globalToggled', callback);
  }
});

// Type definitions for the exposed API
export interface ElectronAPI {
  createHunt: (huntData: any) => Promise<any>;
  getHunt: (huntId: string) => Promise<any>;
  updateHunt: (huntId: string, updates: any) => Promise<any>;
  deleteHunt: (huntId: string) => Promise<boolean>;
  listHunts: () => Promise<any[]>;
  incrementCounter: (huntId: string) => Promise<any>;
  decrementCounter: (huntId: string) => Promise<any>;
  setCounter: (huntId: string, count: number) => Promise<any>;
  addPhase: (huntId: string, phaseData: any) => Promise<any>;
  getSettings: () => Promise<any>;
  updateSettings: (updates: any) => Promise<any>;
  selectFolder: () => Promise<string | null>;
  exportData: (data: any) => Promise<boolean>;
  importData: () => Promise<any>;
  toggleOverlay: () => Promise<boolean>;
  showOverlay: () => Promise<void>;
  hideOverlay: () => Promise<void>;
  toggleGlobalHotkeys: () => Promise<boolean>;
  onHotkeyIncrement: (callback: () => void) => () => void;
  onHotkeyDecrement: (callback: () => void) => () => void;
  onHotkeyPhase: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}