import React from 'react';
import { Settings } from '../../shared/types';

interface CloudSyncCardProps {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
}

export const CloudSyncCard: React.FC<CloudSyncCardProps> = ({ settings, onUpdate }) => {
  const provider = settings.cloudSync?.provider || 'none';
  const status = settings.cloudSync?.status || 'disconnected';
  const note = settings.cloudSync?.note || 'Design preview only — not yet functional.';

  const setProvider = (p: Settings['cloudSync']['provider']) => {
    onUpdate({ cloudSync: { ...settings.cloudSync, provider: p } });
  };

  const providers = [
    { key: 'none', label: 'None' },
    { key: 'icloud', label: 'iCloud' },
    { key: 'googledrive', label: 'Google Drive' },
    { key: 'dropbox', label: 'Dropbox' },
    { key: 'onedrive', label: 'OneDrive' }
  ];

  // Badge style by status
  const badgeStyle: React.CSSProperties =
    status === 'connected'
      ? { background: 'var(--sc-bg-good)', color: 'var(--sc-success)', border: '1px solid color-mix(in oklab, var(--sc-success) 30%, transparent)' }
      : status === 'error'
        ? { background: 'var(--sc-bg-danger)', color: 'var(--sc-danger)', border: '1px solid color-mix(in oklab, var(--sc-danger) 30%, transparent)' }
        : { background: 'var(--sc-bg-elev-2)', color: 'var(--sc-text-muted)', border: '1px solid var(--sc-border)' };

  return (
    <div className="u-col" style={{ gap: 'var(--sc-space-4)' }}>
      {/* Status row under the card header (MovableCard shows the header already) */}
      <div className="u-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-sm)' }}>Keep your stream labels synced</div>
        <span className="u-badge" style={badgeStyle}>{status}</span>
      </div>

      {/* Vertical provider picker */}
      <div className="u-col" style={{ gap: 'var(--sc-space-2)' }}>
        <label className="sc-label">Provider</label>
        <div className="u-row" style={{ gap: 'var(--sc-space-2)', flexWrap: 'wrap' }}>
          {providers.map(opt => (
            <button key={opt.key}
              onClick={() => setProvider(opt.key as any)}
              className={`sc-tag cloud-pill ${provider===opt.key ? 'cloud-pill--active':''}`}
              style={{ cursor: 'pointer' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="u-col" style={{ gap: '6px' }}>
        <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>{note}</div>
        <div className="u-subtle" style={{ fontSize: 'var(--sc-fs-xs)' }}>
          Will mirror output files (count.txt, target.txt, phase.txt) to/from the selected provider and resolve newest timestamps.
        </div>
      </div>

      <div className="u-col" style={{ gap: 'var(--sc-space-2)' }}>
        <button className="sc-btn" aria-disabled title="Coming soon" style={{ opacity: .6, width: '100%' }}>Connect</button>
        <button className="sc-btn sc-btn--ghost" aria-disabled title="Coming soon" style={{ opacity: .6, width: '100%' }}>Sync Now</button>
      </div>
    </div>
  );
};
