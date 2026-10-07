import { useEffect, useMemo, useState } from "react"
import type { Disaster, Household } from "../data/disasters"

const MINIMUM_ASSIGNMENTS = 10

function getAssignments(disaster: Disaster): Household[] {
  const households = disaster.households.slice(0, MINIMUM_ASSIGNMENTS)
  if (households.length === 0) return households

  // Some disaster records contain fewer than ten initial households. Create
  // distinct follow-up records from their local case profiles so every field
  // worker queue has a practical minimum workload to review.
  for (
    let index = households.length;
    households.length < MINIMUM_ASSIGNMENTS;
    index += 1
  ) {
    const source = disaster.households[index % disaster.households.length]
    households.push({
      ...source,
      id: `${disaster.id}-FW-${String(index + 1).padStart(3, "0")}`,
      name: `${source.name} — follow-up household ${index + 1}`,
      location: `${source.location} (follow-up area)`,
      verified: false,
    })
  }

  return households
}

function PriorityBadge({ label }: { label: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Critical: { bg: "#FEE2E2", color: "#B91C1C" },
    High: { bg: "#FFEDD5", color: "#C2410C" },
    Medium: { bg: "#FEF3C7", color: "#A16207" },
  }
  const s = styles[label] ?? styles.Medium
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {label}
    </span>
  )
}

