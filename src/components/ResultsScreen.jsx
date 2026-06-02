import { useNavigate } from 'react-router-dom'

function getPerformance(score, total) {
  const pct = score / total
  if (pct >= 0.90) return { msg: 'Excellent! You mastered this level', emoji: '🏆', color: 'text-yellow-400' }
  if (pct >= 0.70) return { msg: 'Good job! Keep practicing',          emoji: '💪', color: 'text-emerald-400' }
  if (pct >= 0.50) return { msg: 'Not bad, but review the material',   emoji: '📖', color: 'text-blue-400'    }
  return               { msg: "Keep going, you'll get there!",          emoji: '🔁', color: 'text-orange-400'  }
}

export default function ResultsScreen({ score, total, levelId, onRetry }) {
  const navigate   = useNavigate()
  const { msg, emoji, color } = getPerformance(score, total)
  const percentage = Math.round((score / total) * 100)

  // Arc progress (SVG circle)
  const r   = 54
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - percentage / 100)

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center space-y-8">

        {/* Circular score */}
        <div className="flex justify-center">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={r} fill="none" stroke="#1f2937" strokeWidth="10" />
              <circle
                cx="60" cy="60" r={r} fill="none"
                stroke="url(#scoreGrad)" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dash}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">{score}</span>
              <span className="text-xs text-gray-400">/ {total}</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <div className="text-5xl mb-3">{emoji}</div>
          <h1 className="text-2xl font-bold text-white mb-1">{msg}</h1>
          <p className={`text-lg font-semibold ${color}`}>{percentage}% correct</p>
        </div>

        {/* Score breakdown */}
        <div className="flex justify-center gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{score}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Correct</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-3 text-center">
            <div className="text-2xl font-bold text-red-400">{total - score}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Wrong</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 font-semibold text-sm hover:border-gray-500 hover:text-white transition-all"
          >
            ← Back to Levels
          </button>
        </div>
      </div>
    </div>
  )
}
