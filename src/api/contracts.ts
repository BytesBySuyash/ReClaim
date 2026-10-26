export type Role = "citizen" | "fieldworker" | "ngo" | "govt"
export type NeedCode = "housing" | "livelihood" | "documents" | "financial" | "dependents"
export type NeedLevel = "none" | "partial" | "severe" | "unknown"
export type ReviewState = "unreviewed" | "needs_visit" | "confirmed" | "disputed"

export type NeedAnswers = Record<NeedCode, NeedLevel>

export interface ReportInput {
  disasterId: string
  language: string
  story: string
  alias?: string
  members: number
  occupation?: string
  area: string
  immediateDanger: "yes" | "no" | "unknown"
  needs: NeedAnswers
}

export interface PriorityAssessment {
  policyVersion: string
  inputRevision: number
  score: number | null
  band: "critical" | "high" | "moderate" | "low" | "unscored"
  basis: "self_reported" | "human_reviewed"
  urgentReview: boolean
  missingFields: NeedCode[]
  factors: Array<{
    code: NeedCode
    points: number | null
    maxPoints: number
    level: NeedLevel
    source: "citizen" | "reviewer"
  }>
}

export interface ReportDTO {
  id: string
  version: number
  inputRevision: number
  input: ReportInput
  createdAt: string
  updatedAt: string
  isDemo: boolean
  assignedWorker: { id: string; name: string } | null
  reviewState: ReviewState
  review: {
    id: string
    inputRevision: number
    reviewedAt: string
    observationMethod: "field_visit" | "remote_review"
    outcome: ReviewState
  } | null
  priority: PriorityAssessment
  evidence: Array<{
    id: string
    mediaType: "image/jpeg" | "image/png"
    bytes: number
    reviewStatus: "unreviewed" | "reviewed"
  }>
  analysis: null
}

export interface SessionDTO {
  userId: string
  username: string | null
  role: Role
  disasterScopes: string[]
  csrfToken: string
  expiresAt: string
}

export interface DashboardSummary {
  asOf: string
  source: "persisted_reports"
  reportedCount: number
  scoredCount: number
  unscoredCount: number
  verifiedCount: number
  byBand: Record<PriorityAssessment["band"], number>
  reviews: Record<ReviewState, number>
  affectedEstimate: null
}

export interface ReportHistory {
  events: Array<{
    action: string
    oldVersion: number | null
    newVersion: number | null
    createdAt: string
  }>
  reviews: Array<{
    outcome: ReviewState
    observationMethod: "field_visit" | "remote_review"
    inputRevision: number
    notes: string
    reviewedFacts: {
      needs: NeedAnswers
      immediateDanger: "yes" | "no" | "unknown"
    }
    createdAt: string
  }>
}

export interface ReviewInput {
  outcome: "needs_visit" | "confirmed" | "disputed"
  observationMethod: "field_visit" | "remote_review"
  notes: string
  reviewedNeeds: NeedAnswers
  reviewedImmediateDanger: "yes" | "no" | "unknown"
}

export interface WorkerDTO {
  id: string
  name: string
}

export interface ReclaimGateway {
  createReport(input: ReportInput, key: string): Promise<ReportDTO>
  getReport(id: string, signal?: AbortSignal): Promise<ReportDTO>
  listReports(disasterId: string, role: Exclude<Role, "govt">): Promise<{ items: ReportDTO[]; total: number; nextCursor: string | null }>
  uploadEvidence(id: string, file: File, version: number, key: string): Promise<ReportDTO>
  analyzeReport(id: string): Promise<{ state: "rules_only"; message: string; priority: PriorityAssessment }>
  assignReport(id: string, workerId: string | null, version: number, key: string): Promise<ReportDTO>
  reviewReport(id: string, input: ReviewInput, version: number, key: string): Promise<ReportDTO>
  getSummary(disasterId: string): Promise<DashboardSummary>
  getWorkers(disasterId: string): Promise<{ items: WorkerDTO[] }>
}
