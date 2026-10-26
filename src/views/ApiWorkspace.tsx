import { useEffect, useState, type FormEvent } from "react"
import type { Disaster } from "../data/disasters"
import type { NeedCode, NeedLevel, ReportDTO, ReportInput, Role } from "../api/contracts"
import { assignReport, createReport, evidenceContentUrl, getReportHistory, getSummary, getWorkers, listReports, reviewReport, uploadEvidence } from "../services/api"
import { deleteDraft, emptyNeeds, loadDraft, saveDraft } from "../lib/drafts"
import { useReclaim } from "../hooks/useReclaim"

const labels: Record<NeedCode, string> = {
  housing: "Housing and safe shelter",
  livelihood: "Work and livelihood",
  documents: "Access to essential documents",
  financial: "Essential costs and financial needs",
  dependents: "Support for dependents",
}
const blankInput = (disasterId: string, language: string): ReportInput => ({
  disasterId, language, story: "", members: 1, area: "", immediateDanger: "unknown", needs: emptyNeeds(),
})
const newKey = () => crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">{children}</section>
}

function NeedSelect({ code, value, onChange }: { code: NeedCode; value: NeedLevel; onChange: (value: NeedLevel) => void }) {
  return <label className="block text-sm text-slate-700">
    <span className="mb-1 block font-medium">{labels[code]}</span>
    <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={value}
      onChange={(event) => onChange(event.target.value as NeedLevel)}>
      <option value="unknown">I’m not sure</option><option value="none">No unmet need reported</option>
      <option value="partial">Some need</option><option value="severe">Urgent or severe need</option>
    </select>
  </label>
}

function LoginCard({ role, onDone }: { role: Role; onDone: (username: string, password: string) => Promise<void> }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("")
    try { await onDone(username, password) } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in failed")
    } finally { setBusy(false) }
  }
  return <Card><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Staff access</p>
    <h2 className="mt-2 text-lg font-bold text-slate-900">Sign in to the {role} workspace</h2>
    <p className="mt-2 text-sm text-slate-600">Use a demo staff account created by the local bootstrap command. The role in the URL does not grant access.</p>
    <form onSubmit={submit} className="mt-5 grid max-w-lg gap-3">
      <label className="text-sm font-medium">Username<input required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
      <label className="text-sm font-medium">Password<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="rounded-lg bg-[#0B1D3A] px-4 py-2 font-semibold text-white disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  </Card>
}

