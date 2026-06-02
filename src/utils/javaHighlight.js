/**
 * Tokenises a Java source string into an array of { type, value } tokens.
 * Types: keyword | string | number | comment | classname | method | operator | default
 */

const KEYWORDS = new Set([
  'abstract','assert','boolean','break','byte','case','catch','char','class',
  'const','continue','default','do','double','else','enum','extends','final',
  'finally','float','for','goto','if','implements','import','instanceof',
  'int','interface','long','native','new','null','package','private',
  'protected','public','return','short','static','strictfp','super','switch',
  'synchronized','this','throw','throws','transient','true','false','try',
  'void','volatile','while','String','System','var',
])

export function tokenize(code) {
  const tokens = []
  let i = 0
  const len = code.length

  function peek(offset = 0) { return code[i + offset] ?? '' }
  function consume() { return code[i++] }

  while (i < len) {
    // ── Line comment  ──────────────────────────────────────────────────────
    if (peek() === '/' && peek(1) === '/') {
      let val = ''
      while (i < len && peek() !== '\n') val += consume()
      tokens.push({ type: 'comment', value: val })
      continue
    }

    // ── Block comment  ─────────────────────────────────────────────────────
    if (peek() === '/' && peek(1) === '*') {
      let val = consume() + consume() // /*
      while (i < len && !(peek() === '*' && peek(1) === '/')) val += consume()
      if (i < len) val += consume() + consume() // */
      tokens.push({ type: 'comment', value: val })
      continue
    }

    // ── String literal  ────────────────────────────────────────────────────
    if (peek() === '"') {
      let val = consume() // opening "
      while (i < len && peek() !== '"') {
        if (peek() === '\\') val += consume() // escape char
        val += consume()
      }
      if (i < len) val += consume() // closing "
      tokens.push({ type: 'string', value: val })
      continue
    }

    // ── Char literal  ──────────────────────────────────────────────────────
    if (peek() === "'") {
      let val = consume() // opening '
      while (i < len && peek() !== "'") {
        if (peek() === '\\') val += consume()
        val += consume()
      }
      if (i < len) val += consume() // closing '
      tokens.push({ type: 'string', value: val })
      continue
    }

    // ── Number  ────────────────────────────────────────────────────────────
    if (/[0-9]/.test(peek())) {
      let val = ''
      while (i < len && /[0-9._xXbBfFdDlL]/.test(peek())) val += consume()
      tokens.push({ type: 'number', value: val })
      continue
    }

    // ── Word (keyword / classname / method / identifier)  ──────────────────
    if (/[a-zA-Z_$]/.test(peek())) {
      let val = ''
      while (i < len && /[a-zA-Z0-9_$]/.test(peek())) val += consume()

      if (KEYWORDS.has(val)) {
        tokens.push({ type: 'keyword', value: val })
      } else if (/^[A-Z]/.test(val)) {
        // Capitalised → class / type name
        tokens.push({ type: 'classname', value: val })
      } else if (peek() === '(') {
        // Followed by '(' → method call / declaration
        tokens.push({ type: 'method', value: val })
      } else {
        tokens.push({ type: 'default', value: val })
      }
      continue
    }

    // ── Annotation  ────────────────────────────────────────────────────────
    if (peek() === '@') {
      let val = consume()
      while (i < len && /[a-zA-Z0-9_]/.test(peek())) val += consume()
      tokens.push({ type: 'keyword', value: val })
      continue
    }

    // ── Everything else (operators, punctuation, whitespace, newlines)  ────
    tokens.push({ type: 'default', value: consume() })
  }

  return tokens
}

/** VS-Code-dark colour map */
export const TOKEN_COLOR = {
  keyword:   '#569cd6', // blue
  string:    '#ce9178', // orange
  number:    '#b5cea8', // light green
  comment:   '#6a9955', // green-grey (italic handled in JSX)
  classname: '#4ec9b0', // teal / cyan
  method:    '#dcdcaa', // yellow
  default:   '#d4d4d4', // light grey
}
