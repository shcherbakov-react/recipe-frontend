import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { splitComma, splitLines } from '../../../shared/lib/text'
import type { Recipe } from '../../../shared/types'
import { Button } from '../../../shared/ui/Button/Button'
import { controlClassName, textareaMdClassName, textareaSmClassName } from '../../../shared/ui/Field/classes'
import { Field } from '../../../shared/ui/Field/Field'
import { Panel } from '../../../shared/ui/Panel/Panel'
import styles from './CreateRecipeView.module.css'

export function CreateRecipeView({ onCreate }: { onCreate: (recipe: Recipe) => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Ужин',
    difficulty: 'Легко' as Recipe['difficulty'],
    cookTime: 30,
    portions: 2,
    ingredients: '',
    steps: '',
    tags: '',
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onCreate({
      ...form,
      id: crypto.randomUUID(),
      ingredients: splitLines(form.ingredients),
      steps: splitLines(form.steps),
      tags: splitComma(form.tags),
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <Panel>
      <h1 className={styles.title}>Создание рецепта</h1>
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.gridTwo}>
          <Field label="Название">
            <input className={controlClassName} required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </Field>
          <Field label="Категория">
            <input
              className={controlClassName}
              required
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            />
          </Field>
        </div>
        <Field label="Описание">
          <textarea
            className={textareaSmClassName}
            required
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </Field>
        <div className={styles.gridThree}>
          <Field label="Сложность">
            <select
              className={controlClassName}
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: event.target.value as Recipe['difficulty'] })}
            >
              <option>Легко</option>
              <option>Средне</option>
              <option>Сложно</option>
            </select>
          </Field>
          <Field label="Время, минут">
            <input
              className={controlClassName}
              min={1}
              type="number"
              value={form.cookTime}
              onChange={(event) => setForm({ ...form, cookTime: Number(event.target.value) })}
            />
          </Field>
          <Field label="Порции">
            <input
              className={controlClassName}
              min={1}
              type="number"
              value={form.portions}
              onChange={(event) => setForm({ ...form, portions: Number(event.target.value) })}
            />
          </Field>
        </div>
        <div className={styles.gridTwo}>
          <Field label="Ингредиенты, каждый с новой строки">
            <textarea
              className={textareaMdClassName}
              required
              value={form.ingredients}
              onChange={(event) => setForm({ ...form, ingredients: event.target.value })}
            />
          </Field>
          <Field label="Шаги приготовления, каждый с новой строки">
            <textarea className={textareaMdClassName} required value={form.steps} onChange={(event) => setForm({ ...form, steps: event.target.value })} />
          </Field>
        </div>
        <Field label="Теги через запятую">
          <input className={controlClassName} value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
        </Field>
        <Button className={styles.submit} icon={<Plus size={18} />} type="submit" variant="primary">
          Сохранить рецепт
        </Button>
      </form>
    </Panel>
  )
}
