import { useEffect, useState } from 'react';
import type { FilterId, Task, TaskDraft } from './types/planner';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { Sidebar } from './components/Sidebar';
import { TaskComposer } from './components/TaskComposer';
import { TaskFilters } from './components/TaskFilters';
import { TaskListView } from './components/TaskListView';
import { BoardView } from './components/BoardView';
import { WeekView } from './components/WeekView';
import { CalendarView } from './components/CalendarView';
import { FocusPanel } from './components/FocusPanel';
import { SmartPlanner } from './components/SmartPlanner';
import { SmartPlannerSummary } from './components/SmartPlannerSummary';
import { MobileCategoryChips } from './components/MobileCategoryChips';
import { FocusSession } from './components/FocusSession';
import { DashboardIllustration } from './components/DashboardIllustration';
import { DayFlow } from './components/DayFlow';
import { StatusNotice } from './components/StatusNotice';
import { Onboarding } from './components/Onboarding';
import { AuthModal } from './components/AuthModal';
import { GuestModeBanner } from './components/GuestModeBanner';
import { AccountPage } from './pages/AccountPage';
import { DashboardSetupPrompt } from './components/DashboardSetupPrompt';
import { LocalDataTransferPrompt } from './components/LocalDataTransferPrompt';
import { useAuth } from './context/AuthContext';
import { useDashboardWidgets } from './hooks/useDashboardWidgets';
import { usePlanner } from './hooks/usePlanner';
import { DASHBOARD_PRESETS } from './storage/dashboardWidgetsStorage';
import { loadPlannerState } from './storage/plannerStorage';
import { getSuggestedFocusTask } from './utils/focusSession';
import { isTaskDueToday } from './utils/date';

