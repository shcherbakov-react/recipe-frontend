import { Mail, RefreshCw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../../shared/ui/Button/Button'
import { controlClassName } from '../../../shared/ui/Field/classes'
import { Panel } from '../../../shared/ui/Panel/Panel'
import styles from './SecurityView.module.css'

type SecurityViewProps = {
  loading: boolean
  onChangePassword: (input: { old_password: string; new_password: string }) => Promise<void>
  onForgotPassword: (email: string) => Promise<void>
  onResendVerification: (email: string) => Promise<void>
  onResetPassword: (input: { token: string; new_password: string }) => Promise<void>
  onVerifyEmail: (token: string) => Promise<void>
}

export function SecurityView({ loading, onChangePassword, onForgotPassword, onResendVerification, onResetPassword, onVerifyEmail }: SecurityViewProps) {
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' })
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [verifyToken, setVerifyToken] = useState('')

  const submit = (event: FormEvent, action: () => Promise<void>) => {
    event.preventDefault()
    action()
  }

  return (
    <section className={styles.grid}>
      <Panel icon={<ShieldCheck size={19} />} title="Смена пароля">
        <form className={styles.form} onSubmit={(event) => submit(event, () => onChangePassword(passwords))}>
          <input
            className={controlClassName}
            placeholder="Старый пароль"
            required
            type="password"
            value={passwords.old_password}
            onChange={(event) => setPasswords({ ...passwords, old_password: event.target.value })}
          />
          <input
            className={controlClassName}
            minLength={8}
            placeholder="Новый пароль"
            required
            type="password"
            value={passwords.new_password}
            onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })}
          />
          <Button className={styles.button} disabled={loading} type="submit" variant="primary">
            Обновить
          </Button>
        </form>
      </Panel>

      <Panel icon={<Mail size={19} />} title="Email верификация">
        <form className={styles.form} onSubmit={(event) => submit(event, () => onResendVerification(email))}>
          <input className={controlClassName} placeholder="Email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button className={styles.button} disabled={loading} type="submit">
            Отправить письмо
          </Button>
        </form>
        <form className={styles.secondaryForm} onSubmit={(event) => submit(event, () => onVerifyEmail(verifyToken))}>
          <input className={controlClassName} placeholder="Token из письма" required value={verifyToken} onChange={(event) => setVerifyToken(event.target.value)} />
          <Button className={styles.button} disabled={loading} type="submit">
            Подтвердить email
          </Button>
        </form>
      </Panel>

      <Panel icon={<RefreshCw size={19} />} title="Восстановление пароля">
        <form className={styles.form} onSubmit={(event) => submit(event, () => onForgotPassword(email))}>
          <input className={controlClassName} placeholder="Email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button className={styles.button} disabled={loading} type="submit">
            Запросить сброс
          </Button>
        </form>
        <form
          className={styles.secondaryForm}
          onSubmit={(event) => submit(event, () => onResetPassword({ token, new_password: newPassword }))}
        >
          <input className={controlClassName} placeholder="Reset token" required value={token} onChange={(event) => setToken(event.target.value)} />
          <input
            className={controlClassName}
            minLength={8}
            placeholder="Новый пароль"
            required
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <Button className={styles.button} disabled={loading} type="submit">
            Сбросить пароль
          </Button>
        </form>
      </Panel>
    </section>
  )
}
