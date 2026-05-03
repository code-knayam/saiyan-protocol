import { useMemo } from 'react';
import PowerLevel from '../components/PowerLevel';
import WorkoutCard from '../components/WorkoutCard';
import type { DayOfWeek } from '../types';
import { useAthlete, useSchedule, useSessionLogs } from '../store';
import './Dashboard.css';

const DAY_MAP: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Dashboard() {
  const { athlete } = useAthlete();
  const { schedule, scheduleLoading, scheduleError, generateSchedule } = useSchedule();
  const { logs } = useSessionLogs();

  const today = DAY_MAP[new Date().getDay()];

  const completedWorkoutIds = useMemo(
    () => new Set(logs.filter((l) => l.completed).map((l) => l.workoutId)),
    [logs],
  );

  // Loading state
  if (scheduleLoading && !schedule) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading animate-in">
          <span className="pixel-text" style={{ color: 'var(--orange)' }}>LOADING TRAINING DATA...</span>
        </div>
      </div>
    );
  }

  // No schedule yet — prompt generation
  if (!schedule || scheduleError === 'no_schedule') {
    return (
      <div className="dashboard">
        <header className="dashboard__header animate-in">
          <div className="dashboard__greeting">
            <span className="pixel-text" style={{ color: 'var(--orange)' }}>SAIYAN PROTOCOL</span>
            <h1>
              Ready to train,{' '}
              <span style={{ color: 'var(--red-dark)' }}>{athlete.name}</span>?
            </h1>
          </div>
        </header>

        <section className="dashboard__power animate-in animate-in-delay-1">
          <PowerLevel level={athlete.powerLevel} size="lg" />
        </section>

        <section className="dashboard__generate animate-in animate-in-delay-2">
          <div className="generate-card">
            <span className="generate-card__icon">🤖</span>
            <h2>No Training Schedule Yet</h2>
            <p>Let Kakarot build your training program based on your profile.</p>
            <button
              type="button"
              className="btn btn--primary btn--full"
              onClick={generateSchedule}
              disabled={scheduleLoading}
            >
              {scheduleLoading ? 'Generating...' : '⚡ Generate Training Program'}
            </button>
          </div>
        </section>
      </div>
    );
  }

  const todayWorkout = schedule.workouts[today];

  // Next upcoming workouts (after today)
  const dayOrder: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = dayOrder.indexOf(today);
  const upcomingDays = dayOrder
    .slice(todayIdx + 1)
    .concat(dayOrder.slice(0, todayIdx))
    .slice(0, 3);

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard__header animate-in">
        <div className="dashboard__greeting">
          <span className="pixel-text" style={{ color: 'var(--orange)' }}>SAIYAN PROTOCOL</span>
          <h1>
            Ready to train,{' '}
            <span style={{ color: 'var(--red-dark)' }}>{athlete.name}</span>?
          </h1>
        </div>
      </header>

      {/* Power Level */}
      <section className="dashboard__power animate-in animate-in-delay-1">
        <PowerLevel level={athlete.powerLevel} size="lg" />
      </section>

      {/* Stats Row */}
      <section className="dashboard__stats animate-in animate-in-delay-2">
        <div className="stat-chip">
          <span className="stat-chip__value">{athlete.totalSessionsCompleted}</span>
          <span className="stat-chip__label pixel-text">Sessions</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip__value">{athlete.streakDays}</span>
          <span className="stat-chip__label pixel-text">Streak</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip__value">W{schedule.week}</span>
          <span className="stat-chip__label pixel-text">Week</span>
        </div>
        <div className="stat-chip">
          <span className="stat-chip__value">B{schedule.block}</span>
          <span className="stat-chip__label pixel-text">Block</span>
        </div>
      </section>

      {/* Today's Workout */}
      {todayWorkout && (
        <section className="dashboard__today animate-in animate-in-delay-3">
          <h2 className="section-title">
            <span className="section-title__icon">🔥</span>
            Today's Training
          </h2>
          <WorkoutCard
            workout={todayWorkout}
            day={today}
            isToday
            isCompleted={completedWorkoutIds.has(todayWorkout.id)}
          />
        </section>
      )}

      {/* Upcoming */}
      <section className="dashboard__upcoming animate-in animate-in-delay-4">
        <h2 className="section-title">
          <span className="section-title__icon">📋</span>
          Coming Up
        </h2>
        <div className="upcoming-list">
          {upcomingDays.map((day, i) => {
            const w = schedule.workouts[day];
            if (!w) return null;
            return (
              <WorkoutCard
                key={day}
                workout={w}
                day={day}
                isCompleted={completedWorkoutIds.has(w.id)}
                animDelay={i + 5}
              />
            );
          })}
        </div>
      </section>

      {/* Roshi Quote */}
      <section className="dashboard__roshi animate-in animate-in-delay-6">
        <div className="roshi-card">
          <div className="roshi-card__avatar">🐢</div>
          <div className="roshi-card__content">
            <div className="roshi-card__name pixel-text">Master Roshi</div>
            <p className="roshi-card__quote">
              "The journey of a thousand miles begins with a single push-up.
              Or was it a Spirit Bomb? Either way — get moving."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
