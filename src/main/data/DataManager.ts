import * as fs from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';
import { Hunt, Phase, Settings, HuntData } from '../../shared/types';
import { formatNumber } from '../../shared/format';
import { CrashRecovery } from '../utils/CrashRecovery';

export class DataManager {
  private dataDir: string = '';
  private huntsDir: string;
  private configDir: string;
  private snapshotsDir: string;
  private settings: Settings | null = null;
  private crashRecovery: CrashRecovery;

  constructor() {
    // Directories are resolved during initialize based on settings/detection
    this.huntsDir = '';
    this.configDir = '';
    this.snapshotsDir = '';
    this.crashRecovery = new CrashRecovery('');
  }


  async initialize(): Promise<void> {
    // Resolve storage root
    await this.resolveStorageRoot();

    // Create directories if they don't exist
    await this.ensureDirectories();
    
    // Check for corrupted files and attempt recovery
    const recoveryResult = await this.crashRecovery.checkForCorruptedFiles();
    if (recoveryResult.corrupted.length > 0) {
      console.log(`Crash recovery: ${recoveryResult.recovered.length}/${recoveryResult.corrupted.length} files recovered`);
    }
    
    // Load settings
    await this.loadSettings();
    // Persist detected mode for visibility
    if (!this.settings?.storageMode) {
      await this.updateSettings({ storageMode: this.isPortablePath(this.dataDir) ? 'portable' : 'userData' });
    }
  }

  private async resolveStorageRoot(): Promise<void> {
    const appDir = path.dirname(app.getAppPath());
    const portableDir = path.join(appDir, 'out');
    const userDir = app.getPath('userData');

    const portableSettings = path.join(portableDir, 'config', 'settings.json');
    const userSettings = path.join(userDir, 'config', 'settings.json');
    const envPortable = process.env.SPARKLECHASE_PORTABLE === '1' || process.env.SPARKLECHASE_PORTABLE === 'true';

    let usePortable = envPortable;
    if (!usePortable) {
      try { await fs.access(portableSettings); usePortable = true; } catch {}
    }
    if (!usePortable) {
      try { await fs.access(userSettings); usePortable = false; } catch {}
    }

    this.dataDir = usePortable ? portableDir : userDir;
    this.huntsDir = path.join(this.dataDir, 'hunts');
    this.configDir = path.join(this.dataDir, 'config');
    this.snapshotsDir = path.join(this.dataDir, 'snapshots');
    this.crashRecovery = new CrashRecovery(this.dataDir);
  }

  private isPortablePath(p: string): boolean {
    const appDir = path.dirname(app.getAppPath());
    return p.startsWith(path.join(appDir, 'out'));
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [this.dataDir, this.huntsDir, this.configDir, this.snapshotsDir];
    
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  private async loadSettings(): Promise<void> {
    const settingsPath = path.join(this.configDir, 'settings.json');
    
    try {
      const data = await fs.readFile(settingsPath, 'utf-8');
      this.settings = JSON.parse(data);
    } catch {
      // Create default settings
      this.settings = this.getDefaultSettings();
      await this.saveSettings();
    }
  }

  private getDefaultSettings(): Settings {
    const inferTime12h = (() => {
      try {
        const dtf = new Intl.DateTimeFormat(undefined, { hour: 'numeric' });
        const opts = (dtf as any)?.resolvedOptions?.();
        if (opts && typeof opts.hour12 === 'boolean') return opts.hour12 as boolean;
        return /[AP]M/i.test(new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(new Date()));
      } catch { return false; }
    })();

    const inferDate = (() => {
      try {
        const d = new Date(2020, 10, 7); // 7 Nov 2020
        const s = new Intl.DateTimeFormat(undefined).format(d);
        if (s.includes('-')) return 'YYYY-MM-DD';
        if (/\d{1,2}\.\d{1,2}\.\d{4}/.test(s)) return 'DD.MM.YYYY';
        if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(s)) {
          // detect whether MM/DD or DD/MM
          const parts = s.split('/').map(p => parseInt(p, 10));
          // If first part > 12, it's DD/MM
          return parts[0] > 12 ? 'DD/MM/YYYY' : 'MM/DD/YYYY';
        }
        if (/[A-Za-z]{3}/.test(s)) return 'DD-MMM-YYYY';
      } catch {}
      return 'YYYY-MM-DD';
    })();

    // Infer thousands separator
    const sep = (() => {
      try {
        const s = (1000).toLocaleString();
        if (s.includes(',')) return 'comma';
        if (s.includes('.')) return 'dot';
        return 'thin';
      } catch { return 'comma'; }
    })();

    return {
      theme: 'dark',
      dateFormat: inferDate as any,
      timeFormat: inferTime12h ? '12h' : '24h',
      numberSeparator: sep as any,
      cloudSync: { provider: 'none', status: 'disconnected', note: 'Design preview only (not yet functional).'},
      overlay: {
        variant: 'badge',
        clickThrough: true,
        alwaysOnTop: true,
        enabled: false
      },
      hotkeys: {
        increment: 'Space',
        decrement: 'CommandOrControl+Z',
        phase: 'CommandOrControl+P',
        toggleGlobal: 'CommandOrControl+Shift+G',
        quickSwitch: 'CommandOrControl+K'
      },
      obsTextFolder: '',
      safeModeApps: ['Photoshop.exe', 'Premiere.exe'],
      globalHotkeysEnabled: false
    };
  }

