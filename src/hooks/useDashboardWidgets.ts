import { useEffect, useMemo, useState } from 'react';
import type { DashboardWidgets } from '../types/account';
import {
  loadGuestDashboardWidgets,
  normalizeDashboardWidgets,
  saveGuestDashboardWidgets,
} from '../storage/dashboardWidgetsStorage';

export function useDashboardWidgets({
  authenticatedWidgets,
  onSaveAuthenticatedWidgets,
}: {
  authenticatedWidgets: DashboardWidgets | null;
  onSaveAuthenticatedWidgets: (widgets: DashboardWidgets) => Promise<void>;
}) {
  const [guestWidgets, setGuestWidgets] = useState(loadGuestDashboardWidgets);
  const widgets = useMemo(
    () => normalizeDashboardWidgets(authenticatedWidgets ?? guestWidgets),
    [authenticatedWidgets, guestWidgets],
  );

  useEffect(() => {
    if (!authenticatedWidgets) {
      saveGuestDashboardWidgets(guestWidgets);
    }
  }, [authenticatedWidgets, guestWidgets]);

  async function updateWidgets(nextWidgets: DashboardWidgets): Promise<void> {
    if (authenticatedWidgets) {
      await onSaveAuthenticatedWidgets(nextWidgets);
      return;
    }

    setGuestWidgets(nextWidgets);
  }

  return {
    widgets,
    updateWidgets,
  };
}
