import type { Workout, WeekSchedule } from '../types';

// ═══════════════════════════════════
// WEEK 1 — SAIYAN ARC (Block 1)
// ═══════════════════════════════════

const mondayWod: Workout = {
  id: 'w1-mon',
  day: 'Mon',
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
          id: 'ex-arm-circles',
          name: 'Arm Circles & Shoulder CARs',
          description: 'Dynamic shoulder mobility in all planes',
          cue: 'Full range, controlled tempo',
          sets: 2,
          reps: '10 each direction',
          rest: '0',
          substitute: 'Band pull-aparts',
        },
        {
          id: 'ex-wrist-circles',
          name: 'Wrist Circles & Flexor Stretch',
          description: 'Prep wrists for pressing and support work',
          cue: 'Slow circles, hold stretches 15s',
          sets: 1,
          reps: '10 each',
          rest: '0',
          substitute: 'Prayer stretch',
        },
        {
          id: 'ex-pushup-ddog',
          name: 'Push-Up to Downward Dog',
          description: 'Dynamic flow combining push and shoulder opening',
          cue: 'Press hips high, heels toward floor',
          sets: 2,
          reps: '8',
          rest: '30 sec',
          substitute: 'Incline push-ups',
        },
      ],
    },
    {
      name: 'Full Power Combat — Strength',
      duration: '20 min',
      exercises: [
        {
          id: 'ex-push-press',
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
    {
      name: 'Full Power Combat — Conditioning',
      duration: '15 min AMRAP',
      exercises: [
        {
          id: 'ex-pull-ups',
          name: 'Pull-Ups',
          description: 'Strict or kipping pull-ups',
          cue: 'Full extension at bottom, chin over bar',
          sets: 1,
          reps: '8',
          rest: '0',
          substitute: 'Ring rows',
        },
        {
          id: 'ex-push-ups',
          name: 'Push-Ups',
          description: 'Standard push-ups, chest to deck',
          cue: 'Elbows at 45 degrees, full lockout',
          sets: 1,
          reps: '12',
          rest: '0',
          substitute: 'Knee push-ups',
        },
        {
          id: 'ex-db-rows',
          name: 'Dumbbell Rows',
          description: 'Single arm bent-over row',
          cue: 'Pull to hip, squeeze shoulder blade',
          sets: 1,
          reps: '10 each',
          rest: '0',
          substitute: 'Towel rows on door',
        },
        {
          id: 'ex-hollow-hold-mon',
          name: 'Hollow Body Hold',
          description: 'Core bracing in hollow position',
          cue: 'Lower back glued to floor',
          sets: 1,
          reps: '20 sec',
          rest: '0',
          substitute: 'Dead bugs',
        },
      ],
    },
    {
      name: 'Final Strike',
      duration: '3 min',
      exercises: [
        {
          id: 'ex-max-burpees',
          name: 'Max Burpees',
          description: 'Full burpees for 3 minutes straight',
          cue: 'Chest to floor, full jump at top',
          sets: 1,
          reps: 'Max in 3 min',
          rest: '0',
          substitute: 'Sprawls',
        },
      ],
    },
    {
      name: 'Ki Recovery',
      duration: '6 min',
      exercises: [
        {
          id: 'ex-chest-stretch',
          name: 'Chest Doorway Stretch',
          description: 'Passive pec stretch in doorframe',
          cue: 'Hold 30s each side, breathe deep',
          sets: 1,
          reps: '30s each',
          rest: '0',
          substitute: 'Floor chest stretch',
        },
        {
          id: 'ex-lat-stretch',
          name: 'Lat Stretch',
          description: 'Overhead lat stretch on wall or bar',
          cue: 'Sink hips away, feel the pull',
          sets: 1,
          reps: '30s each',
          rest: '0',
          substitute: 'Child\'s pose',
        },
        {
          id: 'ex-box-breathing',
          name: 'Box Breathing',
          description: '4-4-4-4 breathing pattern',
          cue: 'In 4, hold 4, out 4, hold 4',
          sets: 1,
          reps: '5 rounds',
          rest: '0',
          substitute: '4-7-8 breathing',
        },
      ],
    },
  ],
};

const tuesdayRun: Workout = {
  id: 'w1-tue',
  day: 'Tue',
  type: 'intervalRun',
  title: 'Gravity Training',
  subtitle: 'Interval Run',
  estimatedDuration: '35 min',
  phases: [
    {
      name: 'Power Up Phase',
      duration: '8 min',
      exercises: [
        {
          id: 'ex-walk-jog',
          name: 'Walk to Jog',
          description: '5 min walk building to easy jog',
          cue: 'Gradual buildup, no rushing',
          sets: 1,
          reps: '5 min',
          rest: '0',
          substitute: 'Stationary march',
        },
        {
          id: 'ex-leg-swings',
          name: 'Leg Swings & High Knees',
          description: 'Dynamic leg prep',
          cue: '10 swings each leg, 20 high knees',
          sets: 1,
          reps: '30 sec each',
          rest: '0',
          substitute: 'Walking lunges',
        },
        {
          id: 'ex-strides-tue',
          name: 'Strides',
          description: '3 progressive 50m accelerations',
          cue: 'Build to 80% effort, decelerate smoothly',
          sets: 3,
          reps: '50m',
          rest: '30 sec',
          substitute: 'High knees in place',
        },
      ],
    },
    {
      name: 'Full Power Combat — Intervals',
      duration: '18 min',
      exercises: [
        {
          id: 'ex-hard-intervals',
          name: 'Hard Effort Intervals',
          description: '60s hard running / 90s easy jog recovery',
          cue: 'Hard = can\'t hold conversation. Recovery = easy jog, not walk.',
          sets: 6,
          reps: '60s hard / 90s easy',
          rest: '0',
          substitute: 'Bike intervals same timing',
        },
      ],
    },
    {
      name: 'Ki Recovery',
      duration: '10 min',
      exercises: [
        {
          id: 'ex-easy-jog-tue',
          name: 'Easy Jog Cooldown',
          description: '5 min very easy jog',
          cue: 'Conversational pace, bring heart rate down',
          sets: 1,
          reps: '5 min',
          rest: '0',
          substitute: 'Walk',
        },
        {
          id: 'ex-calf-hip-stretch',
          name: 'Calf & Hip Flexor Stretch',
          description: 'Static holds for calves and hip flexors',
          cue: 'Hold each 30s, breathe into the stretch',
          sets: 1,
          reps: '30s each side',
          rest: '0',
          substitute: 'Seated stretches',
        },
      ],
    },
  ],
};

const wednesdayTempo: Workout = {
  id: 'w1-wed',
  day: 'Wed',
  type: 'tempoRun',
  title: 'Gravity Training',
  subtitle: 'Tempo Run',
  estimatedDuration: '35 min',
  phases: [
    {
      name: 'Power Up Phase',
      duration: '8 min',
      exercises: [
        {
          id: 'ex-easy-jog-wed',
          name: 'Easy Jog',
          description: '5 min easy jog warmup',
          cue: 'Relaxed, shake out the legs',
          sets: 1,
          reps: '5 min',
          rest: '0',
          substitute: 'Brisk walk',
        },
        {
          id: 'ex-strides-wed',
          name: 'Strides',
          description: '3 progressive accelerations',
          cue: 'Smooth, controlled buildup',
          sets: 3,
          reps: '50m',
          rest: '30 sec',
          substitute: 'High knees',
        },
      ],
    },
    {
      name: 'Full Power Combat — Tempo',
      duration: '20 min',
      exercises: [
        {
          id: 'ex-tempo-run',
          name: 'Sustained Tempo Run',
          description: '20 minutes at comfortably hard pace',
          cue: 'Broken sentences OK, not full conversation, not sprinting',
          sets: 1,
          reps: '20 min',
          rest: '0',
          substitute: 'Bike at same perceived effort',
        },
      ],
    },
    {
      name: 'Ki Recovery',
      duration: '8 min',
      exercises: [
        {
          id: 'ex-easy-jog-wed-cd',
          name: 'Easy Jog Cooldown',
          description: '5 min easy jog',
          cue: 'Let heart rate settle naturally',
          sets: 1,
          reps: '5 min',
          rest: '0',
          substitute: 'Walk',
        },
        {
          id: 'ex-leg-stretch-seq',
          name: 'Full Leg Stretch Sequence',
          description: 'Quads, hamstrings, calves, hip flexors',
          cue: '30s each position, both sides',
          sets: 1,
          reps: '30s each',
          rest: '0',
          substitute: 'Foam roll',
        },
      ],
    },
  ],
};

const thursdayWod: Workout = {
  id: 'w1-thu',
  day: 'Thu',
  type: 'crossfitLower',
  title: 'Combat Training',
  subtitle: 'CrossFit WOD — Lower Focus',
  estimatedDuration: '55 min',
  phases: [
    {
      name: 'Power Up Phase',
      duration: '10 min',
      exercises: [
        {
          id: 'ex-hip-ankle-mob',
          name: 'Hip Circles & Ankle Mobility',
          description: 'Dynamic hip and ankle prep',
          cue: 'Full circles, controlled tempo',
          sets: 2,
          reps: '10 each direction',
          rest: '0',
          substitute: 'Bodyweight squats',
        },
        {
          id: 'ex-goblet-hold',
          name: 'Goblet Squat Hold',
          description: 'Deep squat hold with light weight',
          cue: 'Elbows push knees out, chest tall',
          sets: 2,
          reps: '30 sec hold',
          rest: '30 sec',
          substitute: 'Bodyweight deep squat hold',
        },
      ],
    },
    {
      name: 'Full Power Combat — Strength',
      duration: '20 min',
      exercises: [
        {
          id: 'ex-back-squat',
          name: 'Back Squat',
          description: 'Barbell back squat — below parallel',
          cue: 'Brace core, knees track toes, drive through heels',
          sets: 5,
          reps: '5',
          rest: '3 min',
          substitute: 'Goblet squat',
        },
      ],
    },
    {
      name: 'Full Power Combat — Conditioning',
      duration: '12 min AMRAP',
      exercises: [
        {
          id: 'ex-wall-balls',
          name: 'Wall Balls',
          description: 'Squat to overhead throw at target',
          cue: 'Full depth squat, extend through the ball',
          sets: 1,
          reps: '15',
          rest: '0',
          substitute: 'Thrusters',
        },
        {
          id: 'ex-box-jumps',
          name: 'Box Jumps',
          description: 'Explosive jump onto box, step down',
          cue: 'Land soft, full hip extension at top',
          sets: 1,
          reps: '10',
          rest: '0',
          substitute: 'Jump squats',
        },
        {
          id: 'ex-kb-swings',
          name: 'Kettlebell Swings',
          description: 'Russian-style hip hinge swing',
          cue: 'Snap hips, arms are just hooks',
          sets: 1,
          reps: '15',
          rest: '0',
          substitute: 'Dumbbell swings',
        },
      ],
    },
    {
      name: 'Final Strike',
      duration: '4 min',
      exercises: [
        {
          id: 'ex-100-air-squats',
          name: '100 Air Squats for Time',
          description: 'Full depth air squats as fast as possible',
          cue: 'Below parallel every rep, no cutting depth',
          sets: 1,
          reps: '100',
          rest: '0',
          substitute: 'Alternating lunges x 100',
        },
      ],
    },
    {
      name: 'Ki Recovery',
      duration: '6 min',
      exercises: [
        {
          id: 'ex-pigeon-pose',
          name: 'Pigeon Pose',
          description: 'Deep hip opener',
          cue: 'Hold 45s each side, breathe deep',
          sets: 1,
          reps: '45s each',
          rest: '0',
          substitute: 'Figure-4 stretch',
        },
        {
          id: 'ex-hip-flexor-lunge',
          name: 'Hip Flexor Lunge Stretch',
          description: 'Low lunge with rear knee down',
          cue: 'Push hips forward, squeeze glute',
          sets: 1,
          reps: '30s each',
          rest: '0',
          substitute: 'Standing quad stretch',
        },
        {
          id: 'ex-478-breathing',
          name: '4-7-8 Breathing',
          description: 'Inhale 4, hold 7, exhale 8',
          cue: 'Slow and controlled, eyes closed',
          sets: 1,
          reps: '4 rounds',
          rest: '0',
          substitute: 'Box breathing',
        },
      ],
    },
  ],
};

const fridaySkill: Workout = {
  id: 'w1-fri',
  day: 'Fri',
  type: 'calisthenics',
  title: 'Turtle School Method',
  subtitle: 'Calisthenics Skill Day',
  estimatedDuration: '50 min',
  phases: [
    {
      name: 'Power Up Phase',
      duration: '8 min',
      exercises: [
        {
          id: 'ex-wrist-stretch-fri',
          name: 'Wrist Circles & Stretch',
          description: 'Full wrist mobility routine',
          cue: 'Slow circles, hold flexor/extensor 15s each',
          sets: 1,
          reps: '10 each',
          rest: '0',
          substitute: 'Wrist rolls on floor',
        },
        {
          id: 'ex-shoulder-cars',
          name: 'Shoulder CARs',
          description: 'Controlled articular rotations',
          cue: 'Biggest circle possible, slow and controlled',
          sets: 2,
          reps: '5 each direction',
          rest: '0',
          substitute: 'Arm circles',
        },
        {
          id: 'ex-scap-pushups',
          name: 'Scapular Push-Ups',
          description: 'Push-up position, protract/retract scapulae',
          cue: 'Arms locked, move only shoulder blades',
          sets: 1,
          reps: '10',
          rest: '0',
          substitute: 'Wall scapular slides',
        },
        {
          id: 'ex-hollow-hold-fri',
          name: 'Hollow Body Hold',
          description: 'Core activation in hollow position',
          cue: 'Lower back pressed to floor, arms overhead',
          sets: 3,
          reps: '20 sec',
          rest: '30 sec',
          substitute: 'Dead bug holds',
        },
      ],
    },
    {
      name: 'Skill Work — Handstand',
      duration: '12 min',
      exercises: [
        {
          id: 'ex-wall-handstand',
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
    {
      name: 'Skill Work — L-Sit',
      duration: '10 min',
      exercises: [
        {
          id: 'ex-floor-lsit',
          name: 'Floor L-Sit Attempts',
          description: 'Hands on floor, lift legs to L position',
          cue: 'Push floor away, compress hip flexors',
          sets: 3,
          reps: '10 sec',
          rest: '60 sec',
          substitute: 'Tuck L-sit on parallettes',
        },
      ],
    },
    {
      name: 'Accessory Work',
      duration: '12 min',
      exercises: [
        {
          id: 'ex-aus-rows',
          name: 'Australian Rows',
          description: 'Inverted bodyweight rows under bar',
          cue: 'Pull chest to bar, squeeze at top',
          sets: 3,
          reps: '12',
          rest: '60 sec',
          substitute: 'Towel rows',
        },
        {
          id: 'ex-pike-pushups',
          name: 'Pike Push-Ups',
          description: 'Elevated pike position push-ups',
          cue: 'Head between arms, touch floor',
          sets: 3,
          reps: '10',
          rest: '60 sec',
          substitute: 'Decline push-ups',
        },
      ],
    },
    {
      name: 'Ki Recovery',
      duration: '10 min',
      exercises: [
        {
          id: 'ex-easy-2km-jog',
          name: 'Easy 2km Jog',
          description: 'Conversational pace recovery jog',
          cue: 'Should feel almost too easy',
          sets: 1,
          reps: '2km',
          rest: '0',
          substitute: '10 min walk',
        },
        {
          id: 'ex-full-body-stretch',
          name: 'Full Body Stretch Flow',
          description: 'Flowing stretch sequence hitting all major groups',
          cue: '30s each position, breathe and relax',
          sets: 1,
          reps: '5 min',
          rest: '0',
          substitute: 'Yoga sun salutations',
        },
      ],
    },
  ],
};

const saturdayLong: Workout = {
  id: 'w1-sat',
  day: 'Sat',
  type: 'longRun',
  title: 'Gravity Training',
  subtitle: 'Long Run — Zone 2',
  estimatedDuration: '50 min',
  phases: [
    {
      name: 'Power Up Phase',
      duration: '5 min',
      exercises: [
        {
          id: 'ex-brisk-walk-jog',
          name: 'Brisk Walk to Easy Jog',
          description: 'Gradual warmup buildup',
          cue: '2 min walk, 3 min easy jog',
          sets: 1,
          reps: '5 min',
          rest: '0',
          substitute: 'Stationary march',
        },
      ],
    },
    {
      name: 'Full Power Combat — Long Run',
      duration: '35-40 min',
      exercises: [
        {
          id: 'ex-zone2-long-run',
          name: 'Zone 2 Long Run',
          description: '6-7km at easy conversational pace',
          cue: 'Should feel almost too easy. This is aerobic base building.',
          sets: 1,
          reps: '6-7km',
          rest: '0',
          substitute: 'Bike 45 min Zone 2',
        },
      ],
    },
    {
      name: 'Ki Recovery',
      duration: '10 min',
      exercises: [
        {
          id: 'ex-walk-cooldown',
          name: 'Walk Cooldown',
          description: '5 min easy walk',
          cue: 'Let heart rate come down naturally',
          sets: 1,
          reps: '5 min',
          rest: '0',
          substitute: 'Standing in place',
        },
        {
          id: 'ex-lower-body-stretch',
          name: 'Full Lower Body Stretch',
          description: 'Calves, hip flexors, quads, hamstrings',
          cue: 'Extra time on calves and hip flexors',
          sets: 1,
          reps: '30s each',
          rest: '0',
          substitute: 'Foam roll',
        },
      ],
    },
  ],
};

const sundayRest: Workout = {
  id: 'w1-sun',
  day: 'Sun',
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
          id: 'ex-light-walk-yoga',
          name: 'Light Walk or Yoga',
          description: 'Easy movement to promote blood flow',
          cue: 'Nothing strenuous. Move to feel good.',
          sets: 1,
          reps: '20-30 min',
          rest: '0',
          substitute: 'Full rest',
        },
        {
          id: 'ex-foam-rolling',
          name: 'Foam Rolling',
          description: 'Self-myofascial release on tight areas',
          cue: 'Slow rolls, pause on tender spots',
          sets: 1,
          reps: '10 min',
          rest: '0',
          substitute: 'Stretching',
        },
      ],
    },
  ],
};

