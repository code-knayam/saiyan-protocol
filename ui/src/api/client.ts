// ═══════════════════════════════════
// API Client — centralized fetch wrapper
// ═══════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let authToken: string | null = localStorage.getItem('sp_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('sp_token', token);
  } else {
    localStorage.removeItem('sp_token');
  }
}

export function getToken(): string | null {
  return authToken;
}

export function hasToken(): boolean {
  return authToken !== null;
}

interface ApiError {
  error: string;
  details?: unknown;
}

class ApiRequestError extends Error {
  status: number;
  body: ApiError;

  constructor(status: number, body: ApiError) {
    super(body.error || `API error ${status}`);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let body: ApiError;
    try {
      body = await res.json();
    } catch {
      body = { error: `HTTP ${res.status}` };
    }

    if (res.status === 401) {
      setToken(null);
    }

    throw new ApiRequestError(res.status, body);
  }

  return res.json() as Promise<T>;
}

// ═══════════════════════════════════
// Auth — Google Sign-In
// ═══════════════════════════════════

export interface AuthResponse {
  token: string;
  athlete: ApiAthlete;
  isNewUser: boolean;
}

export interface ApiAthlete {
  id: string;
  email: string;
  name: string;
  picture_url: string;
  age: number;
  height: string;
  weight: string;
  power_level: number;
  current_block: number;
  current_week: number;
  total_sessions_completed: number;
  streak_days: number;
  five_km_time: string;
  fitness_experience: string;
  training_goal: string;
  selected_goals: string[];
  onboarded: boolean;
  plan_intro_seen: boolean;
}

export function firebaseSignIn(idToken: string) {
  return request<AuthResponse>('/auth/firebase', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  });
}

// ═══════════════════════════════════
// Athlete
// ═══════════════════════════════════

export function getAthlete() {
  return request<ApiAthlete>('/athlete');
}

export function updateAthlete(data: Record<string, unknown>) {
  return request<ApiAthlete>('/athlete', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function resetProgress() {
  return request<ApiAthlete>('/athlete/reset-progress', {
    method: 'POST',
  });
}

// ═══════════════════════════════════
// Workouts
// ═══════════════════════════════════

export interface ApiWeekSchedule {
  id: string;
  week: number;
  block: number;
  blockName: string;
  weeklyIntent: string;
  plan: ApiTrainingPlan | null;
  workouts: Record<string, ApiWorkout>;
}

export interface ApiTrainingPlan {
  id: string;
  name: string;
  totalWeeks: number;
  summary: string;
  coachNote: string;
  blocks: ApiTrainingPlanBlock[];
}

export interface ApiTrainingPlanBlock {
  blockNumber: number;
  name: string;
  startWeek: number;
  endWeek: number;
  focus: string;
}

export interface ApiWorkout {
  id: string;
  day: string;
  type: string;
  title: string;
  subtitle: string;
  estimatedDuration: string;
  phases: ApiPhase[];
}

export interface ApiPhase {
  id: string;
  name: string;
  duration: string;
  exercises: ApiExercise[];
}

export interface ApiExercise {
  id: string;
  name: string;
  description: string;
  cue: string;
  sets: number;
  reps: string;
  rest: string;
  substitute: string;
}

export function getWeekSchedule(week: number, block: number) {
  return request<ApiWeekSchedule>(`/workouts/week?week=${week}&block=${block}`);
}

export function generateWorkouts() {
  return request<ApiWeekSchedule>('/workouts/generate', {
    method: 'POST',
  });
}

export function getWorkout(workoutId: string) {
  return request<ApiWorkout & { phases: ApiPhase[] }>(`/workouts/${workoutId}`);
}

// ═══════════════════════════════════
// Session Logs
// ═══════════════════════════════════

export interface ApiSessionLog {
  id: string;
  athlete_id: string;
  workout_id: string;
  date: string;
  completed: boolean;
  effort_rating: number;
  notes: string;
  duration: number;
  power_gained: number;
  workout_title?: string;
  workout_type?: string;
  day?: string;
}

export interface ApiExerciseLogEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  notes: string;
  completed: boolean;
  sets: ApiSetLogEntry[];
}

export interface ApiSetLogEntry {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  timeSeconds: number | null;
  completed: boolean;
}

export interface LogsResponse {
  logs: ApiSessionLog[];
  total: number;
  limit: number;
  offset: number;
}

export function getSessionLogs(limit = 20, offset = 0) {
  return request<LogsResponse>(`/logs?limit=${limit}&offset=${offset}`);
}

export function getSessionLog(sessionId: string) {
  return request<ApiSessionLog & { exerciseLogs: ApiExerciseLogEntry[] }>(`/logs/${sessionId}`);
}

export function createSessionLog(data: {
  workoutId: string;
  date: string;
  completed: boolean;
  effortRating: number;
  notes: string;
  duration: number;
  powerGained: number;
  exerciseLogs: {
    exerciseId: string;
    exerciseName: string;
    notes: string;
    completed: boolean;
    sets: {
      setNumber: number;
      reps: number | null;
      weight: number | null;
      timeSeconds: number | null;
      completed: boolean;
    }[];
  }[];
}) {
  return request<{ id: string; powerGained: number }>('/logs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export { ApiRequestError };
