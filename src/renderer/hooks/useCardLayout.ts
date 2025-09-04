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

  const moveCardToPosition = useCallback((cardId: string, targetSide: 'left' | 'right', targetIndex: number) => {
    setCardLayout(prev => {
      const cards = [...prev.cards];
      const moving = cards.find(c => c.id === cardId);
      if (!moving) return prev;

      // Build target side list without moving card
      const targetList = cards
        .filter(c => c.id !== cardId && c.side === targetSide)
        .sort((a, b) => a.order - b.order);

      const clampedIndex = Math.max(0, Math.min(targetIndex, targetList.length));
      const newMoving = { ...moving, side: targetSide } as CardConfig;
      const newList = [
        ...targetList.slice(0, clampedIndex),
        newMoving,
        ...targetList.slice(clampedIndex)
      ].map((c, idx) => ({ ...c, order: idx }));

      // Merge back orders into cards
      const updated = cards.map(c => {
        if (c.id === cardId) {
          const updatedMoving = newList.find(nc => nc.id === cardId)!;
          return updatedMoving;
        }
        if (c.side === targetSide) {
          const match = newList.find(nc => nc.id === c.id);
          return match ? match : c;
        }
        return c;
      });

      return { ...prev, cards: updated };
    });
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
    moveCardToPosition,
    toggleCardCollapse,
    updateCardProps,
    getCardsByPosition,
    getCard
  };
};
