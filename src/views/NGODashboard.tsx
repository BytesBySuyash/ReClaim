import { useState } from "react"
import type { Disaster } from "../data/disasters"
import IndiaMap from "../components/IndiaMap"
import DISASTERS from "../data/disasters"

type FilterType = "All" | "Critical" | "High" | "Moderate" | "Recovering"

function HrvsChip({ score }: { score: number }) {
  const color =
    score >= 80
      ? "#B91C1C"
      : score >= 60
        ? "#C2410C"
        : score >= 40
          ? "#A16207"
          : "#15803D"
  const bg =
    score >= 80
      ? "#FEE2E2"
      : score >= 60
        ? "#FFEDD5"
        : score >= 40
          ? "#FEF3C7"
          : "#DCFCE7"
  const label =
    score >= 80
      ? "CRITICAL"
      : score >= 60
        ? "HIGH"
        : score >= 40
          ? "MOD"
          : "LOW"
  return (
    <div className="flex items-center gap-2">
      <span
        className="font-bold text-sm"
        style={{ fontFamily: "JetBrains Mono, monospace", color }}
      >
        {score}
      </span>
      <span
        className="text-xs font-semibold px-1.5 py-0.5 rounded"
        style={{ backgroundColor: bg, color }}
      >
        {label}
      </span>
    </div>
  )
}

const BUDGET_ITEMS = [
  { label: "Field Operations", allocated: 4.2, spent: 3.1, color: "#0B1D3A" },
  { label: "Relief Materials", allocated: 8.6, spent: 6.8, color: "#C2410C" },
  {
    label: "Document Recovery Camps",
    allocated: 2.4,
    spent: 1.9,
    color: "#A16207",
  },
  {
    label: "Livelihood Restoration",
    allocated: 6.8,
    spent: 2.4,
    color: "#15803D",
  },
  {
    label: "Training & Capacity",
    allocated: 1.2,
    spent: 0.8,
    color: "#0369A1",
  },
]

