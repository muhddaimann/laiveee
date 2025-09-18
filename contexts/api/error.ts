export type ApiError = {
  status: number;      
  message: string;    
  code?: string;     
  details?: unknown; 
};

export function toApiError(e: any): ApiError {
  const status = e?.response?.status ?? 0;
  const data = e?.response?.data;
  const message =
    data?.message ||
    e?.message ||
    "Something went wrong. Please try again.";
  return { status, message, details: data };
}
