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