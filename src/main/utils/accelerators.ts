import type { Input } from 'electron';

// Convert Electron before-input-event payload into an Accelerator-like string
export function acceleratorFromInput(input: Input): string {
  const parts: string[] = [];
  if (input.meta || input.control) parts.push('CommandOrControl');
  if (input.alt) parts.push('Alt');
  if (input.shift) parts.push('Shift');

  let key = input.key;
  if (key === ' ') key = 'Space';
  if (key && key.length === 1) key = key.toUpperCase();
  parts.push(key);
  return parts.join('+');
}

