import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { authApi } from '../../../shared/api/auth'
import { API_URL } from '../../../shared/api/config'
import type { AuthMode } from '../../../shared/types'
import { Button, LinkButton } from '../../../shared/ui/Button/Button'
import { controlClassName } from '../../../shared/ui/Field/classes'
import { Field } from '../../../shared/ui/Field/Field'
import { Panel } from '../../../shared/ui/Panel/Panel'
import styles from './AuthView.module.css'

export function AuthView(props: {
  loading: boolean
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onSubmit: (data: { email: string; username: string; password: string }) => void
}) {
  const [form, setForm] = useState({ email: '', username: '', password: '' })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    props.onSubmit(form)
  }

  return (
    <section className={styles.layout}>
      <Panel>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.tabs}>
            <Button active={props.mode === 'login'} onClick={() => props.onModeChange('login')} variant="ghost">
              Вход
            </Button>
            <Button active={props.mode === 'register'} onClick={() => props.onModeChange('register')} variant="ghost">
              Регистрация
            </Button>
          </div>

          <div className={styles.formFields}>
            <Field label="Email">
              <input
                className={controlClassName}
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Field>
            {props.mode === 'register' && (
              <Field label="Имя пользователя">
                <input
                  className={controlClassName}
                  minLength={3}
                  required
                  value={form.username}
                  onChange={(event) => setForm({ ...form, username: event.target.value })}
                />
              </Field>
            )}
            <Field label="Пароль">
              <input
                className={controlClassName}
                minLength={props.mode === 'register' ? 8 : 6}
                required
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </Field>
            <Button disabled={props.loading} icon={<KeyRound size={18} />} type="submit" variant="primary">
              {props.loading ? 'Отправка...' : props.mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </Button>
          </div>
        </form>
      </Panel>

      <Panel title="OAuth">
        <div className={styles.oauthLinks}>
          <LinkButton href={authApi.telegramAuthUrl()}>Telegram</LinkButton>
          <LinkButton href={authApi.yandexAuthUrl()}>Yandex</LinkButton>
          <LinkButton href={authApi.vkAuthUrl()}>VK</LinkButton>
        </div>
        <p className={styles.apiUrl}>API: {API_URL}</p>
      </Panel>
    </section>
  )
}
