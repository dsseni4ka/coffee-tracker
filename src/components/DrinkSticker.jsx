import { getDrinkType } from '../data/drinkTypes'
import DrinkIcon from './icons/DrinkIcon'

export default function DrinkSticker({
  drinkType,
  size = 'md',
  cutout = false,
  emoji = false,
  className = '',
}) {
  const type = getDrinkType(drinkType)
  if (!type) return null

  const iconSize =
    size === 'collage' ? 22
    : size === 'cell' ? 28
    : size === 'lg' ? 'lg'
    : size === 'sm' ? 'sm'
    : size === 'xs' ? 'xs'
    : 'md'

  const showEmoji = emoji && type.emoji

  return (
    <span
      className={[
        'drink-sticker',
        `drink-sticker--${size}`,
        cutout && 'drink-sticker--cutout',
        showEmoji && 'drink-sticker--emoji',
        className,
      ].filter(Boolean).join(' ')}
      style={{ background: type.stickerBg }}
      title={type.label}
    >
      {showEmoji ? (
        <span className="drink-sticker-emoji" aria-hidden>
          {type.emoji}
        </span>
      ) : (
        <DrinkIcon drinkType={type.id} size={iconSize} />
      )}
    </span>
  )
}
