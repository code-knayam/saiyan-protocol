import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import type { AthleteProfile, SessionLog, WeekSchedule, Workout, DayOfWeek } from './types';
import { defaultAthlete } from './data/athlete';
import { auth, googleProvider } from './firebase';
import * as api from './api/client';

// ═══════════════════════════════════
// Map API snake_case → frontend camelCase
// ═══════════════════════════════════

function mapApiAthlete(a: api.ApiAthlete): AthleteProfile {
  return {
    id: a.id,
    email: a.email,
    name: a.name,
    pictureUrl: a.picture_url,
    age: a.age,
    height: a.height,
    weight: a.weight,
    powerLevel: a.power_level,
    currentBlock: a.current_block as 1 | 2 | 3,
    currentWeek: a.current_week,
    totalSessionsCompleted: a.total_sessions_completed,
    streakDays: a.streak_days,
    fiveKmTime: a.five_km_time,
    onboarded: a.onboarded,
  };
}

function mapApiSchedule(s: api.ApiWeekSchedule): WeekSchedule {
  const workouts: Record<DayOfWeek, Workout> = {} as Record<DayOfWeek, Workout>;
  for (const [day, w] of Object.entries(s.workouts)) {
    workouts[day as DayOfWeek] = {
      id: w.id,
      day: w.day as DayOfWeek,
      type: w.type as Workout['type'],
      title: w.title,
      subtitle: w.subtitle,
      estimatedDuration: w.estimatedDuration || (w as any).estimated_duration || '',
      phases: (w.phases || []).map((p) => ({
        name: p.name,
        duration: p.duration,
        exercises: (p.exercises || []).map((e) => ({
          id: e.id,
          name: e.name,
          description: e.description,
          cue: e.cue,
          sets: e.sets,
          reps: e.reps,
          rest: e.rest,
          substitute: e.substitute,
        })),
      })),
    };
  }
  return {
    id: s.id,
    week: s.week,
    block: s.block as 1 | 2 | 3,
    blockName: s.blockName || (s as any).block_name || '',
    weeklyIntent: s.weeklyIntent || (s as any).weekly_intent || '',
    workouts,
  };
}

function mapApiSessionLog(l: api.ApiSessionLog): SessionLog {
  return {
    id: l.id,
    workoutId: l.workout_id,
    date: l.date,
    completed: l.completed,
    effortRating: l.effort_rating,
    notes: l.notes,
    duration: l.duration,
    powerGained: l.power_gained,
    workoutTitle: l.workout_title,
    workoutType: l.workout_type,
  };
}

// ═══════════════════════════════════
// Auth Context
// ═══════════════════════════════════

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ═══════════════════════════════════
// Athlete Context
// ═══════════════════════════════════

interface AthleteContextValue {
  athlete: AthleteProfile;
  refreshAthlete: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  resetProgress: () => Promise<void>;
}

const AthleteContext = createContext<AthleteContextValue | null>(null);

// ═══════════════════════════════════
// Schedule Context
// ═══════════════════════════════════

