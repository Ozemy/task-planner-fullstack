import { useEffect, useMemo, useState } from 'react';
import type { Task } from '../types/planner';
import { formatDateTime } from '../utils/date';
import { getFocusTaskGroups, getSuggestedFocusTask } from '../utils/focusSession';
import {
  loadFocusSessionStats,
  recordCompletedFocusSession,
  type FocusSessionStats,
} from '../storage/focusSessionStorage';

interface FocusSessionProps {
  tasks: Task[];
  selectedTaskId: string | null;
  preferredDurationMinutes?: (typeof DURATIONS)[number];
  onSelectTask: (taskId: string | null) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
}

const DURATIONS = [15, 25, 45] as const;

export function FocusSession({
  tasks,
  selectedTaskId,
  preferredDurationMinutes = 25,
  onSelectTask,
  onEditTask,
  onCompleteTask,
}: FocusSessionProps) {
  const [durationMinutes, setDurationMinutes] =
    useState<(typeof DURATIONS)[number]>(preferredDurationMinutes);
  const [remainingSeconds, setRemainingSeconds] = useState(preferredDurationMinutes * 60);
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');
  const [sessionNotice, setSessionNotice] = useState('');
  const [stats, setStats] = useState<FocusSessionStats>(() => loadFocusSessionStats());
  const suggestedTask = useMemo(() => getSuggestedFocusTask(tasks), [tasks]);
  const focusTaskGroups = useMemo(() => getFocusTaskGroups(tasks), [tasks]);
  const manuallySelectedTask = tasks.find(
    (task) => task.id === selectedTaskId && task.status !== 'completed',
  );
  const focusTask = manuallySelectedTask ?? suggestedTask;

  useEffect(() => {
    if (timerState === 'idle') {
      setDurationMinutes(preferredDurationMinutes);
      setRemainingSeconds(preferredDurationMinutes * 60);
    }
  }, [preferredDurationMinutes, timerState]);

  useEffect(() => {
    if (timerState !== 'running') {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setTimerState('finished');
          setSessionNotice('Фокус-сессия завершена. Можно отметить задачу выполненной.');
          setStats(recordCompletedFocusSession(durationMinutes));
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [durationMinutes, timerState]);

  function handleDurationChange(nextDuration: (typeof DURATIONS)[number]): void {
    setDurationMinutes(nextDuration);
    setRemainingSeconds(nextDuration * 60);
    setTimerState('idle');
    setSessionNotice('');
  }

  function handleStart(): void {
    if (remainingSeconds === 0) {
      setRemainingSeconds(durationMinutes * 60);
    }
    setTimerState('running');
    setSessionNotice('');
  }

  function handlePause(): void {
    setTimerState('paused');
  }

  function handleResume(): void {
    setTimerState('running');
  }

  function handleReset(): void {
    setRemainingSeconds(durationMinutes * 60);
    setTimerState('idle');
    setSessionNotice('');
  }

  function handleCompleteTask(): void {
    if (focusTask) {
      onCompleteTask(focusTask.id);
      setTimerState('idle');
      setRemainingSeconds(durationMinutes * 60);
      setSessionNotice('Задача отмечена выполненной.');
    }
  }

  return (
    <section className="focus-session" aria-label="Фокус-сессия">
      <div className="focus-session-header">
        <div>
          <p>Фокус-сессия</p>
          <h2>{focusTask ? focusTask.title : 'Нет активной задачи для фокуса'}</h2>
        </div>
        <strong aria-live="polite">{formatTimer(remainingSeconds)}</strong>
      </div>

      {focusTask ? (
        <button
          type="button"
          className="focus-session-task"
          onClick={() => onEditTask(focusTask)}
        >
          <span>{manuallySelectedTask ? 'Выбрана вручную' : 'Предложена автоматически'}</span>
          <small>{formatDateTime(focusTask)}</small>
        </button>
      ) : (
        <div className="focus-session-empty">
          Создайте активную задачу, чтобы начать фокус-работу.
        </div>
      )}

      <label className="focus-task-picker">
        <span>Выбрать другую задачу</span>
        <select
          value={manuallySelectedTask?.id ?? ''}
          onChange={(event) => onSelectTask(event.target.value || null)}
        >
          <option value="">Автовыбор</option>
          {focusTaskGroups.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {group.tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="focus-duration-picker" aria-label="Длительность фокус-сессии">
        {DURATIONS.map((duration) => (
          <button
            type="button"
            key={duration}
            className={durationMinutes === duration ? 'is-active' : ''}
            onClick={() => handleDurationChange(duration)}
            aria-pressed={durationMinutes === duration}
          >
            {duration} мин
          </button>
        ))}
      </div>

      <div className="focus-session-actions">
        {timerState === 'idle' || timerState === 'finished' ? (
          <button
            type="button"
            className="primary-button"
            onClick={handleStart}
            disabled={!focusTask}
          >
            Начать
          </button>
        ) : timerState === 'running' ? (
          <button type="button" className="secondary-button" onClick={handlePause}>
            Пауза
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={handleResume}>
            Продолжить
          </button>
        )}
        <button type="button" className="secondary-button" onClick={handleReset}>
          Сбросить
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={handleCompleteTask}
          disabled={!focusTask}
        >
          Отметить выполненной
        </button>
      </div>

      {sessionNotice && (
        <p className="focus-session-notice" role="status">
          {sessionNotice}
        </p>
      )}

      <div className="focus-session-stats">
        <div>
          <strong>{stats.completedToday}</strong>
          <span>Фокус-сессий сегодня</span>
        </div>
        <div>
          <strong>{stats.lastDurationMinutes ? `${stats.lastDurationMinutes} мин` : '—'}</strong>
          <span>Последняя сессия</span>
        </div>
      </div>
    </section>
  );
}

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
