import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { ApiResponse } from './types';

// Hardcoded for demo, normally from import.meta.env.VITE_API_BASE_URL
const BASE_URL = "http://localhost:8080";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request Interceptor: Add Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('HM_ADMIN_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Business Errors
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    const res = response.data;
    
    // According to contract: error === 0 is success
    if (res.error !== 0) {
      // Business logic error
      message.error(res.message || 'Error');
      // We reject here so React Query knows it failed
      return Promise.reject(new Error(res.message || 'Unknown Error'));
    }

    return response;
  },
  (error) => {
    // Network or Server Errors (4xx, 5xx)
    const errorMsg = error.response?.data?.message || error.message || 'Network Error';
    message.error(errorMsg);
    
    // Optional: Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
       localStorage.removeItem('HM_ADMIN_TOKEN');
       window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
