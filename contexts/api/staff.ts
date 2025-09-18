import { api } from "./api";

export type Staff = {
  staff_id: number;
  first_name: string;
  last_name: string;
  nick_name: string | null;
  full_name: string;
  by_name: string;
  initials: string;
  nric: string;
  email: string;
  designation_name: string | null;
  join_date: string | null;
  contact_no: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  full_address: string | null;
  [k: string]: any;
};

export type UpdateStaffInput = {
  email: string;
  contact_no: string;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  nick_name?: string | null;
};

export type UpdateStaffResponse = {
  message?: string;
  error?: string;
};

export async function getSelfDetails(): Promise<Staff> {
  const res = await api.get<Staff>("/staff.php");
  return res.data;
}

export async function updateStaffDetails(
  input: UpdateStaffInput
): Promise<UpdateStaffResponse> {
  const res = await api.post<UpdateStaffResponse>("/staff.php", input);
  return res.data;
}

export type { Staff as StaffType };
