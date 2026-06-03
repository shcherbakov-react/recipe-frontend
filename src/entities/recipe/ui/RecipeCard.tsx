import { Check, Clock } from 'lucide-react'
import type { Recipe } from '../../../shared/types'
import styles from './RecipeCard.module.css'

const difficultyLabel: Record<Recipe['difficulty'], string> = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.category}>{recipe.category?.name ?? 'Без категории'}</p>
          <h2 className={styles.title}>{recipe.title}</h2>
        </div>
        <span className={styles.difficulty}>{difficultyLabel[recipe.difficulty]}</span>
      </div>
      <p className={styles.description}>{recipe.description}</p>
      <div className={styles.meta}>
        <span className={`${styles.pill} ${styles.accentPill}`}>
          <Clock size={15} />
          {recipe.cook_time_minutes} мин
        </span>
        <span className={styles.pill}>{recipe.servings} порц.</span>
        {recipe.tags.map((tag) => (
          <span className={`${styles.pill} ${styles.warningPill}`} key={tag.id}>
            {tag.name}
          </span>
        ))}
      </div>
      <div className={styles.contentGrid}>
        <div>
          <h3 className={styles.sectionTitle}>Ингредиенты</h3>
          <ul className={styles.list}>
            {recipe.ingredients.map((item) => (
              <li className={styles.ingredient} key={`${item.position}-${item.name}`}>
                <Check className={styles.checkIcon} size={15} />
                {item.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={styles.sectionTitle}>Шаги</h3>
          <ol className={styles.list}>
            {recipe.instructions.map((item, index) => (
              <li key={`${item.position}-${item.text}`}>
                {index + 1}. {item.text}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  )
}
