import React from 'react'
import { POST_TYPES, timeAgoHindi, getInitials, avatarBg } from '../utils/boardHelpers'

export default function PostCard({ post }) {
  const type = POST_TYPES[post.type] || POST_TYPES.notice

  return (
    <article style={{
      background: '#fff',
      border: '0.5px solid #E8EDEA',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '10px',
    }}>
      {/* Coloured top accent bar — 3px, matches post type */}
      <div style={{
        height: '3px',
        background: type.accentColor,
      }} />

      <div style={{ padding: '14px' }}>
        {/* Meta row: type badge + time */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}>
          {/* Type badge */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 600,
            background: type.badgeBg,
            color: type.badgeColor,
            fontFamily: 'Mukta, sans-serif',
          }}>
            <i className={`ti ${type.icon}`} aria-hidden="true"
               style={{ fontSize: '11px' }} />
            {type.label}
          </span>

          {/* Time */}
          <span style={{
            fontSize: '11px',
            color: '#A8B5AD',
            fontFamily: 'Mukta, sans-serif',
          }}>
            {timeAgoHindi(post.createdAt)}
          </span>
        </div>

        {/* Post body text */}
        <p style={{
          fontSize: '14px',
          color: '#0D1B12',
          lineHeight: '1.65',
          marginBottom: '12px',
          fontFamily: 'Mukta, sans-serif',
        }}>
          {post.body}
        </p>

        {/* Footer: author + share */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Author info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}>
            {/* Avatar circle */}
            <div style={{
              width: '26px', height: '26px',
              borderRadius: '50%',
              background: avatarBg(post.author?.badge),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 600, color: '#fff',
              flexShrink: 0,
              fontFamily: 'Mukta, sans-serif',
            }}>
              {getInitials(post.author?.name)}
            </div>

            {/* Name */}
            <span style={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#607068',
              fontFamily: 'Mukta, sans-serif',
            }}>
              {post.author?.name || 'Nagarik'}
            </span>

            {/* Badge pill */}
            <span style={{
              fontSize: '10px',
              padding: '1px 7px',
              borderRadius: '100px',
              background: '#E1F5EE',
              color: '#085041',
              fontWeight: 500,
              fontFamily: 'Mukta, sans-serif',
            }}>
              {post.author?.badge || 'Nagarik'}
            </span>
          </div>

          {/* Share button */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'JanSoochna — मोहल्ला बोर्ड',
                  text: post.body,
                  url: window.location.href,
                })
              } else {
                navigator.clipboard.writeText(post.body)
                  .then(() => alert('संदेश कॉपी कर लिया गया है!'))
                  .catch(() => alert('कॉपी करने में त्रुटि हुई।'))
              }
            }}
            style={{
              width: '30px', height: '30px',
              borderRadius: '8px',
              background: '#F4F7F5',
              border: '0.5px solid #E8EDEA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: '#A8B5AD',
              fontSize: '14px',
            }}
            aria-label="Share post"
          >
            <i className="ti ti-share" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
