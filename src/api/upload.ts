import apiClient from './client';
import { ApiResponse, UploadImageResponse } from './types';

export const uploadImageApi = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('scene', 'hairstyle');

  const response = await apiClient.post<ApiResponse<UploadImageResponse>>('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data!;
};
