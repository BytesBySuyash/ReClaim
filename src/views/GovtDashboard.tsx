import { useState } from "react"
import type { Disaster } from "../data/disasters"
import IndiaMap from "../components/IndiaMap"

type GovtTab = "overview" | "districts" | "schemes" | "budget" | "map"

const SCHEME_DATA = [
  {
    name: "NDRF Ex-Gratia",
    dept: "Ministry of Home Affairs",
    eligibility: "HRVS ≥ 80, total home damage",
    allocated: "₹8.4 Cr",
    disbursed: "₹3.2 Cr",
    pct: 38,
    households: 2810,
    color: "#B91C1C",
    bg: "#FEE2E2",
  },
  {
    name: "PM Awas Yojana (PMAY)",
    dept: "Ministry of Housing",
    eligibility: "Home fully destroyed, BPL",
    allocated: "₹12.6 Cr",
    disbursed: "₹5.1 Cr",
    pct: 40,
    households: 1840,
    color: "#C2410C",
    bg: "#FFEDD5",
  },
  {
    name: "PM Fasal Bima Yojana",
    dept: "Ministry of Agriculture",
    eligibility: "Crop loss ≥ 50%, enrolled farmer",
    allocated: "₹6.8 Cr",
    disbursed: "₹2.9 Cr",
    pct: 43,
    households: 3200,
    color: "#A16207",
    bg: "#FEF3C7",
  },
  {
    name: "MGNREGS Emergency Works",
    dept: "Ministry of Rural Development",
    eligibility: "Rural HH, livelihood disruption",
    allocated: "₹4.2 Cr",
    disbursed: "₹2.8 Cr",
    pct: 67,
    households: 5100,
    color: "#15803D",
    bg: "#DCFCE7",
  },
  {
    name: "PM-KISAN Emergency Relief",
    dept: "Ministry of Agriculture",
    eligibility: "Registered small/marginal farmers",
    allocated: "₹3.5 Cr",
    disbursed: "₹1.8 Cr",
    pct: 51,
    households: 2400,
    color: "#0369A1",
    bg: "#E0F2FE",
  },
  {
    name: "Aadhaar Re-enrolment Drive",
    dept: "UIDAI",
    eligibility: "Document loss certified by field worker",
    allocated: "₹0.9 Cr",
    disbursed: "₹0.7 Cr",
    pct: 78,
    households: 4580,
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
]

const DISTRICT_DATA = [
  {
    name: "Cachar, Assam",
    year: 2026,
    affected: 8900,
    critical: 1120,
    high: 1820,
    fieldWorkers: 12,
    verified: 42,
    pending: 58,
    budget: "₹18.2 Cr",
    color: "#EF4444",
  },
  {
    name: "Dhubri, Assam",
    year: 2026,
    affected: 7400,
    critical: 890,
    high: 1480,
    fieldWorkers: 9,
    verified: 38,
    pending: 62,
    budget: "₹15.1 Cr",
    color: "#F59E0B",
  },
  {
    name: "Kamrup, Assam",
    year: 2026,
    affected: 6200,
    critical: 680,
    high: 1120,
    fieldWorkers: 8,
    verified: 45,
    pending: 55,
    budget: "₹12.8 Cr",
    color: "#22C55E",
  },
  {
    name: "Kurnool, AP",
    year: 2024,
    affected: 5000,
    critical: 480,
    high: 800,
    fieldWorkers: 7,
    verified: 62,
    pending: 38,
    budget: "₹9.4 Cr",
    color: "#3B82F6",
  },
  {
    name: "Wayanad, Kerala",
    year: 2025,
    affected: 3800,
    critical: 510,
    high: 720,
    fieldWorkers: 6,
    verified: 55,
    pending: 45,
    budget: "₹8.6 Cr",
    color: "#8B5CF6",
  },
]

const BUDGET_CATEGORIES = [
  { label: "Search & Rescue", allocated: 8.4, spent: 7.9, color: "#B91C1C" },
  {
    label: "Relief Camps & Food",
    allocated: 14.2,
    spent: 11.8,
    color: "#C2410C",
  },
  { label: "Document Recovery", allocated: 3.8, spent: 2.4, color: "#A16207" },
  {
    label: "Livelihood Restoration",
    allocated: 18.6,
    spent: 8.2,
    color: "#15803D",
  },
  { label: "Housing Repair", allocated: 22.4, spent: 5.6, color: "#0369A1" },
  { label: "Infrastructure", allocated: 12.8, spent: 3.1, color: "#7C3AED" },
]

const FIELD_REPORT_SUMMARY = [
  {
    state: "Assam",
    workers: 29,
    households: 48,
    verified: 19,
    critical_unverified: 14,
    last_sync: "4 min ago",
    status: "active",
  },
  {
    state: "Andhra Pradesh",
    workers: 7,
    households: 12,
    verified: 7,
    critical_unverified: 2,
    last_sync: "12 min ago",
    status: "active",
  },
  {
    state: "Kerala",
    workers: 6,
    households: 14,
    verified: 8,
    critical_unverified: 4,
    last_sync: "1 hr ago",
    status: "delayed",
  },
]

export default function GovtDashboard({
  disasters,
  language = "en",
}: {
  disasters: Disaster[]
  language?: string
}) {
  const [activeTab, setActiveTab] = useState<GovtTab>("overview")
  const [selectedDisaster, setSelectedDisaster] = useState<string | null>(null)

  const totalAffected = disasters.reduce((s, d) => s + d.totalAffected, 0)
  const totalCritical = disasters.reduce(
    (s, d) =>
      s +
      (d.distribution.find((r) => r.label.startsWith("Critical"))?.count ?? 0),
    0,
  )
  const totalHouseholds = disasters.reduce((s, d) => s + d.households.length, 0)
  const totalVerified = disasters.reduce(
    (s, d) => s + d.households.filter((h) => h.verified).length,
    0,
  )

  const TABS: { id: GovtTab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "🏛️" },
    { id: "districts", label: "District Comparison", icon: "📊" },
    { id: "schemes", label: "Scheme Deployment", icon: "📋" },
    { id: "budget", label: "Budget Utilization", icon: "💰" },
    { id: "map", label: "Disaster Map", icon: "🗺️" },
  ]

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 border-b"
        style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#0B1D3A" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path
                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    stroke="#F5A623"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="9,22 9,12 15,12 15,22"
                    stroke="#F5A623"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h1
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    color: "#0B1D3A",
                  }}
                >
                  National Disaster Recovery Control Room
                </h1>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  {disasters.length} active events ·{" "}
                  {disasters
                    .map((d) => d.state)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: "#e2e8f0", color: "#64748b" }}
            >
              Export Report
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "#B91C1C", color: "white" }}
            >
              Emergency Alert
            </button>
          </div>
        </div>

        {/* Top-line aggregate stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            {
              label: "Active Disasters",
              value: disasters.length.toString(),
              sub: `${disasters
                .map((d) => d.year)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(", ")}`,
              color: "#0B1D3A",
              bg: "white",
            },
            {
              label: "Total Affected HH",
              value: totalAffected.toLocaleString("en-IN"),
              sub: "Across all events",
              color: "#B91C1C",
              bg: "#FEE2E2",
            },
            {
              label: "Critical Priority",
              value: totalCritical.toLocaleString("en-IN"),
              sub: "HRVS ≥ 80",
              color: "#C2410C",
              bg: "#FFEDD5",
            },
            {
              label: "Verified",
              value: `${Math.round((totalVerified / totalHouseholds) * 100)}%`,
              sub: `${totalVerified}/${totalHouseholds} households`,
              color: "#15803D",
              bg: "#DCFCE7",
            },
            {
              label: "Total Relief Funds",
              value: "₹64.2 Cr",
              sub: "Sanctioned + pending",
              color: "#0369A1",
              bg: "#E0F2FE",
            },
            {
              label: "Field Workers Active",
              value: "42",
              sub: "Across 3 states",
              color: "#7C3AED",
              bg: "#EDE9FE",
            },
          ].map((s) => (
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
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
            style={
              activeTab === tab.id
                ? { borderColor: "#F5A623", color: "#0B1D3A" }
                : { borderColor: "transparent", color: "#64748b" }
            }
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Per-disaster card grid */}
            <div>
              <div
                className="text-sm font-semibold mb-3"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: "#0B1D3A",
                }}
              >
                Active Disaster Events
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {disasters.map((d) => {
                  const critical = d.distribution.find((r) =>
                    r.label.startsWith("Critical"),
                  )
                  const high = d.distribution.find((r) =>
                    r.label.startsWith("High"),
                  )
                  const verifiedCount = d.households.filter(
                    (h) => h.verified,
                  ).length
                  const YEAR_COL: Record<number, string> = {
                    2024: "#3B82F6",
                    2025: "#8B5CF6",
                    2026: "#22C55E",
                  }
                  const yc = YEAR_COL[d.year] ?? "#64748b"
                  return (
                    <div
                      key={d.id}
                      className="rounded-2xl border p-5"
                      style={{
                        backgroundColor: "white",
                        borderColor: "#e2e8f0",
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div
                            className="font-bold text-sm mb-0.5"
                            style={{
                              fontFamily: "Fraunces, Georgia, serif",
                              color: "#0B1D3A",
                            }}
                          >
                            {d.shortName}
                          </div>
                          <div className="text-xs" style={{ color: "#64748b" }}>
                            {d.state} · {d.dates}
                          </div>
                        </div>
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-full"
                          style={{ backgroundColor: yc + "20", color: yc }}
                        >
                          Day {d.day}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div
                          className="rounded-lg p-2 text-center"
                          style={{ backgroundColor: "#FEE2E2" }}
                        >
                          <div
                            className="text-lg font-bold"
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              color: "#B91C1C",
                            }}
                          >
                            {critical?.count.toLocaleString("en-IN")}
                          </div>
                          <div className="text-xs" style={{ color: "#B91C1C" }}>
                            Critical HH
                          </div>
                        </div>
                        <div
                          className="rounded-lg p-2 text-center"
                          style={{ backgroundColor: "#F8FAFC" }}
                        >
                          <div
                            className="text-lg font-bold"
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              color: "#0B1D3A",
                            }}
                          >
                            {d.totalAffected.toLocaleString("en-IN")}
                          </div>
                          <div className="text-xs" style={{ color: "#64748b" }}>
                            Total Affected
                          </div>
                        </div>
                      </div>

                      {/* HRVS bar */}
                      <div className="mb-3">
                        <div
                          className="flex justify-between text-xs mb-1"
                          style={{ color: "#64748b" }}
                        >
                          <span>HRVS Distribution</span>
                          <span>
                            {verifiedCount}/{d.households.length} verified
                          </span>
                        </div>
                        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                          {d.distribution.map((row) => (
                            <div
                              key={row.label}
                              style={{
                                width: `${row.pct * 2}%`,
                                backgroundColor: row.color,
                                borderRadius: "2px",
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "#94a3b8" }}>
                          {d.interventions.filter((i) => i.urgent).length}{" "}
                          urgent interventions
                        </span>
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              verifiedCount / d.households.length > 0.5
                                ? "#DCFCE7"
                                : "#FEF3C7",
                            color:
                              verifiedCount / d.households.length > 0.5
                                ? "#15803D"
                                : "#A16207",
                          }}
                        >
                          {Math.round(
                            (verifiedCount / d.households.length) * 100,
                          )}
                          % verified
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Field report summary */}
            <div
              className="rounded-2xl border p-6"
              style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
            >
              <div
                className="text-sm font-semibold mb-4"
                style={{ color: "#0B1D3A" }}
              >
                Field Operations Status
              </div>
              <div className="space-y-3">
                {FIELD_REPORT_SUMMARY.map((r) => (
                  <div
                    key={r.state}
                    className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ backgroundColor: "#F8FAFC" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          r.status === "active" ? "#15803D" : "#F59E0B",
                      }}
                    />
                    <div className="flex-1">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "#0B1D3A" }}
                      >
                        {r.state}
                      </div>
                      <div className="text-xs" style={{ color: "#64748b" }}>
                        {r.workers} workers · {r.households} households assigned
                        · {r.critical_unverified} critical unverified
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-xs font-semibold"
                        style={{ color: "#15803D" }}
                      >
                        {r.verified} verified today
                      </div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>
                        Last sync: {r.last_sync}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DISTRICT COMPARISON */}
        {activeTab === "districts" && (
          <div className="space-y-6">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#0B1D3A" }}>
                    {[
                      "District / State",
                      "Year",
                      "Total Affected",
                      "Critical HH",
                      "High HH",
                      "Field Workers",
                      "Verification",
                      "Budget",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold"
                        style={{ color: "#94a3b8" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DISTRICT_DATA.map((d, i) => (
                    <tr
                      key={d.name}
                      className="border-t"
                      style={{
                        borderColor: "#f1f5f9",
                        backgroundColor: i % 2 === 0 ? "white" : "#FAFAFA",
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: d.color }}
                          />
                          <span
                            className="font-semibold"
                            style={{ color: "#0B1D3A" }}
                          >
                            {d.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-xs font-medium"
                        style={{ color: "#64748b" }}
                      >
                        {d.year}
                      </td>
                      <td
                        className="px-4 py-3 font-bold"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#0B1D3A",
                        }}
                      >
                        {d.affected.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="font-bold text-sm"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            color: "#B91C1C",
                          }}
                        >
                          {d.critical.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="font-bold text-sm"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            color: "#C2410C",
                          }}
                        >
                          {d.high.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: "#475569" }}
                      >
                        {d.fieldWorkers}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 h-1.5 rounded-full"
                            style={{ backgroundColor: "#f1f5f9", minWidth: 60 }}
                          >
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${d.verified}%`,
                                backgroundColor:
                                  d.verified >= 50 ? "#15803D" : "#F59E0B",
                              }}
                            />
                          </div>
                          <span
                            className="text-xs"
                            style={{ color: "#64748b" }}
                          >
                            {d.verified}%
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 text-xs font-semibold"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#0369A1",
                        }}
                      >
                        {d.budget}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bar chart comparison */}
            <div
              className="rounded-2xl border p-6"
              style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
            >
              <div
                className="text-sm font-semibold mb-4"
                style={{ color: "#0B1D3A" }}
              >
                Critical Household Density by District
              </div>
              {DISTRICT_DATA.sort((a, b) => b.critical - a.critical).map(
                (d) => (
                  <div key={d.name} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "#374151" }}>{d.name}</span>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#B91C1C",
                        }}
                      >
                        {d.critical.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="h-3 rounded-full"
                      style={{ backgroundColor: "#f1f5f9" }}
                    >
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${(d.critical / 1200) * 100}%`,
                          backgroundColor: d.color,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* SCHEME DEPLOYMENT */}
        {activeTab === "schemes" && (
          <div className="space-y-4">
            <div
              className="text-sm font-semibold mb-2"
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                color: "#0B1D3A",
              }}
            >
              Government Scheme Deployment Status
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {SCHEME_DATA.map((s) => (
                <div
                  key={s.name}
                  className="rounded-2xl border p-5"
                  style={{ backgroundColor: "white", borderColor: "#e2e8f0" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div
                        className="font-semibold text-sm mb-0.5"
                        style={{ color: "#0B1D3A" }}
                      >
                        {s.name}
                      </div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>
                        {s.dept}
                      </div>
                    </div>
                    <div
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {s.pct}% disbursed
                    </div>
                  </div>

                  <div
                    className="text-xs mb-3 p-2 rounded-lg"
                    style={{ backgroundColor: "#F8FAFC", color: "#475569" }}
                  >
                    Eligibility: {s.eligibility}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <div
                        className="text-sm font-bold"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#0B1D3A",
                        }}
                      >
                        {s.allocated}
                      </div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>
                        Allocated
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-sm font-bold"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: s.color,
                        }}
                      >
                        {s.disbursed}
                      </div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>
                        Disbursed
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-sm font-bold"
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#64748b",
                        }}
                      >
                        {s.households.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs" style={{ color: "#94a3b8" }}>
                        HH reached
                      </div>
                    </div>
                  </div>

                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: "#f1f5f9" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BUDGET */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-2">
              {[
                {
                  label: "Total Sanctioned",
                  value: "₹80.2 Cr",
                  sub: "Central + State funds",
                  color: "#0B1D3A",
                  bg: "white",
                },
                {
                  label: "Total Disbursed",
                  value: "₹39.3 Cr",
                  sub: "49% utilization rate",
                  color: "#15803D",
                  bg: "#DCFCE7",
                },
                {
                  label: "Pending Disbursal",
                  value: "₹40.9 Cr",
                  sub: "Awaiting verification",
                  color: "#C2410C",
                  bg: "#FFEDD5",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border p-5"
                  style={{ backgroundColor: s.bg, borderColor: "#e2e8f0" }}
                >
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="text-sm font-semibold"
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
                Budget Allocation by Category
              </div>
              {BUDGET_CATEGORIES.map((c) => (
                <div key={c.label} className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: "#0B1D3A" }}>
                      {c.label}
                    </span>
                    <div
                      className="flex items-center gap-3 text-xs"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      <span style={{ color: c.color }}>₹{c.spent}Cr spent</span>
                      <span style={{ color: "#94a3b8" }}>
                        / ₹{c.allocated}Cr
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-4 rounded-full relative overflow-hidden"
                    style={{ backgroundColor: "#f1f5f9" }}
                  >
                    <div
                      className="h-4 rounded-full absolute left-0"
                      style={{
                        width: `${(c.spent / c.allocated) * 100}%`,
                        backgroundColor: c.color,
                        opacity: 0.9,
                      }}
                    />
                    <div
                      className="absolute right-0 text-xs flex items-center px-2 h-full"
                      style={{ color: "#94a3b8" }}
                    >
                      {Math.round((c.spent / c.allocated) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl border p-6"
              style={{ backgroundColor: "#FFFBEB", borderColor: "#fcd34d" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span>⚠️</span>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#92400e" }}
                >
                  Bottleneck Alert
                </div>
              </div>
              <p className="text-sm" style={{ color: "#92400e" }}>
                Housing Repair budget is 75% unspent (₹16.8 Cr). Primary cause:
                62% of critical households still pending field verification.
                Prioritizing field worker redeployment to Cachar and Dhubri for
                verification drive.
              </p>
            </div>
          </div>
        )}

        {/* MAP */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="text-sm" style={{ color: "#64748b" }}>
              Click a disaster marker to view details. Marker size indicates
              affected household count.
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div
                className="lg:col-span-2 rounded-2xl border overflow-hidden"
                style={{ backgroundColor: "#E8F4FD", borderColor: "#e2e8f0" }}
              >
                <IndiaMap
                  disasters={disasters}
                  activeId={selectedDisaster ?? undefined}
                  onSelect={(id) =>
                    setSelectedDisaster(selectedDisaster === id ? null : id)
                  }
                  height={520}
                />
              </div>
              <div className="space-y-3">
                <div
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#64748b" }}
                >
                  Active Events
                </div>
                {disasters.map((d) => {
                  const YEAR_COL: Record<number, string> = {
                    2024: "#3B82F6",
                    2025: "#8B5CF6",
                    2026: "#22C55E",
                  }
                  const yc = YEAR_COL[d.year] ?? "#64748b"
                  const critical =
                    d.distribution.find((r) => r.label.startsWith("Critical"))
                      ?.count ?? 0
                  return (
                    <div
                      key={d.id}
                      onClick={() =>
                        setSelectedDisaster(
                          selectedDisaster === d.id ? null : d.id,
                        )
                      }
                      className="rounded-xl border p-4 cursor-pointer transition-all"
                      style={
                        selectedDisaster === d.id
                          ? { borderColor: yc, backgroundColor: yc + "10" }
                          : { borderColor: "#e2e8f0", backgroundColor: "white" }
                      }
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div
                            className="font-semibold text-sm"
                            style={{ color: "#0B1D3A" }}
                          >
                            {d.shortName}
                          </div>
                          <div className="text-xs" style={{ color: "#64748b" }}>
                            {d.district}, {d.state}
                          </div>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded font-bold"
                          style={{ backgroundColor: yc + "20", color: yc }}
                        >
                          {d.year}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <span style={{ color: "#B91C1C" }}>
                          {critical.toLocaleString()} critical
                        </span>
                        <span style={{ color: "#64748b" }}>
                          {d.totalAffected.toLocaleString("en-IN")} total
                        </span>
                        <span style={{ color: "#94a3b8" }}>Day {d.day}</span>
                      </div>
                    </div>
                  )
                })}
                <div
                  className="rounded-xl border p-3 mt-4"
                  style={{ backgroundColor: "#F8FAFC", borderColor: "#e2e8f0" }}
                >
                  <div
                    className="text-xs font-semibold mb-2"
                    style={{ color: "#64748b" }}
                  >
                    Legend
                  </div>
                  {[
                    { label: "2024 events", color: "#3B82F6" },
                    { label: "2025 events", color: "#8B5CF6" },
                    { label: "2026 events", color: "#22C55E" },
                  ].map((l) => (
                    <div
                      key={l.label}
                      className="flex items-center gap-2 mb-1 text-xs"
                      style={{ color: "#64748b" }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: l.color }}
                      />
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
