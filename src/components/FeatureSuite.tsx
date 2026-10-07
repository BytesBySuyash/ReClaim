import { useEffect, useState } from "react"
import type { Disaster } from "../data/disasters"

type Role = "citizen" | "fieldworker" | "ngo" | "govt"

const panel = { backgroundColor: "white", borderColor: "#e2e8f0" }

export default function FeatureSuite({
  role,
  disaster,
}: {
  role: Role
  disaster: Disaster
}) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const [dark, setDark] = useState(
    () => window.localStorage.getItem("reclaim-theme") === "dark",
  )
  const [gauge, setGauge] = useState(6.8)
  const [disputeSent, setDisputeSent] = useState(false)
  const [demoScenario, setDemoScenario] = useState("Document loss")
  const [demoStarted, setDemoStarted] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", dark)
    window.localStorage.setItem("reclaim-theme", dark ? "dark" : "light")
  }, [dark])

  useEffect(() => {
    if (role !== "govt") return
    const timer = window.setInterval(
      () =>
        setGauge((value) =>
          Number((value + (Math.random() - 0.48) * 0.12).toFixed(2)),
        ),
      3000,
    )
    return () => window.clearInterval(timer)
  }, [role])

  const notificationText: Record<Role, string[]> = {
    citizen: [
      "Evidence review has started",
      "Aadhaar replacement reminder: 2 days left",
    ],
    fieldworker: [
      "3 household visits awaiting sync",
      "New priority case assigned nearby",
    ],
    ngo: [
      "Village Kalyanpur has a shelter-support gap",
      "Duplicate food-kit delivery risk detected",
    ],
    govt: [
      "IMD amber rainfall alert issued",
      "River gauge crossed watch level",
    ],
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={() => setDark((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-full border shadow-lg"
          style={panel}
          aria-label="Toggle dark mode"
          aria-pressed={dark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? "☀️" : "🌙"}
        </button>
        <div className="relative">
          <button
            onClick={() => setNotifications(!notifications)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border shadow-lg"
            style={panel}
            aria-label="Open notifications"
          >
            🔔
            <span
              className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white"
              style={{ backgroundColor: "#B91C1C" }}
            />
          </button>
          {notifications && (
            <div
              className="absolute bottom-14 right-0 w-80 rounded-2xl border p-4 shadow-2xl"
              style={panel}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="text-sm font-bold"
                  style={{ color: "#0B1D3A" }}
                >
                  Notifications
                </span>
                <span className="text-xs" style={{ color: "#15803D" }}>
                  All caught up
                </span>
              </div>
              <div className="space-y-2">
                {notificationText[role].map((message) => (
                  <div
                    key={message}
                    className="rounded-xl p-3 text-xs"
                    style={{ backgroundColor: "#F8FAFC", color: "#475569" }}
                  >
                    {message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-full px-4 py-3 text-xs font-bold shadow-lg"
          style={{ backgroundColor: "#0B1D3A", color: "white" }}
        >
          {open ? "Close tools" : "Insights & tools"}
        </button>
      </div>

      {open && (
        <aside
          className="fixed bottom-20 right-5 z-30 max-h-[78vh] w-[min(94vw,530px)] overflow-y-auto rounded-3xl border p-5 shadow-2xl animate-slide-up"
          style={panel}
        >
          <div className="mb-4">
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "#0369A1" }}
            >
              Response tools
            </p>
            <h2
              className="text-xl font-bold"
              style={{
                color: "#0B1D3A",
                fontFamily: "Fraunces, Georgia, serif",
              }}
            >
              {role === "govt" ? "Disaster command room" : "Recovery insights"}
            </h2>
          </div>
          <section
            className="mb-4 rounded-2xl border p-3"
            style={{ backgroundColor: "#FFF8F0", borderColor: "#FDE68A" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold" style={{ color: "#0B1D3A" }}>
                  Sample scenario
                </h3>
                <p className="mt-0.5 text-[10px]" style={{ color: "#92400e" }}>
                  {demoStarted
                    ? `${demoScenario} example is ready to explore.`
                    : "Choose a sample situation to explore the recovery flow."}
                </p>
              </div>
              <button
                onClick={() => setDemoStarted(true)}
                className="rounded-lg px-2.5 py-1.5 text-[10px] font-bold"
                style={{ backgroundColor: "#0B1D3A", color: "white" }}
              >
                Start scenario
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Document loss", "Livelihood loss", "Elderly care"].map(
                (scenario) => (
                  <button
                    key={scenario}
                    onClick={() => {
                      setDemoScenario(scenario)
                      setDemoStarted(false)
                    }}
                    className="rounded-full px-2 py-1 text-[10px] font-semibold"
                    style={{
                      backgroundColor:
                        demoScenario === scenario ? "#F5A623" : "white",
                      color: "#0B1D3A",
                    }}
                  >
                    {scenario}
                  </button>
                ),
              )}
            </div>
          </section>
          {role === "citizen" && (
            <CitizenTools
              disputeSent={disputeSent}
              onDispute={() => setDisputeSent(true)}
            />
          )}
          {role === "fieldworker" && <FieldTools disaster={disaster} />}
          {role === "ngo" && <NgoTools />}
          {role === "govt" && (
            <>
              <GovernmentTools gauge={gauge} />
              <ImpactOutcomes />
            </>
          )}
        </aside>
      )}
    </>
  )
}

function CitizenTools({
  disputeSent,
  onDispute,
}: {
  disputeSent: boolean
  onDispute: () => void
}) {
  const [synced, setSynced] = useState(false)
  const [question, setQuestion] = useState("What should I do first?")
  const [answer, setAnswer] = useState(
    "Start with safety and evidence: photograph damage, keep documents together, and request a field visit if you need help.",
  )
  const [eligibilityOpen, setEligibilityOpen] = useState(false)
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border p-4" style={panel}>
        <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
          Recovery guide
        </h3>
        <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
          Ask about possible next steps. Replies use prepared examples and do
          not submit a claim.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border px-2 py-2 text-xs"
            style={{ borderColor: "#cbd5e1" }}
            aria-label="Ask the recovery guide"
          />
          <button
            onClick={() =>
              setAnswer(
                question.toLowerCase().includes("document")
                  ? "For lost documents: add any photo or copy you have, then use the Aadhaar replacement and ration-card support links in your recovery plan."
                  : question.toLowerCase().includes("money")
                    ? "In this sample, relief and livelihood support are possible next steps. Never pay anyone to access disaster assistance."
                    : "Your next best step is to capture evidence, complete your household profile, and review the matched support schemes.",
              )
            }
            className="rounded-lg px-3 text-xs font-bold"
            style={{ backgroundColor: "#0B1D3A", color: "white" }}
          >
            Ask
          </button>
        </div>
        <p
          className="mt-3 rounded-lg p-2.5 text-xs leading-relaxed"
          style={{ backgroundColor: "#E0F2FE", color: "#075985" }}
        >
          {answer}
        </p>
      </section>
      <section className="rounded-2xl border p-4" style={panel}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
              Example eligibility notes
            </h3>
            <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
              Sample factors that could appear in an eligibility review.
            </p>
          </div>
          <button
            onClick={() => setEligibilityOpen(!eligibilityOpen)}
            className="text-xs font-bold"
            style={{ color: "#0369A1" }}
          >
            {eligibilityOpen ? "Hide" : "Show reasons"}
          </button>
        </div>
        {eligibilityOpen && (
          <ul className="mt-3 space-y-2 text-xs" style={{ color: "#475569" }}>
            <li>Example: reported household damage may be relevant to relief review.</li>
            <li>
              Example: lost identity documents may call for replacement guidance.
            </li>
            <li>
              Example: livelihood losses may be considered for restart support.
            </li>
          </ul>
        )}
      </section>
      <section className="rounded-2xl border p-4" style={panel}>
        <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
          Sample household recovery timeline
        </h3>
        <div className="mt-4 flex items-end gap-2 h-24">
          {[42, 47, 45, 58, 67, 74, 79].map((score, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${score}%`,
                backgroundColor: i > 4 ? "#15803D" : "#F5A623",
              }}
              title={`Day ${i + 1}: HRVS ${score}`}
            />
          ))}
        </div>
        <div
          className="mt-2 flex justify-between text-[10px]"
          style={{ color: "#64748b" }}
        >
          <span>Day 1</span>
          <span>Aadhaar replaced</span>
          <span>Payment expected</span>
        </div>
      </section>
      <section className="rounded-2xl border p-4" style={panel}>
        <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
          Sample score review
        </h3>
        <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
          Explore how a score review request could appear in the app.
        </p>
        <button
          onClick={onDispute}
          className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{
            backgroundColor: disputeSent ? "#DCFCE7" : "#0B1D3A",
            color: disputeSent ? "#166534" : "white",
          }}
        >
          {disputeSent ? "Sample review noted" : "Try a sample review request"}
        </button>
      </section>
      <section className="rounded-2xl border p-4" style={panel}>
        <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
          Sample offline queue
        </h3>
        <div
          className="mt-2 flex items-center justify-between text-xs"
          style={{ color: "#64748b" }}
        >
          <span>
            {synced ? "Sample queue reviewed" : "Example queue: 2 photos + 1 update"}
          </span>
          <button
            onClick={() => setSynced(true)}
            style={{ color: "#0369A1" }}
            className="font-semibold"
          >
            Review sample queue
          </button>
        </div>
      </section>
    </div>
  )
}

function FieldTools({ disaster }: { disaster: Disaster }) {
  const code = `RCL-${disaster.id.slice(0, 4).toUpperCase()}-0147`
  const [handoverConfirmed, setHandoverConfirmed] = useState(false)
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border p-4 text-center" style={panel}>
        <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
          Aid handover proof
        </h3>
        <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
          Scan this household QR at delivery to prevent missed or duplicate
          support.
        </p>
        <div className="mx-auto my-4 grid w-32 grid-cols-7 gap-1 bg-white p-2">
          {Array.from({ length: 49 }, (_, i) => (
            <span
              key={i}
              className="aspect-square"
              style={{
                backgroundColor:
                  (i * 7 + (i % 3)) % 5 < 2 ? "#0B1D3A" : "transparent",
              }}
            />
          ))}
        </div>
        <p className="font-mono text-xs" style={{ color: "#475569" }}>
          {code}
        </p>
        <button
          onClick={() => setHandoverConfirmed(true)}
          className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{
            backgroundColor: handoverConfirmed ? "#DCFCE7" : "#0B1D3A",
            color: handoverConfirmed ? "#166534" : "white",
          }}
        >
          {handoverConfirmed
            ? "✓ Handover logged with timestamp"
            : "Confirm aid handover"}
        </button>
      </section>
      <section className="rounded-2xl border p-4" style={panel}>
        <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
          Offline sync queue
        </h3>
        <p className="mt-2 text-xs" style={{ color: "#64748b" }}>
          Sample queue: 3 visits, 18 photos, and 2 signatures. Nothing is uploaded or synced.
        </p>
      </section>
    </div>
  )
}

function ImpactOutcomes() {
  return (
    <section className="rounded-2xl border p-4" style={panel}>
      <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
        Recovery outcomes
      </h3>
      <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
        Proof of progress across the response, beyond registrations and funds
        allocated.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="Documents restored" value="312" color="#7C3AED" />
        <Metric label="Livelihoods restarted" value="184" color="#15803D" />
        <Metric label="Aid delivered" value="₹18.4L" color="#0369A1" />
      </div>
      <div
        className="mt-3 rounded-lg p-2.5 text-xs"
        style={{ backgroundColor: "#DCFCE7", color: "#166534" }}
      >
        83% of critical households were contacted within 24 hours.
      </div>
    </section>
  )
}

function NgoTools() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border p-4" style={panel}>
        <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
          Inter-NGO coordination board
        </h3>
        <div className="mt-3 space-y-2 text-xs">
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "#FFF5F5", color: "#991B1B" }}
          >
            Overlap: 3 food-kit distributions planned in Ward 4.
          </div>
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "#FEF3C7", color: "#92400e" }}
          >
            Gap: 28 elderly households still need hygiene kits.
          </div>
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: "#DCFCE7", color: "#166534" }}
          >
            Assigned: Shelter repairs coordinated with SEEDS India.
          </div>
        </div>
      </section>
      <section className="rounded-2xl border p-4" style={panel}>
        <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
          Citizen score-review requests
        </h3>
        <p className="mt-2 text-xs" style={{ color: "#64748b" }}>
          4 grievances await a verified case-worker review.
        </p>
        <button
          className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{ backgroundColor: "#0B1D3A", color: "white" }}
        >
          Open review queue
        </button>
      </section>
    </div>
  )
}

function GovernmentTools({ gauge }: { gauge: number }) {
  const villages = [2, 4, 3, 1, 5, 4, 2, 3, 5, 2, 1, 4]
  const [selectedVillage, setSelectedVillage] = useState<number | null>(null)
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border p-4" style={panel}>
        <div className="flex justify-between">
          <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
            Live disaster intelligence
          </h3>
          <span className="text-xs font-semibold" style={{ color: "#15803D" }}>
            ● Updating
          </span>
        </div>
        <div
          className="mt-3 rounded-xl p-3"
          style={{ backgroundColor: "#E0F2FE" }}
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs" style={{ color: "#0369A1" }}>
                River gauge
              </p>
              <p className="text-2xl font-bold" style={{ color: "#0B1D3A" }}>
                {gauge} m
              </p>
            </div>
            <span
              className="rounded-full px-2 py-1 text-xs font-bold"
              style={{ backgroundColor: "#FEF3C7", color: "#92400e" }}
            >
              IMD Amber alert
            </span>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border p-4" style={panel}>
        <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
          Village severity clusters
        </h3>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {villages.map((severity, i) => (
            <button
              onClick={() => setSelectedVillage(i)}
              key={i}
              title={`Village ${i + 1}: severity ${severity}/5`}
              className="aspect-square rounded-lg text-xs font-bold text-white"
              style={{
                backgroundColor: [
                  "#86efac",
                  "#F5A623",
                  "#f97316",
                  "#dc2626",
                  "#7f1d1d",
                ][severity - 1],
                outline:
                  selectedVillage === i ? "3px solid #0B1D3A" : undefined,
              }}
            >
              V{i + 1}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs" style={{ color: "#64748b" }}>
          {selectedVillage === null
            ? "Select a village square to inspect its cluster."
            : `Village ${selectedVillage + 1}: severity ${villages[selectedVillage]}/5. Open cases prioritised for review.`}
        </p>
      </section>
      <section className="rounded-2xl border p-4" style={panel}>
        <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
          Demographic equity analytics
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
          <Metric label="Women-led" value="41%" color="#7C3AED" />
          <Metric label="Elderly" value="18%" color="#0369A1" />
          <Metric label="Tribal" value="27%" color="#C2410C" />
        </div>
        <p className="mt-3 text-xs" style={{ color: "#64748b" }}>
          Hidden-vulnerability flag: 63 households need tailored outreach beyond
          damage estimates.
        </p>
      </section>
    </div>
  )
}

function Metric({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div>
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {value}
      </div>
      <p className="mt-1" style={{ color: "#64748b" }}>
        {label}
      </p>
    </div>
  )
}
