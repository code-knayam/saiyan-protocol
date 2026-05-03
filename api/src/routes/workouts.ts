import { Router, type Router as RouterType } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { generateWeeklyWorkouts } from '../services/ai.js';

const router: RouterType = Router();
router.use(authenticate);

// ═══════════════════════════════════
// GET /workouts/week?week=1&block=1
// Fetch the schedule for a given week/block
// ═══════════════════════════════════
router.get('/week', async (req, res) => {
  try {
    const week = parseInt(req.query.week as string, 10) || 1;
    const block = parseInt(req.query.block as string, 10) || 1;
    const athleteId = req.athlete!.athleteId;

    const schedule = await getFullSchedule(athleteId, week, block);
    if (!schedule) {
      res.status(404).json({ error: 'No schedule found for this week/block' });
      return;
    }

    res.json(schedule);
  } catch (err) {
    console.error('Get week error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════
// POST /workouts/generate
// Generate a new week of workouts via AI
// ═══════════════════════════════════
router.post('/generate', async (req, res) => {
  try {
    const athleteId = req.athlete!.athleteId;

    // Get athlete profile
    const athleteResult = await pool.query(
      `SELECT * FROM athletes WHERE id = $1`,
      [athleteId],
    );
    if (athleteResult.rows.length === 0) {
      res.status(404).json({ error: 'Athlete not found' });
      return;
    }
    const athlete = athleteResult.rows[0];

    // Get recent session logs for adaptive progression
    const logsResult = await pool.query(
      `SELECT sl.*, w.type as workout_type
       FROM session_logs sl
       JOIN workouts w ON w.id = sl.workout_id
       WHERE sl.athlete_id = $1
       ORDER BY sl.date DESC LIMIT 10`,
      [athleteId],
    );

    // Get recent exercise history to avoid repetition
    const exerciseHistoryResult = await pool.query(
      `SELECT DISTINCT e.name
       FROM exercises e
       JOIN workout_phases wp ON wp.id = e.phase_id
       JOIN workouts w ON w.id = wp.workout_id
       JOIN week_schedules ws ON ws.id = w.schedule_id
       WHERE ws.athlete_id = $1
         AND ws.created_at > NOW() - INTERVAL '30 days'`,
      [athleteId],
    );

    // Call AI service
    const aiResult = await generateWeeklyWorkouts({
      athlete,
      recentLogs: logsResult.rows,
      exerciseHistory: exerciseHistoryResult.rows.map((r) => r.name),
      currentBlock: athlete.current_block,
      currentWeek: athlete.current_week,
    });

    // Persist the generated plan summary and schedule
    await persistSchedule(athleteId, aiResult);

    // Return the full schedule
    const schedule = await getFullSchedule(athleteId, athlete.current_week, athlete.current_block);
    res.status(201).json(schedule);
  } catch (err) {
    console.error('Generate workouts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════
// GET /workouts/:workoutId
// Get a single workout with all phases and exercises
// ═══════════════════════════════════
router.get('/:workoutId', async (req, res) => {
  try {
    const { workoutId } = req.params;
    const athleteId = req.athlete!.athleteId;

    // Verify ownership
    const workoutResult = await pool.query(
      `SELECT w.* FROM workouts w
       JOIN week_schedules ws ON ws.id = w.schedule_id
       WHERE w.id = $1 AND ws.athlete_id = $2`,
      [workoutId, athleteId],
    );

    if (workoutResult.rows.length === 0) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    const workout = workoutResult.rows[0];

    // Get phases with exercises
    const phasesResult = await pool.query(
      `SELECT wp.*, json_agg(
         json_build_object(
           'id', e.id, 'name', e.name, 'description', e.description,
           'cue', e.cue, 'sets', e.sets, 'reps', e.reps,
           'rest', e.rest, 'substitute', e.substitute
         ) ORDER BY e.sort_order
       ) AS exercises
       FROM workout_phases wp
       LEFT JOIN exercises e ON e.phase_id = wp.id
       WHERE wp.workout_id = $1
       GROUP BY wp.id
       ORDER BY wp.sort_order`,
      [workoutId],
    );

    res.json({
      ...workout,
      phases: phasesResult.rows.map((p) => ({
        id: p.id,
        name: p.name,
        duration: p.duration,
        exercises: p.exercises.filter((e: any) => e.id !== null),
      })),
    });
  } catch (err) {
    console.error('Get workout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════
// Helpers
// ═══════════════════════════════════

async function getFullSchedule(athleteId: string, week: number, block: number) {
  const scheduleResult = await pool.query(
    `SELECT * FROM week_schedules
     WHERE athlete_id = $1 AND week = $2 AND block = $3`,
    [athleteId, week, block],
  );

  if (scheduleResult.rows.length === 0) return null;
  const schedule = scheduleResult.rows[0];

  const workoutsResult = await pool.query(
    `SELECT w.*,
       (SELECT json_agg(
         json_build_object(
           'id', wp.id, 'name', wp.name, 'duration', wp.duration,
           'exercises', (
             SELECT json_agg(
               json_build_object(
                 'id', e.id, 'name', e.name, 'description', e.description,
                 'cue', e.cue, 'sets', e.sets, 'reps', e.reps,
                 'rest', e.rest, 'substitute', e.substitute
               ) ORDER BY e.sort_order
             ) FROM exercises e WHERE e.phase_id = wp.id
           )
         ) ORDER BY wp.sort_order
       ) FROM workout_phases wp WHERE wp.workout_id = w.id) AS phases
     FROM workouts w
     WHERE w.schedule_id = $1
     ORDER BY CASE w.day
       WHEN 'Mon' THEN 1 WHEN 'Tue' THEN 2 WHEN 'Wed' THEN 3
       WHEN 'Thu' THEN 4 WHEN 'Fri' THEN 5 WHEN 'Sat' THEN 6
       WHEN 'Sun' THEN 7 END`,
    [schedule.id],
  );

  let plan = null;
  if (schedule.plan_id) {
    const planResult = await pool.query(
      `SELECT * FROM training_plans WHERE id = $1 AND athlete_id = $2`,
      [schedule.plan_id, athleteId],
    );
    const blocksResult = await pool.query(
      `SELECT block_number, name, start_week, end_week, focus
       FROM training_plan_blocks
       WHERE plan_id = $1
       ORDER BY sort_order, block_number`,
      [schedule.plan_id],
    );

    if (planResult.rows.length > 0) {
      const row = planResult.rows[0];
      plan = {
        id: row.id,
        name: row.name,
        totalWeeks: row.total_weeks,
        summary: row.summary,
        coachNote: row.coach_note,
        blocks: blocksResult.rows.map((b) => ({
          blockNumber: b.block_number,
          name: b.name,
          startWeek: b.start_week,
          endWeek: b.end_week,
          focus: b.focus,
        })),
      };
    }
  }

  return {
    id: schedule.id,
    week: schedule.week,
    block: schedule.block,
    blockName: schedule.block_name,
    weeklyIntent: schedule.weekly_intent,
    plan,
    workouts: workoutsResult.rows.reduce((acc, w) => {
      acc[w.day] = {
        id: w.id,
        day: w.day,
        type: w.type,
        title: w.title,
        subtitle: w.subtitle,
        estimatedDuration: w.estimated_duration,
        phases: w.phases || [],
      };
      return acc;
    }, {} as Record<string, any>),
  };
}

async function persistSchedule(athleteId: string, aiResult: any): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const planId = await persistActivePlan(client, athleteId, aiResult.plan);

    // Insert week schedule
    const scheduleResult = await client.query(
      `INSERT INTO week_schedules (plan_id, athlete_id, week, block, block_name, weekly_intent)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (athlete_id, week, block) DO UPDATE
          SET plan_id = EXCLUDED.plan_id,
              block_name = EXCLUDED.block_name,
              weekly_intent = EXCLUDED.weekly_intent
       RETURNING id`,
      [planId, athleteId, aiResult.week, aiResult.block, aiResult.blockName, aiResult.weeklyIntent],
    );
    const scheduleId = scheduleResult.rows[0].id;

    // Delete old workouts for this schedule (cascade deletes phases/exercises)
    await client.query(
      `DELETE FROM workouts WHERE schedule_id = $1`,
      [scheduleId],
    );

    // Insert workouts, phases, exercises
    for (const [day, workout] of Object.entries(aiResult.workouts) as [string, any][]) {
      const workoutResult = await client.query(
        `INSERT INTO workouts (schedule_id, day, type, title, subtitle, estimated_duration)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [scheduleId, day, workout.type, workout.title, workout.subtitle, workout.estimatedDuration],
      );
      const workoutId = workoutResult.rows[0].id;

      for (let pi = 0; pi < (workout.phases || []).length; pi++) {
        const phase = workout.phases[pi];
        const phaseResult = await client.query(
          `INSERT INTO workout_phases (workout_id, name, duration, sort_order)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [workoutId, phase.name, phase.duration, pi],
        );
        const phaseId = phaseResult.rows[0].id;

        for (let ei = 0; ei < (phase.exercises || []).length; ei++) {
          const ex = phase.exercises[ei];
          await client.query(
            `INSERT INTO exercises (phase_id, name, description, cue, sets, reps, rest, substitute, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [phaseId, ex.name, ex.description, ex.cue, ex.sets, ex.reps, ex.rest, ex.substitute, ei],
          );
        }
      }
    }

    // Log the AI generation
    await client.query(
      `INSERT INTO ai_generation_logs (athlete_id, call_type, request_payload, response_payload, model)
       VALUES ($1, 'weeklyGeneration', $2, $3, $4)`,
      [athleteId, JSON.stringify({ week: aiResult.week, block: aiResult.block }), JSON.stringify(aiResult), aiResult.model || ''],
    );

    await client.query('COMMIT');
    return scheduleId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function persistActivePlan(client: any, athleteId: string, plan: any): Promise<string> {
  const existing = await client.query(
    `SELECT id FROM training_plans WHERE athlete_id = $1 AND active = TRUE ORDER BY created_at DESC LIMIT 1`,
    [athleteId],
  );

  const planData = plan || {
    name: 'Saiyan Protocol',
    totalWeeks: 1,
    summary: '',
    coachNote: '',
    blocks: [],
  };

  let planId = existing.rows[0]?.id;

  if (planId) {
    await client.query(
      `UPDATE training_plans
       SET name = $1, total_weeks = $2, summary = $3, coach_note = $4
       WHERE id = $5`,
      [planData.name, planData.totalWeeks, planData.summary || '', planData.coachNote || '', planId],
    );
    await client.query(`DELETE FROM training_plan_blocks WHERE plan_id = $1`, [planId]);
  } else {
    const planResult = await client.query(
      `INSERT INTO training_plans (athlete_id, name, total_weeks, summary, coach_note, active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id`,
      [athleteId, planData.name, planData.totalWeeks, planData.summary || '', planData.coachNote || ''],
    );
    planId = planResult.rows[0].id;
  }

  for (let i = 0; i < (planData.blocks || []).length; i++) {
    const block = planData.blocks[i];
    await client.query(
      `INSERT INTO training_plan_blocks (plan_id, block_number, name, start_week, end_week, focus, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [planId, block.blockNumber, block.name, block.startWeek, block.endWeek, block.focus || '', i],
    );
  }

  return planId;
}

// ═══════════════════════════════════
// Exported helper — called by athlete route on onboarding completion
// ═══════════════════════════════════

export async function generateAndPersistScheduleForAthlete(athleteId: string): Promise<void> {
  const athleteResult = await pool.query(
    `SELECT * FROM athletes WHERE id = $1`,
    [athleteId],
  );
  if (athleteResult.rows.length === 0) throw new Error('Athlete not found');
  const athlete = athleteResult.rows[0];

  const logsResult = await pool.query(
    `SELECT sl.*, w.type as workout_type
     FROM session_logs sl
     JOIN workouts w ON w.id = sl.workout_id
     WHERE sl.athlete_id = $1
     ORDER BY sl.date DESC LIMIT 10`,
    [athleteId],
  );

  const exerciseHistoryResult = await pool.query(
    `SELECT DISTINCT e.name
     FROM exercises e
     JOIN workout_phases wp ON wp.id = e.phase_id
     JOIN workouts w ON w.id = wp.workout_id
     JOIN week_schedules ws ON ws.id = w.schedule_id
     WHERE ws.athlete_id = $1
       AND ws.created_at > NOW() - INTERVAL '30 days'`,
    [athleteId],
  );

  const aiResult = await generateWeeklyWorkouts({
    athlete,
    recentLogs: logsResult.rows,
    exerciseHistory: exerciseHistoryResult.rows.map((r) => r.name),
    currentBlock: athlete.current_block,
    currentWeek: athlete.current_week,
  });

  await persistSchedule(athleteId, aiResult);
}

export default router;
