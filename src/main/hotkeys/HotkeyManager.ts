import { globalShortcut, app } from 'electron';

export class HotkeyManager {
  private globalHotkeysEnabled = false;
  private registeredHotkeys = new Map<string, () => void>();
  private safeModeApps: string[] = ['Photoshop.exe', 'Premiere.exe', 'obs64.exe', 'obs.exe'];
  private checkInterval: NodeJS.Timeout | null = null;

  registerHotkey(accelerator: string, callback: () => void): boolean {
    try {
      this.registeredHotkeys.set(accelerator, callback);
      
      if (this.globalHotkeysEnabled) {
        return globalShortcut.register(accelerator, callback);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to register hotkey ${accelerator}:`, error);
      return false;
    }
  }

  unregisterHotkey(accelerator: string): void {
    this.registeredHotkeys.delete(accelerator);
    
    if (this.globalHotkeysEnabled) {
      globalShortcut.unregister(accelerator);
    }
  }

  toggleGlobal(): boolean {
    this.globalHotkeysEnabled = !this.globalHotkeysEnabled;
    
    if (this.globalHotkeysEnabled) {
      this.enableGlobalHotkeys();
      this.startSafeModeMonitoring();
    } else {
      this.disableGlobalHotkeys();
      this.stopSafeModeMonitoring();
    }
    
    return this.globalHotkeysEnabled;
  }

  private enableGlobalHotkeys(): void {
    // Register all hotkeys globally
    for (const [accelerator, callback] of this.registeredHotkeys) {
      try {
        const success = globalShortcut.register(accelerator, () => {
          // Check if we're in safe mode before executing callback
          if (!this.isInSafeMode()) {
            callback();
          }
        });
        
        if (!success) {
          console.warn(`Failed to register global hotkey: ${accelerator}`);
        }
      } catch (error) {
        console.error(`Error registering global hotkey ${accelerator}:`, error);
      }
    }
  }

  private disableGlobalHotkeys(): void {
    globalShortcut.unregisterAll();
  }

  private startSafeModeMonitoring(): void {
    // Check every 2 seconds if we're in safe mode
    this.checkInterval = setInterval(() => {
      this.checkSafeMode();
    }, 2000);
  }

  private stopSafeModeMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkSafeMode(): Promise<void> {
    const inSafeMode = await this.isInSafeMode();
    
    if (inSafeMode && this.globalHotkeysEnabled) {
      // Temporarily disable hotkeys
      this.disableGlobalHotkeys();
      console.log('Safe mode detected - hotkeys temporarily disabled');
    } else if (!inSafeMode && this.globalHotkeysEnabled && !globalShortcut.isRegistered('Space')) {
      // Re-enable hotkeys if they were disabled
      this.enableGlobalHotkeys();
      console.log('Safe mode cleared - hotkeys re-enabled');
    }
  }

  private async isInSafeMode(): Promise<boolean> {
    try {
      // Use different methods based on platform
      if (process.platform === 'win32') {
        return await this.checkWindowsActiveWindow();
      } else if (process.platform === 'darwin') {
        return await this.checkMacActiveWindow();
      }
      return false;
    } catch (error) {
      console.error('Error checking safe mode:', error);
      return false;
    }
  }

  private async checkWindowsActiveWindow(): Promise<boolean> {
    try {
      const { exec } = require('child_process');
      return new Promise((resolve) => {
        exec('powershell "Get-Process | Where-Object {$_.MainWindowTitle -ne \"\"} | Select-Object ProcessName"', 
          (error: any, stdout: string) => {
            if (error) {
              resolve(false);
              return;
            }
            
            const activeProcesses = stdout.toLowerCase();
            const isSafeMode = this.safeModeApps.some(app => 
              activeProcesses.includes(app.toLowerCase().replace('.exe', ''))
            );
            resolve(isSafeMode);
          }
        );
      });
    } catch {
      return false;
    }
  }

  private async checkMacActiveWindow(): Promise<boolean> {
    try {
      const { exec } = require('child_process');
      return new Promise((resolve) => {
        exec('osascript -e "tell application \\"System Events\\" to get name of first application process whose frontmost is true"',
          (error: any, stdout: string) => {
            if (error) {
              resolve(false);
              return;
            }
            
            const activeApp = stdout.trim().toLowerCase();
            const isSafeMode = this.safeModeApps.some(app => 
              activeApp.includes(app.toLowerCase().replace('.exe', ''))
            );
            resolve(isSafeMode);
          }
        );
      });
    } catch {
      return false;
    }
  }

  setSafeModeApps(apps: string[]): void {
    this.safeModeApps = apps;
  }

  isGlobalEnabled(): boolean {
    return this.globalHotkeysEnabled;
  }

  unregisterAll(): void {
    this.registeredHotkeys.clear();
    this.stopSafeModeMonitoring();
    globalShortcut.unregisterAll();
    this.globalHotkeysEnabled = false;
  }
}