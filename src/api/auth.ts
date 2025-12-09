import apiClient from './client';
import { ApiResponse, LoginData, LoginRequest } from './types';

export const loginApi = async (data: LoginRequest): Promise<LoginData> => {
  const response = await apiClient.post<ApiResponse<LoginData>>('/admin/auth/login', data);
  // Because interceptor handles error != 0, we can safely cast data here
  return response.data.data!; 
};
