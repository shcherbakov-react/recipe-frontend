import type { ReactNode } from 'react'
import styles from './Panel.module.css'

export function Panel({ children, className = '', icon, title }: { children: ReactNode; className?: string; icon?: ReactNode; title?: string }) {
  return (
    <section className={[styles.panel, className].filter(Boolean).join(' ')}>
      {title && (
        <h2 className={styles.title}>
          {icon}
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}
