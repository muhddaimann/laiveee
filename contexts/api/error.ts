
export interface ApiError extends Error {
  status?: number;
  messages?: string[];
}

export function toApiError(error: any): ApiError {
  if (error.isAxiosError) {
    const axiosError = error;
    const apiError: ApiError = new Error(axiosError.message);
    apiError.status = axiosError.response?.status;
    apiError.messages = axiosError.response?.data?.messages || [];
    return apiError;
  }
  return error;
}
