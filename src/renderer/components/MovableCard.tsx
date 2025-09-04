import React, { useState } from 'react';

interface MovableCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onMove: (cardId: string, targetSide: 'left' | 'right') => void;
  currentSide: 'left' | 'right';
  isCollapsed?: boolean;
  onToggleCollapse: (cardId: string) => void;
  className?: string;
}

export const MovableCard: React.FC<MovableCardProps> = ({
  id,
  title,
  children,
  onMove,
  currentSide,
  isCollapsed = false,
  onToggleCollapse,
  className = ''
}) => {
  const [showMoveButtons, setShowMoveButtons] = useState(false);

  return (
    <div 
      className={`movable-card-wrapper ${className}`}
      onMouseEnter={() => setShowMoveButtons(true)}
      onMouseLeave={() => setShowMoveButtons(false)}
      style={{ 
        position: 'relative',
        marginBottom: 'var(--sc-space-4)'
      }}
    >
      {/* Card Controls Header */}
      <div 
        className="movable-card-controls"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--sc-space-2)',
          padding: '0 var(--sc-space-2)',
          background: 'var(--sc-bg-elev-1)',
          border: '1px solid var(--sc-border)',
          borderRadius: 'var(--sc-radius-md) var(--sc-radius-md) 0 0',
          borderBottom: isCollapsed ? '1px solid var(--sc-border)' : 'none'
        }}
      >
        <div style={{ 
          fontSize: 'var(--sc-fs-sm)', 
          fontWeight: 'var(--sc-fw-medium)',
          color: 'var(--sc-text-muted)'
        }}>
          {title}
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--sc-space-1)', alignItems: 'center' }}>
          {/* Collapse/Expand Button */}
          <button
            onClick={() => onToggleCollapse(id)}
            className="sc-btn sc-btn--ghost"
            style={{
              height: '20px',
              padding: '0 4px',
              fontSize: 'var(--sc-fs-xs)',
              minWidth: 'auto'
            }}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>

          {/* Move Buttons */}
          {showMoveButtons && (
            <div style={{ display: 'flex', gap: '1px' }}>
              <button
                onClick={() => onMove(id, 'left')}
                className="sc-btn sc-btn--ghost"
                style={{
                  height: '20px',
                  padding: '0 4px',
                  fontSize: 'var(--sc-fs-xs)',
                  minWidth: 'auto',
                  opacity: currentSide === 'left' ? 0.5 : 1
                }}
                disabled={currentSide === 'left'}
                title="Move to left side"
              >
                ←
              </button>
              <button
                onClick={() => onMove(id, 'right')}
                className="sc-btn sc-btn--ghost"
                style={{
                  height: '20px',
                  padding: '0 4px',
                  fontSize: 'var(--sc-fs-xs)',
                  minWidth: 'auto',
                  opacity: currentSide === 'right' ? 0.5 : 1
                }}
                disabled={currentSide === 'right'}
                title="Move to right side"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      {!isCollapsed && (
        <div className="movable-card-content">
          {children}
        </div>
      )}

      {/* Collapsed State */}
      {isCollapsed && (
        <div style={{ 
          padding: 'var(--sc-space-3)',
          textAlign: 'center',
          background: 'var(--sc-bg-elev-1)',
          border: '1px solid var(--sc-border)',
          borderTop: 'none',
          borderRadius: '0 0 var(--sc-radius-md) var(--sc-radius-md)',
          color: 'var(--sc-text-muted)',
          fontSize: 'var(--sc-fs-sm)'
        }}>
          <button
            onClick={() => onToggleCollapse(id)}
            className="sc-btn sc-btn--ghost"
            style={{ fontSize: 'var(--sc-fs-sm)' }}
          >
            Expand
          </button>
        </div>
      )}
    </div>
  );
};