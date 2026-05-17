import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface GoogleSignInButtonProps {
  onSuccess: () => void;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const auth = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !containerRef.current) {
      return;
    }

    let cancelled = false;

    async function mountButton(): Promise<void> {
      try {
        await loadGoogleScript();
        const googleAccounts = window.google?.accounts?.id;
        if (cancelled || !containerRef.current || !googleAccounts || !GOOGLE_CLIENT_ID) {
          return;
        }

        googleAccounts.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            try {
              setError('');
              await auth.loginWithGoogle(credential);
              onSuccess();
            } catch (loginError) {
              setError(
                loginError instanceof ApiError
                  ? loginError.message
                  : 'Не удалось выполнить Google-вход.',
              );
            }
          },
        });
        googleAccounts.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 280,
          text: 'continue_with',
        });
      } catch {
        setError('Не удалось загрузить Google Sign-In.');
      }
    }

    void mountButton();

    return () => {
      cancelled = true;
    };
  }, [auth, onSuccess]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        className="secondary-button google-disabled-button"
        disabled
        title="Google-вход не настроен. Добавьте OAuth Client ID."
      >
        Продолжить с Google
      </button>
    );
  }

  return (
    <div className="google-sign-in-block">
      <div ref={containerRef} />
      {error && <p className="inline-error">{error}</p>}
    </div>
  );
}

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('script load failed')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('script load failed'));
    document.head.append(script);
  });
}