interface ScheduleContextValue {
  schedule: WeekSchedule | null;
  scheduleLoading: boolean;
  scheduleError: string | null;
  fetchSchedule: (week: number, block: number) => Promise<void>;
  generateSchedule: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

// ═══════════════════════════════════
// Session Logs Context
// ═══════════════════════════════════

interface SessionLogsContextValue {
  logs: SessionLog[];
  logsLoading: boolean;
  totalLogs: number;
  fetchLogs: (limit?: number, offset?: number) => Promise<void>;
  submitLog: (data: Parameters<typeof api.createSessionLog>[0]) => Promise<{ id: string; powerGained: number }>;
}

const SessionLogsContext = createContext<SessionLogsContextValue | null>(null);

// ═══════════════════════════════════
// Combined Provider
// ═══════════════════════════════════

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => api.hasToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [athlete, setAthlete] = useState<AthleteProfile>(defaultAthlete);
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);

  // ─── Boot: if we have a token, fetch the athlete profile ───
  useEffect(() => {
    if (!api.hasToken()) {
      setIsLoading(false);
      return;
    }
    api.getAthlete()
      .then((data) => {
        setAthlete(mapApiAthlete(data));
        setIsAuthenticated(true);
      })
      .catch(() => {
        api.setToken(null);
        setIsAuthenticated(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ─── Auto-fetch schedule and logs when authenticated ───
  useEffect(() => {
    if (!isAuthenticated || !athlete.onboarded) return;
    fetchScheduleInternal(athlete.currentWeek, athlete.currentBlock);
    fetchLogsInternal();
  // Only run when auth state or onboarded status changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, athlete.onboarded, athlete.currentWeek, athlete.currentBlock]);

  // ─── Auth: Firebase Google Sign-In ───
  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await api.firebaseSignIn(idToken);
      api.setToken(res.token);
      setAthlete(mapApiAthlete(res.athlete));
      setIsAuthenticated(true);
    } catch (err: any) {
      // Don't show error if user just closed the popup
      if (err?.code === 'auth/popup-closed-by-user') return;
      setAuthError(err.message || 'Sign-in failed');
      throw err;
    }
  }, []);

  const logoutAction = useCallback(async () => {
    api.setToken(null);
    await signOut(auth).catch(() => {});
    setAthlete(defaultAthlete);
    setSchedule(null);
    setLogs([]);
    setIsAuthenticated(false);
  }, []);

  // ─── Athlete actions ───
  const refreshAthlete = useCallback(async () => {
    const data = await api.getAthlete();
    setAthlete(mapApiAthlete(data));
  }, []);

  const updateProfile = useCallback(async (data: Record<string, unknown>) => {
    const updated = await api.updateAthlete(data);
    setAthlete(mapApiAthlete(updated));
  }, []);

  const resetProgressAction = useCallback(async () => {
    const updated = await api.resetProgress();
    setAthlete(mapApiAthlete(updated));
    setLogs([]);
  }, []);

  // ─── Schedule actions ───
  async function fetchScheduleInternal(week: number, block: number) {
    setScheduleLoading(true);
    setScheduleError(null);
    try {
      const data = await api.getWeekSchedule(week, block);
      setSchedule(mapApiSchedule(data));
    } catch (err: any) {
      if (err.status === 404) {
        setSchedule(null);
        setScheduleError('no_schedule');
      } else {
        setScheduleError(err.message || 'Failed to fetch schedule');
      }
    } finally {
      setScheduleLoading(false);
    }
  }

  const fetchSchedule = useCallback(
    (week: number, block: number) => fetchScheduleInternal(week, block),
    [],
  );

  const generateSchedule = useCallback(async () => {
    setScheduleLoading(true);
    setScheduleError(null);
    try {
      const data = await api.generateWorkouts();
      setSchedule(mapApiSchedule(data));
    } catch (err: any) {
      setScheduleError(err.message || 'Failed to generate schedule');
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  // ─── Logs actions ───
  async function fetchLogsInternal(limit = 50, offset = 0) {
    setLogsLoading(true);
    try {
      const data = await api.getSessionLogs(limit, offset);
      setLogs(data.logs.map(mapApiSessionLog));
      setTotalLogs(data.total);
    } catch {
      // silent fail
    } finally {
      setLogsLoading(false);
    }
  }

  const fetchLogs = useCallback(
    (limit?: number, offset?: number) => fetchLogsInternal(limit, offset),
    [],
  );

  const submitLog = useCallback(async (data: Parameters<typeof api.createSessionLog>[0]) => {
    const result = await api.createSessionLog(data);
    // Refresh athlete stats and logs after logging a session
    await Promise.all([refreshAthlete(), fetchLogsInternal()]);
    return result;
  }, [refreshAthlete]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated, isLoading, signInWithGoogle, logout: logoutAction, authError,
    }}>
      <AthleteContext.Provider value={{
        athlete, refreshAthlete, updateProfile, resetProgress: resetProgressAction,
      }}>
        <ScheduleContext.Provider value={{
          schedule, scheduleLoading, scheduleError, fetchSchedule, generateSchedule,
        }}>
          <SessionLogsContext.Provider value={{
            logs, logsLoading, totalLogs, fetchLogs, submitLog,
          }}>
            {children}
          </SessionLogsContext.Provider>
        </ScheduleContext.Provider>
      </AthleteContext.Provider>
    </AuthContext.Provider>
  );
}

// ═══════════════════════════════════
// Hooks
// ═══════════════════════════════════

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AppProvider');
  return ctx;
}

export function useAthlete() {
  const ctx = useContext(AthleteContext);
  if (!ctx) throw new Error('useAthlete must be used within AppProvider');
  return ctx;
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within AppProvider');
  return ctx;
}

export function useSessionLogs() {
  const ctx = useContext(SessionLogsContext);
  if (!ctx) throw new Error('useSessionLogs must be used within AppProvider');
  return ctx;
}
