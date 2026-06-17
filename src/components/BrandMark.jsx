export default function BrandMark({ className = '', light = false }) {
  const stroke = light ? '#F5F5F0' : '#0033A0'

  return (
    <svg
      className={className}
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="60" cy="52" r="28" stroke={stroke} strokeWidth="3.5" />
      <circle cx="50" cy="48" r="3" fill={stroke} />
      <circle cx="70" cy="48" r="3" fill={stroke} />
      <path d="M44 42 L50 46 M76 42 L70 46" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 58 Q60 64 68 58" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M38 56 Q32 40 40 28" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M82 56 Q88 40 80 28" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path
        d="M78 82 C78 82 88 95 95 110 C98 116 92 122 86 118 C80 114 72 108 60 108 C48 108 40 114 34 118 C28 122 22 116 25 110 C32 95 42 82 42 82"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M88 118 L102 132 M102 132 L96 136 M102 132 L108 126" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M82 108 L94 120" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