export const week1Schedule: WeekSchedule = {
  week: 1,
  block: 1,
  blockName: 'Saiyan Arc',
  weeklyIntent:
    'Establish movement patterns and build your aerobic base. Moderate intensity — no maximal efforts. Learn the system.',
  workouts: {
    Mon: mondayWod,
    Tue: tuesdayRun,
    Wed: wednesdayTempo,
    Thu: thursdayWod,
    Fri: fridaySkill,
    Sat: saturdayLong,
    Sun: sundayRest,
  },
};

/** Build a lookup map from exercise ID → Exercise for a given schedule */
export function buildExerciseMap(schedule: WeekSchedule): Map<string, { name: string }> {
  const map = new Map<string, { name: string }>();
  for (const workout of Object.values(schedule.workouts)) {
    for (const phase of workout.phases) {
      for (const ex of phase.exercises) {
        map.set(ex.id, { name: ex.name });
      }
    }
  }
  return map;
}

export function getWorkoutIcon(type: Workout['type']): string {
  switch (type) {
    case 'crossfitUpper':
    case 'crossfitLower':
      return '⚔️';
    case 'intervalRun':
      return '⚡';
    case 'tempoRun':
      return '🔥';
    case 'longRun':
      return '🐢';
    case 'calisthenics':
      return '🐉';
    case 'rest':
      return '💤';
  }
}

export function getWorkoutColor(type: Workout['type']): string {
  switch (type) {
    case 'crossfitUpper':
    case 'crossfitLower':
      return 'var(--red)';
    case 'intervalRun':
      return 'var(--yellow)';
    case 'tempoRun':
      return 'var(--orange)';
    case 'longRun':
      return 'var(--blue)';
    case 'calisthenics':
      return 'var(--green)';
    case 'rest':
      return 'var(--text-mid)';
  }
}
