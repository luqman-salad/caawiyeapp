// src/services/ticketService.ts
import { Platform } from 'react-native';
import { apiClient } from '../utils/apis';

export const createTicket = async (ticketData: {
  title: string;
  description: string;
  skill_required: string;
  landmark: string;
  latitude: number;
  longitude: number;
}) => {
  const response = await apiClient.post('/tickets', ticketData);
  return response.data;
};



export const getTicketById = async (id: string) => {
  const response = await apiClient.get(`/tickets/${id}`);
  return response.data;
};


export const getCustomerTickets = async () => {
  // Updated to the specific customer tickets endpoint
  const response = await apiClient.get('/customers/tickets');
  return response.data;
};


export const startTicket = async (id: string) => {
  // FIX: Added empty object '{}' as the second argument
  const response = await apiClient.post(`/tickets/${id}/start`, {});
  return response.data;
};



export const completeTicket = async (id: string, otp: string, photoUri: string, note: string) => {
  const formData = new FormData();
  
  // Based on your previous errors, 'code' is likely the correct key
  formData.append('otp', otp);
  formData.append('note', note);
  
  // Ensure the URI is properly formatted for the platform
  formData.append('after_photo', {
    uri: Platform.OS === 'android' ? photoUri : photoUri.replace('file://', ''),
    name: 'proof.jpg',
    type: 'image/jpeg',
  } as any);

  // Explicitly set the header to multipart/form-data
  // Axios will append the boundary automatically if you set this
  const response = await apiClient.post(`/tickets/${id}/complete`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};



export const reviewTicket = async (id: string) => {
  // FIX: Added empty object '{}'
  const response = await apiClient.post(`/tickets/${id}/review`, {});
  return response.data;
};

export const dispatchTicketToTechnician = async (ticketId: string) => {
  // FIX: Added empty object '{}'
  const response = await apiClient.post(`/tickets/${ticketId}/dispatch`, {});
  return response.data;
};


