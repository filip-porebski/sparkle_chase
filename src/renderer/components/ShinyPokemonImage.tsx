import React, { useState, useEffect } from 'react';
import { pokeAPI } from '../services/pokeapi';

interface ShinyPokemonImageProps {
  pokemonName: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const ShinyPokemonImage: React.FC<ShinyPokemonImageProps> = ({
  pokemonName,
  size = 'medium',
  showLabel = true
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sizeMap = {
    small: '80px',
    medium: '120px',
    large: '160px'
  };

  useEffect(() => {
    const fetchShinySprite = async () => {
      if (!pokemonName.trim()) {
        setImageUrl(null);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const apiName = pokeAPI.formatNameForAPI(pokemonName);
        const spriteUrl = await pokeAPI.getShinySprite(apiName);
        
        if (spriteUrl) {
          setImageUrl(spriteUrl);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch shiny sprite:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchShinySprite();
  }, [pokemonName]);

  if (!pokemonName.trim()) {
    return (
      <div style={{
        width: sizeMap[size],
        height: sizeMap[size],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--sc-bg-elev-2)',
        border: '1px solid var(--sc-border)',
        borderRadius: 'var(--sc-radius-lg)',
        color: 'var(--sc-text-muted)',
        fontSize: 'var(--sc-fs-sm)',
        textAlign: 'center'
      }}>
        Select a Pokemon
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        width: sizeMap[size],
        height: sizeMap[size],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--sc-bg-elev-2)',
        border: '1px solid var(--sc-border)',
        borderRadius: 'var(--sc-radius-lg)',
        color: 'var(--sc-text-muted)',
        fontSize: 'var(--sc-fs-sm)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: 'var(--sc-space-1)' }}>✨</div>
        <div>Loading...</div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div style={{
        width: sizeMap[size],
        height: sizeMap[size],
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--sc-bg-elev-2)',
        border: '1px solid var(--sc-border)',
        borderRadius: 'var(--sc-radius-lg)',
        color: 'var(--sc-text-muted)',
        fontSize: 'var(--sc-fs-sm)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: 'var(--sc-space-1)' }}>❓</div>
        <div>Not found</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--sc-space-2)'
    }}>
      <div style={{
        width: sizeMap[size],
        height: sizeMap[size],
        background: 'var(--sc-bg-shiny)',
        border: '2px solid var(--sc-shiny)',
        borderRadius: 'var(--sc-radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img
          src={imageUrl}
          alt={`Shiny ${pokemonName}`}
          style={{
            width: '90%',
            height: '90%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}
          onError={() => setError(true)}
        />
        
        {/* Sparkle effect overlay */}
        <div style={{
          position: 'absolute',
          top: 'var(--sc-space-1)',
          right: 'var(--sc-space-1)',
          fontSize: '16px',
          color: 'var(--sc-shiny)',
          textShadow: '0 0 4px rgba(253, 224, 71, 0.8)'
        }}>
          ✨
        </div>
      </div>
      
      {showLabel && (
        <div style={{
          fontSize: 'var(--sc-fs-sm)',
          fontWeight: 'var(--sc-fw-medium)',
          color: 'var(--sc-text)',
          textAlign: 'center'
        }}>
          Shiny {pokemonName}
        </div>
      )}
    </div>
  );
};