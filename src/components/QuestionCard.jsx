import { tokenize, TOKEN_COLOR } from '../utils/javaHighlight'

// ─── Syntax-highlighted Java code block ───────────────────────────────────────

function HighlightedToken({ type, value }) {
  const color = TOKEN_COLOR[type]
  const style = {
    color,
    ...(type === 'comment' ? { fontStyle: 'italic' } : {}),
  }
  return <span style={style}>{value}</span>
}

function JavaCodeBlock({ code }) {
  const tokens = tokenize(code)

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10"
         style={{ backgroundColor: '#1e1e1e' }}>
      {/* top chrome bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10"
           style={{ backgroundColor: '#2d2d2d' }}>
        {/* traffic-light dots */}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28ca41]" />
        </div>
        <span className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#858585' }}>
          Java
        </span>
        {/* spacer to keep "Java" centred */}
        <div className="w-10" />
      </div>

      {/* code area */}
      <pre className="px-5 py-4 text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre"
           style={{ color: TOKEN_COLOR.default }}>
        {tokens.map((tok, idx) => (
          <HighlightedToken key={idx} type={tok.type} value={tok.value} />
        ))}
      </pre>
    </div>
  )
}

// ─── Question text (prose + optional code block) ──────────────────────────────

function QuestionText({ text }) {
  const lines = text.split('\n')

  if (lines.length === 1) {
    return <p className="text-white text-lg leading-relaxed">{text}</p>
  }

  // First line is the prose question; everything after is the code snippet
  const [prose, ...codeLines] = lines
  const code = codeLines.join('\n').trim()

  return (
    <div className="space-y-4">
      <p className="text-white text-lg leading-relaxed">{prose}</p>
      <JavaCodeBlock code={code} />
    </div>
  )
}

// ─── Answer button state helpers ──────────────────────────────────────────────

const LETTER_COLORS = {
  correct:  'bg-emerald-500/20 border-emerald-500 text-emerald-300',
  wrong:    'bg-red-500/20    border-red-500    text-red-300',
  default:  'bg-gray-800/60   border-gray-600   text-gray-200 hover:border-violet-400 hover:bg-violet-500/10 hover:text-white',
  disabled: 'bg-gray-800/40   border-gray-700   text-gray-500 cursor-not-allowed',
}

function optionState(letter, selected, correct, answered) {
  if (!answered) return 'default'
  if (letter === correct) return 'correct'
  if (letter === selected) return 'wrong'
  return 'disabled'
}

// ─── Main card ────────────────────────────────────────────────────────────────

export default function QuestionCard({ question, onAnswer, answered, selected }) {
  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="space-y-4">
      {/* Question text */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <QuestionText text={question.question} />
      </div>

      {/* Answer buttons */}
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, i) => {
          const letter = letters[i]
          const state  = optionState(letter, selected, question.correct, answered)
          const base   = 'w-full text-left px-5 py-3.5 rounded-xl border font-medium text-sm transition-all duration-150 flex items-start gap-3'

          return (
            <button
              key={letter}
              disabled={answered}
              onClick={() => onAnswer(letter)}
              className={`${base} ${LETTER_COLORS[state]}`}
            >
              <span className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border
                ${state === 'correct'  ? 'bg-emerald-500 border-emerald-400 text-white' :
                  state === 'wrong'    ? 'bg-red-500 border-red-400 text-white' :
                  state === 'disabled' ? 'bg-gray-700 border-gray-600 text-gray-500' :
                                         'bg-gray-700 border-gray-600 text-gray-300'}`}>
                {letter}
              </span>
              <span className="leading-snug pt-0.5">{option.slice(3)}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div className={`rounded-xl border px-5 py-4 text-sm leading-relaxed animate-fade-in
          ${selected === question.correct
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            : 'bg-red-500/10 border-red-500/40 text-red-300'}`}>
          <span className="font-semibold mr-1">
            {selected === question.correct ? '✓ Correct! ' : '✗ Incorrect. '}
          </span>
          {question.explanation}
        </div>
      )}
    </div>
  )
}
