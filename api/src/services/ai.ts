import OpenAI from 'openai';
import { config } from '../config.js';

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

// ═══════════════════════════════════
// Provider router
// ═══════════════════════════════════

export async function generateWeeklyWorkouts(
  input: WeeklyGenerationInput,
): Promise<WeeklyGenerationOutput> {
  switch (config.ai.provider) {
    case 'openai':
      return generateWithOpenAI(input);
    case 'stub':
      return generateStub(input);
    default:
      throw new Error(`Unknown AI provider: ${config.ai.provider}`);
  }
}

// ═══════════════════════════════════
// OpenAI implementation
// ═══════════════════════════════════

const GOAL_LABELS: Record<string, string> = {
  lean: 'Lean Athletic Physique — functional muscle, body composition, conditioning',
  run: 'Running Performance — faster 5km time, higher VO2max, running economy',
  calisthenics: 'Calisthenics Mastery — handstand, L-sit, muscle-up, levers',
  strength: 'Strength Development — heavier compound lifts, power output',
  combat: 'Combat Conditioning — MMA-ready fitness, GPP, work capacity',
  endurance: 'Aerobic Endurance — long-distance capacity, aerobic engine',
};

const SYSTEM_PROMPT = `You are Kakarot — a world-class hybrid athlete coach who has trained the Z-Fighters. You design science-based, periodized weekly training programs. Your athletes train like Saiyans: relentless, progressive, strategic.

## OUTPUT FORMAT
Respond with a single valid JSON object ONLY. No markdown code fences, no explanatory text — raw JSON only.

## PROGRAM DESIGN PRINCIPLES
- Hybrid athlete model: blend strength training, running performance, and calisthenics skill work in proportions that match the athlete's stated goals
- Periodize across 3-4 mesocycle blocks (Foundation → Build → Peak, or Foundation → Hypertrophy → Strength → Peak depending on goals)
- Name the program and each block with Dragon Ball Z arc references (Saiyan Arc, Namek Arc, Cell Games Arc, Buu Arc, Tournament of Power Arc, etc.)
- Each block should escalate intensity/volume vs the previous one; the final block peaks performance
- Total program length: 9-16 weeks based on goals and complexity

## WORKOUT TITLE RULES — CRITICAL
Every workout title must be unique and draw from the full DBZ universe. NEVER repeat a title. NEVER start every title with "Saiyan". Use the full breadth of DBZ lore:

Characters & villains: Vegeta, Frieza, Cell, Buu, Piccolo, Broly, Jiren, Beerus, Whis, Gohan, Trunks, Hit, Krillin, Tien, Yamcha, Raditz, Nappa, Ginyu Force, Cooler, Turles, Bojack
Locations: Hyperbolic Time Chamber, Gravity Room, King Kai's Planet, Kami's Lookout, Snake Way, Planet Namek, Tournament of Power Arena, Room of Spirit & Time, Yardrat, Otherworld
Techniques: Kamehameha, Final Flash, Galick Gun, Special Beam Cannon, Solar Flare, After-Image, Kaioken, Spirit Bomb, Instant Transmission, Destructo Disc, Multi-Form, Wolf Fang Fist
Forms & transformations: Super Saiyan, Ultra Instinct, Super Saiyan Blue, Legendary Super Saiyan, Mystic Form, Great Ape, Golden Frieza, Perfect Cell
Story moments: Battle of Gods, Frieza's Resurrection, Cell Games, Buu Saga, Tournament of Power, Bardock's Last Stand, Trunk's Timeline, Ginyu Force Arrival

Good title examples (mix these styles):
- "Frieza Force Protocol" (villain theme)
- "Gravity Room 300x" (location + intensity)
- "Snake Way Sprint" (location + run session)
- "Hyperbolic Grind" (location theme)
- "Kaioken × Conditioning" (technique + workout type)
- "Galick Gun Press" (technique + movement)
- "Ginyu Special Squad" (villain squad = circuit)
- "Namek Crater Run" (location + run)
- "Ultra Instinct Flow" (form + calisthenics)
- "Beerus Judgement" (villain + heavy session)
- "Yardrat Recovery" (location + rest day)
- "Cell Games Prep" (story moment + peak day)
- "Broly's Domain" (villain + big strength day)
- "Tournament of Power" (arena = conditioning)
- "King Kai's Circuit" (location + conditioning)
- "Mystic Ascension" (form + skill day)
- "Bardock's Legacy" (character + foundational)
- "Otherworld Sprint" (location + intervals)

RULE: Across the 7 days of the week, no two titles should share the same prefix word. Draw from different characters, locations, and techniques each day.

## MANDATORY WORKOUT PHASE STRUCTURE
Every single workout entry (including rest days) MUST contain exactly 3 phases in this exact order:

1. WARMUP — name it exactly "Power Up Phase", duration 8-12 min
   Purpose: elevate heart rate, mobilize joints, activate prime movers for today's session
   Include: 1 cardio pulse-raise exercise, 2-3 dynamic mobility/activation drills specific to today's movement patterns
   Total exercises: 3-4

2. MAIN WORK — 1 or 2 phases, name creatively with DBZ references
   Purpose: the primary training stimulus for the session
   Include: 4-6 exercises with precise prescriptions
   For strength: compound lifts first, accessories after
   For running: prescribe as a single structured exercise with detailed protocol in description
   For calisthenics: skill practice first, strength second

3. COOLDOWN — name it exactly "Hyperbolic Recovery", duration 5-8 min
   Purpose: reduce heart rate, restore range of motion, begin recovery
   Include: 2-3 static stretches targeting muscles worked today, 1 breathing or relaxation drill
   Total exercises: 3-4

REST DAYS: All 3 phases still required but extremely light. Phase 2 should be gentle mobility flow or foam rolling.

## EXERCISE PRESCRIPTION FORMAT
- "sets": integer only (e.g., 3)
- "reps": string always (e.g., "5", "8-10", "30 sec", "400m", "AMRAP 8 min", "3 rounds")
- "rest": string always (e.g., "3 min", "90 sec", "60 sec", "0")
- "description": setup, execution, and what to feel — 1-2 sentences
- "cue": the single most important technical cue for execution
- "substitute": always a viable regression or equipment-free alternative

## LOAD AND VOLUME GUIDELINES

Strength-focused exercises:
  Beginner — 3 sets, 8-12 reps, 65-70% effort, 2 min rest; use bodyweight or light loads
  Intermediate — 4 sets, 5-8 reps, 75-80% effort, 2.5 min rest; barbell compound movements
  Advanced — 5 sets, 3-6 reps, 80-90% effort, 3 min rest; complex movements, loaded progressions

Conditioning circuits:
  Beginner — 3 rounds, 30-40 sec work / 30 sec rest
  Intermediate — 4 rounds, 40 sec work / 20 sec rest
  Advanced — 5 rounds, 45 sec work / 15 sec rest

Running prescriptions (adapt to 5km benchmark):
  Sub-20 min → elite: specific fast paces, short recoveries, track-style targets
  20-25 min → advanced: challenging but achievable targets, race-pace work
  25-30 min → intermediate: effort-based (% of max HR or conversational cues)
  30+ min or unknown → beginner/developing: easy aerobic base, time-on-feet, effort-over-pace

## GOAL-BASED PROGRAMMING RULES
- Goal includes "run": include 3 running sessions/week (one interval, one tempo, one long easy)
- Goal includes "calisthenics": dedicate 1-2 full days to skill progression and bodyweight strength
- Goal includes "strength": prioritize barbell compound lifts Mon/Thu with progressive overload logic
- Goal includes "lean" or "combat": include metabolic conditioning circuits; reduce pure strength volume
- Goal includes "endurance": extend long run, add second aerobic session, reduce high-intensity volume

## PERSONALIZATION RULES
- Always calibrate volume and intensity to the stated fitness experience level
- Age 45+ or injury history mentioned: reduce high-impact volume, add joint prep to warmup, prefer unilateral movements
- New athlete (no logs): conservative Week 1 — teach movement patterns, establish baselines, do not push to failure
- Returning athlete with high effort scores (≥8): maintain or increase volume/intensity
- Returning athlete with low completion or low effort scores (≤5): reduce intensity 10-15%
- Never include any exercise from the "DO NOT REPEAT" list — always substitute with a biomechanically similar but different movement

## WEEKLY STRUCTURE GUIDELINES
Balance training stress across the week — avoid consecutive days targeting the same primary movers.
Typical structures (adapt to goals and experience):
  Beginner: 3-4 training + 3-4 rest/recovery
  Intermediate: 5 training + 1 active recovery + 1 full rest
  Advanced: 6 training + 1 active recovery`;

