interface GuestModeBannerProps {
  onOpenAuth: () => void;
}

export function GuestModeBanner({ onOpenAuth }: GuestModeBannerProps) {
  return (
    <section className="guest-mode-banner" aria-label="Гостевой режим">
      <div>
        <strong>Вы работаете в Guest Mode.</strong>
        <span>Создайте аккаунт, чтобы позже синхронизировать задачи между устройствами.</span>
      </div>
      <button type="button" className="secondary-button" onClick={onOpenAuth}>
        Войти
      </button>
    </section>
  );
}
