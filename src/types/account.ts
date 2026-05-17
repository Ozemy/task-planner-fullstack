import type { Theme } from './planner';

export type WorkMode = 'study' | 'work' | 'personal' | 'project' | 'mixed';
export type PeakTime = 'morning' | 'day' | 'evening' | 'night';
export type PlanningStyle = 'calm' | 'balanced' | 'strict';

export interface DashboardWidgets {
  setupCompleted: boolean;
  focusPanel: boolean;
  taskComposer: boolean;
  smartPlannerSummary: boolean;
  smartPlanner: boolean;
  focusSession: boolean;
  dashboardIllustration: boolean;
  dayFlow: boolean;
  mobileCategoryChips: boolean;
}

export interface AccountUser {
  id: string;
  email: string;
  nickname: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductivityProfile {
  userId: string;
  workMode: WorkMode;
  dailyMainTasksTarget: number;
  preferredFocusMinutes: 15 | 25 | 45;
  peakTime: PeakTime;
  planningStyle: PlanningStyle;
  onboardingCompletedAt: string | null;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  theme: Theme;
  timezone: string | null;
  locale: string;
  dashboardWidgets: DashboardWidgets;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: AccountUser;
  profile: ProductivityProfile;
  settings: UserSettings;
}
