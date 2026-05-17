import { useEffect, useMemo, useState } from 'react';
import type { ImportLocalDataSummary } from '../api/plannerApi';
import { DashboardWidgetSettings } from '../components/DashboardWidgetSettings';
import { ProductivityProfileSettings } from '../components/ProductivityProfileSettings';
import { ProfileSettings } from '../components/ProfileSettings';
import { useAuth } from '../context/AuthContext';
import { loadFocusSessionStats } from '../storage/focusSessionStorage';
import { loadPlannerState } from '../storage/plannerStorage';
import type { DashboardWidgets } from '../types/account';
import type { PlannerState, Task } from '../types/planner';
import { UNCATEGORIZED_ID } from '../types/planner';
import { isTaskDueToday } from '../utils/date';

interface AccountPageProps {
  isOpen: boolean;
  initialTab: AccountTab;
  plannerState: PlannerState;
  dashboardWidgets: DashboardWidgets;
  onChangeDashboardWidgets: (widgets: DashboardWidgets) => Promise<void>;
  onClose: () => void;
  onOpenTasks: () => void;
  onOpenCalendar: () => void;
  onExport: () => void;
  onLogout: () => Promise<void>;
  onImportGuestData: () => Promise<ImportLocalDataSummary>;
}

type AccountTab = 'overview' | 'style' | 'personalization' | 'stats' | 'settings';

