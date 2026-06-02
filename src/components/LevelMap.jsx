import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { levels } from '../data/levels'
import { useUser } from '../context/UserContext'

const AVAILABLE_LEVELS = new Set([1, 2, 3, 4, 5, 6, 7])
const TOTAL_QUESTIONS  = 50

// ─── Per-level color themes ───────────────────────────────────────────────────
const THEMES = {
  1: { grad: 'linear-gradient(135deg,#1e3a8a 0%,#6d28d9 100%)', accent: '#818cf8', glow: 'rgba(129,140,248,0.55)' },
  2: { grad: 'linear-gradient(135deg,#0f766e 0%,#1d4ed8 100%)', accent: '#22d3ee', glow: 'rgba(34,211,238,0.5)'  },
  3: { grad: 'linear-gradient(135deg,#7c3aed 0%,#db2777 100%)', accent: '#e879f9', glow: 'rgba(232,121,249,0.5)' },
  4: { grad: 'linear-gradient(135deg,#c2410c 0%,#991b1b 100%)', accent: '#fb923c', glow: 'rgba(251,146,60,0.5)'  },
  5: { grad: 'linear-gradient(135deg,#15803d 0%,#0f766e 100%)', accent: '#34d399', glow: 'rgba(52,211,153,0.5)'  },
  6: { grad: 'linear-gradient(135deg,#a16207 0%,#c2410c 100%)', accent: '#fbbf24', glow: 'rgba(251,191,36,0.5)'  },
  7: { grad: 'linear-gradient(135deg,#be185d 0%,#6d28d9 100%)', accent: '#f472b6', glow: 'rgba(244,114,182,0.5)' },
  locked: { grad: 'linear-gradient(135deg,#1f2937 0%,#111827 100%)', accent: '#4b5563', glow: 'rgba(75,85,99,0.3)' },
}

