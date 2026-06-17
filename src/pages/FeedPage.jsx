import { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { addPost, getPosts } from '../db/database'

import PageHeader from '../components/PageHeader'

export default function FeedPage() {
  const [posts, setPosts] = useState([])
  const [caption, setCaption] = useState('')
  const [photo, setPhoto] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef(null)

  const load = async () => {
    setPosts(await getPosts())
  }

  useEffect(() => {
    load()
  }, [])

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!photo) return
    await addPost({ caption, photo })
    setCaption('')
    setPhoto(null)
    setShowForm(false)
    load()
  }

  return (
    <>
      <PageHeader
        title="Coffee feed"
        subtitle="Share your coffee ceremonies"
      />

      {!showForm ? (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: 24 }}
          onClick={() => setShowForm(true)}
        >
          + Share a moment
        </button>
      ) : (
        <form className="card" style={{ marginBottom: 24 }} onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span className="section-label" style={{ margin: 0 }}>New post</span>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            style={{ marginBottom: 12 }}
          />

          {photo && (
            <img
              src={photo}
              alt="Preview"
              style={{ width: '100%', borderRadius: 8, marginBottom: 12, maxHeight: 200, objectFit: 'cover' }}
            />
          )}

          <div className="form-group">
            <textarea
              placeholder="Caption your coffee ceremony..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!photo}>
            Post
          </button>
        </form>
      )}

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📷</div>
          <p>No posts yet. Share your first brew!</p>
        </div>
      ) : (
        posts.map((post) => (
          <article key={post.id} className="card feed-post" style={{ padding: 0 }}>
            {post.photo && <img src={post.photo} alt="" />}
            {post.caption && <p className="feed-post-caption">{post.caption}</p>}
            <p className="feed-post-time">
              {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
            </p>
          </article>
        ))
      )}
    </>
  )
}
