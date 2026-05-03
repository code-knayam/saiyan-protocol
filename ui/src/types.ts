// ═══════════════════════════════════
// SAIYAN PROTOCOL — Type Definitions
// ═══════════════════════════════════

export type WorkoutType =
  | 'crossfitUpper'
  | 'crossfitLower'
  | 'intervalRun'
  | 'tempoRun'
  | 'longRun'
  | 'calisthenics'
  | 'rest';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type Block = 1 | 2 | 3;

export interface Exercise {
  id: string;
  name: string;
  description: string;
  cue: string;
  sets: number;
  reps: string;
  rest: string;
  substitute: string;
}

export interface WorkoutPhase {
  name: string;
  duration: string;
  exercises: Exercise[];
}

export interface Workout {
  id: string;
  day: DayOfWeek;
  type: WorkoutType;
  title: string;
  subtitle: string;
  phases: WorkoutPhase[];
  estimatedDuration: string;
}

export interface SetLog {
  setNumber: number;
  reps: number | null;
  weight: number | null;
  time: number | null;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
  notes: string;
}

export interface SessionLog {
  id: string;
  workoutId: string;
  date: string;
  completed: boolean;
  effortRating: number;
  notes: string;
  duration: number;
  powerGained?: number;
  workoutTitle?: string;
  workoutType?: string;
  // Legacy fields kept for local compatibility
  completedExercises?: string[];
  exerciseLogs?: Record<string, ExerciseLog>;
}

export interface WeekSchedule {
  id?: string;
  week: number;
  block: Block;
  blockName: string;
  weeklyIntent: string;
  workouts: Record<DayOfWeek, Workout>;
}

export interface AthleteProfile {
  id?: string;
  email?: string;
  name: string;
  pictureUrl?: string;
  age: number;
  height: string;
  weight: string;
  powerLevel: number;
  currentBlock: Block;
  currentWeek: number;
  totalSessionsCompleted: number;
  streakDays: number;
  fiveKmTime: string;
  onboarded: boolean;
}
