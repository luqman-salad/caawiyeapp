// services/customerService.ts
import { apiClient } from '../utils/apis';

export const getCustomerProfile = async () => {
  // Updated to the correct path based on your API documentation
  const response = await apiClient.get('/customers/profile');
  return response.data;
};