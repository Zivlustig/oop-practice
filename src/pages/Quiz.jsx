import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { levels } from '../data/levels'
import ProgressBar from '../components/ProgressBar'
import QuestionCard from '../components/QuestionCard'
import ResultsScreen from '../components/ResultsScreen'

// Fisher-Yates shuffle — returns a new shuffled array, never mutates the original
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Dynamically import question data per level
const questionModules = {
  1: () => import('../data/level1.json'),
  2: () => import('../data/level2.json'),
  3: () => import('../data/level3.json'),
  4: () => import('../data/level4.json'),
  5: () => import('../data/level5.json'),
  6: () => import('../data/level6.json'),
}

export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const levelId  = Number(id)
  const level    = levels.find((l) => l.id === levelId)

  const [questions, setQuestions] = useState(null)
  const [current,   setCurrent]   = useState(0)
  const [selected,  setSelected]  = useState(null)   // letter the user picked
  const [answered,  setAnswered]  = useState(false)
  const [score,     setScore]     = useState(0)
  const [finished,  setFinished]  = useState(false)
  const [attempt,   setAttempt]   = useState(0)      // bumped on retry to re-shuffle

  // Load & shuffle questions. Re-runs when `attempt` increments (Try Again).
  useEffect(() => {
    const loader = questionModules[levelId]
    if (!loader) { navigate('/'); return }
    loader().then((mod) => setQuestions(shuffle(mod.default)))
  }, [levelId, navigate, attempt])

  if (!level || !questions) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (finished) {
    return (
      <ResultsScreen
        score={score}
        total={questions.length}
        levelId={levelId}
        onRetry={() => {
          setCurrent(0); setSelected(null)
          setAnswered(false); setScore(0); setFinished(false)
          setAttempt((a) => a + 1)   // triggers a fresh shuffle
        }}
      />
    )
  }

  const q = questions[current]

  function handleAnswer(letter) {
    if (answered) return
    setSelected(letter)
    setAnswered(true)
    if (letter === q.correct) setScore((s) => s + 1)
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Subtle bg glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-gray-900 to-gray-900 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1.5"
          >
            ← Levels
          </button>
          <span className="text-sm font-semibold text-gray-300">
            {level.icon} {level.title}
          </span>
          <span className="text-sm font-bold text-white bg-gray-800 border border-gray-700 px-3 py-1 rounded-lg">
            {score} / {questions.length}
          </span>
        </div>

        {/* ── Progress bar ── */}
        <ProgressBar current={current + 1} total={questions.length} />

        {/* ── Question card + answers ── */}
        <QuestionCard
          question={q}
          onAnswer={handleAnswer}
          answered={answered}
          selected={selected}
        />

        {/* ── Next button ── */}
        {answered && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {current + 1 >= questions.length ? 'See Results →' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  )
}
