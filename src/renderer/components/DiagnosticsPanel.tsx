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
        className="fixed bottom-4 right-4 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
      >
        🔧 Diagnostics
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">System Diagnostics</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Data Directory Info */}
          {dataDir && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-3">
              <h3 className="font-semibold mb-1">Data Directory</h3>
              <p className="text-sm font-mono break-all">{dataDir}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={runDataIntegrityTest}
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded transition-colors"
            >
              {testing ? 'Testing...' : 'Test Data Integrity'}
            </button>

            <button
              onClick={createBackup}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
            >
              Create Emergency Backup
            </button>

            <button
              onClick={validateOBSFolder}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
            >
              Validate OBS Folder
            </button>
          </div>

          {/* Test Results */}
          {result && (
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">Data Integrity Test Results</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-100 dark:bg-green-900 rounded p-3">
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {result.valid}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Valid Files</div>
                </div>
                
                <div className="bg-red-100 dark:bg-red-900 rounded p-3">
                  <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                    {result.corrupted}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">Corrupted Files</div>
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