export function App() {
  const auth = useAuth();
  const planner = usePlanner({
    isAuthenticated: auth.isAuthenticated,
    onUnauthorized: auth.handleUnauthorized,
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState('');
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountTab, setAccountTab] = useState<'overview' | 'style' | 'personalization' | 'stats' | 'settings'>('overview');
  const [guestTransferDismissed, setGuestTransferDismissed] = useState(false);
  const [isImportingGuestData, setIsImportingGuestData] = useState(false);
  const [emailVerificationNotice, setEmailVerificationNotice] = useState<string | null>(null);
  const { widgets: dashboardWidgets, updateWidgets } = useDashboardWidgets({
    authenticatedWidgets: auth.session?.settings.dashboardWidgets ?? null,
    onSaveAuthenticatedWidgets: async (widgets) => {
      await auth.updateSettings({ dashboardWidgets: widgets });
    },
  });
  const hasTasks = planner.stats.total > 0;
  const activeFocusedTask =
    planner.state.tasks.find((task) => task.id === focusedTaskId && task.status !== 'completed') ??
    null;
  const displayedFocusTask = activeFocusedTask ?? getSuggestedFocusTask(planner.state.tasks);
  const todayCount = planner.state.tasks.filter((task) => isTaskDueToday(task)).length;
  const highPriorityCount = planner.state.tasks.filter(
    (task) => task.status !== 'completed' && task.priority === 'high',
  ).length;
  const hasVisibleDashboardWidgets =
    dashboardWidgets.focusPanel ||
    dashboardWidgets.taskComposer ||
    dashboardWidgets.smartPlannerSummary ||
    dashboardWidgets.focusSession ||
    dashboardWidgets.smartPlanner ||
    dashboardWidgets.dashboardIllustration ||
    dashboardWidgets.dayFlow;
  const guestState = loadGuestStateSafely();
  const hasTransferableGuestData =
    guestState.tasks.length > 0 ||
    guestState.categories.some((category) => category.id !== 'uncategorized');

  useEffect(() => {
    if (
      focusedTaskId &&
      !planner.state.tasks.some((task) => task.id === focusedTaskId && task.status !== 'completed')
    ) {
      setFocusedTaskId(null);
    }
  }, [focusedTaskId, planner.state.tasks]);

  useEffect(() => {
    if (!auth.session) {
      setIsAccountOpen(false);
      setGuestTransferDismissed(false);
      return;
    }

    setGuestTransferDismissed(
      localStorage.getItem(getTransferDismissKey(auth.session.user.id)) === 'true',
    );
  }, [auth.session]);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('verifyEmail');
    if (!token) {
      return;
    }

    void auth
      .confirmEmailVerification(token)
      .then(() => {
        setEmailVerificationNotice('Email подтверждён.');
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch((error: unknown) => {
        setEmailVerificationNotice(
          error instanceof Error ? error.message : 'Не удалось подтвердить email.',
        );
      });
  }, [auth]);

  function handleSubmit(draft: TaskDraft): void {
    if (editingTask) {
      planner.saveTask(editingTask.id, draft);
      setEditingTask(null);
      setIsComposerOpen(false);
      return;
    }

    planner.addTask(draft);
    setIsComposerOpen(false);
    setSelectedDateForNewTask('');
  }

  function handleDelete(taskId: string): void {
    if (window.confirm('Удалить эту задачу?')) {
      planner.removeTask(taskId);
      if (editingTask?.id === taskId) {
        setEditingTask(null);
        setIsComposerOpen(false);
      }
    }
  }

  function handleReset(): void {
    if (window.confirm('Сбросить все задачи, категории и настройки?')) {
      planner.resetAllData();
      setEditingTask(null);
      setIsComposerOpen(false);
      setSelectedDateForNewTask('');
    }
  }

  function openNewTask(initialDueDate = ''): void {
    setEditingTask(null);
    setSelectedDateForNewTask(initialDueDate);
    setIsComposerOpen(true);
    window.setTimeout(() => document.getElementById('task-title')?.focus(), 0);
  }

  function startEditing(task: Task): void {
    setSelectedDateForNewTask('');
    setEditingTask(task);
    setIsComposerOpen(true);
    window.setTimeout(() => document.getElementById('task-title')?.focus(), 0);
  }

  function cancelEditing(): void {
    setEditingTask(null);
    setIsComposerOpen(false);
    setSelectedDateForNewTask('');
  }

  function navigateToFilter(filterId: FilterId): void {
    planner.setFilterId(filterId);
    planner.setViewMode('list');
    window.setTimeout(() => document.getElementById('task-results')?.focus(), 0);
  }

  function navigateToCategory(categoryId: string): void {
    planner.setCategoryId(categoryId);
    planner.setViewMode('list');
    window.setTimeout(() => document.getElementById('task-results')?.focus(), 0);
  }

  function openTaskList(): void {
    planner.setViewMode('list');
    window.setTimeout(() => document.getElementById('task-results')?.focus(), 0);
  }

  async function handleLogout(): Promise<void> {
    await auth.logout();
    setIsAccountOpen(false);
  }

  async function handleImportGuestData(): Promise<void> {
    setIsImportingGuestData(true);
    try {
      await planner.importGuestDataToAccount();
      setGuestTransferDismissed(true);
      if (auth.session) {
        localStorage.setItem(getTransferDismissKey(auth.session.user.id), 'true');
      }
    } finally {
      setIsImportingGuestData(false);
    }
  }

  function openPersonalization(): void {
    setAccountTab('personalization');
    setIsAccountOpen(true);
  }

  function renderView() {
    const commonProps = {
      tasks: planner.visibleTasks,
      categories: planner.state.categories,
      sortBy: planner.state.settings.sortBy,
      onEdit: startEditing,
      onFocusTask: setFocusedTaskId,
      onDelete: handleDelete,
      onToggleComplete: planner.changeTaskCompletion,
      onToggleSubtask: planner.changeSubtaskCompletion,
    };

    switch (planner.state.settings.viewMode) {
      case 'board':
        return <BoardView {...commonProps} />;
      case 'week':
        return <WeekView {...commonProps} />;
      case 'calendar':
        return (
          <CalendarView
            tasks={planner.visibleTasks}
            categories={planner.state.categories}
            sortBy={planner.state.settings.sortBy}
            onCreateForDate={openNewTask}
            onEdit={startEditing}
            onFocusTask={setFocusedTaskId}
          />
        );
      case 'list':
      default:
        return (
          <TaskListView
            {...commonProps}
            filterId={planner.filterId}
            categoryId={planner.categoryId}
            searchTerm={planner.searchTerm}
          />
        );
    }
  }

  return (
    <div className="app-shell">
      <Header
        theme={planner.state.settings.theme}
        viewMode={planner.state.settings.viewMode}
        onThemeChange={planner.setTheme}
        onViewModeChange={planner.setViewMode}
        onExport={planner.downloadExport}
        onImport={(file) => void planner.importFromFile(file)}
        onReset={handleReset}
        authUser={auth.session?.user ?? null}
        authLoading={auth.isLoading}
        onCreateTask={() => openNewTask()}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onLogout={handleLogout}
      />

      {!auth.isLoading && !auth.session && (
        <GuestModeBanner onOpenAuth={() => setIsAuthModalOpen(true)} />
      )}

      {auth.isAuthenticated && planner.syncError && (
        <StatusNotice
          notice={{ kind: 'error', text: planner.syncError }}
          onDismiss={planner.clearSyncError}
        />
      )}

      <StatsBar {...planner.stats} />

      {planner.notice && <StatusNotice notice={planner.notice} onDismiss={planner.clearNotice} />}

      {emailVerificationNotice && (
        <StatusNotice
          notice={{ kind: 'info', text: emailVerificationNotice }}
          onDismiss={() => setEmailVerificationNotice(null)}
        />
      )}

      {!dashboardWidgets.setupCompleted && (
        <DashboardSetupPrompt
          onChoosePreset={updateWidgets}
          onOpenPersonalization={openPersonalization}
        />
      )}

      {auth.isAuthenticated &&
        hasTransferableGuestData &&
        !guestTransferDismissed && (
          <LocalDataTransferPrompt
            guestState={guestState}
            isImporting={isImportingGuestData}
            onImport={() => void handleImportGuestData()}
            onExport={planner.downloadExport}
            onKeepLocal={() => {
              setGuestTransferDismissed(true);
              if (auth.session) {
                localStorage.setItem(getTransferDismissKey(auth.session.user.id), 'true');
              }
            }}
            onLater={() => setGuestTransferDismissed(true)}
          />
        )}

      {!hasTasks && (
        <Onboarding
          onCreateFirstTask={() => openNewTask()}
          onLoadDemoData={() => {
            if (window.confirm('Загрузить демо-данные в пустой планировщик?')) {
              planner.loadDemoData();
            }
          }}
        />
      )}

      <div className="workspace-layout">
        <Sidebar
          categories={planner.state.categories}
          filterId={planner.filterId}
          categoryId={planner.categoryId}
          onFilterChange={navigateToFilter}
          onCategoryChange={planner.setCategoryId}
          onCreateCategory={planner.createCategory}
          onRemoveCategory={planner.removeCategory}
        />

        <main>
          <div
            className={`dashboard-grid ${
              !dashboardWidgets.smartPlannerSummary && !dashboardWidgets.focusPanel
                ? 'is-single-column'
                : ''
            }`}
          >
            <div className="dashboard-left">
              {(dashboardWidgets.taskComposer || isComposerOpen || editingTask) && (
                <TaskComposer
                  categories={planner.state.categories}
                  editingTask={editingTask}
                  initialDueDate={selectedDateForNewTask}
                  isOpen={isComposerOpen}
                  onSubmit={handleSubmit}
                  onCancelEdit={cancelEditing}
                  onExpand={() => openNewTask(selectedDateForNewTask)}
                  onCollapse={() => {
                    setIsComposerOpen(false);
                    setSelectedDateForNewTask('');
                  }}
                />
              )}
            </div>

            <div className="dashboard-right">
              {dashboardWidgets.smartPlannerSummary && (
                <SmartPlannerSummary
                  tasks={planner.state.tasks}
                  onNavigateToFilter={navigateToFilter}
                  onEditTask={startEditing}
                />
              )}

              {dashboardWidgets.focusPanel && (
                <FocusPanel
                  tasks={planner.state.tasks}
                  onNavigateToFilter={navigateToFilter}
                  onCreateTask={() => openNewTask()}
                />
              )}
            </div>
          </div>

          {!hasVisibleDashboardWidgets && (
            <section className="dashboard-hidden-card">
              <div>
                <p>Главный экран скрыт</p>
                <h2>Виджеты dashboard отключены</h2>
              </div>
              <div className="dashboard-hidden-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    void updateWidgets(DASHBOARD_PRESETS.balanced)
                  }
                >
                  Вернуть по умолчанию
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={openPersonalization}
                >
                  Открыть настройки
                </button>
                <button type="button" className="primary-button" onClick={() => openNewTask()}>
                  Новая задача
                </button>
              </div>
            </section>
          )}

          <section className="task-area" id="task-results" tabIndex={-1}>
            <div className="section-heading task-area-heading">
              <div>
                <p>Рабочий список</p>
                <h2>Задачи</h2>
              </div>
              {planner.stats.completed > 0 && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    if (window.confirm('Очистить все выполненные задачи?')) {
                      planner.clearCompletedTasks();
                    }
                  }}
                >
                  Очистить выполненные
                </button>
              )}
            </div>

            {dashboardWidgets.mobileCategoryChips && (
              <MobileCategoryChips
                categories={planner.state.categories}
                categoryId={planner.categoryId}
                onCategoryChange={navigateToCategory}
              />
            )}

            <TaskFilters
              filterId={planner.filterId}
              categoryId={planner.categoryId}
              categoryName={planner.state.categories.find(
                (category) => category.id === planner.categoryId,
              )?.name}
              viewMode={planner.state.settings.viewMode}
              searchTerm={planner.searchTerm}
              sortBy={planner.state.settings.sortBy}
              onSearchChange={planner.setSearchTerm}
              onSortChange={planner.setSortBy}
              onReset={planner.resetFilters}
            />

            {renderView()}
          </section>

          {(dashboardWidgets.focusSession ||
            dashboardWidgets.dayFlow ||
            dashboardWidgets.smartPlanner ||
            dashboardWidgets.dashboardIllustration) && (
            <section className="advanced-widgets-grid" aria-label="Дополнительные функции">
              {dashboardWidgets.focusSession && (
                <FocusSession
                  tasks={planner.state.tasks}
                  selectedTaskId={focusedTaskId}
                  preferredDurationMinutes={auth.session?.profile.preferredFocusMinutes}
                  onSelectTask={setFocusedTaskId}
                  onEditTask={startEditing}
                  onCompleteTask={planner.changeTaskCompletion}
                />
              )}

              {dashboardWidgets.dayFlow && (
                <DayFlow
                  tasks={planner.state.tasks}
                  focusTask={displayedFocusTask}
                  onNavigateToFilter={navigateToFilter}
                  onOpenCalendar={() => planner.setViewMode('calendar')}
                  onEditTask={startEditing}
                />
              )}

              {dashboardWidgets.smartPlanner && (
                <SmartPlanner
                  tasks={planner.state.tasks}
                  onNavigateToFilter={navigateToFilter}
                  onEditTask={startEditing}
                  onCompleteTask={planner.changeTaskCompletion}
                  onStartFocus={setFocusedTaskId}
                  onCreateTask={() => openNewTask()}
                  onOpenCalendar={() => planner.setViewMode('calendar')}
                />
              )}

              {dashboardWidgets.dashboardIllustration && (
                <DashboardIllustration
                  tasks={planner.state.tasks}
                  activeCount={planner.stats.active}
                  completedCount={planner.stats.completed}
                  overdueCount={planner.stats.overdue}
                  todayCount={todayCount}
                  highPriorityCount={highPriorityCount}
                />
              )}
            </section>
          )}
        </main>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <AccountPage
        isOpen={isAccountOpen}
        initialTab={accountTab}
        plannerState={planner.state}
        dashboardWidgets={dashboardWidgets}
        onChangeDashboardWidgets={updateWidgets}
        onClose={() => setIsAccountOpen(false)}
        onOpenTasks={() => {
          setIsAccountOpen(false);
          openTaskList();
        }}
        onOpenCalendar={() => {
          setIsAccountOpen(false);
          planner.setViewMode('calendar');
        }}
        onExport={planner.downloadExport}
        onLogout={handleLogout}
        onImportGuestData={planner.importGuestDataToAccount}
      />
    </div>
  );
}

function loadGuestStateSafely() {
  try {
    return loadPlannerState();
  } catch {
    return {
      version: 1 as const,
      tasks: [],
      categories: [],
      settings: {
        theme: 'light' as const,
        viewMode: 'list' as const,
        sortBy: 'dueDate' as const,
      },
    };
  }
}

function getTransferDismissKey(userId: string): string {
  return `task-planner-local-transfer-dismissed:${userId}`;
}
