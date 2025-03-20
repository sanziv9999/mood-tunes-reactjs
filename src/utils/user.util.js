import axios from 'axios';


export const fetchUsers = async () => {
    try {
        const response = await axios.get('http://localhost:4000/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}


export const deleteUserById = async (id) => {
    try {
        const response = await axios.delete(`http://localhost:4000/users/${id}`);
        console.log('User deleted successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        return null;
    }
}

export const fetchUserById = async (id) => {
    try {
        const response = await axios.get(`http://localhost:4000/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}


export const addUser = async (user) => {
    try {
        const response = await axios.post('http://localhost:4000/users', user);
        console.log('User added successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding user:', error);
        return null;
    }
}

export const checkLogin = async (email, password) => {
    try {
        const response = await axios.get(`http://localhost:4000/users?email=${email}&password=${password}`);
        return response.data[0];
    } catch (error) {
        console.error('Error logging in:', error);
        return null;
    }
}