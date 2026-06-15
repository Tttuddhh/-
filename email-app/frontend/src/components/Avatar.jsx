import './Avatar.css'

const avatarColors = [
  '#4a5f7a',
  '#b8974e',
  '#e67e6a',
  '#67a87a',
  '#7c6fa0',
  '#5a8fb5',
  '#c47e5a',
  '#6a9ec2',
  '#a0826c',
  '#5c8a6f',
]

function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.trim().slice(0, 2).toUpperCase()
  }
  if (email) {
    return email.trim().slice(0, 2).toUpperCase()
  }
  return '?'
}

function getColorFromHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
}

function Avatar({ name = '', email = '', size = 'md', src = null, className = '' }) {
  const initials = getInitials(name, email)
  const bgColor = getColorFromHash(name || email || 'default')

  const sizeMap = { sm: 28, md: 36, lg: 48 }
  const fontSizeMap = { sm: '11px', md: '13px', lg: '16px' }
  const dimension = sizeMap[size] || sizeMap.md

  return (
    <div
      className={`avatar avatar--${size} ${className}`}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
        backgroundColor: src ? 'transparent' : bgColor,
        fontSize: fontSizeMap[size] || fontSizeMap.md,
      }}
      title={name || email}
      aria-label={name || email}
    >
      {src ? (
        <img src={src} alt={name || email} className="avatar__img" />
      ) : (
        <span className="avatar__initials">{initials}</span>
      )}
    </div>
  )
}

export default Avatar