import { ref, set, onValue, get, update, push } from 'firebase/database';
import { rtdb } from './config';
import type { BattleState } from '../types';

export const createBattle = async (player1Uid: string, player1Name: string, questionIds: string[]): Promise<string> => {
  const battleRef = push(ref(rtdb, 'battles'));
  const battle: BattleState = {
    battleId: battleRef.key!,
    player1: { uid: player1Uid, displayName: player1Name, score: 0, answers: [] },
    player2: { uid: '', displayName: '', score: 0, answers: [] },
    questions: questionIds,
    currentQuestion: 0,
    status: 'waiting',
    createdAt: new Date().toISOString(),
  };
  await set(battleRef, battle);
  return battleRef.key!;
};

export const joinBattle = async (battleId: string, player2Uid: string, player2Name: string): Promise<void> => {
  await update(ref(rtdb, `battles/${battleId}`), {
    'player2/uid': player2Uid,
    'player2/displayName': player2Name,
    status: 'active',
  });
};

export const submitAnswer = async (battleId: string, playerKey: 'player1' | 'player2', answerIndex: number, newScore: number): Promise<void> => {
  const battleRef = ref(rtdb, `battles/${battleId}`);
  const snap = await get(battleRef);
  const battle = snap.val() as BattleState;
  const answers = [...battle[playerKey].answers, answerIndex];
  await update(ref(rtdb, `battles/${battleId}/${playerKey}`), { answers, score: newScore });
};

export const onBattleUpdate = (battleId: string, callback: (battle: BattleState) => void) => {
  return onValue(ref(rtdb, `battles/${battleId}`), (snap) => {
    if (snap.exists()) callback(snap.val() as BattleState);
  });
};

export const findOpenBattle = async (): Promise<string | null> => {
  const snap = await get(ref(rtdb, 'battles'));
  if (!snap.exists()) return null;
  const battles = snap.val();
  for (const [id, battle] of Object.entries(battles)) {
    if ((battle as BattleState).status === 'waiting') return id;
  }
  return null;
};
