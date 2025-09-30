import { api } from "./api";

// --- TYPES ---

export type JobRoleStatus = "Draft" | "Open" | "Closed" | "Archived";

export interface JobRole {
  ID: number;
  Code: string;
  Title: string;
  Department: string | null;
  Level: string | null;
  Status: JobRoleStatus;
  Description: string | null;
  Responsibilities: string[];
  Qualifications: string[];
  Benefits: string[];
}

// Payload for creating a new role. All fields from the controller are included.
export type CreateJobRolePayload = {
  Code: string;
  Title: string;
  Department?: string | null;
  Level?: string | null;
  Status?: JobRoleStatus;
  Description?: string | null;
  Responsibilities?: string[];
  Qualifications?: string[];
  Benefits?: string[];
};

// Payload for updating a role. Code is in the URL, not the body.
export type UpdateJobRolePayload = Partial<Omit<CreateJobRolePayload, "Code">>;

// --- API ENDPOINTS ---

/**
 * Fetches all job roles, optionally filtering by status.
 * Corresponds to: GET /jobRole.php
 */
export const getAllJobRoles = (status?: JobRoleStatus) => {
  // The controller checks for $_GET['status'], so we pass it as a query param.
  return api.get<JobRole[]>("/jobRole.php", { params: { status } });
};

/**
 * Fetches a single job role by its unique code.
 * Corresponds to: GET /jobRole.php/{code}
 */
export const getJobRoleByCode = (code: string) => {
  return api.get<JobRole>(`/jobRole.php/${code}`);
};

/**
 * Creates a new job role.
 * Corresponds to: POST /jobRole.php
 */
export const createJobRole = (data: CreateJobRolePayload) => {
  return api.post<JobRole>("/jobRole.php", data);
};

/**
 * Updates an existing job role.
 * Corresponds to: PUT /jobRole.php/{code}
 */
export const updateJobRole = (code: string, data: UpdateJobRolePayload) => {
  return api.put<JobRole>(`/jobRole.php/${code}`, data);
};

/**
 * Deletes a job role.
 * Corresponds to: DELETE /jobRole.php/{code}
 */
export const deleteJobRole = (code: string) => {
  return api.del<{ success: boolean; message: string }>(`/jobRole.php/${code}`);
};
