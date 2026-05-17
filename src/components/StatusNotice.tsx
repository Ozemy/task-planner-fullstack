import type { Notice } from '../types/planner';

interface StatusNoticeProps {
  notice: Notice;
  onDismiss: () => void;
}

export function StatusNotice({ notice, onDismiss }: StatusNoticeProps) {
  return (
    <div className={`status-message is-${notice.kind}`} role="status" aria-live="polite">
      <span>{notice.text}</span>
      <button type="button" onClick={onDismiss} aria-label="Закрыть уведомление">
        ×
      </button>
    </div>
  );
}
