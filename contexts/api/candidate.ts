import { api } from "./api";

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

type ServerError = { error: string };
type ServerResponse<T> = T | ServerError;
type ActionResponse = { success: boolean; message?: string };
type ExpireResponse = { success: boolean; expired_count: number };

export async function listCandidates(): Promise<Candidate[]> {
  const res = await api.get<Candidate[]>("/candidate.php");
  return res.data;
}

export async function registerCandidate(input: RegisterCandidateInput): Promise<Candidate> {
  const res = await api.post<ServerResponse<Candidate>>("/candidate.php?action=register", input);
  const data = res.data;
  if ((data as ServerError)?.error) throw new Error((data as ServerError).error);
  return data as Candidate;
}

export async function inviteCandidate(token: string, days?: number): Promise<ActionResponse> {
  const qs = typeof days === "number" ? `&days=${encodeURIComponent(String(days))}` : "";
  const res = await api.post<ActionResponse>(`/candidate.php?action=invite&token=${encodeURIComponent(token)}${qs}`);
  return res.data;
}

export async function completeCandidate(token: string): Promise<ActionResponse> {
  const res = await api.post<ActionResponse>(`/candidate.php?action=complete&token=${encodeURIComponent(token)}`);
  return res.data;
}

export async function withdrawCandidate(token: string): Promise<ActionResponse> {
  const res = await api.post<ActionResponse>(`/candidate.php?action=withdraw&token=${encodeURIComponent(token)}`);
  return res.data;
}

export async function decideCandidate(token: string, decision: "passed" | "rejected"): Promise<ActionResponse> {
  const res = await api.post<ActionResponse>(`/candidate.php?action=decision&token=${encodeURIComponent(token)}`, {
    decision,
  });
  return res.data;
}

export async function expireInvites(): Promise<ExpireResponse> {
  const res = await api.post<ExpireResponse>("/candidate.php?action=expire_batch");
  return res.data;
}

export async function getCandidateByPublicToken(token: string): Promise<CandidatePublicView> {
  const res = await api.get<ServerResponse<CandidatePublicView>>(`/candidate.php?token=${encodeURIComponent(token)}`);
  const data = res.data;
  if ((data as ServerError)?.error) throw new Error((data as ServerError).error);
  return data as CandidatePublicView;
}
