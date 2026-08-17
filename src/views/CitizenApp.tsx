import { useEffect, useState } from "react"
import type { Disaster } from "../data/disasters"
import RecoveryToolkit from "../components/RecoveryToolkit"

const LANGUAGES = [
  { code: "en", native: "English", english: "English", region: "Default" },
  { code: "hi", native: "हिन्दी", english: "Hindi", region: "North India" },
  { code: "bn", native: "বাংলা", english: "Bengali", region: "West Bengal" },
  { code: "te", native: "తెలుగు", english: "Telugu", region: "Andhra Pradesh" },
  { code: "mr", native: "मराठी", english: "Marathi", region: "Maharashtra" },
  { code: "ta", native: "தமிழ்", english: "Tamil", region: "Tamil Nadu" },
  { code: "ur", native: "اردو", english: "Urdu", region: "Pan-India" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati", region: "Gujarat" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada", region: "Karnataka" },
  { code: "or", native: "ଓଡ଼ିଆ", english: "Odia", region: "Odisha" },
  { code: "ml", native: "മലയാളം", english: "Malayalam", region: "Kerala" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi", region: "Punjab" },
  { code: "as", native: "অসমীয়া", english: "Assamese", region: "Assam" },
  { code: "mai", native: "मैथिली", english: "Maithili", region: "Bihar" },
  { code: "sa", native: "संस्कृतम्", english: "Sanskrit", region: "Classical" },
  { code: "sat", native: "ᱥᱟᱱᱛᱟᱲᱤ", english: "Santali", region: "Jharkhand" },
  { code: "ks", native: "کٲشُر", english: "Kashmiri", region: "J&K" },
  { code: "ne", native: "नेपाली", english: "Nepali", region: "Sikkim" },
  { code: "sd", native: "سنڌي", english: "Sindhi", region: "Rajasthan" },
  { code: "doi", native: "डोगरी", english: "Dogri", region: "Jammu" },
  { code: "kok", native: "कोंकणी", english: "Konkani", region: "Goa" },
  { code: "mni", native: "মৈতৈলোন্", english: "Meitei", region: "Manipur" },
  { code: "brx", native: "बड़ो", english: "Bodo", region: "Assam" },
]

const UI: Record<string, Record<string, string>> = {
  en: {
    title: "You are safe. We are here to help.",
    sub: "Tell us what happened, in your own words. We will help you understand what support you can receive.",
    voiceBtn: "Tap to speak",
    typeLabel: "Or type your story:",
    placeholder:
      "Describe what happened — your house, belongings, documents, livelihood...",
    dontKnow: "I don't know",
    uploadTitle: "Upload Evidence",
    uploadSub:
      "Upload photos, bills, or documents that show what was damaged or lost.",
    privacyNote:
      "Your information is private and encrypted. It will only be shared with verified relief organizations with your consent.",
    continueBtn: "Continue",
    skipBtn: "Upload Later",
    yourProfile: "Your Recovery Profile",
    yourPlan: "Your Recovery Plan",
    selectLang: "Select Language",
    selectLangSub: "Choose the language you are most comfortable with",
    resourcesTitle: "Help & Resources",
    resourcesSub:
      "Government helplines, schemes you may qualify for, and NGO support near you.",
    helplines: "Emergency Helplines",
    schemes: "Government Schemes You May Qualify For",
    ngos: "NGO Support in Your Area",
    docsTitle: "How to Replace Lost Documents",
    callBtn: "Call",
    visitBtn: "Visit",
    applyBtn: "Apply Online",
  },
}

function t(lang: string, key: string): string {
  return (UI[lang] ?? UI.en)[key] ?? UI.en[key] ?? key
}

const AI_DETECTIONS = [
  {
    asset: "Sewing Machine",
    category: "Livelihood Equipment",
    evidence: "Photo",
    confidence: 91,
    ocr: null,
    value: 24500,
    importance: "Critical",
  },
  {
    asset: "Refrigerator",
    category: "Household Appliance",
    evidence: "Photo",
    confidence: 88,
    ocr: null,
    value: 18000,
    importance: "High",
  },
  {
    asset: "Aadhaar Card",
    category: "Identity Document",
    evidence: "Mentioned",
    confidence: 97,
    ocr: null,
    value: null,
    importance: "Critical",
  },
  {
    asset: "Shop Inventory",
    category: "Livelihood Inventory",
    evidence: "Video",
    confidence: 76,
    ocr: null,
    value: 60000,
    importance: "High",
  },
  {
    asset: "Purchase Bill",
    category: "Financial Document",
    evidence: "Document",
    confidence: 96,
    ocr: "₹24,500",
    value: 24500,
    importance: "High",
  },
  {
    asset: "Children's School Certificates",
    category: "Education Document",
    evidence: "Mentioned",
    confidence: 89,
    ocr: null,
    value: null,
    importance: "Medium",
  },
]

const HRVS_FACTORS = [
  {
    label: "Housing Damage",
    score: 22,
    max: 25,
    reason: "Ground floor fully flooded, roof damage",
  },
  {
    label: "Livelihood Disruption",
    score: 22,
    max: 25,
    reason: "Primary income source (tailoring) stopped",
  },
  {
    label: "Documentation Loss",
    score: 18,
    max: 20,
    reason: "Aadhaar, ration card, school certificates lost",
  },
  {
    label: "Financial Vulnerability",
    score: 15,
    max: 20,
    reason: "No savings, existing debt of ₹35,000",
  },
  {
    label: "Dependents at Risk",
    score: 10,
    max: 10,
    reason: "2 school-age children, no alternate income",
  },
]

const DEPENDENCY_CHAIN = [
  {
    node: "Lost Aadhaar Card + Identity Documents",
    type: "loss",
    blocker: true,
  },
  { node: "Cannot prove identity to government", type: "consequence" },
  {
    node: "Cannot apply for PM relief / NDRF compensation",
    type: "consequence",
  },
  { node: "Cannot access bank or financial services", type: "consequence" },
  {
    node: "Cannot restart tailoring business without capital",
    type: "consequence",
    terminal: true,
  },
]

const SEWING_CHAIN = [
  { node: "Sewing Machine destroyed (₹24,500)", type: "loss", blocker: true },
  { node: "Cannot continue tailoring work", type: "consequence" },
  { node: "Monthly income of ₹12,000 stops", type: "consequence" },
  {
    node: "Debt increases — children's education at risk",
    type: "consequence",
    terminal: true,
  },
]

const RECOVERY_PHASES = [
  {
    label: "72 Hours",
    stage: "Survival",
    color: "#B91C1C",
    bg: "#FEE2E2",
    current: false,
    done: true,
    tasks: [
      "Emergency shelter secured",
      "Food & water access confirmed",
      "Medical needs assessed",
      "Family members accounted for",
    ],
  },
  {
    label: "7 Days",
    stage: "Stabilization",
    color: "#C2410C",
    bg: "#FFEDD5",
    current: true,
    done: false,
    tasks: [
      "File Aadhaar replacement at nearest CSC",
      "Contact PM relief helpline: 1800-180-5999",
      "Collect school certificate copies from school",
      "Document all damage with RECLAIM app",
    ],
  },
  {
    label: "30 Days",
    stage: "Recovery",
    color: "#A16207",
    bg: "#FEF3C7",
    current: false,
    done: false,
    tasks: [
      "Receive replacement sewing machine via NGO support",
      "Resume tailoring orders (partial capacity)",
      "Submit insurance claim for refrigerator",
      "Children back in school with temporary certificates",
    ],
  },
  {
    label: "90 Days",
    stage: "Rebuilding",
    color: "#15803D",
    bg: "#DCFCE7",
    current: false,
    done: false,
    tasks: [
      "Full livelihood restoration",
      "Home repair completed",
      "Emergency savings rebuilt",
      "Financial stabilization plan in place",
    ],
  },
]

function ScoreCircle({ score, label }: { score: number; label: string }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 80 ? "#B91C1C" : score >= 60 ? "#C2410C" : "#15803D"
  const bgColor = score >= 80 ? "#FEE2E2" : score >= 60 ? "#FFEDD5" : "#DCFCE7"
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg viewBox="0 0 120 120" className="w-36 h-36">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              color: "#94a3b8",
            }}
          >
            {score}
          </span>
          <span
            className="text-xs"
            style={{
              color: "#94a3b8",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            /100
          </span>
        </div>
      </div>
      <div
        className="px-4 py-1 rounded-full text-sm font-bold tracking-wide"
        style={{ backgroundColor: bgColor, color }}
      >
        {label}
      </div>
    </div>
  )
}

