import axios from 'axios';
import api from '../api';

export const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:4000/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const deleteUserById = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:4000/users/${id}`);
    console.log('User deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    return null;
  }
};

export const fetchUserById = async (id) => {
  try {
    const response = await axios.get(`http://localhost:4000/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const addUser = async (user) => {
  try {
    const response = await axios.post('http://localhost:4000/users', user);
    console.log('User added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
    return null;
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