export default function NGODashboard({
  disaster,
  language = "en",
}: {
  disaster: Disaster
  language?: string
}) {
  const [filter, setFilter] = useState<FilterType>("All")
  const [selected, setSelected] = useState<Disaster["households"][0] | null>(
    null,
  )
  const [activeTab, setActiveTab] =
    useState<"households" | "intelligence" | "map" | "fieldworkers" | "budget" | "schemes">(
      "households",
    )

  const filtered = disaster.households.filter((h) => {
    if (filter === "All") return true
    if (filter === "Critical") return h.hrvs >= 80
    if (filter === "High") return h.hrvs >= 60 && h.hrvs < 80
    if (filter === "Moderate") return h.hrvs >= 40 && h.hrvs < 60
    if (filter === "Recovering") return h.hrvs < 40
    return true
  })

  const fieldWorkers = Array.from(
    new Set(
      disaster.households
        .map((h) => h.fieldWorker)
        .filter((name): name is string => Boolean(name)),
    ),
  ).map((name) => {
    const assigned = disaster.households.filter((h) => h.fieldWorker === name)
    return {
      name,
      state: disaster.state,
      area: assigned[0]?.location ?? disaster.district,
      assigned: assigned.length,
      verified: assigned.filter((h) => h.verified).length,
      status: assigned.some((h) => !h.verified) ? "Active" : "Delayed",
      lastSync: assigned.some((h) => !h.verified)
        ? "Recently synced"
        : "Verification complete",
    }
  })
  const budgetScale = Math.max(0.5, disaster.totalAffected / 5_000)
  const budgetItems = BUDGET_ITEMS.map((item) => ({
    ...item,
    allocated: Number((item.allocated * budgetScale).toFixed(1)),
    spent: Number((item.spent * budgetScale).toFixed(1)),
  }))
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.allocated, 0)
  const spentBudget = budgetItems.reduce((sum, item) => sum + item.spent, 0)
  const budgetSummary = [
    {
      label: "Total Budget",
      value: `₹${totalBudget.toFixed(1)} Cr`,
      sub: `${disaster.name} response`,
      color: "#0B1D3A",
      bg: "white",
    },
    {
      label: "Spent to Date",
      value: `₹${spentBudget.toFixed(1)} Cr`,
      sub: `${Math.round((spentBudget / totalBudget) * 100)}% utilised`,
      color: "#15803D",
      bg: "#DCFCE7",
    },
    {
      label: "Pending Disbursal",
      value: `₹${(totalBudget - spentBudget).toFixed(1)} Cr`,
      sub: "Awaiting verification",
      color: "#C2410C",
      bg: "#FFEDD5",
    },
  ]

  const schemeMatches = [
    {
      scheme: "NDRF Ex-Gratia",
      eligible: disaster.households.filter((h) => h.hrvs >= 80),
      color: "#B91C1C",
      bg: "#FEE2E2",
    },
    {
      scheme: "PMAY Housing",
      eligible: disaster.households.filter((h) =>
        h.blockers.some((b) => /house|housing|roof|landslide/i.test(b)),
      ),
      color: "#C2410C",
      bg: "#FFEDD5",
    },
    {
      scheme: "MGNREGS Work",
      eligible: disaster.households.filter((h) =>
        /farmer|worker|vendor|labour|fisher/i.test(h.type),
      ),
      color: "#15803D",
      bg: "#DCFCE7",
    },
    {
      scheme: "PM Fasal Bima",
      eligible: disaster.households.filter((h) =>
        /crop|paddy|farmer|agri/i.test(`${h.type} ${h.blockers.join(" ")}`),
      ),
      color: "#A16207",
      bg: "#FEF3C7",
    },
    {
      scheme: "Aadhaar Drive",
      eligible: disaster.households.filter((h) =>
        /aadhaar|document|identity|record/i.test(h.blockers.join(" ")),
      ),
      color: "#7C3AED",
      bg: "#EDE9FE",
    },
  ].map((scheme) => ({
    ...scheme,
    applying: scheme.eligible.filter((h) => h.verified).length,
  }))

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      {/* Dashboard header */}
      <div
        className="px-6 py-5 border-b"
        style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1
              className="text-xl font-bold mb-0.5"
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                color: "#0B1D3A",
              }}
            >
              {disaster.name} — Recovery Dashboard
            </h1>
            <p className="text-sm" style={{ color: "#64748b" }}>
              {disaster.state} · {disaster.district} · Event: {disaster.dates} ·
              Day {disaster.day} of Response
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: "#e2e8f0", color: "#64748b" }}
            >
              Export CSV
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#0B1D3A", color: "white" }}
            >
              Assign Field Workers
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {disaster.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 border"
              style={{ backgroundColor: s.bg, borderColor: "transparent" }}
            >
              <div
                className="text-2xl font-bold mb-0.5"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: s.color,
                }}
              >
                {s.value}
              </div>
              <div className="text-xs font-semibold" style={{ color: s.color }}>
                {s.label}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="px-6 border-b flex gap-0 overflow-x-auto"
        style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
      >
        {([
          {
            id: "households",
            label: `Households (${disaster.households.length})`,
          },
          { id: "intelligence", label: "Recovery Intelligence" },
          { id: "map", label: "Recovery Map" },
          { id: "fieldworkers", label: "Field Workers" },
          { id: "budget", label: "Budget" },
          { id: "schemes", label: "Schemes" },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
            style={
              activeTab === tab.id
                ? { borderColor: "#F5A623", color: "#0B1D3A" }
                : { borderColor: "transparent", color: "#64748b" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "households" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#64748b" }}
                >
                  Filter:
                </span>
                {([
                  "All",
                  "Critical",
                  "High",
                  "Moderate",
                  "Recovering",
                ] as FilterType[]).map((f) => {
                  const colorMap: Record<FilterType, {
                    color: string
                    bg: string
                  }> = {
                    All: { color: "#0B1D3A", bg: "#e2e8f0" },
                    Critical: { color: "#B91C1C", bg: "#FEE2E2" },
                    High: { color: "#C2410C", bg: "#FFEDD5" },
                    Moderate: { color: "#A16207", bg: "#FEF3C7" },
                    Recovering: { color: "#15803D", bg: "#DCFCE7" },
                  }
                  const c = colorMap[f]
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={
                        filter === f
                          ? { backgroundColor: c.color, color: "white" }
                          : { backgroundColor: c.bg, color: c.color }
                      }
                    >
                      {f}
                    </button>
                  )
                })}
                <span className="ml-auto text-xs" style={{ color: "#94a3b8" }}>
                  {filtered.length} of {disaster.households.length} shown
                </span>
              </div>

              <div
                className="rounded-2xl overflow-hidden border"
                style={{ borderColor: "#e2e8f0", backgroundColor: "white" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC" }}>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold"
                        style={{ color: "#64748b" }}
                      >
                        Household
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold"
                        style={{ color: "#64748b" }}
                      >
                        HRVS
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold hidden md:table-cell"
                        style={{ color: "#64748b" }}
                      >
                        Stage
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold hidden lg:table-cell"
                        style={{ color: "#64748b" }}
                      >
                        Key Blockers
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold hidden md:table-cell"
                        style={{ color: "#64748b" }}
                      >
                        Field Worker
                      </th>
                      <th
                        className="text-left px-4 py-3 text-xs font-semibold"
                        style={{ color: "#64748b" }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((h, i) => (
                      <tr
                        key={h.id}
                        className="border-t cursor-pointer transition-colors"
                        style={{
                          borderColor: "#f1f5f9",
                          backgroundColor:
                            selected?.id === h.id
                              ? "#FEF3C7"
                              : i % 2 === 0
                                ? "white"
                                : "#FAFAFA",
                        }}
                        onClick={() =>
                          setSelected(selected?.id === h.id ? null : h)
                        }
                      >
                        <td className="px-4 py-3">
                          <div
                            className="font-semibold"
                            style={{ color: "#0B1D3A" }}
                          >
                            {h.name}
                          </div>
                          <div className="text-xs" style={{ color: "#94a3b8" }}>
                            {h.location} · {h.members} members
                          </div>
                          <div className="text-xs" style={{ color: "#64748b" }}>
                            {h.type}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <HrvsChip score={h.hrvs} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span
                            className="text-xs font-medium px-2 py-1 rounded"
                            style={{
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                            }}
                          >
                            {h.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {h.blockers.slice(0, 2).map((b) => (
                              <span
                                key={b}
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: "#FEE2E2",
                                  color: "#B91C1C",
                                }}
                              >
                                {b}
                              </span>
                            ))}
                            {h.blockers.length > 2 && (
                              <span
                                className="text-xs px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: "#f1f5f9",
                                  color: "#64748b",
                                }}
                              >
                                +{h.blockers.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 hidden md:table-cell text-xs"
                          style={{
                            color: h.fieldWorker ? "#475569" : "#94a3b8",
                          }}
                        >
                          {h.fieldWorker ?? "— Unassigned"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded"
                            style={
                              h.verified
                                ? {
                                    backgroundColor: "#DCFCE7",
                                    color: "#15803D",
                                  }
                                : {
                                    backgroundColor: "#FEF3C7",
                                    color: "#A16207",
                                  }
                            }
                          >
                            {h.verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "intelligence" && (
            <div className="space-y-6">
              <div>
                <div
                  className="text-sm font-semibold mb-3"
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    color: "#0B1D3A",
                  }}
                >
                  Recommended Interventions — Priority Order
                </div>
                <div className="space-y-3">
                  {disaster.interventions.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-4 border flex items-start gap-4"
                      style={{
                        backgroundColor: "white",
                        borderColor: item.urgent ? "#fca5a5" : "#e2e8f0",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={
                          item.urgent
                            ? { backgroundColor: "#FEE2E2", color: "#B91C1C" }
                            : { backgroundColor: "#f1f5f9", color: "#64748b" }
                        }
                      >
                        {i + 1}
                      </div>
                      <div>
                        <div
                          className="font-semibold text-sm mb-1 flex items-center gap-2"
                          style={{ color: "#0B1D3A" }}
                        >
                          {item.label}
                          {item.urgent && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                backgroundColor: "#B91C1C",
                                color: "white",
                              }}
                            >
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-xs" style={{ color: "#64748b" }}>
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl border p-6"
                style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
              >
                <div
                  className="text-sm font-semibold mb-4"
                  style={{ color: "#0B1D3A" }}
                >
                  HRVS Distribution —{" "}
                  {disaster.totalAffected.toLocaleString("en-IN")} Households
                </div>
                {disaster.distribution.map((row) => (
                  <div key={row.label} className="flex items-center gap-4 mb-3">
                    <div
                      className="w-48 text-xs font-medium"
                      style={{ color: row.color }}
                    >
                      {row.label}
                    </div>
                    <div
                      className="flex-1 h-3 rounded-full"
                      style={{ backgroundColor: "#f1f5f9" }}
                    >
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${row.pct * 2}%`,
                          backgroundColor: row.color,
                        }}
                      />
                    </div>
                    <div
                      className="w-16 text-right text-xs font-semibold"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        color: "#0B1D3A",
                      }}
                    >
                      {row.count.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {disaster.clusters.map((cluster) => (
                  <div
                    key={cluster.title}
                    className="rounded-xl p-4 border"
                    style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{cluster.icon}</span>
                      <div>
                        <div
                          className="font-semibold text-sm"
                          style={{ color: "#0B1D3A" }}
                        >
                          {cluster.title}
                        </div>
                        <div className="text-xs" style={{ color: "#94a3b8" }}>
                          {cluster.area}
                        </div>
                      </div>
                      <div
                        className="ml-auto font-bold text-lg"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#0B1D3A",
                        }}
                      >
                        {cluster.count}
                      </div>
                    </div>
                    <p className="text-xs" style={{ color: "#64748b" }}>
                      {cluster.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "map" && (
            <div className="grid lg:grid-cols-3 gap-5">
              <div
                className="lg:col-span-2 rounded-2xl border overflow-hidden"
                style={{ borderColor: "#e2e8f0", backgroundColor: "#E8F4FD" }}
              >
                <IndiaMap
                  disasters={DISASTERS}
                  activeId={disaster.id}
                  height={480}
                />
              </div>
              <div className="space-y-3">
                <div
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#64748b" }}
                >
                  Cluster Areas — {disaster.district}
                </div>
                {disaster.clusters.map((c, i) => {
                  const colors = ["#B91C1C", "#C2410C", "#A16207", "#0369A1"]
                  const bgs = ["#FEE2E2", "#FFEDD5", "#FEF3C7", "#E0F2FE"]
                  return (
                    <div
                      key={c.title}
                      className="rounded-xl border p-4"
                      style={{
                        backgroundColor: "white",
                        borderColor: "#e2e8f0",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{c.icon}</span>
                        <div
                          className="font-semibold text-sm"
                          style={{ color: "#0B1D3A" }}
                        >
                          {c.title}
                        </div>
                        <div
                          className="ml-auto font-bold text-sm"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            color: colors[i % 4],
                          }}
                        >
                          {c.count.toLocaleString()}
                        </div>
                      </div>
                      <div
                        className="text-xs mb-1"
                        style={{ color: "#94a3b8" }}
                      >
                        {c.area}
                      </div>
                      <p className="text-xs" style={{ color: "#64748b" }}>
                        {c.detail}
                      </p>
                    </div>
                  )
                })}
                <div className="flex gap-3 text-xs flex-wrap">
                  {[
                    ["Critical", "#B91C1C"],
                    ["High", "#C2410C"],
                    ["Moderate", "#A16207"],
                    ["Recovering", "#15803D"],
                  ].map(([l, c]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: c }}
                      />
                      <span style={{ color: "#64748b" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "fieldworkers" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 mb-2">
                {[
                  {
                    label: "Total Workers",
                    value: fieldWorkers.length,
                    color: "#0B1D3A",
                    bg: "white",
                  },
                  {
                    label: "Active Now",
                    value: fieldWorkers.filter((w) => w.status === "Active")
                      .length,
                    color: "#15803D",
                    bg: "#DCFCE7",
                  },
                  {
                    label: "Unassigned HH",
                    value: disaster.households.filter((h) => !h.fieldWorker)
                      .length,
                    color: "#C2410C",
                    bg: "#FFEDD5",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-4 border text-center"
                    style={{ backgroundColor: s.bg, borderColor: "#e2e8f0" }}
                  >
                    <div
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        color: s.color,
                      }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs" style={{ color: s.color }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#F8FAFC" }}>
                      {[
                        "Worker",
                        "State",
                        "Area",
                        "Assigned",
                        "Verified",
                        "Status",
                        "Last Sync",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold"
                          style={{ color: "#64748b" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fieldWorkers.map((w, i) => (
                      <tr
                        key={w.name}
                        className="border-t"
                        style={{
                          borderColor: "#f1f5f9",
                          backgroundColor: i % 2 === 0 ? "white" : "#FAFAFA",
                        }}
                      >
                        <td
                          className="px-4 py-3 font-semibold"
                          style={{ color: "#0B1D3A" }}
                        >
                          {w.name}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#64748b" }}
                        >
                          {w.state}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#64748b" }}
                        >
                          {w.area}
                        </td>
                        <td
                          className="px-4 py-3 text-center font-bold"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            color: "#0B1D3A",
                          }}
                        >
                          {w.assigned}
                        </td>
                        <td
                          className="px-4 py-3 text-center font-bold"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            color: "#15803D",
                          }}
                        >
                          {w.verified}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              backgroundColor:
                                w.status === "Active"
                                  ? "#DCFCE7"
                                  : w.status === "Delayed"
                                    ? "#FEF3C7"
                                    : "#FEE2E2",
                              color:
                                w.status === "Active"
                                  ? "#15803D"
                                  : w.status === "Delayed"
                                    ? "#A16207"
                                    : "#B91C1C",
                            }}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ color: "#94a3b8" }}
                        >
                          {w.lastSync}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="rounded-xl border p-4"
                style={{ backgroundColor: "#FFFBEB", borderColor: "#fcd34d" }}
              >
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#92400e" }}
                >
                  ⚠️ Unassigned Critical Households
                </div>
                <p className="text-xs" style={{ color: "#92400e" }}>
                  {
                    disaster.households.filter(
                      (h) => !h.fieldWorker && h.hrvs >= 80,
                    ).length
                  }{" "}
                  critical households (
                  {disaster.households
                    .filter((h) => !h.fieldWorker && h.hrvs >= 80)
                    .map((h) => h.name)
                    .join(", ")}
                  ) have no field worker assigned. Recommend immediate
                  assignment.
                </p>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                {budgetSummary.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border p-5"
                    style={{ backgroundColor: s.bg, borderColor: "#e2e8f0" }}
                  >
                    <div
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        color: s.color,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      className="text-sm font-semibold mt-0.5"
                      style={{ color: s.color }}
                    >
                      {s.label}
                    </div>
                    <div className="text-xs" style={{ color: "#94a3b8" }}>
                      {s.sub}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl border p-6"
                style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
              >
                <div
                  className="text-sm font-semibold mb-4"
                  style={{ color: "#0B1D3A" }}
                >
                  Budget by Category
                </div>
                {budgetItems.map((b) => (
                  <div key={b.label} className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "#374151" }}>{b.label}</span>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: b.color,
                        }}
                      >
                        ₹{b.spent}Cr / ₹{b.allocated}Cr (
                        {Math.round((b.spent / b.allocated) * 100)}%)
                      </span>
                    </div>
                    <div
                      className="h-3 rounded-full"
                      style={{ backgroundColor: "#f1f5f9" }}
                    >
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${(b.spent / b.allocated) * 100}%`,
                          backgroundColor: b.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "schemes" && (
            <div className="space-y-5">
              <div className="text-sm" style={{ color: "#64748b" }}>
                Based on HERVS scores and household profiles, RECLAIM has
                matched households in <strong>{disaster.name}</strong> to
                eligible government schemes.
              </div>
              <div className="space-y-3">
                {schemeMatches.map((s) => {
                  const eligibleCount = s.eligible.length
                  const applyingCount = s.applying
                  return (
                    <div
                      key={s.scheme}
                      className="rounded-xl border p-5"
                      style={{
                        backgroundColor: "white",
                        borderColor: "#e2e8f0",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="font-semibold text-sm"
                          style={{ color: "#0B1D3A" }}
                        >
                          {s.scheme}
                        </div>
                        <div className="flex gap-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{ backgroundColor: s.bg, color: s.color }}
                          >
                            {eligibleCount} eligible
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: "#DCFCE7",
                              color: "#15803D",
                            }}
                          >
                            {applyingCount} applying
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div
                            className="text-xs mb-1"
                            style={{ color: "#94a3b8" }}
                          >
                            Eligible
                          </div>
                          <div
                            className="h-2 rounded-full"
                            style={{ backgroundColor: "#f1f5f9" }}
                          >
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(eligibleCount / disaster.households.length) * 100}%`,
                                backgroundColor: s.color,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div
                            className="text-xs mb-1"
                            style={{ color: "#94a3b8" }}
                          >
                            Applications filed
                          </div>
                          <div
                            className="h-2 rounded-full"
                            style={{ backgroundColor: "#f1f5f9" }}
                          >
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${
                                  eligibleCount
                                    ? (applyingCount / eligibleCount) * 100
                                    : 0
                                }%`,
                                backgroundColor: "#15803D",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      {applyingCount < eligibleCount && (
                        <div
                          className="text-xs mt-2"
                          style={{ color: "#A16207" }}
                        >
                          ⚠️ {eligibleCount - applyingCount} eligible households
                          have not yet applied — outreach needed.
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right panel — selected household */}
        {selected && (
          <div
            className="w-72 flex-shrink-0 border-l p-5 overflow-auto"
            style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="font-semibold"
                style={{
                  color: "#0B1D3A",
                  fontFamily: "Fraunces, Georgia, serif",
                }}
              >
                {selected.name}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-lg"
                style={{ color: "#94a3b8" }}
              >
                x
              </button>
            </div>

            <div
              className="mb-4 text-xs space-y-1"
              style={{ color: "#64748b" }}
            >
              <div>Location: {selected.location}</div>
              <div>Members: {selected.members}</div>
              <div>Livelihood: {selected.type}</div>
              <div>ID: {selected.id}</div>
            </div>

            <div
              className="flex items-center justify-between rounded-xl p-3 mb-4"
              style={{ backgroundColor: "#0B1D3A" }}
            >
              <span className="text-white text-xs">HRVS Score</span>
              <HrvsChip score={selected.hrvs} />
            </div>

            {selected.blockers.length > 0 && (
              <div className="mb-4">
                <div
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "#64748b" }}
                >
                  Recovery Blockers
                </div>
                {selected.blockers.map((b) => (
                  <div
                    key={b}
                    className="flex items-center gap-2 text-xs mb-1.5 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
                  >
                    <span>-</span> {b}
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4">
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#64748b" }}
              >
                Recovery Stage
              </div>
              <div className="flex gap-1">
                {["72h", "7d", "30d", "90d"].map((s, i) => {
                  const stageMap: Record<string, number> = {
                    "72 Hours": 0,
                    "7 Days": 1,
                    "30 Days": 2,
                    "90 Days": 3,
                  }
                  const current = stageMap[selected.stage] ?? 0
                  return (
                    <div
                      key={s}
                      className="flex-1 h-2 rounded-full"
                      style={{
                        backgroundColor: i <= current ? "#F5A623" : "#e2e8f0",
                      }}
                    />
                  )
                })}
              </div>
              <div className="text-xs mt-1" style={{ color: "#64748b" }}>
                Stage: {selected.stage}
              </div>
            </div>

            <div className="mb-4">
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#64748b" }}
              >
                Field Worker
              </div>
              {selected.fieldWorker ? (
                <div
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ backgroundColor: "#DCFCE7", color: "#166534" }}
                >
                  Assigned: {selected.fieldWorker}
                </div>
              ) : (
                <button
                  className="w-full text-xs py-2 rounded-lg font-semibold"
                  style={{ backgroundColor: "#0B1D3A", color: "white" }}
                >
                  Assign Field Worker
                </button>
              )}
            </div>

            <div
              className="text-xs px-3 py-2 rounded-lg mb-2"
              style={
                selected.verified
                  ? { backgroundColor: "#DCFCE7", color: "#15803D" }
                  : { backgroundColor: "#FEF3C7", color: "#A16207" }
              }
            >
              {selected.verified
                ? "Human verified"
                : "Pending field verification"}
            </div>

            <button
              className="w-full mt-2 py-2 rounded-xl text-xs font-semibold border"
              style={{ borderColor: "#F5A623", color: "#A16207" }}
            >
              View Full Profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
