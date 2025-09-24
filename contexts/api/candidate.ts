import { api } from "./api";

export type CandidateStatus =
  | "registered"
  | "invited"
  | "completed"
  | "withdrawn"
  | "passed"
  | "rejected"
  | "expired";

export interface Candidate {
  ID: number;
  PublicToken: string;
  FullName: string;
  ByName: string | null;
  Email: string;
  Role: string;
  Status: CandidateStatus;
  Stage: number | null;
  CreatedDateTime: string;
  FirstOpenedAt?: string;
  LastActivityAt?: string;
  InviteSentAt?: string;
  ExpiresAt?: string;
  CompletedAt?: string;
  WithdrawnAt?: string;
  DecisionAt?: string;
  CreatedByStaffID?: number;
}

export interface PublicCandidate {
  FullName: string;
  ByName: string;
  Role: string;
}

export interface CandidateRecord {
  id: number;
  candidate_id: number;
  language_pref?: string;
  ra_full_name?: string;
  ra_candidate_email?: string;
  ra_candidate_phone?: string;
  ra_highest_education?: string;
  ra_current_role?: string;
  ra_years_experience?: number;
  ra_professional_summary?: string;
  ra_related_links?: string;
  ra_certs_relate?: string;
  ra_skill_match?: string;
  ra_experience_match?: string;
  ra_concern_areas?: string;
  ra_strengths?: string;
  ra_rolefit_score?: number;
  ra_rolefit_reason?: string;
  int_started_at?: string;
  int_ended_at?: string;
  int_average_score?: number;
  int_spoken_score?: number;
  int_spoken_reason?: string;
  int_behavior_score?: number;
  int_behavior_reason?: string;
  int_communication_score?: number;
  int_communication_reason?: string;
  int_knockouts?: string;
  int_summary?: string;
  int_full_transcript?: string;
  ra_input_tokens?: number;
  ra_output_tokens?: number;
  int_input_tokens?: number;
  int_output_tokens?: number;
  int_audio_sec?: number;
  total_cost_usd?: number;
  ra_json_payload?: string;
  int_scores_json?: string;
  created_at: string;
}

export interface RegisterCandidatePayload {
  full_name: string;
  email: string;
  role: string;
  by_name?: string;
}

export interface UpdateStatusPayload {
  status: CandidateStatus;
}

export type CreateRecordPayload = Partial<
  Omit<CandidateRecord, "id" | "candidate_id" | "created_at">
>;

export const getCandidates = () => {
  return api.get<Candidate[]>("/candidate.php");
};

export const registerCandidate = (data: RegisterCandidatePayload) => {
  return api.post<Candidate>("/candidate.php", data);
};

export const getCandidateByToken = (token: string) => {
  return api.get<PublicCandidate>(`/candidate.php/${token}`);
};

export const expireCandidates = () => {
  return api.post("/candidate.php/expire");
};

export const inviteCandidate = (token: string) => {
  return api.post(`/candidate.php/${token}/invite`);
};

export const updateCandidateStatus = (
  token: string,
  data: UpdateStatusPayload
) => {
  return api.put(`/candidate.php/${token}/status`, data);
};

export const getCandidateRecords = (token: string) => {
  return api.get<CandidateRecord[]>(`/candidate.php/${token}/record`);
};

export const createCandidateRecord = (
  token: string,
  data: CreateRecordPayload
) => {
  return api.post<CandidateRecord>(`/candidate.php/${token}/record`, data);
};
