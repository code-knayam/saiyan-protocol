import { useState } from 'react';
import { useAthlete } from '../store';
import './Onboarding.css';

type Step = 'profile' | 'goals' | 'ready';

const GOAL_OPTIONS = [
  { id: 'lean', icon: '🏖️', title: 'Lean Athletic Physique', desc: 'Functional, defined, not bulky' },
  { id: 'run', icon: '🏃', title: 'Improve Running', desc: 'Better 5km time, higher VO2 max' },
  { id: 'calisthenics', icon: '🤸', title: 'Calisthenics Skills', desc: 'Handstand, L-sit, levers' },
  { id: 'strength', icon: '🏋️', title: 'Build Strength', desc: 'Heavier lifts, more power' },
  { id: 'combat', icon: '🥊', title: 'Combat Conditioning', desc: 'MMA / fight-ready fitness' },
  { id: 'endurance', icon: '🐢', title: 'Endurance Base', desc: 'Long distance, aerobic engine' },
];

export default function Onboarding() {
  const { athlete, updateProfile } = useAthlete();

  const [step, setStep] = useState<Step>('profile');
  const [displayName, setDisplayName] = useState(athlete.name || '');
  const [age, setAge] = useState(athlete.age > 0 ? String(athlete.age) : '');
  const [height, setHeight] = useState(athlete.height || '');
  const [weight, setWeight] = useState(athlete.weight || '');
  const [fiveKm, setFiveKm] = useState(athlete.fiveKmTime || '');
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  function toggleGoal(id: string) {
    setSelectedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await updateProfile({
        name: displayName.trim() || 'Warrior',
        age: parseInt(age) || 25,
        height: height.trim() || '175cm',
        weight: weight.trim() || '75kg',
        fiveKmTime: fiveKm.trim() || '',
        onboarded: true,
      });
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  }

  // ═══ PROFILE DETAILS ═══
  if (step === 'profile') {
    const canContinue = displayName.trim().length > 0;
    return (
      <div className="onboard">
        <div className="onboard__inner animate-in">
          <span className="pixel-text" style={{ color: 'var(--red)' }}>STEP 1 OF 3</span>
          <h1>Warrior Profile</h1>
          <p className="onboard__desc">Tell us about yourself, fighter.</p>

          {athlete.pictureUrl && (
            <div className="onboard__avatar">
              <img src={athlete.pictureUrl} alt="" className="onboard__avatar-img" referrerPolicy="no-referrer" />
            </div>
          )}

          <div className="onboard__form">
            <div className="form-field">
              <label className="pixel-text">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your warrior name"
                autoFocus
              />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="pixel-text">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                />
              </div>
              <div className="form-field">
                <label className="pixel-text">Height</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175cm"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="pixel-text">Weight</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="75kg"
                />
              </div>
              <div className="form-field">
                <label className="pixel-text">5km Time</label>
                <input
                  type="text"
                  value={fiveKm}
                  onChange={(e) => setFiveKm(e.target.value)}
                  placeholder="30:00"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--full"
            disabled={!canContinue}
            onClick={() => setStep('goals')}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ═══ GOALS ═══
  if (step === 'goals') {
    return (
      <div className="onboard">
        <div className="onboard__inner animate-in">
          <span className="pixel-text" style={{ color: 'var(--red)' }}>STEP 2 OF 3</span>
          <h1>Mission Objectives</h1>
          <p className="onboard__desc">Pick up to 3 training goals.</p>

          <div className="goals-grid">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal.id}
                type="button"
                className={`goal-option ${selectedGoals.has(goal.id) ? 'goal-option--selected' : ''}`}
                onClick={() => toggleGoal(goal.id)}
              >
                <span className="goal-option__icon">{goal.icon}</span>
                <span className="goal-option__title">{goal.title}</span>
                <span className="goal-option__desc">{goal.desc}</span>
                {selectedGoals.has(goal.id) && (
                  <span className="goal-option__check">✓</span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn--primary btn--full"
            disabled={selectedGoals.size === 0}
            onClick={() => setStep('ready')}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ═══ READY ═══
  return (
    <div className="onboard">
      <div className="onboard__inner onboard__ready animate-in">
        <div className="ready__scouter">
          <div className="ready__glass" />
          <div className="ready__scanlines" />
          <div className="ready__content">
            <span className="pixel-text" style={{ color: 'rgba(220,200,60,0.7)' }}>SCANNING...</span>
            <span className="ready__value">1,000</span>
            <span className="pixel-text" style={{ color: 'rgba(220,200,60,0.5)' }}>BASE POWER</span>
          </div>
        </div>

        <h1>Ready, {displayName || athlete.name || 'Warrior'}?</h1>
        <p className="onboard__desc">
          Your 12-week program is divided into 3 training blocks.
          Each block escalates in intensity.
        </p>

        <div className="blocks-timeline">
          <div className="block-item block-item--active">
            <div className="block-item__marker">1</div>
            <div className="block-item__info">
              <span className="block-item__name pixel-text">Saiyan Arc</span>
              <span className="block-item__weeks">Weeks 1–4</span>
              <span className="block-item__desc">Base building. Establish movement patterns, aerobic base, technique. Moderate intensity.</span>
            </div>
          </div>
          <div className="block-item">
            <div className="block-item__marker">2</div>
            <div className="block-item__info">
              <span className="block-item__name pixel-text">Namek Arc</span>
              <span className="block-item__weeks">Weeks 5–8</span>
              <span className="block-item__desc">Intensity build. Heavier loads, faster intervals, harder progressions.</span>
            </div>
          </div>
          <div className="block-item">
            <div className="block-item__marker">3</div>
            <div className="block-item__info">
              <span className="block-item__name pixel-text">Cell Games Arc</span>
              <span className="block-item__weeks">Weeks 9–12</span>
              <span className="block-item__desc">Peak phase. Maximum intensity, benchmark testing, peak performance.</span>
            </div>
          </div>
        </div>

        <div className="ready__roshi">
          <span className="pixel-text" style={{ color: 'var(--red)' }}>MASTER ROSHI</span>
          <p>"Every warrior starts somewhere. Your power level is 1,000 today.
          Where it goes from here is up to you. Now get moving."</p>
        </div>

        <button
          type="button"
          className="btn btn--primary btn--full"
          onClick={handleFinish}
          disabled={saving}
        >
          {saving ? 'Saving...' : '⚡ Begin Training'}
        </button>
      </div>
    </div>
  );
}
