// src/utils/apis.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';

const getBaseURL = () => {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':').shift();
      return `http://${ip}:8080/api/v1`;
    }
    return Platform.OS === 'android' 
      ? 'http://10.0.2.2:8080/api/v1' 
      : 'http://localhost:8080/api/v1';
  }
  return 'https://fsm.kamacaash.com/api/v1';
};

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach authentication token & device identifiers
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Attach device headers for sessions management
  const deviceId = await SecureStore.getItemAsync('deviceId');
  const deviceName = await SecureStore.getItemAsync('deviceName');

  if (deviceId) {
    config.headers['X-Device-ID'] = deviceId;
  }
  if (deviceName) {
    config.headers['X-Device-Name'] = deviceName;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to intercept 401 errors and rotate refresh tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const backendCode = error.response?.data?.code;

    // Force logout if session is dead/invalid on server
    if (status === 400 && (backendCode === 'SESSION_TERMINATED' || backendCode === 'INVALID_TOKEN_FORMAT' || backendCode === 'EXPIRED_TOKEN' || backendCode === 'UNAUTHORIZED_REFRESH')) {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('userRole');
      router.replace('/(auth)');
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const deviceId = await SecureStore.getItemAsync('deviceId') || 'unknown_device';

        // Call refresh API with clean instance to prevent circular interceptors
        const refreshResponse = await axios.post(
          `${getBaseURL()}/auth/refresh`,
          {
            refresh_token: refreshToken,
            device_id: deviceId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Device-ID': deviceId,
            },
          }
        );

        if (refreshResponse.data?.success && refreshResponse.data?.data?.access_token) {
          const newAccessToken = refreshResponse.data.data.access_token;
          const newRefreshToken = refreshResponse.data.data.refresh_token;

          await SecureStore.setItemAsync('userToken', newAccessToken);
          if (newRefreshToken) {
            await SecureStore.setItemAsync('refreshToken', newRefreshToken);
          }

          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          processQueue(new Error('Session refresh failed'), null);
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('refreshToken');
          await SecureStore.deleteItemAsync('userRole');
          router.replace('/(auth)');
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userRole');
        router.replace('/(auth)');
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;