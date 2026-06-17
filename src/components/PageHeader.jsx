import BrandMark from './BrandMark'

export default function PageHeader({ greeting, title, subtitle, hero = false }) {
  if (hero) {
    return (
      <header className="brand-hero">
        <div className="brand-hero-cream">
          <p className="brand-greeting">{greeting ?? 'Hi Friend!'}</p>
          <h1 className="brand-title">{title}</h1>
          {subtitle && <p className="brand-subtitle">{subtitle}</p>}
          <p className="brand-tagline">come for the brew, stay for the vibes</p>
        </div>
        <div className="brand-hero-blue">
          <BrandMark className="brand-hero-mark" light />
        </div>
      </header>
    )
  }

  return (
    <header className="page-header">
      <p className="page-header-greeting">{greeting ?? 'Hi Friend!'}</p>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}
