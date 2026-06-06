import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import LevelMap from '../components/LevelMap'

// ─── Deterministic particles (no Math.random → stable across renders) ─────────
function useParticles(count) {
  return useMemo(() => (
    Array.from({ length: count }, (_, i) => {
      const a = (i * 1664525  + 1013904223) >>> 0
      const b = (a * 22695477 + 1)          >>> 0
      const c = (b * 6364136  + 1442695040) >>> 0
      const d = (c * 1664525  + 1013904223) >>> 0
      return {
        x:   (a % 10000) / 100,          // 0–100 %
        y:   (b % 10000) / 100,
        r:   1 + (c % 2),                // 1 or 2 px
        op:  0.10 + (i % 8) * 0.03,      // 0.10–0.31
        dur: 14 + (d % 22),              // 14–35 s
        del: -((i * 7) % 30),            // stagger start
      }
    })
  ), [])
}

// ─── Animated background (nebula blobs + stars) ───────────────────────────────
function Background() {
  const stars = useParticles(75)

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>

      {/* Deep-space base */}
      <div className="absolute inset-0"
           style={{ background: 'radial-gradient(ellipse at 50% 0%,#1a0533 0%,#050510 55%,#000308 100%)' }} />

      {/* Nebula blob 1 — top-left violet */}
      <div className="absolute"
           style={{
             top: '-25%', left: '-15%',
             width: '65vw', height: '65vw',
             background: 'radial-gradient(ellipse,rgba(109,40,217,0.22) 0%,transparent 65%)',
             animation: 'nebula-1 20s ease-in-out infinite',
           }} />

      {/* Nebula blob 2 — top-right blue */}
      <div className="absolute"
           style={{
             top: '-15%', right: '-20%',
             width: '55vw', height: '55vw',
             background: 'radial-gradient(ellipse,rgba(37,99,235,0.17) 0%,transparent 65%)',
             animation: 'nebula-2 25s ease-in-out infinite',
           }} />

      {/* Nebula blob 3 — mid-bottom pink */}
      <div className="absolute"
           style={{
             bottom: '5%', left: '25%',
             width: '50vw', height: '50vw',
             background: 'radial-gradient(ellipse,rgba(219,39,119,0.11) 0%,transparent 65%)',
             animation: 'nebula-3 30s ease-in-out infinite',
           }} />

      {/* Particle field */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden>
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="white"
            opacity={s.op}
            style={{
              animation: `particle-drift ${s.dur}s ease-in-out ${s.del}s infinite`,
              transformBox:    'fill-box',
              transformOrigin: 'center',
            }}
          />
        ))}
      </svg>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LevelSelect() {
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const initial  = user?.username?.[0]?.toUpperCase() ?? '?'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="relative min-h-screen text-white" style={{ background: '#050510' }}>
      <Background />

      {/* ── Glassmorphism header ─────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 py-3"
        style={{
          background:          'rgba(5,5,20,0.72)',
          backdropFilter:      'blur(28px)',
          WebkitBackdropFilter:'blur(28px)',
          borderBottom:        '1px solid rgba(139,92,246,0.22)',
          boxShadow:           '0 1px 0 rgba(139,92,246,0.1), 0 6px 30px rgba(0,0,0,0.55)',
        }}
      >
        {/* Left — logo wordmark */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none">🎓</span>
          <span className="text-sm font-bold tracking-tight text-white/80 hidden sm:block">
            OOP Practice
          </span>
        </div>

        {/* Center — player badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(139,92,246,0.10)',
            border:     '1px solid rgba(139,92,246,0.28)',
          }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#db2777)',
              boxShadow:  '0 0 12px rgba(139,92,246,0.65)',
            }}
          >
            {initial}
          </div>
          <span className="text-sm font-semibold text-white/90 max-w-[120px] truncate">
            {user?.username}
          </span>
        </div>

        {/* Right — ghost logout */}
        <button
          onClick={handleLogout}
          className="text-xs font-medium text-gray-400 hover:text-white px-3 py-1.5 rounded-lg
                     transition-all duration-200 hover:border-violet-500/50
                     hover:shadow-[0_0_14px_rgba(139,92,246,0.25)]
                     hover:bg-violet-500/10"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Logout
        </button>
      </header>

      {/* ── Content ──────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-28">

        {/* Hero title */}
        <div className="text-center mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-5"
             style={{ color: '#a78bfa', letterSpacing: '0.3em' }}>
            🎓 &nbsp;Java Mastery Track
          </p>

          {/* Neon glow title — filter on wrapper so drop-shadow reaches gradient text */}
          <div style={{ animation: 'neon-breathe 4s ease-in-out infinite' }}>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight
                         leading-none mb-4"
              style={{
                background:           'linear-gradient(135deg,#ffffff 0%,#c4b5fd 40%,#818cf8 70%,#a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
              }}
            >
              OOP Practice
            </h1>
          </div>

          <p className="text-gray-500 text-sm tracking-wide">
            Select a level — your progress saves automatically
          </p>
        </div>

        {/* Grid + stats */}
        <LevelMap />
      </main>
    </div>
  )
}
