import type { DashboardWidgets } from '../types/account';

const STORAGE_KEY = 'task-planner-dashboard-widgets';

export type DashboardPresetId = 'minimal' | 'balanced' | 'focus' | 'analytics' | 'full';

export const DASHBOARD_PRESETS: Record<DashboardPresetId, DashboardWidgets> = {
  minimal: {
    setupCompleted: true,
    focusPanel: false,
    taskComposer: true,
    smartPlannerSummary: true,
    smartPlanner: false,
    focusSession: false,
    dashboardIllustration: false,
    dayFlow: false,
    mobileCategoryChips: true,
  },
  balanced: {
    setupCompleted: true,
    focusPanel: false,
    taskComposer: true,
    smartPlannerSummary: true,
    smartPlanner: false,
    focusSession: true,
    dashboardIllustration: false,
    dayFlow: true,
    mobileCategoryChips: true,
  },
  focus: {
    setupCompleted: true,
    focusPanel: true,
    taskComposer: true,
    smartPlannerSummary: true,
    smartPlanner: true,
    focusSession: true,
    dashboardIllustration: false,
    dayFlow: false,
    mobileCategoryChips: true,
  },
  analytics: {
    setupCompleted: true,
    focusPanel: true,
    taskComposer: true,
    smartPlannerSummary: true,
    smartPlanner: true,
    focusSession: false,
    dashboardIllustration: true,
    dayFlow: true,
    mobileCategoryChips: true,
  },
  full: {
    setupCompleted: true,
    focusPanel: true,
    taskComposer: true,
    smartPlannerSummary: true,
    smartPlanner: true,
    focusSession: true,
    dashboardIllustration: true,
    dayFlow: true,
    mobileCategoryChips: true,
  },
};

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgets = {
  ...DASHBOARD_PRESETS.minimal,
  setupCompleted: false,
};

export function loadGuestDashboardWidgets(): DashboardWidgets {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_DASHBOARD_WIDGETS;
    }

    const parsed: unknown = JSON.parse(raw);
    return normalizeDashboardWidgets(parsed);
  } catch {
    return DEFAULT_DASHBOARD_WIDGETS;
  }
}

export function saveGuestDashboardWidgets(widgets: DashboardWidgets): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

export function normalizeDashboardWidgets(value: unknown): DashboardWidgets {
  if (!value || typeof value !== 'object') {
    return DEFAULT_DASHBOARD_WIDGETS;
  }

  const widgets = value as Partial<DashboardWidgets>;

  return {
    setupCompleted:
      typeof widgets.setupCompleted === 'boolean' ? widgets.setupCompleted : false,
    focusPanel: typeof widgets.focusPanel === 'boolean' ? widgets.focusPanel : false,
    taskComposer: typeof widgets.taskComposer === 'boolean' ? widgets.taskComposer : true,
    smartPlannerSummary:
      typeof widgets.smartPlannerSummary === 'boolean'
        ? widgets.smartPlannerSummary
        : typeof widgets.smartPlanner === 'boolean'
          ? widgets.smartPlanner
          : true,
    smartPlanner: typeof widgets.smartPlanner === 'boolean' ? widgets.smartPlanner : false,
    focusSession: typeof widgets.focusSession === 'boolean' ? widgets.focusSession : false,
    dashboardIllustration:
      typeof widgets.dashboardIllustration === 'boolean' ? widgets.dashboardIllustration : false,
    dayFlow: typeof widgets.dayFlow === 'boolean' ? widgets.dayFlow : false,
    mobileCategoryChips:
      typeof widgets.mobileCategoryChips === 'boolean' ? widgets.mobileCategoryChips : true,
  };
}
