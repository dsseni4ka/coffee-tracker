const SIZES = { xs: 12, sm: 18, md: 24, lg: 32 }

const PATHS = {
  espresso: (
    <>
      <path d="M8 9h8v7a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16 10h1.2a1.8 1.8 0 0 1 0 3.6H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 6.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  'double-espresso': (
    <>
      <path d="M7 9h7v7a2.5 2.5 0 0 1-2.5 2.5H9.5A2.5 2.5 0 0 1 7 16V9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 9h7v7a2.5 2.5 0 0 1-2.5 2.5H16.5A2.5 2.5 0 0 1 14 16V9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  americano: (
    <>
      <path d="M8 8h8v8a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 9h1.5a2 2 0 0 1 0 4H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  latte: (
    <>
      <path d="M9 6h6l1 12a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3L9 6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.5 11h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  cappuccino: (
    <>
      <path d="M8 10h8v6a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 10c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  'flat-white': (
    <>
      <path d="M8 9h8v7a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <ellipse cx="12" cy="9.5" rx="4" ry="1.2" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  'iced-latte': (
    <>
      <path d="M9 6h6l1 12a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3L9 6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.5 11h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="10" y="14" width="2" height="2" rx="0.4" fill="currentColor" opacity="0.5" />
      <rect x="13" y="15" width="2" height="2" rx="0.4" fill="currentColor" opacity="0.5" />
    </>
  ),
  'iced-cappuccino': (
    <>
      <path d="M8 10h8v6a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 10c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="10" y="14" width="2" height="2" rx="0.4" fill="currentColor" opacity="0.5" />
    </>
  ),
  'cold-brew': (
    <>
      <path d="M9 5h6v14a2.5 2.5 0 0 1-2.5 2.5h-1A2.5 2.5 0 0 1 9 19V5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 8h4M10 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="10" y="3" width="4" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
    </>
  ),
  drip: (
    <>
      <path d="M12 4v2M12 6c-2 0-3.5 1.5-3.5 3.5V18h7V9.5C15.5 7.5 14 6 12 6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.5 18h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  matcha: (
    <>
      <path d="M7 10h10l-1.5 8H8.5L7 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 7h6l-0.5 3H9.5L9 7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  'matcha-latte': (
    <>
      <path d="M9 6h6l1 12a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3L9 6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 10h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  'iced-matcha': (
    <>
      <path d="M7 10h10l-1.5 8H8.5L7 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 7h6l-0.5 3H9.5L9 7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="10" y="14" width="2" height="2" rx="0.4" fill="currentColor" opacity="0.5" />
    </>
  ),
}

export default function DrinkIcon({ drinkType, size = 'md', className = '' }) {
  const px = typeof size === 'number' ? size : (SIZES[size] ?? 24)
  const content = PATHS[drinkType] ?? PATHS.latte

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {content}
    </svg>
  )
}
