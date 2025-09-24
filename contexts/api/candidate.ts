import { api } from "./api";

// --- Main Candidate Types ---

export type CandidateStatus =
  | "registered"
  | "invited"
  | "completed"
  | "expired"
  | "passed"
  | "rejected"
  | "withdrawn";

export type Candidate = {
  ID: number;
  PublicToken: string;
  FullName: string;
  ByName: string | null;
  Email: string;
  Role: string;
  Status: CandidateStatus;
  Stage: string | null;
  ScheduledAt: string | null;
  InviteSentAt?: string | null;
  ExpiresAt?: string | null;
  FirstOpenedAt?: string | null;
  CompletedAt?: string | null;
  DecisionAt?: string | null;
  WithdrawnAt?: string | null;
  LastActivityAt?: string | null;
  CreatedByStaffID: number | null;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  [k: string]: any;
};

export type CandidatePublicView = Pick<Candidate, "FullName" | "ByName" | "Role">;

export type RegisterCandidateInput = {
  full_name: string;
  email: string;
  role: string;
  by_name?: string | null;
};

// --- Candidate Record Types ---

export type CandidateRecord = {
    id: number;
    candidate_id: number;
    language_pref: string;
    ra_full_name?: string | null;
    ra_candidate_email?: string | null;
    ra_candidate_phone?: string | null;
    ra_highest_education?: string | null;
    ra_current_role?: string | null;
    ra_years_experience?: number | null;
    ra_professional_summary?: string | null;
    ra_related_links?: any | null;
    ra_certs_relate?: any | null;
    ra_skill_match?: any | null;
    ra_experience_match?: any | null;
    ra_concern_areas?: any | null;
    ra_strengths?: any | null;
    ra_rolefit_score?: number | null;
    ra_rolefit_reason?: string | null;
    int_started_at?: string | null;
    int_ended_at?: string | null;
    int_average_score?: number | null;
    int_spoken_score?: number | null;
    int_spoken_reason?: string | null;
    int_behavior_score?: number | null;
    int_behavior_reason?: string |null;
    int_communication_score?: number | null;
    int_communication_reason?: string | null;
    int_knockouts?: any | null;
    int_summary?: string | null;
    int_full_transcript?: string | null;
    ra_input_tokens?: number | null;
    ra_output_tokens?: number | null;
    int_input_tokens?: number | null;
    int_output_tokens?: number | null;
    int_audio_sec?: number | null;
    total_cost_usd?: number | null;
    ra_json_payload?: any | null;
    int_scores_json?: any | null;
}

export type CandidateRecordInput = Omit<CandidateRecord, 'id'>;

// --- API Response Types ---

type ServerError = { error: string };
type ServerResponse<T> = T | ServerError;
type ActionResponse = { success: boolean; message?: string; status?: CandidateStatus };
type ExpireResponse = { success: boolean; expired_count: number };

// === CANDIDATES (Plural) Endpoint === //

export async function listCandidates(): Promise<Candidate[]> {
  const res = await api.get<Candidate[]>("/candidates.php");
  return res.data;
}

export async function registerCandidate(input: RegisterCandidateInput): Promise<Candidate> {
  const res = await api.post<ServerResponse<Candidate>>("/candidates.php", input);
  const data = res.data;
  if ((data as ServerError)?.error) throw new Error((data as ServerError).error);
  return data as Candidate;
}

export async function expireCandidates(): Promise<ExpireResponse> {
  const res = await api.post<ExpireResponse>("/candidates.php/expire");
  return res.data;
}

// === CANDIDATE (Singular) Endpoint === //

export async function getCandidateByPublicToken(token: string): Promise<CandidatePublicView> {
  const res = await api.get<ServerResponse<CandidatePublicView>>(`/candidate.php/${encodeURIComponent(token)}`);
  const data = res.data;
  if ((data as ServerError)?.error) throw new Error((data as ServerError).error);
  return data as CandidatePublicView;
}

async function updateCandidateStatus(token: string, status: CandidateStatus, data: object = {}): Promise<ActionResponse> {
    const payload = { ...data, status };
    const res = await api.put<ActionResponse>(`/candidate.php/${encodeURIComponent(token)}`, payload);
    return res.data;
}

export async function inviteCandidate(token: string): Promise<ActionResponse> {
    return updateCandidateStatus(token, 'invited');
}

export async function completeCandidate(token: string): Promise<ActionResponse> {
    return updateCandidateStatus(token, 'completed');
}

export async function withdrawCandidate(token: string): Promise<ActionResponse> {
    return updateCandidateStatus(token, 'withdrawn');
}

export async function decideCandidate(token: string, decision: "passed" | "rejected"): Promise<ActionResponse> {
    return updateCandidateStatus(token, decision);
}

// === RECORDS Endpoint === //

export async function createCandidateRecord(input: CandidateRecordInput): Promise<CandidateRecord> {
    const res = await api.post<ServerResponse<CandidateRecord>>("/records.php", input);
    const data = res.data;
    if ((data as ServerError)?.error) throw new Error((data as ServerError).error);
    return data as CandidateRecord;
}

export async function getCandidateRecord(id: number): Promise<CandidateRecord> {
    const res = await api.get<ServerResponse<CandidateRecord>>(`/records.php/${id}`);
    const data = res.data;
    if ((data as ServerError)?.error) throw new Error((data as ServerError).error);
    return data as CandidateRecord;
}

export async function getAllCandidateRecords(): Promise<CandidateRecord[]> {
    const res = await api.get<CandidateRecord[]>("/records.php");
    return res.data;
}
