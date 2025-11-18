import { IMeta } from '@/types'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import axios from 'axios'
import type { AxiosRequestConfig, AxiosError } from 'axios'

// Create an axios instance with interceptors
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true
});

// Flag to prevent multiple refresh token calls
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

// Process the queue of failed requests
const processQueue = (error: any = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // Set retry flag to prevent infinite loops
    originalRequest._retry = true;
    
    // If currently refreshing, add request to queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }
    
    isRefreshing = true;
    
    try {
      // console.log("Attempting to refresh token...");
      const url = process.env.NEXT_PUBLIC_API_BASE_URL

      // console.log(url)
      
      // Call your refresh token endpoint - using regular axios to avoid interceptor loop
      const { data } = await axios({
        url: `${url}/auth/refresh-token`,
        method: 'POST',
        withCredentials: true,
      });
      
      // console.log("Token refresh response:", data);
      
      // Check if you have a successful response with new tokens
      if (data.success === true || data.status === 'success') {
        // console.log("Token refresh successful, retrying original request");
        
        // Reset the refresh flag
        isRefreshing = false;
        
        // Process all queued requests
        processQueue();
        
        // Make a clean copy of the original request to retry it
        const retryConfig = { ...originalRequest };

        
        // Return the retry request
        return axiosInstance(retryConfig);
      } else {
        // console.error("Token refresh failed with response:", data);
        throw new Error("Token refresh failed");
      }
    } catch (refreshError) {
      // console.error("Token refresh error:", refreshError);
      
      // If refresh fails, process queue with error
      isRefreshing = false;
      processQueue(refreshError);

      
      // Handle failed refresh - redirect to login
      if (typeof window !== 'undefined') {
        // console.log("Redirecting to login page due to authentication failure");
        window.location.href = '/auth/signin';
      }
      
      return Promise.reject(refreshError);
    }
  }
);

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
  ): BaseQueryFn<
    {
      url: string
      method?: AxiosRequestConfig['method']
      data?: AxiosRequestConfig['data']
      params?: AxiosRequestConfig['params']
      headers?: AxiosRequestConfig['headers']
      meta?: IMeta
      contentType?: string
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, contentType }) => {
    try {
      const headers: AxiosRequestConfig['headers'] = {};

      if (data instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data'; 
      } else {
        headers['Content-Type'] = contentType || 'application/json';
      }

      // Use axiosInstance instead of axios directly to benefit from interceptors
      const result = await axiosInstance({
        url: baseUrl + url,
        method: method || 'GET',
        data,
        params,
        headers,
        baseURL: baseUrl, // Set baseURL for refresh logic
        withCredentials: true, // Ensure cookies are sent with every request
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      // console.error("Axios Error:", err);
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
