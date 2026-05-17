export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new ApiError(
      0,
      'Сервер аккаунта недоступен, но локальный режим продолжает работать.',
      'NETWORK_ERROR',
    );
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string; code?: string }
      | null;

    throw new ApiError(
      response.status,
      getErrorMessage(response.status, payload?.code, payload?.message),
      payload?.code,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function getErrorMessage(status: number, code?: string, fallback?: string): string {
  switch (code) {
    case 'DATABASE_UNAVAILABLE':
      return 'База данных недоступна. Запустите npm run db:up и npm run db:migrate.';
    case 'UNAUTHORIZED':
      return 'Войдите в аккаунт, чтобы синхронизировать задачи.';
    case 'EMAIL_EXISTS':
      return 'Пользователь с таким email уже существует.';
    case 'INVALID_CREDENTIALS':
      return 'Неверный email или пароль.';
    case 'GOOGLE_NOT_CONFIGURED':
      return 'Google-вход не настроен. Добавьте OAuth Client ID.';
    case 'SMTP_NOT_CONFIGURED':
      return 'SMTP не настроен. Добавьте параметры почты для отправки писем.';
    default:
      break;
  }

  if (status === 503) {
    return 'База данных недоступна. Запустите npm run db:up и npm run db:migrate.';
  }

  return fallback ?? 'Не удалось выполнить запрос.';
}
