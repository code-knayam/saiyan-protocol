import { useNavigate } from 'react-router-dom';
import type { Workout, DayOfWeek } from '../types';
import { getWorkoutIcon, getWorkoutColor } from '../data/workouts';
import './WorkoutCard.css';

interface WorkoutCardProps {
  workout: Workout;
  day: DayOfWeek;
  isToday?: boolean;
  isCompleted?: boolean;
  animDelay?: number;
}

export default function WorkoutCard({
  workout,
  day,
  isToday = false,
  isCompleted = false,
  animDelay = 0,
}: WorkoutCardProps) {
  const navigate = useNavigate();
  const icon = getWorkoutIcon(workout.type);
  const color = getWorkoutColor(workout.type);
  const isRest = workout.type === 'rest';

  return (
    <button
      className={`workout-card animate-in ${isToday ? 'workout-card--today' : ''} ${isCompleted ? 'workout-card--done' : ''} ${isRest ? 'workout-card--rest' : ''}`}
      style={{
        '--card-accent': color,
        animationDelay: `${animDelay * 0.06}s`,
      } as React.CSSProperties}
      onClick={() => !isRest && navigate(`/workout/${workout.id}`)}
      disabled={isRest}
      type="button"
    >
      <div className="workout-card__left">
        <div className="workout-card__day pixel-text">{day}</div>
        <div className="workout-card__icon">{icon}</div>
      </div>
      <div className="workout-card__center">
        <div className="workout-card__title">{workout.title}</div>
        <div className="workout-card__subtitle">{workout.subtitle}</div>
      </div>
      <div className="workout-card__right">
        {isCompleted ? (
          <span className="workout-card__check">✓</span>
        ) : (
          <span className="workout-card__duration pixel-text">
            {workout.estimatedDuration}
          </span>
        )}
      </div>
      {isToday && <div className="workout-card__today-badge pixel-text">TODAY</div>}
    </button>
  );
}
