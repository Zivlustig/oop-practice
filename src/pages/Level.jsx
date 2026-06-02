import { useParams, useNavigate } from 'react-router-dom'
import { levels } from '../data/levels'

export default function Level() {
  const { id } = useParams()
  const navigate = useNavigate()
  const level = levels.find((l) => l.id === Number(id))

  if (!level) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Level not found.</p>
          <button onClick={() => navigate('/')} className="text-violet-400 hover:underline">
            ← Back to levels
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">{level.icon}</div>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
          Level {level.id}
        </div>
        <h1 className="text-3xl font-extrabold mb-3">{level.title}</h1>
        <p className="text-gray-400 mb-8">Coming soon — questions for this level are on the way.</p>
        <div className={`inline-block px-6 py-3 rounded-xl bg-gradient-to-r ${level.color} text-white font-semibold opacity-50 cursor-not-allowed mb-6`}>
          Coming Soon
        </div>
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Level Select
          </button>
        </div>
      </div>
    </div>
  )
}