export function AccountPage({
  isOpen,
  initialTab,
  plannerState,
  dashboardWidgets,
  onChangeDashboardWidgets,
  onClose,
  onOpenTasks,
  onOpenCalendar,
  onExport,
  onLogout,
  onImportGuestData,
}: AccountPageProps) {
  const auth = useAuth();
  const [tab, setTab] = useState<AccountTab>(initialTab);
  const [showLocalDataNotice, setShowLocalDataNotice] = useState(true);
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const stats = useMemo(() => buildLocalOverview(plannerState.tasks), [plannerState.tasks]);
  const focusStats = loadFocusSessionStats();
  const guestState = useMemo(loadGuestStateSafely, []);
  const hasLocalData =
    guestState.tasks.length > 0 ||
    guestState.categories.some((category) => category.id !== UNCATEGORIZED_ID);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen || !auth.session) {
    return null;
  }

  async function handleImportGuestData(): Promise<void> {
    setIsImporting(true);
    setImportStatus('');

    try {
      const summary = await onImportGuestData();
      setImportStatus(
        `Перенесено задач: ${summary.importedTasks}, категорий: ${summary.importedCategories}. Пропущено: ${summary.skipped}.`,
      );
    } catch (error) {
      setImportStatus(
        error instanceof Error ? error.message : 'Не удалось перенести локальные данные.',
      );
    } finally {
      setIsImporting(false);
    }
  }

  async function handleRequestVerification(): Promise<void> {
    setVerificationStatus('');
    try {
      const result = await auth.requestEmailVerification();
      if (result.alreadyVerified) {
        setVerificationStatus('Email уже подтверждён.');
      } else if (result.delivery === 'console') {
        setVerificationStatus('Ссылка подтверждения выведена в консоль backend.');
      } else {
        setVerificationStatus('Письмо подтверждения отправлено.');
      }
    } catch (error) {
      setVerificationStatus(
        error instanceof Error ? error.message : 'Не удалось отправить письмо подтверждения.',
      );
    }
  }

  return (
    <div className="modal-backdrop account-backdrop" role="presentation">
      <section className="account-page" role="dialog" aria-modal="true" aria-label="Личный кабинет">
        <div className="modal-header account-page-header">
          <div>
            <p>Личный кабинет</p>
            <h2>Здравствуйте, {auth.session.user.nickname}</h2>
            <span>{auth.session.user.email}</span>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <nav className="account-tabs" aria-label="Разделы личного кабинета">
          {[
            ['overview', 'Обзор'],
            ['style', 'Мой стиль'],
            ['personalization', 'Персонализация'],
            ['stats', 'Статистика'],
            ['settings', 'Настройки'],
          ].map(([id, label]) => (
            <button
              type="button"
              key={id}
              className={tab === id ? 'is-active' : ''}
              onClick={() => setTab(id as AccountTab)}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && (
          <div className="account-content">
            <section className="account-overview-grid">
              <div>
                <strong>{stats.completedToday}</strong>
                <span>Выполнено сегодня</span>
              </div>
              <div>
                <strong>{stats.remainingToday}</strong>
                <span>Осталось сегодня</span>
              </div>
              <div>
                <strong>{stats.overdue}</strong>
                <span>Просрочено</span>
              </div>
              <div>
                <strong>{focusStats.completedToday}</strong>
                <span>Фокус-сессий сегодня</span>
              </div>
            </section>

            <section className="account-section-card account-summary-card">
              <div className="account-section-heading">
                <h3>Статус аккаунта</h3>
                <p>
                  {auth.session.user.emailVerifiedAt
                    ? 'Email подтверждён.'
                    : 'Email не подтверждён.'}
                </p>
              </div>
              <div className="account-inline-row">
                <span className={auth.session.user.emailVerifiedAt ? 'verified-badge' : 'pending-badge'}>
                  {auth.session.user.emailVerifiedAt ? 'Email подтверждён' : 'Email не подтверждён'}
                </span>
                {!auth.session.user.emailVerifiedAt && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => void handleRequestVerification()}
                  >
                    Отправить письмо подтверждения
                  </button>
                )}
              </div>
              {verificationStatus && <p className="account-status">{verificationStatus}</p>}
            </section>

            <div className="account-quick-actions">
              <button type="button" className="secondary-button" onClick={onOpenTasks}>
                Открыть задачи
              </button>
              <button type="button" className="secondary-button" onClick={onOpenCalendar}>
                Открыть календарь
              </button>
              <button type="button" className="secondary-button" onClick={() => setTab('style')}>
                Настроить Smart Planner
              </button>
              <button type="button" className="secondary-button" onClick={onExport}>
                Экспорт данных
              </button>
            </div>

            {showLocalDataNotice && hasLocalData && (
              <section className="account-section-card local-data-card">
                <div className="account-section-heading">
                  <h3>Локальные данные найдены</h3>
                  <p>
                    Напоминание остаётся здесь, если вы отложили перенос. Локальные данные не
                    удаляются автоматически.
                  </p>
                </div>
                <div className="local-transfer-summary">
                  <span>{guestState.tasks.length} задач</span>
                  <span>{guestState.categories.filter((category) => category.id !== UNCATEGORIZED_ID).length} категорий</span>
                  <span>{guestState.tasks.filter((task) => task.status === 'completed').length} выполнено</span>
                  <span>{guestState.tasks.filter((task) => task.status === 'overdue').length} просрочено</span>
                </div>
                <div className="account-quick-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={isImporting}
                    onClick={() => void handleImportGuestData()}
                  >
                    {isImporting ? 'Переносим...' : 'Перенести в аккаунт'}
                  </button>
                  <button type="button" className="secondary-button" onClick={onExport}>
                    Скачать JSON
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowLocalDataNotice(false)}
                  >
                    Позже
                  </button>
                </div>
                {importStatus && <p className="account-status">{importStatus}</p>}
              </section>
            )}
          </div>
        )}

        {tab === 'style' && (
          <div className="account-content">
            <ProductivityProfileSettings />
          </div>
        )}

        {tab === 'personalization' && (
          <div className="account-content">
            <DashboardWidgetSettings
              widgets={dashboardWidgets}
              onChange={onChangeDashboardWidgets}
            />
          </div>
        )}

        {tab === 'stats' && (
          <div className="account-content">
            <section className="account-section-card">
              <div className="account-section-heading">
                <h3>Статистика</h3>
                <p>Компактный срез по текущим задачам и фокус-сессиям на этом устройстве.</p>
              </div>
              <div className="account-overview-grid account-stats-grid">
                <div>
                  <strong>{plannerState.tasks.length}</strong>
                  <span>Всего задач</span>
                </div>
                <div>
                  <strong>{plannerState.tasks.filter((task) => task.status === 'completed').length}</strong>
                  <span>Выполнено всего</span>
                </div>
                <div>
                  <strong>{stats.overdue}</strong>
                  <span>Просрочено</span>
                </div>
                <div>
                  <strong>{focusStats.completedToday}</strong>
                  <span>Фокус-сессий сегодня</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'settings' && (
          <div className="account-content">
            <ProfileSettings />
            <section className="account-section-card danger-zone">
              <div className="account-section-heading">
                <h3>Сессия</h3>
                <p>Можно выйти из текущего аккаунта и вернуться в Guest Mode.</p>
              </div>
              <button type="button" className="secondary-button" onClick={() => void onLogout()}>
                Выйти
              </button>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

function buildLocalOverview(tasks: Task[]) {
  const todayTasks = tasks.filter((task) => isTaskDueToday(task));

  return {
    completedToday: todayTasks.filter((task) => task.status === 'completed').length,
    remainingToday: todayTasks.filter((task) => task.status !== 'completed').length,
    overdue: tasks.filter((task) => task.status === 'overdue').length,
  };
}

function loadGuestStateSafely(): PlannerState {
  try {
    return loadPlannerState();
  } catch {
    return {
      version: 1,
      tasks: [],
      categories: [],
      settings: {
        theme: 'light',
        viewMode: 'list',
        sortBy: 'dueDate',
      },
    };
  }
}
