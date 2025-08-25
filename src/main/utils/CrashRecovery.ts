import * as fs from 'fs/promises';
import * as path from 'path';
import { Hunt } from '../../shared/types';

export class CrashRecovery {
  private dataDir: string;
  private huntsDir: string;
  private snapshotsDir: string;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
    this.huntsDir = path.join(dataDir, 'hunts');
    this.snapshotsDir = path.join(dataDir, 'snapshots');
  }

  async checkForCorruptedFiles(): Promise<{ corrupted: string[], recovered: string[] }> {
    const corrupted: string[] = [];
    const recovered: string[] = [];

    try {
      const files = await fs.readdir(this.huntsDir);
      const huntFiles = files.filter(file => file.endsWith('.json'));

      for (const file of huntFiles) {
        const filePath = path.join(this.huntsDir, file);
        const tempPath = path.join(this.huntsDir, file.replace('.json', '.tmp'));

        try {
          // Try to read and parse the main file
          const data = await fs.readFile(filePath, 'utf-8');
          JSON.parse(data); // Will throw if corrupted
        } catch (error) {
          corrupted.push(file);
          
          // Try to recover from temp file
          try {
            await fs.access(tempPath);
            const tempData = await fs.readFile(tempPath, 'utf-8');
            JSON.parse(tempData); // Validate temp file
            
            // Restore from temp file
            await fs.rename(tempPath, filePath);
            recovered.push(file);
            console.log(`Recovered corrupted file: ${file}`);
          } catch (tempError) {
            // Try to recover from snapshots
            const huntId = file.replace('.json', '');
            const recoveredFromSnapshot = await this.recoverFromSnapshot(huntId);
            if (recoveredFromSnapshot) {
              recovered.push(file);
              console.log(`Recovered from snapshot: ${file}`);
            } else {
              console.error(`Could not recover file: ${file}`);
            }
          }
        }

        // Clean up any leftover temp files
        try {
          await fs.unlink(tempPath);
        } catch {}
      }
    } catch (error) {
      console.error('Error during crash recovery check:', error);
    }

    return { corrupted, recovered };
  }

  private async recoverFromSnapshot(huntId: string): Promise<boolean> {
    try {
      const snapshots = await fs.readdir(this.snapshotsDir);
      const huntSnapshots = snapshots
        .filter(file => file.includes(huntId) && file.endsWith('.json'))
        .sort()
        .reverse(); // Most recent first

      if (huntSnapshots.length === 0) {
        return false;
      }

      // Use the most recent snapshot
      const latestSnapshot = huntSnapshots[0];
      const snapshotPath = path.join(this.snapshotsDir, latestSnapshot);
      const huntPath = path.join(this.huntsDir, `${huntId}.json`);

      const snapshotData = await fs.readFile(snapshotPath, 'utf-8');
      const hunt: Hunt = JSON.parse(snapshotData);

      // Update the timestamp to indicate recovery
      hunt.updatedAt = new Date().toISOString();

      await fs.writeFile(huntPath, JSON.stringify(hunt, null, 2));
      return true;
    } catch (error) {
      console.error(`Failed to recover from snapshot for hunt ${huntId}:`, error);
      return false;
    }
  }

  async createEmergencyBackup(): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.dataDir, 'emergency-backups', timestamp);
      
      await fs.mkdir(backupDir, { recursive: true });

      // Copy all hunt files
      const files = await fs.readdir(this.huntsDir);
      const huntFiles = files.filter(file => file.endsWith('.json'));

      for (const file of huntFiles) {
        const sourcePath = path.join(this.huntsDir, file);
        const destPath = path.join(backupDir, file);
        await fs.copyFile(sourcePath, destPath);
      }

      console.log(`Emergency backup created: ${backupDir}`);
      return backupDir;
    } catch (error) {
      console.error('Failed to create emergency backup:', error);
      return null;
    }
  }

  async testDataIntegrity(): Promise<{ valid: number, corrupted: number, details: any[] }> {
    const results = { valid: 0, corrupted: 0, details: [] as any[] };

    try {
      const files = await fs.readdir(this.huntsDir);
      const huntFiles = files.filter(file => file.endsWith('.json'));

      for (const file of huntFiles) {
        const filePath = path.join(this.huntsDir, file);
        
        try {
          const data = await fs.readFile(filePath, 'utf-8');
          const hunt: Hunt = JSON.parse(data);
          
          // Validate hunt structure
          const isValid = this.validateHuntStructure(hunt);
          
          if (isValid) {
            results.valid++;
            results.details.push({ file, status: 'valid', hunt: hunt.name });
          } else {
            results.corrupted++;
            results.details.push({ file, status: 'invalid_structure', hunt: hunt.name || 'Unknown' });
          }
        } catch (error) {
          results.corrupted++;
          results.details.push({ 
            file, 
            status: 'parse_error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
    } catch (error) {
      console.error('Error testing data integrity:', error);
    }

    return results;
  }

  private validateHuntStructure(hunt: any): boolean {
    const requiredFields = ['id', 'name', 'targetSpecies', 'count', 'phases', 'createdAt', 'updatedAt'];
    
    for (const field of requiredFields) {
      if (!(field in hunt)) {
        return false;
      }
    }

    // Validate types
    if (typeof hunt.count !== 'number' || hunt.count < 0) return false;
    if (!Array.isArray(hunt.phases)) return false;
    
    // Validate phases
    for (const phase of hunt.phases) {
      if (!phase.id || !phase.species || typeof phase.atCount !== 'number') {
        return false;
      }
    }

    return true;
  }
}