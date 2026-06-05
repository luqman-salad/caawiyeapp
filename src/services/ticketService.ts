// src/services/ticketService.ts
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


// src/services/ticketService.ts
export const dispatchTicketToTechnician = async (ticketId: string) => {
  // Sending a POST request to trigger the backend dispatch logic
  const response = await apiClient.post(`/tickets/${ticketId}/dispatch`);
  return response.data;
};

export const getTicketLogs = async (ticketId: string) => {
  const response = await apiClient.get(`/tickets/${ticketId}/logs`);
  return response.data;
};