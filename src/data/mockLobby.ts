import { LobbyPlayerBet } from '../types';

const ETHIOPIAN_AND_GLOBAL_NAMES = [
  'Abebe_B', 'Dawit_99', 'Selam_T', 'Yared_Ace', 'Meron_W', 'SafariKing', 'Natnael_G',
  'Hanna_M', 'Biniyam_X', 'Helen_Addis', 'Teddy_Afro', 'Tigist_K', 'Robel_21', 'Mekdes_S',
  'Fasil_Bet', 'Kassahun', 'Lensa_O', 'Abinet_Lucky', 'Yonas_Fly', 'Bethel_Sky',
  'Eagle_Eye', 'RedBull_88', 'JetStriker', 'SkyHigh77', 'BirrMaster', 'CryptoPilot',
  'LionOfJuda', 'Habesha_Win', 'Sheger_Bet', 'Finfinne_9'
];

export function generateLobbyBets(): LobbyPlayerBet[] {
  // Generate 25-40 simulated bets for the current round
  const count = Math.floor(Math.random() * 15) + 25;
  const shuffledNames = [...ETHIOPIAN_AND_GLOBAL_NAMES].sort(() => 0.5 - Math.random());
  
  const bets: LobbyPlayerBet[] = [];
  const amounts = [20, 50, 100, 150, 200, 300, 500, 1000, 1500, 2500, 5000];

  for (let i = 0; i < count; i++) {
    const username = shuffledNames[i % shuffledNames.length];
    const betAmount = amounts[Math.floor(Math.random() * amounts.length)];
    bets.push({
      id: `p-${i}-${Date.now()}`,
      username,
      avatarSeed: username,
      betAmount,
      cashedOutMultiplier: null,
      winAmount: null,
    });
  }
  return bets;
}
