import { BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import { Hunt } from '../../shared/types';

export class OverlayManager {
  private overlayWindow: BrowserWindow | null = null;
  private isVisible = false;
  private isDragging = false;
  private clickThrough = true;

  constructor() {
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('overlay:startDrag', () => this.startDrag());
    ipcMain.handle('overlay:stopDrag', () => this.stopDrag());
    ipcMain.handle('overlay:toggleClickThrough', () => this.toggleClickThrough());
    ipcMain.handle('overlay:updateNow', (_evt, hunt: Hunt) => {
      this.sendUpdate(hunt);
      return true;
    });
    ipcMain.handle('overlay:isVisible', () => this.isVisible);
  }

  show(): void {
    if (!this.overlayWindow) {
      this.createOverlayWindow();
    }
    
    if (this.overlayWindow && !this.isVisible) {
      this.overlayWindow.show();
      this.isVisible = true;
    }
  }

  hide(): void {
    if (this.overlayWindow && this.isVisible) {
      this.overlayWindow.hide();
      this.isVisible = false;
    }
  }

  toggle(): boolean {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
    return this.isVisible;
  }

  updateOverlay(hunt: Hunt): void {
    this.sendUpdate(hunt);
  }

  private createOverlayWindow(): void {
    this.overlayWindow = new BrowserWindow({
      width: 300,
      height: 150,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      transparent: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/overlay-preload.js'),
        devTools: process.env.NODE_ENV === 'development',
        webSecurity: true
      },
      show: false
    });

    // Set initial click-through state
    this.updateClickThrough();

    // Load overlay content
    if (process.env.NODE_ENV === 'development') {
      this.overlayWindow.loadURL('http://localhost:5173/overlay.html');
    } else {
      this.overlayWindow.loadFile(path.join(__dirname, '../renderer/overlay.html'));
    }

    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null;
      this.isVisible = false;
    });

    // Position overlay in top-right corner
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    this.overlayWindow.setPosition(width - 320, 20);

    // Make overlay draggable when not in click-through mode
    this.setupDragHandlers();
  }

  private sendUpdate(hunt: Hunt): void {
    if (this.overlayWindow && this.isVisible && hunt) {
      this.overlayWindow.webContents.send('overlay:update', hunt);
    }
  }

  private setupDragHandlers(): void {
    if (!this.overlayWindow) return;

    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    this.overlayWindow.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'mouseDown' && input.button === 'left' && !this.clickThrough) {
        isDragging = true;
        const bounds = this.overlayWindow!.getBounds();
        dragOffset.x = input.x;
        dragOffset.y = input.y;
      }
    });

    this.overlayWindow.on('move', () => {
      if (isDragging && !this.clickThrough) {
        // Allow dragging
      }
    });
  }

  private updateClickThrough(): void {
    if (this.overlayWindow) {
      this.overlayWindow.setIgnoreMouseEvents(this.clickThrough, { forward: true });
    }
  }

  private startDrag(): void {
    this.isDragging = true;
    if (this.overlayWindow) {
      this.overlayWindow.setIgnoreMouseEvents(false);
    }
  }

  private stopDrag(): void {
    this.isDragging = false;
    this.updateClickThrough();
  }

  private toggleClickThrough(): boolean {
    this.clickThrough = !this.clickThrough;
    this.updateClickThrough();
    return this.clickThrough;
  }

  destroy(): void {
    if (this.overlayWindow) {
      this.overlayWindow.close();
      this.overlayWindow = null;
      this.isVisible = false;
    }
  }
}