function ConfidenceBadge({ value }: { value: number }) {
  const color = value >= 90 ? "#15803D" : value >= 75 ? "#A16207" : "#B91C1C"
  const bg = value >= 90 ? "#DCFCE7" : value >= 75 ? "#FEF3C7" : "#FEE2E2"
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{
        backgroundColor: bg,
        color,
        fontFamily: "JetBrains Mono, monospace",
      }}
    >
      {value}%
    </span>
  )
}

function ImportanceBadge({ value }: { value: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Critical: { bg: "#FEE2E2", color: "#B91C1C" },
    High: { bg: "#FFEDD5", color: "#C2410C" },
    Medium: { bg: "#FEF3C7", color: "#A16207" },
  }
  const s = map[value] ?? map.Medium
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {value}
    </span>
  )
}

function VictimHomeOverview({
  onStartReport,
  onOpenResources,
}: {
  onStartReport: () => void
  onOpenResources: () => void
}) {
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [helpRequested, setHelpRequested] = useState(false)
  const [showMoreHelp, setShowMoreHelp] = useState(false)
  const surface = highContrast ? "#FFFFFF" : "#F8FAFC"
  const ink = highContrast ? "#000000" : "#0B1D3A"

  return (
    <section className={largeText ? "text-base" : "text-sm"} aria-label="Recovery overview">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor: highContrast ? "#FFF7ED" : "#FFFFFF", borderColor: "#FED7AA" }}>
        <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full text-lg" style={{ backgroundColor: "#FEE2E2" }}>!</span><div><p className="font-bold" style={{ color: "#991B1B" }}>Need urgent help?</p><p className="text-xs" style={{ color: "#7C2D12" }}>For immediate danger, call 112. Your safety comes first.</p></div></div>
        <div className="flex gap-2"><a href="tel:112" className="rounded-lg px-3 py-2 text-xs font-bold" style={{ backgroundColor: "#B91C1C", color: "white" }}>Call 112</a><button type="button" onClick={onOpenResources} className="rounded-lg border px-3 py-2 text-xs font-bold" style={{ borderColor: "#FB923C", color: "#9A3412" }}>Find shelter</button></div>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl" style={{ backgroundColor: "#0B1D3A" }}>
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "#F5A623" }}>Your path to recovery</p><h2 className="mt-2 text-xl font-bold text-white" style={{ fontFamily: "Fraunces, Georgia, serif" }}>One clear step at a time.</h2><p className="mt-1 max-w-md text-xs leading-relaxed" style={{ color: "#CBD5E1" }}>Share what happened, add what you have, and receive a recovery plan made for your household.</p></div>
          <button type="button" onClick={onStartReport} className="shrink-0 rounded-xl px-4 py-3 text-sm font-bold" style={{ backgroundColor: "#F5A623", color: "#0B1D3A" }}>Start your report - about 5 min</button>
        </div>
        <div className="grid grid-cols-3 border-t" style={{ borderColor: "#1E3A68" }}>
          {[['1', 'Tell your story'], ['2', 'Add evidence'], ['3', 'Get your plan']].map(([number, label]) => <div key={number} className="px-4 py-3 text-center"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: number === '1' ? '#F5A623' : '#17345F', color: number === '1' ? '#0B1D3A' : '#BFDBFE' }}>{number}</span><p className="mt-1 text-[11px] font-medium" style={{ color: '#E2E8F0' }}>{label}</p></div>)}
        </div>
      </div>

      <button type="button" onClick={() => setShowMoreHelp(!showMoreHelp)} className="mb-5 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: ink }} aria-expanded={showMoreHelp}>
        <span><span className="block text-xs font-bold">More recovery help</span><span className="mt-0.5 block text-[11px]" style={{ color: '#64748B' }}>Documents, local support, your timeline and display settings</span></span><span className="text-lg" aria-hidden="true">{showMoreHelp ? '-' : '+'}</span>
      </button>

      {showMoreHelp && <>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[['0%', 'Report complete', 'Start with your story'], ['0', 'Evidence added', 'Photos, bills, documents'], ['Next step', 'Tell us what happened', 'Your report is saved privately']].map(([value, label, note]) => <div key={label} className="rounded-xl border p-4" style={{ backgroundColor: surface, borderColor: '#E2E8F0' }}><p className="text-lg font-bold" style={{ color: ink }}>{value}</p><p className="mt-1 text-xs font-semibold" style={{ color: ink }}>{label}</p><p className="mt-1 text-[11px]" style={{ color: highContrast ? '#374151' : '#64748B' }}>{note}</p></div>)}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border p-5" style={{ backgroundColor: surface, borderColor: '#BFDBFE' }}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#0369A1' }}>AI recovery insight</p><h3 className="mt-1 font-bold" style={{ color: ink }}>Support tailored to your loss</h3></div><span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>Private & secure</span></div><div className="mt-4 rounded-xl p-3" style={{ backgroundColor: '#EFF6FF' }}><p className="text-xs font-semibold" style={{ color: '#1E3A8A' }}>We can identify damaged items and likely support options from your report.</p><p className="mt-1 text-[11px] leading-relaxed" style={{ color: '#475569' }}>You always review and correct suggestions before they are shared.</p></div><button type="button" onClick={onStartReport} className="mt-4 text-xs font-bold" style={{ color: '#0369A1' }}>See how AI helps →</button></div>
        <div className="rounded-2xl border p-5" style={{ backgroundColor: surface, borderColor: '#BBF7D0' }}><p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#15803D' }}>Nearby verified support</p><div className="relative mt-3 h-24 overflow-hidden rounded-xl" style={{ background: 'linear-gradient(135deg, #DCFCE7, #DBEAFE)' }}><div className="absolute left-[18%] top-[22%] h-3 w-3 rounded-full border-2 border-white" style={{ backgroundColor: '#15803D' }} /><div className="absolute right-[22%] top-[42%] h-3 w-3 rounded-full border-2 border-white" style={{ backgroundColor: '#0369A1' }} /><div className="absolute left-[43%] bottom-[18%] h-3 w-3 rounded-full border-2 border-white" style={{ backgroundColor: '#C2410C' }} /><div className="absolute inset-x-0 top-1/2 border-t border-dashed" style={{ borderColor: '#93C5FD' }} /></div><div className="mt-3 flex items-center justify-between"><div><p className="text-xs font-bold" style={{ color: ink }}>3 verified centres near you</p><p className="text-[11px]" style={{ color: '#64748B' }}>Shelter, medical care and NGO support</p></div><button type="button" onClick={onOpenResources} className="text-xs font-bold" style={{ color: '#15803D' }}>View support →</button></div></div>
      </div>

      <div className="mb-6 rounded-2xl border p-5" style={{ backgroundColor: surface, borderColor: '#E2E8F0' }}><div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#A16207' }}>Document recovery assistant</p><h3 className="mt-1 font-bold" style={{ color: ink }}>Lost an important document?</h3></div><button type="button" onClick={onOpenResources} className="text-xs font-bold" style={{ color: '#0369A1' }}>View all guides →</button></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{['Aadhaar', 'Ration card', 'Bank records', 'School certificate'].map((document) => <button type="button" key={document} onClick={onOpenResources} className="rounded-xl border p-3 text-left transition-transform hover:-translate-y-0.5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}><span className="text-base">□</span><p className="mt-1 text-xs font-bold" style={{ color: ink }}>{document}</p><p className="mt-1 text-[10px]" style={{ color: '#64748B' }}>How to replace</p></button>)}</div></div>

      <div className="mb-7 rounded-2xl border p-5" style={{ backgroundColor: surface, borderColor: '#E2E8F0' }}><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7C3AED' }}>Recovery timeline</p><h3 className="mt-1 font-bold" style={{ color: ink }}>Small steps, lasting recovery</h3></div><span className="text-[10px] font-semibold" style={{ color: '#64748B' }}>Your plan updates as you progress</span></div><div className="mt-5 grid grid-cols-4 gap-2">{[['Today', 'Safety'], ['7 days', 'Stabilise'], ['30 days', 'Recover'], ['90 days', 'Rebuild']].map(([time, task], index) => <div key={time} className="relative"><div className="flex items-center"><span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: index === 0 ? '#7C3AED' : '#EDE9FE', color: index === 0 ? '#FFFFFF' : '#6D28D9' }}>{index + 1}</span>{index < 3 && <span className="h-px flex-1" style={{ backgroundColor: '#DDD6FE' }} />}</div><p className="mt-2 text-[11px] font-bold" style={{ color: ink }}>{time}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{task}</p></div>)}</div></div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}><div><p className="text-xs font-bold" style={{ color: ink }}>Make RECLAIM easier to use</p><p className="text-[11px]" style={{ color: '#64748B' }}>Choose comfortable display settings for this page.</p></div><div className="flex gap-2"><button type="button" onClick={() => setLargeText(!largeText)} className="rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: largeText ? '#0B1D3A' : '#CBD5E1', backgroundColor: largeText ? '#0B1D3A' : '#FFFFFF', color: largeText ? '#FFFFFF' : ink }}>A+ Large text</button><button type="button" onClick={() => setHighContrast(!highContrast)} className="rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: highContrast ? '#000000' : '#CBD5E1', backgroundColor: highContrast ? '#000000' : '#FFFFFF', color: highContrast ? '#FFFFFF' : ink }}>High contrast</button></div></div>
      </>}

      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl p-4" style={{ backgroundColor: '#ECFDF5' }}><div><p className="text-xs font-bold" style={{ color: '#166534' }}>Trusted by communities rebuilding after disaster</p><p className="mt-1 text-[11px]" style={{ color: '#15803D' }}>Private reports • Verified partners • Recovery support built around you</p></div><button type="button" onClick={() => setHelpRequested(true)} className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold" style={{ backgroundColor: helpRequested ? '#DCFCE7' : '#15803D', color: helpRequested ? '#166534' : '#FFFFFF' }}>{helpRequested ? 'Help request sent' : 'Request a visit'}</button></div>
    </section>
  )
}

