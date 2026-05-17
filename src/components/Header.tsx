import type { Theme, ViewMode } from '../types/planner';
import type { AccountUser } from '../types/account';
import { AccountMenu } from './AccountMenu';
import {
  CalendarGridIcon,
  CalendarIcon,
  ColumnsIcon,
  DownloadIcon,
  ListIcon,
  MoonIcon,
  ResetIcon,
  SunIcon,
  UploadIcon,
} from './Icons';

interface HeaderProps {
  theme: Theme;
  viewMode: ViewMode;
  onThemeChange: (theme: Theme) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onCreateTask: () => void;
  authUser: AccountUser | null;
  authLoading: boolean;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  onLogout: () => Promise<void>;
}

export function Header({
  theme,
  viewMode,
  onThemeChange,
  onViewModeChange,
  onExport,
  onImport,
  onReset,
  onCreateTask,
  authUser,
  authLoading,
  onOpenAuth,
  onOpenAccount,
  onLogout,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-block">
        <span className="brand-mark" aria-hidden="true">
          ✓
        </span>
        <div>
          <p>Локальный планировщик задач</p>
          <h1>Task Planner</h1>
          <span>Планируйте день, отслеживайте дедлайны и сохраняйте всё в браузере.</span>
        </div>
      </div>

      <div className="header-actions">
        <button type="button" className="primary-button header-create-button" onClick={onCreateTask}>
          Новая задача
        </button>

        <div className="segmented-control" aria-label="Режим просмотра">
          <button
            type="button"
            className={viewMode === 'list' ? 'is-active' : ''}
            onClick={() => onViewModeChange('list')}
            title="Список"
            aria-label="Список"
            aria-pressed={viewMode === 'list'}
          >
            <ListIcon size={18} />
          </button>
          <button
            type="button"
            className={viewMode === 'board' ? 'is-active' : ''}
            onClick={() => onViewModeChange('board')}
            title="Доска"
            aria-label="Доска"
            aria-pressed={viewMode === 'board'}
          >
            <ColumnsIcon size={18} />
          </button>
          <button
            type="button"
            className={viewMode === 'week' ? 'is-active' : ''}
            onClick={() => onViewModeChange('week')}
            title="Неделя"
            aria-label="Неделя"
            aria-pressed={viewMode === 'week'}
          >
            <CalendarIcon size={18} />
          </button>
          <button
            type="button"
            className={viewMode === 'calendar' ? 'is-active' : ''}
            onClick={() => onViewModeChange('calendar')}
            title="Календарь"
            aria-label="Календарь"
            aria-pressed={viewMode === 'calendar'}
          >
            <CalendarGridIcon size={18} />
          </button>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
          title={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
          aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
        >
          {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
        </button>

        <button
          type="button"
          className="icon-button"
          onClick={onExport}
          title="Экспортировать JSON"
          aria-label="Экспортировать JSON"
        >
          <DownloadIcon size={18} />
        </button>

        <label className="icon-button file-button" title="Импортировать JSON">
          <UploadIcon size={18} />
          <input
            type="file"
            accept="application/json"
            aria-label="Импортировать JSON"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onImport(file);
              }
              event.currentTarget.value = '';
            }}
          />
        </label>

        <button
          type="button"
          className="icon-button danger"
          onClick={onReset}
          title="Сбросить все данные"
          aria-label="Сбросить все данные"
        >
          <ResetIcon size={18} />
        </button>

        {authUser ? (
          <AccountMenu user={authUser} onOpenAccount={onOpenAccount} onLogout={onLogout} />
        ) : (
          <button
            type="button"
            className="secondary-button header-auth-button"
            onClick={onOpenAuth}
            disabled={authLoading}
          >
            {authLoading ? '...' : 'Войти'}
          </button>
        )}
      </div>
    </header>
  );
}
