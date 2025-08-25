import React, { useState } from 'react';

interface DiagnosticsResult {
  valid: number;
  corrupted: number;
  details: Array<{
    file: string;
    status: string;
    hunt?: string;
    error?: string;
  }>;
}

export const DiagnosticsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<DiagnosticsResult | null>(null);
  const [dataDir, setDataDir] = useState<string>('');

  const runDataIntegrityTest = async () => {
    setTesting(true);
    try {
      const testResult = await window.electronAPI.testDataIntegrity();
      setResult(testResult);
      
      const directory = await window.electronAPI.getDataDirectory();
      setDataDir(directory);
    } catch (error) {
      console.error('Failed to run data integrity test:', error);
    } finally {
      setTesting(false);
    }
  };

  const createBackup = async () => {
    try {
      const backupPath = await window.electronAPI.createEmergencyBackup();
      if (backupPath) {
        alert(`Emergency backup created at: ${backupPath}`);
      } else {
        alert('Failed to create backup');
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Failed to create backup');
    }
  };

  const validateOBSFolder = async () => {
    const folderPath = prompt('Enter OBS folder path to validate:');
    if (!folderPath) return;

    try {
      const validation = await window.electronAPI.validateOBSFolder(folderPath);
      if (validation.valid) {
        alert('OBS folder is valid and writable!');
      } else {
        alert(`OBS folder validation failed: ${validation.error}`);
      }
    } catch (error) {
      console.error('Failed to validate OBS folder:', error);
      alert('Failed to validate OBS folder');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="sc-btn sc-btn--ghost"
        style={{
          position: 'fixed',
          bottom: 'var(--sc-space-4)',
          right: 'var(--sc-space-4)',
          fontSize: 'var(--sc-fs-sm)',
          zIndex: 100
        }}
      >
        🔧 Diagnostics
      </button>
    );
  }

  return (
    <div className="sc-modal-backdrop">
      <div className="sc-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="u-row" style={{ justifyContent: 'space-between', marginBottom: 'var(--sc-space-4)' }}>
          <div className="sc-card__title">🔧 System Diagnostics</div>
          <button
            onClick={() => setIsOpen(false)}
            className="sc-btn sc-btn--ghost"
            style={{ padding: 'var(--sc-space-1)' }}
          >
            ✕
          </button>
        </div>

        <div className="u-col">
          {/* Data Directory Info */}
          {dataDir && (
            <div style={{ 
              background: 'var(--sc-bg-elev-2)', 
              border: '1px solid var(--sc-border)',
              borderRadius: 'var(--sc-radius-lg)',
              padding: 'var(--sc-space-3)'
            }}>
              <div style={{ 
                fontSize: 'var(--sc-fs-md)', 
                fontWeight: 'var(--sc-fw-semibold)', 
                marginBottom: 'var(--sc-space-1)' 
              }}>
                Data Directory
              </div>
              <p style={{ 
                fontSize: 'var(--sc-fs-sm)', 
                fontVariantNumeric: 'tabular-nums',
                wordBreak: 'break-all',
                color: 'var(--sc-text-muted)'
              }}>
                {dataDir}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="u-row" style={{ flexWrap: 'wrap' }}>
            <button
              onClick={runDataIntegrityTest}
              disabled={testing}
              className="sc-btn sc-btn--primary"
              style={{ 
                flex: 1, 
                minWidth: '160px',
                opacity: testing ? 0.6 : 1,
                pointerEvents: testing ? 'none' : 'auto'
              }}
            >
              {testing ? 'Testing...' : 'Test Data Integrity'}
            </button>

            <button
              onClick={createBackup}
              className="sc-btn"
              style={{ 
                flex: 1, 
                minWidth: '160px',
                background: 'var(--sc-success)',
                borderColor: 'color-mix(in oklab, var(--sc-success) 70%, black 30%)',
                color: '#fff'
              }}
            >
              Create Emergency Backup
            </button>

            <button
              onClick={validateOBSFolder}
              className="sc-btn"
              style={{ 
                flex: 1, 
                minWidth: '160px',
                background: 'var(--sc-brand)',
                borderColor: 'var(--sc-brand-strong)',
                color: '#fff'
              }}
            >
              Validate OBS Folder
            </button>
          </div>

          {/* Test Results */}
          {result && (
            <div style={{ 
              border: '1px solid var(--sc-border)', 
              borderRadius: 'var(--sc-radius-lg)', 
              padding: 'var(--sc-space-4)' 
            }}>
              <div style={{ 
                fontSize: 'var(--sc-fs-md)', 
                fontWeight: 'var(--sc-fw-semibold)', 
                marginBottom: 'var(--sc-space-2)' 
              }}>
                Data Integrity Test Results
              </div>
              
              <div className="u-row" style={{ marginBottom: 'var(--sc-space-4)' }}>
                <div style={{ 
                  background: 'var(--sc-bg-good)', 
                  border: '1px solid color-mix(in oklab, var(--sc-success) 30%, transparent)',
                  borderRadius: 'var(--sc-radius-lg)',
                  padding: 'var(--sc-space-3)',
                  flex: 1,
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: 'var(--sc-fs-xl)', 
                    fontWeight: 'var(--sc-fw-bold)',
                    color: 'var(--sc-success)'
                  }}>
                    {result.valid}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--sc-fs-sm)', 
                    color: 'var(--sc-success)' 
                  }}>
                    Valid Files
                  </div>
                </div>
                
                <div style={{ 
                  background: 'var(--sc-bg-danger)', 
                  border: '1px solid color-mix(in oklab, var(--sc-danger) 30%, transparent)',
                  borderRadius: 'var(--sc-radius-lg)',
                  padding: 'var(--sc-space-3)',
                  flex: 1,
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: 'var(--sc-fs-xl)', 
                    fontWeight: 'var(--sc-fw-bold)',
                    color: 'var(--sc-danger)'
                  }}>
                    {result.corrupted}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--sc-fs-sm)', 
                    color: 'var(--sc-danger)' 
                  }}>
                    Corrupted Files
                  </div>
                </div>
              </div>

              {result.details.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">File Details</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {result.details.map((detail, index) => (
                      <div
                        key={index}
                        className={`text-sm p-2 rounded ${
                          detail.status === 'valid'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-mono">{detail.file}</span>
                          <span className="capitalize">{detail.status.replace('_', ' ')}</span>
                        </div>
                        {detail.hunt && (
                          <div className="text-xs opacity-75">Hunt: {detail.hunt}</div>
                        )}
                        {detail.error && (
                          <div className="text-xs opacity-75">Error: {detail.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-3">
            <h4 className="font-medium mb-1">Diagnostic Tools</h4>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Data Integrity Test:</strong> Checks all hunt files for corruption</li>
              <li>• <strong>Emergency Backup:</strong> Creates a backup of all hunt data</li>
              <li>• <strong>OBS Folder Validation:</strong> Tests if a folder path is writable for text files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};