const CHAT_FAQS = [
  ["What should I do first?", "Prioritise safety, take photos of damage if it is safe, and tell us about lost documents or income."],
  ["What evidence can I upload?", "Upload damage photos, videos, bills, identity documents, and any useful witness details."],
  ["Is my information private?", "Yes. Your report is encrypted and shared only with verified relief teams when needed for support."],
  ["How do I get emergency help?", "For immediate danger, contact local emergency services. You can also use Help & Resources in RECLAIM to find verified support."],
]

function VictimSupportChat() {
  const [open, setOpen] = useState(true)
  const [question, setQuestion] = useState("")
  const [reply, setReply] = useState("Hello. I can help you prepare your recovery report or explain the next step.")
  const sendQuestion = () => {
    if (!question.trim()) return
    setReply("Thanks — start with your story and evidence. A verified support team can follow up if further help is needed.")
    setQuestion("")
  }

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="fixed right-5 top-24 z-30 hidden rounded-full px-4 py-3 text-sm font-bold shadow-xl xl:block" style={{ backgroundColor: "#0B1D3A", color: "white" }}>Help chat</button>

  return <aside className="fixed right-5 top-24 z-30 hidden w-72 rounded-2xl border p-4 shadow-xl xl:block" style={{ backgroundColor: "white", borderColor: "#BFDBFE" }} aria-label="Recovery support chat">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#0369A1" }}>RECLAIM support</p><h2 className="mt-1 text-base font-bold" style={{ color: "#0B1D3A" }}>How can we help?</h2></div><button type="button" onClick={() => setOpen(false)} className="text-lg leading-none" style={{ color: "#64748b" }} aria-label="Close support chat">×</button></div>
    <div className="mt-3 rounded-xl p-3 text-xs leading-relaxed" style={{ backgroundColor: "#E0F2FE", color: "#075985" }}>{reply}</div>
    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>Quick answers</p>
    <div className="mt-2 space-y-1.5">{CHAT_FAQS.map(([label, answer]) => <button key={label} type="button" onClick={() => setReply(answer)} className="w-full rounded-lg border px-2.5 py-2 text-left text-xs font-medium" style={{ borderColor: "#E2E8F0", color: "#0B1D3A" }}>{label}</button>)}</div>
    <div className="mt-3 flex gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendQuestion() }} placeholder="Ask a question..." className="min-w-0 flex-1 rounded-lg border px-2.5 py-2 text-xs" style={{ borderColor: "#CBD5E1" }} aria-label="Ask the support chat" /><button type="button" onClick={sendQuestion} className="rounded-lg px-2.5 text-xs font-bold" style={{ backgroundColor: "#0B1D3A", color: "white" }}>Send</button></div>
  </aside>
}

