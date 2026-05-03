import { useState } from 'react';
import { useSessionLogs } from '../store';
import './Log.css';

export default function Log() {
  const { logs, logsLoading } = useSessionLogs();
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  return (
    <div className="log-page">
      <header className="log-page__header animate-in">
        <span className="pixel-text" style={{ color: 'var(--orange)' }}>TRAINING LOG</span>
        <h1>Session History</h1>
      </header>

      {logsLoading && logs.length === 0 ? (
        <div className="log-page__empty animate-in animate-in-delay-1">
          <span className="pixel-text" style={{ color: 'var(--orange)' }}>LOADING LOGS...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="log-page__empty animate-in animate-in-delay-1">
          <span className="log-page__empty-icon">📊</span>
          <p>No sessions logged yet.</p>
          <p className="log-page__empty-sub">
            Complete a workout to see your history here.
          </p>
        </div>
      ) : (
        <div className="log-page__list">
          {logs.map((log, i) => {
            const date = new Date(log.date);
            const isExpanded = expandedLog === log.id;

            return (
              <div
                key={log.id}
                className={`log-entry animate-in ${isExpanded ? 'log-entry--expanded' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
              >
                <div className="log-entry__summary">
                  <div className="log-entry__date">
                    <span className="log-entry__day-num">{date.getDate()}</span>
                    <span className="log-entry__month pixel-text">
                      {date.toLocaleString('en', { month: 'short' }).toUpperCase()}
                    </span>
                  </div>
                  <div className="log-entry__content">
                    <span className="log-entry__title">{log.workoutTitle ?? 'Workout'}</span>
                    <span className="log-entry__subtitle">{log.workoutType ?? ''}</span>
                    <div className="log-entry__stats">
                      <span className="pixel-text">Effort: {log.effortRating}/10</span>
                      {log.powerGained != null && (
                        <span className="pixel-text">+{log.powerGained} PWR</span>
                      )}
                    </div>
                  </div>
                  <div className="log-entry__right">
                    <div
                      className="effort-badge"
                      style={{
                        '--effort-color':
                          log.effortRating >= 8 ? 'var(--red)'
                            : log.effortRating >= 5 ? 'var(--orange)'
                              : 'var(--blue)',
                      } as React.CSSProperties}
                    >
                      {log.effortRating}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="log-entry__details" onClick={(e) => e.stopPropagation()}>
                    <div className="log-entry__detail-row">
                      <span className="pixel-text">Duration</span>
                      <span>{log.duration > 0 ? `${log.duration} min` : '—'}</span>
                    </div>
                    {log.notes && (
                      <div className="log-entry__detail-row">
                        <span className="pixel-text">Notes</span>
                        <span>{log.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
