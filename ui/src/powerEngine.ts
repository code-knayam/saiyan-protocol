import type { WorkoutType, SessionLog } from './types';

// ═══════════════════════════════════
// SAIYAN PROTOCOL — Power Level Engine
// ═══════════════════════════════════
// Formula: Power Level += (effort × 10) × difficultyMultiplier × completionBonus
// Missed session: 0 power gained
// Streak bonus: +10% per consecutive day (capped at +50%)
// Low effort penalty: if avg effort ≤ 4 over last 5 sessions, flag overtraining

export const DIFFICULTY_MULTIPLIERS: Record<WorkoutType, number> = {
  crossfitUpper: 1.8,
  crossfitLower: 1.8,
  intervalRun: 1.5,
  calisthenics: 1.3,
  tempoRun: 1.2,
  longRun: 1.0,
  rest: 0,
};

export interface PowerGainResult {
  baseGain: number;
  difficultyMultiplier: number;
  completionBonus: number;
  streakBonus: number;
  totalGain: number;
  newStreak: number;
  overtrainingWarning: boolean;
}

/**
 * Calculate power gain for a completed session.
 */
export function calculatePowerGain(
  workoutType: WorkoutType,
  effortRating: number,
  completedExercises: number,
  totalExercises: number,
  currentStreak: number,
  recentLogs: SessionLog[],
): PowerGainResult {
  // Base: effort × 10
  const baseGain = effortRating * 10;

  // Difficulty multiplier by workout type
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[workoutType];

  // Completion bonus: ratio of exercises completed (0.5 to 1.0 range)
  // If you did all exercises: 1.0. If you did half: 0.75. Minimum 0.5.
  const completionRatio = totalExercises > 0
    ? completedExercises / totalExercises
    : 1;
  const completionBonus = 0.5 + (completionRatio * 0.5);

  // Streak bonus: +10% per consecutive day, capped at +50%
  const streakMultiplier = Math.min(1 + (currentStreak * 0.1), 1.5);

  // Total gain
  const totalGain = Math.round(
    baseGain * difficultyMultiplier * completionBonus * streakMultiplier
  );

  // New streak
  const newStreak = currentStreak + 1;

  // Overtraining check: avg effort ≤ 4 over last 5 completed sessions
  const recentCompleted = recentLogs
    .filter((l) => l.completed)
    .slice(0, 5);
  const avgEffort = recentCompleted.length > 0
    ? recentCompleted.reduce((sum, l) => sum + l.effortRating, 0) / recentCompleted.length
    : 10;
  const overtrainingWarning = recentCompleted.length >= 5 && avgEffort <= 4;

  return {
    baseGain,
    difficultyMultiplier,
    completionBonus: Math.round(completionBonus * 100) / 100,
    streakBonus: Math.round((streakMultiplier - 1) * 100),
    totalGain,
    newStreak,
    overtrainingWarning,
  };
}

/**
 * Check if streak should be broken based on last session date.
 * If more than 2 calendar days since last session, streak resets.
 */
export function checkStreakBreak(logs: SessionLog[]): {
  streakBroken: boolean;
  missedDays: number;
} {
  if (logs.length === 0) {
    return { streakBroken: false, missedDays: 0 };
  }

  const lastLog = logs.find((l) => l.completed);
  if (!lastLog) {
    return { streakBroken: false, missedDays: 0 };
  }

  const lastDate = new Date(lastLog.date);
  const today = new Date();

  // Reset time to midnight for day comparison
  lastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Allow 1 day gap (rest day). 2+ days = streak broken.
  if (diffDays >= 2) {
    return { streakBroken: true, missedDays: diffDays };
  }

  return { streakBroken: false, missedDays: 0 };
}

/**
 * Get a Roshi-style coaching note based on the session result.
 */
export function getRoshiNote(result: PowerGainResult, workoutType: WorkoutType): string {
  if (result.overtrainingWarning) {
    return "Your effort scores have been low lately. Even Goku takes a Senzu Bean sometimes. Consider a lighter week — quality over quantity, warrior.";
  }

  if (result.completionBonus < 0.75) {
    return "You didn't finish every exercise, but showing up is half the battle. Goku lost to Vegeta the first time too. Come back stronger.";
  }

  if (result.streakBonus >= 40) {
    return "Five days straight! Your ki is building fast. Even Vegeta would respect this consistency. Don't let up now.";
  }

  if (result.totalGain >= 150) {
    return "Over 9... well, over 150 power gained! That's a serious session. Your scouter is beeping. Keep this energy.";
  }

  const notes: Record<string, string> = {
    crossfitUpper: "Upper body combat training complete. Your punches are getting sharper. Yamcha wishes he trained this hard.",
    crossfitLower: "Lower body destroyed. Those legs are building the foundation for a Spirit Bomb. Good work.",
    intervalRun: "Intervals done. Your speed is building. Remember — Goku didn't learn Instant Transmission in a day.",
    tempoRun: "Tempo work in the books. That sustained effort is where aerobic gains live. Patience, warrior.",
    longRun: "Long run complete. Zone 2 is boring but it's building your engine. Trust the process like King Kai trusted Goku.",
    calisthenics: "Skill work done. Every hold, every second under tension — that's how you unlock new forms.",
  };

  return notes[workoutType] ?? "Session complete. Power level rising. Keep training, warrior.";
}
