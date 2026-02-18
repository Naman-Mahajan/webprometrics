
export const config = {
  // Toggle this to FALSE to use the real Backend API
  // In production, this should be false to use real API endpoints
  USE_MOCK_DATA: false,
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin + '/api' : '/api'),
  API_FALLBACK_URL: import.meta.env.VITE_API_URL_FALLBACK || undefined,
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  
  // Timeout Settings
  API_TIMEOUT: 15000,
};
