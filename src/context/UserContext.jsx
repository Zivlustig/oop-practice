import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { db, auth } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'

const UserContext = createContext(null)

const LEVEL_COUNT = 8

/**
 * Load a user's document + all per-level progress from Firestore.
 * Returns { username, progress } on success, or null if the user doesn't exist.
 */
async function fetchUser(username) {
  const path = `users/${username}`
  console.log(`[fetchUser] Reading Firestore doc at "${path}"`)
  console.log(`[fetchUser] auth.currentUser:`, auth.currentUser)

  const userSnap = await getDoc(doc(db, 'users', username))
  console.log(`[fetchUser] Doc exists: ${userSnap.exists()}`, userSnap.exists() ? userSnap.data() : '')

  if (!userSnap.exists()) return null

  // Load all level progress docs in parallel
  const progress = {}
  console.log(`[fetchUser] Loading progress for ${LEVEL_COUNT} levels...`)
  await Promise.all(
    Array.from({ length: LEVEL_COUNT }, (_, i) => {
      const levelId = i + 1
      return getDoc(doc(db, 'users', username, 'progress', String(levelId))).then(snap => {
        if (snap.exists()) {
          progress[levelId] = snap.data()
          console.log(`[fetchUser]   level ${levelId} progress:`, snap.data())
        }
      })
    })
  )

  console.log(`[fetchUser] Done — returning user:`, { username, progress })
  return { username, progress }
}

export function UserProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)   // true while restoring session

  // Restore session from localStorage on mount.
  // Must sign in anonymously first so Firestore rules see request.auth != null.
  useEffect(() => {
    const saved = localStorage.getItem('oop_username')
    console.log('[UserContext] Mount — localStorage oop_username:', saved)
    console.log('[UserContext] auth.currentUser at mount:', auth.currentUser)

    if (!saved) {
      console.log('[UserContext] No saved session, skipping restore.')
      setLoading(false)
      return
    }

    console.log('[UserContext] Signing in anonymously before session restore...')
    signInAnonymously(auth)
      .then(credential => {
        console.log('[UserContext] signInAnonymously SUCCESS — UID:', credential.user.uid)
        return fetchUser(saved)
      })
      .then(data => {
        console.log('[UserContext] Session restore fetchUser result:', data)
        if (data) setUser(data)
      })
      .catch(e => {
        console.error('[UserContext] Session restore FAILED:')
        console.error('  message:', e.message)
        console.error('  code   :', e.code)
        console.error('  full   :', e)
      })
      .finally(() => setLoading(false))
  }, [])

  /** Used by Login page — loads user from Firestore and sets state. */
  const loadUser = useCallback(async (username) => {
    console.log(`[loadUser] Called for username: "${username}"`)
    console.log(`[loadUser] auth.currentUser:`, auth.currentUser)
    const data = await fetchUser(username)
    console.log(`[loadUser] fetchUser returned:`, data)
    if (data) setUser(data)
    return data
  }, [])

  /**
   * Save a single question result to Firestore and update local state.
   */
  const updateQuestionResult = useCallback(async (levelId, questionId, isCorrect) => {
    if (!user) return
    const result = isCorrect ? 'correct' : 'wrong'
    const lid = String(levelId)
    const qid = String(questionId)

    // Optimistic local update
    setUser(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [levelId]: {
          ...(prev.progress[levelId] || {}),
          [qid]: result,
        },
      },
    }))

    // Persist to Firestore (fire-and-forget)
    setDoc(
      doc(db, 'users', user.username, 'progress', lid),
      { [qid]: result },
      { merge: true }
    ).catch(e => console.error('[updateQuestionResult] Firestore write failed:', e))
  }, [user])

  /** Clear local session. Navigation back to /login is handled by the caller. */
  const logout = useCallback(() => {
    localStorage.removeItem('oop_username')
    setUser(null)
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loading, loadUser, updateQuestionResult, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
