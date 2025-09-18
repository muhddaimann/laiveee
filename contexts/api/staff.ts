import { api } from "./api";

export type Staff = {
  staff_id: number;
  full_name: string;
  email: string;
  contact_no?: string;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  nick_name?: string | null;
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

export async function getStaffDetails(id: number | string) {
  const res = await api.get<Staff | any>("/staff.php", { id });
  return res.data;
}

export async function updateStaffDetails(input: UpdateStaffInput) {
  const res = await api.post<any>("/staff.php", input);
  return res.data;
}
