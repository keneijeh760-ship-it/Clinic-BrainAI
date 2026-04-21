import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { TopNav } from './TopNav'
import { Footer } from './Footer'

/**
 * Wraps every authenticated route. Provides the sticky TopNav, animated page
 * transitions (via AnimatePresence + PageShell), and the footer.
 */
export function AppShell() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-surface-soft">
      <TopNav />
      <AnimatePresence mode="wait">
        <div key={location.pathname} className="flex-1">
          <Outlet />
        </div>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
