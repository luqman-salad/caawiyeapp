// src/services/technicianService.ts
import apiClient from '../utils/apis'; // Assuming you have an axios instance

// src/services/technicianService.ts
export const getTechnicianProfile = async () => {
  try {
    const response = await apiClient.get('/technicians/profile');
    return response.data;
  } catch (error: any) {
    // This log will appear in your terminal/debugger
    console.error("DEBUG - Profile API Error:", error.response?.status, error.response?.data);
    throw error;
  }
};

// Also add a toggle for status to be used later
// src/services/technicianService.ts
export const updateTechnicianStatus = async (status: 'ONLINE' | 'OFFLINE', lat: number, lon: number) => {
  const response = await apiClient.put('/technicians/status', { 
    status,
    latitude: lat,
    longitude: lon
  });
  return response.data;
};




// src/services/technicianService.ts

export const getTechnicianTickets = async (status?: string) => {
  const config = status ? { params: { status } } : {};
  const response = await apiClient.get('/technicians/tickets', config);
  return response.data;
};