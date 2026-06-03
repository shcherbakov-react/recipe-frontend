import type { BackendStatus, User } from '../../../shared/types'
import { InfoRow } from '../../../shared/ui/InfoRow/InfoRow'
import { Panel } from '../../../shared/ui/Panel/Panel'
import styles from './StatusSidebar.module.css'

const endpoints = [
  'POST /auth/register',
  'POST /auth/login',
  'POST /auth/refresh',
  'POST /auth/logout',
  'GET /auth/me',
  'PUT /auth/me',
  'POST /auth/change-password',
  'POST /auth/verify-email',
  'POST /auth/resend-verification',
  'POST /auth/forgot-password',
  'POST /auth/reset-password',
  'GET /auth/oauth/*',
]

export function StatusSidebar({
  backendStatus,
  recipesCount,
  user,
}: {
  backendStatus: BackendStatus
  recipesCount: number
  user: User | null
}) {
  const statusText = backendStatus === 'checking' ? 'Проверка' : backendStatus === 'online' ? 'Online' : 'Offline'

  return (
    <aside className={styles.sidebar}>
      <Panel title="Состояние">
        <dl className={styles.list}>
          <InfoRow label="Backend" value={statusText} />
          <InfoRow label="Пользователь" value={user?.username ?? 'Гость'} />
          <InfoRow label="Провайдер" value={user?.provider ?? '-'} />
          <InfoRow label="Рецептов" value={String(recipesCount)} />
        </dl>
      </Panel>

      <Panel title="Покрытые ручки">
        <div className={styles.endpoints}>
          {endpoints.map((endpoint) => (
            <span className={styles.endpoint} key={endpoint}>
              {endpoint}
            </span>
          ))}
        </div>
      </Panel>
    </aside>
  )
}
