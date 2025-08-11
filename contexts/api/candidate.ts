import { CANDIDATE_URL } from "../../constants/env";
import { api } from "./api";

export interface CandidateRow {
  id: number;
  short_name: string;
  position_title: string;
  language_pref: "English" | "Bahasa Malaysia" | "Mandarin" | "Tamil";
  status: "NEW" | "ANALYZED" | "INTERVIEWING" | "COMPLETED" | "REJECTED";
  ra_full_name?: string | null;
  ra_candidate_email?: string | null;
  ra_candidate_phone?: string | null;
  ra_highest_education?: string | null;
  ra_current_role?: string | null;
  ra_years_experience?: number | null;
  ra_professional_summary?: string | null;
  ra_related_links?: string[] | null;
  ra_certs_relate?: string[] | null;
  ra_skill_match?: { name: string; justification: string }[] | null;
  ra_experience_match?: { area: string; justification: string }[] | null;
  ra_concern_areas?: string[] | null;
  ra_strengths?: { trait: string; justification: string }[] | null;
  ra_rolefit_score?: number | null;
  ra_rolefit_reason?: string | null;
  int_average_score?: number | null;
  int_spoken_score?: number | null;
  int_spoken_reason?: string | null;
  int_behavior_score?: number | null;
  int_behavior_reason?: string | null;
  int_communication_score?: number | null;
  int_communication_reason?: string | null;
  int_knockouts?: Record<string, string> | null;
  int_summary?: string | null;
}

export type NewCandidatePayload = Omit<CandidateRow, "id">;

export interface CandidateUI {
  id: string;
  candidateDetails: {
    roleAppliedFor: string;
    shortName: string;
    languagePref: CandidateRow["language_pref"];
    status: CandidateRow["status"];
  };
  resumeAnalysis: {
    fullName: string;
    candidateEmail: string | null;
    candidatePhone: string | null;
    relatedLink: string[];
    highestEducation: string | null;
    certsRelate: string[];
    currentRole: string | null;
    yearExperience: number | null;
    professionalSummary: string | null;
    skillMatch: NonNullable<CandidateRow["ra_skill_match"]>;
    experienceMatch: NonNullable<CandidateRow["ra_experience_match"]>;
    concernArea: string[];
    strengths: NonNullable<CandidateRow["ra_strengths"]>;
    roleFit: { roleScore: number | null; justification: string | null };
  };
  interviewPerformance: {
    averageScore: number;
    summary: string;
    scoreBreakdown: {
      spokenAbility: { score: number; reasoning: string };
      behavior: { score: number; reasoning: string };
      communicationStyle: { score: number; reasoning: string };
    };
    knockoutBreakdown: Record<string, string>;
  };
}

export function mapRowToUI(row: CandidateRow): CandidateUI {
  return {
    id: String(row.id),
    candidateDetails: {
      roleAppliedFor: row.position_title,
      shortName: row.short_name,
      languagePref: row.language_pref,
      status: row.status,
    },
    resumeAnalysis: {
      fullName: row.ra_full_name ?? "",
      candidateEmail: row.ra_candidate_email ?? null,
      candidatePhone: row.ra_candidate_phone ?? null,
      relatedLink: row.ra_related_links ?? [],
      highestEducation: row.ra_highest_education ?? null,
      certsRelate: row.ra_certs_relate ?? [],
      currentRole: row.ra_current_role ?? null,
      yearExperience: row.ra_years_experience ?? null,
      professionalSummary: row.ra_professional_summary ?? null,
      skillMatch: row.ra_skill_match ?? [],
      experienceMatch: row.ra_experience_match ?? [],
      concernArea: row.ra_concern_areas ?? [],
      strengths: row.ra_strengths ?? [],
      roleFit: {
        roleScore: row.ra_rolefit_score ?? null,
        justification: row.ra_rolefit_reason ?? null,
      },
    },
    interviewPerformance: {
      averageScore: row.int_average_score ?? 0,
      summary: row.int_summary ?? "",
      scoreBreakdown: {
        spokenAbility: {
          score: row.int_spoken_score ?? 0,
          reasoning: row.int_spoken_reason ?? "",
        },
        behavior: {
          score: row.int_behavior_score ?? 0,
          reasoning: row.int_behavior_reason ?? "",
        },
        communicationStyle: {
          score: row.int_communication_score ?? 0,
          reasoning: row.int_communication_reason ?? "",
        },
      },
      knockoutBreakdown: row.int_knockouts ?? {},
    },
  };
}

export const getAllCandidates = (signal?: AbortSignal) =>
  api.get<CandidateRow[]>(CANDIDATE_URL, undefined, { signal });

export const getCandidateById = async (id: string, signal?: AbortSignal) => {
  const row = await api.get<CandidateRow | Record<string, never>>(
    CANDIDATE_URL,
    { id },
    { signal }
  );
  return (row as CandidateRow)?.id ? (row as CandidateRow) : null;
};

export const addCandidate = (payload: NewCandidatePayload, signal?: AbortSignal) =>
  api.post<CandidateRow>(CANDIDATE_URL, payload, { signal });
