import type { Notice } from '../../types'
import styles from './NoticeBanner.module.css'

export function NoticeBanner({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  return (
    <div className={`${styles.notice} ${styles[notice.type]}`}>
      <p className={styles.text}>{notice.text}</p>
      <button className={styles.close} onClick={onClose} type="button">
        Закрыть
      </button>
    </div>
  )
}
