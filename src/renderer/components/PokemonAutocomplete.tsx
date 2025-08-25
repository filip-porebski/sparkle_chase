import React, { useState, useEffect, useRef } from 'react';
import { pokeAPI } from '../services/pokeapi';

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchPokemon = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const results = await pokeAPI.searchPokemon(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error('Failed to search Pokemon:', error);
        setSuggestions([]);
        setShowSuggestions(false);
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

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
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
      />
      
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
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: 'var(--sc-space-2) var(--sc-space-3)',
                cursor: 'pointer',
                fontSize: 'var(--sc-fs-sm)',
                borderBottom: index < suggestions.length - 1 ? '1px solid var(--sc-border)' : 'none',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--sc-bg-elev-2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};