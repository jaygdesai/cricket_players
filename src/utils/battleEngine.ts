import type { PlayerCard, ShotType, DeliveryType, ShotConfig, DeliveryConfig, BallOutcome } from '../types';

// Shot configurations
export const SHOT_CONFIGS: Record<ShotType, ShotConfig> = {
  defend: {
    type: 'defend',
    label: 'Defend',
    icon: '🛡️',
    risk: 'low',
    minRuns: 0,
    maxRuns: 1,
    baseSuccessRate: 90,
    statModifier: 'battingAvg',
  },
  push: {
    type: 'push',
    label: 'Push',
    icon: '➡️',
    risk: 'medium',
    minRuns: 1,
    maxRuns: 2,
    baseSuccessRate: 75,
    statModifier: 'battingAvg',
  },
  attack: {
    type: 'attack',
    label: 'Attack',
    icon: '⚡',
    risk: 'high',
    minRuns: 2,
    maxRuns: 4,
    baseSuccessRate: 55,
    statModifier: 'rating',
  },
  slog: {
    type: 'slog',
    label: 'Slog',
    icon: '💥',
    risk: 'very_high',
    minRuns: 4,
    maxRuns: 6,
    baseSuccessRate: 35,
    statModifier: 'highScore',
  },
};

// Delivery configurations
export const DELIVERY_CONFIGS: Record<DeliveryType, DeliveryConfig> = {
  line_length: {
    type: 'line_length',
    label: 'Line & Length',
    icon: '🎯',
    wicketChance: 5,
    runModifier: -1,
  },
  yorker: {
    type: 'yorker',
    label: 'Yorker',
    icon: '⬇️',
    wicketChance: 15,
    runModifier: -2,
  },
  bouncer: {
    type: 'bouncer',
    label: 'Bouncer',
    icon: '⬆️',
    wicketChance: 12,
    runModifier: 1,
  },
  slower: {
    type: 'slower',
    label: 'Slower Ball',
    icon: '🐢',
    wicketChance: 10,
    runModifier: 0,
  },
};

