import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { PeakTime, PlanningStyle, WorkMode } from '../types/account';

const WORK_MODES: Array<{ value: WorkMode; label: string }> = [
  { value: 'study', label: 'Учёба' },
  { value: 'work', label: 'Работа' },
  { value: 'personal', label: 'Личное' },
  { value: 'project', label: 'Проект' },
  { value: 'mixed', label: 'Смешанное' },
];

const PEAK_TIMES: Array<{ value: PeakTime; label: string }> = [
  { value: 'morning', label: 'Утро' },
  { value: 'day', label: 'День' },
  { value: 'evening', label: 'Вечер' },
  { value: 'night', label: 'Ночь' },
];

const PLANNING_STYLES: Array<{ value: PlanningStyle; label: string }> = [
  { value: 'calm', label: 'Мягкий' },
  { value: 'balanced', label: 'Сбалансированный' },
  { value: 'strict', label: 'Строгий' },
];

export function ProductivityProfileSettings() {
  const auth = useAuth();
  const profile = auth.session?.profile;
  const [workMode, setWorkMode] = useState<WorkMode>(profile?.workMode ?? 'mixed');
  const [dailyMainTasksTarget, setDailyMainTasksTarget] = useState(profile?.dailyMainTasksTarget ?? 3);
  const [preferredFocusMinutes, setPreferredFocusMinutes] = useState<15 | 25 | 45>(
    profile?.preferredFocusMinutes ?? 25,
  );
  const [peakTime, setPeakTime] = useState<PeakTime>(profile?.peakTime ?? 'day');
  const [planningStyle, setPlanningStyle] = useState<PlanningStyle>(
    profile?.planningStyle ?? 'balanced',
  );
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!profile) {
      return;
    }

    setWorkMode(profile.workMode);
    setDailyMainTasksTarget(profile.dailyMainTasksTarget);
    setPreferredFocusMinutes(profile.preferredFocusMinutes);
    setPeakTime(profile.peakTime);
    setPlanningStyle(profile.planningStyle);
  }, [profile]);

  if (!profile) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus('');

    try {
      await auth.updateProfile({
        workMode,
        dailyMainTasksTarget,
        preferredFocusMinutes,
        peakTime,
        planningStyle,
      });
      setStatus('Стиль планирования сохранён.');
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : 'Не удалось сохранить настройки.');
    }
  }

  return (
    <form className="account-form account-section-card" onSubmit={(event) => void handleSubmit(event)}>
      <div className="account-section-heading">
        <h3>Мой стиль планирования</h3>
        <p>Компактные настройки, которые подготовят почву для персонализации Smart Planner.</p>
      </div>

      <div className="account-grid">
        <label className="field">
          <span>Основная сфера</span>
          <select value={workMode} onChange={(event) => setWorkMode(event.target.value as WorkMode)}>
            {WORK_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Цель дня</span>
          <select
            value={dailyMainTasksTarget}
            onChange={(event) => setDailyMainTasksTarget(Number(event.target.value))}
          >
            {[1, 2, 3, 4, 5].map((count) => (
              <option key={count} value={count}>
                {count} главных задач
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Любимая фокус-сессия</span>
          <select
            value={preferredFocusMinutes}
            onChange={(event) =>
              setPreferredFocusMinutes(Number(event.target.value) as 15 | 25 | 45)
            }
          >
            {[15, 25, 45].map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} минут
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Лучшее время работы</span>
          <select value={peakTime} onChange={(event) => setPeakTime(event.target.value as PeakTime)}>
            {PEAK_TIMES.map((time) => (
              <option key={time.value} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-wide">
          <span>Стиль рекомендаций</span>
          <select
            value={planningStyle}
            onChange={(event) => setPlanningStyle(event.target.value as PlanningStyle)}
          >
            {PLANNING_STYLES.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {status && <p className="account-status">{status}</p>}

      <div className="form-actions">
        <button type="submit" className="primary-button">
          Сохранить стиль
        </button>
      </div>
    </form>
  );
}
