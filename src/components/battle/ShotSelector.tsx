import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ShotType, DeliveryType, SpecialDeliveryType, FieldPlacement, PlayerCard } from '../../types';
import { SHOT_CONFIGS, DELIVERY_CONFIGS, SPECIAL_DELIVERY_CONFIGS, FIELD_CONFIGS, calculateSuccessRate, getExpectedRuns } from '../../utils/battleEngine';

interface ShotSelectorProps {
  batsman: PlayerCard;
  bowler: PlayerCard;
  onSelectShot: (shot: ShotType) => void;
  disabled?: boolean;
}

interface DeliverySelectorProps {
  batsman: PlayerCard;
  bowler: PlayerCard;
  onSelectDelivery: (delivery: DeliveryType) => void;
  onSelectSpecialDelivery?: (delivery: SpecialDeliveryType) => void;
  specialDeliveryCooldown?: number;  // 0 or undefined = ready, >0 = on cooldown
  disabled?: boolean;
}

export function ShotSelector({ batsman, bowler, onSelectShot, disabled }: ShotSelectorProps) {
  const shotOptions = useMemo(() => {
    return Object.values(SHOT_CONFIGS).map((config) => {
      // Calculate against a "default" delivery for preview
      const successRate = calculateSuccessRate(batsman, bowler, config.type, 'line_length');
      const expectedRuns = getExpectedRuns(config.type, successRate);

      return {
        ...config,
        successRate,
        expectedRuns,
      };
    });
  }, [batsman, bowler]);

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-1">Choose Your Shot</h3>
        <p className="text-sm text-slate-400">
          {batsman.name} facing {bowler.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {shotOptions.map((shot) => (
          <motion.button
            key={shot.type}
            whileHover={!disabled ? { scale: 1.03 } : {}}
            whileTap={!disabled ? { scale: 0.97 } : {}}
            onClick={() => !disabled && onSelectShot(shot.type)}
            disabled={disabled}
            className={`relative p-4 rounded-xl text-left transition-all ${
              disabled
                ? 'bg-slate-700/50 cursor-not-allowed opacity-50'
                : shot.risk === 'low'
                ? 'bg-gradient-to-br from-green-600/20 to-green-800/20 hover:from-green-600/30 hover:to-green-800/30 border border-green-500/30'
                : shot.risk === 'medium'
                ? 'bg-gradient-to-br from-blue-600/20 to-blue-800/20 hover:from-blue-600/30 hover:to-blue-800/30 border border-blue-500/30'
                : shot.risk === 'high'
                ? 'bg-gradient-to-br from-orange-600/20 to-orange-800/20 hover:from-orange-600/30 hover:to-orange-800/30 border border-orange-500/30'
                : 'bg-gradient-to-br from-red-600/20 to-red-800/20 hover:from-red-600/30 hover:to-red-800/30 border border-red-500/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{shot.icon}</span>
              <span className="font-bold text-white">{shot.label}</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Success:</span>
                <span className={`font-medium ${
                  shot.successRate >= 70 ? 'text-green-400' :
                  shot.successRate >= 50 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {shot.successRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Runs:</span>
                <span className="text-white font-medium">{shot.expectedRuns}</span>
              </div>
            </div>

            {/* Risk indicator */}
            <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${
              shot.risk === 'low' ? 'bg-green-500/20 text-green-400' :
              shot.risk === 'medium' ? 'bg-blue-500/20 text-blue-400' :
              shot.risk === 'high' ? 'bg-orange-500/20 text-orange-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {shot.risk.replace('_', ' ')}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Hint */}
      <div className="mt-3 text-center text-xs text-slate-500">
        Higher risk = bigger rewards but more chance of getting out
      </div>
    </div>
  );
}

export function DeliverySelector({ batsman, bowler, onSelectDelivery, onSelectSpecialDelivery, specialDeliveryCooldown, disabled }: DeliverySelectorProps) {
  const deliveryOptions = useMemo(() => {
    return Object.values(DELIVERY_CONFIGS).map((config) => ({
      ...config,
    }));
  }, []);

  // Determine which special delivery the bowler can use (if any)
  const specialDelivery = useMemo(() => {
    const rarity = bowler.rarity;
    if (rarity !== 'epic' && rarity !== 'legendary') return null;

    // Find available special deliveries for this rarity
    const available = Object.values(SPECIAL_DELIVERY_CONFIGS).filter(sd => {
      if (sd.requiredRarity === 'legendary' && rarity !== 'legendary') return false;
      return true;
    });

    if (available.length === 0) return null;

    // Pick a consistent special delivery based on bowler id hash
    const hash = bowler.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return available[hash % available.length];
  }, [bowler]);

  const isOnCooldown = (specialDeliveryCooldown ?? 0) > 0;

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-1">Choose Your Delivery</h3>
        <p className="text-sm text-slate-400">
          {bowler.name} bowling to {batsman.name}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {deliveryOptions.map((delivery) => (
          <motion.button
            key={delivery.type}
            whileHover={!disabled ? { scale: 1.03 } : {}}
            whileTap={!disabled ? { scale: 0.97 } : {}}
            onClick={() => !disabled && onSelectDelivery(delivery.type)}
            disabled={disabled}
            className={`relative p-4 rounded-xl text-left transition-all ${
              disabled
                ? 'bg-slate-700/50 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-br from-slate-600/50 to-slate-700/50 hover:from-slate-600/70 hover:to-slate-700/70 border border-slate-500/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{delivery.icon}</span>
              <span className="font-bold text-white">{delivery.label}</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Wicket chance:</span>
                <span className={`font-medium ${
                  delivery.wicketChance >= 12 ? 'text-green-400' :
                  delivery.wicketChance >= 8 ? 'text-yellow-400' :
                  'text-slate-300'
                }`}>
                  +{delivery.wicketChance}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Run modifier:</span>
                <span className={`font-medium ${
                  delivery.runModifier < 0 ? 'text-green-400' :
                  delivery.runModifier > 0 ? 'text-red-400' :
                  'text-slate-300'
                }`}>
                  {delivery.runModifier > 0 ? '+' : ''}{delivery.runModifier}
                </span>
              </div>
            </div>
          </motion.button>
        ))}

        {/* Special delivery (5th option for epic/legendary bowlers) */}
        {specialDelivery && onSelectSpecialDelivery && (
          <motion.button
            whileHover={!disabled && !isOnCooldown ? { scale: 1.03 } : {}}
            whileTap={!disabled && !isOnCooldown ? { scale: 0.97 } : {}}
            onClick={() => !disabled && !isOnCooldown && onSelectSpecialDelivery(specialDelivery.type)}
            disabled={disabled || isOnCooldown}
            className={`relative p-4 rounded-xl text-left transition-all col-span-2 ${
              disabled || isOnCooldown
                ? 'bg-slate-700/50 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-br from-purple-600/30 to-amber-600/30 hover:from-purple-600/40 hover:to-amber-600/40 border border-purple-500/40'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{specialDelivery.icon}</span>
              <span className="font-bold text-white">{specialDelivery.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ml-auto ${
                specialDelivery.requiredRarity === 'legendary'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {specialDelivery.requiredRarity}
              </span>
            </div>

            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-slate-400">Wicket: </span>
                <span className="text-green-400 font-medium">+{specialDelivery.wicketChance}%</span>
              </div>
              <div>
                <span className="text-slate-400">Extra risk: </span>
                <span className="text-red-400 font-medium">{specialDelivery.extraChance}%</span>
              </div>
              {isOnCooldown && (
                <div className="ml-auto">
                  <span className="text-amber-400 font-medium">Cooldown: {specialDeliveryCooldown} balls</span>
                </div>
              )}
            </div>
          </motion.button>
        )}
      </div>

      {/* Hint */}
      <div className="mt-3 text-center text-xs text-slate-500">
        {specialDelivery
          ? 'Special delivery has higher wicket chance but risk of extras'
          : 'Yorkers are harder to hit but riskier to bowl'
        }
      </div>
    </div>
  );
}

interface FieldPlacementSelectorProps {
  onSelectField: (field: FieldPlacement) => void;
}

export function FieldPlacementSelector({ onSelectField }: FieldPlacementSelectorProps) {
  const fieldOptions = Object.values(FIELD_CONFIGS);

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-white mb-1">Set Your Field</h3>
        <p className="text-sm text-slate-400">
          Choose field placement for this over
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {fieldOptions.map((field) => (
          <motion.button
            key={field.type}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectField(field.type)}
            className={`relative p-4 rounded-xl text-left transition-all ${
              field.type === 'aggressive'
                ? 'bg-gradient-to-br from-red-600/20 to-red-800/20 hover:from-red-600/30 hover:to-red-800/30 border border-red-500/30'
                : field.type === 'defensive'
                ? 'bg-gradient-to-br from-blue-600/20 to-blue-800/20 hover:from-blue-600/30 hover:to-blue-800/30 border border-blue-500/30'
                : field.type === 'slip_cordon'
                ? 'bg-gradient-to-br from-amber-600/20 to-amber-800/20 hover:from-amber-600/30 hover:to-amber-800/30 border border-amber-500/30'
                : 'bg-gradient-to-br from-green-600/20 to-green-800/20 hover:from-green-600/30 hover:to-green-800/30 border border-green-500/30'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{field.icon}</span>
              <span className="font-bold text-white">{field.label}</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Wicket:</span>
                <span className={`font-medium ${
                  field.wicketModifier > 0 ? 'text-green-400' :
                  field.wicketModifier < 0 ? 'text-red-400' :
                  'text-slate-300'
                }`}>
                  {field.wicketModifier > 0 ? '+' : ''}{field.wicketModifier}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Runs leak:</span>
                <span className={`font-medium ${
                  field.runModifier > 0 ? 'text-red-400' :
                  field.runModifier < 0 ? 'text-green-400' :
                  'text-slate-300'
                }`}>
                  {field.runModifier > 0 ? '+' : ''}{field.runModifier}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Boundary:</span>
                <span className={`font-medium ${
                  field.boundaryModifier > 0 ? 'text-red-400' :
                  field.boundaryModifier < 0 ? 'text-green-400' :
                  'text-slate-300'
                }`}>
                  {field.boundaryModifier > 0 ? '+' : ''}{field.boundaryModifier}%
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-3 text-center text-xs text-slate-500">
        Field setting applies for the entire over
      </div>
    </div>
  );
}
