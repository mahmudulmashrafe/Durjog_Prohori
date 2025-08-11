import axios from 'axios';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: 'http://localhost:5002',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000 // 5 second timeout
});

// Add a request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('ngoToken') || localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to log all responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default api; 