function buildUserPrompt(input: WeeklyGenerationInput): string {
  const { athlete, recentLogs, exerciseHistory, currentBlock, currentWeek } = input;

  const goalLabels = ((athlete.selected_goals as string[]) || [])
    .map((g) => GOAL_LABELS[g] || g)
    .filter(Boolean)
    .map((l) => `  - ${l}`)
    .join('\n');

  const recentLogsSummary = recentLogs.length === 0
    ? '  No sessions logged yet — this is the athlete\'s first week.'
    : recentLogs.slice(0, 6).map((l: any) =>
        `  - ${l.date} | ${l.workout_type || 'workout'} | Effort: ${l.effort_rating}/10 | Completed: ${l.completed ? 'Yes' : 'Partial/No'}${l.notes ? ` | Athlete note: "${l.notes}"` : ''}`
      ).join('\n');

  const exerciseHistoryStr = exerciseHistory.length === 0
    ? '  None yet — this is the first generation.'
    : exerciseHistory.map((e) => `  - ${e}`).join('\n');

  const isNewAthlete = recentLogs.length === 0;

  return `## ATHLETE PROFILE

Name: ${athlete.name || 'Warrior'}
Age: ${athlete.age > 0 ? `${athlete.age} years old` : 'Not provided'}
Height: ${athlete.height || 'Not provided'}
Weight: ${athlete.weight || 'Not provided'}
5km Personal Best: ${athlete.five_km_time || 'Unknown — treat as beginner/developing runner'}

## GOALS AND TRAINING BACKGROUND

Selected training focus areas:
${goalLabels || '  - General fitness'}

Athlete\'s training goal (their own words):
"${athlete.training_goal || 'General fitness and performance improvement'}"

Fitness background and experience:
"${athlete.fitness_experience || 'Not provided — assume intermediate general fitness baseline'}"

## CURRENT PROGRAM POSITION

Block: ${currentBlock} | Week: ${currentWeek}
${isNewAthlete
  ? 'FIRST GENERATION: Design the complete multi-block training plan structure, then generate the full Week 1 workouts. Week 1 should be conservative — establish baselines, teach movement patterns, build confidence.'
  : `CONTINUATION: Maintain the existing plan block structure. Generate week ${currentWeek} of block ${currentBlock}. Apply progressive overload vs previous weeks.`
}

## RECENT SESSION PERFORMANCE

${recentLogsSummary}

## DO NOT REPEAT — EXERCISE HISTORY

${exerciseHistoryStr}

## YOUR TASK

Generate week ${currentWeek} of block ${currentBlock} for this athlete. Respond with ONLY this JSON structure:

{
  "plan": {
    "name": "Program name (DBZ-themed, personalized)",
    "totalWeeks": <integer 9-16>,
    "summary": "Max 15 words. One punchy line describing the program's overall purpose.",
    "coachNote": "Max 15 words. One motivational line from Kakarot.",
    "blocks": [
      {
        "blockNumber": 1,
        "name": "Saiyan Arc",
        "startWeek": 1,
        "endWeek": 4,
        "focus": "Concise 1-sentence description of this block's training emphasis"
      },
      {
        "blockNumber": 2,
        "name": "Namek Arc",
        "startWeek": 5,
        "endWeek": 8,
        "focus": "Concise 1-sentence description of this block's training emphasis"
      },
      {
        "blockNumber": 3,
        "name": "Cell Games Arc",
        "startWeek": 9,
        "endWeek": 12,
        "focus": "Concise 1-sentence description of this block's training emphasis"
      }
    ]
  },
  "week": ${currentWeek},
  "block": ${currentBlock},
  "blockName": "Name of current block ${currentBlock}",
  "weeklyIntent": "1-2 sentences on THIS week's specific training focus and what adaptations it targets",
  "workouts": {
    "Mon": {
      "type": "crossfitUpper",
      "title": "Unique DBZ title — e.g., 'Gravity Room 300x' or 'Broly's Domain' or 'Kaioken × Conditioning' (NOT 'Saiyan X')",
      "subtitle": "Short workout descriptor (e.g., Upper Body Strength & Conditioning)",
      "estimatedDuration": "55 min",
      "phases": [
        {
          "name": "Power Up Phase",
          "duration": "10 min",
          "exercises": [
            {
              "name": "World's Greatest Stretch",
              "description": "Step into deep lunge, rotate thoracic spine toward lead leg, reach arm to ceiling",
              "cue": "Keep back knee off the ground, rotate fully",
              "sets": 1,
              "reps": "5 each side",
              "rest": "0",
              "substitute": "Hip flexor lunge hold with reach"
            }
          ]
        },
        {
          "name": "Saiyan Strength Protocol",
          "duration": "30 min",
          "exercises": [ ... ]
        },
        {
          "name": "Hyperbolic Recovery",
          "duration": "8 min",
          "exercises": [ ... ]
        }
      ]
    },
    "Tue": { ... },
    "Wed": { ... },
    "Thu": { ... },
    "Fri": { ... },
    "Sat": { ... },
    "Sun": { ... }
  }
}

CRITICAL CHECKS before responding:
1. plan.blocks MUST contain 3-4 blocks (not 1). Each block covers 3-5 weeks. Blocks must be numbered sequentially with non-overlapping week ranges.
2. plan.summary is MAX 15 words. plan.coachNote is MAX 15 words. No exceptions.
3. All 7 days (Mon, Tue, Wed, Thu, Fri, Sat, Sun) present in workouts.
4. Every workout has exactly 3 phases: warmup "Power Up Phase", main work, cooldown "Hyperbolic Recovery".
5. No exercise appears in the DO NOT REPEAT list.
6. Running targets appropriate for the 5km benchmark.
7. Weekly structure balanced — no consecutive heavy days for same muscle groups.`;
}

