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
  onDragStartCard?: (cardId: string) => void;
  onDragEndCard?: () => void;
}

export const MovableCard: React.FC<MovableCardProps> = ({
  id,
  title,
  children,
  onMove,
  currentSide,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
  onDragStartCard,
  onDragEndCard
}) => {
  const [showMoveButtons, setShowMoveButtons] = useState(false);

  return (
    <div
      className={`movable-card ${className}`}
      onMouseEnter={() => setShowMoveButtons(true)}
      onMouseLeave={() => setShowMoveButtons(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sc-card">
        <div 
          className="sc-card__header" 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sc-space-3)', cursor: 'grab' }}
          draggable
          onDragStart={(e) => {
            try { e.dataTransfer?.setData('text/plain', id); } catch {}
            e.dataTransfer!.effectAllowed = 'move';
            onDragStartCard?.(id);
          }}
          onDragEnd={() => {
            onDragEndCard?.();
          }}
        >
          <div className="sc-card__title" style={{ margin: 0 }}>{title}</div>
          <div style={{ display: 'flex', gap: 'var(--sc-space-1)', alignItems: 'center' }}>
            <button
              onClick={() => onToggleCollapse(id)}
              className="sc-btn sc-btn--ghost sc-btn--xs sc-btn--icon"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <span className={isCollapsed ? 'rot-90' : 'rot--90'}>→</span>
            </button>
            {showMoveButtons && (
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  onClick={() => onMove(id, 'left')}
                  className="sc-btn sc-btn--ghost sc-btn--xs sc-btn--icon"
                  style={{ opacity: currentSide === 'left' ? 0.5 : 1 }}
                  disabled={currentSide === 'left'}
                  title="Move to left side"
                >
                  <span className="rot-180">→</span>
                </button>
                <button
                  onClick={() => onMove(id, 'right')}
                  className="sc-btn sc-btn--ghost sc-btn--xs sc-btn--icon"
                  style={{ opacity: currentSide === 'right' ? 0.5 : 1 }}
                  disabled={currentSide === 'right'}
                  title="Move to right side"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <div className="movable-card-content">
            {children}
          </div>
        )}

        {isCollapsed && (
          <div style={{ 
            padding: 'var(--sc-space-3)',
            textAlign: 'center',
            color: 'var(--sc-text-muted)'
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
    </div>
  );
};
