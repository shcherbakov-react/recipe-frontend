import {
  BookOpen,
  Check,
  Clock,
  KeyRound,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Utensils,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { api, API_URL, ApiClientError, getStoredTokens, storeTokens } from './lib/api'
import type { AuthResponse, Recipe, TokenPair, User } from './lib/types'

type View = 'recipes' | 'create' | 'auth' | 'profile' | 'security'
type AuthMode = 'login' | 'register'
type Notice = { type: 'success' | 'error' | 'info'; text: string }

const starterRecipes: Recipe[] = [
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

const recipeStorageKey = 'recipes.local.items'

function App() {
  const [view, setView] = useState<View>('recipes')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<TokenPair | null>(() => readInitialTokens())
  const [notice, setNotice] = useState<Notice | null>(() =>
    hasOAuthCallback() ? { type: 'success', text: 'Авторизация через OAuth завершена.' } : null,
  )
  const [loading, setLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadRecipes())
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      window.history.replaceState({}, '', '/')
    }
  }, [])

  useEffect(() => {
    api
      .health()
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  useEffect(() => {
    if (!tokens) return

    api
      .me()
      .then(setUser)
      .catch((error) => {
        setNotice(toNotice(error))
        storeTokens(null)
        setTokens(null)
      })
  }, [tokens])

  useEffect(() => {
    localStorage.setItem(recipeStorageKey, JSON.stringify(recipes))
  }, [recipes])

  const categories = useMemo(
    () => ['Все', ...Array.from(new Set(recipes.map((recipe) => recipe.category))).sort()],
    [recipes],
  )

  const visibleRecipes = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return recipes.filter((recipe) => {
      const matchesCategory = category === 'Все' || recipe.category === category
      const searchable = [
        recipe.title,
        recipe.description,
        recipe.category,
        recipe.difficulty,
        recipe.ingredients.join(' '),
        recipe.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()
      return matchesCategory && (!normalized || searchable.includes(normalized))
    })
  }, [category, query, recipes])

  const applyAuth = (response: AuthResponse) => {
    storeTokens(response.tokens)
    setTokens(response.tokens)
    setUser(response.user)
    setView('recipes')
    setNotice({ type: 'success', text: `Вы вошли как ${response.user.username}` })
  }

  const logout = async () => {
    const refreshToken = tokens?.refresh_token
    storeTokens(null)
    setTokens(null)
    setUser(null)
    setView('auth')

    if (refreshToken) {
      api.logout(refreshToken).catch(() => undefined)
    }
  }

  const guardedSetView = (nextView: View) => {
    if ((nextView === 'profile' || nextView === 'security') && !user) {
      setView('auth')
      setNotice({ type: 'info', text: 'Войдите, чтобы пользоваться этим разделом.' })
      return
    }

    setView(nextView)
  }

  return (
    <main className="min-h-screen bg-[#f7f3ec] text-stone-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-stone-300/80 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => guardedSetView('recipes')}
            type="button"
          >
            <span className="grid size-11 place-items-center rounded-lg bg-emerald-700 text-white shadow-sm">
              <Utensils size={22} />
            </span>
            <span>
              <span className="block text-xl font-semibold">Recipe Book</span>
              <span className="block text-sm text-stone-600">Фронт под API рецептов</span>
            </span>
          </button>

          <nav className="flex flex-wrap items-center gap-2">
            <NavButton active={view === 'recipes'} icon={<BookOpen size={18} />} onClick={() => guardedSetView('recipes')}>
              Рецепты
            </NavButton>
            <NavButton active={view === 'create'} icon={<Plus size={18} />} onClick={() => guardedSetView('create')}>
              Создать
            </NavButton>
            <NavButton active={view === 'profile'} icon={<UserRound size={18} />} onClick={() => guardedSetView('profile')}>
              Профиль
            </NavButton>
            <NavButton active={view === 'security'} icon={<ShieldCheck size={18} />} onClick={() => guardedSetView('security')}>
              Безопасность
            </NavButton>
            {user ? (
              <button className="icon-button border-stone-300 bg-white" onClick={logout} title="Выйти" type="button">
                <LogOut size={18} />
              </button>
            ) : (
              <NavButton active={view === 'auth'} icon={<KeyRound size={18} />} onClick={() => guardedSetView('auth')}>
                Войти
              </NavButton>
            )}
          </nav>
        </header>

        <section className="grid gap-4 py-5 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            {notice && <NoticeBanner notice={notice} onClose={() => setNotice(null)} />}

            {view === 'recipes' && (
              <RecipesView
                backendStatus={backendStatus}
                category={category}
                categories={categories}
                onCategoryChange={setCategory}
                onCreate={() => guardedSetView('create')}
                query={query}
                recipes={visibleRecipes}
                setQuery={setQuery}
                total={recipes.length}
              />
            )}

            {view === 'create' && (
              <CreateRecipeView
                onCreate={(recipe) => {
                  setRecipes((current) => [recipe, ...current])
                  setView('recipes')
                  setNotice({ type: 'success', text: 'Рецепт создан локально. Backend-ручку можно подключить в api.ts.' })
                }}
              />
            )}

            {view === 'auth' && (
              <AuthView
                loading={loading}
                mode={authMode}
                onModeChange={setAuthMode}
                onSubmit={async (data) => {
                  setLoading(true)
                  try {
                    const response =
                      authMode === 'login'
                        ? await api.login({ email: data.email, password: data.password })
                        : await api.register({
                            email: data.email,
                            username: data.username,
                            password: data.password,
                          })
                    applyAuth(response)
                  } catch (error) {
                    setNotice(toNotice(error))
                  } finally {
                    setLoading(false)
                  }
                }}
              />
            )}

            {view === 'profile' && user && (
              <ProfileView
                user={user}
                onSubmit={async (updates) => {
                  setLoading(true)
                  try {
                    const updated = await api.updateMe(updates)
                    setUser(updated)
                    setNotice({ type: 'success', text: 'Профиль обновлен.' })
                  } catch (error) {
                    setNotice(toNotice(error))
                  } finally {
                    setLoading(false)
                  }
                }}
              />
            )}

            {view === 'security' && (
              <SecurityView
                loading={loading}
                onAction={async (action) => {
                  setLoading(true)
                  try {
                    const result = await action()
                    setNotice({ type: 'success', text: result })
                  } catch (error) {
                    setNotice(toNotice(error))
                  } finally {
                    setLoading(false)
                  }
                }}
              />
            )}
          </div>

          <aside className="space-y-4">
            <StatusPanel backendStatus={backendStatus} user={user} recipesCount={recipes.length} />
            <ApiPanel />
          </aside>
        </section>
      </div>
    </main>
  )
}

