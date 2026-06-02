import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { levels } from '../data/levels'
import { useUser } from '../context/UserContext'
import ProgressBar from '../components/ProgressBar'
import QuestionCard from '../components/QuestionCard'
import ResultsScreen from '../components/ResultsScreen'

// ─── Weighted shuffle ─────────────────────────────────────────────────────────
// unseen = 5 (most likely to appear), wrong = 3, correct = 1 (least likely)
const WEIGHT = { correct: 1, wrong: 3 }
const DEFAULT_WEIGHT = 5  // unseen

function weightedShuffle(questions, levelProgress) {
  // Build pool with weights based on prior performance
  const pool = questions.map(q => ({
    q,
    w: WEIGHT[levelProgress?.[String(q.id)]] ?? DEFAULT_WEIGHT,
  }))

  const result = []
  while (pool.length > 0) {
    const total = pool.reduce((s, item) => s + item.w, 0)
    let rand = Math.random() * total
    for (let i = 0; i < pool.length; i++) {
      rand -= pool[i].w
      if (rand <= 0) {
        result.push(pool[i].q)
        pool.splice(i, 1)
        break
      }
    }
  }
  return result
}

// ─── Dynamic question imports ─────────────────────────────────────────────────
const questionModules = {
  1: () => import('../data/level1.json'),
  2: () => import('../data/level2.json'),
  3: () => import('../data/level3.json'),
  4: () => import('../data/level4.json'),
  5: () => import('../data/level5.json'),
  6: () => import('../data/level6.json'),
  7: () => import('../data/level7.json'),
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Quiz() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const levelId    = Number(id)
  const level      = levels.find(l => l.id === levelId)
  const { user, updateQuestionResult } = useUser()

  const [questions, setQuestions] = useState(null)
  const [current,   setCurrent]   = useState(0)
  const [selected,  setSelected]  = useState(null)
  const [answered,  setAnswered]  = useState(false)
  const [score,     setScore]     = useState(0)
  const [finished,  setFinished]  = useState(false)
  const [attempt,   setAttempt]   = useState(0)    // incremented by Try Again

  // Load + weighted-shuffle whenever we start or retry.
  // We intentionally capture the user's progress AT THIS MOMENT (not reactive),
  // so answering during the quiz doesn't cause a re-shuffle mid-session.
  useEffect(() => {
    const loader = questionModules[levelId]
    if (!loader) { navigate('/'); return }

    const levelProgress = user?.progress?.[levelId]
    loader().then(mod => setQuestions(weightedShuffle(mod.default, levelProgress)))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId, navigate, attempt])

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!level || !questions) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Results screen ─────────────────────────────────────────────────────────
  if (finished) {
    return (
      <ResultsScreen
        score={score}
        total={questions.length}
        levelId={levelId}
        onRetry={() => {
          setCurrent(0); setSelected(null)
          setAnswered(false); setScore(0); setFinished(false)
          setAttempt(a => a + 1)   // re-shuffle with updated weights
        }}
      />
    )
  }

  const q = questions[current]

  function handleAnswer(letter) {
    if (answered) return
    const isCorrect = letter === q.correct
    setSelected(letter)
    setAnswered(true)
    if (isCorrect) setScore(s => s + 1)
    updateQuestionResult(levelId, q.id, isCorrect)
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  // ── Quiz UI ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-gray-900 to-gray-900 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Levels
          </button>
          <span className="text-sm font-semibold text-gray-300 truncate max-w-[180px] text-center">
            {level.icon} {level.title}
          </span>
          <span className="text-sm font-bold text-white bg-gray-800 border border-gray-700 px-3 py-1 rounded-lg">
            {score} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <ProgressBar current={current + 1} total={questions.length} />

        {/* Question + answers */}
        <QuestionCard
          question={q}
          onAnswer={handleAnswer}
          answered={answered}
          selected={selected}
        />

        {/* Next button */}
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
