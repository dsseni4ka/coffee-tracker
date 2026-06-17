import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  CalendarNavIcon,
  MapNavIcon,
  StatsIcon,
} from './icons/NavIcons'

const NAV_ITEMS = [
  { to: '/', Icon: CalendarNavIcon, label: 'Calendar', match: (path) => path === '/' },
  { to: '/map', Icon: MapNavIcon, label: 'Map', match: (path) => path.startsWith('/map') },
  { to: '/profile', Icon: StatsIcon, label: 'Budget', match: (path) => path.startsWith('/profile') },
]

function getActiveIndex(pathname) {
  const index = NAV_ITEMS.findIndex(({ match }) => match(pathname))
  return index >= 0 ? index : 0
}

export default function BottomNav() {
  const { pathname } = useLocation()
  const navRef = useRef(null)
  const itemRefs = useRef([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })
  const activeIndex = getActiveIndex(pathname)

  useLayoutEffect(() => {
    const nav = navRef.current
    const item = itemRefs.current[activeIndex]
    if (!nav || !item) return

    const update = () => {
      const navRect = nav.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()
      setIndicator({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
        ready: true,
      })
    }

    update()

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(update)
      : null

    observer?.observe(nav)
    observer?.observe(item)
    window.addEventListener('resize', update)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [activeIndex, pathname])

  return (
    <nav className="bottom-nav" ref={navRef} aria-label="Main">
      <span
        className={`bottom-nav-indicator${indicator.ready ? ' bottom-nav-indicator--ready' : ''}`}
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
        }}
        aria-hidden
      />
      {NAV_ITEMS.map(({ to, Icon, label }, index) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          ref={(el) => { itemRefs.current[index] = el }}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-item-icon" aria-hidden>
            <Icon size="md" />
          </span>
          <span className="nav-item-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
