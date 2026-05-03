import { config } from '../config.js';

// ═══════════════════════════════════
// AI Service — pluggable provider
// ═══════════════════════════════════
// Currently returns a stub response.
// Swap the implementation when you pick a provider
// (OpenAI, Anthropic, Gemini, etc.)

export interface WeeklyGenerationInput {
  athlete: any;
  recentLogs: any[];
  exerciseHistory: string[];
  currentBlock: number;
  currentWeek: number;
}

export interface WeeklyGenerationOutput {
  week: number;
  block: number;
  blockName: string;
  weeklyIntent: string;
  plan: TrainingPlanOutput;
  workouts: Record<string, any>;
  model: string;
}

export interface TrainingPlanOutput {
  name: string;
  totalWeeks: number;
  summary: string;
  coachNote: string;
  blocks: TrainingPlanBlockOutput[];
}

export interface TrainingPlanBlockOutput {
  blockNumber: number;
  name: string;
  startWeek: number;
  endWeek: number;
  focus: string;
}

export async function generateWeeklyWorkouts(
  input: WeeklyGenerationInput,
): Promise<WeeklyGenerationOutput> {
  const provider = config.ai.provider;

  switch (provider) {
    case 'stub':
      return generateStub(input);
    // Future providers:
    // case 'openai':
    //   return generateWithOpenAI(input);
    // case 'anthropic':
    //   return generateWithAnthropic(input);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

// ═══════════════════════════════════
// Stub — returns a minimal week 1 template
// Replace with real AI call when ready
// ═══════════════════════════════════
function generateStub(input: WeeklyGenerationInput): WeeklyGenerationOutput {
  const plan: TrainingPlanOutput = {
    name: 'Saiyan Protocol Foundation',
    totalWeeks: 12,
    summary: 'A hybrid program balancing combat conditioning, running performance, and calisthenics skill work.',
    coachNote: 'Every warrior starts with a baseline. The plan can evolve once your logs start talking back.',
    blocks: [
      {
        blockNumber: 1,
        name: 'Saiyan Arc',
        startWeek: 1,
        endWeek: 4,
        focus: 'Base building. Establish movement patterns, aerobic base, technique. Moderate intensity.',
      },
      {
        blockNumber: 2,
        name: 'Namek Arc',
        startWeek: 5,
        endWeek: 8,
        focus: 'Intensity build. Heavier loads, faster intervals, harder progressions.',
      },
      {
        blockNumber: 3,
        name: 'Cell Games Arc',
        startWeek: 9,
        endWeek: 12,
        focus: 'Peak phase. Maximum intensity, benchmark testing, peak performance.',
      },
    ],
  };

  const currentBlock = plan.blocks.find((block) => block.blockNumber === input.currentBlock) || plan.blocks[0];

  return {
    week: input.currentWeek,
    block: input.currentBlock,
    blockName: currentBlock.name,
    weeklyIntent: 'Establish movement patterns and build your aerobic base. Moderate intensity — no maximal efforts.',
    plan,
    model: 'stub',
    workouts: {
      Mon: {
        type: 'crossfitUpper',
        title: 'Combat Training',
        subtitle: 'CrossFit WOD — Upper Focus',
        estimatedDuration: '55 min',
        phases: [
          {
            name: 'Power Up Phase',
            duration: '10 min',
            exercises: [
              {
                name: 'Arm Circles & Shoulder CARs',
                description: 'Dynamic shoulder mobility in all planes',
                cue: 'Full range, controlled tempo',
                sets: 2,
                reps: '10 each direction',
                rest: '0',
                substitute: 'Band pull-aparts',
              },
            ],
          },
          {
            name: 'Full Power Combat — Strength',
            duration: '20 min',
            exercises: [
              {
                name: 'Push Press',
                description: 'Barbell overhead press with leg drive',
                cue: 'Dip and drive — lock out overhead',
                sets: 5,
                reps: '5',
                rest: '2.5 min',
                substitute: 'Dumbbell push press',
              },
            ],
          },
        ],
      },
      Tue: {
        type: 'intervalRun',
        title: 'Gravity Training',
        subtitle: 'Interval Run',
        estimatedDuration: '35 min',
        phases: [
          {
            name: 'Full Power Combat — Intervals',
            duration: '18 min',
            exercises: [
              {
                name: 'Hard Effort Intervals',
                description: '60s hard running / 90s easy jog recovery',
                cue: "Hard = can't hold conversation",
                sets: 6,
                reps: '60s hard / 90s easy',
                rest: '0',
                substitute: 'Bike intervals same timing',
              },
            ],
          },
        ],
      },
      Wed: {
        type: 'tempoRun',
        title: 'Gravity Training',
        subtitle: 'Tempo Run',
        estimatedDuration: '35 min',
        phases: [
          {
            name: 'Full Power Combat — Tempo',
            duration: '20 min',
            exercises: [
              {
                name: 'Sustained Tempo Run',
                description: '20 minutes at comfortably hard pace',
                cue: 'Broken sentences OK, not sprinting',
                sets: 1,
                reps: '20 min',
                rest: '0',
                substitute: 'Bike at same perceived effort',
              },
            ],
          },
        ],
      },
      Thu: {
        type: 'crossfitLower',
        title: 'Combat Training',
        subtitle: 'CrossFit WOD — Lower Focus',
        estimatedDuration: '55 min',
        phases: [
          {
            name: 'Full Power Combat — Strength',
            duration: '20 min',
            exercises: [
              {
                name: 'Back Squat',
                description: 'Barbell back squat — below parallel',
                cue: 'Brace core, knees track toes',
                sets: 5,
                reps: '5',
                rest: '3 min',
                substitute: 'Goblet squat',
              },
            ],
          },
        ],
      },
      Fri: {
        type: 'calisthenics',
        title: 'Turtle School Method',
        subtitle: 'Calisthenics Skill Day',
        estimatedDuration: '50 min',
        phases: [
          {
            name: 'Skill Work — Handstand',
            duration: '12 min',
            exercises: [
              {
                name: 'Wall Handstand Hold',
                description: 'Chest-to-wall or back-to-wall handstand',
                cue: 'Squeeze glutes, point toes, push floor away',
                sets: 3,
                reps: '30 sec',
                rest: '90 sec',
                substitute: 'Pike hold on box',
              },
            ],
          },
        ],
      },
      Sat: {
        type: 'longRun',
        title: 'Gravity Training',
        subtitle: 'Long Run — Zone 2',
        estimatedDuration: '50 min',
        phases: [
          {
            name: 'Full Power Combat — Long Run',
            duration: '35-40 min',
            exercises: [
              {
                name: 'Zone 2 Long Run',
                description: '6-7km at easy conversational pace',
                cue: 'Should feel almost too easy',
                sets: 1,
                reps: '6-7km',
                rest: '0',
                substitute: 'Bike 45 min Zone 2',
              },
            ],
          },
        ],
      },
      Sun: {
        type: 'rest',
        title: 'Hyperbolic Rest',
        subtitle: 'Recovery & Regeneration',
        estimatedDuration: '—',
        phases: [
          {
            name: 'Active Recovery (Optional)',
            duration: '20-30 min',
            exercises: [
              {
                name: 'Light Walk or Yoga',
                description: 'Easy movement to promote blood flow',
                cue: 'Nothing strenuous. Move to feel good.',
                sets: 1,
                reps: '20-30 min',
                rest: '0',
                substitute: 'Full rest',
              },
            ],
          },
        ],
      },
    },
  };
}
