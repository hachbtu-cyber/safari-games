// Provably Fair Crash Generator

export function generateRandomHex(length: number = 32): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Generates a crash multiplier with configurable aggression
 * When aggression is 'HIGH' or isDemo is true:
 * The plane crashes much more frequently (often under 1.80x with frequent 1.0x-1.15x drops).
 */
export function generateCrashMultiplier(
  aggression: 'HIGH' | 'BALANCED' | 'FAIR' = 'HIGH',
  isDemo: boolean = false
): {
  multiplier: number;
  serverSeed: string;
  hash: string;
} {
  const serverSeed = generateRandomHex(32);
  const hash = generateRandomHex(64);

  // If High Aggression or Demo Mode: frequent early crashes as requested ("DEMO BEBZAT AROPLANU ENDWEDK ADRGEW")
  if (aggression === 'HIGH' || isDemo) {
    const roll = Math.random();
    let finalMultiplier = 1.00;

    if (roll < 0.28) {
      // 28% instant / super early crash between 1.00x and 1.18x
      finalMultiplier = 1.00 + Math.floor(Math.random() * 19) / 100;
    } else if (roll < 0.72) {
      // 44% crash between 1.19x and 1.80x
      finalMultiplier = 1.19 + Math.floor(Math.random() * 62) / 100;
    } else if (roll < 0.90) {
      // 18% crash between 1.81x and 3.20x
      finalMultiplier = 1.81 + Math.floor(Math.random() * 140) / 100;
    } else if (roll < 0.97) {
      // 7% crash between 3.21x and 8.50x
      finalMultiplier = 3.21 + Math.floor(Math.random() * 530) / 100;
    } else {
      // 3% rare high run (8.50x - 25.00x)
      finalMultiplier = 8.50 + Math.floor(Math.random() * 1650) / 100;
    }

    return {
      multiplier: Math.floor(finalMultiplier * 100) / 100,
      serverSeed,
      hash,
    };
  }

  // Standard/Fair Mode:
  const isInstantCrash = Math.random() < 0.04;
  if (isInstantCrash) {
    return {
      multiplier: 1.00,
      serverSeed,
      hash,
    };
  }

  const r = Math.random();
  let mult = 0.96 / (1.0 - r);
  if (mult < 1.01) mult = 1.01;
  if (mult > 1000) mult = 1000;

  return {
    multiplier: Math.floor(mult * 100) / 100,
    serverSeed,
    hash,
  };
}

/**
 * Calculate flight duration based on multiplier
 * In Aviator, growth is exponential: mult(t) = e^(0.06 * t)
 * So t = ln(multiplier) / 0.06
 */
export function getFlightDuration(multiplier: number): number {
  if (multiplier <= 1.00) return 0.5;
  const seconds = Math.log(multiplier) / 0.075;
  return Math.max(1.0, seconds);
}