export default function ApiWorkspace({ role, disaster, language = "en" }: {
  role: Role; disaster: Disaster; language?: string
}) {
  const { session, loading, error: sessionError, signIn, signOut, beginAnonymousSession, refreshSession } = useReclaim()
  const [reports, setReports] = useState<ReportDTO[]>([])
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getSummary>> | null>(null)
  const [workers, setWorkers] = useState<Array<{ id: string; name: string }>>([])
  const [selected, setSelected] = useState<ReportDTO | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState<ReportInput>(() => blankInput(disaster.id, language))
  const [createKey, setCreateKey] = useState<string>(newKey)
  const [file, setFile] = useState<File | null>(null)
  const [uploadKey, setUploadKey] = useState<string>(newKey)
  const [history, setHistory] = useState<Awaited<ReturnType<typeof getReportHistory>> | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [reviewedNeeds, setReviewedNeeds] = useState(input.needs)
  const [reviewedDanger, setReviewedDanger] = useState<ReportInput["immediateDanger"]>("unknown")
  const selectedReport = selected && reports.find((item) => item.id === selected.id) || selected

  async function refresh() {
    if (!session) return
    setError("")
    try {
      if (role === "govt") {
        setSummary(await getSummary(disaster.id)); setReports([]); setWorkers([])
      } else {
        const result = await listReports(disaster.id, role)
        setReports(result.items)
        setWorkers(role === "ngo" ? (await getWorkers(disaster.id)).items : [])
        setSummary(null)
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load reports")
    }
  }

  useEffect(() => {
    let active = true
    setError(""); setSelected(null)
    if (!session) { setReports([]); setSummary(null); return () => { active = false } }
    const load = async () => {
      try {
        if (role === "govt") {
          const result = await getSummary(disaster.id)
          if (active) { setSummary(result); setReports([]); setWorkers([]) }
        } else {
          const result = await listReports(disaster.id, role)
          const workerResult = role === "ngo" ? await getWorkers(disaster.id) : { items: [] }
          if (active) { setReports(result.items); setWorkers(workerResult.items); setSummary(null) }
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load reports")
      }
    }
    void load()
    return () => { active = false }
  }, [session?.userId, role, disaster.id])

  useEffect(() => {
    if (!session || role !== "citizen") return
    const saved = loadDraft(session.userId, disaster.id)
    setInput(saved?.input ?? blankInput(disaster.id, language))
    setCreateKey(saved?.createKey ?? newKey())
  }, [session?.userId, role, disaster.id])

  useEffect(() => {
    if (session && role === "citizen") saveDraft(session.userId, disaster.id, input, createKey)
  }, [session?.userId, role, disaster.id, input, createKey])

  useEffect(() => {
    let active = true
    if (!selectedReport || !session || role === "govt") {
      setHistory(null)
      return () => { active = false }
    }
    getReportHistory(selectedReport.id)
      .then((result) => { if (active) setHistory(result) })
      .catch(() => { if (active) setHistory(null) })
    return () => { active = false }
  }, [selectedReport?.id, selectedReport?.version, session?.userId, role])

  useEffect(() => {
    if (!selectedReport) return
    setReviewedNeeds(selectedReport.input.needs)
    setReviewedDanger(selectedReport.input.immediateDanger)
  }, [selectedReport?.id, selectedReport?.inputRevision])

  async function run(action: () => Promise<unknown>) {
    setBusy(true); setError("")
    try { await action(); await refresh() } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The change could not be saved")
    } finally { setBusy(false) }
  }

  async function submitReport(event: FormEvent) {
    event.preventDefault()
    setBusy(true); setError("")
    try {
      const report = await createReport(input, createKey)
      deleteDraft(session!.userId, disaster.id)
      setInput(blankInput(disaster.id, language)); setCreateKey(newKey()); setFile(null); setUploadKey(newKey()); setSelected(report)
      await refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Report submission failed")
    } finally { setBusy(false) }
  }

  if (loading) return <div className="mx-auto max-w-5xl p-8" role="status">Connecting to the ReClaim API…</div>
  if (sessionError) return <div className="mx-auto max-w-5xl space-y-3 p-8"><Card><h2 className="font-bold">API unavailable</h2><p className="mt-2 text-sm text-slate-600">{sessionError}</p><button className="mt-4 rounded-lg bg-[#0B1D3A] px-4 py-2 text-white" onClick={() => void refreshSession()}>Retry connection</button></Card></div>
  if (!session) return <div className="mx-auto max-w-5xl p-8"><LoginCard role={role} onDone={signIn} /></div>
  if (session.role !== role) return <div className="mx-auto max-w-5xl space-y-4 p-8">
    <Card><h2 className="text-lg font-bold">This session is signed in as {session.role}.</h2>
      <p className="mt-2 text-sm text-slate-600">Changing the visible role does not change your API permissions.</p>
      <div className="mt-4 flex flex-wrap gap-2"><button className="rounded-lg border px-4 py-2" onClick={() => void signOut().catch((reason) => setError(reason.message))}>Sign out</button>
        {role === "citizen" && <button className="rounded-lg bg-[#0B1D3A] px-4 py-2 text-white" onClick={() => void beginAnonymousSession().catch((reason) => setError(reason.message))}>Continue anonymously</button>}</div>
    </Card><LoginCard role={role} onDone={signIn} />{error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>

  const updateNeed = (code: NeedCode, value: NeedLevel) => setInput((item) => ({ ...item, needs: { ...item.needs, [code]: value } }))

  return <div className="mx-auto w-full max-w-7xl space-y-5 bg-slate-50 p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">ReClaim API demo · fictional data</p>
        <h1 className="mt-1 text-2xl font-bold text-[#0B1D3A]">{disaster.name} — {role === "ngo" ? "Organization" : role === "govt" ? "Government summary" : role === "fieldworker" ? "Field review" : "Citizen report"}</h1>
        <p className="mt-1 text-sm text-slate-600">{disaster.district}, {disaster.state} · {session.username || "Anonymous browser session"} · {session.role}</p></div>
      <button onClick={() => void signOut().catch((reason) => setError(reason.message))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">Sign out</button>
    </div>

    <Card><div className="flex flex-wrap items-center justify-between gap-2"><div><strong className="text-sm text-slate-900">Priority uses transparent rules</strong>
      <p className="mt-1 text-sm text-slate-600">No trained text model is configured. Scores show reported needs, not verified facts or eligibility.</p></div>
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Rules only · provisional</span></div></Card>

    {role === "citizen" && <Card><h2 className="text-lg font-bold text-slate-900">Tell us what support is needed</h2>
      <p className="mt-1 text-sm text-slate-600">Use fictional information. Do not include identity or bank numbers. Your draft stays in this browser for up to 24 hours.</p>
      <form onSubmit={submitReport} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-800">Story<textarea required minLength={1} maxLength={8000} rows={4} value={input.story} onChange={(event) => setInput((item) => ({ ...item, story: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 p-3" placeholder="Describe the damage and what help is still needed." /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">Area or village<input required minLength={2} maxLength={120} value={input.area} onChange={(event) => setInput((item) => ({ ...item, area: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
          <label className="text-sm font-medium">Household members<input required type="number" min={1} max={50} value={input.members} onChange={(event) => setInput((item) => ({ ...item, members: Number(event.target.value) }))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
          <label className="text-sm font-medium">Optional household label<input maxLength={80} value={input.alias || ""} onChange={(event) => setInput((item) => ({ ...item, alias: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="No full legal name needed" /></label>
          <label className="text-sm font-medium">Immediate danger<select value={input.immediateDanger} onChange={(event) => setInput((item) => ({ ...item, immediateDanger: event.target.value as ReportInput["immediateDanger"] }))} className="mt-1 w-full rounded-lg border bg-white px-3 py-2"><option value="unknown">Not sure</option><option value="no">No immediate danger reported</option><option value="yes">Yes — needs urgent human review</option></select></label>
        </div>
        <div className="md:col-span-2"><h3 className="mb-3 font-semibold text-slate-900">What needs are still unmet?</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{(Object.keys(labels) as NeedCode[]).map((code) => <NeedSelect key={code} code={code} value={input.needs[code]} onChange={(value) => updateNeed(code, value)} />)}</div></div>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2"><button disabled={busy || !input.story.trim()} className="rounded-lg bg-[#0B1D3A] px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Saving…" : "Submit report"}</button>
          <button type="button" className="rounded-lg border px-4 py-3 text-sm" onClick={() => { deleteDraft(session.userId, disaster.id); setInput(blankInput(disaster.id, language)); setCreateKey(newKey()) }}>Delete local draft</button></div>
      </form></Card>}

    {error && <Card><p role="alert" className="text-sm text-red-700">{error}</p><p className="mt-1 text-xs text-slate-500">Your unsaved draft has been kept. Reload the report before retrying a stale edit.</p></Card>}
    {role === "govt" && summary && <Card><h2 className="font-bold">Submitted report summary</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Metric label="Submitted reports" value={summary.reportedCount} /><Metric label="Scored" value={summary.scoredCount} /><Metric label="Needs assessment" value={summary.unscoredCount} /><Metric label="Human reviewed" value={summary.verifiedCount} /></div>
      <p className="mt-3 text-xs text-slate-500">Database totals as of {new Date(summary.asOf).toLocaleString()}. These counts are reports, not affected population or unique households.</p></Card>}

    {(role === "citizen" || role === "ngo" || role === "fieldworker") && <Card><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">{role === "citizen" ? "Your submitted reports" : role === "ngo" ? "Reports to coordinate" : "Assigned reports"}</h2><p className="mt-1 text-xs text-slate-500">{reports.length} loaded from the API; refresh to check for updates.</p></div><button disabled={busy} className="rounded-lg border px-3 py-2 text-sm" onClick={() => void refresh()}>Refresh</button></div>
      {reports.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No reports in this event yet. No sample households were inserted.</p> : <div className="mt-4 space-y-3">{reports.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${selectedReport?.id === item.id ? "border-blue-500 bg-blue-50/40" : "border-slate-200"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3"><button className="text-left" onClick={() => { setSelected(item); setReviewedNeeds(item.input.needs); setReviewedDanger(item.input.immediateDanger); setReviewNotes("") }}><span className="font-semibold text-slate-900">{item.input.alias || `Report ${item.id.slice(0, 8)}`}</span><span className="ml-2 text-xs text-slate-500">{item.input.area} · {item.input.members} people</span></button>
          <div className="flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{item.priority.score === null ? "Needs assessment" : `${item.priority.score} · ${item.priority.band}`}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs">{item.reviewState.replace("_", " ")}</span>{item.priority.urgentReview && <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">Urgent human review requested</span>}</div>
        </div><p className="mt-2 line-clamp-3 text-sm text-slate-600">{item.input.story}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{item.evidence.length} photo(s)</span><span>·</span><span>{new Date(item.updatedAt).toLocaleString()}</span>
          {item.priority.score !== null && <details className="ml-1"><summary className="cursor-pointer text-blue-700">Why this score?</summary><ul className="mt-2 grid gap-1">{item.priority.factors.map((factor) => <li key={factor.code}>{labels[factor.code]}: {factor.points}/{factor.maxPoints} ({factor.source})</li>)}</ul></details>}</div>
        {role === "ngo" && <div className="mt-3 flex flex-wrap items-center gap-2"><label className="text-xs font-medium">Assign worker<select className="ml-2 rounded border px-2 py-1" value={item.assignedWorker?.id || ""} onChange={(event) => void run(() => assignReport(item.id, event.target.value || null, item.version, newKey()))}><option value="">Unassigned</option>{workers.map((worker) => <option value={worker.id} key={worker.id}>{worker.name}</option>)}</select></label></div>}
      </article>)}</div>}</Card>}

    {selectedReport && (role === "citizen" || role === "fieldworker" || role === "ngo") && <Card><h2 className="text-lg font-bold">Selected report</h2>
      <p className="mt-1 text-xs text-slate-500">Report {selectedReport.id} · revision {selectedReport.inputRevision} · version {selectedReport.version}</p>
      {role === "citizen" && <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><label className="text-sm font-medium">Optional damage photo<input type="file" accept="image/jpeg,image/png" onChange={(event) => { setFile(event.target.files?.[0] || null); setUploadKey(newKey()) }} className="mt-2 block max-w-full text-sm" /></label><button disabled={!file || busy} className="self-end rounded-lg border px-4 py-2 text-sm disabled:opacity-50" onClick={() => file && void run(() => uploadEvidence(selectedReport.id, file, selectedReport.version, uploadKey).then((updated) => { setFile(null); setSelected(updated) }))}>Upload photo</button><p className="text-xs text-slate-500 md:col-span-2">JPEG/PNG only; up to 5 MiB and 12 megapixels. Photos do not determine the score or prove authenticity. No identity documents.</p></div>}
      {selectedReport.evidence.length > 0 && <div className="mt-4"><h3 className="mb-2 text-sm font-semibold">Supporting photos · unverified</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{selectedReport.evidence.map((item) => <figure key={item.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"><img src={evidenceContentUrl(item.id)} alt="Unverified supporting photo for this report" loading="lazy" className="aspect-video w-full object-cover" /><figcaption className="p-2 text-xs text-slate-500">{(item.bytes / 1024).toFixed(0)} KiB · not proof of identity or damage</figcaption></figure>)}</div></div>}
      {role !== "citizen" && <div className="mt-4 grid gap-3"><h3 className="font-semibold">Human review</h3><p className="text-sm text-slate-600">Remote review can request a visit or flag a follow-up. Only the assigned field worker can confirm facts after a recorded field visit. This is not a benefits or compensation decision.</p>
        <div className="grid gap-3 sm:grid-cols-2">{(Object.keys(labels) as NeedCode[]).map((code) => <NeedSelect key={code} code={code} value={reviewedNeeds[code]} onChange={(value) => setReviewedNeeds((current) => ({ ...current, [code]: value }))} />)}</div>
        <label className="text-sm font-medium">Immediate danger after review<select value={reviewedDanger} onChange={(event) => setReviewedDanger(event.target.value as ReportInput["immediateDanger"])} className="mt-1 w-full rounded-lg border bg-white px-3 py-2"><option value="unknown">Not sure</option><option value="no">No immediate danger</option><option value="yes">Immediate danger</option></select></label>
        <label className="text-sm font-medium">Review notes<textarea value={reviewNotes} maxLength={2000} onChange={(event) => setReviewNotes(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border p-3" /></label>
        <div className="flex flex-wrap gap-2">{role === "fieldworker" && <button disabled={busy} className="rounded-lg bg-emerald-700 px-4 py-2 text-white" onClick={() => void run(() => reviewReport(selectedReport.id, { outcome: "confirmed", observationMethod: "field_visit", notes: reviewNotes, reviewedNeeds, reviewedImmediateDanger: reviewedDanger }, selectedReport.version, newKey()).then((updated) => setSelected(updated)))}>Confirm field review</button>}
          <button disabled={busy} className="rounded-lg border px-4 py-2" onClick={() => void run(() => reviewReport(selectedReport.id, { outcome: "needs_visit", observationMethod: "remote_review", notes: reviewNotes, reviewedNeeds, reviewedImmediateDanger: reviewedDanger }, selectedReport.version, newKey()).then((updated) => setSelected(updated)))}>Request a visit</button>
          <button disabled={busy} className="rounded-lg border border-amber-300 px-4 py-2 text-amber-800" onClick={() => void run(() => reviewReport(selectedReport.id, { outcome: "disputed", observationMethod: "remote_review", notes: reviewNotes, reviewedNeeds, reviewedImmediateDanger: reviewedDanger }, selectedReport.version, newKey()).then((updated) => setSelected(updated)))}>Mark for follow-up</button></div>
      </div>}
      {history && <details className="mt-5 border-t pt-4"><summary className="cursor-pointer text-sm font-semibold">Review and change history</summary>
        {history.reviews.length === 0 && history.events.length === 0 ? <p className="mt-3 text-sm text-slate-500">No review history yet.</p> : <div className="mt-3 space-y-3">{history.reviews.map((item, index) => <div key={`${item.createdAt}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm"><p className="font-medium">{item.outcome.replace("_", " ")} · {item.observationMethod.replace("_", " ")}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()} · report revision {item.inputRevision}</p><p className="mt-2 text-xs text-slate-600">Reviewed: {Object.entries(item.reviewedFacts.needs).map(([code, level]) => `${labels[code as NeedCode]}: ${level}`).join(" · ")} · immediate danger: {item.reviewedFacts.immediateDanger}</p>{item.notes && <p className="mt-2 whitespace-pre-wrap text-slate-700">{item.notes}</p>}</div>)}
          {history.events.length > 0 && <ul className="space-y-1 text-xs text-slate-500">{history.events.map((event, index) => <li key={`${event.createdAt}-${index}`}>{event.action.replace(/_/g, " ")} · {new Date(event.createdAt).toLocaleString()}{event.oldVersion !== null && event.newVersion !== null ? ` · v${event.oldVersion} → v${event.newVersion}` : ""}</li>)}</ul>}</div>}
      </details>}
    </Card>}
  </div>
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-[#0B1D3A]">{value.toLocaleString()}</p></div>
}
