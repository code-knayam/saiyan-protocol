import { useState } from 'react';
import { Link } from 'react-router-dom';
import PowerLevel from '../components/PowerLevel';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAthlete, useAuth } from '../store';
import { GOAL_OPTIONS } from '../data/goalOptions';
import './Profile.css';

type DialogType = 'reset' | 'logout' | null;

export default function Profile() {
  const { athlete, updateProfile, resetProgress } = useAthlete();
  const { logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(athlete.name);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<DialogType>(null);
  const selectedGoalDetails = GOAL_OPTIONS.filter((goal) => athlete.selectedGoals.includes(goal.id));

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({ name });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update name:', err);
    } finally {
      setSaving(false);
    }
  }

  async function confirmReset() {
    setDialog(null);
    try {
      await resetProgress();
    } catch (err) {
      console.error('Failed to reset progress:', err);
    }
  }

  function confirmLogout() {
    setDialog(null);
    logout();
  }

  return (
    <div className="profile-page">
      <header className="profile-page__header animate-in">
        <span className="pixel-text" style={{ color: 'var(--orange)' }}>WARRIOR PROFILE</span>
        <h1>Scouter Reading</h1>
      </header>

      {/* Power Level */}
      <section className="profile-page__power animate-in animate-in-delay-1">
        <PowerLevel level={athlete.powerLevel} size="lg" />
      </section>

      {/* Name */}
      <section className="profile-page__name animate-in animate-in-delay-2">
        {editing ? (
          <div className="name-edit">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="name-edit__input"
              placeholder="Enter your name"
              autoFocus
            />
            <button type="button" className="btn btn--primary" onClick={handleSave} disabled={saving}>
              {saving ? '...' : 'Save'}
            </button>
          </div>
        ) : (
          <div className="name-display">
            <h2>{athlete.name}</h2>
            <button
              type="button"
              className="name-display__edit"
              onClick={() => setEditing(true)}
            >
              ✏️
            </button>
          </div>
        )}
      </section>

      {/* Stats Grid */}
      <section className="profile-page__stats animate-in animate-in-delay-3">
        <div className="profile-stat">
          <span className="profile-stat__icon">📏</span>
          <div>
            <span className="profile-stat__value">{athlete.height}</span>
            <span className="profile-stat__label pixel-text">Height</span>
          </div>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__icon">⚖️</span>
          <div>
            <span className="profile-stat__value">{athlete.weight}</span>
            <span className="profile-stat__label pixel-text">Weight</span>
          </div>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__icon">🏃</span>
          <div>
            <span className="profile-stat__value">{athlete.fiveKmTime || '—'}</span>
            <span className="profile-stat__label pixel-text">5km Time</span>
          </div>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__icon">🎂</span>
          <div>
            <span className="profile-stat__value">{athlete.age}</span>
            <span className="profile-stat__label pixel-text">Age</span>
          </div>
        </div>
      </section>

      {/* Training Stats */}
      <section className="profile-page__training animate-in animate-in-delay-4">
        <h3>Training Stats</h3>
        <div className="training-stats">
          <div className="training-stat-row">
            <span className="training-stat-row__label">Sessions Completed</span>
            <span className="training-stat-row__value">{athlete.totalSessionsCompleted}</span>
          </div>
          <div className="training-stat-row">
            <span className="training-stat-row__label">Current Streak</span>
            <span className="training-stat-row__value">{athlete.streakDays} days</span>
          </div>
          <div className="training-stat-row">
            <span className="training-stat-row__label">Current Block</span>
            <span className="training-stat-row__value">Block {athlete.currentBlock}</span>
          </div>
          <div className="training-stat-row">
            <span className="training-stat-row__label">Current Week</span>
            <span className="training-stat-row__value">Week {athlete.currentWeek}</span>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="profile-page__goals animate-in animate-in-delay-5">
        <h3>Mission Objectives</h3>
        <div className="goals-list">
          {athlete.trainingGoal && (
            <div className="goal-item">
              <span className="goal-item__icon">🎯</span>
              <div>
                <span className="goal-item__title">Training Goal</span>
                <span className="goal-item__desc">{athlete.trainingGoal}</span>
              </div>
            </div>
          )}
          {selectedGoalDetails.map((goal) => (
            <div className="goal-item" key={goal.id}>
              <span className="goal-item__icon">{goal.icon}</span>
              <div>
                <span className="goal-item__title">{goal.title}</span>
                <span className="goal-item__desc">{goal.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <section className="profile-page__actions animate-in animate-in-delay-6">
        <h3>System Controls</h3>
        <Link to="/program-intro" className="action-btn action-btn--program">
          <span className="action-btn__icon">📡</span>
          <div className="action-btn__text">
            <span className="action-btn__title">View Program Briefing</span>
            <span className="action-btn__desc">Review your generated blocks, weeks, and plan intent.</span>
          </div>
        </Link>
        <button type="button" className="action-btn action-btn--reset" onClick={() => setDialog('reset')}>
          <span className="action-btn__icon">🔄</span>
          <div className="action-btn__text">
            <span className="action-btn__title">Reset Training Progress</span>
            <span className="action-btn__desc">Power level, sessions, streak back to zero. Profile stays.</span>
          </div>
        </button>
        <button type="button" className="action-btn action-btn--logout" onClick={() => setDialog('logout')}>
          <span className="action-btn__icon">💥</span>
          <div className="action-btn__text">
            <span className="action-btn__title">Logout</span>
            <span className="action-btn__desc">Sign out of your account.</span>
          </div>
        </button>
      </section>

      {dialog === 'reset' && (
        <ConfirmDialog
          title="Reset Training Progress?"
          message="Your power level, sessions completed, and streak will reset to starting values. Your profile and program stay intact."
          confirmLabel="Reset"
          danger
          onConfirm={confirmReset}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog === 'logout' && (
        <ConfirmDialog
          title="Initiate Self-Destruct?"
          message="You will be signed out of your account."
          confirmLabel="Logout"
          danger
          onConfirm={confirmLogout}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