function RecipesView(props: {
  backendStatus: 'checking' | 'online' | 'offline'
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
    <section className="space-y-4">
      <div className="rounded-lg border border-stone-300 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-emerald-700">Каталог</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-stone-950">Рецепты и заготовки</h1>
            <p className="mt-2 max-w-2xl text-stone-600">
              Авторизация подключена к backend. Рецепты сохранены локально, потому что в backend пока нет recipe endpoint’ов.
            </p>
            <p className="mt-3 text-sm text-stone-500">
              Всего: {props.total}. Backend: {props.backendStatus === 'checking' ? 'проверка' : props.backendStatus}.
            </p>
          </div>
          <button className="primary-button" onClick={props.onCreate} type="button">
            <Plus size={18} />
            Новый рецепт
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
            <input
              className="input pl-10"
              onChange={(event) => props.setQuery(event.target.value)}
              placeholder="Поиск по названию, ингредиентам, тегам"
              value={props.query}
            />
          </label>
          <select className="input" onChange={(event) => props.onCategoryChange(event.target.value)} value={props.category}>
            {props.categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {props.recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {props.recipes.length === 0 && (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">
          Ничего не найдено. Измените фильтр или создайте новый рецепт.
        </div>
      )}
    </section>
  )
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <article className="rounded-lg border border-stone-300 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">{recipe.category}</p>
          <h2 className="mt-1 text-xl font-semibold text-stone-950">{recipe.title}</h2>
        </div>
        <span className="rounded-md bg-stone-100 px-2.5 py-1 text-sm text-stone-700">{recipe.difficulty}</span>
      </div>
      <p className="mt-3 text-stone-600">{recipe.description}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm text-stone-700">
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1">
          <Clock size={15} />
          {recipe.cookTime} мин
        </span>
        <span className="rounded-md bg-stone-100 px-2.5 py-1">{recipe.portions} порц.</span>
        {recipe.tags.map((tag) => (
          <span className="rounded-md bg-amber-50 px-2.5 py-1" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Ингредиенты</h3>
          <ul className="mt-2 space-y-1 text-sm text-stone-600">
            {recipe.ingredients.map((item) => (
              <li className="flex gap-2" key={item}>
                <Check className="mt-0.5 shrink-0 text-emerald-700" size={15} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Шаги</h3>
          <ol className="mt-2 space-y-1 text-sm text-stone-600">
            {recipe.steps.map((item, index) => (
              <li key={item}>
                {index + 1}. {item}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  )
}

function CreateRecipeView({ onCreate }: { onCreate: (recipe: Recipe) => void }) {
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
    <section className="rounded-lg border border-stone-300 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-semibold">Создание рецепта</h1>
      <form className="mt-5 grid gap-4" onSubmit={submit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Название">
            <input className="input" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </Field>
          <Field label="Категория">
            <input className="input" required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          </Field>
        </div>
        <Field label="Описание">
          <textarea
            className="input min-h-24"
            required
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Сложность">
            <select
              className="input"
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
              className="input"
              min={1}
              type="number"
              value={form.cookTime}
              onChange={(event) => setForm({ ...form, cookTime: Number(event.target.value) })}
            />
          </Field>
          <Field label="Порции">
            <input
              className="input"
              min={1}
              type="number"
              value={form.portions}
              onChange={(event) => setForm({ ...form, portions: Number(event.target.value) })}
            />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ингредиенты, каждый с новой строки">
            <textarea
              className="input min-h-36"
              required
              value={form.ingredients}
              onChange={(event) => setForm({ ...form, ingredients: event.target.value })}
            />
          </Field>
          <Field label="Шаги приготовления, каждый с новой строки">
            <textarea className="input min-h-36" required value={form.steps} onChange={(event) => setForm({ ...form, steps: event.target.value })} />
          </Field>
        </div>
        <Field label="Теги через запятую">
          <input className="input" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
        </Field>
        <button className="primary-button w-fit" type="submit">
          <Plus size={18} />
          Сохранить рецепт
        </button>
      </form>
    </section>
  )
}

function AuthView(props: {
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
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <form className="rounded-lg border border-stone-300 bg-white p-5 shadow-sm" onSubmit={submit}>
        <div className="flex gap-2">
          <button
            className={`tab-button ${props.mode === 'login' ? 'tab-button-active' : ''}`}
            onClick={() => props.onModeChange('login')}
            type="button"
          >
            Вход
          </button>
          <button
            className={`tab-button ${props.mode === 'register' ? 'tab-button-active' : ''}`}
            onClick={() => props.onModeChange('register')}
            type="button"
          >
            Регистрация
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <Field label="Email">
            <input
              className="input"
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </Field>
          {props.mode === 'register' && (
            <Field label="Имя пользователя">
              <input
                className="input"
                minLength={3}
                required
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
              />
            </Field>
          )}
          <Field label="Пароль">
            <input
              className="input"
              minLength={props.mode === 'register' ? 8 : 6}
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </Field>
          <button className="primary-button w-fit" disabled={props.loading} type="submit">
            <KeyRound size={18} />
            {props.loading ? 'Отправка...' : props.mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-stone-300 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">OAuth</h2>
        <div className="mt-4 grid gap-2">
          <a className="secondary-button" href={api.telegramAuthUrl()}>
            Telegram
          </a>
          <a className="secondary-button" href={api.yandexAuthUrl()}>
            Yandex
          </a>
          <a className="secondary-button" href={api.vkAuthUrl()}>
            VK
          </a>
        </div>
        <p className="mt-4 text-xs leading-5 text-stone-500">
          API: {API_URL}
        </p>
      </div>
    </section>
  )
}

function ProfileView({ user, onSubmit }: { user: User; onSubmit: (updates: Partial<User>) => void }) {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email ?? '',
    avatar_url: user.avatar_url ?? '',
  })

  return (
    <form
      className="rounded-lg border border-stone-300 bg-white p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(form)
      }}
    >
      <h1 className="text-2xl font-semibold">Профиль</h1>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Имя пользователя">
          <input className="input" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
        </Field>
        <Field label="Email">
          <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </Field>
      </div>
      <Field label="Avatar URL">
        <input className="input" value={form.avatar_url} onChange={(event) => setForm({ ...form, avatar_url: event.target.value })} />
      </Field>
      <button className="primary-button mt-4 w-fit" type="submit">
        <Check size={18} />
        Сохранить профиль
      </button>
    </form>
  )
}

function SecurityView({ loading, onAction }: { loading: boolean; onAction: (action: () => Promise<string>) => void }) {
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' })
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [verifyToken, setVerifyToken] = useState('')

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <Panel title="Смена пароля" icon={<ShieldCheck size={19} />}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            onAction(async () => {
              const result = await api.changePassword(passwords)
              return result.message
            })
          }}
        >
          <input
            className="input"
            placeholder="Старый пароль"
            required
            type="password"
            value={passwords.old_password}
            onChange={(event) => setPasswords({ ...passwords, old_password: event.target.value })}
          />
          <input
            className="input"
            minLength={8}
            placeholder="Новый пароль"
            required
            type="password"
            value={passwords.new_password}
            onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })}
          />
          <button className="primary-button w-fit" disabled={loading} type="submit">
            Обновить
          </button>
        </form>
      </Panel>

      <Panel title="Email верификация" icon={<Mail size={19} />}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            onAction(async () => {
              const result = await api.resendVerification(email)
              return result.message
            })
          }}
        >
          <input className="input" placeholder="Email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <button className="secondary-button w-fit" disabled={loading} type="submit">
            Отправить письмо
          </button>
        </form>
        <form
          className="mt-3 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            onAction(async () => {
              const result = await api.verifyEmail(verifyToken)
              return result.message
            })
          }}
        >
          <input className="input" placeholder="Token из письма" required value={verifyToken} onChange={(event) => setVerifyToken(event.target.value)} />
          <button className="secondary-button w-fit" disabled={loading} type="submit">
            Подтвердить email
          </button>
        </form>
      </Panel>

      <Panel title="Восстановление пароля" icon={<RefreshCw size={19} />}>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            onAction(async () => {
              const result = await api.forgotPassword(email)
              return result.message
            })
          }}
        >
          <input className="input" placeholder="Email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <button className="secondary-button w-fit" disabled={loading} type="submit">
            Запросить сброс
          </button>
        </form>
        <form
          className="mt-3 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            onAction(async () => {
              const result = await api.resetPassword({ token, new_password: newPassword })
              return result.message
            })
          }}
        >
          <input className="input" placeholder="Reset token" required value={token} onChange={(event) => setToken(event.target.value)} />
          <input
            className="input"
            minLength={8}
            placeholder="Новый пароль"
            required
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <button className="secondary-button w-fit" disabled={loading} type="submit">
            Сбросить пароль
          </button>
        </form>
      </Panel>
    </section>
  )
}