// Shot-delivery matchups (rock-paper-scissors element)
const MATCHUP_BONUS: Record<ShotType, Record<DeliveryType, number>> = {
  defend: {
    line_length: 10,
    yorker: -5,
    bouncer: 5,
    slower: 0,
  },
  push: {
    line_length: 5,
    yorker: -10,
    bouncer: 0,
    slower: 5,
  },
  attack: {
    line_length: -5,
    yorker: -15,
    bouncer: 10,
    slower: -5,
  },
  slog: {
    line_length: -10,
    yorker: -20,
    bouncer: 15,
    slower: -10,
  },
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStatValue(player: PlayerCard, stat: 'battingAvg' | 'rating' | 'highScore'): number {
  const value = player.stats[stat];
  // Normalize stats to 0-100 scale
  if (stat === 'battingAvg') return Math.min(value * 2, 100);
  if (stat === 'highScore') return Math.min(value / 3, 100);
  return value;
}

export function calculateSuccessRate(
  batsman: PlayerCard,
  bowler: PlayerCard,
  shotType: ShotType,
  deliveryType: DeliveryType
): number {
  const shotConfig = SHOT_CONFIGS[shotType];
  const deliveryConfig = DELIVERY_CONFIGS[deliveryType];

  // Base chance from shot type
  let successRate = shotConfig.baseSuccessRate;

  // Add batsman stat bonus (0.5x multiplier)
  const batsmanStat = getStatValue(batsman, shotConfig.statModifier);
  successRate += batsmanStat * 0.5;

  // Subtract bowler stat penalty (0.3x multiplier)
  const bowlerStat = bowler.stats.bowlingAvg > 0
    ? 100 - bowler.stats.bowlingAvg // Lower bowling avg = better
    : bowler.stats.rating * 0.5;
  successRate -= bowlerStat * 0.3;

  // Add matchup bonus
  successRate += MATCHUP_BONUS[shotType][deliveryType];

  // Subtract delivery wicket chance
  successRate -= deliveryConfig.wicketChance;

  // Add random factor (10-20%)
  const randomFactor = randomBetween(-10, 10);
  successRate += randomFactor;

  // Clamp between 5 and 95
  return Math.max(5, Math.min(95, Math.round(successRate)));
}

export function simulateBall(
  batsman: PlayerCard,
  bowler: PlayerCard,
  shotType: ShotType,
  deliveryType: DeliveryType
): BallOutcome {
  const shotConfig = SHOT_CONFIGS[shotType];
  const deliveryConfig = DELIVERY_CONFIGS[deliveryType];
  const successRate = calculateSuccessRate(batsman, bowler, shotType, deliveryType);

  // Roll for success
  const roll = randomBetween(1, 100);
  const isSuccess = roll <= successRate;

  // Check for extras (5% chance each)
  const extraRoll = randomBetween(1, 100);
  if (extraRoll <= 3) {
    return {
      runs: 1,
      isWicket: false,
      isExtra: true,
      extraType: 'wide',
      description: 'Wide ball! Extra run.',
      shotType,
      deliveryType,
    };
  }
  if (extraRoll <= 5) {
    return {
      runs: 1,
      isWicket: false,
      isExtra: true,
      extraType: 'no_ball',
      description: 'No ball! Free hit next ball.',
      shotType,
      deliveryType,
    };
  }

  if (isSuccess) {
    // Calculate runs scored
    let runs = randomBetween(shotConfig.minRuns, shotConfig.maxRuns);
    runs = Math.max(0, runs + deliveryConfig.runModifier);

    // Boundary check for high runs
    if (runs >= 4) {
      const boundaryRoll = randomBetween(1, 100);
      if (boundaryRoll <= 40) {
        runs = 6;
      } else {
        runs = 4;
      }
    }

    const descriptions = getRunDescription(runs, batsman.name, shotType);

    return {
      runs,
      isWicket: false,
      isExtra: false,
      description: descriptions,
      shotType,
      deliveryType,
    };
  } else {
    // Failed shot - check for wicket
    const wicketChance = deliveryConfig.wicketChance + (100 - successRate) * 0.3;
    const wicketRoll = randomBetween(1, 100);

    if (wicketRoll <= wicketChance) {
      const dismissalTypes = ['bowled', 'caught', 'lbw', 'stumped', 'run out'];
      const dismissal = dismissalTypes[randomBetween(0, dismissalTypes.length - 1)];

      return {
        runs: 0,
        isWicket: true,
        isExtra: false,
        description: `OUT! ${batsman.name} is ${dismissal}! ${bowler.name} strikes!`,
        shotType,
        deliveryType,
      };
    }

    // Dot ball or edge
    const edgeRuns = randomBetween(0, 1);
    return {
      runs: edgeRuns,
      isWicket: false,
      isExtra: false,
      description: edgeRuns === 0
        ? `Dot ball! Good delivery from ${bowler.name}.`
        : `Edge! Lucky single for ${batsman.name}.`,
      shotType,
      deliveryType,
    };
  }
}

function getRunDescription(runs: number, batsmanName: string, shotType: ShotType): string {
  const shotConfig = SHOT_CONFIGS[shotType];

  if (runs === 0) {
    return `Dot ball! Well played defensively.`;
  }
  if (runs === 1) {
    return `Single taken. ${batsmanName} rotates strike.`;
  }
  if (runs === 2) {
    return `Two runs! Good running between wickets.`;
  }
  if (runs === 3) {
    return `Three runs! Excellent placement by ${batsmanName}.`;
  }
  if (runs === 4) {
    return `FOUR! ${batsmanName} finds the boundary with a brilliant ${shotConfig.label.toLowerCase()}!`;
  }
  if (runs === 6) {
    return `SIX! ${batsmanName} launches it into the stands! Massive hit!`;
  }
  return `${runs} runs scored.`;
}

export function selectAIShot(
  batsman: PlayerCard,
  _bowler: PlayerCard,
  currentRuns: number,
  target: number | null,
  ballsRemaining: number,
  wicketsRemaining: number
): ShotType {
  // AI shot selection based on game situation
  const runRate = target ? (target - currentRuns) / (ballsRemaining / 6) : 0;

  // Base probabilities
  let probabilities: Record<ShotType, number> = {
    defend: 25,
    push: 35,
    attack: 25,
    slog: 15,
  };

  // Adjust based on required run rate
  if (target) {
    if (runRate > 12) {
      probabilities = { defend: 5, push: 15, attack: 35, slog: 45 };
    } else if (runRate > 8) {
      probabilities = { defend: 10, push: 25, attack: 40, slog: 25 };
    } else if (runRate > 6) {
      probabilities = { defend: 20, push: 35, attack: 30, slog: 15 };
    } else if (runRate < 4) {
      probabilities = { defend: 35, push: 40, attack: 20, slog: 5 };
    }
  }

  // Adjust based on wickets in hand
  if (wicketsRemaining <= 2) {
    probabilities.slog = Math.max(0, probabilities.slog - 10);
    probabilities.attack = Math.max(0, probabilities.attack - 5);
    probabilities.defend += 10;
    probabilities.push += 5;
  }

  // Adjust based on batsman stats
  if (batsman.stats.rating > 90) {
    probabilities.attack += 10;
    probabilities.slog += 5;
    probabilities.defend -= 10;
  }

  // Select shot based on weighted probabilities
  const total = Object.values(probabilities).reduce((a, b) => a + b, 0);
  let roll = randomBetween(1, total);

  for (const [shot, prob] of Object.entries(probabilities)) {
    roll -= prob;
    if (roll <= 0) return shot as ShotType;
  }

  return 'push';
}

export function selectAIDelivery(
  batsman: PlayerCard,
  bowler: PlayerCard,
  oversRemaining: number,
  wicketsNeeded: number
): DeliveryType {
  // AI delivery selection based on game situation
  let probabilities: Record<DeliveryType, number> = {
    line_length: 40,
    yorker: 20,
    bouncer: 20,
    slower: 20,
  };

  // Death overs - more yorkers
  if (oversRemaining <= 2) {
    probabilities = { line_length: 25, yorker: 40, bouncer: 15, slower: 20 };
  }

  // Need wickets urgently
  if (wicketsNeeded <= 2 && oversRemaining > 2) {
    probabilities = { line_length: 30, yorker: 30, bouncer: 25, slower: 15 };
  }

  // Against aggressive batsman - mix it up
  if (batsman.stats.rating > 90) {
    probabilities.slower += 10;
    probabilities.line_length -= 10;
  }

  // Bowler specialty (based on bowling avg)
  if (bowler.stats.bowlingAvg > 0 && bowler.stats.bowlingAvg < 25) {
    probabilities.yorker += 10;
    probabilities.bouncer += 5;
  }

  const total = Object.values(probabilities).reduce((a, b) => a + b, 0);
  let roll = randomBetween(1, total);

  for (const [delivery, prob] of Object.entries(probabilities)) {
    roll -= prob;
    if (roll <= 0) return delivery as DeliveryType;
  }

  return 'line_length';
}

export function calculateMatchRewards(
  won: boolean,
  wicketsLost: number,
  runsScored: number,
  target: number | null
): { coins: number; xp: number; trophyPoints: number; bonuses: string[] } {
  let coins = won ? 100 : 25;
  let xp = won ? 50 : 20;
  let trophyPoints = won ? 3 : 1;
  const bonuses: string[] = [];

  // Perfect innings bonus (no wickets lost while batting)
  if (won && wicketsLost === 0) {
    coins += 50;
    xp += 25;
    trophyPoints += 1;
    bonuses.push('Perfect Innings (+50 coins)');
  }

  // Big win bonus (won by 30+ runs or 5+ wickets)
  if (won && target && runsScored >= target + 30) {
    coins += 25;
    bonuses.push('Dominant Victory (+25 coins)');
  }

  // Century bonus
  if (runsScored >= 100) {
    coins += 15;
    bonuses.push('Century Scored (+15 coins)');
  }

  return { coins, xp, trophyPoints, bonuses };
}

export function getExpectedRuns(shotType: ShotType, _successRate: number): string {
  const config = SHOT_CONFIGS[shotType];
  return `${config.minRuns}-${config.maxRuns} runs`;
}

export function formatOvers(balls: number): string {
  const overs = Math.floor(balls / 6);
  const ballsInOver = balls % 6;
  return `${overs}.${ballsInOver}`;
}

export function calculateRequiredRunRate(runsNeeded: number, ballsRemaining: number): number {
  if (ballsRemaining <= 0) return 0;
  return (runsNeeded / ballsRemaining) * 6;
}
