import { useEffect, useState } from 'react'
import { getPosts } from '../db/database'
import { COMMUNITY_SEED_POSTS } from '../data/communitySeedPosts'
import CommunityThreadPost from '../components/CommunityThreadPost'
import ShareMomentSheet from '../components/ShareMomentSheet'

function formatPostText(post) {
  const parts = []
  if (post.caption?.trim()) parts.push(post.caption.trim())
  if (post.cafeName?.trim()) parts.push(`📍 ${post.cafeName.trim()}`)
  return parts.join('\n')
}

export default function CommunityPage() {
  const [posts, setPosts] = useState([])
  const [showSheet, setShowSheet] = useState(false)

  const load = async () => {
    setPosts(await getPosts())
  }

  useEffect(() => {
    load()
  }, [])

  const userThreadPosts = posts.map((post) => ({
    id: `user-${post.id}`,
    username: 'you',
    displayName: 'You',
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

  return (
    <div className="community-page">
      <h1 className="page-title">Community</h1>
      <p className="page-subtitle">Share your coffee moments</p>

      <button
        type="button"
        className="add-cup-btn community-share-btn"
        onClick={() => setShowSheet(true)}
      >
        Share a moment
      </button>

      <div className="community-feed">
        {userThreadPosts.map((post) => (
          <CommunityThreadPost key={post.id} post={post} />
        ))}
        {COMMUNITY_SEED_POSTS.map((post) => (
          <CommunityThreadPost key={post.id} post={post} />
        ))}
      </div>

      {showSheet && (
        <ShareMomentSheet
          onClose={() => setShowSheet(false)}
          onPosted={load}
        />
      )}
    </div>
  )
}