function StatusPanel({
  backendStatus,
  recipesCount,
  user,
}: {
  backendStatus: 'checking' | 'online' | 'offline'
  recipesCount: number
  user: User | null
}) {
  const statusText = backendStatus === 'checking' ? 'Проверка' : backendStatus === 'online' ? 'Online' : 'Offline'

  return (
    <div className="rounded-lg border border-stone-300 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold">Состояние</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <InfoRow label="Backend" value={statusText} />
        <InfoRow label="Пользователь" value={user?.username ?? 'Гость'} />
        <InfoRow label="Провайдер" value={user?.provider ?? '-'} />
        <InfoRow label="Рецептов" value={String(recipesCount)} />
      </dl>
    </div>
  )
}

function ApiPanel() {
  const endpoints = [
    'POST /auth/register',
    'POST /auth/login',
    'POST /auth/refresh',
    'POST /auth/logout',
    'GET /auth/me',
    'PUT /auth/me',
    'POST /auth/change-password',
    'POST /auth/verify-email',
    'POST /auth/resend-verification',
    'POST /auth/forgot-password',
    'POST /auth/reset-password',
    'GET /auth/oauth/*',
  ]

  return (
    <div className="rounded-lg border border-stone-300 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold">Покрытые ручки</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {endpoints.map((endpoint) => (
          <span className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-700" key={endpoint}>
            {endpoint}
          </span>
        ))}
      </div>
    </div>
  )
}