function validateOutput(raw: any): void {
  if (!raw?.workouts || !raw?.plan || !raw?.weeklyIntent) {
    throw new Error('Response missing required top-level fields');
  }
  if (!Array.isArray(raw.plan.blocks) || raw.plan.blocks.length < 3) {
    throw new Error(`Plan has ${raw.plan.blocks?.length ?? 0} blocks — must have at least 3`);
  }
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (const day of days) {
    if (!raw.workouts[day]) throw new Error(`Response missing workout for ${day}`);
    const phases = raw.workouts[day].phases;
    if (!Array.isArray(phases) || phases.length < 2) {
      throw new Error(`${day} workout has fewer than 2 phases`);
    }
  }
}

async function generateWithOpenAI(input: WeeklyGenerationInput): Promise<WeeklyGenerationOutput> {
  const openai = new OpenAI({ apiKey: config.ai.apiKey });
  const model = config.ai.model || 'gpt-4o';

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(input) },
  ];

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 8000,
        messages: attempt === 1 ? messages : [
          ...messages,
          { role: 'assistant', content: 'I will now provide the complete JSON response with all 7 days and all required phases.' },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from OpenAI');

      const raw = JSON.parse(content);
      validateOutput(raw);

      return {
        week: raw.week ?? input.currentWeek,
        block: raw.block ?? input.currentBlock,
        blockName: raw.blockName ?? '',
        weeklyIntent: raw.weeklyIntent ?? '',
        plan: raw.plan,
        workouts: raw.workouts,
        model: completion.model,
      };
    } catch (err: any) {
      lastError = err;
      console.error(`OpenAI generation attempt ${attempt} failed:`, err.message);
    }
  }

  throw lastError ?? new Error('OpenAI generation failed');
}

