import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/client';
import {
  completeRemoteTask,
  createRemoteCategory,
  createRemoteTask,
  deleteRemoteCategory,
  deleteRemoteTask,
  importLocalPlannerState,
  loadRemotePlannerData,
  reopenRemoteTask,
  updateRemoteTask,
} from '../api/plannerApi';
import type {
  Category,
  FilterId,
  Notice,
  PlannerState,
  SortId,
  TaskDraft,
  ViewMode,
} from '../types/planner';
import { UNCATEGORIZED_ID } from '../types/planner';
import {
  DEFAULT_STATE,
  exportPlannerState,
  importPlannerState,
  loadPlannerState,
  savePlannerState,
} from '../storage/plannerStorage';
import {
  createTask,
  filterTasks,
  getDefaultSortForViewMode,
  isSortAvailableForViewMode,
  normalizeTasks,
  sortTasks,
  toggleSubtask,
  toggleTaskCompletion,
  updateTask,
} from '../utils/task';
import { createDemoState } from '../utils/demoData';

const CATEGORY_COLORS = ['#1f6f78', '#d26a5c', '#7b5ea7', '#57825d', '#d39a35', '#4d6fa9'];

export function usePlanner(isAuthenticated: boolean) {
  const [initialLoad] = useState(loadInitialPlannerState);
  const [notice, setNotice] = useState<Notice | null>(initialLoad.notice);
  const [state, setState] = useState<PlannerState>(initialLoad.state);
  const [filterId, setFilterId] = useState<FilterId>('all');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        setState(loadPlannerState());
      } catch {
        setState(DEFAULT_STATE);
      }
      setSyncError('');
      return;
    }

    void reloadRemoteState();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        savePlannerState(state);
      } catch {
        setNotice({
          kind: 'error',
          text: 'Не удалось сохранить изменения в браузере. Проверьте доступ к localStorage.',
        });
      }
    }

    document.documentElement.dataset.theme = state.settings.theme;
  }, [isAuthenticated, state]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setState((current) => {
        const tasks = normalizeTasks(current.tasks);
        return tasks === current.tasks ? current : { ...current, tasks };
      });
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const { sortBy, viewMode } = state.settings;
    if (!isSortAvailableForViewMode(sortBy, viewMode)) {
      setState((current) => ({
        ...current,
        settings: {
          ...current.settings,
          sortBy: getDefaultSortForViewMode(current.settings.viewMode),
        },
      }));
    }
  }, [state.settings.sortBy, state.settings.viewMode]);

  const filteredTasks = useMemo(
    () => filterTasks(state.tasks, filterId, searchTerm, categoryId),
    [categoryId, filterId, searchTerm, state.tasks],
  );

  const visibleTasks = useMemo(
    () =>
      state.settings.viewMode === 'list'
        ? sortTasks(filteredTasks, state.settings.sortBy)
        : filteredTasks,
    [filteredTasks, state.settings.sortBy, state.settings.viewMode],
  );

  const stats = useMemo(
    () => ({
      total: state.tasks.length,
      active: state.tasks.filter((task) => task.status === 'active').length,
      completed: state.tasks.filter((task) => task.status === 'completed').length,
      overdue: state.tasks.filter((task) => task.status === 'overdue').length,
    }),
    [state.tasks],
  );

  async function reloadRemoteState(): Promise<void> {
    setIsSyncing(true);
    setSyncError('');

    try {
      const remote = await loadRemotePlannerData();
      setState((current) => ({
        ...current,
        tasks: normalizeTasks(remote.tasks),
        categories: remote.categories,
      }));
    } catch (error) {
      const message = getSyncErrorMessage(error);
      setSyncError(message);
      setNotice({
        kind: 'error',
        text: `${message} Локальные гостевые данные не удалены.`,
      });
    } finally {
      setIsSyncing(false);
    }
  }

  function addTask(draft: TaskDraft): void {
    const normalizedDraft = normalizeDraftCategory(draft, state.categories);
    const task = createTask(normalizedDraft);

    setState((current) => ({
      ...current,
      tasks: [task, ...current.tasks],
    }));
    setNotice({ kind: 'success', text: 'Задача создана.' });

    if (isAuthenticated) {
      void runRemoteMutation(() => createRemoteTask(task));
    }
  }

  function saveTask(taskId: string, draft: TaskDraft): void {
    const existingTask = state.tasks.find((task) => task.id === taskId);
    if (!existingTask) {
      return;
    }

    const normalizedDraft = normalizeDraftCategory(draft, state.categories);
    const nextTask = updateTask(existingTask, normalizedDraft);

    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? nextTask : task)),
    }));
    setNotice({ kind: 'success', text: 'Задача обновлена.' });

    if (isAuthenticated) {
      void runRemoteMutation(() => updateRemoteTask(nextTask));
    }
  }

  function removeTask(taskId: string): void {
    setState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }));
    setNotice({ kind: 'info', text: 'Задача удалена.' });

    if (isAuthenticated) {
      void runRemoteMutation(() => deleteRemoteTask(taskId));
    }
  }

  function changeTaskCompletion(taskId: string): void {
    const existingTask = state.tasks.find((task) => task.id === taskId);
    if (!existingTask) {
      return;
    }

    const nextTask = toggleTaskCompletion(existingTask);
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? nextTask : task)),
    }));

    if (isAuthenticated) {
      void runRemoteMutation(() =>
        nextTask.status === 'completed'
          ? completeRemoteTask(taskId)
          : reopenRemoteTask(taskId),
      );
    }
  }

  function changeSubtaskCompletion(taskId: string, subtaskId: string): void {
    const existingTask = state.tasks.find((task) => task.id === taskId);
    if (!existingTask) {
      return;
    }

    const nextTask = toggleSubtask(existingTask, subtaskId);
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? nextTask : task)),
    }));

    if (isAuthenticated) {
      void runRemoteMutation(() => updateRemoteTask(nextTask));
    }
  }

  function clearCompletedTasks(): void {
    const completedTaskIds = state.tasks
      .filter((task) => task.status === 'completed')
      .map((task) => task.id);

    setState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.status !== 'completed'),
    }));
    setNotice({ kind: 'info', text: 'Выполненные задачи очищены.' });

    if (isAuthenticated && completedTaskIds.length > 0) {
      void runRemoteMutation(() => Promise.all(completedTaskIds.map(deleteRemoteTask)));
    }
  }

  function createCategory(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNotice({ kind: 'error', text: 'Введите название категории.' });
      return;
    }

    const duplicate = state.categories.some(
      (category) => category.name.toLocaleLowerCase('ru-RU') === trimmedName.toLocaleLowerCase('ru-RU'),
    );

    if (duplicate) {
      setNotice({ kind: 'error', text: 'Такая категория уже существует.' });
      return;
    }

    const color = CATEGORY_COLORS[state.categories.length % CATEGORY_COLORS.length];
    const category: Category = {
      id: crypto.randomUUID(),
      name: trimmedName,
      color,
      createdAt: new Date().toISOString(),
    };

    setState((current) => ({
      ...current,
      categories: [...current.categories, category],
    }));
    setNotice({ kind: 'success', text: 'Категория создана.' });

    if (isAuthenticated) {
      void runRemoteMutation(() => createRemoteCategory(category));
    }
  }

  function removeCategory(categoryToRemoveId: string): void {
    if (categoryToRemoveId === UNCATEGORIZED_ID) {
      return;
    }

    const categoryExists = state.categories.some((category) => category.id === categoryToRemoveId);
    if (!categoryExists) {
      return;
    }

    const updatedAt = new Date().toISOString();
    setState((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.id !== categoryToRemoveId),
      tasks: current.tasks.map((task) =>
        task.categoryId === categoryToRemoveId
          ? { ...task, categoryId: UNCATEGORIZED_ID, updatedAt }
          : task,
      ),
    }));
    setCategoryId((current) => (current === categoryToRemoveId ? 'all' : current));
    setNotice({
      kind: 'info',
      text: 'Категория удалена. Задачи перенесены в "Без категории".',
    });

    if (isAuthenticated) {
      void runRemoteMutation(() => deleteRemoteCategory(categoryToRemoveId));
    }
  }

  function setTheme(theme: PlannerState['settings']['theme']): void {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, theme },
    }));
  }

  function setViewMode(viewMode: ViewMode): void {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        viewMode,
        sortBy: isSortAvailableForViewMode(current.settings.sortBy, viewMode)
          ? current.settings.sortBy
          : getDefaultSortForViewMode(viewMode),
      },
    }));
  }

  function setSortBy(sortBy: SortId): void {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, sortBy },
    }));
  }

  function downloadExport(): void {
    const blob = new Blob([exportPlannerState(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-planner-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice({ kind: 'success', text: 'Экспорт подготовлен.' });
  }

  async function importFromFile(file: File): Promise<void> {
    try {
      const text = await file.text();
      const importedState = importPlannerState(text);

      if (isAuthenticated) {
        await importLocalPlannerState(importedState);
        await reloadRemoteState();
      } else {
        setState(importedState);
      }

      setFilterId('all');
      setCategoryId('all');
      setSearchTerm('');
      setNotice({ kind: 'success', text: 'Данные импортированы.' });
    } catch (error) {
      setNotice({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Не удалось импортировать данные.',
      });
    }
  }

  function resetAllData(): void {
    const taskIds = state.tasks.map((task) => task.id);
    const categoryIds = state.categories
      .filter((category) => category.id !== UNCATEGORIZED_ID)
      .map((category) => category.id);

    setState(DEFAULT_STATE);
    setFilterId('all');
    setCategoryId('all');
    setSearchTerm('');
    setNotice({ kind: 'info', text: 'Все данные сброшены.' });

    if (isAuthenticated) {
      void runRemoteMutation(() =>
        Promise.all([
          ...taskIds.map(deleteRemoteTask),
          ...categoryIds.map(deleteRemoteCategory),
        ]),
      );
    }
  }

  function loadDemoData(): void {
    if (state.tasks.length > 0) {
      setNotice({
        kind: 'error',
        text: 'Демо-данные можно загрузить только в пустой планировщик.',
      });
      return;
    }

    const demoState = createDemoState(state.settings);
    setState(demoState);
    setFilterId('all');
    setCategoryId('all');
    setSearchTerm('');
    setNotice({ kind: 'success', text: 'Демо-данные загружены.' });

    if (isAuthenticated) {
      void runRemoteMutation(async () => {
        await importLocalPlannerState(demoState);
        await reloadRemoteState();
      });
    }
  }

  function resetFilters(): void {
    setFilterId('all');
    setCategoryId('all');
    setSearchTerm('');
  }

  async function importGuestDataToAccount() {
    const guestState = loadPlannerState();
    const summary = await importLocalPlannerState(guestState);
    await reloadRemoteState();
    return summary;
  }

  async function runRemoteMutation<T>(mutation: () => Promise<T>): Promise<void> {
    try {
      setSyncError('');
      await mutation();
    } catch (error) {
      const message = getSyncErrorMessage(error);
      setSyncError(message);
      setNotice({
        kind: 'error',
        text: `${message} Изменения в интерфейсе сохранены локально только до следующей синхронизации.`,
      });
    }
  }

  return {
    state,
    visibleTasks,
    stats,
    filterId,
    categoryId,
    searchTerm,
    notice,
    isSyncing,
    syncError,
    setFilterId,
    setCategoryId,
    setSearchTerm,
    addTask,
    saveTask,
    removeTask,
    changeTaskCompletion,
    changeSubtaskCompletion,
    clearCompletedTasks,
    createCategory,
    removeCategory,
    setTheme,
    setViewMode,
    setSortBy,
    downloadExport,
    importFromFile,
    resetAllData,
    loadDemoData,
    resetFilters,
    reloadRemoteState,
    importGuestDataToAccount,
    clearSyncError: () => setSyncError(''),
    clearNotice: () => setNotice(null),
  };
}

function loadInitialPlannerState(): { notice: Notice | null; state: PlannerState } {
  try {
    return { notice: null, state: loadPlannerState() };
  } catch {
    return {
      notice: {
        kind: 'error',
        text: 'Не удалось прочитать сохранённые данные. Загружено пустое состояние.',
      },
      state: DEFAULT_STATE,
    };
  }
}

function normalizeDraftCategory(draft: TaskDraft, categories: Category[]): TaskDraft {
  return categories.some((category) => category.id === draft.categoryId)
    ? draft
    : { ...draft, categoryId: UNCATEGORIZED_ID };
}

function getSyncErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Не удалось синхронизировать данные с аккаунтом.';
}
