import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getAllDrinks, getPosts } from '../db/database'
import { getDrinkType } from '../data/drinkTypes'
import { computeFavoriteCafes } from '../utils/favoriteCafes'
import { useProfile } from '../hooks/useProfile'
import CommunityThreadPost from '../components/CommunityThreadPost'
import ProfileCalendar from '../components/ProfileCalendar'
import DrinkSticker from '../components/DrinkSticker'

const TABS = [
  { id: 'posts', label: 'Posts' },
  { id: 'calendar', label: 'Calendar' },
]

function formatPostText(post) {
  const parts = []
  if (post.caption?.trim()) parts.push(post.caption.trim())
  if (post.cafeName?.trim()) parts.push(`📍 ${post.cafeName.trim()}`)
  return parts.join('\n')
}

export default function ProfilePage() {
  const { username, setUsername, bio, setBio, photo, setPhoto, handle } = useProfile()
  const [tab, setTab] = useState('posts')
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(username)
  const [draftBio, setDraftBio] = useState(bio)
  const [drinks, setDrinks] = useState([])
  const [posts, setPosts] = useState([])
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    const [allDrinks, allPosts] = await Promise.all([getAllDrinks(), getPosts()])
    setDrinks(allDrinks)
    setPosts(allPosts)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const drinksByDate = useMemo(() => {
    const map = {}
    for (const d of drinks) {
      if (!map[d.dateKey]) map[d.dateKey] = []
      map[d.dateKey].push(d)
    }
    return map
  }, [drinks])

  const profileStats = useMemo(() => {
    const totalCups = drinks.length
    const typeCounts = {}
    for (const d of drinks) {
      typeCounts[d.drinkType] = (typeCounts[d.drinkType] ?? 0) + 1
    }
    const topTypeId = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    const topCafe = computeFavoriteCafes(drinks)[0]

    return {
      totalCups,
      favoriteDrink: topTypeId ? getDrinkType(topTypeId) : null,
      favoriteCafe: topCafe?.name ?? null,
    }
  }, [drinks])

  const userThreadPosts = posts.map((post) => ({
    id: `user-${post.id}`,
    username: handle,
    displayName: username,
    community: null,
    avatarColor: '#8b6f47',
    text: formatPostText(post),
    images: post.photo ? [post.photo] : [],
    timestamp: new Date(post.timestamp).toISOString(),
    likes: 0,
    comments: 0,
    reposts: 0,
    shares: 0,
  }))

  function startEdit() {
    setDraftName(username)
    setDraftBio(bio)
    setEditing(true)
  }

  function saveEdit() {
    setUsername(draftName)
    setBio(draftBio)
    setEditing(false)
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const initial = (username?.trim()?.[0] ?? 'G').toUpperCase()

  return (
    <div className="profile-page">
      <header className="threads-profile-header">
        <div className="threads-profile-identity">
          {editing ? (
            <input
              className="threads-profile-name-input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              maxLength={32}
              aria-label="Display name"
            />
          ) : (
            <h1 className="threads-profile-name">{username}</h1>
          )}
          <p className="threads-profile-handle">@{handle}</p>
        </div>

        <div className="threads-profile-avatar-wrap">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            hidden
          />
          <button
            type="button"
            className="threads-profile-avatar-btn"
            onClick={() => editing && fileRef.current?.click()}
            disabled={!editing}
            aria-label="Profile photo"
          >
            {photo ? (
              <img src={photo} alt="" className="threads-profile-avatar-img" />
            ) : (
              <span className="threads-profile-avatar-fallback">{initial}</span>
            )}
          </button>
          {editing && (
            <button
              type="button"
              className="threads-profile-avatar-add"
              onClick={() => fileRef.current?.click()}
              aria-label="Change photo"
            >
              +
            </button>
          )}
        </div>
      </header>

      <div className="threads-profile-bio">
        {editing ? (
          <textarea
            className="threads-profile-bio-input"
            value={draftBio}
            onChange={(e) => setDraftBio(e.target.value)}
            placeholder="Tell people about your coffee life…"
            rows={3}
            maxLength={160}
          />
        ) : (
          <p className="threads-profile-bio-text">
            {bio || 'Coffee lover · log your cups and share your favourite spots.'}
          </p>
        )}
      </div>

      <ul className="threads-profile-stats" aria-label="Coffee summary">
        <li>
          <strong>{profileStats.totalCups}</strong>
          <span>cups logged</span>
        </li>
        <li>
          <strong>
            {profileStats.favoriteCafe ? (
              profileStats.favoriteCafe
            ) : (
              '—'
            )}
          </strong>
          <span>favourite café</span>
        </li>
        <li>
          <strong className="threads-profile-stat-drink">
            {profileStats.favoriteDrink ? (
              <>
                <DrinkSticker drinkType={profileStats.favoriteDrink.id} size="xs" cutout emoji />
                {profileStats.favoriteDrink.label}
              </>
            ) : (
              '—'
            )}
          </strong>
          <span>favourite drink</span>
        </li>
      </ul>

      <div className="threads-profile-actions">
        {editing ? (
          <>
            <button type="button" className="threads-profile-action-btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="threads-profile-action-btn threads-profile-action-btn--primary"
              onClick={saveEdit}
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button type="button" className="threads-profile-action-btn" onClick={startEdit}>
              Edit profile
            </button>
            <button
              type="button"
              className="threads-profile-action-btn"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: username, text: bio || 'My coffee tracker profile' })
                }
              }}
            >
              Share profile
            </button>
          </>
        )}
      </div>

      <nav className="threads-profile-tabs" aria-label="Profile sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`threads-profile-tab${tab === item.id ? ' active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="threads-profile-content">
        {tab === 'posts' && (
          userThreadPosts.length === 0 ? (
            <p className="threads-profile-empty">
              No posts yet. Share a moment from Community to show it here.
            </p>
          ) : (
            <div className="threads-profile-posts">
              {userThreadPosts.map((post) => (
                <CommunityThreadPost key={post.id} post={post} />
              ))}
            </div>
          )
        )}

        {tab === 'calendar' && <ProfileCalendar drinksByDate={drinksByDate} />}
      </div>
    </div>
  )
}
