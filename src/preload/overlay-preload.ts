import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods for the overlay window
contextBridge.exposeInMainWorld('overlayAPI', {
  // Listen for overlay updates from main process
  onUpdate: (callback: (hunt: any) => void) => {
    ipcRenderer.on('overlay:update', (_, hunt) => callback(hunt));
    return () => ipcRenderer.removeAllListeners('overlay:update');
  },

  // Allow overlay to be dragged
  startDrag: () => ipcRenderer.invoke('overlay:startDrag'),
  stopDrag: () => ipcRenderer.invoke('overlay:stopDrag'),

  // Toggle click-through mode
  toggleClickThrough: () => ipcRenderer.invoke('overlay:toggleClickThrough')
});

// Type definitions for the exposed API
export interface OverlayAPI {
  onUpdate: (callback: (hunt: any) => void) => () => void;
  startDrag: () => Promise<void>;
  stopDrag: () => Promise<void>;
  toggleClickThrough: () => Promise<boolean>;
}

declare global {
  interface Window {
    overlayAPI: OverlayAPI;
  }
}