import type { Recipe } from '../../../shared/types'

export const starterRecipes: Recipe[] = [
  {
    id: 'sample-1',
    title: 'Лимонная паста с рикоттой',
    description: 'Быстрый ужин с плотным сливочным соусом, зеленью и свежей цедрой.',
    category: 'Ужин',
    difficulty: 'Легко',
    cookTime: 25,
    portions: 2,
    ingredients: ['паста', 'рикотта', 'лимон', 'пармезан', 'петрушка'],
    steps: ['Отварить пасту до al dente', 'Смешать рикотту, цедру и сок', 'Соединить с пастой и водой от варки'],
    tags: ['быстро', 'вегетарианское'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Теплый салат с курицей',
    description: 'Сытный салат с обжаренной курицей, овощами и горчичной заправкой.',
    category: 'Салат',
    difficulty: 'Средне',
    cookTime: 35,
    portions: 3,
    ingredients: ['куриное филе', 'листья салата', 'томаты', 'горчица', 'мед'],
    steps: ['Замариновать курицу', 'Обжарить до корочки', 'Собрать салат и добавить теплую заправку'],
    tags: ['белок', 'обед'],
    createdAt: new Date().toISOString(),
  },
]
