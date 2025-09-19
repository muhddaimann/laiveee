import { api } from "./api";

export type CandidateStatus =
  | "registered"
  | "invited"
  | "in_progress"
  | "completed"
  | "hired"
  | "rejected";

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
  CreatedByStaffID: number | null;
  CreatedDateTime: string;
  UpdatedDateTime: string;
  [k: string]: any;
};

export type RegisterCandidateInput = {
  full_name: string;
  email: string;
  role: string;
  by_name?: string | null;
};

type CandidateServerResponse = Candidate | { error: string };

export async function listCandidates(): Promise<Candidate[]> {
  const res = await api.get<Candidate[]>("/candidate.php");
  return res.data;
}

export async function registerCandidate(
  input: RegisterCandidateInput
): Promise<Candidate> {
  const res = await api.post<CandidateServerResponse>("/candidate.php", input);
  const data = res.data;
  if ((data as any)?.error) {
    throw new Error((data as any).error);
  }
  return data as Candidate;
}
