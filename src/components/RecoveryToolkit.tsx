import { useEffect, useState } from "react"

const cardStyle = { backgroundColor: "white", borderColor: "#e2e8f0" }

function ToolCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border p-5" style={cardStyle}>
      <h3 className="text-sm font-bold" style={{ color: "#0B1D3A" }}>
        {title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: "#64748b" }}>
        {subtitle}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default function RecoveryToolkit({
  language = "en",
}: {
  language?: string
}) {
  const [draftSaved, setDraftSaved] = useState(false)
  const [helpRequested, setHelpRequested] = useState(false)
  const [visitRequested, setVisitRequested] = useState(false)
  const [contactShared, setContactShared] = useState(false)
  const [missingReport, setMissingReport] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [qualityReviewed, setQualityReviewed] = useState(false)
  const [checklist, setChecklist] = useState<string[]>([])

  useEffect(() => {
    setDraftSaved(localStorage.getItem("reclaim-recovery-draft") === "saved")
  }, [])

  const toggleCheck = (task: string) => {
    setChecklist((items) =>
      items.includes(task)
        ? items.filter((item) => item !== task)
        : [...items, task],
    )
  }

  const saveOfflineDraft = () => {
    localStorage.setItem("reclaim-recovery-draft", "saved")
    setDraftSaved(true)
  }

  const playVoiceGuidance = () => {
    const message = new SpeechSynthesisUtterance(
      "You can save a draft, request emergency support, schedule a field visit, or use the evidence checklist before submitting your report.",
    )
    message.lang =
      ({
        hi: "hi-IN",
        bn: "bn-IN",
        te: "te-IN",
        ta: "ta-IN",
        ml: "ml-IN",
      } as Record<string, string>)[language] ?? "en-IN"
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(message)
  }

  return (
    <section
      className="mt-6 rounded-3xl p-5 sm:p-6"
      style={{ backgroundColor: "#F1F5F9" }}
    >
      <div className="mb-5">
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "#0369A1" }}
        >
          Recovery support toolkit
        </p>
        <h2
          className="mt-1 text-xl font-bold"
          style={{ color: "#0B1D3A", fontFamily: "Fraunces, Georgia, serif" }}
        >
          More help, when you need it
        </h2>
        <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
          Optional tools that do not change your recovery report.
        </p>
      </div>

      <div
        className="grid gap-4 md:grid-cols-2"
        style={{
          fontSize: largeText ? "1.1rem" : undefined,
          filter: highContrast ? "contrast(1.2)" : undefined,
        }}
      >
        <ToolCard
          title="Claim status & reminders"
          subtitle="Keep the next step and important deadlines visible."
        >
          <div
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: "#15803D" }}
          >
            <span>●</span>
            <span>Evidence review in progress</span>
          </div>
          <div
            className="mt-3 flex items-center gap-1.5 text-[10px] sm:text-xs"
            style={{ color: "#64748b" }}
          >
            {["Submitted", "Verifying", "Approved", "Aid received"].map(
              (label, index) => (
                <div
                  key={label}
                  className="flex min-w-0 flex-1 items-center gap-1"
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                    style={{
                      backgroundColor: index < 2 ? "#15803D" : "#cbd5e1",
                    }}
                  >
                    {index < 2 ? "✓" : index + 1}
                  </span>
                  <span className="truncate">{label}</span>
                </div>
              ),
            )}
          </div>
          <div
            className="mt-4 rounded-lg p-3 text-xs"
            style={{ backgroundColor: "#FEF3C7", color: "#92400e" }}
          >
            Reminder: photograph your damaged items before cleanup. Due in 2
            days.
          </div>
        </ToolCard>

        <ToolCard
          title="Offline drafts & accessibility"
          subtitle="Save your work safely when connection or reading support is limited."
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={saveOfflineDraft}
              className="rounded-lg px-3 py-2 text-xs font-semibold"
              style={{
                backgroundColor: draftSaved ? "#DCFCE7" : "#0B1D3A",
                color: draftSaved ? "#166534" : "white",
              }}
            >
              {draftSaved
                ? "✓ Draft saved on this device"
                : "Save offline draft"}
            </button>
            <button
              onClick={playVoiceGuidance}
              className="rounded-lg border px-3 py-2 text-xs font-semibold"
              style={{ borderColor: "#cbd5e1", color: "#0B1D3A" }}
            >
              🔊 Read guidance
            </button>
            <button
              onClick={() => setLargeText(!largeText)}
              className="rounded-lg border px-3 py-2 text-xs font-semibold"
              style={{ borderColor: "#cbd5e1", color: "#0B1D3A" }}
            >
              Aa {largeText ? "Normal text" : "Larger text"}
            </button>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className="rounded-lg border px-3 py-2 text-xs font-semibold"
              style={{ borderColor: "#cbd5e1", color: "#0B1D3A" }}
            >
              {highContrast ? "Normal contrast" : "High contrast"}
            </button>
          </div>
          <p className="mt-3 text-xs" style={{ color: "#64748b" }}>
            Drafts sync when the device reconnects. Voice guidance is available
            through the story recording button.
          </p>
        </ToolCard>

        <ToolCard
          title="Urgent help & safe locations"
          subtitle="Request immediate support or find nearby essentials."
        >
          <div className="flex gap-2">
            <button
              onClick={() => setHelpRequested(true)}
              className="rounded-lg px-3 py-2 text-xs font-bold"
              style={{ backgroundColor: "#B91C1C", color: "white" }}
            >
              {helpRequested ? "✓ SOS request sent" : "Send SOS request"}
            </button>
            <a
              href="https://www.google.com/maps/search/relief+shelter+near+me"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border px-3 py-2 text-xs font-semibold"
              style={{ borderColor: "#cbd5e1", color: "#0B1D3A" }}
            >
              Find safe places ↗
            </a>
          </div>
          <p className="mt-3 text-xs" style={{ color: "#64748b" }}>
            Shelters, clinics, food points, and charging stations are shown from
            your map provider.
          </p>
        </ToolCard>

        <ToolCard
          title="Family & trusted contacts"
          subtitle="Share your case safely or report a missing family member."
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setContactShared(true)}
              className="rounded-lg px-3 py-2 text-xs font-semibold"
              style={{
                backgroundColor: contactShared ? "#DCFCE7" : "#0F2347",
                color: contactShared ? "#166534" : "white",
              }}
            >
              {contactShared ? "✓ Access shared" : "Share with trusted contact"}
            </button>
            <button
              onClick={() => setMissingReport(true)}
              className="rounded-lg border px-3 py-2 text-xs font-semibold"
              style={{ borderColor: "#fca5a5", color: "#B91C1C" }}
            >
              {missingReport ? "✓ Report started" : "Report missing relative"}
            </button>
          </div>
          <p className="mt-3 text-xs" style={{ color: "#64748b" }}>
            Shared access can be revoked at any time. Missing-person reports are
            kept separate from public listings.
          </p>
        </ToolCard>

        <ToolCard
          title="Field visit & damage checklist"
          subtitle="Prepare for a verified assessment at home, shop, or farm."
        >
          <div className="flex gap-2">
            <button
              onClick={() => setVisitRequested(true)}
              className="rounded-lg px-3 py-2 text-xs font-semibold"
              style={{
                backgroundColor: visitRequested ? "#DCFCE7" : "#0B1D3A",
                color: visitRequested ? "#166534" : "white",
              }}
            >
              {visitRequested ? "✓ Visit requested" : "Schedule field visit"}
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {[
              "Photograph each damaged room",
              "List damaged household items",
              "Keep bills and receipts together",
            ].map((task) => (
              <label
                key={task}
                className="flex cursor-pointer items-center gap-2 text-xs"
                style={{ color: "#475569" }}
              >
                <input
                  type="checkbox"
                  checked={checklist.includes(task)}
                  onChange={() => toggleCheck(task)}
                />
                {task}
              </label>
            ))}
          </div>
        </ToolCard>

        <ToolCard
          title="Evidence quality & eligibility"
          subtitle="A quick pre-check before you submit claims."
        >
          <ul className="space-y-2 text-xs" style={{ color: "#475569" }}>
            <li>✓ Include a wide photo and a close-up for each item.</li>
            <li>✓ Make bills readable and include the date and amount.</li>
            <li>
              • You may qualify for NDRF relief, PM Awas, and emergency
              employment.
            </li>
          </ul>
          <button
            onClick={() => setQualityReviewed(true)}
            className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold"
            style={{
              backgroundColor: qualityReviewed ? "#DCFCE7" : "#E0F2FE",
              color: qualityReviewed ? "#166534" : "#0369A1",
            }}
          >
            {qualityReviewed ? "✓ Review complete" : "Review evidence quality"}
          </button>
        </ToolCard>

        <ToolCard
          title="Fraud protection & community needs"
          subtitle="Use verified assistance and help relief teams understand local needs."
        >
          <div
            className="rounded-lg p-3 text-xs"
            style={{ backgroundColor: "#FFF5F5", color: "#991B1B" }}
          >
            Never pay a fee to receive disaster aid. Verify an organization
            before sharing documents or OTPs.
          </div>
          <div
            className="mt-3 flex items-center justify-between text-xs"
            style={{ color: "#475569" }}
          >
            <span>Nearby reported needs</span>
            <span className="font-bold" style={{ color: "#B91C1C" }}>
              Water 18 · Shelter 11 · Medicine 7
            </span>
          </div>
        </ToolCard>
      </div>
    </section>
  )
}
