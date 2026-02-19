import { useBattleStore } from '../store/battleStore';
import MatchSetup from '../components/battle/MatchSetup';
import BattleArena from '../components/battle/BattleArena';

export default function Battle() {
  const phase = useBattleStore((s) => s.phase);
  const playerTeam = useBattleStore((s) => s.playerTeam);
  const performToss = useBattleStore((s) => s.performToss);

  // Show setup screen if no teams selected
  if (phase === 'setup' || !playerTeam) {
    return <MatchSetup onStartMatch={performToss} />;
  }

  // Show battle arena once match starts
  return <BattleArena />;
}
