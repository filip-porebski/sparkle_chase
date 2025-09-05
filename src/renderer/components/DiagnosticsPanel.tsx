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

interface Props {
  isOpen?: boolean;
  onSetOpen?: (open: boolean) => void;
}

export const DiagnosticsPanel: React.FC<Props> = ({ isOpen: controlledOpen, onSetOpen }) => {
  const isControlled = typeof controlledOpen === 'boolean' && typeof onSetOpen === 'function';
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? (controlledOpen as boolean) : internalOpen;
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

  const close = () => (isControlled ? onSetOpen?.(false) : setInternalOpen(false));

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  if (!isOpen) {
    if (isControlled) return null;
    return (
      <button
        onClick={() => (isControlled ? onSetOpen?.(true) : setInternalOpen(true))}
        className="sc-btn sc-btn--ghost"
        style={{
          position: 'fixed',
          bottom: 'var(--sc-space-4)',
          right: 'calc(var(--sc-space-4) + 56px)',
          fontSize: 'var(--sc-fs-sm)',
          zIndex: 100
        }}
      >
        Diagnostics
      </button>
    );
  }

  return (
    <div className="sc-modal-backdrop" onClick={close}>
      <div className="sc-modal" style={{ maxHeight: '82vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div className="u-row" style={{ justifyContent: 'space-between', marginBottom: 'var(--sc-space-4)', alignItems: 'center' }}>
          <div className="sc-card__title" style={{ margin: 0 }}>System Diagnostics</div>
          <button
            onClick={close}
            className="sc-btn sc-btn--ghost sc-btn--xs sc-btn--icon"
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="u-col" style={{ overflowY: 'auto' }}>
          {/* Data Directory Info */}
          {dataDir && (
            <div className="u-card" style={{ padding: 'var(--sc-space-3)' }}>
              <div style={{ 
                fontSize: 'var(--sc-fs-md)', 
                fontWeight: 'var(--sc-fw-semibold)', 
                marginBottom: 'var(--sc-space-1)' 
              }}>
                Data Directory
              </div>
              <p className="u-subtle" style={{ fontSize: 'var(--sc-fs-sm)', fontVariantNumeric: 'tabular-nums', wordBreak: 'break-all' }}>
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
              className="sc-btn sc-btn--success"
              style={{ flex: 1, minWidth: '160px' }}
            >
              Create Emergency Backup
            </button>

            <button
              onClick={validateOBSFolder}
              className="sc-btn sc-btn--primary"
              style={{ flex: 1, minWidth: '160px' }}
            >
              Validate OBS Folder
            </button>
          </div>

          {/* Test Results */}
          {result && (
            <div className="u-card" style={{ padding: 'var(--sc-space-4)' }}>
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
                  <div style={{ fontSize: 'var(--sc-fs-sm)', fontWeight: 'var(--sc-fw-medium)', marginBottom: 'var(--sc-space-2)' }}>File Details</div>
                  <div className="u-col" style={{ gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                    {result.details.map((detail, index) => (
                      <div key={index} className="u-row" style={{ justifyContent: 'space-between', background: 'var(--sc-bg-elev-2)', border: '1px solid var(--sc-border)', borderRadius: 'var(--sc-radius-md)', padding: '8px 10px' }}>
                        <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--sc-fs-xs)', color: 'var(--sc-text-subtle)' }}>{detail.file}</span>
                        <span style={{ fontSize: 'var(--sc-fs-xs)', color: detail.status === 'valid' ? 'var(--sc-success)' : 'var(--sc-danger)' }}>{detail.status.replace('_',' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="u-card" style={{ padding: 'var(--sc-space-3)' }}>
            <div style={{ fontSize: 'var(--sc-fs-sm)', fontWeight: 'var(--sc-fw-medium)', marginBottom: '6px' }}>Diagnostic Tools</div>
            <div className="u-col" style={{ gap: '4px', fontSize: 'var(--sc-fs-xs)' }}>
              <div>• <b>Data Integrity Test</b>: Checks all hunt files for corruption</div>
              <div>• <b>Emergency Backup</b>: Creates a backup of all hunt data</div>
              <div>• <b>OBS Folder Validation</b>: Tests if a folder path is writable for text files</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