export default function FieldWorker({
  disaster,
  language = "en",
}: {
  disaster: Disaster
  language?: string
}) {
  // Every active disaster provides at least ten field assignments.
  const assignedHouseholds = useMemo(() => getAssignments(disaster), [disaster])
  const [selected, setSelected] = useState<Household | null>(
    assignedHouseholds[0] ?? null,
  )
  const [noteText, setNoteText] = useState("")
  const [recording, setRecording] = useState(false)
  const [completed, setCompleted] = useState<string[]>([])

  useEffect(() => {
    setSelected(assignedHouseholds[0] ?? null)
    setCompleted([])
    setNoteText("")
  }, [disaster.id])

  function selectHousehold(household: Household) {
    setSelected(household)
    setCompleted([])
    setNoteText("")
  }

  function handleRecord() {
    setRecording(true)
    setTimeout(() => {
      setRecording(false)
      setNoteText(
        "Visited household. Sewing machine confirmed destroyed — rusted beyond repair. Aadhaar and ration card confirmed lost in flood water. Family staying at sister's place nearby. Recommending urgent documentation support.",
      )
    }, 3000)
  }

  function toggleTask(task: string) {
    setCompleted((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task],
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Left — assigned list */}
      <div
        className="w-72 flex-shrink-0 border-r flex flex-col"
        style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
      >
        <div className="px-4 py-4 border-b" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex items-center justify-between mb-1">
            <h2
              className="font-bold"
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                color: "#0B1D3A",
              }}
            >
              My Assignments
            </h2>
            <div
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
            >
              {assignedHouseholds.length} households
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "#15803D" }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: "#15803D" }}
            />
            Ravi Kumar · Online · GPS active
          </div>
        </div>

        {/* Offline banner */}
        <div
          className="mx-3 mt-3 rounded-lg px-3 py-2 flex items-center gap-2 text-xs"
          style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
        >
          <span>📶</span>
          <span>Sample data loaded. Offline demo ready.</span>
        </div>

        <div className="flex-1 overflow-auto py-3 px-3 space-y-2">
          {assignedHouseholds.map((h) => (
            <div
              key={h.id}
              onClick={() => selectHousehold(h)}
              className="rounded-xl p-3 cursor-pointer border transition-all"
              style={
                selected?.id === h.id
                  ? { borderColor: "#F5A623", backgroundColor: "#FFFBEB" }
                  : { borderColor: "#e2e8f0", backgroundColor: "white" }
              }
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="font-semibold text-sm"
                  style={{ color: "#0B1D3A" }}
                >
                  {h.name}
                </span>
                <PriorityBadge
                  label={
                    h.hrvs >= 80 ? "Critical" : h.hrvs >= 60 ? "High" : "Medium"
                  }
                />
              </div>
              <div className="text-xs mb-1" style={{ color: "#64748b" }}>
                {h.location}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: h.verified ? "#A16207" : "#C2410C" }}>
                  {h.verified
                    ? "Visited — awaiting verification"
                    : "Pending visit"}
                </span>
                <span style={{ color: "#94a3b8" }}>HRVS {h.hrvs}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t" style={{ borderColor: "#e2e8f0" }}>
          <button
            className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#0B1D3A", color: "white" }}
          >
            + Add Household
          </button>
        </div>
      </div>

      {/* Right — household detail */}
      {selected && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "Fraunces, Georgia, serif",
                      color: "#0B1D3A",
                    }}
                  >
                    {selected.name}
                  </h1>
                  <PriorityBadge
                    label={
                      selected.hrvs >= 80
                        ? "Critical"
                        : selected.hrvs >= 60
                          ? "High"
                          : "Medium"
                    }
                  />
                </div>
                <div className="text-sm" style={{ color: "#64748b" }}>
                  📍 {selected.location} · 👥 {selected.members} members
                </div>
                <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                  {selected.type}
                </div>
              </div>
              <div
                className="rounded-xl px-4 py-2 text-center"
                style={{ backgroundColor: "#0B1D3A" }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "#fca5a5",
                  }}
                >
                  {selected.hrvs}
                </div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>
                  HRVS
                </div>
              </div>
            </div>

            {/* GPS capture */}
            <div
              className="rounded-2xl p-4 mb-5 flex items-center justify-between"
              style={{ backgroundColor: "#EDE9FE" }}
            >
              <div>
                <div
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: "#5B21B6" }}
                >
                  📍 GPS Location
                </div>
                <div
                  className="text-xs"
                  style={{
                    color: "#7C3AED",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  15.8281° N, 78.0373° E
                </div>
                <div className="text-xs" style={{ color: "#94a3b8" }}>
                  Accuracy: ±4m · Captured now
                </div>
              </div>
              <button
                className="px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: "#7C3AED", color: "white" }}
              >
                Refresh GPS
              </button>
            </div>

            {/* Verification tasks */}
            <div
              className="rounded-2xl border p-5 mb-5"
              style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
            >
              <div
                className="text-sm font-semibold mb-3"
                style={{ color: "#0B1D3A" }}
              >
                Verification Tasks
              </div>
              <div className="space-y-2">
                {(selected.blockers.length > 0
                  ? selected.blockers.map((b) => `Verify: ${b}`)
                  : [
                      "Photograph damage",
                      "Collect witness statement",
                      "Record GPS location",
                    ]
                ).map((task) => (
                  <div
                    key={task}
                    onClick={() => toggleTask(task)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all"
                    style={
                      completed.includes(task)
                        ? { borderColor: "#86efac", backgroundColor: "#F0FDF4" }
                        : { borderColor: "#e2e8f0", backgroundColor: "#FAFAFA" }
                    }
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs"
                      style={
                        completed.includes(task)
                          ? {
                              backgroundColor: "#15803D",
                              borderColor: "#15803D",
                              color: "white",
                            }
                          : { borderColor: "#cbd5e1", color: "transparent" }
                      }
                    >
                      ✓
                    </div>
                    <span
                      className="text-sm"
                      style={{
                        color: completed.includes(task) ? "#15803D" : "#374151",
                      }}
                    >
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo capture */}
            <div
              className="rounded-2xl border p-5 mb-5"
              style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
            >
              <div
                className="text-sm font-semibold mb-3"
                style={{ color: "#0B1D3A" }}
              >
                Capture Evidence
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["Photo", "Video", "Document Scan"].map((type) => (
                  <button
                    key={type}
                    className="rounded-xl border-2 border-dashed p-4 flex flex-col items-center gap-2 text-xs font-medium transition-all"
                    style={{ borderColor: "#cbd5e1", color: "#64748b" }}
                  >
                    <span className="text-2xl">
                      {type === "Photo" ? "📸" : type === "Video" ? "🎥" : "📄"}
                    </span>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice notes */}
            <div
              className="rounded-2xl border p-5 mb-5"
              style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
            >
              <div
                className="text-sm font-semibold mb-3"
                style={{ color: "#0B1D3A" }}
              >
                Field Notes
              </div>
              {selected.notes && selected.notes.length > 0 && (
                <div
                  className="rounded-lg p-3 mb-3 text-xs italic"
                  style={{
                    backgroundColor: "#F8FAFC",
                    color: "#475569",
                    borderLeft: "3px solid #F5A623",
                  }}
                >
                  Previous note: {selected.notes}
                </div>
              )}
              <textarea
                rows={3}
                placeholder="Type or dictate your field observation..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none"
                style={{
                  borderColor: "#e2e8f0",
                  color: "#0B1D3A",
                  backgroundColor: "#FAFAFA",
                }}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleRecord}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={
                    recording
                      ? { backgroundColor: "#B91C1C", color: "white" }
                      : { backgroundColor: "#0B1D3A", color: "white" }
                  }
                >
                  {recording ? (
                    <>
                      <div className="flex items-end gap-0.5 h-4">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 rounded-full wave-bar"
                            style={{ backgroundColor: "white", height: "4px" }}
                          />
                        ))}
                      </div>
                      Recording…
                    </>
                  ) : (
                    <>🎙️ Voice Note</>
                  )}
                </button>
                {noteText && (
                  <button
                    className="flex-1 py-2 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: "#15803D", color: "white" }}
                  >
                    Save Note
                  </button>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: "#0B1D3A", color: "white" }}
              >
                Submit Verification Report
              </button>
              <button
                className="px-4 py-3 rounded-xl text-sm border"
                style={{ borderColor: "#e2e8f0", color: "#64748b" }}
              >
                Save Draft
              </button>
            </div>

            <div
              className="mt-3 rounded-lg px-4 py-2 text-xs text-center"
              style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
            >
              This sample report stays in the demo and is not sent to a server.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
