import './styles/overlay.css';
import type { OverlayAPI } from '../preload/overlay-preload';

function groupNumber(n: number, sep: 'comma' | 'dot' | 'thin'): string {
  const char = sep === 'dot' ? '.' : sep === 'thin' ? '\u2009' : ',';
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, char);
  return (n < 0 ? '-' : '') + s;
}

async function updateOverlay(hunt: any) {
  let settings: any = null;
  if (window.overlayAPI && window.overlayAPI.getSettings) {
    try {
      settings = await window.overlayAPI.getSettings();
    } catch {}
  }
  const sep: 'comma' | 'dot' | 'thin' = settings?.numberSeparator ||
    ((1000).toLocaleString().includes(',') ? 'comma' : ((1000).toLocaleString().includes('.') ? 'dot' : 'thin'));

  const elTarget = document.getElementById('target');
  const elCount = document.getElementById('count');
  const elPhase = document.getElementById('phase');
  const elOdds = document.getElementById('odds');

  if (!elTarget || !elCount || !elPhase || !elOdds) return;

  elTarget.textContent = hunt.targetSpecies || '—';
  elCount.textContent = groupNumber(hunt.count, sep);

  const lastPhase = hunt.phases[hunt.phases.length - 1];
  const phaseText = lastPhase ? `Phase #${hunt.phases.length} — ${lastPhase.species}` : 'No phases yet';
  elPhase.textContent = phaseText;

  elOdds.textContent = `1 in ${groupNumber(hunt.baseOdds.denominator, sep)}`;
}

function setupDragHandlers() {
  const panel = document.querySelector('.overlay-content');
  if (!panel) return;
  let isDragging = false;
  panel.addEventListener('mousedown', () => {
    isDragging = true;
    window.overlayAPI?.startDrag();
  });
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    window.overlayAPI?.stopDrag();
  });
  panel.addEventListener('dblclick', () => {
    window.overlayAPI?.toggleClickThrough();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupDragHandlers();
  window.overlayAPI?.onUpdate(updateOverlay);
});

declare global {
  interface Window {
    overlayAPI: OverlayAPI;
  }
}
