import type { AITeam } from '../types';

export const aiTeams: AITeam[] = [
  // Easy Difficulty Teams
  {
    id: 'ai_bangladesh',
    name: 'Bangladesh XI',
    flag: '🇧🇩',
    difficulty: 'easy',
    playerIds: ['p031', 'p045', 'p059', 'p068', 'p077'], // Shakib, Mushfiqur, Litton, Mehidy, Taskin
  },
  {
    id: 'ai_sri_lanka',
    name: 'Sri Lanka XI',
    flag: '🇱🇰',
    difficulty: 'easy',
    playerIds: ['p044', 'p058', 'p067', 'p076', 'p047'], // Karunaratne, Nissanka, Dhananjaya, Kusal, Hasaranga
  },
  {
    id: 'ai_west_indies',
    name: 'West Indies XI',
    flag: '🌴',
    difficulty: 'easy',
    playerIds: ['p039', 'p046', 'p057', 'p066', 'p075'], // Hetmyer, Holder, Pooran, Mayers, Alzarri
  },
  {
    id: 'ai_afghanistan',
    name: 'Afghanistan XI',
    flag: '🇦🇫',
    difficulty: 'easy',
    playerIds: ['p032', 'p056', 'p082', 'p086', 'p094'], // Rashid, Markram (sub), Phillips (sub), Mahmudullah (sub), Asalanka (sub)
  },

  // Medium Difficulty Teams
  {
    id: 'ai_pakistan',
    name: 'Pakistan XI',
    flag: '🇵🇰',
    difficulty: 'medium',
    playerIds: ['p009', 'p028', 'p040', 'p063', 'p072'], // Babar, Shaheen, Rizwan, Fakhar, Hasan Ali
  },
  {
    id: 'ai_england',
    name: 'England XI',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    difficulty: 'medium',
    playerIds: ['p008', 'p013', 'p026', 'p043', 'p053'], // Root, Stokes, Buttler, Broad, Brook
  },
  {
    id: 'ai_south_africa',
    name: 'South Africa XI',
    flag: '🇿🇦',
    difficulty: 'medium',
    playerIds: ['p023', 'p036', 'p065', 'p083', 'p092'], // Rabada, de Kock, Jansen, Rassie, Ngidi
  },
  {
    id: 'ai_new_zealand',
    name: 'New Zealand XI',
    flag: '🇳🇿',
    difficulty: 'medium',
    playerIds: ['p010', 'p024', 'p035', 'p055', 'p064'], // Kane, Boult, Southee, Conway, Daryl Mitchell
  },

  // Hard Difficulty Teams
  {
    id: 'ai_australia',
    name: 'Australia XI',
    flag: '🇦🇺',
    difficulty: 'hard',
    playerIds: ['p007', 'p012', 'p022', 'p027', 'p034'], // Smith, Cummins, Warner, Starc, Labuschagne
  },
  {
    id: 'ai_india',
    name: 'India XI',
    flag: '🇮🇳',
    difficulty: 'hard',
    playerIds: ['p006', 'p011', 'p015', 'p029', 'p037'], // Kohli, Bumrah, Dhoni, Jadeja, Rohit
  },
  {
    id: 'ai_legends',
    name: 'Legends XI',
    flag: '⭐',
    difficulty: 'hard',
    playerIds: ['p001', 'p002', 'p003', 'p004', 'p005'], // Sachin, Bradman, Viv, Warne, Wasim
  },
  {
    id: 'ai_world_xi',
    name: 'World XI',
    flag: '🌍',
    difficulty: 'hard',
    playerIds: ['p006', 'p007', 'p011', 'p013', 'p017'], // Kohli, Smith, Bumrah, Stokes, Kallis
  },
];

export function getTeamsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): AITeam[] {
  return aiTeams.filter(team => team.difficulty === difficulty);
}

export function getRandomTeamByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): AITeam {
  const teams = getTeamsByDifficulty(difficulty);
  return teams[Math.floor(Math.random() * teams.length)];
}

export function getTeamById(id: string): AITeam | undefined {
  return aiTeams.find(team => team.id === id);
}
