import { motion } from 'framer-motion';
import { useBattleStore } from '../../store/battleStore';
import { formatOvers, calculateRequiredRunRate } from '../../utils/battleEngine';

export default function Scoreboard() {
  const {
    playerTeam,
    opponentTeam,
    playerInnings,
    opponentInnings,
    currentInnings,
    playerBattingFirst,
    firstInningsScore,
    totalBalls,
  } = useBattleStore();

  const isPlayerBatting = currentInnings === 1
    ? playerBattingFirst
    : !playerBattingFirst;

  const battingInnings = isPlayerBatting ? playerInnings : opponentInnings;
  const battingTeam = isPlayerBatting ? playerTeam : opponentTeam;
  const bowlingTeam = isPlayerBatting ? opponentTeam : playerTeam;

  const ballsRemaining = totalBalls - battingInnings.balls;
  const target = currentInnings === 2 ? (firstInningsScore ?? 0) + 1 : null;
  const runsNeeded = target ? target - battingInnings.runs : null;
  const requiredRunRate = runsNeeded && ballsRemaining > 0
    ? calculateRequiredRunRate(runsNeeded, ballsRemaining)
    : null;

  const currentRunRate = battingInnings.balls > 0
    ? (battingInnings.runs / battingInnings.balls) * 6
    : 0;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-slate-800 rounded-xl p-4 mb-4"
    >
      {/* Teams header */}
      <div className="flex justify-between items-center mb-3">
        <div className={`flex items-center gap-2 ${isPlayerBatting ? 'text-amber-400' : 'text-slate-400'}`}>
          <span className="text-lg">{battingTeam?.flag}</span>
          <span className="font-semibold text-sm">{battingTeam?.name}</span>
          {isPlayerBatting && <span className="text-xs">(You)</span>}
        </div>
        <div className="text-slate-500 text-xs">vs</div>
        <div className={`flex items-center gap-2 ${!isPlayerBatting ? 'text-amber-400' : 'text-slate-400'}`}>
          <span className="font-semibold text-sm">{bowlingTeam?.name}</span>
          {!isPlayerBatting && <span className="text-xs">(You)</span>}
          <span className="text-lg">{bowlingTeam?.flag}</span>
        </div>
      </div>

      {/* Score display */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-center">
          <div className="text-3xl font-black text-white">
            {battingInnings.runs}/{battingInnings.wickets}
          </div>
          <div className="text-sm text-slate-400">
            ({formatOvers(battingInnings.balls)} ov)
          </div>
        </div>

        {target && (
          <div className="text-center bg-slate-700 rounded-lg px-4 py-2">
            <div className="text-xs text-slate-400">Target</div>
            <div className="text-xl font-bold text-amber-400">{target}</div>
          </div>
        )}

        <div className="text-right">
          {currentInnings === 2 && runsNeeded !== null && (
            <div>
              <div className="text-lg font-bold text-white">
                Need {runsNeeded > 0 ? runsNeeded : 0}
              </div>
              <div className="text-sm text-slate-400">
                from {ballsRemaining} balls
              </div>
            </div>
          )}
          {currentInnings === 1 && (
            <div>
              <div className="text-lg font-bold text-white">
                {ballsRemaining}
              </div>
              <div className="text-sm text-slate-400">balls left</div>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-xs">
        <div className="flex gap-4">
          <div>
            <span className="text-slate-500">CRR: </span>
            <span className="text-white font-medium">{currentRunRate.toFixed(2)}</span>
          </div>
          {requiredRunRate && (
            <div>
              <span className="text-slate-500">RRR: </span>
              <span className={`font-medium ${requiredRunRate > 12 ? 'text-red-400' : requiredRunRate > 8 ? 'text-yellow-400' : 'text-green-400'}`}>
                {requiredRunRate.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        <div className="text-slate-500">
          Innings {currentInnings} of 2
        </div>
      </div>

      {/* Ball-by-ball summary */}
      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="text-xs text-slate-500 mb-1">This over:</div>
        <div className="flex gap-1 flex-wrap">
          {battingInnings.ballHistory
            .slice(-battingInnings.ballsThisOver || -6)
            .map((ball, i) => (
              <span
                key={i}
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                  ball.isWicket
                    ? 'bg-red-500 text-white'
                    : ball.runs === 6
                    ? 'bg-green-500 text-white'
                    : ball.runs === 4
                    ? 'bg-blue-500 text-white'
                    : ball.isExtra
                    ? 'bg-yellow-500 text-black'
                    : ball.runs === 0
                    ? 'bg-slate-600 text-slate-300'
                    : 'bg-slate-700 text-white'
                }`}
              >
                {ball.isWicket ? 'W' : ball.isExtra ? (ball.extraType === 'wide' ? 'Wd' : 'Nb') : ball.runs}
              </span>
            ))}
          {battingInnings.ballHistory.length === 0 && (
            <span className="text-slate-500 text-xs">No balls bowled yet</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
