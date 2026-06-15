const icons = {
  inbox: (
    <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm2 0l8 5 8-5H4zm0 12h16V8l-8 5-8-5v10z" />
  ),
  send: (
    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
  ),
  draft: (
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6zm2-6h8v2H8v-2zm0-4h4v2H8v-2z" />
  ),
  trash: (
    <path d="M3 6h18v2H3V6zm2 2v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8H5zm3 2h2v9H8v-9zm4 0h2v9h-2v-9zM9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h4v2H5V4h4zm2 0h2V4h-2v0z" />
  ),
  star: (
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  ),
  search: (
    <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm6.32-2.094l5.58 5.58-1.42 1.42-5.58-5.58A8.96 8.96 0 0 1 10 18a8 8 0 0 1 0-16 8 8 0 0 1 8 8 8.96 8.96 0 0 1-1.68 5.326z" />
  ),
  plus: (
    <path d="M12 5v14m-7-7h14" strokeWidth="2" strokeLinecap="round" />
  ),
  'chevron-down': (
    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'chevron-left': (
    <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'chevron-right': (
    <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  x: (
    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  reply: (
    <path d="M21 11v2a4 4 0 0 1-4 4H5.41l4.3 4.3-1.42 1.4L1.59 16l6.7-6.7 1.42 1.4-4.3 4.3H17a2 2 0 0 0 2-2v-2h2z" />
  ),
  forward: (
    <path d="M3 11v2a4 4 0 0 0 4 4h11.59l-4.3 4.3 1.42 1.4L22.41 16l-6.7-6.7-1.42 1.4 4.3 4.3H7a2 2 0 0 1-2-2v-2H3z" />
  ),
  settings: (
    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7.43-2.53l.37-.68c.37-.67-.03-1.5-.78-1.72l-.93-.28-.59-1.77c-.2-.6-.83-.92-1.42-.76l-.91.24-.47-1.65c-.19-.67-.76-1.08-1.45-.98l-.95.13-.32-1.72c-.13-.68-.78-1.09-1.45-.94l-.94.2-.16-1.74c-.07-.69-.66-1.14-1.35-1.09l-.95.07V2.6l3.14-2.2a1.6 1.6 0 0 1 1.96.07l2.87 2.4 3.68.88a1.6 1.6 0 0 1 1.15 1.59l-.06 3.74 2.3 2.94a1.6 1.6 0 0 1-.2 1.96l-2.23 2.25 1.3 3.5a1.6 1.6 0 0 1-.75 1.89l-3.35 1.66-.23 3.72a1.6 1.6 0 0 1-1.35 1.49l-3.69.63-2.73 2.55a1.6 1.6 0 0 1-1.94.23l-3.05-2.16-3.72-.24a1.6 1.6 0 0 1-1.48-1.36l-.6-3.7-2.58-2.7a1.6 1.6 0 0 1-.2-1.96l2.2-3.07L.4 14.87a1.6 1.6 0 0 1 .08-1.96l2.4-2.87-.88-3.68a1.6 1.6 0 0 1 1.42-1.84l2.77-.4 2.2-4.17" />
  ),
  user: (
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-3.34 0-10 1.67-10 5v1a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-1c0-3.33-6.66-5-10-5z" />
  ),
  mail: (
    <path d="M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4zm2 0v.01L12 10l8-5.99V4H4zm0 12h16V6.5l-8 5-8-5V16z" />
  ),
  paperclip: (
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  menu: (
    <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
  ),
}

function Icon({ name, size = 20, color = 'currentColor', className = '' }) {
  const iconPath = icons[name]

  if (!iconPath) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  const isStroke = ['plus', 'chevron-down', 'chevron-left', 'chevron-right', 'x', 'paperclip', 'menu'].includes(name)

  return (
    <svg
      className={`icon icon--${name} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isStroke ? 'none' : 'currentColor'}
      stroke={isStroke ? color || 'currentColor' : 'none'}
      color={isStroke ? undefined : color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {iconPath}
    </svg>
  )
}

export default Icon