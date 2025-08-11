// Configuration settings for the application
export const API_PORTS = {
  MAIN_API: 5000,
  FIREFIGHTER_API: 5002,
  AUTHORITY_API: 5001
};

// Base URLs
export const API_BASE_URLS = {
  MAIN_API: `http://localhost:${API_PORTS.MAIN_API}/api`,
  FIREFIGHTER_API: `http://localhost:${API_PORTS.FIREFIGHTER_API}/api`,
  AUTHORITY_API: `http://localhost:${API_PORTS.AUTHORITY_API}/api`
}; 