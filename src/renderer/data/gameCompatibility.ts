// Game and Pokemon compatibility data
export interface GameInfo {
  name: string;
  generation: number;
  odds: number;
  pokemonRange: { min: number; max: number }[];
  availableMethods: string[];
  region: string;
}

export const POKEMON_GAMES: GameInfo[] = [
  // Generation 9
  {
    name: 'Scarlet',
    generation: 9,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 }, // Kalos
      { min: 722, max: 809 }, // Alola
      { min: 810, max: 905 }, // Galar
      { min: 906, max: 1010 } // Paldea
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Mass Outbreaks',
      'Sandwich Method',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Paldea'
  },
  {
    name: 'Violet',
    generation: 9,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 }, // Kalos
      { min: 722, max: 809 }, // Alola
      { min: 810, max: 905 }, // Galar
      { min: 906, max: 1010 } // Paldea
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Mass Outbreaks',
      'Sandwich Method',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Paldea'
  },

  // Generation 8
  {
    name: 'Brilliant Diamond',
    generation: 8,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 } // Sinnoh
    ],
    availableMethods: [
      'Random Encounters',
      'Poke Radar',
      'Breeding',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Sinnoh'
  },
  {
    name: 'Shining Pearl',
    generation: 8,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 } // Sinnoh
    ],
    availableMethods: [
      'Random Encounters',
      'Poke Radar',
      'Breeding',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Sinnoh'
  },
  {
    name: 'Legends: Arceus',
    generation: 8,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 } // Sinnoh
    ],
    availableMethods: [
      'Random Encounters',
      'Outbreak Hunting',
      'Static Encounters',
      'Legendary Hunting'
    ],
    region: 'Hisui'
  },
  {
    name: 'Sword',
    generation: 8,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 }, // Kalos
      { min: 722, max: 809 }, // Alola
      { min: 810, max: 898 } // Galar
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Max Raid Battles',
      'Dynamax Adventures',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Galar'
  },
  {
    name: 'Shield',
    generation: 8,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 }, // Kalos
      { min: 722, max: 809 }, // Alola
      { min: 810, max: 898 } // Galar
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Max Raid Battles',
      'Dynamax Adventures',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Galar'
  },

  // Generation 7
  {
    name: "Let's Go, Pikachu!",
    generation: 7,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 } // Kanto only
    ],
    availableMethods: [
      'Random Encounters',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Kanto'
  },
  {
    name: "Let's Go, Eevee!",
    generation: 7,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 } // Kanto only
    ],
    availableMethods: [
      'Random Encounters',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Kanto'
  },
  {
    name: 'Ultra Sun',
    generation: 7,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 }, // Kalos
      { min: 722, max: 807 } // Alola
    ],
    availableMethods: [
      'Random Encounters',
      'SOS Chaining',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Alola'
  },
  {
    name: 'Ultra Moon',
    generation: 7,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 }, // Kalos
      { min: 722, max: 807 } // Alola
    ],
    availableMethods: [
      'Random Encounters',
      'SOS Chaining',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Alola'
  },
  {
    name: 'Sun',
    generation: 7,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 }, // Kalos
      { min: 722, max: 802 } // Alola
    ],
    availableMethods: [
      'Random Encounters',
      'SOS Chaining',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Alola'
  },
  {
    name: 'Moon',
    generation: 7,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 }, // Kalos
      { min: 722, max: 802 } // Alola
    ],
    availableMethods: [
      'Random Encounters',
      'SOS Chaining',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Alola'
  },

  // Generation 6
  {
    name: 'Omega Ruby',
    generation: 6,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 } // Kalos
    ],
    availableMethods: [
      'Random Encounters',
      'DexNav',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Hoenn'
  },
  {
    name: 'Alpha Sapphire',
    generation: 6,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 } // Kalos
    ],
    availableMethods: [
      'Random Encounters',
      'DexNav',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Hoenn'
  },
  {
    name: 'X',
    generation: 6,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 } // Kalos
    ],
    availableMethods: [
      'Random Encounters',
      'Friend Safari',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Chain Fishing',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Kalos'
  },
  {
    name: 'Y',
    generation: 6,
    odds: 4096,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 }, // Unova
      { min: 650, max: 721 } // Kalos
    ],
    availableMethods: [
      'Random Encounters',
      'Friend Safari',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Chain Fishing',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Kalos'
  },

  // Generation 5
  {
    name: 'Black 2',
    generation: 5,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 } // Unova
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Unova'
  },
  {
    name: 'White 2',
    generation: 5,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 }, // Sinnoh
      { min: 494, max: 649 } // Unova
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Unova'
  },
  {
    name: 'Black',
    generation: 5,
    odds: 8192,
    pokemonRange: [
      { min: 494, max: 649 } // Unova only
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Unova'
  },
  {
    name: 'White',
    generation: 5,
    odds: 8192,
    pokemonRange: [
      { min: 494, max: 649 } // Unova only
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Unova'
  },

  // Generation 4
  {
    name: 'HeartGold',
    generation: 4,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 } // Sinnoh
    ],
    availableMethods: [
      'Random Encounters',
      'Poke Radar',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Johto'
  },
  {
    name: 'SoulSilver',
    generation: 4,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 } // Sinnoh
    ],
    availableMethods: [
      'Random Encounters',
      'Poke Radar',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Johto'
  },
  {
    name: 'Platinum',
    generation: 4,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 }, // Hoenn
      { min: 387, max: 493 } // Sinnoh
    ],
    availableMethods: [
      'Random Encounters',
      'Poke Radar',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Sinnoh'
  },
  {
    name: 'Diamond',
    generation: 4,
    odds: 8192,
    pokemonRange: [
      { min: 387, max: 493 } // Sinnoh only
    ],
    availableMethods: [
      'Random Encounters',
      'Poke Radar',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Sinnoh'
  },
  {
    name: 'Pearl',
    generation: 4,
    odds: 8192,
    pokemonRange: [
      { min: 387, max: 493 } // Sinnoh only
    ],
    availableMethods: [
      'Random Encounters',
      'Poke Radar',
      'Breeding',
      'Masuda Method',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Sinnoh'
  },

  // Generation 3
  {
    name: 'Emerald',
    generation: 3,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 }, // Johto
      { min: 252, max: 386 } // Hoenn
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Hoenn'
  },
  {
    name: 'Fire Red',
    generation: 3,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 252, max: 386 } // Hoenn (post-game)
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Kanto'
  },
  {
    name: 'Leaf Green',
    generation: 3,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 252, max: 386 } // Hoenn (post-game)
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Kanto'
  },
  {
    name: 'Ruby',
    generation: 3,
    odds: 8192,
    pokemonRange: [
      { min: 252, max: 386 } // Hoenn only
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Hoenn'
  },
  {
    name: 'Sapphire',
    generation: 3,
    odds: 8192,
    pokemonRange: [
      { min: 252, max: 386 } // Hoenn only
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Hoenn'
  },

  // Generation 2
  {
    name: 'Crystal',
    generation: 2,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 } // Johto
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Johto'
  },
  {
    name: 'Gold',
    generation: 2,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 } // Johto
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Johto'
  },
  {
    name: 'Silver',
    generation: 2,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 }, // Kanto
      { min: 152, max: 251 } // Johto
    ],
    availableMethods: [
      'Random Encounters',
      'Breeding',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Johto'
  },

  // Generation 1 (no shinies originally, but for ROM hacks)
  {
    name: 'Yellow',
    generation: 1,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 } // Kanto only
    ],
    availableMethods: [
      'Random Encounters',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Kanto'
  },
  {
    name: 'Blue',
    generation: 1,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 } // Kanto only
    ],
    availableMethods: [
      'Random Encounters',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Kanto'
  },
  {
    name: 'Red',
    generation: 1,
    odds: 8192,
    pokemonRange: [
      { min: 1, max: 151 } // Kanto only
    ],
    availableMethods: [
      'Random Encounters',
      'Soft Reset',
      'Static Encounters',
      'Legendary Hunting',
      'Gift Pokemon'
    ],
    region: 'Kanto'
  }
];

// Helper functions
export function isPokemonInGame(pokemonId: number, gameName: string): boolean {
  const game = POKEMON_GAMES.find(g => g.name === gameName);
  if (!game) return false;
  
  return game.pokemonRange.some(range => 
    pokemonId >= range.min && pokemonId <= range.max
  );
}

export function isMethodInGame(method: string, gameName: string): boolean {
  const game = POKEMON_GAMES.find(g => g.name === gameName);
  if (!game) return false;
  // Allow RNG Manipulation as a global method (advanced users)
  if (method === 'RNG Manipulation') return true;
  return game.availableMethods.includes(method);
}

export function getGameInfo(gameName: string): GameInfo | undefined {
  return POKEMON_GAMES.find(g => g.name === gameName);
}

export function getCompatibleGames(pokemonId: number): string[] {
  return POKEMON_GAMES
    .filter(game => isPokemonInGame(pokemonId, game.name))
    .map(game => game.name);
}

export function getCompatibleMethods(gameName: string): string[] {
  const game = POKEMON_GAMES.find(g => g.name === gameName);
  return game ? game.availableMethods : [];
}
