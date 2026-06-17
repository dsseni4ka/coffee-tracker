export function EspressoCup({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path className="steam-line" d="M45 15 C42 10, 48 5, 45 0" stroke="#8A7052" strokeWidth="2" strokeLinecap="round" />
      <path className="steam-line-delayed" d="M55 18 C52 13, 58 8, 55 3" stroke="#8A7052" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25 40 L75 40 L70 85 C69 92, 63 98, 55 98 L45 98 C37 98, 31 92, 30 85 Z" fill="#F0ECE6" stroke="#2C2520" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="50" cy="50" rx="22" ry="6" fill="url(#espressoCrema)" />
      <path d="M28.5 50 L71.5 50 L68 82 C67.5 87, 62 92, 55 92 L45 92 C38 92, 32.5 87, 32 82 Z" fill="url(#espressoLiquid)" />
      <path d="M74 50 C84 50, 86 70, 72 73" stroke="#2C2520" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M34 60 L32 80" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="50" cy="105" rx="36" ry="6" fill="#D5D0C9" stroke="#2C2520" strokeWidth="2" />
      <defs>
        <linearGradient id="espressoCrema" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C5A880" />
          <stop offset="50%" stopColor="#8A7052" />
          <stop offset="100%" stopColor="#6E5539" />
        </linearGradient>
        <linearGradient id="espressoLiquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#543C28" />
          <stop offset="100%" stopColor="#24140B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function CappuccinoCup({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path className="steam-line" d="M42 12 C39 7, 45 3, 42 0" stroke="#C5A880" strokeWidth="1.5" strokeLinecap="round" />
      <path className="steam-line-delayed" d="M50 15 C47 10, 53 5, 50 1" stroke="#C5A880" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 45 L85 45 L78 90 C76 98, 68 104, 50 104 L50 104 C32 104, 24 98, 22 90 Z" fill="url(#cappuccinoCeramic)" stroke="#2C2520" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="50" cy="46" rx="33" ry="9" fill="#FFFBF5" stroke="#2C2520" strokeWidth="2.5" />
      <path d="M44 43 C46 41, 54 41, 56 43 C54 45, 46 45, 44 43 Z" fill="#6A4E35" opacity="0.8" />
      <circle cx="50" cy="46" r="3" fill="#6A4E35" opacity="0.8" />
      <path d="M82 54 C95 54, 94 82, 79 84" stroke="#2C2520" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <ellipse cx="50" cy="109" rx="42" ry="5.5" fill="#E2DDD5" stroke="#2C2520" strokeWidth="2" />
      <defs>
        <linearGradient id="cappuccinoCeramic" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EBE2D5" />
          <stop offset="60%" stopColor="#D6C5B1" />
          <stop offset="100%" stopColor="#B2A08B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function LatteCup({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path className="steam-line" d="M48 10 C45 6, 51 3, 48 0" stroke="#D2B48C" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 25 L75 25 L65 105 L35 105 Z" fill="#FDFBF7" fillOpacity="0.25" stroke="#2C2520" strokeWidth="3" strokeLinejoin="round" />
      <path d="M26 35 L74 35 L71 48 L29 48 Z" fill="#FFFDF8" opacity="0.95" />
      <path d="M29 48 L71 48 L67 80 L33 80 Z" fill="url(#latteMiddle)" />
      <path d="M33 80 L67 80 L65 104 L35 104 Z" fill="url(#latteBase)" />
      <path d="M31 35 L37 100" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      <path d="M35 104 L65 104 L63 110 L37 110 Z" fill="#EBE5DC" stroke="#2C2520" strokeWidth="2" />
      <defs>
        <linearGradient id="latteMiddle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E6D3BE" />
          <stop offset="100%" stopColor="#AF8C68" />
        </linearGradient>
        <linearGradient id="latteBase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#AF8C68" />
          <stop offset="100%" stopColor="#604128" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function ColdBrewCup({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 20 L72 20 L66 108 L34 108 Z" fill="#FDFBF7" fillOpacity="0.1" stroke="#2C2520" strokeWidth="3" strokeLinejoin="round" />
      <path d="M29 32 L71 32 L66.5 106 L33.5 106 Z" fill="url(#coldBrewGradient)" />
      <rect x="36" y="44" width="16" height="16" rx="3" transform="rotate(22 36 44)" fill="#FFFFFF" fillOpacity="0.35" stroke="#2C2520" strokeWidth="1.5" />
      <rect x="52" y="68" width="14" height="14" rx="2" transform="rotate(-15 52 68)" fill="#FFFFFF" fillOpacity="0.3" stroke="#2C2520" strokeWidth="1.5" />
      <ellipse cx="61" cy="40" rx="1.5" ry="4" fill="#FFFFFF" opacity="0.7" />
      <ellipse cx="38" cy="85" rx="1" ry="3" fill="#FFFFFF" opacity="0.6" />
      <path d="M34 108 L66 108 L65 112 L35 112 Z" fill="#E5E5E5" stroke="#2C2520" strokeWidth="2" />
      <defs>
        <linearGradient id="coldBrewGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4E2B12" />
          <stop offset="50%" stopColor="#2D1302" />
          <stop offset="100%" stopColor="#120400" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function MatchaCup({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path className="steam-line" d="M40 18 C38 12, 44 8, 40 3" stroke="#87A987" strokeWidth="1.5" strokeLinecap="round" />
      <path className="steam-line-delayed" d="M48 20 C46 14, 52 10, 48 5" stroke="#87A987" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 50 C10 82, 18 102, 50 102 C82 102, 90 82, 90 50 Z" fill="url(#matchaCeramic)" stroke="#2C2520" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="50" cy="52" rx="38" ry="9" fill="#5F8D58" stroke="#2C2520" strokeWidth="2.5" />
      <path d="M22 51 C32 56, 68 56, 78 51" stroke="#84B07D" strokeWidth="2" strokeLinecap="round" />
      <circle cx="34" cy="52" r="1.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="66" cy="53" r="1" fill="#FFFFFF" opacity="0.8" />
      <path d="M38 102 L62 102 L58 108 L42 108 Z" fill="#8E7E72" stroke="#2C2520" strokeWidth="2" />
      <defs>
        <linearGradient id="matchaCeramic" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#938174" />
          <stop offset="100%" stopColor="#4F443E" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const CUP_COMPONENTS = [EspressoCup, CappuccinoCup, LatteCup, ColdBrewCup, MatchaCup]

export function CoffeeCupIcon({ index, className = '' }) {
  const Cup = CUP_COMPONENTS[index] ?? CappuccinoCup
  return <Cup className={className} />
}

export function CupStickerImage({ src, alt, className = '' }) {
  return (
    <img
      className={`sipspend-drink-sticker${className ? ` ${className}` : ''}`}
      src={src}
      alt={alt}
      draggable={false}
    />
  )
}

export function StarSticker({ className = '' }) {
  return (
    <svg
      className={`sipspend-star-sticker${className ? ` ${className}` : ''}`}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M24 4.8l4.9 9.9 10.9 1.6-7.9 7.7 1.9 10.9L24 29.6l-9.8 5.4 1.9-10.9-7.9-7.7 10.9-1.6L24 4.8z"
        fill="url(#starStickerFill)"
        stroke="#FFFFFF"
        strokeWidth="3.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        paintOrder="stroke fill"
      />
      <ellipse cx="18.5" cy="16" rx="3.8" ry="2.8" fill="#FFFFFF" opacity="0.62" transform="rotate(-22 18.5 16)" />
      <circle cx="31.5" cy="13.5" r="1.3" fill="#FFFFFF" opacity="0.75" />
      <circle cx="34.5" cy="18" r="0.85" fill="#FFF4C2" opacity="0.9" />
      <path
        d="M11 11l1.8 1.8M37 9l-1.5 1.8"
        stroke="#FFD866"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <defs>
        <linearGradient id="starStickerFill" x1="10" y1="6" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE98A" />
          <stop offset="50%" stopColor="#F5C842" />
          <stop offset="100%" stopColor="#E8A838" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function HeartSticker({ className = '' }) {
  return (
    <svg
      className={`sipspend-heart-sticker${className ? ` ${className}` : ''}`}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M24 40.5s-14.5-9.2-14.5-18.8C9.5 14.8 13.6 11 18.4 11c2.8 0 5.3 1.4 6.6 3.6.3.5 1.1.5 1.4 0 1.3-2.2 3.8-3.6 6.6-3.6 4.8 0 8.9 3.8 8.9 10.7C36.5 31.3 24 40.5 24 40.5z"
        fill="url(#heartStickerFill)"
        stroke="#2C2520"
        strokeWidth="2.25"
        strokeLinejoin="round"
      />
      <ellipse cx="17.5" cy="18" rx="4" ry="3.2" fill="#FFFFFF" opacity="0.55" transform="rotate(-18 17.5 18)" />
      <circle cx="33" cy="15" r="1.4" fill="#FFFFFF" opacity="0.7" />
      <circle cx="36.5" cy="19.5" r="0.9" fill="#FFD4D4" opacity="0.85" />
      <defs>
        <linearGradient id="heartStickerFill" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFB8B8" />
          <stop offset="55%" stopColor="#F08080" />
          <stop offset="100%" stopColor="#E85D6A" />
        </linearGradient>
      </defs>
    </svg>
  )
}