  private async saveSettings(): Promise<void> {
    const settingsPath = path.join(this.configDir, 'settings.json');
    await fs.writeFile(settingsPath, JSON.stringify(this.settings, null, 2));
  }

  async getSettings(): Promise<Settings> {
    return this.settings!;
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    // Handle storage mode migration if requested
    const currentMode = this.settings?.storageMode || (this.isPortablePath(this.dataDir) ? 'portable' : 'userData');
    const nextMode = updates.storageMode || currentMode;

    if (nextMode !== currentMode) {
      const appDir = path.dirname(app.getAppPath());
      const targetRoot = nextMode === 'portable' ? path.join(appDir, 'out') : app.getPath('userData');
      await fs.mkdir(targetRoot, { recursive: true });
      // Copy content into target (Node 18+ has fs.cp)
      try {
        await fs.cp(this.dataDir, targetRoot, { recursive: true, force: true });
      } catch (err) {
        console.error('Storage migration failed:', err);
        throw err;
      }
      // Switch internal pointers
      this.dataDir = targetRoot;
      this.huntsDir = path.join(this.dataDir, 'hunts');
      this.configDir = path.join(this.dataDir, 'config');
      this.snapshotsDir = path.join(this.dataDir, 'snapshots');
      this.crashRecovery = new CrashRecovery(this.dataDir);
    }

    this.settings = { ...this.settings!, ...updates, storageMode: nextMode };
    await this.ensureDirectories();
    await this.saveSettings();
    return this.settings;
  }

  async createHunt(huntData: HuntData): Promise<Hunt> {
    const hunt: Hunt = {
      id: `hunt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: huntData.name,
      game: huntData.game,
      method: huntData.method,
      targetSpecies: huntData.targetSpecies,
      baseOdds: huntData.baseOdds,
      modifiers: huntData.modifiers || { shinyCharm: false, masuda: false, chainTier: 0 },
      count: 0,
      phases: [],
      notes: huntData.notes || '',
      encountersSinceLastShiny: 0,
      stats: { sessions: [], paceEph: 0 },
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appVersion: '1.0.0'
    };

    await this.saveHunt(hunt);
    return hunt;
  }

  async getHunt(huntId: string): Promise<Hunt | null> {
    const huntPath = path.join(this.huntsDir, `${huntId}.json`);
    
    try {
      const data = await fs.readFile(huntPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async updateHunt(huntId: string, updates: Partial<Hunt>): Promise<Hunt | null> {
    const hunt = await this.getHunt(huntId);
    if (!hunt) return null;

    const updatedHunt = {
      ...hunt,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.saveHunt(updatedHunt);
    return updatedHunt;
  }

  async deleteHunt(huntId: string): Promise<boolean> {
    const huntPath = path.join(this.huntsDir, `${huntId}.json`);
    
    try {
      await fs.unlink(huntPath);
      return true;
    } catch {
      return false;
    }
  }

  async listHunts(): Promise<Hunt[]> {
    try {
      const files = await fs.readdir(this.huntsDir);
      const huntFiles = files.filter(file => file.endsWith('.json'));
      
      const hunts: Hunt[] = [];
      for (const file of huntFiles) {
        try {
          const data = await fs.readFile(path.join(this.huntsDir, file), 'utf-8');
          hunts.push(JSON.parse(data));
        } catch {
          // Skip corrupted files
        }
      }
      
      return hunts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch {
      return [];
    }
  }

  async incrementCounter(huntId: string): Promise<Hunt | null> {
    const hunt = await this.getHunt(huntId);
    if (!hunt) return null;

    hunt.count += 1;
    hunt.encountersSinceLastShiny += 1;
    hunt.updatedAt = new Date().toISOString();

    await this.saveHunt(hunt);
    
    return hunt;
  }

  async decrementCounter(huntId: string): Promise<Hunt | null> {
    const hunt = await this.getHunt(huntId);
    if (!hunt) return null;

    if (hunt.count > 0) {
      hunt.count -= 1;
      if (hunt.encountersSinceLastShiny > 0) {
        hunt.encountersSinceLastShiny -= 1;
      }
      hunt.updatedAt = new Date().toISOString();

      await this.saveHunt(hunt);
    }
    
    return hunt;
  }

  async setCounter(huntId: string, count: number): Promise<Hunt | null> {
    const hunt = await this.getHunt(huntId);
    if (!hunt) return null;

    const oldCount = hunt.count;
    hunt.count = Math.max(0, count);
    
    // Adjust encounters since last shiny
    const difference = hunt.count - oldCount;
    hunt.encountersSinceLastShiny = Math.max(0, hunt.encountersSinceLastShiny + difference);
    
    hunt.updatedAt = new Date().toISOString();

    await this.saveHunt(hunt);
    
    return hunt;
  }

  async addPhase(huntId: string, phaseData: { species: string; isTarget: boolean; notes?: string }): Promise<Hunt | null> {
    const hunt = await this.getHunt(huntId);
    if (!hunt) return null;

    const phase: Phase = {
      id: `phase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      atCount: hunt.count,
      species: phaseData.species,
      isTarget: phaseData.isTarget,
      notes: phaseData.notes || '',
      createdAt: new Date().toISOString()
    };

    hunt.phases.push(phase);
    hunt.encountersSinceLastShiny = 0;
    hunt.updatedAt = new Date().toISOString();

    await this.saveHunt(hunt);
    
    return hunt;
  }

