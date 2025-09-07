export interface Hunt {
  id: string;
  name: string;
  game: string;
  method: string;
  targetSpecies: string;
  baseOdds: {
    numerator: number;
    denominator: number;
  };
  modifiers: {
    shinyCharm: boolean;
    masuda: boolean;
    chainTier: number;
  };
  count: number;
  phases: Phase[];
  notes: string;
  encountersSinceLastShiny: number;
  stats: {
    sessions: Session[];
    paceEph: number; // Encounters per hour
  };
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  appVersion: string;
}

export interface Phase {
  id: string;
  atCount: number;
  species: string;
  isTarget: boolean;
  notes: string;
  createdAt: string;
}

export interface Session {
  id: string;
  huntId: string;
  startAt: string;
  endAt: string;
  encounters: number;
  encountersPerHour: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  dateFormat: 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD-MMM-YYYY';
  timeFormat: '12h' | '24h';
  numberSeparator: 'comma' | 'dot' | 'thin';
  storageMode?: 'portable' | 'userData';
  tooltips?: {
    shownNewHunt?: boolean;
    shownCounter?: boolean;
    shownSettings?: boolean;
    shownOverlay?: boolean;
  };
  cloudSync: {
    provider: 'none' | 'icloud' | 'googledrive' | 'dropbox' | 'onedrive';
    status?: 'disconnected' | 'connecting' | 'connected' | 'error';
    note?: string; // non-functional placeholder for UI messaging
  };
  overlay: {
    variant: 'badge' | 'compact' | 'full';
    clickThrough: boolean;
    alwaysOnTop: boolean;
    enabled: boolean;
  };
  hotkeys: {
    increment: string;
    decrement: string;
    phase: string;
    toggleGlobal: string;
    quickSwitch?: string;
    zenMode?: string;
  };
  obsTextFolder: string;
  safeModeApps: string[];
  globalHotkeysEnabled: boolean;
}

export interface HuntData {
  name: string;
  game: string;
  method: string;
  targetSpecies: string;
  baseOdds: {
    numerator: number;
    denominator: number;
  };
  modifiers?: {
    shinyCharm: boolean;
    masuda: boolean;
    chainTier: number;
  };
  notes?: string;
}

export interface OddsCalculation {
  effectiveProbability: number;
  noShinyAfterN: number;
  pastOddsMultiple: number;
  etaToOdds: number; // in hours
}
