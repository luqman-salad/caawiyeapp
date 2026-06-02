/**
 * Safely decodes a JWT payload in a React Native environment
 */
export function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    
    // Polyfill-free base64 decoding for standard UTF-8 JSON strings
    const base64Bytes = Uint8Array.from(atob(payloadBase64), c => c.charCodeAt(0));
    const decodedString = new TextDecoder().decode(base64Bytes);
    
    return JSON.parse(decodedString);
  } catch (error) {
    console.error("Error parsing JWT payload:", error);
    return null;
  }
}