  async removePhase(huntId: string, phaseId: string): Promise<Hunt | null> {
    const hunt = await this.getHunt(huntId);
    if (!hunt) return null;

    const originalLength = hunt.phases.length;
    hunt.phases = hunt.phases.filter(p => p.id !== phaseId);
    if (hunt.phases.length === originalLength) return hunt; // not found

    // Recalculate encountersSinceLastShiny based on latest phase
    const lastPhase = hunt.phases[hunt.phases.length - 1];
    if (lastPhase) {
      hunt.encountersSinceLastShiny = Math.max(0, hunt.count - lastPhase.atCount);
    } else {
      hunt.encountersSinceLastShiny = hunt.count; // no shiny yet
    }

    // If we removed a target shiny phase and hunt was archived, keep archived flag as-is
    hunt.updatedAt = new Date().toISOString();
    await this.saveHunt(hunt);
    return hunt;
  }

  private async saveHunt(hunt: Hunt): Promise<void> {
    const huntPath = path.join(this.huntsDir, `${hunt.id}.json`);
    const tempPath = path.join(this.huntsDir, `${hunt.id}.tmp`);
    
    try {
      // Write to temporary file first for crash safety
      await fs.writeFile(tempPath, JSON.stringify(hunt, null, 2));
      
      // Atomic rename to final location
      await fs.rename(tempPath, huntPath);
      
      // Create snapshot every 30 encounters or on significant events
      if (hunt.count % 30 === 0 || hunt.phases.length > 0) {
        await this.createSnapshot(hunt);
      }
      
      // Update text files for OBS
      await this.updateTextFiles(hunt);
      
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch {}
      
      console.error('Failed to save hunt:', error);
      throw error;
    }
  }

  private async createSnapshot(hunt: Hunt): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotPath = path.join(this.snapshotsDir, `${timestamp}-${hunt.id}.json`);
    await fs.writeFile(snapshotPath, JSON.stringify(hunt, null, 2));
  }

  private async updateTextFiles(hunt: Hunt): Promise<void> {
    if (!this.settings?.obsTextFolder) return;

    try {
      const obsDir = this.settings.obsTextFolder;
      
      // Validate directory path
      if (!obsDir || obsDir.trim() === '') {
        console.warn('OBS text folder path is empty');
        return;
      }

      // Ensure OBS directory exists
      await fs.mkdir(obsDir, { recursive: true });

      // Update text files with error handling for each file
      const files = [
        { name: 'count.txt', content: hunt.count.toString() },
        { name: 'target.txt', content: hunt.targetSpecies || '—' },
        { 
          name: 'phase.txt', 
          content: hunt.phases.length > 0 
            ? `Phase #${hunt.phases.length} — ${hunt.phases[hunt.phases.length - 1].species} at ${hunt.phases[hunt.phases.length - 1].atCount}`
            : 'No phases yet'
        },
        {
          name: 'encounters_since_shiny.txt',
          content: hunt.encountersSinceLastShiny.toString()
        },
        {
          name: 'odds.txt',
          content: `1 in ${formatNumber(hunt.baseOdds.denominator, this.settings)}`
        }
      ];

      for (const file of files) {
        try {
          await fs.writeFile(path.join(obsDir, file.name), file.content, 'utf8');
        } catch (fileError) {
          console.error(`Failed to write ${file.name}:`, fileError);
        }
      }
      
      console.log(`Updated OBS text files in: ${obsDir}`);
      
    } catch (error) {
      console.error('Failed to update text files:', error);
      throw new Error(`OBS text file update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportData(filePath: string, data: any): Promise<boolean> {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch {
      return false;
    }
  }

  async importData(filePath: string): Promise<any> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  // Diagnostic and testing methods
  async testDataIntegrity(): Promise<any> {
    return await this.crashRecovery.testDataIntegrity();
  }

  async createEmergencyBackup(): Promise<string | null> {
    return await this.crashRecovery.createEmergencyBackup();
  }

  async getDataDirectory(): Promise<string> {
    return this.dataDir;
  }

  async validateOBSFolder(folderPath: string): Promise<{ valid: boolean; error?: string }> {
    try {
      if (!folderPath || folderPath.trim() === '') {
        return { valid: false, error: 'Folder path is empty' };
      }

      // Check if directory exists or can be created
      await fs.mkdir(folderPath, { recursive: true });
      
      // Test write permissions by creating a test file
      const testFile = path.join(folderPath, 'test_write.tmp');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
