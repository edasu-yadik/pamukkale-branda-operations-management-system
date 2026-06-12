import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Ana Sayfa' },
  { to: '/musteriler', label: 'Müşteriler' },
  { to: '/montajlar', label: 'Montajlar' },
  { to: '/tahsilatlar', label: 'Tahsilatlar' },
]

export default function Navbar() {
  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-6 h-14">
        <span className="font-bold text-lg tracking-tight">Pamukkale Branda</span>
        <div className="flex gap-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium px-2 py-1 rounded transition-colors ${
                  isActive ? 'bg-white/20' : 'hover:bg-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
