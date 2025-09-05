// PokeAPI service for fetching Pokemon data
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
        front_shiny: string;
      };
      home: {
        front_default: string;
        front_shiny: string;
      };
    };
  };
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonSearchResult {
  name: string;
  id: number;
  sprite: string;
}

class PokeAPIService {
  private pokemonListCache: PokemonListItem[] | null = null;
  private pokemonCache = new Map<string, Pokemon>();

  // Get list of all Pokemon names (cached)
  async getAllPokemonNames(): Promise<string[]> {
    if (this.pokemonListCache) {
      return this.pokemonListCache.map(p => this.formatPokemonName(p.name));
    }

    try {
      // Fetch all Pokemon (up to 1010 for now, covers all current Pokemon)
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=1010`);
      const data = await response.json();
      const list: PokemonListItem[] = data.results;
      this.pokemonListCache = list;
      return list.map(p => this.formatPokemonName(p.name));
    } catch (error) {
      console.error('Failed to fetch Pokemon list:', error);
      return [];
    }
  }

  // Get detailed Pokemon data
  async getPokemon(nameOrId: string | number): Promise<Pokemon | null> {
    const key = nameOrId.toString().toLowerCase();
    
    if (this.pokemonCache.has(key)) {
      return this.pokemonCache.get(key)!;
    }

    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${key}`);
      if (!response.ok) {
        throw new Error(`Pokemon not found: ${nameOrId}`);
      }
      
      const pokemon: Pokemon = await response.json();
      this.pokemonCache.set(key, pokemon);
      return pokemon;
    } catch (error) {
      console.error(`Failed to fetch Pokemon ${nameOrId}:`, error);
      return null;
    }
  }

  // Get shiny sprite URL for a Pokemon
  async getShinySprite(nameOrId: string | number): Promise<string | null> {
    const pokemon = await this.getPokemon(nameOrId);
    if (!pokemon) return null;

    // Try to get the best quality shiny sprite
    const sprites = pokemon.sprites;
    
    // Priority order: official artwork > home > default sprite
    if (sprites.other?.['official-artwork']?.front_shiny) {
      return sprites.other['official-artwork'].front_shiny;
    }
    
    if (sprites.other?.home?.front_shiny) {
      return sprites.other.home.front_shiny;
    }
    
    return sprites.front_shiny || null;
  }

  // Format Pokemon name for display (capitalize first letter of each word)
  private formatPokemonName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Convert display name back to API format
  formatNameForAPI(displayName: string): string {
    return displayName.toLowerCase().replace(/\s+/g, '-');
  }

  // Get Pokemon sprite URL by ID (more efficient than full Pokemon data)
  getPokemonSpriteUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  // Get Pokemon ID from the cached list
  private getPokemonIdFromName(name: string): number | null {
    if (!this.pokemonListCache) return null;
    
    const apiName = this.formatNameForAPI(name);
    const pokemon = this.pokemonListCache.find(p => p.name === apiName);
    if (!pokemon) return null;
    
    // Extract ID from URL: https://pokeapi.co/api/v2/pokemon/25/
    const urlParts = pokemon.url.split('/');
    const id = parseInt(urlParts[urlParts.length - 2]);
    return isNaN(id) ? null : id;
  }

  // Search Pokemon names (for autocomplete)
  async searchPokemon(query: string): Promise<string[]> {
    const allNames = await this.getAllPokemonNames();
    const lowerQuery = query.toLowerCase();
    
    return allNames
      .filter(name => name.toLowerCase().includes(lowerQuery))
      .slice(0, 10); // Limit to 10 results for performance
  }

  // Search Pokemon with sprites (for enhanced autocomplete)
  async searchPokemonWithSprites(query: string): Promise<PokemonSearchResult[]> {
    const allNames = await this.getAllPokemonNames();
    const lowerQuery = query.toLowerCase();
    
    const matchingNames = allNames
      .filter(name => name.toLowerCase().includes(lowerQuery))
      .slice(0, 8); // Limit to 8 results for performance with images
    
    const results: PokemonSearchResult[] = [];
    
    for (const name of matchingNames) {
      const id = this.getPokemonIdFromName(name);
      if (id) {
        results.push({
          name,
          id,
          sprite: this.getPokemonSpriteUrl(id)
        });
      }
    }
    
    return results;
  }
}

export const pokeAPI = new PokeAPIService();
