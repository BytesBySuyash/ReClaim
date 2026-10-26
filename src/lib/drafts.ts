import type { NeedAnswers, ReportInput } from "../api/contracts"

const STORAGE_PREFIX = "reclaim-api-draft-v1"

export interface LocalReportDraft {
  input: ReportInput
  createKey: string
  savedAt: number
}

export function draftStorageKey(userId: string, disasterId: string) {
  return `${STORAGE_PREFIX}:${userId}:${disasterId}`
}

export function loadDraft(userId: string, disasterId: string): LocalReportDraft | null {
  try {
    const value = localStorage.getItem(draftStorageKey(userId, disasterId))
    if (!value) return null
    const draft = JSON.parse(value) as LocalReportDraft
    if (Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(draftStorageKey(userId, disasterId))
      return null
    }
    return draft
  } catch {
    return null
  }
}

export function saveDraft(userId: string, disasterId: string, input: ReportInput, createKey: string) {
  try {
    localStorage.setItem(draftStorageKey(userId, disasterId), JSON.stringify({ input, createKey, savedAt: Date.now() }))
  } catch {
    // A blocked or full local store should not prevent API use.
  }
}

export function deleteDraft(userId: string, disasterId: string) {
  try { localStorage.removeItem(draftStorageKey(userId, disasterId)) } catch { /* Ignore unavailable browser storage. */ }
}

export function clearDraftsForUser(userId: string) {
  try {
    const prefix = `${STORAGE_PREFIX}:${userId}:`
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index)
      if (key?.startsWith(prefix)) localStorage.removeItem(key)
    }
  } catch { /* Ignore unavailable browser storage. */ }
}

export const emptyNeeds = (): NeedAnswers => ({
  housing: "unknown", livelihood: "unknown", documents: "unknown", financial: "unknown", dependents: "unknown",
})
