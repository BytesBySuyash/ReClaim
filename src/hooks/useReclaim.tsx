import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { SessionDTO } from "../api/contracts"
import { API_MODE, ApiError, login, logout, readSession, setCsrfToken, startGuestSession } from "../services/api"
import { clearDraftsForUser } from "../lib/drafts"

interface ReclaimContextValue {
  apiMode: boolean
  loading: boolean
  session: SessionDTO | null
  error: string
  refreshSession: () => Promise<void>
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  beginAnonymousSession: () => Promise<void>
}

const ReclaimContext = createContext<ReclaimContextValue | null>(null)

export function ReclaimProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionDTO | null>(null)
  const [loading, setLoading] = useState(API_MODE)
  const [error, setError] = useState("")

  async function installSession(next: SessionDTO) {
    setCsrfToken(next.csrfToken)
    setSession(next)
    setError("")
  }

  async function refreshSession() {
    if (!API_MODE) return
    setLoading(true)
    try {
      try {
        await installSession(await readSession())
      } catch (reason) {
        if (reason instanceof ApiError && reason.status === 401) await installSession(await startGuestSession())
        else throw reason
      }
    } catch (reason) {
      setSession(null)
      setCsrfToken("")
      setError(reason instanceof Error ? reason.message : "Could not load the ReClaim session")
    } finally {
      setLoading(false)
    }
  }

  async function signIn(username: string, password: string) {
    await installSession(await login(username, password))
  }

  async function signOut() {
    if (session) clearDraftsForUser(session.userId)
    await logout()
    await installSession(await startGuestSession())
  }

  async function beginAnonymousSession() {
    await installSession(await startGuestSession())
  }

  useEffect(() => { void refreshSession() }, [])

  const value = useMemo(() => ({
    apiMode: API_MODE, loading, session, error, refreshSession, signIn, signOut, beginAnonymousSession,
  }), [loading, session, error])
  return <ReclaimContext.Provider value={value}>{children}</ReclaimContext.Provider>
}

export function useReclaim() {
  const context = useContext(ReclaimContext)
  if (!context) throw new Error("useReclaim must be used inside ReclaimProvider")
  return context
}
