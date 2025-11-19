// import { IMeta } from '@/types'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import axios from 'axios'
import type { AxiosRequestConfig, AxiosError } from 'axios'
import type { RootState } from '@/redux/store'

// Create an axios instance with interceptors
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
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

      // Get refresh token from localStorage
      const persistedState = localStorage.getItem('persist:users');
      let refreshToken = null;
      
      if (persistedState) {
        const parsed = JSON.parse(persistedState);
        const authUI = parsed.authUI ? JSON.parse(parsed.authUI) : null;
        refreshToken = authUI?.refreshToken;
      }

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Call your refresh token endpoint with refresh token in body
      const { data } = await axios({
        url: `${url}/auth/refresh-token`,
        method: 'POST',
        data: { refreshToken },
      });
      
      // console.log("Token refresh response:", data);
      
      // Check if you have a successful response with new tokens
      if (data.success === true || data.status === 'success') {
        // console.log("Token refresh successful, retrying original request");
        
        // Update tokens in localStorage
        const newAccessToken = data.data?.accessToken;
        const newRefreshToken = data.data?.refreshToken;
        
        if (newAccessToken) {
          const persistedState = localStorage.getItem('persist:users');
          if (persistedState) {
            const parsed = JSON.parse(persistedState);
            const authUI = parsed.authUI ? JSON.parse(parsed.authUI) : {};
            authUI.accessToken = newAccessToken;
            if (newRefreshToken) {
              authUI.refreshToken = newRefreshToken;
            }
            parsed.authUI = JSON.stringify(authUI);
            localStorage.setItem('persist:users', JSON.stringify(parsed));
          }
        }
        
        // Reset the refresh flag
        isRefreshing = false;
        
        // Process all queued requests
        processQueue();
        
        // Make a clean copy of the original request with new token
        const retryConfig = { ...originalRequest };
        if (newAccessToken) {
          retryConfig.headers = {
            ...retryConfig.headers,
            Authorization: `Bearer ${newAccessToken}`,
          };
        }

        
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

      
      // Handle failed refresh - clear tokens and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('persist:users');
        // console.log("Redirecting to login page due to authentication failure");
        window.location.href = '/login';
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
      meta?: any
      contentType?: string
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, contentType }) => {
    try {
      const headers: AxiosRequestConfig['headers'] = {};

      // Get access token from localStorage
      const persistedState = localStorage.getItem('persist:users');
      if (persistedState) {
        try {
          const parsed = JSON.parse(persistedState);
          const authUI = parsed.authUI ? JSON.parse(parsed.authUI) : null;
          const accessToken = authUI?.accessToken;
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
        } catch (err) {
          console.error('Error parsing persisted state:', err);
        }
      }

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
        baseURL: baseUrl,
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
