import apiClient from './client';
import { 
  ApiResponse, 
  AdminGetHairstylesRequest, 
  PaginationRes, 
  AdminHairstyle,
  AdminCreateHairstyleRequest,
  AdminUpdateHairstyleRequest
} from './types';

export const getHairstylesApi = async (params: AdminGetHairstylesRequest): Promise<PaginationRes<AdminHairstyle>> => {
  const response = await apiClient.post<ApiResponse<PaginationRes<AdminHairstyle>>>('/admin/hairstyles/list', params);
  return response.data.data!;
};

export const createHairstyleApi = async (data: AdminCreateHairstyleRequest): Promise<{ id: string }> => {
  const response = await apiClient.post<ApiResponse<{ id: string }>>('/admin/hairstyles/create', data);
  return response.data.data!;
};

export const updateHairstyleApi = async (data: AdminUpdateHairstyleRequest): Promise<void> => {
  await apiClient.post<ApiResponse<any>>('/admin/hairstyles/update', data);
};

export const deleteHairstyleApi = async (id: string): Promise<void> => {
  await apiClient.post<ApiResponse<any>>('/admin/hairstyles/delete', { id });
};
