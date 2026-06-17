import { Outlet } from 'react-router-dom'
import AppTopBar from './AppTopBar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="app-shell">
      <AppTopBar />
      <main className="app-main app-main--no-fab app-main--with-topbar">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
