/**
 * Script to update player images from Cricbuzz
 * Run with: npx tsx scripts/fetchPlayerImages.ts
 *
 * This uses a pre-compiled mapping of player names to Cricbuzz face image IDs.
 * To find a player's image ID: visit their Cricbuzz profile, inspect the image,
 * and extract the number from the URL pattern: /a/img/v1/.../c{imageId}/i.jpg
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Player data structure
interface PlayerCard {
  id: string;
  name: string;
  country: string;
  role: string;
  rarity: string;
  stats: {
    matches: number;
    battingAvg: number;
    bowlingAvg: number;
    highScore: number;
    wickets: number;
    rating: number;
  };
  image: string;
}

// Comprehensive mapping of player names to Cricbuzz face image IDs
// Image URL format: https://www.cricbuzz.com/a/img/v1/152x152/i1/c{imageId}/i.jpg
const PLAYER_IMAGE_IDS: Record<string, string> = {
  // LEGENDARY
  'Sachin Tendulkar': '274605',
  'Don Bradman': '273707',
  'Viv Richards': '274613',
  'Shane Warne': '274721',
  'Wasim Akram': '274715',

  // EPIC
  'Virat Kohli': '254218',
  'Steve Smith': '274653',
  'Joe Root': '274627',
  'Babar Azam': '274479',
  'Kane Williamson': '254185',
  'Jasprit Bumrah': '290919',
  'Pat Cummins': '254043',
  'Ben Stokes': '274663',
  'AB de Villiers': '274437',
  'MS Dhoni': '254228',
  'Ricky Ponting': '274589',
  'Jacques Kallis': '274541',
  'Kumar Sangakkara': '274647',
  'Muttiah Muralitharan': '274571',
  'Glenn McGrath': '274557',

  // RARE
  'KL Rahul': '290907',
  'David Warner': '254311',
  'Kagiso Rabada': '254103',
  'Trent Boult': '254235',
  'Rishabh Pant': '290897',
  'Jos Buttler': '254075',
  'Mitchell Starc': '254165',
  'Shaheen Shah Afridi': '315997',
  'Ravindra Jadeja': '254225',
  'Ravichandran Ashwin': '254223',
  'Shakib Al Hasan': '254129',
  'Rashid Khan': '311619',
  'Travis Head': '254091',
  'Marnus Labuschagne': '311437',
  'Tim Southee': '254173',
  'Quinton de Kock': '254045',
  'Rohit Sharma': '254231',
  'Mitchell Marsh': '254137',
  'Shimron Hetmyer': '311393',
  'Mohammad Rizwan': '290885',
  'Nathan Lyon': '254127',
  'James Anderson': '254233',
  'Stuart Broad': '254077',
  'Dimuth Karunaratne': '254241',
  'Mushfiqur Rahim': '254151',
  'Jason Holder': '254101',
  'Wanindu Hasaranga': '317443',
  'Josh Hazlewood': '254093',
  'Mark Wood': '254313',
  'Suryakumar Yadav': '290901',

  // COMMON
  'Shubman Gill': '317139',
  'Alex Carey': '311403',
  'Harry Brook': '320283',
  'Saud Shakeel': '311635',
  'Devon Conway': '317117',
  'Aiden Markram': '290867',
  'Nicholas Pooran': '311587',
  'Pathum Nissanka': '317461',
  'Litton Das': '290843',
  'Mohammed Siraj': '311445',
  'Cameron Green': '320173',
  'Zak Crawley': '317125',
  'Fakhar Zaman': '290873',
  'Daryl Mitchell': '311533',
  'Marco Jansen': '320219',
  'Kyle Mayers': '320179',
  'Dhananjaya de Silva': '290861',
  'Mehidy Hasan Miraz': '311429',
  'Mohammed Shami': '254191',
  'Usman Khawaja': '254117',
  'Chris Woakes': '254309',
  'Hasan Ali': '311381',
  'Tom Latham': '254123',
  'Anrich Nortje': '311567',
  'Alzarri Joseph': '311409',
  'Kusal Mendis': '290839',
  'Taskin Ahmed': '311373',
  'Kuldeep Yadav': '290915',
  'Scott Boland': '311405',
  'Ollie Pope': '311579',
  'Imam-ul-Haq': '311391',
  'Glenn Phillips': '311577',
  'Rassie van der Dussen': '311629',
  'Shai Hope': '311389',
  'Angelo Mathews': '254135',
  'Mahmudullah': '254133',
  'Hardik Pandya': '290895',
  'Steven Smith': '320253',
  'Moeen Ali': '254143',
  'Naseem Shah': '320189',
  'Matt Henry': '254097',
  'Lungi Ngidi': '311559',
  'Kemar Roach': '254161',
  'Charith Asalanka': '320131',
  'Mustafizur Rahman': '290851',
  'Ishan Kishan': '317147',
  'Adam Zampa': '254179',
  'Reece Topley': '311621',
  'Haris Rauf': '317141',
  'Heinrich Klaasen': '311421',
};

// Extract players array from the file content
function extractPlayersFromFile(content: string): PlayerCard[] {
  const players: PlayerCard[] = [];
  const playerBlocks = content.split(/\{\s*id:/);

  for (let i = 1; i < playerBlocks.length; i++) {
    const block = '{id:' + playerBlocks[i];
    const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
    const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
    const countryMatch = block.match(/country:\s*['"]([^'"]+)['"]/);
    const roleMatch = block.match(/role:\s*['"]([^'"]+)['"]/);
    const rarityMatch = block.match(/rarity:\s*['"]([^'"]+)['"]/);
    const matchesMatch = block.match(/matches:\s*(\d+)/);
    const battingAvgMatch = block.match(/battingAvg:\s*([\d.]+)/);
    const bowlingAvgMatch = block.match(/bowlingAvg:\s*([\d.]+)/);
    const highScoreMatch = block.match(/highScore:\s*(\d+)/);
    const wicketsMatch = block.match(/wickets:\s*(\d+)/);
    const ratingMatch = block.match(/rating:\s*(\d+)/);

    if (idMatch && nameMatch) {
      players.push({
        id: idMatch[1],
        name: nameMatch[1],
        country: countryMatch?.[1] || '',
        role: roleMatch?.[1] || '',
        rarity: rarityMatch?.[1] || '',
        stats: {
          matches: parseInt(matchesMatch?.[1] || '0'),
          battingAvg: parseFloat(battingAvgMatch?.[1] || '0'),
          bowlingAvg: parseFloat(bowlingAvgMatch?.[1] || '0'),
          highScore: parseInt(highScoreMatch?.[1] || '0'),
          wickets: parseInt(wicketsMatch?.[1] || '0'),
          rating: parseInt(ratingMatch?.[1] || '0'),
        },
        image: '',
      });
    }
  }

  return players;
}

// Generate TypeScript file content with updated images
function generatePlayersFile(players: PlayerCard[]): string {
  const rarityComments: Record<string, string> = {
    legendary: '// ========== LEGENDARY (5) ==========',
    epic: '// ========== EPIC (15) ==========',
    rare: '// ========== RARE (30) ==========',
    common: '// ========== COMMON (50) ==========',
  };

  let content = `import type { PlayerCard } from '../types';

export const players: PlayerCard[] = [
`;

  let currentRarity = '';

  for (const player of players) {
    if (player.rarity !== currentRarity) {
      currentRarity = player.rarity;
      content += `  ${rarityComments[currentRarity]}\n`;
    }

    content += `  {
    id: '${player.id}',
    name: '${player.name}',
    country: '${player.country}',
    role: '${player.role}',
    rarity: '${player.rarity}',
    stats: { matches: ${player.stats.matches}, battingAvg: ${player.stats.battingAvg}, bowlingAvg: ${player.stats.bowlingAvg}, highScore: ${player.stats.highScore}, wickets: ${player.stats.wickets}, rating: ${player.stats.rating} },
    image: '${player.image}',
  },
`;
  }

  content += `];
`;

  return content;
}

function main() {
  console.log('Updating player images from Cricbuzz mapping...\n');

  // Read the current players file
  const playersFilePath = join(__dirname, '..', 'src', 'data', 'players.ts');
  const fileContent = readFileSync(playersFilePath, 'utf-8');

  // Extract players
  const players = extractPlayersFromFile(fileContent);
  console.log(`Found ${players.length} players\n`);

  // Update images from mapping
  let successCount = 0;
  let failCount = 0;

  for (const player of players) {
    const imageId = PLAYER_IMAGE_IDS[player.name];

    if (imageId) {
      player.image = `https://www.cricbuzz.com/a/img/v1/152x152/i1/c${imageId}/i.jpg`;
      console.log(`✓ ${player.name}`);
      successCount++;
    } else {
      console.log(`✗ ${player.name} (no mapping found)`);
      failCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Results: ${successCount} mapped, ${failCount} missing`);
  console.log(`========================================\n`);

  // Generate and save the updated file
  const updatedContent = generatePlayersFile(players);
  writeFileSync(playersFilePath, updatedContent);
  console.log(`Updated ${playersFilePath}`);

  // Output missing players
  const missingPlayers = players.filter(p => !p.image);
  if (missingPlayers.length > 0) {
    console.log(`\nPlayers without images (${missingPlayers.length}):`);
    missingPlayers.forEach(p => console.log(`  - ${p.name}`));
  }
}

main();
