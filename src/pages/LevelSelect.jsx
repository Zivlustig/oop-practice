import { levels } from '../data/levels'
import LevelCard from '../components/LevelCard'

export default function LevelSelect() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-gray-900 to-gray-900 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 py-16">
        {/* header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            ☕ Java OOP
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent leading-tight mb-4">
            OOP Practice
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-md mx-auto">
            Master Java OOP — one level at a time
          </p>
        </div>

        {/* stats bar */}
        <div className="flex justify-center gap-8 mb-12">
          {[
            { label: 'Levels', value: '8' },
            { label: 'Topics', value: '8' },
            { label: 'Questions', value: '80+' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {/* level grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {levels.map((level) => (
            <LevelCard key={level.id} level={level} />
          ))}
        </div>
      </div>
    </div>
  )
}
