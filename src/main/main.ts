import { app, BrowserWindow, globalShortcut, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { DataManager } from './data/DataManager';
import { HotkeyManager } from './hotkeys/HotkeyManager';
import { OverlayManager } from './overlay/OverlayManager';

class ShinyCounterApp {
  private mainWindow: BrowserWindow | null = null;
  private dataManager: DataManager;
  private hotkeyManager: HotkeyManager;
  private overlayManager: OverlayManager;

  constructor() {
    this.dataManager = new DataManager();
    this.hotkeyManager = new HotkeyManager();
    this.overlayManager = new OverlayManager();
  }

  async initialize() {
    await app.whenReady();
    
    // Initialize data manager
    await this.dataManager.initialize();
    
    // Create main window
    this.createMainWindow();
    
    // Setup IPC handlers
    this.setupIpcHandlers();
    
    // Setup hotkeys
    this.setupHotkeys();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('will-quit', () => {
      globalShortcut.unregisterAll();
    });
  }

  private createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/preload.js')
      },
      titleBarStyle: 'default',
      show: false
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupIpcHandlers() {
    // Hunt management
    ipcMain.handle('hunt:create', async (_, huntData) => {
      return await this.dataManager.createHunt(huntData);
    });

    ipcMain.handle('hunt:get', async (_, huntId) => {
      return await this.dataManager.getHunt(huntId);
    });

    ipcMain.handle('hunt:update', async (_, huntId, updates) => {
      return await this.dataManager.updateHunt(huntId, updates);
    });

    ipcMain.handle('hunt:delete', async (_, huntId) => {
      return await this.dataManager.deleteHunt(huntId);
    });

    ipcMain.handle('hunt:list', async () => {
      return await this.dataManager.listHunts();
    });

    // Counter operations
    ipcMain.handle('counter:increment', async (_, huntId) => {
      const hunt = await this.dataManager.incrementCounter(huntId);
      this.overlayManager.updateOverlay(hunt);
      return hunt;
    });

    ipcMain.handle('counter:decrement', async (_, huntId) => {
      const hunt = await this.dataManager.decrementCounter(huntId);
      this.overlayManager.updateOverlay(hunt);
      return hunt;
    });

    ipcMain.handle('counter:setCount', async (_, huntId, count) => {
      const hunt = await this.dataManager.setCounter(huntId, count);
      this.overlayManager.updateOverlay(hunt);
      return hunt;
    });

    // Phase operations
    ipcMain.handle('phase:add', async (_, huntId, phaseData) => {
      return await this.dataManager.addPhase(huntId, phaseData);
    });

    // Settings
    ipcMain.handle('settings:get', async () => {
      return await this.dataManager.getSettings();
    });

    ipcMain.handle('settings:update', async (_, updates) => {
      return await this.dataManager.updateSettings(updates);
    });

    // File operations
    ipcMain.handle('file:selectFolder', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openDirectory']
      });
      return result.canceled ? null : result.filePaths[0];
    });

    ipcMain.handle('file:export', async (_, data) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, {
        filters: [{ name: 'Shiny Counter Data', extensions: ['shiny.json'] }]
      });
      if (!result.canceled && result.filePath) {
        return await this.dataManager.exportData(result.filePath, data);
      }
      return false;
    });

    ipcMain.handle('file:import', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        filters: [{ name: 'Shiny Counter Data', extensions: ['shiny.json'] }],
        properties: ['openFile']
      });
      if (!result.canceled && result.filePaths[0]) {
        return await this.dataManager.importData(result.filePaths[0]);
      }
      return null;
    });

    // Overlay management
    ipcMain.handle('overlay:toggle', async () => {
      return this.overlayManager.toggle();
    });

    ipcMain.handle('overlay:show', async () => {
      return this.overlayManager.show();
    });

    ipcMain.handle('overlay:hide', async () => {
      return this.overlayManager.hide();
    });

    // Hotkey management
    ipcMain.handle('hotkey:toggleGlobal', async () => {
      return this.hotkeyManager.toggleGlobal();
    });

    // Diagnostic and testing
    ipcMain.handle('diagnostic:testDataIntegrity', async () => {
      return await this.dataManager.testDataIntegrity();
    });

    ipcMain.handle('diagnostic:createBackup', async () => {
      return await this.dataManager.createEmergencyBackup();
    });

    ipcMain.handle('diagnostic:getDataDirectory', async () => {
      return await this.dataManager.getDataDirectory();
    });

    ipcMain.handle('diagnostic:validateOBSFolder', async (_, folderPath) => {
      return await this.dataManager.validateOBSFolder(folderPath);
    });
  }

  private async setupHotkeys() {
    // Get settings to configure safe mode apps
    const settings = await this.dataManager.getSettings();
    this.hotkeyManager.setSafeModeApps(settings.safeModeApps);

    // Register default hotkeys
    this.hotkeyManager.registerHotkey('Space', () => {
      this.mainWindow?.webContents.send('hotkey:increment');
    });

    this.hotkeyManager.registerHotkey('CommandOrControl+Z', () => {
      this.mainWindow?.webContents.send('hotkey:decrement');
    });

    this.hotkeyManager.registerHotkey('CommandOrControl+P', () => {
      this.mainWindow?.webContents.send('hotkey:phase');
    });

    this.hotkeyManager.registerHotkey('CommandOrControl+Shift+G', () => {
      const enabled = this.hotkeyManager.toggleGlobal();
      this.mainWindow?.webContents.send('hotkey:globalToggled', enabled);
    });

    // Enable global hotkeys if they were previously enabled
    if (settings.globalHotkeysEnabled) {
      this.hotkeyManager.toggleGlobal();
    }
  }
}

// Initialize the app
const shinyCounterApp = new ShinyCounterApp();
shinyCounterApp.initialize().catch(console.error);