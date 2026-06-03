import { Bell, Heart, Home, Search, UserRound } from 'lucide-react'
import type { User, View } from '../../../shared/types'
import styles from './BottomNavbar.module.css'

type NavItem = {
  ariaLabel: string
  icon: React.ReactNode
  view: View
}

const items: NavItem[] = [
  { ariaLabel: 'Рецепты', icon: <Home size={28} fill="#444444" strokeWidth={0} />, view: 'recipes' },
  { ariaLabel: 'Поиск', icon: <Search size={30} stroke="#444444" strokeWidth={2} />, view: 'recipes' },
  { ariaLabel: 'Уведомления', icon: <Bell size={29} fill="#444444" strokeWidth={0} />, view: 'security' },
  { ariaLabel: 'Избранное', icon: <Heart size={31} fill="#444444" strokeWidth={0} />, view: 'create' },
]

export function BottomNavbar({ currentView, user, onNavigate }: { currentView: View; user: User | null; onNavigate: (view: View) => void }) {
  return (
    <nav aria-label="Основная навигация" className={styles.shell}>
      <div className={styles.bar}>
        {items.map((item) => (
          <button
            aria-label={item.ariaLabel}
            className={`${styles.item} ${currentView === item.view ? styles.active : ''}`}
            key={item.ariaLabel}
            title={item.ariaLabel}
            type="button"
            onClick={() => onNavigate(item.view)}
          >
            <span className={styles.iconWrap}>
              {item.icon}
              {item.ariaLabel === 'Уведомления' && <span className={styles.badge} />}
            </span>
          </button>
        ))}

        <button
          aria-label={user ? 'Профиль' : 'Войти'}
          className={`${styles.item} ${currentView === 'profile' || currentView === 'auth' ? styles.active : ''}`}
          title={user ? 'Профиль' : 'Войти'}
          type="button"
          onClick={() => onNavigate(user ? 'profile' : 'auth')}
        >
          {user?.avatar_url ? (
            <img alt="" className={styles.avatar} src={user.avatar_url} />
          ) : (
            <span className={styles.avatarFallback}>
              <UserRound size={24} />
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}
