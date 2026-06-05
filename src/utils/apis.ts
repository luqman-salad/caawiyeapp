// src/utils/apis.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const apiClient = axios.create({
  baseURL: 'https://fsm.kamacaash.com/api/v1',
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  // MUST use 'userToken' as the key
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;