// api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // For successful responses
    console.log('[API] Successful response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request timeout:', {
        url: error.config.url,
        message: 'Request took too long. Please try again.'
      });
    } else if (error.response) {
      // Server responded with error status
      console.error('[API] Server error:', {
        status: error.response.status,
        url: error.config.url,
        data: error.response.data,
        message: getErrorMessage(error.response.status)
      });
      
      // Handle 401 specifically if needed
      if (error.response.status === 401) {
        console.warn('[API] Authentication required - redirecting to login');
        // You could add redirect logic here if needed
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API] No response received:', {
        url: error.config.url,
        message: 'Network error. Please check your connection.'
      });
    } else {
      // Something happened in setting up the request
      console.error('[API] Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function for error messages
function getErrorMessage(status) {
  const messages = {
    400: 'Bad request - please check your input',
    401: 'Unauthorized - please login again',
    403: 'Forbidden - you lack necessary permissions',
    404: 'Resource not found',
    500: 'Internal server error',
    502: 'Bad gateway',
    503: 'Service unavailable',
    504: 'Gateway timeout'
  };
  return messages[status] || `HTTP error: ${status}`;
}

export default api;