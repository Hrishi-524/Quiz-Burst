import axios from 'axios';

export const signupUser = async (userData) => {
    try {
        const response = await axios.post(`/auth/signup`, userData);
        return response.data;
    } catch (error) {
        console.error("Error during signup:", error);
        throw error;
    } 
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`/auth/login`, credentials);
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};

export const fetchUserDetails = async (userId) => {
    try {
        const response = await axios.get(`/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user details:", error);
        throw error;
    }
};