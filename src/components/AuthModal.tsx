import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'register';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const auth = useAuth();
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      auth.clearError();
    }
  }, [auth, isOpen, tab]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (tab === 'login') {
        await auth.login({ email, password });
      } else {
        await auth.register({ email, password, nickname });
      }

      onClose();
      setPassword('');
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : 'Не удалось выполнить запрос. Проверьте backend и попробуйте снова.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleError = error || auth.error;
  const showSetupHint =
    visibleError.includes('Сервер аккаунта') || visibleError.includes('База данных');

  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-label="Авторизация" aria-modal="true" className="auth-modal" role="dialog">
        <div className="modal-header">
          <div>
            <p>Личный кабинет</p>
            <h2>{tab === 'login' ? 'Вход' : 'Регистрация'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className="auth-tabs" aria-label="Режим авторизации">
          <button
            type="button"
            className={tab === 'login' ? 'is-active' : ''}
            onClick={() => setTab('login')}
          >
            Вход
          </button>
          <button
            type="button"
            className={tab === 'register' ? 'is-active' : ''}
            onClick={() => setTab('register')}
          >
            Регистрация
          </button>
        </div>

        <GoogleSignInButton onSuccess={onClose} />

        <form className="account-form" onSubmit={(event) => void handleSubmit(event)}>
          {tab === 'register' && (
            <label className="field">
              <span>Имя</span>
              <input
                autoComplete="nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                required
              />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Пароль</span>
            <input
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              minLength={tab === 'register' ? 8 : undefined}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {visibleError && (
            <p className="inline-error" role="alert">
              {visibleError}
            </p>
          )}

          {showSetupHint && (
            <div className="auth-setup-hint">
              <strong>Проверьте локальный запуск:</strong>
              <span>1. Docker Desktop открыт</span>
              <span>2. `npm run db:up`</span>
              <span>3. `npm run db:migrate`</span>
              <span>4. `npm run dev:server`</span>
            </div>
          )}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Подождите...' : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>
      </section>
    </div>
  );
}
