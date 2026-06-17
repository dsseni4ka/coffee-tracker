import { format } from 'date-fns'

function ThreadActionIcon({ children }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      {children}
    </svg>
  )
}

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

export default function CommunityThreadPost({ post }) {
  const dateLabel = format(new Date(post.timestamp), 'dd.MM.yyyy')

  return (
    <article className="thread-post">
      <header className="thread-post-header">
        <div
          className="thread-post-avatar"
          style={{ backgroundColor: post.avatarColor }}
          aria-hidden
        >
          {post.displayName[0]}
        </div>
        <div className="thread-post-meta">
          <div className="thread-post-names">
            <span className="thread-post-username">{post.username}</span>
            {post.community && (
              <>
                <span className="thread-post-chevron" aria-hidden>›</span>
                <span className="thread-post-community">{post.community}</span>
              </>
            )}
          </div>
          <time className="thread-post-date" dateTime={post.timestamp}>
            {dateLabel}
          </time>
        </div>
        <button type="button" className="thread-post-menu" aria-label="More options">
          ···
        </button>
      </header>

      {post.text && (
        <p className="thread-post-text">
          {post.text.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < post.text.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      )}

      {post.images?.length > 0 && (
        <div
          className={`thread-post-gallery${post.images.length > 1 ? ' thread-post-gallery--scroll' : ''}`}
          tabIndex={post.images.length > 1 ? 0 : undefined}
          aria-label={post.images.length > 1 ? 'Photo carousel' : undefined}
        >
          {post.images.map((src, i) => (
            <div key={src} className="thread-post-photo-wrap">
              <img src={src} alt="" className="thread-post-photo" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      <footer className="thread-post-actions">
        <button type="button" className="thread-post-action" aria-label={`${post.likes} likes`}>
          <ThreadActionIcon>
            <path
              d="M12 21s-6.2-4.35-8.5-8.1C1.7 9.9 3.2 6.5 6.4 5.6c1.8-.5 3.6.2 4.6 1.6 1-1.4 2.8-2.1 4.6-1.6 3.2.9 4.7 4.3 2.9 7.3C18.2 16.65 12 21 12 21z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </ThreadActionIcon>
          <span>{formatCount(post.likes)}</span>
        </button>
        <button type="button" className="thread-post-action" aria-label={`${post.comments} comments`}>
          <ThreadActionIcon>
            <path
              d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4H6l-3.5 3v-4.1A8.4 8.4 0 1 1 21 11.5z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </ThreadActionIcon>
          <span>{formatCount(post.comments)}</span>
        </button>
        <button type="button" className="thread-post-action" aria-label={`${post.reposts} reposts`}>
          <ThreadActionIcon>
            <path
              d="M17 3l4 4-4 4M7 21l-4-4 4-4M21 7H10M3 17h11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </ThreadActionIcon>
          <span>{formatCount(post.reposts)}</span>
        </button>
        <button type="button" className="thread-post-action" aria-label={`${post.shares} shares`}>
          <ThreadActionIcon>
            <path
              d="M22 3L11 14M22 3l-7 18-4-7-7-4 18-7z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </ThreadActionIcon>
          <span>{formatCount(post.shares)}</span>
        </button>
      </footer>
    </article>
  )
}