function NavButton({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean
  children: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button className={`nav-button ${active ? 'nav-button-active' : ''}`} onClick={onClick} type="button">
      {icon}
      {children}
    </button>
  )
}

function NoticeBanner({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  const tone =
    notice.type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : notice.type === 'error'
        ? 'border-red-200 bg-red-50 text-red-900'
        : 'border-amber-200 bg-amber-50 text-amber-900'

  return (
    <div className={`mb-4 flex items-start justify-between gap-3 rounded-lg border p-3 ${tone}`}>
      <p className="text-sm">{notice.text}</p>
      <button className="text-sm font-semibold" onClick={onClose} type="button">
        Закрыть
      </button>
    </div>
  )
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-stone-700">
      {label}
      {children}
    </label>
  )
}

function Panel({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <div className="rounded-lg border border-stone-300 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-stone-500">{label}</dt>
      <dd className="truncate font-medium text-stone-900">{value}</dd>
    </div>
  )
}

function loadRecipes() {
  const raw = localStorage.getItem(recipeStorageKey)
  if (!raw) return starterRecipes

  try {
    const parsed = JSON.parse(raw) as Recipe[]
    return Array.isArray(parsed) ? parsed : starterRecipes
  } catch {
    return starterRecipes
  }
}

function readInitialTokens() {
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')

  if (accessToken && refreshToken) {
    const oauthTokens = { access_token: accessToken, refresh_token: refreshToken }
    storeTokens(oauthTokens)
    return oauthTokens
  }

  return getStoredTokens()
}

function hasOAuthCallback() {
  const params = new URLSearchParams(window.location.search)
  return Boolean(params.get('access_token') && params.get('refresh_token'))
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function splitComma(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toNotice(error: unknown): Notice {
  if (error instanceof ApiClientError) {
    return { type: 'error', text: error.message }
  }

  if (error instanceof Error) {
    return { type: 'error', text: error.message }
  }

  return { type: 'error', text: 'Неизвестная ошибка' }
}

export default App
