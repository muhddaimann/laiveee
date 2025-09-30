import { useMemo } from "react";

// --- PREDEFINED OPTIONS ---
// Based on the job_roles table schema

export const DEPARTMENTS: readonly string[] = [
  "Customer Service",
  "Sales & Marketing",
  "Technical Support",
  "Human Resources",
  "Engineering",
  "Operations",
  "Administration",
];

export const LEVELS: readonly string[] = [
  "Intern",
  "Junior",
  "Executive",
  "Senior",
  "Lead",
  "Manager",
  "Director",
];

export const STATUSES: readonly string[] = [
  "Draft",
  "Open",
  "Closed",
  "Archived",
];

/**
 * A simple hook to provide consistent options for Job Role properties.
 * This centralizes the lists of departments, levels, and statuses for use in dropdowns or select inputs across the app.
 * @returns An object containing arrays of department, level, and status options.
 */
export const useRoleOptions = () => {
  const options = useMemo(
    () => ({
      departments: DEPARTMENTS,
      levels: LEVELS,
      statuses: STATUSES,
    }),
    []
  );

  return options;
};
