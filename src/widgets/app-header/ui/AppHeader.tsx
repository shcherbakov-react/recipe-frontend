import { BookOpen, KeyRound, LogOut, Plus, ShieldCheck, UserRound, Utensils } from 'lucide-react'
import type { View } from '../../../shared/types'
import { Button } from '../../../shared/ui/Button/Button'
import styles from './AppHeader.module.css'

export function AppHeader({
  currentView,
  isAuthenticated,
  onLogout,
  onNavigate,
}: {
  currentView: View
  isAuthenticated: boolean
  onLogout: () => void
  onNavigate: (view: View) => void
}) {
  return (
    <header className={styles.header}>
      <button className={styles.brand} onClick={() => onNavigate('recipes')} type="button">
        <span className={styles.brandIcon}>
          <Utensils size={22} />
        </span>
        <span>
          <span className={styles.brandTitle}>Recipe Book</span>
          <span className={styles.brandSubtitle}>Фронт под API рецептов</span>
        </span>
      </button>

      <nav className={styles.nav}>
        <Button active={currentView === 'recipes'} icon={<BookOpen size={18} />} onClick={() => onNavigate('recipes')} variant="ghost">
          Рецепты
        </Button>
        <Button active={currentView === 'create'} icon={<Plus size={18} />} onClick={() => onNavigate('create')} variant="ghost">
          Создать
        </Button>
        <Button active={currentView === 'profile'} icon={<UserRound size={18} />} onClick={() => onNavigate('profile')} variant="ghost">
          Профиль
        </Button>
        <Button active={currentView === 'security'} icon={<ShieldCheck size={18} />} onClick={() => onNavigate('security')} variant="ghost">
          Безопасность
        </Button>
        {isAuthenticated ? (
          <Button aria-label="Выйти" icon={<LogOut size={18} />} onClick={onLogout} title="Выйти" variant="icon" />
        ) : (
          <Button active={currentView === 'auth'} icon={<KeyRound size={18} />} onClick={() => onNavigate('auth')} variant="ghost">
            Войти
          </Button>
        )}
      </nav>
    </header>
  )
}