function getTheme(levelId, available) {
  return available ? (THEMES[levelId] ?? THEMES.locked) : THEMES.locked
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLevelPct(progress, levelId) {
  const prog = progress?.[levelId]
  if (!prog) return 0
  const correct = Object.values(prog).filter(v => v === 'correct').length
  return Math.round((correct / TOTAL_QUESTIONS) * 100)
}

function ringColor(pct) {
  if (pct === 0)  return '#374151'
  if (pct < 50)   return '#f59e0b'
  if (pct < 80)   return '#22d3ee'
  return '#22c55e'
}

// ─── SVG progress ring ────────────────────────────────────────────────────────
function ProgressRing({ pct }) {
  const r     = 15
  const circ  = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const color  = ringColor(pct)
  const green  = pct >= 80

  return (
    <div className="relative" style={{ width: 42, height: 42 }}>
      <svg width="42" height="42" viewBox="0 0 42 42"
           style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {/* track */}
        <circle cx="21" cy="21" r={r} fill="none"
                stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
        {/* glow halo for green (pulsing duplicate) */}
        {green && (
          <circle cx="21" cy="21" r={r} fill="none"
                  stroke={color} strokeWidth="5"
                  strokeDasharray={circ} strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ filter: `blur(3px)`, animation: 'ring-glow 2s ease-in-out infinite' }} />
        )}
        {/* fill */}
        {pct > 0 && (
          <circle cx="21" cy="21" r={r} fill="none"
                  stroke={color} strokeWidth="3"
                  strokeDasharray={circ} strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ filter: green ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
        )}
      </svg>
      {/* label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[9px] font-black leading-none"
              style={{ color: pct === 0 ? '#4b5563' : color }}>
          {pct}%
        </span>
      </div>
    </div>
  )
}

// ─── Single level card ────────────────────────────────────────────────────────
function LevelCard({ level, pct, available, index }) {
  const navigate = useNavigate()
  const ref      = useRef(null)
  const [tilt,    setTilt]    = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [shimmer, setShimmer] = useState(false)
  const theme = getTheme(level.id, available)
  const num   = String(level.id).padStart(2, '0')

  function onMouseMove(e) {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width  - 0.5   // -0.5 … +0.5
    const y = (e.clientY - r.top)  / r.height - 0.5
    setTilt({ x: y * -12, y: x * 12 })
  }

  function onMouseEnter() {
    setHovered(true)
    setShimmer(false)
    // tiny frame gap so the shimmer div mounts fresh each hover
    requestAnimationFrame(() => setShimmer(true))
  }

  function onMouseLeave() {
    setHovered(false)
    setShimmer(false)
    setTilt({ x: 0, y: 0 })
  }

  const shadow = hovered && available
    ? `0 0 0 1px ${theme.accent}60, 0 0 28px 4px ${theme.glow}, 0 24px 60px rgba(0,0,0,0.7)`
    : `0 0 0 1px rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.5)`

  const transform = `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` +
    (hovered && available ? ' translateY(-8px) scale(1.03)' : ' translateY(0) scale(1)')

  return (
    <div
      style={{
        animation: `card-entrance 0.55s cubic-bezier(0.34,1.56,0.64,1) ${index * 75}ms both`,
      }}
    >
      <div
        ref={ref}
        role="button"
        tabIndex={available ? 0 : -1}
        aria-label={`Level ${level.id}: ${level.title}`}
        onClick={() => available && navigate(`/quiz/${level.id}`)}
        onKeyDown={e => e.key === 'Enter' && available && navigate(`/quiz/${level.id}`)}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`relative rounded-2xl overflow-hidden select-none outline-none
          ${available ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
        style={{
          height:      '290px',
          background:  theme.grad,
          boxShadow:   shadow,
          border:      '1px solid rgba(255,255,255,0.09)',
          transform,
          transition:  hovered
            ? 'transform 0.12s ease-out, box-shadow 0.2s ease'
            : 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease',
          willChange: 'transform',
        }}
      >
        {/* Dot-grid texture */}
        <div className="absolute inset-0 opacity-[0.07]"
             style={{
               backgroundImage:
                 'radial-gradient(circle,#fff 1px,transparent 1px)',
               backgroundSize: '24px 24px',
             }} />

        {/* Top radial glow from accent */}
        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none"
             style={{
               background: `radial-gradient(ellipse at 50% -10%,${theme.accent}30 0%,transparent 70%)`,
             }} />

        {/* Shimmer sweep */}
        {shimmer && (
          <div className="absolute inset-0 pointer-events-none"
               style={{
                 background:
                   'linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.13) 50%,transparent 70%)',
                 animation: 'shimmer-sweep 0.6s ease-out forwards',
               }} />
        )}

        {/* ── Badge ───────────────────────────────────────────────── */}
        <div className="absolute top-3.5 left-3.5 z-10 px-2 py-0.5 rounded-full
                        text-[10px] font-black tracking-widest"
             style={{
               background:   'rgba(0,0,0,0.4)',
               border:       `1px solid ${theme.accent}55`,
               color:        theme.accent,
               backdropFilter: 'blur(6px)',
             }}>
          {num}
        </div>

        {/* ── Emoji center top half ────────────────────────────────── */}
        <div className="absolute inset-x-0 flex items-center justify-center"
             style={{ top: 0, height: '58%' }}>
          <span
            className="text-6xl leading-none"
            style={{
              filter: available
                ? `drop-shadow(0 0 18px ${theme.accent}cc) drop-shadow(0 0 40px ${theme.accent}55)`
                : 'grayscale(1) opacity(0.4)',
              transform: hovered ? 'scale(1.15) translateY(-5px)' : 'scale(1)',
              transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              display: 'block',
            }}
          >
            {available ? level.icon : '🔒'}
          </span>
        </div>

        {/* ── Bottom info strip ───────────────────────────────────── */}
        <div className="absolute inset-x-0 bottom-0 p-4"
             style={{
               background: 'linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.12) 100%)',
             }}>
          <div className="flex items-end justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-1"
                 style={{ color: theme.accent, opacity: 0.85 }}>
                Level {level.id}
              </p>
              <p className="text-sm font-extrabold text-white leading-tight line-clamp-2">
                {level.title}
              </p>
            </div>
            <ProgressRing pct={pct} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ progress }) {
  const stats = useMemo(() => {
    let answered = 0, correct = 0
    for (let lid = 1; lid <= 8; lid++) {
      const prog = progress?.[lid]
      if (!prog) continue
      const vals = Object.values(prog)
      answered += vals.length
      correct  += vals.filter(v => v === 'correct').length
    }
    return {
      answered,
      correct,
      mastery: answered > 0 ? Math.round((correct / answered) * 100) : 0,
    }
  }, [progress])

  const items = [
    { label: 'Answered', value: stats.answered, color: '#818cf8' },
    { label: 'Correct',  value: stats.correct,  color: '#34d399' },
    { label: 'Mastery',  value: `${stats.mastery}%`, color: '#f472b6' },
  ]

  return (
    <div className="mt-10 rounded-2xl flex items-stretch divide-x"
         style={{
           background:     'rgba(255,255,255,0.03)',
           border:         '1px solid rgba(255,255,255,0.08)',
           backdropFilter: 'blur(16px)',
           divideColor:    'rgba(255,255,255,0.07)',
         }}>
      {items.map((item, i) => (
        <div key={i} className="flex-1 text-center py-5 px-2"
             style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="text-2xl sm:text-3xl font-black tabular-nums"
               style={{ color: item.color,
                        textShadow: `0 0 18px ${item.color}66` }}>
            {item.value}
          </div>
          <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1.5 font-semibold">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function LevelMap() {
  const { user } = useUser()

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {levels.map((level, i) => (
          <LevelCard
            key={level.id}
            level={level}
            pct={getLevelPct(user?.progress, level.id)}
            available={AVAILABLE_LEVELS.has(level.id)}
            index={i}
          />
        ))}
      </div>
      <StatsBar progress={user?.progress} />
    </div>
  )
}
