import { useState } from 'react';
import type { AccountUser } from '../types/account';

interface AccountMenuProps {
  user: AccountUser;
  onOpenAccount: () => void;
  onLogout: () => Promise<void>;
}

export function AccountMenu({ user, onOpenAccount, onLogout }: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="account-menu">
      <button
        type="button"
        className="account-menu-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span>{getInitials(user.nickname)}</span>
        <strong>{user.nickname}</strong>
      </button>

      {isOpen && (
        <div className="account-menu-popover" role="menu">
          <span>{user.email}</span>
          <button
            type="button"
            onClick={() => {
              onOpenAccount();
              setIsOpen(false);
            }}
          >
            Личный кабинет
          </button>
          <button
            type="button"
            onClick={() => {
              void onLogout();
              setIsOpen(false);
            }}
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'TP';
}