// ═══════════════════════════════════
// Stub — minimal template for development
// Set AI_STUB_DELAY_MS to simulate AI latency and test the loader
// ═══════════════════════════════════
async function generateStub(input: WeeklyGenerationInput): Promise<WeeklyGenerationOutput> {
  if (config.ai.stubDelayMs > 0) {
    await new Promise((r) => setTimeout(r, config.ai.stubDelayMs));
  }
  return generateStubData(input);
}

function generateStubData(input: WeeklyGenerationInput): WeeklyGenerationOutput {
  const plan: TrainingPlanOutput = {
    name: 'Saiyan Protocol Foundation',
    totalWeeks: 12,
    summary: 'A hybrid program balancing combat conditioning, running performance, and calisthenics skill work.',
    coachNote: 'Every warrior starts with a baseline. The plan evolves once your logs start talking back.',
    blocks: [
      { blockNumber: 1, name: 'Saiyan Arc', startWeek: 1, endWeek: 4, focus: 'Base building. Establish movement patterns, aerobic base, technique. Moderate intensity.' },
      { blockNumber: 2, name: 'Namek Arc', startWeek: 5, endWeek: 8, focus: 'Intensity build. Heavier loads, faster intervals, harder progressions.' },
      { blockNumber: 3, name: 'Cell Games Arc', startWeek: 9, endWeek: 12, focus: 'Peak phase. Maximum intensity, benchmark testing, peak performance.' },
    ],
  };

  const currentBlock = plan.blocks.find((b) => b.blockNumber === input.currentBlock) || plan.blocks[0];

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
              { name: 'Arm Circles & Shoulder CARs', description: 'Dynamic shoulder mobility in all planes', cue: 'Full range, controlled tempo', sets: 2, reps: '10 each direction', rest: '0', substitute: 'Band pull-aparts' },
              { name: 'Hip Circles', description: 'Standing hip joint circles to open up', cue: 'Keep upper body still', sets: 1, reps: '10 each side', rest: '0', substitute: 'Hip flexor stretch' },
              { name: 'Banded Pull-Aparts', description: 'Pull resistance band apart across chest height', cue: 'Squeeze shoulder blades together', sets: 2, reps: '15', rest: '0', substitute: 'Face pulls with light band' },
            ],
          },
          {
            name: 'Full Power Combat — Strength',
            duration: '30 min',
            exercises: [
              { name: 'Push Press', description: 'Barbell overhead press with leg drive', cue: 'Dip and drive — lock out overhead', sets: 5, reps: '5', rest: '2.5 min', substitute: 'Dumbbell push press' },
              { name: 'Pendlay Row', description: 'Barbell row from dead stop on floor each rep', cue: 'Horizontal pull, bar to lower chest', sets: 4, reps: '6', rest: '2 min', substitute: 'Dumbbell row' },
              { name: 'Dips', description: 'Ring or bar dips, full range', cue: 'Lean forward slightly for chest emphasis', sets: 3, reps: '8-10', rest: '90 sec', substitute: 'Bench dips' },
              { name: 'Pull-ups', description: 'Dead hang to chin over bar', cue: 'Initiate with lat activation, not biceps', sets: 3, reps: 'AMRAP', rest: '2 min', substitute: 'Ring rows' },
            ],
          },
          {
            name: 'Hyperbolic Recovery',
            duration: '8 min',
            exercises: [
              { name: 'Chest Doorframe Stretch', description: 'Stand in doorway, arms at 90°, lean through', cue: 'Open chest, no shrugging', sets: 1, reps: '45 sec', rest: '0', substitute: 'Foam roll thoracic spine' },
              { name: 'Lat Stretch on Rack', description: 'Hold rack or bar at hip height, hip-hinge back', cue: 'Push hips back, arms straight', sets: 1, reps: '45 sec each side', rest: '0', substitute: 'Child\'s pose with arm reach' },
              { name: 'Diaphragmatic Breathing', description: 'Lie on back, belly breathing — 4s in, 6s out', cue: 'Belly rises, chest stays still', sets: 1, reps: '2 min', rest: '0', substitute: 'Seated box breathing' },
            ],
          },
        ],
      },
      Tue: {
        type: 'intervalRun',
        title: 'Gravity Training',
        subtitle: 'Interval Run',
        estimatedDuration: '40 min',
        phases: [
          {
            name: 'Power Up Phase',
            duration: '10 min',
            exercises: [
              { name: 'Easy Jog', description: '5-minute easy jog to warm the legs', cue: 'Conversational pace, loose and relaxed', sets: 1, reps: '5 min', rest: '0', substitute: 'Brisk walk' },
              { name: 'High Knees', description: 'Running in place, drive knees to hip height', cue: 'Pump arms, stay on toes', sets: 2, reps: '20 sec', rest: '10 sec', substitute: 'Marching in place' },
              { name: 'Leg Swings', description: 'Forward/back and lateral leg swings holding a support', cue: 'Controlled swing, relaxed hip', sets: 1, reps: '10 each direction', rest: '0', substitute: 'Standing hip circles' },
            ],
          },
          {
            name: 'Full Power Combat — Intervals',
            duration: '20 min',
            exercises: [
              { name: 'Hard Effort Intervals', description: '6 rounds: 60s at hard effort / 90s easy jog recovery', cue: "Hard = can't hold full sentence", sets: 6, reps: '60s hard / 90s easy', rest: '0', substitute: 'Bike intervals same timing' },
            ],
          },
          {
            name: 'Hyperbolic Recovery',
            duration: '8 min',
            exercises: [
              { name: 'Easy Walk Cool-Down', description: 'Walk at comfortable pace to bring HR down', cue: 'Deep steady breaths', sets: 1, reps: '3 min', rest: '0', substitute: 'Slow jog' },
              { name: 'Standing Quad Stretch', description: 'Stand on one leg, pull heel to glute', cue: 'Keep knees together, stand tall', sets: 1, reps: '45 sec each side', rest: '0', substitute: 'Seated quad stretch' },
              { name: 'Calf and Hamstring Stretch', description: 'Step one foot forward, hinge at hip reaching toward foot', cue: 'Soft knee on standing leg, feel stretch in back of leg', sets: 1, reps: '45 sec each side', rest: '0', substitute: 'Seated forward fold' },
            ],
          },
        ],
      },
      Wed: {
        type: 'tempoRun',
        title: 'Gravity Training',
        subtitle: 'Tempo Run',
        estimatedDuration: '40 min',
        phases: [
          {
            name: 'Power Up Phase',
            duration: '10 min',
            exercises: [
              { name: 'Easy Jog Warm-up', description: 'Gentle jog to begin warming up', cue: 'Very easy, just moving the legs', sets: 1, reps: '5 min', rest: '0', substitute: 'Fast walk' },
              { name: 'Butt Kicks', description: 'Running in place bringing heels up to glutes', cue: 'Quick turnover, stay light on feet', sets: 2, reps: '20 sec', rest: '10 sec', substitute: 'Marching with heel flick' },
              { name: 'Ankle Circles', description: 'Seated or standing, rotate ankles both directions', cue: 'Full circle, slow and controlled', sets: 1, reps: '10 each direction', rest: '0', substitute: 'Foot flexion and extension' },
            ],
          },
          {
            name: 'Full Power Combat — Tempo',
            duration: '22 min',
            exercises: [
              { name: 'Sustained Tempo Run', description: '20 minutes at comfortably hard pace — should be able to speak broken sentences only', cue: 'Consistent pace throughout, no surges', sets: 1, reps: '20 min', rest: '0', substitute: 'Bike at same perceived effort' },
            ],
          },
          {
            name: 'Hyperbolic Recovery',
            duration: '8 min',
            exercises: [
              { name: 'Walking Cool-Down', description: 'Easy walk to bring heart rate down gradually', cue: 'Slow breathing, relax shoulders', sets: 1, reps: '3 min', rest: '0', substitute: 'Gentle jog' },
              { name: 'Hip Flexor Lunge Stretch', description: 'Half-kneeling, sink hips forward to stretch hip flexor', cue: 'Keep torso upright, squeeze rear glute', sets: 1, reps: '45 sec each side', rest: '0', substitute: 'Standing quad stretch' },
              { name: 'Seated Forward Fold', description: 'Sit on floor, legs straight, reach for feet', cue: 'Hinge from hips, not the lower back', sets: 1, reps: '60 sec', rest: '0', substitute: 'Standing hamstring stretch' },
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
            name: 'Power Up Phase',
            duration: '10 min',
            exercises: [
              { name: 'Goblet Squat Hold', description: 'Hold light weight at chest, sink into deep squat, hold at bottom', cue: 'Elbows inside knees, chest up', sets: 2, reps: '45 sec', rest: '30 sec', substitute: 'Bodyweight squat hold' },
              { name: 'Hip Circles', description: 'Hands on hips, make large circles with hips', cue: 'Full range, both directions', sets: 1, reps: '10 each direction', rest: '0', substitute: 'Standing hip flexor rocks' },
              { name: 'Glute Bridges', description: 'Lie on back, feet flat, drive hips up', cue: 'Squeeze glutes at top, avoid lower back arch', sets: 2, reps: '12', rest: '30 sec', substitute: 'Supine hip hinge' },
            ],
          },
          {
            name: 'Full Power Combat — Strength',
            duration: '30 min',
            exercises: [
              { name: 'Back Squat', description: 'Barbell back squat, below parallel, controlled descent', cue: 'Brace core, knees track toes, chest stays up', sets: 5, reps: '5', rest: '3 min', substitute: 'Goblet squat' },
              { name: 'Romanian Deadlift', description: 'Hip hinge with soft knees, barbell close to body', cue: 'Feel hamstring stretch before reversing', sets: 4, reps: '8', rest: '2 min', substitute: 'Dumbbell RDL' },
              { name: 'Walking Lunges', description: 'Step forward into lunge, alternate legs continuously', cue: 'Upright torso, front knee over ankle', sets: 3, reps: '12 each leg', rest: '90 sec', substitute: 'Reverse lunges in place' },
              { name: 'Single-leg Calf Raises', description: 'Stand on edge of step, lower heel below step height', cue: 'Full range — deep stretch to full extension', sets: 3, reps: '15', rest: '60 sec', substitute: 'Two-leg calf raises' },
            ],
          },
          {
            name: 'Hyperbolic Recovery',
            duration: '8 min',
            exercises: [
              { name: 'Pigeon Pose', description: 'Front leg bent, rear leg extended behind, sink into stretch', cue: 'Square hips toward floor, breathe into the stretch', sets: 1, reps: '60 sec each side', rest: '0', substitute: 'Lying glute stretch' },
              { name: 'Lying Hamstring Stretch', description: 'On back, one leg up, use towel or hand to pull', cue: 'Soft knee, feel stretch in back of upper leg', sets: 1, reps: '45 sec each side', rest: '0', substitute: 'Standing forward fold' },
              { name: 'Child\'s Pose', description: 'Kneel, sit back on heels, arms extended, forehead to floor', cue: 'Breathe into lower back, let it expand', sets: 1, reps: '60 sec', rest: '0', substitute: 'Cat-cow stretch' },
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
            name: 'Power Up Phase',
            duration: '10 min',
            exercises: [
              { name: 'Wrist Circles and Extensions', description: 'Rotate wrists both directions, then extend and flex', cue: 'Slow and controlled — protect the wrists', sets: 2, reps: '10 each direction', rest: '0', substitute: 'Wrist stretches on floor' },
              { name: 'Bear Crawl', description: 'Quadruped crawl forward 10m and back, knees 2cm off floor', cue: 'Hips level with shoulders, opposite hand and foot move together', sets: 2, reps: '20m', rest: '30 sec', substitute: 'Cat-cow × 10' },
              { name: 'Scapular Push-ups', description: 'In plank, protract and retract shoulder blades without bending elbows', cue: 'Feel the shoulder blades slide around the ribcage', sets: 2, reps: '10', rest: '30 sec', substitute: 'Wall scapular slides' },
            ],
          },
          {
            name: 'Skill Work — Handstand',
            duration: '30 min',
            exercises: [
              { name: 'Wall Handstand Hold', description: 'Chest-to-wall or back-to-wall handstand — use whichever allows better shoulder position', cue: 'Push floor away, squeeze glutes, point toes', sets: 5, reps: '20-30 sec', rest: '90 sec', substitute: 'Pike hold on box' },
              { name: 'Hollow Body Hold', description: 'Lie on back, arms overhead, press lower back into floor, lift legs and shoulders', cue: 'Lower back must stay in contact with floor', sets: 4, reps: '20-30 sec', rest: '60 sec', substitute: 'Tuck hollow hold' },
              { name: 'Pike Push-ups', description: 'Downward dog position, bend elbows to lower head toward floor', cue: 'Elbows track back — not flaring wide', sets: 4, reps: '6-8', rest: '90 sec', substitute: 'Regular push-ups' },
              { name: 'L-Sit Tuck Hold', description: 'On parallel bars or floor, lift tucked knees to chest and hold', cue: 'Depress and retract scapula — push down hard', sets: 4, reps: '10-15 sec', rest: '90 sec', substitute: 'Seated leg lifts on floor' },
            ],
          },
          {
            name: 'Hyperbolic Recovery',
            duration: '8 min',
            exercises: [
              { name: 'Wrist Flexor Stretch', description: 'Arm extended, palm up, gently pull fingers back with other hand', cue: 'Gentle pressure only — no pain', sets: 1, reps: '45 sec each side', rest: '0', substitute: 'Prayer stretch' },
              { name: 'Thread the Needle', description: 'In quadruped, slide one arm under body rotating thoracic spine', cue: 'Keep hips square, feel rotation in mid-back', sets: 1, reps: '6 each side', rest: '0', substitute: 'Prone rotation stretch' },
              { name: 'Shoulder Cross-body Stretch', description: 'Pull one arm across chest with other arm', cue: 'Keep shoulder down, feel posterior shoulder', sets: 1, reps: '45 sec each side', rest: '0', substitute: 'Doorframe chest stretch' },
            ],
          },
        ],
      },
      Sat: {
        type: 'longRun',
        title: 'Gravity Training',
        subtitle: 'Long Run — Zone 2',
        estimatedDuration: '55 min',
        phases: [
          {
            name: 'Power Up Phase',
            duration: '10 min',
            exercises: [
              { name: 'Walking Warm-up', description: 'Brisk 3-minute walk to begin elevating heart rate', cue: 'Arms swinging naturally, breathe steadily', sets: 1, reps: '3 min', rest: '0', substitute: 'Easy cycle' },
              { name: 'Dynamic Hip Swings', description: 'Hold wall, swing leg forward and back, then side to side', cue: 'Controlled swing — not flinging', sets: 1, reps: '10 each direction each leg', rest: '0', substitute: 'Hip circles standing' },
              { name: 'Easy Jog Build-up', description: 'Gradually increase pace over 5 minutes from walk to easy run', cue: 'Smooth and relaxed, no tension', sets: 1, reps: '5 min progressive', rest: '0', substitute: 'Walk-jog intervals' },
            ],
          },
          {
            name: 'Zone 2 Long Run',
            duration: '35 min',
            exercises: [
              { name: 'Zone 2 Continuous Run', description: '35 minutes at easy conversational pace — able to hold full sentences throughout', cue: 'Should feel almost too easy. If you cannot speak comfortably, slow down.', sets: 1, reps: '35 min', rest: '0', substitute: 'Bike 50 min Zone 2' },
            ],
          },
          {
            name: 'Hyperbolic Recovery',
            duration: '8 min',
            exercises: [
              { name: 'Walking Cool-Down', description: 'Easy walk to bring heart rate back to resting zone', cue: 'Deep controlled breaths, shake out the legs', sets: 1, reps: '3 min', rest: '0', substitute: 'Very slow jog' },
              { name: 'Standing Pigeon Stretch', description: 'Figure-4 position against wall or standing, lean slightly forward', cue: 'Feel glute of raised leg, keep standing knee soft', sets: 1, reps: '45 sec each side', rest: '0', substitute: 'Lying figure-4 stretch' },
              { name: 'Calf Wall Stretch', description: 'Lean against wall, one foot back, heel on floor', cue: 'Keep heel firmly planted, feel deep calf stretch', sets: 1, reps: '45 sec each side', rest: '0', substitute: 'Downward dog hold' },
            ],
          },
        ],
      },
      Sun: {
        type: 'rest',
        title: 'Hyperbolic Rest',
        subtitle: 'Recovery & Regeneration',
        estimatedDuration: '25 min',
        phases: [
          {
            name: 'Power Up Phase',
            duration: '5 min',
            exercises: [
              { name: 'Light Walk', description: '5 minutes easy walking to get blood moving', cue: 'No purpose other than feeling good', sets: 1, reps: '5 min', rest: '0', substitute: 'Gentle stretching in place' },
            ],
          },
          {
            name: 'Active Recovery Flow',
            duration: '15 min',
            exercises: [
              { name: 'Full Body Foam Rolling', description: 'Roll calves, quads, glutes, lats, upper back — 30-60 sec each area', cue: 'Pause on tender spots, breathe, let tissue release', sets: 1, reps: '10-15 min', rest: '0', substitute: 'Lacrosse ball massage' },
              { name: 'Light Yoga or Stretching', description: 'Sun salutation flow or full-body static stretch routine', cue: 'Move gently, nothing strenuous', sets: 1, reps: '10 min', rest: '0', substitute: 'Walk 20 min' },
            ],
          },
          {
            name: 'Hyperbolic Recovery',
            duration: '5 min',
            exercises: [
              { name: 'Box Breathing', description: '4 counts inhale — 4 counts hold — 4 counts exhale — 4 counts hold', cue: 'Activate parasympathetic system, signal full recovery', sets: 1, reps: '5 min', rest: '0', substitute: 'Diaphragmatic breathing' },
            ],
          },
        ],
      },
    },
  };
}
