import { useState, useEffect } from "react"
import CitizenApp from "./views/CitizenApp"
import NGODashboard from "./views/NGODashboard"
import FieldWorker from "./views/FieldWorker"
import GovtDashboard from "./views/GovtDashboard"
import DISASTERS, { type Disaster } from "./data/disasters"
import { getStrings } from "./i18n/strings"
import FeatureSuite from "./components/FeatureSuite"

type Role = "citizen" | "fieldworker" | "ngo" | "govt"

const roles: { id: Role; label: string }[] = [
  { id: "citizen", label: "Citizen / Victim" },
  { id: "fieldworker", label: "Field Worker" },
  { id: "ngo", label: "Organization" },
  { id: "govt", label: "Government" },
]

const LANGUAGES = [
  { code: "en", native: "English", english: "English" },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "bn", native: "বাংলা", english: "Bengali" },
  { code: "te", native: "తెలుగు", english: "Telugu" },
  { code: "mr", native: "मराठी", english: "Marathi" },
  { code: "ta", native: "தமிழ்", english: "Tamil" },
  { code: "ur", native: "اردو", english: "Urdu" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada" },
  { code: "or", native: "ଓଡ଼ିଆ", english: "Odia" },
  { code: "ml", native: "മലയാളം", english: "Malayalam" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "as", native: "অসমীয়া", english: "Assamese" },
  { code: "mai", native: "मैथिली", english: "Maithili" },
  { code: "sa", native: "संस्कृतम्", english: "Sanskrit" },
  { code: "sat", native: "ᱥᱟᱱᱛᱟᱲᱤ", english: "Santali" },
  { code: "ks", native: "کٲشُر", english: "Kashmiri" },
  { code: "ne", native: "नेपाली", english: "Nepali" },
  { code: "sd", native: "سنڌي", english: "Sindhi" },
  { code: "doi", native: "डोगरी", english: "Dogri" },
  { code: "kok", native: "कोंकणी", english: "Konkani" },
  { code: "mni", native: "মৈতৈলোন্", english: "Meitei" },
  { code: "brx", native: "बड़ो", english: "Bodo" },
]
const YEAR_COLORS: Record<number, { bg: string; color: string }> = {
  2024: { bg: "#0F2347", color: "#93c5fd" },
  2025: { bg: "#1a1a2e", color: "#a78bfa" },
  2026: { bg: "#1a2e1a", color: "#86efac" },
}

const LANGUAGE_STORAGE_KEY = "reclaim-language"
const DISASTER_FLOW_PARAM = "select-disaster"

function updateUrl(params: URLSearchParams, replace = false) {
  const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
  window.history[replace ? "replaceState" : "pushState"](null, "", nextUrl)
}

function setGoogleTranslateLanguage(language: string) {
  // Google Translate reads this first-party cookie when its browser widget loads.
  // English deliberately clears it so the original page is restored.
  if (language === "en") {
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
  } else {
    document.cookie = `googtrans=/en/${language}; path=/; SameSite=Lax`
  }
}

interface AppState {
  role: Role
  disasterId: string
}

