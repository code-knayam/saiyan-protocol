import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkoutIcon, getWorkoutColor } from '../data/workouts';
import { useAthlete, useSchedule, useSessionLogs } from '../store';
import { calculatePowerGain, getRoshiNote } from '../powerEngine';
import type { Exercise, WorkoutPhase, SetLog, ExerciseLog } from '../types';
import type { PowerGainResult } from '../powerEngine';
import './WorkoutDetail.css';

/** Check if an exercise is time-based (holds, runs, etc.) */
function isTimedExercise(exercise: Exercise): boolean {
  const repsLower = exercise.reps.toLowerCase();
  return (
    repsLower.includes('sec') ||
    repsLower.includes('min') ||
    repsLower.includes('km') ||
    repsLower.includes('max in')
  );
}

/** Create empty set logs for an exercise */
function createEmptySets(exercise: Exercise): SetLog[] {
  return Array.from({ length: exercise.sets }, (_, i) => ({
    setNumber: i + 1,
    reps: null,
    weight: null,
    time: null,
    completed: false,
  }));
}

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { athlete } = useAthlete();
  const { schedule } = useSchedule();
  const { logs, submitLog } = useSessionLogs();

  // Find workout from schedule
  const workout = useMemo(() => {
    if (!schedule) return null;
    return Object.values(schedule.workouts).find((w) => w.id === id) ?? null;
  }, [schedule, id]);

  const alreadyCompleted = logs.some(
    (l) => l.workoutId === id && l.completed,
  );

  const [expandedPhase, setExpandedPhase] = useState<number>(0);
  const [checkedExercises, setCheckedExercises] = useState<Set<string>>(new Set());
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, ExerciseLog>>({});
  const [effort, setEffort] = useState(7);
  const [showComplete, setShowComplete] = useState(false);
  const [completionResult, setCompletionResult] = useState<PowerGainResult | null>(null);
  const [roshiNote, setRoshiNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!workout) {
    return (
      <div className="workout-detail__empty">
        <p>{schedule ? 'Workout not found' : 'Loading...'}</p>
        <button type="button" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const icon = getWorkoutIcon(workout.type);
  const color = getWorkoutColor(workout.type);

  const totalExercises = workout.phases.reduce(
    (sum, p) => sum + p.exercises.length,
    0,
  );
  const progress = totalExercises > 0
    ? Math.round((checkedExercises.size / totalExercises) * 100)
    : 0;

  function toggleExercise(exerciseId: string) {
    setCheckedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  }

  function updateSetLog(exercise: Exercise, setIndex: number, field: keyof SetLog, value: number | boolean | null) {
    const exId = exercise.id;
    setExerciseLogs((prev) => {
      const existing = prev[exId] ?? {
        exerciseId: exId,
        exerciseName: exercise.name,
        sets: createEmptySets(exercise),
        notes: '',
      };
      const updatedSets = [...existing.sets];
      updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };

      const allSetsCompleted = updatedSets.every((s) => s.completed);
      if (allSetsCompleted && !checkedExercises.has(exId)) {
        setCheckedExercises((prev) => new Set(prev).add(exId));
      }

      return {
        ...prev,
        [exId]: { ...existing, sets: updatedSets },
      };
    });
  }

  function toggleSetComplete(exercise: Exercise, setIndex: number) {
    const existing = exerciseLogs[exercise.id];
    const currentSet = existing?.sets[setIndex];
    const newCompleted = !(currentSet?.completed ?? false);
    updateSetLog(exercise, setIndex, 'completed', newCompleted);
  }

  async function handleComplete() {
    if (!workout || submitting) return;
    setSubmitting(true);

    const result = calculatePowerGain(
      workout.type,
      effort,
      checkedExercises.size,
      totalExercises,
      athlete.streakDays,
      logs,
    );

    try {
      // Build exercise logs for API
      const apiExerciseLogs = Object.values(exerciseLogs).map((exLog) => ({
        exerciseId: exLog.exerciseId,
        exerciseName: exLog.exerciseName,
        notes: exLog.notes || '',
        completed: checkedExercises.has(exLog.exerciseId),
        sets: exLog.sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          timeSeconds: s.time,
          completed: s.completed,
        })),
      }));

      // Also add checked exercises that don't have set logs
      for (const exId of checkedExercises) {
        if (!exerciseLogs[exId]) {
          // Find the exercise to get its name
          for (const phase of workout.phases) {
            const ex = phase.exercises.find((e) => e.id === exId);
            if (ex) {
              apiExerciseLogs.push({
                exerciseId: ex.id,
                exerciseName: ex.name,
                notes: '',
                completed: true,
                sets: createEmptySets(ex).map((s) => ({
                  setNumber: s.setNumber,
                  reps: s.reps,
                  weight: s.weight,
                  timeSeconds: s.time,
                  completed: true,
                })),
              });
              break;
            }
          }
        }
      }

      await submitLog({
        workoutId: workout.id,
        date: new Date().toISOString().split('T')[0],
        completed: true,
        effortRating: effort,
        notes: '',
        duration: 0,
        powerGained: result.totalGain,
        exerciseLogs: apiExerciseLogs,
      });

      setCompletionResult(result);
      setRoshiNote(getRoshiNote(result, workout.type));
      setShowComplete(false);
    } catch (err) {
      console.error('Failed to submit log:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // ═══ Completion Screen ═══
  if (completionResult) {
    return (
      <div className="workout-detail__complete-screen">
        <div className="complete-content animate-in">
          <span className="complete-icon">⚡</span>
          <h1 className="pixel-text-lg" style={{ color: 'var(--orange)' }}>SESSION COMPLETE</h1>

          <div className="power-breakdown">
            <div className="power-breakdown__total">
              <span className="power-breakdown__label pixel-text">Power Gained</span>
              <span className="power-breakdown__value">+{completionResult.totalGain}</span>
            </div>
            <div className="power-breakdown__details">
              <div className="power-breakdown__row">
                <span>Base (effort × 10)</span>
                <span>{completionResult.baseGain}</span>
              </div>
              <div className="power-breakdown__row">
                <span>Difficulty ×{completionResult.difficultyMultiplier}</span>
                <span>×{completionResult.difficultyMultiplier}</span>
              </div>
              <div className="power-breakdown__row">
                <span>Completion</span>
                <span>×{completionResult.completionBonus}</span>
              </div>
              {completionResult.streakBonus > 0 && (
                <div className="power-breakdown__row power-breakdown__row--bonus">
                  <span>🔥 Streak Bonus</span>
                  <span>+{completionResult.streakBonus}%</span>
                </div>
              )}
            </div>
          </div>

          {completionResult.overtrainingWarning && (
            <div className="overtraining-warning">
              <span className="pixel-text" style={{ color: 'var(--red)' }}>⚠ OVERTRAINING DETECTED</span>
              <p>Your recent effort scores are low. Consider scaling back intensity.</p>
            </div>
          )}

          <div className="complete-roshi">
            <span className="pixel-text" style={{ color: 'var(--red)' }}>MASTER ROSHI</span>
            <p>"{roshiNote}"</p>
          </div>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate('/')}
          >
            Return to Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-detail">
      <header
        className="workout-detail__header animate-in"
        style={{ '--accent': color } as React.CSSProperties}
      >
        <button type="button" className="workout-detail__back" onClick={() => navigate(-1)} aria-label="Go back">
          ← Back
        </button>
        <div className="workout-detail__hero">
          <span className="workout-detail__hero-icon">{icon}</span>
          <div>
            <h1>{workout.title}</h1>
            <p className="workout-detail__subtitle">{workout.subtitle}</p>
          </div>
        </div>
        <div className="workout-detail__meta">
          <span className="pixel-text">{workout.estimatedDuration}</span>
          <span className="pixel-text">{workout.phases.length} phases</span>
        </div>
      </header>

      <div className="workout-detail__progress animate-in animate-in-delay-1">
        <div className="progress-ring">
          <svg viewBox="0 0 36 36" className="progress-ring__svg">
            <path className="progress-ring__bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="progress-ring__fill" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: color }} />
          </svg>
          <span className="progress-ring__text">{progress}%</span>
        </div>
        <span className="pixel-text" style={{ color: 'var(--text-mid)' }}>
          {checkedExercises.size}/{totalExercises} exercises
        </span>
      </div>

      <div className="workout-detail__phases">
        {workout.phases.map((phase, phaseIdx) => (
          <PhaseSection
            key={phase.name}
            phase={phase}
            phaseIdx={phaseIdx}
            isExpanded={expandedPhase === phaseIdx}
            onToggle={() => setExpandedPhase(expandedPhase === phaseIdx ? -1 : phaseIdx)}
            checkedExercises={checkedExercises}
            onToggleExercise={toggleExercise}
            exerciseLogs={exerciseLogs}
            onUpdateSetLog={updateSetLog}
            onToggleSetComplete={toggleSetComplete}
            accentColor={color}
            animDelay={phaseIdx + 2}
          />
        ))}
      </div>

      <div className="workout-detail__actions animate-in animate-in-delay-5">
        {alreadyCompleted ? (
          <div className="already-done">
            <span className="pixel-text" style={{ color: 'var(--green)' }}>✓ SESSION LOGGED</span>
            <p>You've already completed this workout.</p>
          </div>
        ) : !showComplete ? (
          <button type="button" className="btn btn--primary btn--full" onClick={() => setShowComplete(true)}>
            ⚡ Complete Session
          </button>
        ) : (
          <div className="complete-form">
            <h3>Rate Your Effort</h3>
            <div className="effort-slider">
              <input type="range" min={1} max={10} value={effort} onChange={(e) => setEffort(Number(e.target.value))} className="effort-slider__input" />
              <div className="effort-slider__labels">
                <span className="pixel-text">Easy</span>
                <span className="effort-slider__value pixel-text-lg" style={{ color: 'var(--orange-bright)' }}>{effort}</span>
                <span className="pixel-text">Max</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--full"
              onClick={handleComplete}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : '🔥 Power Up!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ Phase Section ═══ */

interface PhaseSectionProps {
  phase: WorkoutPhase;
  phaseIdx: number;
  isExpanded: boolean;
  onToggle: () => void;
  checkedExercises: Set<string>;
  onToggleExercise: (exerciseId: string) => void;
  exerciseLogs: Record<string, ExerciseLog>;
  onUpdateSetLog: (exercise: Exercise, setIndex: number, field: keyof SetLog, value: number | boolean | null) => void;
  onToggleSetComplete: (exercise: Exercise, setIndex: number) => void;
  accentColor: string;
  animDelay: number;
}

function PhaseSection({
  phase, isExpanded, onToggle, checkedExercises, onToggleExercise,
  exerciseLogs, onUpdateSetLog, onToggleSetComplete, accentColor, animDelay,
}: PhaseSectionProps) {
  const phaseComplete = phase.exercises.every((e) => checkedExercises.has(e.id));

  return (
    <div
      className={`phase-section animate-in ${isExpanded ? 'phase-section--open' : ''} ${phaseComplete ? 'phase-section--done' : ''}`}
      style={{ animationDelay: `${animDelay * 0.06}s` }}
    >
      <button type="button" className="phase-section__header" onClick={onToggle} aria-expanded={isExpanded}>
        <div className="phase-section__left">
          <span className="phase-section__dot" style={{ background: phaseComplete ? 'var(--green)' : accentColor }} />
          <div>
            <span className="phase-section__name">{phase.name}</span>
            <span className="phase-section__duration pixel-text">{phase.duration}</span>
          </div>
        </div>
        <span className={`phase-section__chevron ${isExpanded ? 'phase-section__chevron--open' : ''}`}>▾</span>
      </button>

      {isExpanded && (
        <div className="phase-section__body">
          {phase.exercises.map((exercise) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              isChecked={checkedExercises.has(exercise.id)}
              onToggle={() => onToggleExercise(exercise.id)}
              exerciseLog={exerciseLogs[exercise.id]}
              onUpdateSetLog={onUpdateSetLog}
              onToggleSetComplete={onToggleSetComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══ Exercise Item ═══ */

interface ExerciseItemProps {
  exercise: Exercise;
  isChecked: boolean;
  onToggle: () => void;
  exerciseLog: ExerciseLog | undefined;
  onUpdateSetLog: (exercise: Exercise, setIndex: number, field: keyof SetLog, value: number | boolean | null) => void;
  onToggleSetComplete: (exercise: Exercise, setIndex: number) => void;
}

function ExerciseItem({ exercise, isChecked, onToggle, exerciseLog, onUpdateSetLog, onToggleSetComplete }: ExerciseItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showSetLog, setShowSetLog] = useState(false);
  const timed = isTimedExercise(exercise);

  const sets = exerciseLog?.sets ?? createEmptySets(exercise);
  const completedSets = sets.filter((s) => s.completed).length;

  return (
    <div className={`exercise-item ${isChecked ? 'exercise-item--done' : ''}`}>
      <div className="exercise-item__main">
        <button
          type="button"
          className={`exercise-item__check ${isChecked ? 'exercise-item__check--checked' : ''}`}
          onClick={onToggle}
          aria-label={`Mark ${exercise.name} as ${isChecked ? 'incomplete' : 'complete'}`}
        >
          {isChecked ? '✓' : ''}
        </button>
        <div className="exercise-item__info" onClick={() => setShowDetails(!showDetails)}>
          <span className="exercise-item__name">{exercise.name}</span>
          <div className="exercise-item__prescription">
            <span className="pixel-text">{exercise.sets}×{exercise.reps}</span>
            {exercise.rest !== '0' && <span className="pixel-text">Rest: {exercise.rest}</span>}
          </div>
        </div>
        <button
          type="button"
          className={`set-log-toggle ${showSetLog ? 'set-log-toggle--active' : ''} ${completedSets > 0 ? 'set-log-toggle--has-data' : ''}`}
          onClick={() => setShowSetLog(!showSetLog)}
          aria-label="Log sets"
          title="Log sets"
        >
          <span className="set-log-toggle__icon">📝</span>
          {completedSets > 0 && (
            <span className="set-log-toggle__count pixel-text">{completedSets}/{exercise.sets}</span>
          )}
        </button>
      </div>

      {showSetLog && (
        <div className="set-log-panel">
          <div className="set-log-panel__header">
            <span className="pixel-text" style={{ color: 'var(--orange)' }}>LOG SETS</span>
          </div>
          <div className="set-log-panel__table">
            <div className="set-log-row set-log-row--header">
              <span className="set-log-cell set-log-cell--set pixel-text">SET</span>
              {timed ? (
                <span className="set-log-cell set-log-cell--time pixel-text">TIME (s)</span>
              ) : (
                <>
                  <span className="set-log-cell set-log-cell--weight pixel-text">KG</span>
                  <span className="set-log-cell set-log-cell--reps pixel-text">REPS</span>
                </>
              )}
              <span className="set-log-cell set-log-cell--done pixel-text">✓</span>
            </div>
            {sets.map((setLog, idx) => (
              <div key={idx} className={`set-log-row ${setLog.completed ? 'set-log-row--completed' : ''}`}>
                <span className="set-log-cell set-log-cell--set">{idx + 1}</span>
                {timed ? (
                  <input
                    type="number" inputMode="numeric"
                    className="set-log-cell set-log-cell--time set-log-input"
                    placeholder="—" value={setLog.time ?? ''}
                    onChange={(e) => onUpdateSetLog(exercise, idx, 'time', e.target.value === '' ? null : Number(e.target.value))}
                  />
                ) : (
                  <>
                    <input
                      type="number" inputMode="decimal"
                      className="set-log-cell set-log-cell--weight set-log-input"
                      placeholder="—" value={setLog.weight ?? ''}
                      onChange={(e) => onUpdateSetLog(exercise, idx, 'weight', e.target.value === '' ? null : Number(e.target.value))}
                    />
                    <input
                      type="number" inputMode="numeric"
                      className="set-log-cell set-log-cell--reps set-log-input"
                      placeholder="—" value={setLog.reps ?? ''}
                      onChange={(e) => onUpdateSetLog(exercise, idx, 'reps', e.target.value === '' ? null : Number(e.target.value))}
                    />
                  </>
                )}
                <button
                  type="button"
                  className={`set-log-cell set-log-cell--done set-log-check ${setLog.completed ? 'set-log-check--checked' : ''}`}
                  onClick={() => onToggleSetComplete(exercise, idx)}
                  aria-label={`Mark set ${idx + 1} as ${setLog.completed ? 'incomplete' : 'complete'}`}
                >
                  {setLog.completed ? '✓' : ''}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDetails && (
        <div className="exercise-item__details">
          <p className="exercise-item__desc">{exercise.description}</p>
          <div className="exercise-item__cue">
            <span className="pixel-text" style={{ color: 'var(--red)' }}>CUE:</span> {exercise.cue}
          </div>
          <div className="exercise-item__sub">
            <span className="pixel-text" style={{ color: 'var(--text-mid)' }}>ALT:</span> {exercise.substitute}
          </div>
        </div>
      )}
    </div>
  );
}
