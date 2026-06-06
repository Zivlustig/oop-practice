import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// Last level that has question data
const MAX_LEVEL = 7

// Confetti palette
const CONFETTI_COLORS = ['#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#fb923c', '#e879f9', '#ffffff']

// ─── Confetti particle ────────────────────────────────────────────────────────
function Confetti() {
  const particles = useMemo(() => (
    Array.from({ length: 56 }, (_, i) => {
      // Spread across full 360° in equal slices + jitter
      const baseAngle  = (i / 56) * 360
      const jitter     = (Math.random() - 0.5) * 40
      const angleDeg   = baseAngle + jitter
      const angleRad   = (angleDeg * Math.PI) / 180
      const dist       = 110 + Math.random() * 160   // 110–270 px radius
      // Bias: arc upward so confetti fans up above the trophy
      const dx = Math.cos(angleRad) * dist
      const dy = Math.sin(angleRad) * dist - 60      // shift up
      return {
        dx,
        dy,
        rot:   (Math.random() - 0.5) * 900,          // -450 … +450 deg
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 220,                   // 0–220 ms stagger
        dur:   900 + Math.random() * 700,             // 900–1600 ms
        size:  5 + Math.random() * 7,                 // 5–12 px
        round: i % 4 === 0,                           // 1-in-4 are circles
      }
    })
  ), [])  // stable for the popup's lifetime; re-randomises each mount

  return (
    // Centred anchor at the trophy's approximate position
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      <div className="absolute left-1/2 top-20">
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position:         'absolute',
              width:            p.size,
              height:           p.round ? p.size : p.size * (0.5 + Math.random() * 0.8),
              borderRadius:     p.round ? '50%' : '2px',
              background:       p.color,
              '--dx':           `${p.dx}px`,
              '--dy':           `${p.dy}px`,
              '--rot':          `${p.rot}deg`,
              animation:        `confetti-burst ${p.dur}ms cubic-bezier(0.25,0.46,0.45,0.94) ${p.delay}ms both`,
              transform:        'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main popup ───────────────────────────────────────────────────────────────
export default function MasteryPopup({ levelId, levelTitle, onKeepPracticing }) {
  const navigate   = useNavigate()
  const isLastLevel = levelId >= MAX_LEVEL

  function handleNext() {
    if (isLastLevel) {
      navigate('/')
    } else {
      navigate(`/quiz/${levelId + 1}`)
    }
  }

  return (
    // ── Overlay ──────────────────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{
        background: 'rgba(5, 5, 20, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'overlay-in 0.25s ease-out both',
      }}
      // Click outside to dismiss (keep practicing)
      onMouseDown={e => { if (e.target === e.currentTarget) onKeepPracticing() }}
    >
      {/* ── Modal card ─────────────────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden text-white text-center"
        style={{
          background:          'rgba(20, 10, 50, 0.92)',
          border:              '1px solid rgba(167, 139, 250, 0.35)',
          boxShadow:           '0 0 0 1px rgba(167,139,250,0.15), 0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(139,92,246,0.25)',
          backdropFilter:      'blur(24px)',
          WebkitBackdropFilter:'blur(24px)',
          animation:           'modal-entrance 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        // Stop clicks inside from dismissing
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Confetti burst */}
        <Confetti />

        {/* Top accent glow */}
        <div
          className="absolute inset-x-0 top-0 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.35) 0%, transparent 70%)' }}
        />

        <div className="relative px-8 pt-10 pb-8 flex flex-col items-center gap-5">

          {/* Trophy */}
          <div
            className="text-8xl leading-none select-none"
            style={{ animation: 'trophy-celebrate 1.4s ease-in-out 0.3s infinite' }}
          >
            🏆
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2
              className="text-3xl font-black tracking-tight"
              style={{
                background:           'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
              }}
            >
              Level Mastered!
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              You answered all 50 questions correctly.<br />
              You're a Java OOP pro!&nbsp;🎉
            </p>
          </div>

          {/* Level badge */}
          <div
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: 'rgba(139,92,246,0.15)',
              border:     '1px solid rgba(139,92,246,0.35)',
              color:      '#c4b5fd',
            }}
          >
            Level {levelId} — {levelTitle}
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onKeepPracticing}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-300
                         hover:text-white transition-all duration-200"
              style={{
                border:     '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'
                e.currentTarget.style.background  = 'rgba(167,139,250,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.background  = 'rgba(255,255,255,0.04)'
              }}
            >
              Keep Practicing
            </button>

            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200
                         hover:opacity-90 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                boxShadow:  '0 0 20px rgba(139,92,246,0.5)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(139,92,246,0.75)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.5)' }}
            >
              {isLastLevel ? 'Back to Map' : 'Next Level →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
