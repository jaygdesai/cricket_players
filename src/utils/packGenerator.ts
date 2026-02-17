import type { CardPack, PlayerCard } from '../types';
import { players } from '../data/players';

export const PACK_TYPES: CardPack[] = [
  {
    id: 'bronze',
    name: 'Bronze Pack',
    price: 50,
    cardCount: 3,
    rarityWeights: { common: 0.75, rare: 0.20, epic: 0.04, legendary: 0.01 },
    image: '🥉',
  },
  {
    id: 'silver',
    name: 'Silver Pack',
    price: 150,
    cardCount: 5,
    rarityWeights: { common: 0.50, rare: 0.35, epic: 0.12, legendary: 0.03 },
    image: '🥈',
  },
  {
    id: 'gold',
    name: 'Gold Pack',
    price: 300,
    cardCount: 7,
    rarityWeights: { common: 0.25, rare: 0.40, epic: 0.25, legendary: 0.10 },
    image: '🥇',
  },
];

function pickRarity(weights: CardPack['rarityWeights']): PlayerCard['rarity'] {
  const rand = Math.random();
  let cumulative = 0;
  for (const [rarity, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand <= cumulative) return rarity as PlayerCard['rarity'];
  }
  return 'common';
}

export function openPack(pack: CardPack): PlayerCard[] {
  const cards: PlayerCard[] = [];
  for (let i = 0; i < pack.cardCount; i++) {
    const rarity = pickRarity(pack.rarityWeights);
    const pool = players.filter(p => p.rarity === rarity);
    if (pool.length > 0) {
      const card = pool[Math.floor(Math.random() * pool.length)];
      cards.push(card);
    } else {
      const fallback = players[Math.floor(Math.random() * players.length)];
      cards.push(fallback);
    }
  }
  return cards;
}

export function getStreakRewardCard(): PlayerCard {
  const rareAndAbove = players.filter(p => p.rarity !== 'common');
  return rareAndAbove[Math.floor(Math.random() * rareAndAbove.length)];
}
