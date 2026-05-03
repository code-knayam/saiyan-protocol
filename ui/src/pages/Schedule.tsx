import { useMemo } from 'react';
import WorkoutCard from '../components/WorkoutCard';
import { useAthlete, useSchedule, useSessionLogs } from '../store';
import type { DayOfWeek } from '../types';
import './Schedule.css';

const DAY_ORDER: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_MAP: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Schedule() {
  const { athlete } = useAthlete();
  const { schedule, scheduleLoading, generateSchedule } = useSchedule();
  const { logs } = useSessionLogs();
  const today = DAY_MAP[new Date().getDay()];

  const completedIds = useMemo(
    () => new Set(logs.filter((l) => l.completed).map((l) => l.workoutId)),
    [logs],
  );

  if (scheduleLoading && !schedule) {
    return (
      <div className="schedule-page">
        <div className="schedule-page__loading animate-in">
          <span className="pixel-text" style={{ color: 'var(--orange)' }}>LOADING SCHEDULE...</span>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="schedule-page">
        <header className="schedule-page__header animate-in">
          <span className="pixel-text" style={{ color: 'var(--orange)' }}>WEEK {athlete.currentWeek}</span>
          <h1>No Schedule</h1>
          <p className="schedule-page__intent">Generate your training week to get started.</p>
        </header>
        <div className="schedule-page__generate animate-in animate-in-delay-1">
          <button
            type="button"
            className="btn btn--primary btn--full"
            onClick={generateSchedule}
            disabled={scheduleLoading}
          >
            {scheduleLoading ? 'Generating...' : '⚡ Generate Schedule'}
          </button>
        </div>
      </div>
    );
  }

  const completedCount = DAY_ORDER.filter((d) =>
    schedule.workouts[d] && completedIds.has(schedule.workouts[d].id)
  ).length;

  return (
    <div className="schedule-page">
      <header className="schedule-page__header animate-in">
        <span className="pixel-text" style={{ color: 'var(--orange)' }}>WEEK {schedule.week}</span>
        <h1>{schedule.blockName}</h1>
        <p className="schedule-page__intent">{schedule.weeklyIntent}</p>
      </header>

      {/* Progress bar */}
      <div className="schedule-page__progress animate-in animate-in-delay-1">
        <div className="progress-bar">
          <div
            className="progress-bar__fill"
            style={{ width: `${(completedCount / 6) * 100}%` }}
          />
        </div>
        <span className="progress-bar__label pixel-text">
          {completedCount}/6 sessions complete
        </span>
      </div>

      {/* Full week */}
      <section className="schedule-page__list">
        {DAY_ORDER.map((day, i) => {
          const w = schedule.workouts[day];
          if (!w) return null;
          return (
            <WorkoutCard
              key={day}
              workout={w}
              day={day}
              isToday={day === today}
              isCompleted={completedIds.has(w.id)}
              animDelay={i + 2}
            />
          );
        })}
      </section>
    </div>
  );
}
