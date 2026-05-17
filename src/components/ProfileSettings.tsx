import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function ProfileSettings() {
  const auth = useAuth();
  const [nickname, setNickname] = useState(auth.session?.user.nickname ?? '');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setNickname(auth.session?.user.nickname ?? '');
  }, [auth.session?.user.nickname]);

  if (!auth.session) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setStatus('');

    try {
      await auth.updateNickname(nickname);
      setStatus('Имя обновлено.');
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : 'Не удалось обновить имя.');
    }
  }

  return (
    <form className="account-form account-section-card" onSubmit={(event) => void handleSubmit(event)}>
      <div className="account-section-heading">
        <h3>Настройки аккаунта</h3>
        <p>Базовые данные профиля и управление сессией.</p>
      </div>

      <label className="field">
        <span>Имя</span>
        <input value={nickname} onChange={(event) => setNickname(event.target.value)} required />
      </label>

      <label className="field">
        <span>Email</span>
        <input value={auth.session.user.email} disabled />
      </label>

      <p className="account-muted">
        Смена email и пароля появится на следующем этапе. Сейчас backend уже хранит пароль только в
        виде hash и использует защищённые cookie-сессии.
      </p>

      {status && <p className="account-status">{status}</p>}

      <div className="form-actions">
        <button type="submit" className="primary-button">
          Сохранить
        </button>
      </div>
    </form>
  );
}
