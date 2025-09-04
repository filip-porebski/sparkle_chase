import React, { useState, useEffect, useRef } from 'react';
import { pokeAPI, PokemonSearchResult } from '../services/pokeapi';

interface PokemonAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const PokemonAutocomplete: React.FC<PokemonAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "e.g., Pikachu",
  className = "sc-input",
  required = false
}) => {
  const [suggestions, setSuggestions] = useState<PokemonSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonSearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchPokemon = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedPokemon(null);
        return;
      }

      setLoading(true);
      try {
        const results = await pokeAPI.searchPokemonWithSprites(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        
        // Check if current value matches exactly with a Pokemon
        const exactMatch = results.find(r => r.name.toLowerCase() === value.toLowerCase());
        setSelectedPokemon(exactMatch || null);
      } catch (error) {
        console.error('Failed to search Pokemon:', error);
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedPokemon(null);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchPokemon, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: PokemonSearchResult) => {
    onChange(suggestion.name);
    setSelectedPokemon(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {selectedPokemon && (
          <img
            src={selectedPokemon.sprite}
            alt={selectedPokemon.name}
            style={{
              position: 'absolute',
              left: 'var(--sc-space-2)',
              width: '20px',
              height: '20px',
              zIndex: 1,
              pointerEvents: 'none'
            }}
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className={className}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          style={{
            paddingLeft: selectedPokemon ? '32px' : 'var(--sc-space-3)'
          }}
        />
      </div>
      
      {loading && (
        <div style={{
          position: 'absolute',
          right: 'var(--sc-space-3)',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 'var(--sc-fs-sm)',
          color: 'var(--sc-text-muted)'
        }}>
          🔍
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--sc-bg-elev-1)',
            border: '1px solid var(--sc-border)',
            borderRadius: 'var(--sc-radius-md)',
            boxShadow: 'var(--sc-shadow)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: 'var(--sc-space-2) var(--sc-space-3)',
                cursor: 'pointer',
                fontSize: 'var(--sc-fs-sm)',
                borderBottom: index < suggestions.length - 1 ? '1px solid var(--sc-border)' : 'none',
                transition: 'background-color 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sc-space-2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--sc-bg-elev-2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <img
                src={suggestion.sprite}
                alt={suggestion.name}
                style={{
                  width: '20px',
                  height: '20px',
                  flexShrink: 0
                }}
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span>{suggestion.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};