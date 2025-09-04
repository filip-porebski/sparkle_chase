import { useState, useCallback } from 'react';

export interface CardConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  props?: any;
  side: 'left' | 'right';
  isCollapsed: boolean;
  order: number;
}

export interface CardLayoutState {
  cards: CardConfig[];
}

const DEFAULT_CARDS: CardConfig[] = [
  {
    id: 'hunts',
    title: 'Hunts',
    component: null as any, // Will be set when used
    side: 'right',
    isCollapsed: false,
    order: 0
  },
  {
    id: 'statistics',
    title: 'Statistics',
    component: null as any, // Will be set when used
    side: 'left',
    isCollapsed: false,
    order: 0
  }
];

export const useCardLayout = () => {
  const [cardLayout, setCardLayout] = useState<CardLayoutState>({
    cards: DEFAULT_CARDS
  });

  const moveCard = useCallback((cardId: string, targetSide: 'left' | 'right') => {
    setCardLayout(prev => ({
      ...prev,
      cards: prev.cards.map(card => 
        card.id === cardId 
          ? { ...card, side: targetSide }
          : card
      )
    }));
  }, []);

  const toggleCardCollapse = useCallback((cardId: string) => {
    setCardLayout(prev => ({
      ...prev,
      cards: prev.cards.map(card => 
        card.id === cardId 
          ? { ...card, isCollapsed: !card.isCollapsed }
          : card
      )
    }));
  }, []);

  const updateCardProps = useCallback((cardId: string, props: any) => {
    setCardLayout(prev => ({
      ...prev,
      cards: prev.cards.map(card => 
        card.id === cardId 
          ? { ...card, props }
          : card
      )
    }));
  }, []);

  const getCardsByPosition = useCallback((side: 'left' | 'right') => {
    return cardLayout.cards
      .filter(card => card.side === side)
      .sort((a, b) => a.order - b.order);
  }, [cardLayout.cards]);

  const getCard = useCallback((cardId: string) => {
    return cardLayout.cards.find(card => card.id === cardId);
  }, [cardLayout.cards]);

  return {
    cardLayout,
    moveCard,
    toggleCardCollapse,
    updateCardProps,
    getCardsByPosition,
    getCard
  };
};