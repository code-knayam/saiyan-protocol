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
  const plan = schedule.plan;

  return (
    <div className="schedule-page">
      <header className="schedule-page__header animate-in">
        <span className="pixel-text" style={{ color: 'var(--orange)' }}>
          WEEK {schedule.week}{plan ? ` OF ${plan.totalWeeks}` : ''}
        </span>
        <h1>{plan?.name || schedule.blockName}</h1>
        <p className="schedule-page__intent">{schedule.weeklyIntent}</p>
      </header>

      {plan && plan.blocks.length > 0 && (
        <section className="schedule-page__plan animate-in animate-in-delay-1">
          <div className="plan-brief__header">
            <span className="pixel-text">PROGRAM STRUCTURE</span>
            {plan.summary && <p>{plan.summary}</p>}
          </div>
          <div className="plan-blocks">
            {plan.blocks.map((block) => (
              <div
                key={block.blockNumber}
                className={`plan-block ${block.blockNumber === schedule.block ? 'plan-block--active' : ''}`}
              >
                <div className="plan-block__marker">{block.blockNumber}</div>
                <div className="plan-block__info">
                  <span className="plan-block__name pixel-text">{block.name}</span>
                  <span className="plan-block__weeks">
                    Weeks {block.startWeek}{block.startWeek === block.endWeek ? '' : `-${block.endWeek}`}
                  </span>
                  {block.focus && <span className="plan-block__focus">{block.focus}</span>}
                </div>
              </div>
            ))}
          </div>
          {plan.coachNote && (
            <div className="plan-brief__note">
              <span className="pixel-text">MASTER ROSHI</span>
              <p>"{plan.coachNote}"</p>
            </div>
          )}
        </section>
      )}

      {/* Progress bar */}
      <div className="schedule-page__progress animate-in animate-in-delay-2">
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
