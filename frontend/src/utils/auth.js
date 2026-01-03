import axios from 'axios';
import { jwtDecode } from 'jwt-decode'

// Set up axios interceptor to automatically include token in requests
export const setupAxiosInterceptors = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    axios.defaults.baseURL = `${API_URL}/quizburst/api`;
    console.log('Axios base URL:', axios.defaults.baseURL); // Debug log

    // Request interceptor to add token to headers
    axios.interceptors.request.use(
        //onRequestSuccess
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        //onRequestFaliure
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
        //onResponseSuccess
        (response) => response,
        //onResponseFaliure
        (error) => {
            if (error.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('token');
                // Redirect to login page
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};

// Decode user info from jwt
export const getUserInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        let decoded = jwtDecode(token);
        return decoded; // decoded is an object as decoded.id, decoded.isHost and decoded.username
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        return false;
    }
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeToken = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
};