export default function CitizenApp({
  disaster,
  language = "en",
  onChangeLanguage,
}: {
  disaster: Disaster
  language?: string
  onChangeLanguage?: () => void
}) {
  const getStepFromUrl = () => {
    const value = Number(
      new URLSearchParams(window.location.search).get("recoveryStep"),
    )
    return Number.isInteger(value) && value >= 1 && value <= 6 ? value : 1
  }
  const [step, setStep] = useState(getStepFromUrl)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [processing, setProcessing] = useState(false)
  const [scanStage, setScanStage] = useState<"story" | "evidence">("story")
  const [whatIfAadhaar, setWhatIfAadhaar] = useState(false)
  const [whatIfSewing, setWhatIfSewing] = useState(false)
  const [uploadedItems, setUploadedItems] = useState<string[]>([])
  const [fieldToolMessage, setFieldToolMessage] = useState(
    "Offline vault protected",
  )

  const baseScore = 87
  const simulatedScore =
    baseScore - (whatIfAadhaar ? 16 : 0) - (whatIfSewing ? 18 : 0)

  const STEPS = [
    { id: 1, label: "Your Story", icon: "🎙️" },
    { id: 2, label: "Evidence", icon: "📷" },
    { id: 3, label: "AI Analysis", icon: "🤖" },
    { id: 4, label: "Your Profile", icon: "📊" },
    { id: 5, label: "Recovery Plan", icon: "📋" },
    { id: 6, label: "Help & Resources", icon: "🆘" },
  ]

  useEffect(() => {
    const syncStepWithHistory = () => setStep(getStepFromUrl())
    window.addEventListener("popstate", syncStepWithHistory)
    return () => window.removeEventListener("popstate", syncStepWithHistory)
  }, [])

  useEffect(() => {
    document
      .getElementById("app-content")
      ?.scrollTo({ top: 0, behavior: "auto" })
  }, [step])

  function goToStep(nextStep: number) {
    setStep(nextStep)
    const params = new URLSearchParams(window.location.search)
    if (nextStep === 1) {
      params.delete("recoveryStep")
    } else {
      params.set("recoveryStep", String(nextStep))
    }
    window.history.pushState(null, "", `?${params.toString()}`)
  }

  function handleVoiceToggle() {
    if (!recording) {
      setRecording(true)
      setTimeout(() => {
        setRecording(false)
        setTranscript(
          "The flood entered my house. My refrigerator, sewing machine, Aadhaar card, and children's school certificates were damaged or lost. My shop stock worth around ₹60,000 is completely destroyed.",
        )
      }, 3500)
    }
  }

  function handleSubmitReport(nextStep = 3) {
    setScanStage(nextStep === 2 ? "story" : "evidence")
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      goToStep(nextStep)
    }, 2500)
  }

  function toggleUpload(item: string) {
    setUploadedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    )
  }

  const ui = (key: string) => t(language, key)

  return (
    <div className="flex min-h-full lg:pl-56" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Left sidebar — progress */}
      <div
        className="fixed left-0 top-16 z-20 hidden h-[calc(100dvh-4rem)] w-56 flex-col overflow-y-auto overscroll-contain px-5 py-8 lg:flex"
        style={{ backgroundColor: "#0B1D3A" }}
      >
        <div className="mb-8">
          <div
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#64748b" }}
          >
            Recovery Report
          </div>
          <div
            className="text-white text-sm mt-1"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            {disaster.households[0]?.name ?? "Household"}
          </div>
          <div className="text-xs" style={{ color: "#64748b" }}>
            {disaster.district}, {disaster.state}
          </div>
        </div>

        {onChangeLanguage && (
          <button
            onClick={onChangeLanguage}
            className="w-full mb-6 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: "#0F2347",
              color: "#F5A623",
              border: "1px solid #F5A623",
            }}
          >
            🌐 Change Language
          </button>
        )}

        <nav className="flex flex-col gap-1">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
              onClick={() => s.id < step && goToStep(s.id)}
              style={
                step === s.id
                  ? { backgroundColor: "#F5A623", color: "#0B1D3A" }
                  : s.id < step
                    ? { color: "#94a3b8" }
                    : { color: "#475569" }
              }
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={
                  step === s.id
                    ? { backgroundColor: "#0B1D3A", color: "#F5A623" }
                    : s.id < step
                      ? { backgroundColor: "#15803D", color: "white" }
                      : { backgroundColor: "#0F2347", color: "#475569" }
                }
              >
                {s.id < step ? "✓" : s.id}
              </div>
              <span className="text-sm font-medium">{s.label}</span>
            </div>
          ))}
        </nav>

        <div
          className="mt-auto pt-6 border-t"
          style={{ borderColor: "#0F2347" }}
        >
          <div
            className="text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: "#64748b" }}
          >
            Field-ready tools
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() =>
                setFieldToolMessage(
                  `${uploadedItems.length || 3} evidence item${
                    (uploadedItems.length || 3) === 1 ? "" : "s"
                  } queued for secure sync`,
                )
              }
              className="w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors"
              style={{ backgroundColor: "#143060", color: "#BFDBFE" }}
            >
              ↻ Sync offline evidence
            </button>
            <button
              type="button"
              onClick={() => goToStep(6)}
              className="w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors"
              style={{ backgroundColor: "#0F2347", color: "#FDE68A" }}
            >
              ↗ Helpful links & support
            </button>
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors"
              style={{ backgroundColor: "#0F2347", color: "#A7F3D0" }}
            >
              ▣ View uploaded evidence
            </button>
          </div>
          <div
            aria-live="polite"
            className="mt-3 flex items-start gap-1.5 text-[10px] leading-snug"
            style={{ color: "#64748b" }}
          >
            <span
              className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#15803D" }}
            />
            <span>{fieldToolMessage}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Step 1: Report */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto py-10 px-6 animate-slide-up xl:mr-80">
            <div className="mb-8">
              <h1
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: "#0B1D3A",
                }}
              >
                {ui("title")}
              </h1>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#64748b" }}
              >
                {ui("sub")}
              </p>
            </div>

            {/* Voice input */}
            <div
              className="rounded-2xl p-8 mb-6 flex flex-col items-center text-center"
              style={{ backgroundColor: "#0B1D3A" }}
            >
              <div className="relative mb-6">
                {recording && (
                  <div
                    className="absolute inset-0 rounded-full animate-pulse-ring"
                    style={{
                      backgroundColor: "#F5A623",
                      opacity: 0.3,
                      transform: "scale(1.5)",
                    }}
                  />
                )}
                <button
                  onClick={handleVoiceToggle}
                  className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 relative z-10"
                  style={{ backgroundColor: recording ? "#B91C1C" : "#F5A623" }}
                >
                  {recording ? (
                    <div className="flex items-end gap-1 h-8">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 rounded-full wave-bar"
                          style={{ backgroundColor: "white", height: "8px" }}
                        />
                      ))}
                    </div>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none">
                      <rect
                        x="9"
                        y="2"
                        width="6"
                        height="13"
                        rx="3"
                        fill="#0B1D3A"
                      />
                      <path
                        d="M5 10a7 7 0 0014 0"
                        stroke="#0B1D3A"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="12"
                        y1="19"
                        x2="12"
                        y2="22"
                        stroke="#0B1D3A"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-white font-medium text-sm mb-1">
                {ui("voiceBtn")}
              </p>
              {recording && (
                <p className="text-xs" style={{ color: "#F5A623" }}>
                  Recording… speak naturally
                </p>
              )}
            </div>

            {/* Transcript */}
            {transcript && (
              <div
                className="rounded-xl p-4 mb-6 border animate-fade-in"
                style={{ backgroundColor: "#DCFCE7", borderColor: "#86efac" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: "#15803D",
                      display: "inline-block",
                    }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#15803D" }}
                  >
                    Voice transcribed successfully
                  </span>
                </div>
                <p className="text-sm italic" style={{ color: "#166534" }}>
                  "{transcript}"
                </p>
              </div>
            )}

            {/* Text input */}
            <div className="mb-6">
              <label
                className="text-xs font-semibold uppercase tracking-wider block mb-2"
                style={{ color: "#64748b" }}
              >
                {ui("typeLabel")}
              </label>
              <textarea
                id="story-input"
                rows={4}
                placeholder={ui("placeholder")}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#e2e8f0",
                  color: "#0B1D3A",
                  backgroundColor: "white",
                  fontFamily: "Inter, sans-serif",
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmitReport(2)}
                disabled={!transcript}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                style={
                  transcript
                    ? { backgroundColor: "#0B1D3A", color: "white" }
                    : {
                        backgroundColor: "#e2e8f0",
                        color: "#94a3b8",
                        cursor: "not-allowed",
                      }
                }
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin-slow"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#94a3b8"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 2a10 10 0 0110 10"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Analysing…
                  </span>
                ) : (
                  ui("continueBtn") + " →"
                )}
              </button>
              <button
                className="px-4 py-3 rounded-xl text-sm border transition-all"
                style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                onClick={() => goToStep(2)}
              >
                {ui("dontKnow")}
              </button>
            </div>

          </div>
        )}

        {/* Step 2: Evidence Upload */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto py-10 px-6 animate-slide-up">
            <div className="mb-8">
              <h1
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: "#0B1D3A",
                }}
              >
                {ui("uploadTitle")}
              </h1>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#64748b" }}
              >
                {ui("uploadSub")}
              </p>
            </div>

            {[
              {
                id: "photos",
                label: "Damage Photos",
                sub: "JPG, PNG — photos of damaged property",
                icon: "📸",
                hint: "Take photos of each damaged item separately",
              },
              {
                id: "videos",
                label: "Video Evidence",
                sub: "MP4, MOV — walkthrough of damage",
                icon: "🎥",
                hint: "Short video of your home or shop helps verify claims",
              },
              {
                id: "bills",
                label: "Bills & Receipts",
                sub: "PDF, JPG — purchase receipts, invoices",
                icon: "🧾",
                hint: "Bills prove the original value of lost items",
              },
              {
                id: "documents",
                label: "Identity & Insurance Documents",
                sub: "PDF, JPG — Aadhaar, policy papers, property records",
                icon: "📄",
                hint: "Even a photo of the document on your phone helps",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="rounded-xl p-5 mb-4 border-2 cursor-pointer transition-all"
                style={
                  uploadedItems.includes(item.id)
                    ? { borderColor: "#15803D", backgroundColor: "#DCFCE7" }
                    : { borderColor: "#e2e8f0", backgroundColor: "white" }
                }
                onClick={() => toggleUpload(item.id)}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "#0B1D3A" }}
                      >
                        {item.label}
                      </span>
                      {uploadedItems.includes(item.id) ? (
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#15803D" }}
                        >
                          ✓ Added
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "#94a3b8" }}>
                          Tap to add
                        </span>
                      )}
                    </div>
                    <p className="text-xs mb-1" style={{ color: "#64748b" }}>
                      {item.sub}
                    </p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {item.hint}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div
              className="rounded-xl p-4 mb-6 flex gap-3"
              style={{ backgroundColor: "#FEF3C7" }}
            >
              <span className="text-xl">🔒</span>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#92400e" }}
              >
                {ui("privacyNote")}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmitReport(3)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: "#0B1D3A", color: "white" }}
              >
                {processing ? "Analysing…" : "Submit & Analyse →"}
              </button>
              <button
                onClick={() => handleSubmitReport(3)}
                className="px-4 py-3 rounded-xl text-sm border"
                style={{ borderColor: "#e2e8f0", color: "#64748b" }}
              >
                {ui("skipBtn")}
              </button>
            </div>
          </div>
        )}

        {processing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1D3A]/80 px-5"
            role="status"
            aria-live="polite"
          >
            <div
              className="w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-slide-up"
              style={{ backgroundColor: "white" }}
            >
              <div
                className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: "#E0F2FE" }}
              >
                <div
                  className="absolute inset-0 rounded-full border-2 animate-pulse-ring"
                  style={{ borderColor: "#0284c7" }}
                />
                <svg
                  className="h-9 w-9 animate-spin-slow"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 12h16M12 4v16"
                    stroke="#0B1D3A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: "#0B1D3A",
                }}
              >
                {scanStage === "story"
                  ? "AI is understanding your story"
                  : "AI is preparing your evidence review"}
              </h2>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "#64748b" }}
              >
                {scanStage === "story"
                  ? "Reading the context of what happened, identifying urgent needs, and preparing the right questions for your recovery report."
                  : "Securely scanning your story and attachments for damage, documents, and possible losses."}
              </p>
              <div
                className="mt-6 h-1.5 overflow-hidden rounded-full"
                style={{ backgroundColor: "#e2e8f0" }}
              >
                <div
                  className="h-full rounded-full animate-ai-scan"
                  style={{ backgroundColor: "#0284c7" }}
                />
              </div>
              <p className="mt-3 text-xs" style={{ color: "#94a3b8" }}>
                Your files remain private and encrypted.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: AI Analysis */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto py-10 px-6 animate-slide-up">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#DCFCE7" }}
                >
                  <span>✓</span>
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#15803D" }}
                >
                  AI Analysis Complete
                </span>
              </div>
              <h1
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: "#0B1D3A",
                }}
              >
                What RECLAIM found
              </h1>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Based on your voice report and uploaded evidence, our AI has
                identified the following assets and losses.
              </p>
            </div>

            <div className="mb-6">
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "#64748b" }}
              >
                Detected Assets & Losses
              </div>
              <div
                className="rounded-xl overflow-hidden border"
                style={{ borderColor: "#e2e8f0" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC" }}>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold"
                        style={{ color: "#64748b" }}
                      >
                        Asset
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold"
                        style={{ color: "#64748b" }}
                      >
                        Evidence
                      </th>
                      <th
                        className="text-center px-4 py-3 text-xs font-semibold"
                        style={{ color: "#64748b" }}
                      >
                        AI Confidence
                      </th>
                      <th
                        className="text-right px-4 py-3 text-xs font-semibold"
                        style={{ color: "#64748b" }}
                      >
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {AI_DETECTIONS.map((d, i) => (
                      <tr
                        key={d.asset}
                        className="border-t"
                        style={{
                          borderColor: "#f1f5f9",
                          backgroundColor: i % 2 === 0 ? "white" : "#FAFAFA",
                        }}
                      >
                        <td className="px-4 py-3">
                          <div
                            className="font-medium text-sm"
                            style={{ color: "#0B1D3A" }}
                          >
                            {d.asset}
                          </div>
                          <div className="text-xs" style={{ color: "#94a3b8" }}>
                            {d.category}
                          </div>
                          {d.ocr && (
                            <div
                              className="text-xs mt-0.5"
                              style={{
                                color: "#15803D",
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              OCR: {d.ocr}
                            </div>
                          )}
                          {d.value && (
                            <div
                              className="text-xs"
                              style={{
                                color: "#64748b",
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              Est. ₹{d.value.toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#64748b" }}
                        >
                          {d.evidence}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ConfidenceBadge value={d.confidence} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ImportanceBadge value={d.importance} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div
                className="rounded-xl p-4 text-center border"
                style={{ borderColor: "#e2e8f0", backgroundColor: "white" }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "#0B1D3A",
                  }}
                >
                  ₹1.27L
                </div>
                <div className="text-xs mt-1" style={{ color: "#64748b" }}>
                  Total estimated loss
                </div>
              </div>
              <div
                className="rounded-xl p-4 text-center border"
                style={{ borderColor: "#FEE2E2", backgroundColor: "#FEE2E2" }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "#B91C1C",
                  }}
                >
                  3
                </div>
                <div className="text-xs mt-1" style={{ color: "#991b1b" }}>
                  Critical blockers
                </div>
              </div>
              <div
                className="rounded-xl p-4 text-center border"
                style={{ borderColor: "#FFEDD5", backgroundColor: "#FFEDD5" }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "#C2410C",
                  }}
                >
                  6
                </div>
                <div className="text-xs mt-1" style={{ color: "#9a3412" }}>
                  Assets identified
                </div>
              </div>
            </div>

            <button
              onClick={() => goToStep(4)}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: "#0B1D3A", color: "white" }}
            >
              View Your Recovery Profile →
            </button>
          </div>
        )}

        {/* Step 4: HRVS + Recovery Intelligence */}
        {step === 4 && (
          <div className="max-w-3xl mx-auto py-10 px-6 animate-slide-up">
            <div className="mb-8">
              <h1
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: "#0B1D3A",
                }}
              >
                {ui("yourProfile")}
              </h1>
              <p className="text-sm" style={{ color: "#64748b" }}>
                The Household Recovery Vulnerability Score (HRVS) measures how
                difficult recovery may be — not just how much was lost.
              </p>
            </div>

            {/* HRVS Hero */}
            <div
              className="rounded-2xl p-8 mb-6 flex flex-col md:flex-row items-center gap-8"
              style={{ backgroundColor: "#0B1D3A" }}
            >
              <ScoreCircle
                score={simulatedScore}
                label={
                  simulatedScore >= 80
                    ? "CRITICAL"
                    : simulatedScore >= 60
                      ? "HIGH"
                      : "RECOVERING"
                }
              />
              <div className="flex-1">
                <div
                  className="text-white text-lg font-semibold mb-1"
                  style={{ fontFamily: "Fraunces, Georgia, serif" }}
                >
                  {disaster.households[0]?.name ?? "Household"} —{" "}
                  {disaster.district}
                </div>
                <div className="text-xs mb-4" style={{ color: "#94a3b8" }}>
                  {disaster.name} · Day {disaster.day}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: "#B91C1C" }}>●</span>
                    <span style={{ color: "#fca5a5" }}>
                      Primary blocker: Lost identity documents (Aadhaar)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: "#C2410C" }}>●</span>
                    <span style={{ color: "#fdba74" }}>
                      Livelihood blocker: Destroyed sewing machine
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span style={{ color: "#A16207" }}>●</span>
                    <span style={{ color: "#fcd34d" }}>
                      Estimated livelihood disruption: 4–6 months
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* HRVS Breakdown */}
            <div
              className="rounded-2xl border p-6 mb-6"
              style={{ borderColor: "#e2e8f0", backgroundColor: "white" }}
            >
              <div
                className="text-sm font-semibold mb-4"
                style={{ color: "#0B1D3A" }}
              >
                Why is this score high? — Score Breakdown
              </div>
              {HRVS_FACTORS.map((f) => (
                <div key={f.label} className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#0B1D3A" }}
                    >
                      {f.label}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        color: "#0B1D3A",
                      }}
                    >
                      {f.score}/{f.max}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full mb-1"
                    style={{ backgroundColor: "#f1f5f9" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${(f.score / f.max) * 100}%`,
                        backgroundColor:
                          f.score / f.max >= 0.9
                            ? "#B91C1C"
                            : f.score / f.max >= 0.7
                              ? "#C2410C"
                              : "#A16207",
                      }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>
                    {f.reason}
                  </p>
                </div>
              ))}
            </div>

            {/* Recovery Dependency Engine */}
            <div
              className="rounded-2xl border p-6 mb-6"
              style={{ borderColor: "#e2e8f0", backgroundColor: "white" }}
            >
              <div
                className="text-sm font-semibold mb-1"
                style={{ color: "#0B1D3A" }}
              >
                Recovery Dependency Engine
              </div>
              <p className="text-xs mb-5" style={{ color: "#64748b" }}>
                RECLAIM understands how one loss cascades into others —
                identifying which loss to fix first.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    chain: DEPENDENCY_CHAIN,
                    title: "Documentation Loss Chain",
                  },
                  { chain: SEWING_CHAIN, title: "Livelihood Loss Chain" },
                ].map(({ chain, title }) => (
                  <div key={title}>
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: "#64748b" }}
                    >
                      {title}
                    </div>
                    <div className="space-y-1">
                      {chain.map((node, i) => (
                        <div key={i}>
                          <div
                            className="rounded-lg px-3 py-2 text-xs font-medium"
                            style={
                              node.type === "loss"
                                ? {
                                    backgroundColor: "#FEE2E2",
                                    color: "#B91C1C",
                                    border: "1px solid #fca5a5",
                                  }
                                : node.terminal
                                  ? {
                                      backgroundColor: "#FFEDD5",
                                      color: "#C2410C",
                                      border: "1px solid #fdba74",
                                    }
                                  : {
                                      backgroundColor: "#F8FAFC",
                                      color: "#475569",
                                      border: "1px solid #e2e8f0",
                                    }
                            }
                          >
                            {node.node}
                          </div>
                          {i < chain.length - 1 && (
                            <div className="flex justify-center py-1">
                              <span
                                style={{ color: "#cbd5e1", fontSize: "16px" }}
                              >
                                ↓
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What-If Simulator */}
            <div
              className="rounded-2xl border p-6 mb-6"
              style={{ borderColor: "#e2e8f0", backgroundColor: "#FFFBEB" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span>⚡</span>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#0B1D3A" }}
                >
                  What-If Recovery Simulator
                </div>
              </div>
              <p className="text-xs mb-5" style={{ color: "#64748b" }}>
                Toggle interventions to see how your HRVS changes.
              </p>
              <div className="space-y-3 mb-4">
                {[
                  {
                    id: "aadhaar",
                    label: "Aadhaar & identity documents replaced",
                    impact: "-16 HRVS points",
                    active: whatIfAadhaar,
                    toggle: () => setWhatIfAadhaar(!whatIfAadhaar),
                  },
                  {
                    id: "sewing",
                    label: "Sewing machine replaced (livelihood restored)",
                    impact: "-18 HRVS points",
                    active: whatIfSewing,
                    toggle: () => setWhatIfSewing(!whatIfSewing),
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl p-3 border cursor-pointer transition-all"
                    style={
                      item.active
                        ? { borderColor: "#15803D", backgroundColor: "#DCFCE7" }
                        : { borderColor: "#e2e8f0", backgroundColor: "white" }
                    }
                    onClick={item.toggle}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                        style={
                          item.active
                            ? {
                                backgroundColor: "#15803D",
                                borderColor: "#15803D",
                              }
                            : { borderColor: "#cbd5e1" }
                        }
                      >
                        {item.active && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <span className="text-sm" style={{ color: "#0B1D3A" }}>
                        {item.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: "#15803D",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {item.impact}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="flex items-center justify-between rounded-xl p-4"
                style={{ backgroundColor: "#0B1D3A" }}
              >
                <span className="text-white text-sm">
                  Projected HRVS after interventions
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color:
                        simulatedScore >= 80
                          ? "#fca5a5"
                          : simulatedScore >= 60
                            ? "#fdba74"
                            : "#86efac",
                    }}
                  >
                    {simulatedScore}
                  </span>
                  {simulatedScore < baseScore && (
                    <span
                      className="text-xs"
                      style={{
                        color: "#86efac",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      ↓ {baseScore - simulatedScore} from {baseScore}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => goToStep(5)}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: "#0B1D3A", color: "white" }}
            >
              See Your Recovery Plan →
            </button>
          </div>
        )}

        {/* Step 5: Recovery Plan */}
        {step === 5 && (
          <div className="max-w-3xl mx-auto py-10 px-6 animate-slide-up">
            <div className="mb-8">
              <h1
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: "#0B1D3A",
                }}
              >
                {ui("yourPlan")}
              </h1>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Your recovery path, broken into achievable stages. Each phase
                builds on the previous one.
              </p>
            </div>

            {/* Recovery Clock */}
            <div className="relative mb-8">
              <div className="flex justify-between mb-2 relative">
                <div
                  className="absolute top-5 left-0 right-0 h-0.5"
                  style={{ backgroundColor: "#e2e8f0" }}
                />
                {RECOVERY_PHASES.map((phase, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center relative z-10 flex-1"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 border-2"
                      style={
                        phase.done
                          ? {
                              backgroundColor: "#15803D",
                              borderColor: "#15803D",
                              color: "white",
                            }
                          : phase.current
                            ? {
                                backgroundColor: "#C2410C",
                                borderColor: "#C2410C",
                                color: "white",
                              }
                            : {
                                backgroundColor: "white",
                                borderColor: "#e2e8f0",
                                color: "#94a3b8",
                              }
                      }
                    >
                      {phase.done ? "✓" : i + 1}
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color: phase.current
                          ? "#C2410C"
                          : phase.done
                            ? "#15803D"
                            : "#94a3b8",
                      }}
                    >
                      {phase.label}
                    </span>
                    <span className="text-xs" style={{ color: "#94a3b8" }}>
                      {phase.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {RECOVERY_PHASES.map((phase, i) => (
                <div
                  key={i}
                  className="rounded-2xl border p-5 transition-all"
                  style={
                    phase.current
                      ? { borderColor: "#fdba74", backgroundColor: "#FFFBEB" }
                      : phase.done
                        ? { borderColor: "#86efac", backgroundColor: "#F0FDF4" }
                        : { borderColor: "#e2e8f0", backgroundColor: "white" }
                  }
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span
                        className="font-bold text-base"
                        style={{
                          fontFamily: "Fraunces, Georgia, serif",
                          color: phase.color,
                        }}
                      >
                        {phase.label}
                      </span>
                      <span
                        className="text-sm ml-2"
                        style={{ color: "#64748b" }}
                      >
                        — {phase.stage}
                      </span>
                    </div>
                    {phase.current && (
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: "#C2410C", color: "white" }}
                      >
                        Current Phase
                      </span>
                    )}
                    {phase.done && (
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: "#15803D", color: "white" }}
                      >
                        Completed
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {phase.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
                          style={
                            phase.done
                              ? { backgroundColor: "#15803D", color: "white" }
                              : { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                          }
                        >
                          {phase.done ? "✓" : "○"}
                        </div>
                        <span
                          style={{ color: phase.done ? "#166534" : "#374151" }}
                        >
                          {task}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              className="mt-6 rounded-2xl p-6 flex items-center justify-between"
              style={{ backgroundColor: "#0B1D3A" }}
            >
              <div>
                <div className="text-white font-semibold mb-1">
                  Need help right now?
                </div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>
                  View helplines, schemes, and NGO contacts
                </div>
              </div>
              <button
                onClick={() => goToStep(6)}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: "#F5A623", color: "#0B1D3A" }}
              >
                Help & Resources →
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Help & Resources */}
        {step === 6 && (
          <div className="max-w-3xl mx-auto py-10 px-6 animate-slide-up">
            <div className="mb-8">
              <h1
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: "#0B1D3A",
                }}
              >
                {ui("resourcesTitle")}
              </h1>
              <p className="text-sm" style={{ color: "#64748b" }}>
                {ui("resourcesSub")}
              </p>
            </div>

            {/* Emergency Helplines */}
            <div
              className="rounded-2xl border p-6 mb-5"
              style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🚨</span>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#0B1D3A" }}
                >
                  {ui("helplines")}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: "National Disaster Response Force (NDRF)",
                    number: "011-24363260",
                    type: "Central",
                    color: "#B91C1C",
                    bg: "#FEE2E2",
                  },
                  {
                    name: "PM Helpline — Disaster Relief",
                    number: "1800-180-5999",
                    type: "Free",
                    color: "#15803D",
                    bg: "#DCFCE7",
                  },
                  {
                    name: "National Emergency Number",
                    number: "112",
                    type: "Police/Fire/Medical",
                    color: "#C2410C",
                    bg: "#FFEDD5",
                  },
                  {
                    name: "State Disaster Management Authority",
                    number: "1070",
                    type: "State",
                    color: "#0369A1",
                    bg: "#E0F2FE",
                  },
                  {
                    name: "Red Cross Emergency",
                    number: "1800-111-545",
                    type: "NGO / Free",
                    color: "#7C3AED",
                    bg: "#EDE9FE",
                  },
                ].map((h) => (
                  <div
                    key={h.name}
                    className="flex items-center justify-between rounded-xl p-3 border"
                    style={{
                      borderColor: "#e2e8f0",
                      backgroundColor: "#FAFAFA",
                    }}
                  >
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "#0B1D3A" }}
                      >
                        {h.name}
                      </div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>
                        {h.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold px-2 py-0.5 rounded"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          backgroundColor: h.bg,
                          color: h.color,
                        }}
                      >
                        {h.number}
                      </span>
                      <a
                        href={`tel:${h.number.replace(/-/g, "")}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: h.color, color: "white" }}
                      >
                        {ui("callBtn")}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Government Schemes */}
            <div
              className="rounded-2xl border p-6 mb-5"
              style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🏛️</span>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#0B1D3A" }}
                >
                  {ui("schemes")}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  {
                    name: "NDRF Ex-Gratia Relief",
                    benefit: "Cash compensation for verified losses",
                    eligibility: "HRVS ≥ 60, certified damage",
                    link: "ndma.gov.in",
                    match: true,
                  },
                  {
                    name: "PM Awas Yojana (Housing)",
                    benefit: "Up to ₹1.2L for house reconstruction",
                    eligibility: "BPL / EWS families, house destroyed",
                    link: "pmaymis.gov.in",
                    match: true,
                  },
                  {
                    name: "MGNREGS Emergency Employment",
                    benefit: "100 days of paid work at ₹220/day",
                    eligibility: "Rural households, MGNREGS job card",
                    link: "mnregaweb2.nic.in",
                    match: true,
                  },
                  {
                    name: "PM Fasal Bima Yojana (Crop)",
                    benefit: "Up to 100% crop loss compensation",
                    eligibility: "Enrolled farmers, crop loss ≥ 50%",
                    link: "pmfby.gov.in",
                    match: false,
                  },
                  {
                    name: "PM-KISAN Direct Benefit",
                    benefit: "₹6,000/year for small farmers",
                    eligibility: "Landholding farmers with Aadhaar",
                    link: "pmkisan.gov.in",
                    match: false,
                  },
                  {
                    name: "Pradhan Mantri Ujjwala Yojana",
                    benefit: "Free LPG connection for BPL families",
                    eligibility: "Women BPL households, no existing connection",
                    link: "pmuy.gov.in",
                    match: false,
                  },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="rounded-xl p-4 border flex items-start justify-between gap-3"
                    style={
                      s.match
                        ? { borderColor: "#86efac", backgroundColor: "#F0FDF4" }
                        : { borderColor: "#e2e8f0", backgroundColor: "#FAFAFA" }
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "#0B1D3A" }}
                        >
                          {s.name}
                        </span>
                        {s.match && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: "#15803D",
                              color: "white",
                            }}
                          >
                            Likely eligible
                          </span>
                        )}
                      </div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "#374151" }}
                      >
                        {s.benefit}
                      </div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>
                        Eligibility: {s.eligibility}
                      </div>
                    </div>
                    <a
                      href={`https://${s.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                      style={{ backgroundColor: "#0B1D3A", color: "white" }}
                    >
                      {ui("applyBtn")} ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* NGO Contacts */}
            <div
              className="rounded-2xl border p-6 mb-5"
              style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🤝</span>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#0B1D3A" }}
                >
                  {ui("ngos")}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  {
                    name: "Oxfam India",
                    focus: "Water, food, livelihoods",
                    contact: "011-46538000",
                    url: "oxfamindia.org",
                    state: "National",
                  },
                  {
                    name: "SEEDS India",
                    focus: "Shelter, reconstruction, DRR",
                    contact: "011-41187226",
                    url: "seedsindia.org",
                    state: "National",
                  },
                  {
                    name: "Caritas India",
                    focus: "Relief, rehabilitation, food",
                    contact: "011-23363530",
                    url: "caritasindia.org",
                    state: "National",
                  },
                  {
                    name: "CARE India",
                    focus: "Women's empowerment, livelihood",
                    contact: "011-45616463",
                    url: "careindia.org",
                    state: "National",
                  },
                  {
                    name: "Aga Khan Foundation",
                    focus: "Rural development, health",
                    contact: "011-41519900",
                    url: "akfindia.org",
                    state: "National",
                  },
                  {
                    name: "HelpAge India",
                    focus: "Elderly disaster victims",
                    contact: "1800-180-1253",
                    url: "helpageindia.org",
                    state: "Free helpline",
                  },
                ].map((n) => (
                  <div
                    key={n.name}
                    className="rounded-xl p-3 border"
                    style={{
                      borderColor: "#e2e8f0",
                      backgroundColor: "#FAFAFA",
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div
                        className="font-semibold text-sm"
                        style={{ color: "#0B1D3A" }}
                      >
                        {n.name}
                      </div>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}
                      >
                        {n.state}
                      </span>
                    </div>
                    <div className="text-xs mb-2" style={{ color: "#64748b" }}>
                      {n.focus}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${n.contact.replace(/-/g, "")}`}
                        className="px-2.5 py-1 rounded text-xs font-semibold"
                        style={{ backgroundColor: "#0B1D3A", color: "white" }}
                      >
                        📞 {n.contact}
                      </a>
                      <a
                        href={`https://${n.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded text-xs font-semibold border"
                        style={{ borderColor: "#e2e8f0", color: "#64748b" }}
                      >
                        {n.url}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Replacement */}
            <div
              className="rounded-2xl border p-6 mb-5"
              style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📄</span>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#0B1D3A" }}
                >
                  {ui("docsTitle")}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  {
                    doc: "Aadhaar Card",
                    steps:
                      "Visit nearest CSC centre or Aadhaar Seva Kendra. Bring any one ID proof or witness. Free replacement within 15 days.",
                    url: "uidai.gov.in",
                    urgent: true,
                  },
                  {
                    doc: "Ration Card",
                    steps:
                      "Apply at local Fair Price Shop or Block Development Office. Disaster affidavit accepted in lieu of documents.",
                    url: "nfsa.gov.in",
                    urgent: true,
                  },
                  {
                    doc: "Bank Account / Passbook",
                    steps:
                      "Visit home branch with any remaining ID. Disaster declaration letter from RECLAIM helps.",
                    url: "bankofbaroda.in",
                    urgent: false,
                  },
                  {
                    doc: "Property / Land Records",
                    steps:
                      "District Sub-Registrar office. RECLAIM field worker can assist with affidavit preparation.",
                    url: "dilrmp.gov.in",
                    urgent: false,
                  },
                  {
                    doc: "Children's School Certificates",
                    steps:
                      "Contact the school directly — schools are required by law to issue duplicate certificates during disaster. No fee.",
                    url: "cbse.gov.in",
                    urgent: false,
                  },
                ].map((d) => (
                  <div
                    key={d.doc}
                    className="flex items-start gap-3 p-3 rounded-xl border"
                    style={
                      d.urgent
                        ? { borderColor: "#fca5a5", backgroundColor: "#FFF5F5" }
                        : { borderColor: "#e2e8f0", backgroundColor: "#FAFAFA" }
                    }
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        backgroundColor: d.urgent ? "#B91C1C" : "#94a3b8",
                      }}
                    />
                    <div className="flex-1">
                      <div
                        className="text-sm font-semibold mb-1"
                        style={{ color: "#0B1D3A" }}
                      >
                        {d.doc}
                      </div>
                      <div
                        className="text-xs leading-relaxed"
                        style={{ color: "#475569" }}
                      >
                        {d.steps}
                      </div>
                    </div>
                    <a
                      href={`https://${d.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium"
                      style={{ color: "#0369A1" }}
                    >
                      {d.url} ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ backgroundColor: "#0B1D3A" }}
            >
              <div className="text-3xl">🆘</div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm mb-1">
                  Need a field worker to visit you?
                </div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>
                  Tap below and a RECLAIM-certified field worker will be
                  assigned to your case within 24 hours.
                </div>
              </div>
              <button
                className="px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap"
                style={{ backgroundColor: "#F5A623", color: "#0B1D3A" }}
              >
                Request Help
              </button>
            </div>

            <RecoveryToolkit language={language} />
          </div>
        )}
      </div>
      {step === 1 && <VictimSupportChat />}
    </div>
  )
}
