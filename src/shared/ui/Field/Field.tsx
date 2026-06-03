import type { ReactNode } from 'react'
import styles from './Field.module.css'

export function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className={styles.field}>
      {label}
      {children}
    </label>
  )
}
