import axios from 'axios';
import { auth } from '../firebase/config';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to add Firebase token
api.interceptors.request.use(async (config) => {
    try {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (e) {
        console.error("Token retrieval failed:", e);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
