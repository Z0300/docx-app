import {LogOut, Menu, Moon, Sun} from 'lucide-react'
import {Link, Outlet, useNavigate, useRouter} from '@tanstack/react-router'
import {useEffect} from 'react'
import {env} from '@/config/env'
import {navigation} from '@/config/navigation'
import {useAuth} from '@/hooks/useAuth'
import {useSessionExpiry} from '@/hooks/useSessionExpiry'
import {useAuthStore} from '@/stores/authStore'
import {useThemeStore} from '@/stores/themeStore'
import {useQueryClient} from '@tanstack/react-query'

const DRAWER_ID = 'app-drawer'

export function AppShell() {
    useSessionExpiry()
    const {user, isAuthenticated, logout, hasAnyRole} = useAuth()
    const router = useRouter()
    const navigate = useNavigate()
    const logoutReason = useAuthStore((s) => s.logoutReason)
    const queryClient = useQueryClient()
    const theme = useThemeStore((s) => s.theme)
    const toggleTheme = useThemeStore((s) => s.toggle)

    const visibleNav = navigation.filter((item) => hasAnyRole(...(item.roles ?? [])))

    const signOut = () => {
        logout()
        // Cached data belongs to the previous user — never let it leak into the next session.
        queryClient.clear()
    }

    // The route guard only runs on navigation. This effect covers a session that ends while the user is
    // already on a page (token expiry, a 401, or Sign out): send them to login, and bring them back after
    // an involuntary logout.
    //
    // Two pitfalls this avoids, both of which cause an infinite redirect loop in practice:
    //  1. Rendering <Navigate search={{ redirect: ... }} /> — it compares `search` by reference, so a
    //     fresh object literal on every render makes it re-navigate forever.
    //  2. Depending on a *reactive* `location.href` (e.g. from `useLocation()`). The navigate call below
    //     changes the URL, which would re-run the effect with the new (now /login) href, wrapping it as
    //     `redirect=` inside itself on every run — the URL grows a new encoding layer each time until
    //     React throws "Maximum update depth exceeded". Reading `router.state.location.href` *inside* the
    //     effect (not as a dependency) captures it once, at the moment the session actually ends.
    useEffect(() => {
        if (!isAuthenticated) {
            const from = router.state.location.href
            void navigate({to: '/login', replace: true, search: logoutReason ? {redirect: from} : {}})
        }
    }, [isAuthenticated, logoutReason, navigate, router])

    if (!isAuthenticated) return null

    return (
        <div className="drawer lg:drawer-open">
            <input id={DRAWER_ID} type="checkbox" className="drawer-toggle"/>

            <div className="drawer-content bg-base-200 flex min-h-screen flex-col">
                <header
                    className="bg-base-100 border-base-300 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-4">
                    <label htmlFor={DRAWER_ID} className="btn btn-ghost btn-square btn-sm lg:hidden"
                           aria-label="Open navigation">
                        <Menu size={18}/>
                    </label>
                    <div className="flex-1"/>

                    <button
                        type="button"
                        className="btn btn-ghost btn-square btn-sm"
                        onClick={toggleTheme}
                        aria-label={theme === 'app-light' ? 'Switch to dark theme' : 'Switch to light theme'}
                    >
                        {theme === 'app-light' ? <Moon size={18}/> : <Sun size={18}/>}
                    </button>

                    <div className="dropdown dropdown-end">
                        <button type="button" tabIndex={0} className="btn btn-ghost btn-sm gap-2">
              <span
                  className="bg-primary text-primary-content grid size-6 place-items-center rounded-full text-xs font-semibold">
                {user?.userName.charAt(0).toUpperCase()}
              </span>
                            <span className="hidden sm:inline">{user?.userName}</span>
                        </button>
                        <div tabIndex={0}
                             className="dropdown-content bg-base-100 border-base-300 z-40 mt-2 w-60 rounded-box border p-3 shadow-lg">
                            <p className="font-medium">{user?.userName}</p>
                            <p className="text-base-content/60 mb-3 text-xs">{user?.roles.join(', ') || 'No roles assigned'}</p>
                            <button type="button" className="btn btn-sm btn-block justify-start" onClick={signOut}>
                                <LogOut size={16}/> Sign out
                            </button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
                    <Outlet/>
                </main>
            </div>

            <div className="drawer-side z-40">
                <label htmlFor={DRAWER_ID} aria-label="Close navigation" className="drawer-overlay"/>
                <aside className="bg-base-100 border-base-300 flex min-h-full w-64 flex-col border-r">
                    <div
                        className="flex h-14 items-center px-5 text-lg font-semibold tracking-tight">{env.appName}</div>
                    <nav aria-label="Main">
                        <ul className="menu w-full gap-0.5 px-3">
                            {visibleNav.map(({label, to, icon: Icon}) => (
                                <li key={to}>
                                    <Link to={to} activeOptions={{exact: to === '/'}}
                                          activeProps={{className: 'nav-active'}}>
                                        <Icon size={17} aria-hidden="true"/>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </div>
    )
}