export default function App() {
  const [role, setRole] = useState<Role>("citizen")
  const [disaster, setDisaster] = useState<Disaster>(DISASTERS[0])
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showDisasterModal, setShowDisasterModal] = useState(false)

  // Load the Google widget after React has painted, so it can translate every
  // screen instead of scanning the empty #root that exists during HTML parsing.
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return

    const script = document.createElement("script")
    script.id = "google-translate-script"
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    document.body.appendChild(script)
  }, [])

  // Initialize from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlRole = params.get("role") as Role
    const urlDisasterId = params.get("disaster")
    const urlLang = params.get("lang")
    const openDisasterAfterTranslation =
      params.get("flow") === DISASTER_FLOW_PARAM

    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    const language = urlLang || savedLanguage
    // Normal page loads begin with language selection. The one reload used to
    // activate Google Translate continues directly to disaster selection.
    if (openDisasterAfterTranslation) {
      // Keep the handoff marker through React's development effect replay;
      // otherwise the replay would interpret this as a fresh page entry and
      // reopen the language prompt.
      window.setTimeout(() => {
        const currentParams = new URLSearchParams(window.location.search)
        if (currentParams.get("flow") === DISASTER_FLOW_PARAM) {
          currentParams.delete("flow")
          updateUrl(currentParams, true)
        }
      }, 0)
    }
    setShowLanguageModal(!openDisasterAfterTranslation)
    setShowDisasterModal(openDisasterAfterTranslation)

    if (language) {
      setSelectedLang(language)
      setGoogleTranslateLanguage(language)
      if (!urlLang) {
        params.set("lang", language)
        updateUrl(params, true)
      }
    }

    if (urlRole && roles.some((r) => r.id === urlRole)) {
      setRole(urlRole)
    }

    if (urlDisasterId) {
      const d = DISASTERS.find((d) => d.id === urlDisasterId)
      if (d) setDisaster(d)
    }
  }, [])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const urlRole = params.get("role") as Role
      const urlDisasterId = params.get("disaster")
      const urlLang = params.get("lang")

      if (urlLang) {
        setSelectedLang(urlLang)
        setGoogleTranslateLanguage(urlLang)
      }

      if (urlRole && roles.some((r) => r.id === urlRole)) {
        setRole(urlRole)
      }

      if (urlDisasterId) {
        const d = DISASTERS.find((d) => d.id === urlDisasterId)
        if (d) setDisaster(d)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // New dashboards and disasters should always open from their heading.
  useEffect(() => {
    document.getElementById('app-content')?.scrollTo({ top: 0, behavior: 'auto' })
  }, [role, disaster.id])

  // Push to history when role changes
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole)
    const params = new URLSearchParams()
    params.set("role", newRole)
    params.set("disaster", disaster.id)
    if (selectedLang) params.set("lang", selectedLang)
    updateUrl(params)
  }

  // Push to history when disaster changes
  const handleDisasterChange = (newDisaster: Disaster) => {
    setDisaster(newDisaster)
    setSelectorOpen(false)
    setShowDisasterModal(false)
    const params = new URLSearchParams()
    params.set("role", role)
    params.set("disaster", newDisaster.id)
    if (selectedLang) params.set("lang", selectedLang)
    updateUrl(params)
  }

  // Handle language selection
  const handleLanguageSelect = (langCode: string) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode)
    setGoogleTranslateLanguage(langCode)
    setSelectedLang(langCode)
    setShowLanguageModal(false)
    setShowDisasterModal(true)
    const params = new URLSearchParams()
    params.set("role", role)
    params.set("disaster", disaster.id)
    params.set("lang", langCode)
    params.set("flow", DISASTER_FLOW_PARAM)
    updateUrl(params)

    // Google Translate applies the language cookie while its widget starts.
    // Reload once, then continue to the disaster selector on the new page.
    window.location.reload()
  }

  const handleOpenLanguageModal = () => {
    setShowLanguageModal(true)
    setShowDisasterModal(false)
  }

  const handleHomeClick = () => {
    const homeDisaster = DISASTERS[0]
    setRole("citizen")
    setDisaster(homeDisaster)
    setSelectorOpen(false)
    setShowLanguageModal(false)
    setShowDisasterModal(false)

    const params = new URLSearchParams()
    params.set("role", "citizen")
    params.set("disaster", homeDisaster.id)
    if (selectedLang) params.set("lang", selectedLang)
    updateUrl(params)
  }

  const yc = YEAR_COLORS[disaster.year] ?? YEAR_COLORS[2024]

  const str = getStrings((selectedLang || "en") as any)

  return (
    <div
      className="h-screen overflow-hidden flex flex-col"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2
              className="text-3xl font-bold mb-2 text-center"
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                color: "#0B1D3A",
              }}
            >
              {str.lang.title}
            </h2>
            <p
              className="text-center text-sm mb-8"
              style={{ color: "#64748b" }}
            >
              {str.lang.sub} · भाषा चुनें
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="rounded-xl p-4 text-center transition-all duration-200 border-2 hover:shadow-lg"
                  style={{
                    backgroundColor:
                      selectedLang === lang.code ? "#F5A623" : "#f8fafc",
                    borderColor:
                      selectedLang === lang.code ? "#F5A623" : "#e2e8f0",
                    color: selectedLang === lang.code ? "#0B1D3A" : "#0B1D3A",
                  }}
                >
                  <div className="text-lg font-semibold mb-1">
                    {lang.native}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: selectedLang === lang.code ? "#0B1D3A" : "#64748b",
                    }}
                  >
                    {lang.english}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => handleLanguageSelect(selectedLang || "en")}
                className="px-12 py-3 rounded-xl font-semibold text-base transition-all duration-200 text-white"
                style={{ backgroundColor: "#0B1D3A" }}
              >
                {str.lang.selectBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disaster Selection Modal */}
      {showDisasterModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2
              className="text-3xl font-bold mb-2 text-center"
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                color: "#0B1D3A",
              }}
            >
              {str.disaster.title}
            </h2>
            <p
              className="text-center text-sm mb-8"
              style={{ color: "#64748b" }}
            >
              {str.disaster.sub}
            </p>
            <div className="space-y-3 mb-8">
              {DISASTERS.map((d) => {
                const dc = YEAR_COLORS[d.year] ?? YEAR_COLORS[2024]
                return (
                  <button
                    key={d.id}
                    onClick={() => handleDisasterChange(d)}
                    className="w-full text-left px-4 py-4 rounded-xl border-2 transition-all hover:shadow-lg"
                    style={{
                      borderColor: disaster.id === d.id ? "#F5A623" : "#e2e8f0",
                      backgroundColor:
                        disaster.id === d.id ? "#FFF8F0" : "#f8fafc",
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: dc.bg, color: dc.color }}
                      >
                        {d.year}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div
                          className="font-bold text-base"
                          style={{ color: "#0B1D3A" }}
                        >
                          {d.name}
                        </div>
                        <div className="text-sm" style={{ color: "#64748b" }}>
                          {d.state} · {d.totalAffected.toLocaleString("en-IN")}{" "}
                          {str.disaster.affected} · {str.disaster.day} {d.day}
                        </div>
                      </div>
                      {disaster.id === d.id && (
                        <span style={{ color: "#F5A623" }}>✓</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowDisasterModal(false)}
                className="px-12 py-3 rounded-xl font-semibold text-base transition-all duration-200 text-white"
                style={{ backgroundColor: "#0B1D3A" }}
              >
                {str.disaster.selectBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        
        
      
        className="flex-none flex items-center justify-between px-5 py-2.5 z-40 relative flex-wrap gap-y-2"
        style={{ backgroundColor: "#0B1D3A" }}
      >
        {/* Brand */}
        <button
          type="button"
          onClick={handleHomeClick}
          className="flex items-center gap-3 rounded-lg text-left transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]"
          aria-label="Go to RECLAIM home"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#F5A623" }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="#0B1D3A"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#F5A623"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="leading-tight">
            <div
              className="text-white font-bold text-lg tracking-tight"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              RECLAIM
            </div>
            <div className="text-xs" style={{ color: "#64748b" }}>
              From Disaster Loss to Recovery
            </div>
          </div>
        </button>

        {/* Disaster selector */}
        <div className="relative">
          <button
            onClick={() => setSelectorOpen(!selectorOpen)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all"
            style={{
              backgroundColor: yc.bg,
              border: `1px solid ${yc.color}30`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#F5A623" }}
            />
            <span
              style={{ color: yc.color }}
              className="font-medium max-w-[220px] truncate"
            >
              {disaster.shortName}
            </span>
            <span style={{ color: "#475569" }} className="text-xs ml-1">
              {selectorOpen ? "▲" : "▼"}
            </span>
          </button>

          {selectorOpen && (
            <div
              className="absolute top-full mt-1 right-0 rounded-xl shadow-xl border z-50 max-h-[70vh] overflow-y-auto"
              style={{
                backgroundColor: "#0B1D3A",
                borderColor: "#1a3d7a",
                minWidth: "300px",
              }}
            >
              {DISASTERS.map((d) => {
                const dc = YEAR_COLORS[d.year] ?? YEAR_COLORS[2024]
                return (
                  <button
                    key={d.id}
                    onClick={() => handleDisasterChange(d)}
                    className="w-full text-left px-4 py-3 border-b flex items-start gap-3 transition-colors"
                    style={{
                      borderColor: "#0F2347",
                      backgroundColor:
                        disaster.id === d.id ? "#0F2347" : "transparent",
                    }}
                  >
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: dc.bg,
                        color: dc.color,
                        border: `1px solid ${dc.color}40`,
                      }}
                    >
                      {d.year}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {d.name}
                      </div>
                      <div className="text-xs" style={{ color: "#64748b" }}>
                        {d.state} · {d.totalAffected.toLocaleString("en-IN")}{" "}
                        households · Day {d.day}
                      </div>
                    </div>
                    {disaster.id === d.id && (
                      <span
                        className="text-xs ml-auto flex-shrink-0"
                        style={{ color: "#F5A623" }}
                      >
                        ●
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Language and role controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenLanguageModal}
            className="rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            style={{ backgroundColor: "#143060", color: "#FDE68A", border: "1px solid #F5A623" }}
          >
            Change language
          </button>
          <div
            className="flex items-center gap-1 rounded-xl p-1"
            style={{ backgroundColor: "#0F2347" }}
          >
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={
                  role === r.id
                    ? { backgroundColor: "#F5A623", color: "#0B1D3A" }
                    : { color: "#94a3b8" }
                }
              >
                {str.nav[r.id]}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Close selector on outside click */}
      {selectorOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setSelectorOpen(false)}
        />
      )}

      <main id="app-content" className="flex-1 min-h-0 overflow-y-scroll overscroll-contain scroll-smooth">
        {role === "citizen" && (
          <CitizenApp
            disaster={disaster}
            language={selectedLang || "en"}
          />
        )}
        {role === "fieldworker" && (
          <FieldWorker disaster={disaster} language={selectedLang || "en"} />
        )}
        {role === "ngo" && (
          <NGODashboard disaster={disaster} language={selectedLang || "en"} />
        )}
        {role === "govt" && (
          <GovtDashboard
            disasters={DISASTERS}
            language={selectedLang || "en"}
          />
        )}
      </main>
      <FeatureSuite role={role} disaster={disaster} />
    </div>
  )
}
