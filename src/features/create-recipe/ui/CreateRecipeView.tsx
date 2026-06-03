import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { splitLines } from '../../../shared/lib/text'
import type { Category, CreateRecipeInput, Recipe, Tag } from '../../../shared/types'
import { Button } from '../../../shared/ui/Button/Button'
import { controlClassName, textareaMdClassName, textareaSmClassName } from '../../../shared/ui/Field/classes'
import { Field } from '../../../shared/ui/Field/Field'
import { Panel } from '../../../shared/ui/Panel/Panel'
import styles from './CreateRecipeView.module.css'

const difficultyOptions: Array<{ label: string; value: Recipe['difficulty'] }> = [
  { label: 'Легко', value: 'easy' },
  { label: 'Средне', value: 'medium' },
  { label: 'Сложно', value: 'hard' },
]

export function CreateRecipeView({
  categories,
  loading,
  onCreate,
  tags,
}: {
  categories: Category[]
  loading: boolean
  onCreate: (recipe: CreateRecipeInput) => void
  tags: Tag[]
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    difficulty: 'easy' as Recipe['difficulty'],
    cookTime: 30,
    prepTime: 0,
    portions: 2,
    ingredients: '',
    steps: '',
    tagIds: [] as string[],
  })

  const selectedCategoryId = form.category_id || categories[0]?.id || ''

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onCreate({
      category_id: selectedCategoryId,
      title: form.title,
      description: form.description,
      servings: form.portions,
      prep_time_minutes: form.prepTime,
      cook_time_minutes: form.cookTime,
      difficulty: form.difficulty,
      ingredients: splitLines(form.ingredients).map((name) => ({ name })),
      instructions: splitLines(form.steps).map((text) => ({ text })),
      is_public: true,
      tag_ids: form.tagIds,
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
            <select
              className={controlClassName}
              required
              value={selectedCategoryId}
              onChange={(event) => setForm({ ...form, category_id: event.target.value })}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
        <div>
          <p className={styles.fieldTitle}>Теги</p>
          <div className={styles.tagGrid}>
            {tags.map((tag) => (
              <label className={styles.tagOption} key={tag.id}>
                <input
                  checked={form.tagIds.includes(tag.id)}
                  type="checkbox"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      tagIds: event.target.checked ? [...form.tagIds, tag.id] : form.tagIds.filter((id) => id !== tag.id),
                    })
                  }
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
        <Button className={styles.submit} disabled={loading || categories.length === 0} icon={<Plus size={18} />} type="submit" variant="primary">
          {loading ? 'Сохранение...' : 'Сохранить рецепт'}
        </Button>
      </form>
    </Panel>
  )
}
