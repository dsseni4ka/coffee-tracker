const SIZES = { xs: 14, sm: 18, md: 24, lg: 32 }

export default function Icon({ children, size = 'md', className = '', ...props }) {
  const px = typeof size === 'number' ? size : (SIZES[size] ?? 24)
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props}
    >
      {children}
    </svg>
  )
}

export function CalendarNavIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 9.5h18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1.25" fill="currentColor" />
      <circle cx="12" cy="14" r="1.25" fill="currentColor" />
      <circle cx="16" cy="14" r="1.25" fill="currentColor" />
    </Icon>
  )
}

export function MapNavIcon(props) {
  return (
    <Icon {...props}>
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </Icon>
  )
}

export function CommunityNavIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="9" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16.5" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M4.5 18.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5M14 18.5c0-1.8 1.5-3.2 3.2-3.2.9 0 1.7.4 2.3 1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Icon>
  )
}

export function ProfileNavIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Icon>
  )
}

export function PinIcon(props) {
  return (
    <Icon {...props}>
      <path
        d="M12 21s5-4.5 5-9.5a5 5 0 1 0-10 0c0 5 5 9.5 5 9.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </Icon>
  )
}

export function CameraIcon(props) {
  return (
    <Icon {...props}>
      <path
        d="M4 8.5h3l1.5-2h7l1.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.75" />
    </Icon>
  )
}

export function CupEmptyIcon(props) {
  return (
    <Icon {...props}>
      <path
        d="M7 10h10v6a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-6z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M17 11h1.5a2 2 0 0 1 0 4H17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M9 6l1-2h4l1 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </Icon>
  )
}

export function PlusIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  )
}

export function SettingsIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Icon>
  )
}

export function ChevronLeftIcon(props) {
  return (
    <Icon {...props}>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  )
}

export function ChevronRightIcon(props) {
  return (
    <Icon {...props}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  )
}

export function StatsIcon(props) {
  return (
    <Icon {...props}>
      <path
        d="M5 19V9M12 19V5M19 19v-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Icon>
  )
}
