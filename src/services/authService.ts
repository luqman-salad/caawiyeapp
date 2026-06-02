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
   * Endpoint: POST /auth/signup
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
   * Endpoint: POST /auth/login
   */
  requestLoginOtp: async (phoneString: string) => {
    try {
      const payload: RequestLoginOtpPayload = {
        phone: phoneString.trim(),
        action_type: "LOGIN",
      };

      const response = await apiClient.post('/auth/login', payload);
      return response.data; 
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      throw new Error(backendMessage || 'Invalid phone number format or account does not exist.');
    }
  },

  /**
   * Verify OTP and parse JWT response payload for role-based routing destination
   * Endpoint: POST /auth/otp/verify
   */
  verifyLoginOtp: async (phone: string, otp: string): Promise<VerificationResult> => {
    try {
      const response = await apiClient.post('/auth/otp/verify', {
        phone: phone.trim(),
        code: otp.trim(),        
        action_type: "LOGIN",    
      });
      
      // 1. Check for explicit success parameters from your Thunder Client response signature
      if (response.data?.success !== true) {
        throw new Error(response.data?.message || "Invalid verification security code.");
      }

      // 2. Extract the access token STRICTLY from the data layout block
      const token = response.data?.data?.access_token;
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        throw new Error("Authentication failed: Server did not return a valid access token.");
      }

      // 3. Decode the token structure securely
      const payload = decodeJwtPayload(token);
      if (!payload) {
        throw new Error("Authentication failed: Invalid security token payload structure.");
      }
      
      // 4. Extract the role from the JWT claims safely
      const rawRole = payload.role || payload.user_role;
      if (!rawRole) {
        throw new Error("Authentication failed: User profile has no assigned security role.");
      }

      // 5. Normalize casing and route explicitly
      const normalizedRole = rawRole.toUpperCase();
      if (normalizedRole !== 'CUSTOMER' && normalizedRole !== 'TECHNICIAN') {
        throw new Error(`Authentication failed: Unrecognized account role "${rawRole}".`);
      }

      return {
        success: true,
        token: token,
        role: normalizedRole === 'TECHNICIAN' ? 'technician' : 'customer'
      };
    } catch (error: any) {
      // Pull error messaging dynamically out of the 400 Bad Request error packet
      const backendMessage = error.response?.data?.message;
      const backendCode = error.response?.data?.code;
      
      let clientErrorMessage = "Invalid or expired verification code.";
      if (backendMessage) {
        clientErrorMessage = backendMessage;
      } else if (error.message) {
        clientErrorMessage = error.message;
      }

      throw new Error(clientErrorMessage);
    }
  }
};