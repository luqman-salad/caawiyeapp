import { apiClient } from '../utils/apis';

export interface CustomerSignupPayload {
  phone: string;
  email: string;
  name: string;
  account_number: string;
  address: string;
}

export interface DeviceHeaders {
  deviceId: string;
  deviceName: string;
}

export interface RequestLoginOtpPayload {
  phone: string;
  action_type: "LOGIN"; 
}

export interface VerificationResult {
  success: boolean;
  token: string;
  refreshToken: string;
  role: 'customer' | 'technician';
}

/**
 * Safely decodes a JWT payload in a React Native environment
 */
function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    
    // Cross-platform safe base64 decoding for standard UTF-8 JSON strings
    const base64Bytes = Uint8Array.from(atob(payloadBase64), c => c.charCodeAt(0));
    const decodedString = new TextDecoder().decode(base64Bytes);
    
    return JSON.parse(decodedString);
  } catch (error) {
    console.error("Error parsing JWT payload claims:", error);
    return null;
  }
}

export const authService = {
  /**
   * Register a new customer
   */
  registerCustomer: async (payload: CustomerSignupPayload, device: DeviceHeaders) => {
    try {
      const response = await apiClient.post('/auth/signup', payload, {
        headers: {
          'X-Device-ID': device.deviceId,
          'X-Device-Name': device.deviceName,
        }
      });
      return response.data;
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      throw new Error(backendMessage || 'Failed to complete customer registration.');
    }
  },

  /**
   * Request Login Verification Code via OTP
   * Added default value for actionType to prevent breaking other calls
   */
  requestLoginOtp: async (phoneString: string, actionType: "LOGIN" = "LOGIN") => {
    try {
      const payload: RequestLoginOtpPayload = {
        phone: phoneString.trim(),
        action_type: actionType,
      };

      console.log("Sending Login Payload:", JSON.stringify(payload));

      const response = await apiClient.post('/auth/login', payload);
      return response.data; 
    } catch (error: any) {
      console.error("Login OTP Error Response:", error.response?.data);
      const backendMessage = error.response?.data?.message;
      throw new Error(backendMessage || 'Invalid phone number format or account does not exist.');
    }
  },

  /**
   * Verify OTP and parse JWT response
   */
  verifyLoginOtp: async (phone: string, otp: string): Promise<VerificationResult> => {
    try {
      const response = await apiClient.post('/auth/otp/verify', {
        phone: phone.trim(),
        code: otp.trim(),        
        action_type: "LOGIN",    
      });
      
      if (response.data?.success !== true) {
        throw new Error(response.data?.message || "Invalid verification security code.");
      }

      const token = response.data?.data?.access_token;
      const refreshToken = response.data?.data?.refresh_token;
      
      if (!token || typeof token !== 'string') {
        throw new Error("Authentication failed: No valid access token received.");
      }

      const payload = decodeJwtPayload(token);
      if (!payload) throw new Error("Authentication failed: Invalid token structure.");
      
      const rawRole = payload.role || payload.user_role;
      if (!rawRole) throw new Error("Authentication failed: No role assigned.");

      const normalizedRole = rawRole.toUpperCase();
      return {
        success: true,
        token: token,
        refreshToken: refreshToken || '',
        role: normalizedRole === 'TECHNICIAN' ? 'technician' : 'customer'
      };
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      throw new Error(backendMessage || "Invalid or expired verification code.");
    }
  }
};