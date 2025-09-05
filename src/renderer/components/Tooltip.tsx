import React from 'react';

interface TooltipProps {
  title: string;
  onClose: () => void;
  style?: React.CSSProperties;
}

export const Tooltip: React.FC<TooltipProps> = ({ title, onClose, style }) => {
  return (
    <div className="sc-tip" style={style} role="note" aria-live="polite">
      <div className="sc-tip__content">
        <span className="sc-tip__text">{title}</span>
        <button
          onClick={onClose}
          className="sc-btn sc-btn--ghost sc-btn--xs sc-btn--icon sc-tip__close"
          aria-label="Dismiss"
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
};

