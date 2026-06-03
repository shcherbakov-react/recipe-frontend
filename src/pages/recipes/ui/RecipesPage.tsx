import { Plus, Search } from 'lucide-react'
import { RecipeCard } from '../../../entities/recipe/ui/RecipeCard'
import type { BackendStatus, Recipe } from '../../../shared/types'
import { Button } from '../../../shared/ui/Button/Button'
import { controlClassName } from '../../../shared/ui/Field/classes'
import styles from './RecipesPage.module.css'

export function RecipesPage(props: {
  backendStatus: BackendStatus
  category: string
  categories: string[]
  onCategoryChange: (value: string) => void
  onCreate: () => void
  query: string
  recipes: Recipe[]
  setQuery: (value: string) => void
  total: number
}) {
  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <p className={styles.eyebrow}>Каталог</p>
            <h1 className={styles.title}>Рецепты и заготовки</h1>
            <p className={styles.description}>
              Авторизация подключена к backend. Рецепты сохранены локально, потому что в backend пока нет recipe endpoint’ов.
            </p>
            <p className={styles.meta}>Всего: {props.total}. Backend: {props.backendStatus === 'checking' ? 'проверка' : props.backendStatus}.</p>
          </div>
          <Button icon={<Plus size={18} />} onClick={props.onCreate} variant="primary">
            Новый рецепт
          </Button>
        </div>

        <div className={styles.filters}>
          <label className={styles.search}>
            <Search className={styles.searchIcon} size={18} />
            <input
              className={`${controlClassName} ${styles.searchInput}`}
              onChange={(event) => props.setQuery(event.target.value)}
              placeholder="Поиск по названию, ингредиентам, тегам"
              value={props.query}
            />
          </label>
          <select className={controlClassName} onChange={(event) => props.onCategoryChange(event.target.value)} value={props.category}>
            {props.categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.cards}>
        {props.recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {props.recipes.length === 0 && <div className={styles.empty}>Ничего не найдено. Измените фильтр или создайте новый рецепт.</div>}
    </section>
  )
}
