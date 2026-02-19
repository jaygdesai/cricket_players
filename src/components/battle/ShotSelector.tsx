import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ShotType, DeliveryType, PlayerCard } from '../../types';
import { SHOT_CONFIGS, DELIVERY_CONFIGS, calculateSuccessRate, getExpectedRuns } from '../../utils/battleEngine';

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

export function DeliverySelector({ batsman, bowler, onSelectDelivery, disabled }: DeliverySelectorProps) {
  const deliveryOptions = useMemo(() => {
    return Object.values(DELIVERY_CONFIGS).map((config) => ({
      ...config,
    }));
  }, []);

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
      </div>

      {/* Hint */}
      <div className="mt-3 text-center text-xs text-slate-500">
        Yorkers are harder to hit but riskier to bowl
      </div>
    </div>
  );
}
