import { useNavigate } from 'react-router-dom'

// Levels that have question data ready
const AVAILABLE_LEVELS = new Set([1, 2, 3, 4, 5, 6, 7])

export default function LevelCard({ level }) {
  const navigate  = useNavigate()
  const available = AVAILABLE_LEVELS.has(level.id)
  const dest      = available ? `/quiz/${level.id}` : `/level/${level.id}`

  return (
    <div
      className="group relative bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 flex flex-col gap-4 hover:border-gray-500/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 transition-all duration-200 cursor-pointer backdrop-blur-sm"
      onClick={() => navigate(dest)}
    >
      {/* gradient top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${level.color}`} />

      {/* level badge + icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Level {level.id}
        </span>
        <span className="text-3xl">{level.icon}</span>
      </div>

      {/* title + description */}
      <div>
        <h2 className="text-white font-bold text-lg leading-tight">
          {level.title}
        </h2>
        <p className="text-gray-400 text-sm mt-1 leading-snug">
          {level.description}
        </p>
      </div>

      {/* start / coming soon button */}
      <button
        className={`mt-auto w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
          ${available
            ? `bg-gradient-to-r ${level.color} text-white opacity-90 group-hover:opacity-100 group-hover:shadow-lg`
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
        onClick={(e) => { e.stopPropagation(); navigate(dest) }}
        disabled={!available}
      >
        {available ? 'Start →' : 'Coming Soon'}
      </button>
    </div>
  )
}
