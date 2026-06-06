import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { useUser } from '../context/UserContext'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

export default function Login() {
  const { user, setUser, loadUser } = useUser()
  const [username, setUsername] = useState('')
  const [error,    setError]    = useState('')
  const [busy,     setBusy]     = useState(false)
  const navigate = useNavigate()

  // Already logged in → skip straight to the app
  if (user) return <Navigate to="/" replace />

  async function handleAction(isSignUp) {
    const trimmed = username.trim()
    const action = isSignUp ? 'SIGNUP' : 'LOGIN'
    console.log(`[${action}] Started for username: "${trimmed}"`)

    if (!trimmed) { setError('Please enter a username.'); return }
    if (!USERNAME_RE.test(trimmed)) {
      setError('3–20 characters: letters, numbers, or underscores only.')
      return
    }

    setBusy(true)
    setError('')

    try {
      // ── Step 1: Anonymous Firebase Auth ────────────────────────────────────
      console.log(`[${action}] Step 1: calling signInAnonymously...`)
      console.log(`[${action}]   auth.currentUser before:`, auth.currentUser)
      const credential = await signInAnonymously(auth)
      console.log(`[${action}] Step 1 SUCCESS — anonymous UID: ${credential.user.uid}`)
      console.log(`[${action}]   auth.currentUser after:`, auth.currentUser)

      if (isSignUp) {
        // ── Step 2 (signup): Check existence with a plain getDoc ────────────
        // Do NOT use loadUser() here — it calls setUser() on success, which
        // would silently log the person in and navigate away before the error
        // message can ever be shown.
        console.log(`[${action}] Step 2: checking if username "${trimmed}" already exists in Firestore...`)
        const snap = await getDoc(doc(db, 'users', trimmed))
        console.log(`[${action}] Step 2 result — doc exists: ${snap.exists()}`)

        if (snap.exists()) {
          console.log(`[${action}] Username taken, aborting.`)
          setError('Username already taken. Please choose another one.')
          setBusy(false)
          return
        }

        // ── Step 3 (signup): Create user document ───────────────────────────
        const docPath = `users/${trimmed}`
        const docData = { username: trimmed, createdAt: new Date().toISOString(), progress: {} }
        console.log(`[${action}] Step 3: writing Firestore doc at path "${docPath}" with data:`, docData)
        await setDoc(doc(db, 'users', trimmed), docData)
        console.log(`[${action}] Step 3 SUCCESS — Firestore doc created`)

        setUser({ username: trimmed, progress: {} })

      } else {
        // ── Step 2 (login): Load existing user ──────────────────────────────
        console.log(`[${action}] Step 2: loading user "${trimmed}" from Firestore...`)
        const data = await loadUser(trimmed)
        console.log(`[${action}] Step 2 result — loaded data:`, data)

        if (!data) {
          console.log(`[${action}] Username not found, aborting.`)
          setError('Username not found.')
          setBusy(false)
          return
        }
        console.log(`[${action}] Step 2 SUCCESS — user loaded`)
      }

      // ── Final step: persist session and redirect ────────────────────────
      console.log(`[${action}] Saving "${trimmed}" to localStorage and navigating to /`)
      localStorage.setItem('oop_username', trimmed)
      navigate('/')

    } catch (e) {
      console.error(`[${action}] CAUGHT ERROR:`)
      console.error(`  message : ${e.message}`)
      console.error(`  code    : ${e.code}`)
      console.error(`  name    : ${e.name}`)
      console.error('  full error object:', e)

      if (e.code === 'permission-denied' || e.message?.includes('Missing or insufficient permissions')) {
        setError('Database permission error — contact the app owner to fix Firestore rules.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    }

    setBusy(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
      {/* Subtle bg glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-gray-900 to-gray-900 pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-4xl font-extrabold text-white mb-2">OOP Practice</h1>
          <p className="text-gray-400 text-sm">Master Java OOP — one level at a time</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-8 space-y-5 backdrop-blur-sm">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              autoFocus
              placeholder="e.g. java_master99"
              onChange={e => { setUsername(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAction(false)}
              className="w-full bg-gray-700/80 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {busy ? (
            <div className="flex justify-center py-2">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => handleAction(false)}
                className="flex-1 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white font-semibold text-sm hover:bg-gray-600 hover:border-gray-500 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => handleAction(true)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          No password needed — your username tracks your progress ✨
        </p>
      </div>
    </div>
  )
}
