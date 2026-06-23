// ===================
// shell.tsx
//
// Root application shell with sidebar navigation, header,
// and content outlet
//
// Renders a collapsible sidebar with NavLink items
// (Dashboard, Threats, Models), a mobile hamburger menu
// toggle with overlay dismiss, a header showing the current
// page title, and a main content area wrapped in
// ErrorBoundary and Suspense. Sidebar collapsed state
// persists via the Zustand UIStore. ShellErrorFallback
// displays caught errors and ShellLoading shows a loading
// placeholder during lazy route resolution
// ===================

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import {
  LuActivity,
  LuChevronLeft,
  LuChevronRight,
  LuCpu,
  LuLayoutDashboard,
  LuMenu,
  LuShield,
} from 'react-icons/lu'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/config'
import { useUIStore } from '@/core/lib'
import styles from './shell.module.scss'

const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LuLayoutDashboard },
  { path: ROUTES.THREATS, label: 'Threats', icon: LuShield },
  { path: ROUTES.MODELS, label: 'Models', icon: LuCpu },
]

function ShellErrorFallback({ error }: { error: unknown }): React.ReactElement {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div className={styles.error}>
      <h2>Something went wrong</h2>
      <pre>{message}</pre>
    </div>
  )
}

function ShellLoading(): React.ReactElement {
  return <div className={styles.loading}>Loading...</div>
}

function getPageTitle(pathname: string): string {
  const item = NAV_ITEMS.find((i) => i.path === pathname)
  return item?.label ?? 'Dashboard'
}

export function Shell(): React.ReactElement {
  const location = useLocation()
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed } =
    useUIStore()

  const pageTitle = getPageTitle(location.pathname)

  return (
    <div className={styles.shell}>
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''} ${sidebarCollapsed ? styles.collapsed : ''}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.logoMark}>
              <LuShield />
            </span>
            <div className={styles.brandText}>
              <span className={styles.logo}>
                {sidebarCollapsed ? 'TM' : 'Threat Monitor'}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={toggleSidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <LuChevronRight /> : <LuChevronLeft />}
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => sidebarOpen && toggleSidebar()}
            >
              <item.icon className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={toggleSidebar}
          onKeyDown={(e) => e.key === 'Escape' && toggleSidebar()}
          aria-label="Close sidebar"
        />
      )}

      <div
        className={`${styles.main} ${sidebarCollapsed ? styles.collapsed : ''}`}
      >
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <LuMenu />
            </button>
            <div className={styles.titleBlock}>
              <span className={styles.kicker}>Security Ops</span>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.livePill}>
              <LuActivity />
              <span>Live detection</span>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <ErrorBoundary FallbackComponent={ShellErrorFallback}>
            <Suspense fallback={<ShellLoading />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
