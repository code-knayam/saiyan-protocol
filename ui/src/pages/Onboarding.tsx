import { useState } from 'react';
import { useAthlete } from '../store';
import { GOAL_OPTIONS } from '../data/goalOptions';
import './Onboarding.css';

type Step = 'profile' | 'goals';

export default function Onboarding() {
  const { athlete, updateProfile } = useAthlete();

  const [step, setStep] = useState<Step>('profile');
  const [displayName, setDisplayName] = useState(athlete.name || '');
  const [age, setAge] = useState(athlete.age > 0 ? String(athlete.age) : '');
  const [height, setHeight] = useState(athlete.height || '');
  const [weight, setWeight] = useState(athlete.weight || '');
  const [fiveKm, setFiveKm] = useState(athlete.fiveKmTime || '');
  const [fitnessExperience, setFitnessExperience] = useState(athlete.fitnessExperience || '');
  const [trainingGoal, setTrainingGoal] = useState(athlete.trainingGoal || '');
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
        fitnessExperience: fitnessExperience.trim(),
        trainingGoal: trainingGoal.trim(),
        selectedGoals: Array.from(selectedGoals),
        onboarded: true,
        planIntroSeen: false,
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
    const canContinue = selectedGoals.size > 0 && fitnessExperience.trim().length > 0 && trainingGoal.trim().length > 0;

    return (
      <div className="onboard">
        <div className="onboard__inner animate-in">
          <span className="pixel-text" style={{ color: 'var(--red)' }}>STEP 2 OF 3</span>
          <h1>Mission Objectives</h1>
          <p className="onboard__desc">Pick up to 3 training goals.</p>

          <div className="onboard__form">
            <div className="form-field">
              <label className="pixel-text">Fitness Experience</label>
              <textarea
                value={fitnessExperience}
                onChange={(e) => setFitnessExperience(e.target.value)}
                placeholder="Example: 3 years gym, some CrossFit, beginner runner"
                rows={3}
              />
            </div>
            <div className="form-field">
              <label className="pixel-text">Training Goal</label>
              <textarea
                value={trainingGoal}
                onChange={(e) => setTrainingGoal(e.target.value)}
                placeholder="In 1-2 lines, tell Kakarot what you want to achieve"
                rows={2}
              />
            </div>
          </div>

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
            disabled={!canContinue || saving}
            onClick={handleFinish}
          >
            {saving ? 'Generating Program...' : 'Finish & Generate Program'}
          </button>
        </div>
      </div>
    );
  }
}
