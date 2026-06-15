import './Badge.css'

function Badge({ count = 0, max = 99, className = '', variant = 'danger' }) {
  if (count === 0 || count === null || count === undefined) return null

  const display = count > max ? `${max}+` : count

  return (
    <span className={`badge badge--${variant} ${className}`}>
      {display}
    </span>
  )
}

export default Badge