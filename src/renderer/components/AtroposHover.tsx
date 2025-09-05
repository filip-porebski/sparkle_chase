import React from 'react';

interface AtroposHoverProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  rotateLimit?: number; // degrees
  scale?: number;
}

export const AtroposHover: React.FC<AtroposHoverProps> = ({
  children,
  className = '',
  style,
  rotateLimit = 12,
  scale = 1.04,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) * 2 - 1) * rotateLimit; // tilt X
    const ry = -((x / rect.width) * 2 - 1) * rotateLimit; // tilt Y
    el.style.transform = `perspective(600px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
    const shine = el.querySelector('.sc-3d__shine') as HTMLElement | null;
    if (shine) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      shine.style.background = `radial-gradient(240px 240px at ${px}% ${py}%, color-mix(in oklab, var(--sc-brand) 28%, transparent) 0%, transparent 60%)`;
    }
  };

  const onEnter = () => { setActive(true); };
  const onLeave = () => {
    const el = ref.current;
    setActive(false);
    if (el) { el.style.transform = ''; }
  };

  return (
    <div
      ref={ref}
      className={`sc-3d ${active ? 'is-active' : ''} ${className}`}
      style={style}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="sc-3d__inner">{children}</div>
      <div className="sc-3d__shine" />
    </div>
  );
};

