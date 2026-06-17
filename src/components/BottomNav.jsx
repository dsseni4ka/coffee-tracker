import { NavLink } from 'react-router-dom'
import {
  CalendarNavIcon,
  CommunityNavIcon,
  MapNavIcon,
  ProfileNavIcon,
} from './icons/NavIcons'

const NAV_ITEMS = [
  { to: '/', Icon: CalendarNavIcon, label: 'Calendar' },
  { to: '/map', Icon: MapNavIcon, label: 'Map' },
  { to: '/community', Icon: CommunityNavIcon, label: 'Community' },
  { to: '/profile', Icon: ProfileNavIcon, label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {NAV_ITEMS.map(({ to, Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-item-icon" aria-hidden>
            <Icon size="md" />
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
