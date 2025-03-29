import axios from 'axios';
import api from '../api';

const API_BASE_URL = 'http://127.0.0.1:8000/api/users/';

const usersApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

usersApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const fetchUsers = async () => {
  try {
    const response = await usersApi.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const deleteUserById = async (id) => {
  try {
    const response = await usersApi.delete(`/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

export const fetchUserById = async (id) => {
  try {
    const response = await usersApi.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user');
  }
};

export const addUser = async (userData) => {
  try {
    const response = await usersApi.post('/', userData);
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
    throw new Error(error.response?.data?.message || 'Failed to add user');
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await usersApi.patch(`/${id}/`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to update user');
  }
};

export const checkLogin = async (username, password) => {
  try {
    const response = await api.post('/admin/login/', {
      username,
      password
    });

    if (!response.data) {
      throw new Error('No data in response');
    }

    const token = response.data.token || response.data.access;
    const user = response.data.user || response.data;

    if (!token) {
      throw new Error('No authentication token received');
    }

    // Store token for future requests
    localStorage.setItem('token', token);

    return {
      ...user,
      token: token
    };

  } catch (error) {
    let errorMessage = 'Login failed';
    
    if (error.response) {
      errorMessage = error.response.data?.detail || 
                    error.response.data?.message || 
                    error.response.data?.error ||
                    errorMessage;
    }

    // Clear token on failed login
    localStorage.removeItem('token');
    
    throw new Error(errorMessage);
  }
};

  export const updateUserPassword = async (id, password) => {
    try {
      const response = await axios.patch(`http://localhost:4000/users/${id}`, { password });
      console.log('Password updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error; // Let the caller handle the error
    }
  };