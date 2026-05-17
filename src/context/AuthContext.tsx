import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/authApi';
import { ApiError } from '../api/client';
import type {
  AuthSession,
  DashboardWidgets,
  ProductivityProfile,
  UserSettings,
} from '../types/account';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  handleUnauthorized: () => void;
  clearError: () => void;
  refreshMe: () => Promise<void>;
  requestEmailVerification: () => Promise<{
    success: true;
    alreadyVerified: boolean;
    delivery: 'none' | 'console' | 'email';
  }>;
  confirmEmailVerification: (token: string) => Promise<void>;
  register: (payload: authApi.RegisterPayload) => Promise<void>;
  login: (payload: authApi.LoginPayload) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
  updateProfile: (
    payload: Partial<
      Pick<
        ProductivityProfile,
        | 'workMode'
        | 'dailyMainTasksTarget'
        | 'preferredFocusMinutes'
        | 'peakTime'
        | 'planningStyle'
      >
    >,
  ) => Promise<void>;
  updateSettings: (
    payload: Partial<Pick<UserSettings, 'theme' | 'timezone' | 'locale'>> & {
      dashboardWidgets?: DashboardWidgets;
    },
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function refreshMe(): Promise<void> {
    try {
      const nextSession = await authApi.getCurrentSession();
      setSession(nextSession);
      setError('');
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        setSession(null);
        setError('');
        return;
      }

      setSession(null);
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : 'Не удалось проверить текущую сессию.',
      );
    }
  }

  function handleUnauthorized(): void {
    setSession(null);
    setError('');
  }

  useEffect(() => {
    let active = true;

    async function loadSession(): Promise<void> {
      try {
        const nextSession = await authApi.getCurrentSession();
        if (active) {
          setSession(nextSession);
          setError('');
        }
      } catch (loadError) {
        if (active) {
          setSession(null);
          if (loadError instanceof ApiError && loadError.status === 401) {
            setError('');
          } else {
            setError(
              loadError instanceof ApiError
                ? loadError.message
                : 'Не удалось проверить текущую сессию.',
            );
          }
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isLoading,
      error,
      handleUnauthorized,
      clearError() {
        setError('');
      },
      refreshMe,
      async requestEmailVerification() {
        return authApi.requestEmailVerification();
      },
      async confirmEmailVerification(token) {
        await authApi.confirmEmailVerification(token);
        await refreshMe();
      },
      async register(payload) {
        const nextSession = await authApi.register(payload);
        setSession(nextSession);
        setError('');
      },
      async login(payload) {
        const nextSession = await authApi.login(payload);
        setSession(nextSession);
        setError('');
      },
      async loginWithGoogle(credential) {
        const nextSession = await authApi.loginWithGoogle(credential);
        setSession(nextSession);
        setError('');
      },
      async logout() {
        try {
          await authApi.logout();
        } finally {
          setSession(null);
          setError('');
        }
      },
      async updateNickname(nickname) {
        const nextSession = await authApi.updateCurrentUser({ nickname });
        setSession(nextSession);
      },
      async updateProfile(payload) {
        const profile = await authApi.updateProfile(payload);
        setSession((current) => (current ? { ...current, profile } : current));
      },
      async updateSettings(payload) {
        const settings = await authApi.updateSettings(payload);
        setSession((current) => (current ? { ...current, settings } : current));
      },
    }),
    [error, isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
