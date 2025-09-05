import { contextBridge, ipcRenderer } from 'electron';
import type { Hunt, HuntData, Settings } from '../shared/types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Hunt management
  createHunt: (huntData: HuntData) => ipcRenderer.invoke('hunt:create', huntData) as Promise<Hunt>,
  getHunt: (huntId: string) => ipcRenderer.invoke('hunt:get', huntId) as Promise<Hunt | null>,
  updateHunt: (huntId: string, updates: Partial<Hunt>) => ipcRenderer.invoke('hunt:update', huntId, updates) as Promise<Hunt | null>,
  deleteHunt: (huntId: string) => ipcRenderer.invoke('hunt:delete', huntId),
  listHunts: () => ipcRenderer.invoke('hunt:list') as Promise<Hunt[]>,

  // Counter operations
  incrementCounter: (huntId: string) => ipcRenderer.invoke('counter:increment', huntId) as Promise<Hunt | null>,
  decrementCounter: (huntId: string) => ipcRenderer.invoke('counter:decrement', huntId) as Promise<Hunt | null>,
  setCounter: (huntId: string, count: number) => ipcRenderer.invoke('counter:setCount', huntId, count) as Promise<Hunt | null>,

  // Phase operations
  addPhase: (huntId: string, phaseData: { species: string; isTarget: boolean; notes?: string }) => ipcRenderer.invoke('phase:add', huntId, phaseData) as Promise<Hunt | null>,
  deletePhase: (huntId: string, phaseId: string) => ipcRenderer.invoke('phase:delete', huntId, phaseId) as Promise<Hunt | null>,

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<Settings>,
  updateSettings: (updates: Partial<Settings>) => ipcRenderer.invoke('settings:update', updates) as Promise<Settings>,

  // File operations
  selectFolder: () => ipcRenderer.invoke('file:selectFolder'),
  exportData: (data: any) => ipcRenderer.invoke('file:export', data),
  importData: () => ipcRenderer.invoke('file:import'),

  // Overlay management
  toggleOverlay: () => ipcRenderer.invoke('overlay:toggle'),
  showOverlay: () => ipcRenderer.invoke('overlay:show'),
  hideOverlay: () => ipcRenderer.invoke('overlay:hide'),
  isOverlayVisible: () => ipcRenderer.invoke('overlay:isVisible') as Promise<boolean>,
  updateOverlayNow: (hunt: Hunt) => ipcRenderer.invoke('overlay:updateNow', hunt),

  // Hotkey management
  toggleGlobalHotkeys: () => ipcRenderer.invoke('hotkey:toggleGlobal'),

  // UI typing state (to suppress local hotkeys while typing)
  setTypingActive: (active: boolean) => ipcRenderer.send('ui:typing', active),

  // Diagnostic and testing
  testDataIntegrity: () => ipcRenderer.invoke('diagnostic:testDataIntegrity') as Promise<{ valid: number; corrupted: number; details: any[] }>,
  createEmergencyBackup: () => ipcRenderer.invoke('diagnostic:createBackup') as Promise<string | null>,
  getDataDirectory: () => ipcRenderer.invoke('diagnostic:getDataDirectory') as Promise<string>,
  validateOBSFolder: (folderPath: string) => ipcRenderer.invoke('diagnostic:validateOBSFolder', folderPath) as Promise<{ valid: boolean; error?: string }>,

  // App
  getAppVersion: () => ipcRenderer.invoke('app:getVersion') as Promise<string>,

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
    const handler = (_: unknown, enabled: boolean) => callback(enabled);
    ipcRenderer.on('hotkey:globalToggled', handler);
    return () => ipcRenderer.removeListener('hotkey:globalToggled', handler);
  }
});

// Type definitions for the exposed API
export interface ElectronAPI {
  createHunt: (huntData: HuntData) => Promise<Hunt>;
  getHunt: (huntId: string) => Promise<Hunt | null>;
  updateHunt: (huntId: string, updates: Partial<Hunt>) => Promise<Hunt | null>;
  deleteHunt: (huntId: string) => Promise<boolean>;
  listHunts: () => Promise<Hunt[]>;
  incrementCounter: (huntId: string) => Promise<Hunt | null>;
  decrementCounter: (huntId: string) => Promise<Hunt | null>;
  setCounter: (huntId: string, count: number) => Promise<Hunt | null>;
  addPhase: (huntId: string, phaseData: { species: string; isTarget: boolean; notes?: string }) => Promise<Hunt | null>;
  deletePhase: (huntId: string, phaseId: string) => Promise<Hunt | null>;
  getSettings: () => Promise<Settings>;
  updateSettings: (updates: Partial<Settings>) => Promise<Settings>;
  selectFolder: () => Promise<string | null>;
  exportData: (data: any) => Promise<boolean>;
  importData: () => Promise<any>;
  toggleOverlay: () => Promise<boolean>;
  showOverlay: () => Promise<void>;
  hideOverlay: () => Promise<void>;
  isOverlayVisible: () => Promise<boolean>;
  updateOverlayNow: (hunt: Hunt) => Promise<boolean>;
  toggleGlobalHotkeys: () => Promise<boolean>;
  setTypingActive: (active: boolean) => void;
  testDataIntegrity: () => Promise<{ valid: number; corrupted: number; details: any[] }>;
  createEmergencyBackup: () => Promise<string | null>;
  getDataDirectory: () => Promise<string>;
  validateOBSFolder: (folderPath: string) => Promise<{ valid: boolean; error?: string }>;
  getAppVersion: () => Promise<string>;
  onHotkeyIncrement: (callback: () => void) => () => void;
  onHotkeyDecrement: (callback: () => void) => () => void;
  onHotkeyPhase: (callback: () => void) => () => void;
  onGlobalHotkeyToggled: (callback: (enabled: boolean) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
