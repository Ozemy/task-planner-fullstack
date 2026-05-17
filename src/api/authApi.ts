import type {
  AuthSession,
  DashboardWidgets,
  ProductivityProfile,
  UserSettings,
} from '../types/account';
import { apiRequest } from './client';

export interface RegisterPayload {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function getCurrentSession(): Promise<AuthSession> {
  return apiRequest<AuthSession>('/api/auth/me');
}

export function register(payload: RegisterPayload): Promise<AuthSession> {
  return apiRequest<AuthSession>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload): Promise<AuthSession> {
  return apiRequest<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logout(): Promise<{ success: true }> {
  return apiRequest<{ success: true }>('/api/auth/logout', {
    method: 'POST',
  });
}

export function requestEmailVerification(): Promise<{
  success: true;
  alreadyVerified: boolean;
  delivery: 'none' | 'console' | 'email';
}> {
  return apiRequest('/api/auth/email-verification/request', {
    method: 'POST',
  });
}

export function confirmEmailVerification(token: string): Promise<{ success: true }> {
  return apiRequest('/api/auth/email-verification/confirm', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function loginWithGoogle(credential: string): Promise<AuthSession> {
  return apiRequest<AuthSession>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export function updateCurrentUser(payload: { nickname: string }): Promise<AuthSession> {
  return apiRequest<AuthSession>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function updateProfile(
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
): Promise<ProductivityProfile> {
  return apiRequest<ProductivityProfile>('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function updateSettings(
  payload: Partial<Pick<UserSettings, 'theme' | 'timezone' | 'locale'>> & {
    dashboardWidgets?: DashboardWidgets;
  },
): Promise<UserSettings> {
  return apiRequest<UserSettings>('/api/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
