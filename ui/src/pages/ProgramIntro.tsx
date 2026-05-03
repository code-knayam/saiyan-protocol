import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PowerLevel from '../components/PowerLevel';
import GeneratingLoader from '../components/GeneratingLoader';
import { useAthlete, useSchedule } from '../store';
import './ProgramIntro.css';

export default function ProgramIntro() {
  const navigate = useNavigate();
  const { athlete, updateProfile } = useAthlete();
  const { schedule, scheduleLoading, scheduleError, fetchSchedule, generateSchedule } = useSchedule();
  const [saving, setSaving] = useState(false);
  // Start polling immediately if no schedule — shows loader on first render
  const [polling, setPolling] = useState(!schedule);

  useEffect(() => {
    if (!polling) return;
    if (schedule) { setPolling(false); return; }
    if (scheduleLoading) return;
    // First attempt: fire immediately. Retry on 404: wait 2.5s
    const delay = scheduleError === 'no_schedule' ? 2500 : 0;
    const timer = setTimeout(() => {
      fetchSchedule(athlete.currentWeek, athlete.currentBlock);
    }, delay);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, scheduleError, scheduleLoading, polling]);

  async function handleContinue() {
    setSaving(true);
    try {
      if (!athlete.planIntroSeen) {
        await updateProfile({ planIntroSeen: true });
      }
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to mark program intro seen:', err);
    } finally {
      setSaving(false);
    }
  }

  if ((scheduleLoading || polling) && !schedule) {
    return (
      <div className="program-intro">
        <div className="program-intro__loading animate-in">
          <GeneratingLoader />
        </div>
      </div>
    );
  }

  if (!schedule?.plan) {
    return (
      <div className="program-intro">
        <div className="program-intro__empty animate-in">
          <span className="pixel-text">PROGRAM DATA MISSING</span>
          <h1>No Training Plan Found</h1>
          <p>Kakarot needs to generate your program structure before briefing you.</p>
          <button type="button" className="btn btn--primary btn--full" onClick={generateSchedule} disabled={scheduleLoading}>
            {scheduleLoading ? 'Generating...' : 'Generate Training Program'}
          </button>
        </div>
      </div>
    );
  }

  const { plan } = schedule;

  return (
    <div className="program-intro">
      <div className="program-intro__inner animate-in">
        <header className="program-intro__header">
          <span className="pixel-text">PROGRAM BRIEFING</span>
          <h1>{plan.name}</h1>
          <p>{plan.summary}</p>
        </header>

        <section className="program-intro__power">
          <PowerLevel level={athlete.powerLevel} size="lg" />
        </section>

        <section className="program-intro__meta">
          <div className="intro-stat">
            <span className="intro-stat__value">{plan.totalWeeks}</span>
            <span className="intro-stat__label pixel-text">Weeks</span>
          </div>
          <div className="intro-stat">
            <span className="intro-stat__value">{plan.blocks.length}</span>
            <span className="intro-stat__label pixel-text">Blocks</span>
          </div>
          <div className="intro-stat">
            <span className="intro-stat__value">W{schedule.week}</span>
            <span className="intro-stat__label pixel-text">Start</span>
          </div>
        </section>

        <section className="intro-blocks" aria-label="Program blocks">
          {plan.blocks.map((block) => (
            <article
              key={block.blockNumber}
              className={`intro-block ${block.blockNumber === schedule.block ? 'intro-block--active' : ''}`}
            >
              <div className="intro-block__marker">{block.blockNumber}</div>
              <div className="intro-block__info">
                <span className="intro-block__name pixel-text">{block.name}</span>
                <span className="intro-block__weeks">
                  Weeks {block.startWeek}{block.startWeek === block.endWeek ? '' : `-${block.endWeek}`}
                </span>
                <span className="intro-block__focus">{block.focus}</span>
              </div>
            </article>
          ))}
        </section>

        {plan.coachNote && (
          <section className="program-intro__roshi">
            <span className="pixel-text">MASTER ROSHI</span>
            <p>"{plan.coachNote}"</p>
          </section>
        )}

        <button type="button" className="btn btn--primary btn--full" onClick={handleContinue} disabled={saving}>
          {saving ? 'Saving...' : athlete.planIntroSeen ? 'Return Home' : 'Begin Training'}
        </button>
      </div>
    </div>
  );
}
