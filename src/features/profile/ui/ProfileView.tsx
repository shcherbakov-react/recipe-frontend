import { Check } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from '../../../shared/types'
import { Button } from '../../../shared/ui/Button/Button'
import { controlClassName } from '../../../shared/ui/Field/classes'
import { Field } from '../../../shared/ui/Field/Field'
import { Panel } from '../../../shared/ui/Panel/Panel'
import styles from './ProfileView.module.css'

export function ProfileView({ user, onSubmit }: { user: User; onSubmit: (updates: Partial<User>) => void }) {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email ?? '',
    avatar_url: user.avatar_url ?? '',
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <Panel>
      <form onSubmit={submit}>
        <h1 className={styles.title}>Профиль</h1>
        <div className={styles.grid}>
          <Field label="Имя пользователя">
            <input className={controlClassName} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
          </Field>
          <Field label="Email">
            <input className={controlClassName} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </Field>
        </div>
        <div className={styles.spaced}>
          <Field label="Avatar URL">
            <input className={controlClassName} value={form.avatar_url} onChange={(event) => setForm({ ...form, avatar_url: event.target.value })} />
          </Field>
        </div>
        <Button className={styles.spaced} icon={<Check size={18} />} type="submit" variant="primary">
          Сохранить профиль
        </Button>
      </form>
    </Panel>
  )
}
