import { api } from "./api";

// --- TYPES ---

// Describes a single entry in the candidates-per-role breakdown
export interface CandidatesPerRoleStat {
  Role: string;
  candidateCount: string; // MySQL COUNT(*) returns a string
}

// Describes the full object returned by the stats endpoint
export interface CandidateStats {
  totalCandidates: string;
  totalRoles: string;
  candidatesPerRole: CandidatesPerRoleStat[];
}

// --- API ENDPOINTS ---

/**
 * Fetches the overall candidate statistics for reporting.
 * Corresponds to: GET /reporting.php/candidate-stats
 */
export const getCandidateStats = () => {
  return api.get<CandidateStats>("/reporting.php?action=candidate-stats");
};
